import React, { useEffect, useRef } from "react";
import { RayMarching } from "../../lib/rayMarching";

interface Props {}

const RayMarchingExample: React.FC<Props> = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const start = () => {
      const fire = new RayMarching(ref.current, false);
      fire.init();
    };
    start();
  }, []);
  return (
      <div
        ref={ref}
        style={{ width: 200, height: 200 }}
        className="fire"
      ></div>
  );
};

export default RayMarchingExample;
