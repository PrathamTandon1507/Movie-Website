import React from "react";
import ReactDOM from "react-dom/client";
// import "./index.css";
// import App from "./App";
import StarRating from "./StarRating";
import { useState } from "react";
import App from "./App";
import "./index.css";

function Test() {
  const [movieRate, setMovieRate] = useState(0);
  return (
    <div>
      <StarRating color="blue" maximum={10} onSetRating={setMovieRate} />
      <p>The movie is being rated {movieRate} stars</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* <StarRating messages={["Terrible", "Bad", "Okay", "Good", "Amazing!"]} />
    <StarRating color="red" className="test" messages={[]} defaultRating={3} /> */}
    <App />
    {/* <Test /> */}
  </React.StrictMode>
);
