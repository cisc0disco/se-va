"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
require("dotenv").config();
var ledRouter = require("./routes/led");
var logRouter = require("./routes/logs");
var app = (0, express_1.default)();
// send error if the JSON is invalid
const customJsonError = (err, req, res, next) => {
    res.statusCode = 400;
    res.send({ error: "invalid json format" });
};
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(customJsonError);
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/led", ledRouter);
app.use("/logs", logRouter);
app.listen(process.env.PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${process.env.PORT}`);
});
module.exports = app;
