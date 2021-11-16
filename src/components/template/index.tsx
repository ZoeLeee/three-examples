import React, { useEffect, useRef } from "react";
import { Template } from "../../lib/template";


interface Props {}

const TemplateExample: React.FC<Props> = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const start = () => {
      const fire = new Template(ref.current, false);
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

export default TemplateExample;
