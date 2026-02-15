import { createServer } from "http";
import path from "path";
import fs from "fs";

let started = false;

/**
 * Information returned by the {@link startServer} function.
 *
 * @property {number} port - The TCP port on which the HTTP server is listening.
 * @property {() => Promise<boolean>} close - A helper to shut down the server. Resolves with `true` if the server closed without error, otherwise `false`.
 */
export type ServerInfos = {
  port: number;
  close: () => Promise<boolean>;
};

/**
 * Starts an HTTP server that serves static files from the specified temporary directory.
 * The server automatically assigns an available port and returns its address along with a helper to close it.
 *
 * @param {string} tmpDir - Path to the directory containing the files to serve.
 * @returns {Promise<ServerInfos>} A promise that resolves with the listening port and a `close` function.
 */
export default async function startServer(
  tmpDir: string,
): Promise<ServerInfos> {
  /**
   * Mapping of file extensions to MIME types for the static server.
   */
  const mimeTypes: Record<string, string> = {
    ".js": "application/javascript",
    ".tsx": "text/plain",
    ".ts": "text/plain",
    ".css": "text/css",
    ".json": "application/json",
    ".html": "text/html",
    ".htm": "text/html",
  };

  /**
   * Create an HTTP server that serves static files from `tmpDir`.
   */
  const server = createServer((req, res) => {
    // Resolve the request path relative to the temporary directory
    const reqPath = new URL(req.url ?? "/", `http://localhost`).pathname;
    const filePath = path.join(tmpDir, reqPath);

    // Check if the requested file exists and is readable
    fs.access(filePath, fs.constants.R_OK, (err) => {
      if (err) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const mime = mimeTypes[ext] || "application/octet-stream";
      res.setHeader("Content-Type", mime);
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  });

  return new Promise<ServerInfos>((resolve, reject) => {
    server.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === "object") {
        started = true;
        resolve({
          port: addr.port,
          close: async () => new Promise((r) => server.close((err) => r(!err))),
        });
      } else {
        reject(new Error("Failed to get server address"));
      }
    });
  });
}
