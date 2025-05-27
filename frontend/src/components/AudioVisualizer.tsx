"use client";

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
  volumeLevel?: number; // Add volume level prop (0-1)
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ 
  isActive, 
  isSpeaking, 
  volumeLevel = 0 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const volumeHistory = useRef<number[]>(Array(60).fill(0));
  
  // Update volume history when volume level changes
  useEffect(() => {
    if (isActive && isSpeaking && typeof volumeLevel === 'number') {
      volumeHistory.current.push(volumeLevel);
      volumeHistory.current.shift();
    }
  }, [isActive, isSpeaking, volumeLevel]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get theme-aware colors
      const idleColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--muted-foreground')
        .trim() || 'rgba(150, 150, 150, 0.5)';
      
      const activeColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim() || 'rgba(93, 254, 202, 0.7)';
      
      if (!isActive) {
        // Idle state - draw a flat line
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = idleColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      const barCount = 60; // Match history length
      const barWidth = canvas.width / barCount;
      const barGap = 2;
      const maxBarHeight = canvas.height * 0.8;
      
      // Add subtle background noise
      const backgroundNoise = 0.05; 
      
      for (let i = 0; i < barCount; i++) {
        // When speaking, use actual volume history with some randomness
        // When not speaking, use small ambient noise
        let barHeight;
        
        if (isSpeaking) {
          // Get volume from history with a nice curve
          const volume = volumeHistory.current[i];
          
          // Apply easing function to make it look more natural
          // Amplify low volumes slightly to make them visible
          const easedVolume = Math.pow(volume, 0.7);
          
          // Add randomness for natural look but weighted by real volume
          const randomFactor = Math.random() * 0.3 * easedVolume;
          
          // Calculate final height with frequency variation (sine wave)
          barHeight = (easedVolume + randomFactor) * maxBarHeight * 
            (0.4 + Math.sin(Date.now() / 400 + i / 5) * 0.3);
          
          // Ensure minimum visibility
          barHeight = Math.max(barHeight, maxBarHeight * 0.05);
        } else {
          // Ambient noise when not speaking
          barHeight = Math.random() * maxBarHeight * backgroundNoise + maxBarHeight * 0.05;
        }
        
        // Center the bars vertically
        const y = (canvas.height - barHeight) / 2;
        
        // Draw the bar
        ctx.fillStyle = isSpeaking 
          ? activeColor
          : idleColor;
        
        ctx.fillRect(i * barWidth + barGap/2, y, barWidth - barGap, barHeight);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, isSpeaking, volumeLevel]);
  
  return (
    <div className="w-full h-full bg-muted rounded-md overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        aria-label={isActive 
          ? isSpeaking 
            ? "Navis is speaking" 
            : "Call is active" 
          : "Call is inactive"
        }
      />
    </div>
  );
};

export default AudioVisualizer; 