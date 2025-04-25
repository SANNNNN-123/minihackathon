"use client";

import { useEffect, useState } from "react";

interface SwitchProps {
  onModeChange?: (isNight: boolean) => void;
}

export default function Switch({ onModeChange }: SwitchProps) {
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    const toggleSwitch = document.getElementById("toggleSwitch") as HTMLInputElement;
    const body = document.body;

    if (isNightMode) {
      body.classList.add("night");
      if (toggleSwitch) {
        toggleSwitch.checked = true;
      }
    } else {
      body.classList.remove("night");
      if (toggleSwitch) {
        toggleSwitch.checked = false;
      }
    }

    if (toggleSwitch) {
      toggleSwitch.addEventListener("change", function () {
        if (this.checked) {
          body.classList.add("night");
          setIsNightMode(true);
          onModeChange?.(true);
        } else {
          body.classList.remove("night");
          setIsNightMode(false);
          onModeChange?.(false);
        }
      });
    }

    return () => {
      if (toggleSwitch) {
        toggleSwitch.removeEventListener("change", () => {});
      }
    };
  }, [onModeChange]);

  return (
    <div className="switch-container">
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
      <div className="label">Toggle between busy day and quiet night</div>
    </div>
  );
} 