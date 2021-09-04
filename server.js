const express = require("express");
const config = require("./config.js");
const axios = require("axios");
const app = express();
app.get('/', (req, res) => {
  res.send('Server is up.');
  res.end();
});
module.exports = () => {
  app.listen(8081);
}