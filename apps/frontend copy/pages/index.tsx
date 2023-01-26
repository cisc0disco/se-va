import styles from "@/styles/Home.module.css";
import React, { useState } from "react";
import Config from "@/components/Config";
import Control from "@/components/Control";
import Logs from "@/components/Logs";

export default function Home() {
  const [category, setCategory] = useState("control");

  return (
    <div className={styles.main}>
      <div className={styles.app}>
        <ul className={styles.menu}>
          <li>Menu</li>
          <li
            onClick={() => setCategory("control")}
            className={category == "control" ? styles.active : ""}
          >
            Control
          </li>
          <li
            onClick={() => setCategory("config")}
            className={category == "config" ? styles.active : ""}
          >
            Configuration
          </li>
          <li
            onClick={() => setCategory("logs")}
            className={category == "logs" ? styles.active : ""}
          >
            Logs
          </li>
        </ul>
        <div className={styles.content}>
          {category == "control" ? <Control /> : ""}
          {category == "config" ? <Config /> : ""}
          {category == "logs" ? <Logs /> : ""}
        </div>
      </div>
    </div>
  );
}
