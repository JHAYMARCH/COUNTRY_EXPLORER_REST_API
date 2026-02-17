const fs = require("fs");
const path = require("path");
const { fetchCountries } = require("./countries-services");

function handleRequest(req, res) {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
    return;
  }

  const pathname = new URL(req.url, "http://localhost").pathname;
  let requestPath = pathname === "/" ? "/index.html" : pathname;

  // Compatibility aliases for older links/routes.
  if (requestPath === "/detail") {
    requestPath = "/detail.html";
  }
  if (requestPath.startsWith("/Public/")) {
    requestPath = requestPath.replace("/Public/", "/");
  }

  if (requestPath === "/countries" || requestPath === "/api/countries") {
    fetchCountries()
      .then((data) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
      })
      .catch((error) => {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Failed to fetch countries",
            error: error.message,
          })
        );
      });
    return;
  }

  const publicDir = path.join(__dirname, "Public");
  const relativePath = requestPath.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(publicDir, relativePath));

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("Forbidden");
    return;
  }

  readAndServe(filePath, res);
}

function readAndServe(filePath, res) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Page not found");
        return;
      }

      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal server error");
      return;
    }

    res.writeHead(200, { "Content-Type": getContentType(filePath) });
    res.end(data);
  });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".html") return "text/html";
  if (ext === ".js") return "text/javascript";
  if (ext === ".css") return "text/css";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".json") return "application/json";

  return "application/octet-stream";
}

module.exports = { handleRequest, readAndServe, getContentType };
