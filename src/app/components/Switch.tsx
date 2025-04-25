"use client";

import { useEffect, useState, useRef } from "react";

interface SwitchProps {
  onModeChange?: (isNight: boolean) => void;
}

export default function Switch({ onModeChange }: SwitchProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isNightMode, setIsNightMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeRef = useRef({ hour: 8, minute: 0, second: 0 });
  const transitionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clockTickerRef = useRef<NodeJS.Timeout | null>(null);

  // Format time based on day/night mode
  const updateTime = (forceHour?: number, forceMinute?: number, forceSecond?: number) => {
    const now = new Date();
    
    // If force values are provided, use them instead of actual time
    if (forceHour !== undefined) now.setHours(forceHour);
    if (forceMinute !== undefined) now.setMinutes(forceMinute);
    if (forceSecond !== undefined) now.setSeconds(forceSecond);
    
    let timeString;
    let dateString;

    if (isNightMode) {
      // Always show 12:00:00 PM in night mode if not transitioning
      if (!isTransitioning && forceHour === undefined) {
        now.setHours(12, 0, 0);
      }
      
      timeString = now.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric', 
        minute: '2-digit',
        second: '2-digit'
      });
      
      dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    } else {
      // Use current real time for day mode (AM) instead of fixed 8:00 AM
      if (isTransitioning && forceHour !== undefined) {
        // Use the forced hour during transitions
      } else {
        // Otherwise use real time
        const realNow = new Date();
        now.setHours(realNow.getHours(), realNow.getMinutes(), realNow.getSeconds());
      }
      
      timeString = now.toLocaleTimeString('en-US', { 
        hour12: true,
        hour: 'numeric', 
        minute: '2-digit',
        second: '2-digit'
      });
      
      dateString = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }

    setCurrentTime(timeString);
    setCurrentDate(dateString);
    
    return { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() };
  };

  // Start clock ticking - runs in real-time when in day mode
  const startClockTicker = () => {
    if (clockTickerRef.current) {
      clearInterval(clockTickerRef.current);
    }

    clockTickerRef.current = setInterval(() => {
      if (!isTransitioning) {
        updateTime();
      }
    }, 1000);
  };

  // Animate time change when toggling modes
  const animateTimeTransition = (fromHour: number, toHour: number) => {
    setIsTransitioning(true);
    
    if (transitionIntervalRef.current) {
      clearInterval(transitionIntervalRef.current);
    }
    
    const current = { ...transitionTimeRef.current };
    current.hour = fromHour;
    
    transitionIntervalRef.current = setInterval(() => {
      current.second += 30;
      
      if (current.second >= 60) {
        current.second = 0;
        current.minute += 1;
      }
      
      if (current.minute >= 60) {
        current.minute = 0;
        current.hour += 1;
      }
      
      if (current.hour >= 24) {
        current.hour = 0;
      }
      
      transitionTimeRef.current = current;
      updateTime(current.hour, current.minute, current.second);
      
      if ((fromHour < toHour && current.hour >= toHour) || 
          (fromHour > toHour && (current.hour >= 24 || current.hour >= toHour))) {
        clearInterval(transitionIntervalRef.current!);
        transitionIntervalRef.current = null;
        setIsTransitioning(false);
        updateTime(toHour, 0, 0);
      }
    }, 50);
  };

  // Initialize clock ticker that updates every second
  useEffect(() => {
    updateTime();
    startClockTicker();
    
    return () => {
      if (clockTickerRef.current) {
        clearInterval(clockTickerRef.current);
      }
    };
  }, [isNightMode]);

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
          
          const now = new Date();
          const currentHour = now.getHours();
          animateTimeTransition(currentHour, 12);
        } else {
          body.classList.remove("night");
          setIsNightMode(false);
          onModeChange?.(false);
          
          const now = new Date();
          const currentHour = now.getHours();
          animateTimeTransition(12, currentHour);
        }
      });
    }

    return () => {
      if (transitionIntervalRef.current) {
        clearInterval(transitionIntervalRef.current);
      }
      if (clockTickerRef.current) {
        clearInterval(clockTickerRef.current);
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