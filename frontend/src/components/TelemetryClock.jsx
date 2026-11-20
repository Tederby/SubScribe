import { useState, useEffect, memo } from "react";

function TelemetryClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " WIB"
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="text-zinc-400 tabular-nums">{time || "--:--:--"}</span>;
}

export default memo(TelemetryClock);
