const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
const projectRouter = require("./routes/projectRoute");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", authRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1/projects", projectRouter);

app.get("/", (req, res) => {
  res.send("API is running");
});

module.exports = app;
