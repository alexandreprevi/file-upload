const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const fileRoute = require("./routes/files");
const connectDB = require("./config/db");
const fs = require("fs");

connectDB();

const app = express();

if (!fs.existsSync("./files")) {
  fs.mkdirSync("./files");
}

app.use(cors());
app.use(fileRoute);

app.listen(3030, () => {
  console.log("Server started on port 3030");
});
