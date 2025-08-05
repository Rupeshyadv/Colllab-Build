import Docker from "dockerode";
const docker = new Docker();

export const runCodeInSandbox = async (language, filePath) => {
    let image, runCmd, workFile = `/tmp/${filePath.split("/").pop()}`;

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
            runCmd = `javac ${workFile} && java -cp /tmp Main`;
            break;
        case "javascript":
            image = "node:18";
            runCmd = `node ${workFile}`;
            break;
        default:
            throw new Error("Unsupported language");
    }

    const container = await docker.createContainer({
        Image: image,
        Cmd: ["bash", "-c", runCmd],
        HostConfig: {
            Binds: [`${filePath}:${workFile}`]
        },
        WorkingDir: "/tmp",
        Tty: true,
        OpenStdin: true,
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true
    });

    await container.start();

    // attach to container output (real-time)
    const stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true
    });

    return { container, stream };
};
