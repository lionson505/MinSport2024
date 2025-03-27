import { useState, useEffect, useContext } from 'react';
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
import { useAuth } from '../../../../hooks/useAuth'; // Example import for user context
import axios from 'axios';
import { secureStorage } from '../../../../utils/crypto.js';

// Define or import API_URL
const API_URL = import.meta.env.VITE_API_URL || 'https://api.mis.minisports.gov.rw/api';

export function CreateMatchModal({ open, onClose }) {
  const { user } = useAuth(); // Assuming useAuth provides user details
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
    status: '',
    federationId: '', // Change to federationId
    federationName: '', // Store federation name
  });
  const [userDetails, setUserDetails] = useState(null);
  
  // on swagger db there are 11 fields needs to be created and save
  const { createMatch } = useMatchOperator();
  const [loading, setLoading] = useState(false);
  const [nationalTeams, setNationalTeams] = useState([])
  const [isInternationalTeam, setIsInternationalTeam] = useState(false);
  const [awayTeams, setAwayTeams] = useState([]);
  // console.log("here is national teams : ", nationalTeams)

  const fetchUserDetails = async () => {
    try {
      const storedUser = await secureStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserDetails(parsedUser);

        // Fetch user details from the API
        const response = await axios.get(`${API_URL}users/email/${encodeURIComponent(parsedUser.email)}`);
        const userDetailsFromAPI = response.data;

        // Update the state with the fetched user details
        setUserDetails(userDetailsFromAPI);
      } else {
        console.warn('No user found');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    if (userDetails && userDetails.federation) {
      setFormData((prevData) => ({
        ...prevData,
        federationId: userDetails.federation.id || '', // Use federation ID
        federationName: userDetails.federation.name || '', // Use federation name
      }));
    }
  }, [userDetails]);

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
      "status": formData.status,
      "federationId": formData.federationId, // Send federation ID
    };

    setLoading(true);

    try {
      const response = await axiosInstance.post('/live-matches', transformedData);
      if (response.status === 200 || response.status === 201) {
        toast.success('Match created successfully');
        onClose(); // Optional: Close the modal or form
      } else {
        toast.error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error('Error posting data:', error.response?.data || error.message);
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
        const filteredTeams = response.data.filter(team => team.federationId === formData.federationId);
        setNationalTeams(filteredTeams);
      } catch (error) {
        console.error('Failed to fetch National Teams:', error);
      }
    };

    fetchNationalTeams();
  }, [formData.federationId]);

  // Fetching away teams
  useEffect(() => {
    const fetchAwayTeams = async () => {
      try {
        const response = await axiosInstance.get('/away-teams');
        const filteredTeams = response.data.filter(team => team.federationId === formData.federationId);
        setAwayTeams(filteredTeams);
      } catch (error) {
        console.error('Failed to fetch Away Teams:', error);
      }
    };

    if (isInternationalTeam) {
      fetchAwayTeams();
    }
  }, [isInternationalTeam, formData.federationId]);

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
                  // console.log("you selected gameType :", value);
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
                  // console.log('you selected status: ', value)
                }
                }
               >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="IN PROGRESS">IN PROGRESS</SelectItem> */}
                  {/* <SelectItem value="LIVE">LIVE</SelectItem> */}
                  <SelectItem value="NOT_STARTED">UPCOMING</SelectItem>
                  <SelectItem value="ONGOING">ONGOING</SelectItem>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Federation</label>
            <Input
              value={formData.federationName} // Display federation name
              placeholder="Federation"
              readOnly // Make it read-only if it should not be changed
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
                  // console.log('you selected National Team: ', value)
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
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isInternationalTeam}
                  onChange={(e) => setIsInternationalTeam(e.target.checked)}
                />
                <span>International Team</span>
              </div>
              {isInternationalTeam ? (
                <Select
                  value={formData.awayTeam}
                  onValueChange={(value) => {
                    setFormData({ ...formData, awayTeam: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Away Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {awayTeams.map((awayTeam) => (
                      <SelectItem key={awayTeam.id} value={awayTeam.teamName}>
                        {awayTeam.teamName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={formData.awayTeam}
                  onValueChange={(value) => {
                    setFormData({ ...formData, awayTeam: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select National Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalTeams.map((nationalTeam) => (
                      <SelectItem key={nationalTeam.id} value={nationalTeam.teamName}>
                        {nationalTeam.teamName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                style={{
                  backgroundColor: 'white',
                  color: 'black',
                  
                  width: '65%',
                }}
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Input
                style={{
                  backgroundColor: 'white',
                  color: 'black',
                  width: '50%',
                }}
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