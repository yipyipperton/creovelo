import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { handleContactRequest } from "../functions/_lib/contact.js";

const root = new URL("..", import.meta.url).pathname;
const port = Number(process.env.PORT || 8788);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const env = {
  CONTACT_INBOX: process.env.CONTACT_INBOX || "preview@localhost",
  CONTACT_FROM: "hello@creovelo.com",
  EMAIL: {
    async send(message) {
      console.log("Contact inquiry captured:\n", message);
    },
  },
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`);
  if (url.pathname === "/api/contact") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
    });
    const response = await handleContactRequest(request, env);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
    return;
  }

  let file = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  if (file.endsWith("/")) file += "index.html";
  try {
    const body = await readFile(join(root, file));
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    const fallback = await readFile(join(root, "404.html")).catch(() => null);
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fallback || "Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Creovelo preview: http://127.0.0.1:${port}`);
});
