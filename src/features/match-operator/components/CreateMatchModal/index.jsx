import { useState, useEffect } from 'react';
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
    homeScore: 0,
    awayScore: 0,
    venue: '',
    startTime: '',
    date: '',
    status: ''
  });
  
  // on swagger db there are 11 fields needs to be created and save
  const { createMatch } = useMatchOperator();
  const [loading, setLoading] = useState(false);
  const [nationalTeams, setNationalTeams] = useState([])
  console.log("here is national teams : ", nationalTeams)

  const handleSubmit = async (e) => {
    e.preventDefault();

    const transformedData = {
      "homeTeam": formData.homeTeam || "Rwanda National Team",
      "awayTeam": formData.awayTeam || "Argentina National Team", 
      "homeScore": formData.homeScore || 0,  
      "awayScore": formData.awayScore || 0,  
      "competition": formData.competition || "International Friendly",  
      "venue": formData.venue || "Maracanã Stadium", 
      "matchDate": `${formData.date}T${formData.startTime}:00Z` || "2024-07-15T19:00:00Z", 
      "startTime": `${formData.date}T${formData.startTime}:00Z` || "2024-07-15T19:00:00Z", 
      "gameType": formData.gameType, 
      "status" :   formData.status
    }

    formData.status
    
    

    // const transformedData = {
    //   "homeTeam": formData.homeTeam || "Rwanda National Team",  // Default to empty string if not provided
    //   "awayTeam": formData.awayTeam || "Argentina National Team",  // Default to empty string if not provided
    //   "homeScore": formData.homeScore || 0,  // Default to 0 if not provided
    //   "awayScore": formData.awayScore || 0,  // Default to 0 if not providedformData.homeScore
    //   "competition": formData.competition || "International Friendly",  // Default to empty string if not provided
    //   "venue": formData.venue || "Maracanã Stadium",  // Default to empty string if not provided
    //   "matchDate": "2024-07-15T19:00:00Z",  // Ensure this is correctly formatted
    //   "startTime": "2024-07-15T19:00:00Z",  // Matches ISO 8601 format
    //   "gameType": "FOOTBALL",  // Default to "FOOTBALL" if not provided
    //   "status" :  "ONGOING"
    // }

    setLoading(true);

    try {
      // POST request to your backend API
      // const response = await axiosInstance.post('/live-matches') // Replace with your actual endpoint
      // await console.log('data', transformedData);
      await console.log('data', transformedData);
      const response = await axiosInstance.post('/live-matches', transformedData
      );
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
  // Fetching national teams 
  useEffect(() => {
    const fetchNationalTeams = async () => {
      try {
        const response = await axiosInstance.get('/national-teams');
        setNationalTeams(response.data);
      } catch (error) {
        console.error('Failed to fetch National Teams:', error);
      }
    };

    fetchNationalTeams();
  }, []);

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
          <div className="space-y-2 flex flex-cols-2">
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
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Volleyball">Volleyball</SelectItem>
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
                  <SelectItem value="IN PROGRESS">IN PROGRESS</SelectItem>
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
              {/* <Input
                value={formData.homeTeam}
                onChange={(e) => setFormData({ ...formData, homeTeam: e.target.value })}
                placeholder="Home team"
              /> */}
              <Select
                value={formData.homeTeam}
                onValueChange={(value) => {
                  setFormData({ ...formData, homeTeam: value })
                  console.log('you selected National Team: ', value)
                }
                }
               >
                <SelectTrigger>
                  <SelectValue placeholder="Select National Team" />
                </SelectTrigger>
                <SelectContent>
                  {nationalTeams.map((nationalTeam) => (
                      <SelectItem key={nationalTeam.id} value={nationalTeam.teamName}>{nationalTeam.teamName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Away Team</label>
              {/* <Input
                value={formData.awayTeam}
                onChange={(e) => setFormData({ ...formData, awayTeam: e.target.value })}
                placeholder="Away team"
              /> */}
              <Select
                value={formData.awayTeam}
                onValueChange={(value) => {
                  setFormData({ ...formData, awayTeam: value })
                  console.log('you selected National Team: ', value)
                }
                }
               >
                <SelectTrigger>
                  <SelectValue placeholder="Select National Team" />
                </SelectTrigger>
                <SelectContent>
                  {nationalTeams.map((nationalTeam) => (
                      <SelectItem key={nationalTeam.id} value={nationalTeam.teamName}>{nationalTeam.teamName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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