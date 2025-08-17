import Docker from "dockerode";
import path from "path";
import { PassThrough } from "stream";
import { deleteUserCodeFile } from "./tempFileManager.js";

const docker = new Docker();

export const runCodeInSandbox = async (filePath, language) => {
    let image, runCmd;
    const fileName = path.basename(filePath);
    const workFile = `/tmp/${fileName}`;

    switch (language) {
        case "cpp":
            image = "gcc:latest";
            runCmd = `g++ ${workFile} -o /tmp/a.out && /tmp/a.out`;
            break;
        case "python":
            image = "python:3.10";
            runCmd = `python3 ${workFile}`;
            break;
        case "java":
            image = "openjdk:17";
            // For Java, we need to extract class name from file
            const className = fileName.replace('.java', '');
            runCmd = `javac ${workFile} && java -cp /tmp ${className}`;
            break;
        case "javascript":
            image = "node:20-alpine";
            runCmd = `node ${workFile}`;
            break;
        default:
            throw new Error("Unsupported language");
    }

    // Get absolute path in native Windows format
    const hostPath = path.resolve(filePath);

    
    try {
        // Create container but don't run the command immediately
        const container = await docker.createContainer({
            Image: image,
            Cmd: ["sleep", "300"], // Keep container alive
            HostConfig: {
                Binds: [`${hostPath}:${workFile}:ro`],
                NetworkMode: "none",
            },
            WorkingDir: "/tmp",
            Tty: true,
            OpenStdin: true,
        });
        
        await container.start();
        
        // Execute the command inside the running container
        const shell = image.includes("alpine") ? "sh" : "bash";
        const exec = await container.exec({
            Cmd: [shell, "-c", runCmd],
            stdinOnce: false,
            AttachStdout: true,
            AttachStderr: true,
            AttachStdin: true,
            Tty: true,
        });

        const stream = await exec.start({
            hijack: true,
            stdin: true,
        });

        const stdoutStream = new PassThrough();
        const stderrStream = new PassThrough();
        
        container.modem.demuxStream(stream, stdoutStream, stderrStream);

        // Full cleanup function
        const fullCleanup = async () => {
            try {
                await container.kill();
                await container.remove()
                
                await deleteUserCodeFile(filePath)

            } catch (err) {
                console.error("Error during full cleanup:", err)
            }
        }

        // Monitor exec process
        const execPromise = (async () => {
            const checkExecStatus = async () => {
                const info = await exec.inspect()
                if (!info.Running) {
                    await fullCleanup()
                    return true
                }
                return false
            };

            while (true) {
                if (await checkExecStatus()) break;
                await new Promise(resolve => setTimeout(resolve, 100))
            }
        })();

        return { 
            container,
            stdin: stream,
            stdout: stdoutStream,
            stderr: stderrStream,
            execPromise,
            cleanup: fullCleanup,
        };
    } catch (error) {
        console.error("❌ Exec approach failed:", error);
        throw error;
    }
};