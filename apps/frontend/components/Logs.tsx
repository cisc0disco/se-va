import styles from "@/styles/Logs.module.css";
import React, { useEffect, useState } from "react";

type Log = {
  timestamp: string;
  led_state: string;
};

const Logs = () => {
  const [fromData, setFromDate] = useState<Date>();
  const [toData, setToDate] = useState<Date>();
  const [logs, setLogs] = useState([]);
  const [showError, setShowError] = useState(false);
  const [error, setError] = useState("");

  const DisplayError = (err: string) => {
    setError(err);
    setShowError(true);

    setInterval(() => {
      setShowError(false);
    }, 5000);
  };

  const getData = async () => {
    var query = new URLSearchParams();

    if (fromData) {
      query.append("from", fromData.toISOString());
    }

    if (toData) {
      query.append("to", toData.toISOString());
    }

    await fetch("http://localhost:8000/logs?" + query)
      .then(async (res) => {
        const data = await res.json();

        if (data.error) {
          DisplayError(data.error);
        } else {
          setLogs(data);
        }
      })
      .catch((error) => {
        DisplayError(error.message);
      });
  };

  return (
    <>
      <div className={styles.datecontainer}>
        <div className={styles.date}>
          <p>From</p>
          <input
            type="datetime-local"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFromDate(new Date(e.target.value))
            }
          />
        </div>
        <div className={styles.date}>
          <p>To</p>
          <input
            type="datetime-local"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setToDate(new Date(e.target.value))
            }
          />
        </div>
      </div>
      <div className={styles.content}>
        {logs.map((log: Log, n) => {
          return (
            <div className={styles.row} key={n}>
              <p className={styles.timestamp}>{log.timestamp}</p>
              <p className={styles.ledstate}>{log.led_state}</p>
            </div>
          );
        })} 
      </div>
      <button onClick={() => getData()} className={styles.get}>
        Get
      </button>
      {showError && <p>{error}</p>}
    </>
  );
};

export default Logs;
