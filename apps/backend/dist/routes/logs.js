"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pg_1 = require("pg");
const router = (0, express_1.Router)();
const port = Number.isInteger(parseInt(process.env.DBPORT || ""))
    ? parseInt(process.env.DBPORT || "")
    : 5432;
const pool = new pg_1.Pool({
    host: process.env.DBHOST,
    port: port,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
});
var StateEnum;
(function (StateEnum) {
    StateEnum[StateEnum["ON"] = 1] = "ON";
    StateEnum[StateEnum["OFF"] = 10] = "OFF";
    StateEnum[StateEnum["BLINKING"] = 20] = "BLINKING";
})(StateEnum || (StateEnum = {}));
// format logs to parse value from db to a new format with led_state
const FormatLogs = (logs) => {
    return logs.map((row) => {
        var _a;
        row.led_state = StateEnum[(_a = row.ledstateid) !== null && _a !== void 0 ? _a : 0];
        delete row.ledstateid;
        return row;
    });
};
const isIsoDate = (str) => {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str))
        return false;
    const d = new Date(str);
    return d instanceof Date && d.toISOString() === str; // valid date
};
// returns logs by defined FROM/TO parameters
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    var from;
    var to;
    // check if it only has these properties otherwise send error, jesus this took me some time
    if (Object.keys(req.query).length != 0)
        if ((req.query.hasOwnProperty("from") && ((_a = req.query.from) === null || _a === void 0 ? void 0 : _a.length) === 0) ||
            (req.query.hasOwnProperty("to") && ((_b = req.query.to) === null || _b === void 0 ? void 0 : _b.length) === 0)) {
            res.json({ error: "invalid request query" });
            return;
        }
        else {
            if (!req.query.hasOwnProperty("from") &&
                !req.query.hasOwnProperty("to")) {
                res.json({ error: "invalid request query" });
                return;
            }
            else {
                // check if it has any invalid stuff in query
                var invalidProperties = Object.keys(req.query).filter((key) => key !== "from" && key !== "to");
                if (invalidProperties.length > 0) {
                    res.json({ error: "invalid request query" });
                    return;
                }
            }
        }
    // try to validate the dates otherwise send error that they're not valid
    const query = req.query;
    if (query.from) {
        if (isIsoDate(query.from)) {
            from = new Date(query.from);
        }
        else {
            res.json({ error: "invalid time format" });
            return;
        }
    }
    if (query.to) {
        if (isIsoDate(query.to)) {
            to = new Date(query.to);
        }
        else {
            res.json({ error: "invalid time format" });
            return;
        }
    }
    // connect to database via pool
    yield pool.connect((err, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.json({ error: err });
            return;
        }
        // return ALL logs
        if (!from && !to) {
            const result = FormatLogs(yield (yield pool.query("SELECT timestamp, ledStateId FROM log")).rows);
            res.json(result);
            client.release();
            return;
        }
        // return logs FROM a provided date
        else if (from && !to) {
            const result = FormatLogs(yield (yield pool.query(`SELECT * FROM log where timestamp >= to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');`, [from])).rows);
            res.json(result);
            return;
        }
        // return logs TO a provided date
        else if (!from && to) {
            const result = FormatLogs(yield (yield pool.query(`SELECT * FROM log where timestamp < to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');`, [to])).rows);
            res.json(result);
            return;
        }
        else if (from && to) {
            const result = FormatLogs(yield (yield pool.query(`SELECT * FROM log where timestamp >= to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AND timestamp < to_timestamp($2, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');;`, [from, to])).rows);
            res.json(result);
            return;
        }
    }));
    //res.send(200);
}));
module.exports = router;
