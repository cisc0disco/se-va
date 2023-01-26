import { useState } from "react";

const Test = () => {
  const [group, setGroup] = useState(1);

  return <div className={group == 1 ? "active" : ""}></div>;
};

//
