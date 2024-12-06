import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import axiosInstance from '../../../../utils/axiosInstance'; // Import axiosInstance

export function CreateMatchModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    competition: '',
    gameType: '',
    homeTeam: '',
    awayTeam: '',
    venue: '',
    startTime: '',
    date: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const matchDate = new Date(`${formData.date}T${formData.startTime}`).toISOString();
      
      const matchData = {
        homeTeam: formData.homeTeam,
        awayTeam: formData.awayTeam,
        homeScore: 0, // Default score, can be updated later
        awayScore: 0, // Default score, can be updated later
        competition: formData.competition,
        venue: formData.venue,
        matchDate: matchDate,
        startTime: matchDate,
        status: 'UPCOMING', // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Use axiosInstance to create a new match
      await axiosInstance.post('/live-matches', matchData);
      onClose();
    } catch (error) {
      console.error('Error creating match:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
          <DialogDescription>
            Enter the details for the new match.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Game Type</label>
            <Select
              value={formData.gameType}
              onValueChange={(value) => setFormData({ ...formData, gameType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select game type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
                <SelectItem value="volleyball">Volleyball</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Competition</label>
            <Input
              value={formData.competition}
              onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
              placeholder="Enter competition name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Home Team</label>
              <Input
                value={formData.homeTeam}
                onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                placeholder="Home team"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Away Team</label>
              <Input
                value={formData.awayTeam}
                onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                placeholder="Away team"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Venue</label>
            <Input
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="Match venue"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Create Match
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
