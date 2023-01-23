import { Request, Response, Router } from "express";
import { Pool } from "pg";
const router = Router();

const port = Number.isInteger(parseInt(process.env.DBPORT || ""))
  ? parseInt(process.env.DBPORT || "")
  : 5432;

const pool = new Pool({
  host: process.env.DBHOST,
  port: port,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
});

type LedJSON = { led_state: string; ledstateid?: number; timestamp: Date };

type Query = {
  from?: string;
  to?: string;
};

enum StateEnum {
  ON = 1,
  OFF = 10,
  BLINKING = 20,
}

// format logs to parse value from db to a new format with led_state
const FormatLogs = (logs: Array<LedJSON>) => {
  return logs.map((row: LedJSON) => {
    row.led_state = StateEnum[row.ledstateid ?? 0];
    delete row.ledstateid;
    return row;
  });
};

const isIsoDate = (str: string) => {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  const d = new Date(str);
  return d instanceof Date && d.toISOString() === str; // valid date
};

// returns logs by defined FROM/TO parameters
router.get("/", async (req: Request, res: Response) => {
  var from: Date;
  var to: Date;

  // check if it only has these properties otherwise send error, jesus this took me some time
  if (Object.keys(req.query).length != 0)
    if (
      (req.query.hasOwnProperty("from") && req.query.from?.length === 0) ||
      (req.query.hasOwnProperty("to") && req.query.to?.length === 0)
    ) {
      res.json({ error: "invalid request query" });
      return;
    } else {
      if (
        !req.query.hasOwnProperty("from") &&
        !req.query.hasOwnProperty("to")
      ) {
        res.json({ error: "invalid request query" });
        return;
      } else {
        // check if it has any invalid stuff in query
        var invalidProperties = Object.keys(req.query).filter(
          (key) => key !== "from" && key !== "to"
        );

        if (invalidProperties.length > 0) {
          res.json({ error: "invalid request query" });
          return;
        }
      }
    }

  // try to validate the dates otherwise send error that they're not valid
  const query: Query = req.query;

  if (query.from) {
    if (isIsoDate(query.from)) {
      from = new Date(query.from!);
    } else {
      res.json({ error: "invalid time format" });
      return;
    }
  }

  if (query.to) {
    if (isIsoDate(query.to)) {
      to = new Date(query.to!);
    } else {
      res.json({ error: "invalid time format" });
      return;
    }
  }

  // connect to database via pool
  await pool.connect(async (err, client) => {
    if (err) {
      res.json({ error: err });
      return;
    }

    // return ALL logs
    if (!from && !to) {
      const result = FormatLogs(
        await (
          await pool.query("SELECT timestamp, ledStateId FROM log")
        ).rows
      );

      res.json(result);
      client.release();
      return;
    }
    // return logs FROM a provided date
    else if (from && !to) {
      const result = FormatLogs(
        await (
          await pool.query(
            `SELECT * FROM log where timestamp >= to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');`,
            [from]
          )
        ).rows
      );

      res.json(result);
      return;
    }
    // return logs TO a provided date
    else if (!from && to) {
      const result = FormatLogs(
        await (
          await pool.query(
            `SELECT * FROM log where timestamp < to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');`,
            [to]
          )
        ).rows
      );

      res.json(result);
      return;
    } else if (from && to) {
      const result = FormatLogs(
        await (
          await pool.query(
            `SELECT * FROM log where timestamp >= to_timestamp($1, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AND timestamp < to_timestamp($2, 'YYYY-MM-DD"T"HH24:MI:SS"Z"');;`,
            [from, to]
          )
        ).rows
      );
      res.json(result);
      return;
    }
  });

  //res.send(200);
});

module.exports = router;
