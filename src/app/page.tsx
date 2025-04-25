"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

export default function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [isNightMode, setIsNightMode] = useState(false);
  const clockTickerRef = useRef<NodeJS.Timeout | null>(null);
  const [illuminationIntensity, setIlluminationIntensity] = useState(0);

  // Format time based on day/night mode
  const updateTime = useCallback(() => {
    const now = new Date();
    
    // Always use current real time
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: 'numeric', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    // Format date based on mode
    const dateString = now.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    setCurrentTime(timeString);
    setCurrentDate(dateString);
  }, []); // No dependencies needed as it doesn't use any external values

  // Start clock ticking - runs in real-time always
  const startClockTicker = useCallback(() => {
    updateTime(); // Update immediately
    
    // Clear any existing ticker
    if (clockTickerRef.current) {
      clearInterval(clockTickerRef.current);
    }

    // Start a new ticker that updates every second
    clockTickerRef.current = setInterval(updateTime, 1000);

    // Return cleanup function
    return () => {
      if (clockTickerRef.current) {
        clearInterval(clockTickerRef.current);
      }
    };
  }, [updateTime]);

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

  // Initialize clock ticker
  useEffect(() => {
    const cleanup = startClockTicker();
    return cleanup;
  }, [startClockTicker]);

  useEffect(() => {
    const toggleSwitch = document.getElementById("toggleSwitch") as HTMLInputElement;
    const body = document.body;

    // Initialize the UI state based on default mode
    if (isNightMode) {
      body.classList.add("night");
      body.classList.add("dark");
      if (toggleSwitch) {
        toggleSwitch.checked = true;
      }
    } else {
      body.classList.remove("night");
      body.classList.remove("dark");
      if (toggleSwitch) {
        toggleSwitch.checked = false;
      }
    }

    const switchTheme = () => {
      const isNight = toggleSwitch.checked;
      if (isNight) {
        body.classList.add("night", "dark");
      } else {
        body.classList.remove("night", "dark");
      }
      setIsNightMode(isNight);

      // Update background immediately
      const bgElement = document.querySelector(isNight ? '.night-background' : '.day-background') as HTMLElement;
      if (bgElement) {
        bgElement.style.opacity = '1';
      }
    };

    const handleToggle = () => {
      if (!document.startViewTransition) {
        switchTheme();
        return;
      }

      // Prevent any bouncing by disabling the switch temporarily
      toggleSwitch.disabled = true;

      document.startViewTransition(() => {
        switchTheme();
      }).finished.finally(() => {
        // Re-enable the switch after transition
        toggleSwitch.disabled = false;
      });
    };

    if (toggleSwitch) {
      toggleSwitch.addEventListener("change", handleToggle);
    }

    return () => {
      if (toggleSwitch) {
        toggleSwitch.removeEventListener("change", handleToggle);
      }
    };
  }, [isNightMode]);

  return (
    <>
      {/* Full screen office images */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        overflow: 'hidden'
      }}>
        <div className="day-background" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: isNightMode ? 0 : 1,
          transition: 'opacity 0.8s ease',
          border: 'none',
          outline: 'none'
        }}>
          <Image
            src="/office-day.png"
            alt="Office Day"
            fill
            style={{
              objectFit: 'cover'
            }}
            priority
          />
        </div>
        <div className="night-background" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: isNightMode ? 1 : 0,
          transition: 'opacity 0.8s ease',
          border: 'none',
          outline: 'none'
        }}>
          <Image
            src="/office-night.png"
            alt="Office Night"
            fill
            style={{
              objectFit: 'cover'
            }}
            priority
          />
        </div>
      </div>

      <div className="container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        transform: 'none',  // Prevent any transforms
        animation: 'none'   // Disable any animations
      }}>
        <div className="datetime-container" style={{ 
          marginBottom: '1rem', 
          position: 'relative', 
          zIndex: 2,
          textAlign: 'center',
          transform: 'none',
          animation: 'none',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          padding: '1.5rem 2rem',
          borderRadius: '13px',
          backdropFilter: 'blur(8px)',
          width: '90%',
          maxWidth: '400px'
        }}>
          <div className="time-display" style={{
            fontSize: 'clamp(2rem, 8vw, 3.5rem)',
            fontWeight: '700',
            color: '#ffffff',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: '-1px',
            marginBottom: '0.5rem',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            whiteSpace: 'nowrap',
            lineHeight: '1'
          }}>{currentTime}</div>
          <div className="date-display" style={{
            fontSize: 'clamp(1rem, 4vw, 1.25rem)',
            color: '#ffffff',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontWeight: '500',
            opacity: 0.9,
            letterSpacing: '0.5px',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            whiteSpace: 'nowrap'
          }}>{currentDate}</div>
        </div>
        
        <label className="switch" style={{ 
          position: 'relative', 
          zIndex: 2,
          transform: 'none',  // Prevent any transforms
          animation: 'none'   // Disable any animations
        }}>
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
