"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isNightMode, setIsNightMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeRef = useRef({ hour: 8, minute: 0, second: 0 });
  const transitionIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      
      // 12-hour format for night mode
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
      // Always show 8:00:00 AM in day mode if not transitioning
      if (!isTransitioning && forceHour === undefined) {
        now.setHours(8, 0, 0);
      }
      
      // 12-hour format for day mode
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

  // Animate time change when toggling modes
  const animateTimeTransition = (fromHour: number, toHour: number) => {
    setIsTransitioning(true);
    
    // Clear any existing transition
    if (transitionIntervalRef.current) {
      clearInterval(transitionIntervalRef.current);
    }
    
    // Initialize transition time
    const current = { ...transitionTimeRef.current };
    current.hour = fromHour;
    
    // Create a faster ticking clock effect
    transitionIntervalRef.current = setInterval(() => {
      // Increment time
      current.second += 30; // Fast forward by 30 seconds
      
      if (current.second >= 60) {
        current.second = 0;
        current.minute += 1;
      }
      
      if (current.minute >= 60) {
        current.minute = 0;
        current.hour += 1;
      }
      
      // If hour goes beyond 23, reset to 0
      if (current.hour >= 24) {
        current.hour = 0;
      }
      
      // Update display
      transitionTimeRef.current = current;
      updateTime(current.hour, current.minute, current.second);
      
      // Check if we've reached the target hour
      if ((fromHour < toHour && current.hour >= toHour) || 
          (fromHour > toHour && (current.hour >= 24 || current.hour >= toHour))) {
        clearInterval(transitionIntervalRef.current!);
        transitionIntervalRef.current = null;
        setIsTransitioning(false);
        
        // Set the final time
        updateTime(toHour, 0, 0);
      }
    }, 50); // Update very quickly for animation effect
  };

  useEffect(() => {
    const toggleSwitch = document.getElementById("toggleSwitch") as HTMLInputElement;
    const body = document.body;
    const people = document.querySelectorAll('.person');

    // Add subtle animations to people
    people.forEach((person, index) => {
      const delay = index * 0.5;
      const duration = 2 + Math.random() * 2;
      
      // Slight bobbing animation
      (person as HTMLElement).style.animation = `personBobbing ${duration}s ease-in-out ${delay}s infinite alternate`;
    });

    if (toggleSwitch) {
      toggleSwitch.addEventListener("change", function () {
        if (this.checked) {
          // Switching to night mode
          body.classList.add("night");
          setIsNightMode(true);
          animateTimeTransition(8, 12); // Animate from 8am to 12pm
        } else {
          // Switching to day mode
          body.classList.remove("night");
          setIsNightMode(false);
          animateTimeTransition(12, 8); // Animate from 12pm to 8am
        }
      });
    }

    // Set initial time
    updateTime(isNightMode ? 12 : 8, 0, 0);
    
    // Cleanup
    return () => {
      if (transitionIntervalRef.current) {
        clearInterval(transitionIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="container">
        <div className="datetime-container">
          <div className="time-display">{currentTime}</div>
          <div className="date-display">{currentDate}</div>
        </div>
        
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

      {/* Office Elements */}
      <div className="person p1"></div>
      <div className="person p2"></div>
      <div className="person p3"></div>
      <div className="person p4"></div>
      <div className="person p5"></div>

      <div className="desk d1"></div>
      <div className="desk d2"></div>
      <div className="desk d3"></div>
      <div className="desk d4"></div>
      <div className="desk d5"></div>

      <div className="computer c1"></div>
      <div className="computer c2"></div>
      <div className="computer c3"></div>
      <div className="computer c4"></div>
      <div className="computer c5"></div>

      <div className="lamp l1"></div>
      <div className="lamp l2"></div>
      <div className="lamp l3"></div>
      <div className="lamp l4"></div>
      <div className="lamp l5"></div>
    </>
  );
}
