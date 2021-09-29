const dotenv = require("dotenv");
const http = require("http");
const scraper = require("./scraper");

dotenv.config();

http
  .createServer(function (req, res) {
    res.write("Hello world!");
    res.end();
  })
  .listen(8080);

scraper();
