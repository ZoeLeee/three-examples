import React from "react";
import ReactDOM from "react-dom";
import Fire from "./components/fire";
import './index.css';

interface Props {}

const App: React.FC<Props> = () => {
  return <div style={{width:"100%",height:"100%"}}>
    <Fire />
  </div>;
};


ReactDOM.render(<App />, document.getElementById('app'));