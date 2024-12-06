import { useState } from 'react';
import axiosInstance from '../../../../utils/axiosInstance';
import { toast } from 'sonner';
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
import { useMatchOperator } from '../../../../contexts/MatchOperatorContext';  // Fix this import

export function CreateMatchModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    competition: '',
    gameType: '',
    homeTeam: '',
    awayTeam: '',
    venue: '',
    startTime: '',
    date: '',
    status: ''
  });
// on swagger db there are 11 fields needs to be created and save
  const { createMatch } = useMatchOperator();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Transform data to match backend format
    const transformedData = {
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      homeScore: 0,
      awayScore: 0,
      competition: formData.competition,
      venue: formData.venue,
      matchDate: `${formData.date}T${formData.startTime}:00Z`,
      startTime: `${formData.date}T${formData.startTime}:00Z`,
      status: formData.status, // De
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };                

    setLoading(true);

    try {
      // POST request to your backend API
      // const response = await axiosInstance.post('/live-matches') // Replace with your actual endpoint
      console.log('data', transformedData);
      const response = await axiosInstance.post('/live-matches', transformedData, {
        headers: {
          'Content-Type': 'application/json',  // Ensure JSON content-type
        }
      });
      console.log('Responsejlknlkllk:', response.data);
      if (response.status === 200 || response.status === 201) {
        toast.success('Match created successfully');
        onClose(); // Optional: Close the modal or form
      } else {
        toast.error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error('Error posting data:', error.response?.data || error.message);
      // console.error(error);
      toast.error('Failed to create match. Please try again.');
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
          <div className="space-y-2 border-2 border-red-400 flex flex-cols-2">
            <div className='w-1/2 p-2'>
            <label className="text-sm font-medium">Game Type</label>
            <Select
              value={formData.gameType}
              onValueChange={(value) => {
                setFormData({ ...formData, gameType: value });
                console.log("you selected gameType :", value);
            }}
              
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
            <div className='w-1/2'>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => { 
                setFormData({ ...formData, status: value })
                console.log('you selected status: ', value)
              }
            }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="LIVE">LIVE</SelectItem>
                <SelectItem value="UPCOMING">UPCOMING</SelectItem>
              </SelectContent>
            </Select>
            </div>
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