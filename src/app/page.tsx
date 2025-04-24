"use client";

import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isNightMode, setIsNightMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeRef = useRef({ hour: 8, minute: 0, second: 0 });
  const transitionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const clockTickerRef = useRef<NodeJS.Timeout | null>(null);
  const [illuminationIntensity, setIlluminationIntensity] = useState(0);

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
      // Use current real time for day mode (AM) instead of fixed 8:00 AM
      // Only use 8:00 AM during transitions
      if (isTransitioning && forceHour !== undefined) {
        // Use the forced hour during transitions
      } else {
        // Otherwise use real current time
        const realNow = new Date();
        now.setHours(realNow.getHours(), realNow.getMinutes(), realNow.getSeconds());
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

  // Start clock ticking - runs in real-time when in day mode
  const startClockTicker = () => {
    // Clear any existing ticker
    if (clockTickerRef.current) {
      clearInterval(clockTickerRef.current);
    }

    // Start a new ticker that updates every second
    clockTickerRef.current = setInterval(() => {
      if (!isTransitioning) {
        updateTime();
      }
    }, 1000);
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

  // Create illuminated window effect for night mode
  useEffect(() => {
    if (isNightMode) {
      // Gradually increase illumination
      let intensity = 0;
      const illuminateInterval = setInterval(() => {
        intensity += 0.05;
        if (intensity >= 1) {
          intensity = 1;
          clearInterval(illuminateInterval);
        }
        setIlluminationIntensity(intensity);
      }, 100);
      
      return () => clearInterval(illuminateInterval);
    } else {
      // Quickly turn off illumination
      setIlluminationIntensity(0);
    }
  }, [isNightMode]);

  // Ensure background images are properly displayed
  useEffect(() => {
    // Force a reflow to ensure the CSS pseudo-elements are applied
    document.body.style.display = 'none';
    setTimeout(() => {
      document.body.style.display = 'flex';
    }, 10);
  }, []);

  // Initialize clock ticker that updates every second
  useEffect(() => {
    // Initialize time
    updateTime();
    
    // Start the clock ticker
    startClockTicker();
    
    // Cleanup
    return () => {
      if (clockTickerRef.current) {
        clearInterval(clockTickerRef.current);
      }
    };
  }, [isNightMode]); // Restart ticker when mode changes

  useEffect(() => {
    const toggleSwitch = document.getElementById("toggleSwitch") as HTMLInputElement;
    const body = document.body;
    const people = document.querySelectorAll('.person');

    // Initialize the UI state based on default mode
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
          
          // Get current time for transition start
          const now = new Date();
          const currentHour = now.getHours();
          animateTimeTransition(currentHour, 12); // Animate from current hour to 12pm
          
          // Add slight delay before starting any night effects
          setTimeout(() => {
            // Force redraw to ensure background images are updated
            body.style.animation = 'none';
            
            // Create a flash effect on the night image
            const nightBg = document.querySelector('.night-background') as HTMLElement;
            if (nightBg) {
              nightBg.style.opacity = '0.3';
              setTimeout(() => {
                nightBg.style.opacity = '1';
              }, 100);
            }
            
            setTimeout(() => {
              body.style.animation = '';
            }, 10);
          }, 500);
        } else {
          // Switching to day mode
          body.classList.remove("night");
          setIsNightMode(false);
          
          // Get current real time to transition to
          const now = new Date();
          const currentHour = now.getHours();
          animateTimeTransition(12, currentHour); // Animate from 12pm to current hour
          
          // Force redraw to ensure background images are updated
          setTimeout(() => {
            body.style.animation = 'none';
            
            // Create a flash effect on the day image
            const dayBg = document.querySelector('.day-background') as HTMLElement;
            if (dayBg) {
              dayBg.style.opacity = '0.3';
              setTimeout(() => {
                dayBg.style.opacity = '1';
              }, 100);
            }
            
            setTimeout(() => {
              body.style.animation = '';
            }, 10);
          }, 500);
        }
      });
    }

    // Set initial time
    updateTime();
    
    // Cleanup
    return () => {
      if (transitionIntervalRef.current) {
        clearInterval(transitionIntervalRef.current);
      }
      if (clockTickerRef.current) {
        clearInterval(clockTickerRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Actual background images as fallback */}
      <div 
        className="day-background"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '350px',
          backgroundImage: 'url("/office-day.png")',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom center',
          backgroundSize: 'auto 350px',
          zIndex: -1,
          transition: 'opacity 0.8s ease',
          opacity: isNightMode ? 0 : 1,
          pointerEvents: 'none'
        }}
      />
      
      <div 
        className="night-background"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '350px',
          backgroundImage: 'url("/office-night.png")',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom center',
          backgroundSize: 'auto 350px',
          zIndex: -1,
          transition: 'opacity 0.8s ease',
          opacity: isNightMode ? 1 : 0,
          pointerEvents: 'none'
        }}
      />
      
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
      
      {/* Add illumination overlay for night mode windows */}
      <div 
        className="window-illumination"
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '0',
          width: '100%',
          height: '150px',
          background: 'linear-gradient(to top, rgba(255, 230, 150, 0) 0%, rgba(255, 230, 150, 0.2) 50%, rgba(255, 230, 150, 0) 100%)',
          opacity: illuminationIntensity,
          zIndex: -1,
          pointerEvents: 'none',
          transition: 'opacity 1.5s ease-in-out'
        }}
      />
    </>
  );
}
