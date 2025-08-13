import { ClientToServerEvents, ServerToClientEvents } from "./socket.events.js";
import { saveUserCode, deleteUserCodeFile } from "../services/codeExeService/tempFileManager.js";
import { runCodeInSandbox } from "../services/codeExeService/dockerRunner.js";

export const registerTerminalEvents = (socket, io) => {
    socket.on(ClientToServerEvents.START_EXECUTION, async ({ roomId, codeData }) => {
        const { code, language } = codeData
        console.log("Starting code execution in room:", roomId, "Language:", language);

        // Save the user code to a temporary file
        const filePath = await saveUserCode(code, language)
        
        if (!filePath) {
            socket.emit(ServerToClientEvents.SOCKET_ERROR, { message: "Failed to save code file." });
            return;
        }

        // Run the code in a Docker container
        const { container, stdin, stdout, stderr } = await runCodeInSandbox(filePath, language)

        io.to(roomId).emit(ServerToClientEvents.EXECUTION_STARTED, { roomId });

        // adding containerId,stream to socket for handling midway input
        socket.containerId = container?.id
        socket.stdinStream = stdin;
        
        // Add error handlers for streams
        stdout.on('error', (error) => {
            console.error("Stdout stream error:", error);
        });
        stderr.on('error', (error) => {
            console.error("Stderr stream error:", error);
        });
        stdin.on('error', (error) => {
            console.error("Stdin stream error:", error);
        });

        stdout.on('data', (chunk) => {
            const output = chunk.toString();
            console.log("Terminal output:", output)
            io.to(roomId).emit(ServerToClientEvents.TERMINAL_OUTPUT, { output });
        });
        stderr.on('data', (chunk) => {
            const errorOutput = chunk.toString();
            console.error("Terminal error output:", errorOutput);
            io.to(roomId).emit(ServerToClientEvents.TERMINAL_OUTPUT, { output: errorOutput });
        });
        

        // when the program fineshes, clean up
        container.wait()
        .then(async () => {
            await deleteUserCodeFile(filePath);
            container.remove();

            if (socket.stdinStream) {
                socket.stdinStream.destroy();
            }

            socket.containerId = null; // Clear container ID reference
            socket.stdinStream = null; // Clear stdin stream reference
            io.to(roomId).emit(ServerToClientEvents.EXECUTION_ENDED);
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
            console.log("Input sent to container:", input);
            if (err) {
                console.error("Error writing to stdin stream:", err);
                socket.emit(ServerToClientEvents.SOCKET_ERROR, { message: "Failed to send input." });
            }
        });
    });

    // clear terminal output
    socket.on(ClientToServerEvents.CLEAR_TERMINAL, ({ roomId }) => {
        io.to(roomId).emit(ServerToClientEvents.CLEAR_TERMINAL);
    });
}