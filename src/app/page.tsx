"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const toggleSwitch = document.getElementById("toggleSwitch") as HTMLInputElement;
    const body = document.body;

    if (toggleSwitch) {
      toggleSwitch.addEventListener("change", function () {
        if (this.checked) {
          body.classList.add("night");
        } else {
          body.classList.remove("night");
        }
      });
    }
  }, []);

  return (
    <div className="container">
      <label className="switch">
        <input type="checkbox" id="toggleSwitch" />
        <div className="slider">
          <div className="sun"></div>
          <div className="moon"></div>
          <div className="cloud cloud1"></div>
          <div className="cloud cloud2"></div>
          <div className="star star1"></div>
          <div className="star star2"></div>
          <div className="star star3"></div>
          <div className="star star4"></div>
          <div className="star star5"></div>
        </div>
      </label>
      <div className="label">Click the switch to toggle day/night mode</div>
    </div>
  );
}
