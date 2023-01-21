import { Request, Response, Router } from "express";
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
});

const router = Router();

type StateObject = {
  led_state: string;
};

type IntervalObject = {
  blink_interval: number;
};

// returns actual LED state.
router.get("/state", async (req: Request, res: Response) => {
  // try to connect to DB otherwise send error
  await pool.connect(async (err, client) => {
    if (err) {
      res.statusCode = 500;
      res.send(err);
      return;
    }

    const data = await pool.query("SELECT state FROM ledstate WHERE id=1;");

    if (data) {
      res.json({ led_state: data.rows[0].state });
      client.release();
    }
  });

  // get state of the LED from the DB and send it back as json
});

// sets LED state
router.put("/state", async (req: Request, res: Response) => {
  const possibleStates = ["ON", "OFF", "BLINKING"];
  var data: StateObject = req.body;

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
  await pool.connect(async (err, client) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "database connection failed" });
      return;
    }

    // update state by data provided from the JSON and end the connection
    await pool
      .query("UPDATE ledstate SET state=$1 WHERE id=1", [data.led_state])
      .then(() => {
        client.release();
        res.sendStatus(200);
      });
  });
});

// returns actually set blink interval
router.get("/interval", async (req: Request, res: Response) => {
  await pool.connect(async (err, client) => {
    if (err) {
      res.statusCode = 500;
      res.send(err);
      return;
    }

    await pool
      .query("SELECT blink_rate FROM ledconfiguration WHERE id=1;")
      .then((data) => {
        res.json({ blink_interval: data.rows[0].blink_rate });
        client.release();
      });
  });
});

/// sets blinking interval
router.put("/interval", async (req: Request, res: Response) => {
  var data: IntervalObject = req.body;

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

  await pool.connect(async (err, client) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "database connection failed" });
      return;
    }

    await pool
      .query("UPDATE ledconfiguration SET blink_rate=$1 WHERE id=1;", [
        req.body.blink_interval,
      ])
      .then(() => {
        client.release();
        res.sendStatus(200);
      });
  });
});

module.exports = router;
