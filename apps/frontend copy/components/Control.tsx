import styles from "@/styles/Control.module.css";
import { useEffect, useState } from "react";

type Data = {
  led_state: string;
};

type ErrorData = {
  error: string;
};

// state if the states ever change
const availableStates = ["ON", "OFF", "BLINKING"];

const Control = () => {
  const [state, setState] = useState("");
  const [changedState, setChangedState] = useState("ON");

  // PUT request to the /led/state with data provided from the arguments
  const sendData = async () => {
    const tempState = changedState;

    await fetch("http://localhost:8000/led/state", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ led_state: changedState }),
    })
      .then(async (res) => {
        if (res.status == 200) {
          setState(tempState);
        } else {
          const data: ErrorData = await res.json();
          setState(data.error);
        }
      })
      .catch((error) => {
        setState(error.message);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetch("http://localhost:8000/led/state")
        .then(async (res) => {
          var data: Data = await res.json();
          setState(data.led_state);
        })
        .catch((error) => {
          setState(error.message);
        });
    };

    fetchData();
  }, []);

  return (
    <>
      <h2 className={styles.state}>State: {state}</h2>
      <fieldset className={styles.fieldset}>
        <legend>Select a state of the led:</legend>
        {availableStates.map((state, i) => (
          <div key={state + i} className={styles.radiocontainer}>
            <input
              onChange={(e) => setChangedState(e.target.value)}
              type="radio"
              name={"state"}
              value={state}
              id={state + i}
            />
            <label htmlFor={state + i}>{state}</label>
          </div>
        ))}
      </fieldset>
      <button
        onClick={() => {
          sendData();
        }}
        className={styles.send}
      >
        Send
      </button>
    </>
  );
};

export default Control;
