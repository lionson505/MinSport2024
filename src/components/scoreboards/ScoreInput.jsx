import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Plus, Minus } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

export function ScoreInput({ 
  value = 0, 
  match,
  team,
  onChange, 
  min = 0, 
  max = 999,
  step = 1,
  label = "Score"
}) {
  const [showManualInput, setShowManualInput] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  // Increment the score
  const increment = async () => {
    const newValue = value + step;
    if (newValue <= max) {
      try {
        // Prepare updated scores
        const updatedScores = {
          homeScore: match.homeScore,
          awayScore: match.awayScore,
        };

        if (team === 'A') updatedScores.homeScore += step;
        else if (team === 'B') updatedScores.awayScore += step;

        // console.log('Updated Scores:', updatedScores);

        // Update the match score via API
        await axiosInstance.patch(`/live-matches/${match.id}/score`, updatedScores);
        // console.log('Match score updated successfully.');

        // Call the onChange handler
        onChange(newValue);
      } catch (error) {
        console.error('Failed to update match score:', error);
      }
    }
  };

  // Decrement the score
  const decrement = async () => {
    const newValue = value - step;
    if (newValue <= max) {
      try {
        // Prepare updated scores
        const updatedScores = {
          homeScore: match.homeScore,
          awayScore: match.awayScore,
        };

        if (team === 'A') updatedScores.homeScore -= step;
        else if (team === 'B') updatedScores.awayScore -= step;

        // console.log('Updated Scores:', updatedScores);

        // Update the match score via API
        await axiosInstance.patch(`/live-matches/${match.id}/score`, updatedScores);
        // console.log('Match score updated successfully.');

        // Call the onChange handler
        onChange(newValue);
      } catch (error) {
        console.error('Failed to update match score:', error);
      }
    }
  };

  // Handle manual input submission
  const handleManualSubmit = () => {
    const numValue = parseInt(tempValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
      setShowManualInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-col items-center gap-2">
        {/* <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={decrement}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button> */}
        <Button
          type="button"
          variant="outline"
          className="w-20 font-mono"
          // onClick={() => setShowManualInput(true)}
        >
          {value}
        </Button>
        {/* <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={increment}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button> */}
      </div>

      <Dialog open={showManualInput} onOpenChange={setShowManualInput}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Score</DialogTitle>
            <DialogDescription>
              Enter a value between {min} and {max}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="number"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              min={min}
              max={max}
              step={step}
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowManualInput(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleManualSubmit}>
                Update Score
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
