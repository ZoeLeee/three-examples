import React, { useEffect, useRef } from "react";
import { Fire } from "../../lib/fire";


interface Props {}

const FireExample: React.FC<Props> = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const start = () => {
      const fire = new Fire(ref.current, false);
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

export default FireExample;
