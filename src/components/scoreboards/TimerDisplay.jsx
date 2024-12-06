import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function TimerDisplay({ initialTime = "00:00", isCountdown = false, onTimeUpdate, disabled = false }) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Convert time string to seconds
  const timeToSeconds = (timeStr) => {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  // Convert seconds to time string
  const secondsToTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let totalSeconds = timeToSeconds(initialTime);

    if (isRunning && !disabled) {
      intervalRef.current = setInterval(() => {
        if (isCountdown) {
          if (totalSeconds > 0) {
            totalSeconds--;
            const newTime = secondsToTime(totalSeconds);
            setTime(newTime);
            onTimeUpdate?.(newTime);
          } else {
            setIsRunning(false);
            clearInterval(intervalRef.current);
          }
        } else {
          totalSeconds++;
          const newTime = secondsToTime(totalSeconds);
          setTime(newTime);
          onTimeUpdate?.(newTime);
        }
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isCountdown, disabled, initialTime, onTimeUpdate]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(initialTime);
    onTimeUpdate?.(initialTime);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-4xl font-mono font-bold tabular-nums">
        {time}
      </div>
      <div className="flex flex-col gap-1">
        <Button
          size="icon"
          variant="outline"
          onClick={toggleTimer}
          disabled={disabled}
          className="h-8 w-8"
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="icon"
          variant="outline"
          onClick={resetTimer}
          disabled={disabled}
          className="h-8 w-8"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default TimerDisplay; 