import styles from "@/styles/Config.module.css";
import React, { useState, useEffect } from "react";

type IntervalData = {
  blink_interval: number;
};

type ErrorData = {
  error: string;
};

const Config = () => {
  const [interval, setInterval] = useState(0.0);
  const [showError, setShowError] = useState(false);
  const [data, setData] = useState(5);
  const [errorMessage, setErrorMessage] = useState("");

  const DisplayError = (s: string) => {
    if (s) {
      setErrorMessage(s);

      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  const sendData = async () => {
    if (data > 10 || data < 5 || !data) {
      DisplayError("Invalid input");
    } else {
      await fetch("http://localhost:8000/led/interval", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blink_interval: data }),
      })
        .then(async (res) => {
          if (res.status == 200) {
            setInterval(data);
          } else {
            const err: ErrorData = await res.json();
            DisplayError(err.error);
          }
        })
        .catch((error) => {
          DisplayError(error.message);
        });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:8000/led/interval");

      const data: IntervalData = await res.json();

      setInterval(data.blink_interval);
    };

    fetchData();
  }, []);

  return (
    <>
      <div className={styles.main}>
        <h2>Blinking interval: {interval} seconds</h2>
        <div className={styles.inputcontainer}>
          <h2>Set blinking interval:</h2>
          <input
            className={styles.input}
            type="number"
            min={5.0}
            max={10.0}
            step={0.1}
            value={data}
            lang="en"
            onChange={(e) => {
              setData(parseFloat(e.target.value));
            }}
          />
        </div>
        <button
          onClick={() => {
            sendData();
          }}
          className={styles.send}
        >
          Send
        </button>
        {showError && <p className={styles.error}>{errorMessage}</p>}
      </div>
    </>
  );
};

export default Config;
