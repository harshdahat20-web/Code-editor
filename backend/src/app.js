const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/authRoute");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", authRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;
