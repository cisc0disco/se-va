"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// returns logs by defined FROM/TO parameters
router.get("/", function (req, res) {
    res.sendStatus(200);
});
