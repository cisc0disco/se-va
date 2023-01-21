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
const pool = new pg_1.Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
});
const router = (0, express_1.Router)();
// returns actual LED state.
router.get("/state", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // try to connect to DB otherwise send error
    yield pool.connect((err, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.statusCode = 500;
            res.send(err);
            return;
        }
        const data = yield pool.query("SELECT state FROM ledstate WHERE id=1;");
        if (data) {
            res.json({ led_state: data.rows[0].state });
            client.release();
        }
    }));
    // get state of the LED from the DB and send it back as json
}));
// sets LED state
router.put("/state", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const possibleStates = ["ON", "OFF", "BLINKING"];
    var data = req.body;
    // check if request header is set to application/json
    if (!req.is("json")) {
        res.sendStatus(400);
        return;
    }
    // check if the JSON has led_state key inside it or if it has too many data
    if (!data.hasOwnProperty("led_state") || Object.keys(data).length > 1) {
        res.statusCode = 400;
        res.send("invalid request format");
        return;
    }
    // check if state provided by the JSON is correct state ["ON", "OFF", "BLINKING"]
    if (!possibleStates.some((item) => item == data.led_state)) {
        res.statusCode = 400;
        res.send({ error: "invalid led state" });
        return;
    }
    // try to connect to DB otherwise send error
    yield pool.connect((err, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.statusCode = 500;
            res.json({ error: "database connection failed" });
            return;
        }
        // update state by data provided from the JSON and end the connection
        yield pool
            .query("UPDATE ledstate SET state=$1 WHERE id=1", [data.led_state])
            .then(() => {
            client.release();
            res.sendStatus(200);
        });
    }));
}));
// returns actually set blink interval
router.get("/interval", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield pool.connect((err, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.statusCode = 500;
            res.send(err);
            return;
        }
        yield pool
            .query("SELECT blink_rate FROM ledconfiguration WHERE id=1;")
            .then((data) => {
            res.json({ blink_interval: data.rows[0].blink_rate });
            client.release();
        });
    }));
}));
/// sets blinking interval
router.put("/interval", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = req.body;
    if (!req.is("json")) {
        res.sendStatus(400);
        return;
    }
    if (!data.hasOwnProperty("blink_interval")) {
        res.statusCode = 400;
        res.send("invalid request format");
        return;
    }
    if (typeof data.blink_interval != "number") {
        res.statusCode = 400;
        res.json({ error: "invalid request data type" });
        return;
    }
    if (data.blink_interval < 0.5 || data.blink_interval > 10) {
        res.statusCode = 400;
        res.send({ error: "invalid request value" });
        return;
    }
    yield pool.connect((err, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.statusCode = 500;
            res.json({ error: "database connection failed" });
            return;
        }
        yield pool
            .query("UPDATE ledconfiguration SET blink_rate=$1 WHERE id=1;", [
            req.body.blink_interval,
        ])
            .then(() => {
            client.release();
            res.sendStatus(200);
        });
    }));
}));
module.exports = router;
