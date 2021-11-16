import React from "react";
import ReactDOM from "react-dom";
import FireExample from "./components/fire";
import TemplateExample from "./components/template";
import './index.css';

interface Props { }

const App: React.FC<Props> = () => {
  return <div style={
    { width: "100%", height: "100%",display:'flex' }
  }>
    <TemplateExample />
    <FireExample />
  </div>;
};


ReactDOM.render(<App />, document.getElementById('app'));