const http = require("http");
const { handleRequest } = require("./controller");

const server = http.createServer(handleRequest);

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
