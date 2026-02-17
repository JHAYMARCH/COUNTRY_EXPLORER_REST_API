const http = require("http");
const { handleRequest } = require("./controller");

module.exports = handleRequest;

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const server = http.createServer(handleRequest);
  server.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
}
