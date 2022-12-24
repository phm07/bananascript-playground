import express from "express";
import http from "http";
import { Server } from "socket.io";
import fs from "fs-extra";
import {
    spawn,
    exec,
    ExecException,
    ChildProcessWithoutNullStreams,
} from "child_process";
import * as crypto from "crypto";
import * as util from "util";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    path: "/websocket/",
    cors: process.env.NODE_ENV === "development" ? { origin: "*" } : undefined,
});

const execAsync = util.promisify(exec);

fs.mkdirsSync("tmp");

io.on("connect", (socket) => {
    let containerId: string | null = null;
    let process: ChildProcessWithoutNullStreams | null = null;

    const end = () => {
        if (containerId) {
            exec(`docker stop ${containerId}`);
        }
    };

    socket.on("run", async (code) => {
        if (containerId) return;
        containerId = crypto.randomBytes(16).toString("hex");
        console.log(`Running container ${containerId}`);
        socket.emit("running");

        let timeout: NodeJS.Timeout | undefined;
        const cleanup = (exitCode: number) => {
            clearTimeout(timeout);
            socket.emit("stdout", `\nProcess exited with code ${exitCode}`);
            socket.emit("exited");
            console.log(`Container ${containerId} exited`);
            containerId = null;
            process = null;
        };

        try {
            await execAsync(
                `docker create --rm -m 128m --cpus=0.25 --name ${containerId} -i bananascript:latest ./bananascript --forceColor src.bs`
            );

            const fileName = `tmp/${containerId}.bs`;
            await fs.writeFile(fileName, code);
            await execAsync(
                `docker cp ./${fileName} ${containerId}:/app/src.bs`
            );
            void fs.remove(fileName);
        } catch (e) {
            const error = e as ExecException;
            socket.emit("stdout", error.message);
            cleanup(error.code ?? 1);
            return;
        }

        process = spawn("docker", ["start", "-ai", containerId]);

        process.stdout.on("data", (data) => {
            socket.emit("stdout", data.toString());
        });

        process.stderr.on("data", (data) => {
            socket.emit("stdout", data.toString());
        });

        timeout = setTimeout(() => {
            console.log(`Timeout on container ${containerId}`);
            socket.emit("stdout", "\nTime limit exceeded (60s)\n");
            end();
        }, 60 * 1000);

        process.on("exit", cleanup);
    });

    socket.on("stdin", (data: string) => {
        process?.stdin.write(data + "\n");
    });

    socket.on("stop", end);
    socket.on("disconnect", end);
});

const port = process.env.PORT ?? 3001;

server.listen(port, () => {
    console.log(`Listening on ${port}`);
});
