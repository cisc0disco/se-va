import express, { NextFunction, Response, Request } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
require("dotenv").config();

var ledRouter = require("./routes/led");
var logRouter = require("./routes/led");

var app = express();

// send error if the JSON is invalid
const customJsonError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.statusCode = 400;
  res.send({ error: "invalid json format" });
};

app.use(logger("dev"));
app.use(express.json());
app.use(customJsonError);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/led", ledRouter);
app.use("/logs", logRouter);

app.listen(process.env.PORT, () => {
  console.log(
    `⚡️[server]: Server is running at http://localhost:${process.env.PORT}`
  );
});

module.exports = app;
