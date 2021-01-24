require("dotenv").config();
const PORT = 3000;
const express = require("express");
const server = express();
const { client } = require("./db");
client.connect();

const apiRouter = require("./api");
server.use("/api", apiRouter);

const bodyParser = require("body-parser");
server.use(bodyParser.json());

const morgan = require("morgan");
server.use(morgan("dev"));

server.use((req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log("body: ", req.body);
  console.log("<_____Body Logger END_____>");

  next();
});

server.get("/background/:color", (req, res, next) => {
  res.send(`
    <body style="background: ${req.params.color};">
      <h1>Hello World</h1>
    </body>
  `);
});

server.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});
