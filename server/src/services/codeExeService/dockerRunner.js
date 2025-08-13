import Docker from "dockerode";
import path from "path";
import { PassThrough } from "stream";

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
        const container = await docker.createContainer({
            Image: image,
            Cmd: ["bash", "-c", runCmd],
            HostConfig: {
                Binds: [`${hostPath}:${workFile}:ro`],
                NetworkMode: "none"
            },
            WorkingDir: "/tmp",
            Tty: true,
            OpenStdin: true,
            StdinOnce: false,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            // Set execution timeout
            Env: ["TIMEOUT=10"]
        });

        await container.start();

        // Get container logs
        const attachStream = await container.attach({
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true,
        });

        // separate stdout and stderr streams
        const stdoutStream = new PassThrough();
        const stderrStream = new PassThrough();

        container.modem.demuxStream(attachStream, stdoutStream, stderrStream);

        return { 
            container,
            stdin: attachStream,
            stdout: stdoutStream,
            stderr: stderrStream,
        };

    } catch (error) {
        console.error("Docker container creation/start failed:", error);
        throw new Error(`Failed to run code in sandbox: ${error.message}`);
    }
};