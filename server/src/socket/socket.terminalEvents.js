import { ClientToServerEvents, ServerToClientEvents } from "./socket.events.js";
import { saveUserCode, deleteUserCodeFile } from "../services/codeExeService/tempFileManager.js";
import { runCodeInSandbox } from "../services/codeExeService/dockerRunner.js";

export const registerTerminalEvents = (socket, io) => {
    socket.on(ClientToServerEvents.START_EXECUTION, async ({ roomId, codeData }) => {
        const { code, language } = codeData

        // Save the user code to a temporary file
        const filePath = await saveUserCode(code, language)
        
        if (!filePath) {
            socket.emit(ServerToClientEvents.SOCKET_ERROR, { message: "Failed to save code file." });
            return;
        }

        // Run the code in a Docker container
        const { container, stream } = await runCodeInSandbox(filePath, language)

        // adding containerId,stream to socket for handling midway input
        socket.containerId = container?.id
        socket.stdinStream = stream;
        
        // pipe the output stream to the socket room
        stream.on('data', (chunk) => {
            const output = chunk.toString();
            socket.to(roomId).emit(ServerToClientEvents.TERMINAL_OUTPUT, { output });
        });

        // when the program fineshes, clean up
        container.wait()
        .then(async () => {
            await deleteUserCodeFile(filePath);
            container.remove();

            socket.stdinStream = null; // Clear stdin stream reference
            socket.containerId = null; // Clear container ID reference
            socket.to(roomId).emit(ServerToClientEvents.EXECUTION_ENDED);
        }).catch(err => {
            console.error("Error during container execution:", err);
            socket.emit(ServerToClientEvents.SOCKET_ERROR, { message: "Execution error." });
        });
    })

    socket.on(ClientToServerEvents.TERMINAL_INPUT, async ({ input }) => {
        if (!socket.containerId || !socket.stdinStream) {
            socket.emit(ServerToClientEvents.SOCKET_ERROR, { message: "No active execution found." });
            return;
        }

        socket.stdinStream.write(input + '\n', (err) => {
            if (err) {
                console.error("Error writing to stdin stream:", err);
                socket.emit(ServerToClientEvents.SOCKET_ERROR, { message: "Failed to send input." });
            }
        });
    });
}