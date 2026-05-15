import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";

const ROOT = process.cwd();
const PORT = parseInt(process.env.PORT || "8000", 10);

try {
  const envText = await fs.readFile(path.join(ROOT, ".env.local"), "utf8");
  for (const line of envText.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    let urlPath = url.pathname;
    if (urlPath === "/") urlPath = "/index.html";
    const safePath = path
      .normalize(path.join(ROOT, urlPath))
      .replace(/^(\.\.[\/\\])+/, "");
    if (!safePath.startsWith(ROOT)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }
    if (!existsSync(safePath)) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    const stat = await fs.stat(safePath);
    if (stat.isDirectory()) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    const ext = path.extname(safePath);
    const data = await fs.readFile(safePath);
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");
    res.end(data);
  } catch (err) {
    console.error("Server error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end("Internal error");
    }
  }
});

server.listen(PORT, () => {
  console.log(`SWFTM dev server: http://localhost:${PORT}/`);
});
