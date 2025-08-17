import { ClientToServerEvents, ServerToClientEvents } from "./socket.events.js";
import { saveUserCode } from "../services/codeExeService/tempFileManager.js";
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
        const { container, stdin, stdout, stderr, execPromise, cleanup } = await runCodeInSandbox(filePath, language)

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
            io.to(roomId).emit(ServerToClientEvents.TERMINAL_OUTPUT, { output });
        });
        stderr.on('data', (chunk) => {
            const errorOutput = chunk.toString();
            io.to(roomId).emit(ServerToClientEvents.TERMINAL_OUTPUT, { output: errorOutput });
        });
        

        // when the program fineshes, clean up
        execPromise.then(() => {
            io.to(roomId).emit(ServerToClientEvents.EXECUTION_ENDED, { roomId });
        }).catch((err) => {
            console.error("Error during execution:", err);
            socket.emit(ServerToClientEvents.SOCKET_ERROR, { message: "Execution failed." });
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

    // clear terminal output
    socket.on(ClientToServerEvents.CLEAR_TERMINAL, ({ roomId }) => {
        io.to(roomId).emit(ServerToClientEvents.CLEAR_TERMINAL);
    });
}