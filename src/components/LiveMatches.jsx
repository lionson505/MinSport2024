import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
// import "./../assets/livematchmodal.css";

const LiveMatches = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);


  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axiosInstance.get('/live-matches');
        setMatches(response.data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchMatches();
  }, []);

  const scrollContainer = (direction) => {
    const container = document.getElementById('matches-container');
    const scrollAmount = 300;
    if (container) {
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  //match modal on landing page functions
  const handleMatchClick = (match) => {
    setSelectedMatch(match); // Set the clicked match data
  };

  const handleCloseModal = () => {
    setSelectedMatch(null); // Close the modal
  };

  return (
    <div>
      {/* Matches Container */}
      <div
        id="matches-container"
        className="flex overflow-x-auto hide-scrollbar gap-4 px-6 py-4"
      >
        {matches.map((match) => (
          <div
            key={match.id}
            className="flex-shrink-0 w-[280px] p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer"
            onClick={() => handleMatchClick(match)}
          >
            {/* Match Header */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-900">
                {match.competition}
              </span>
              <span className="flex items-center">
                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                <span className="text-sm text-red-500">Live</span>
              </span>
            </div>

            {/* Teams */}
            <div className="space-y-4">
              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={match.homeTeam.logo}
                    alt={match.homeTeam.name}
                    className="h-8 w-8 object-contain"
                  />
                  <span className="font-medium text-gray-900">
                    {match.homeTeam.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {match.homeTeam.score}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={match.awayTeam.logo}
                    alt={match.awayTeam.name}
                    className="h-8 w-8 object-contain"
                  />
                  <span className="font-medium text-gray-900">
                    {match.awayTeam.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {match.awayTeam.score}
                </span>
              </div>
            </div>

            {/* Match Info */}
            <div className="mt-4 text-sm text-gray-500">
              <div className="text-center font-medium text-red-500">
                {match.time}
              </div>
              <div className="text-center mt-1">{match.venue}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-lg p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">{selectedMatch.competition}</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <strong>Time:</strong> {selectedMatch.time}
              </div>
              <div>
                <strong>Venue:</strong> {selectedMatch.venue}
              </div>
              <div>
                <strong>Teams:</strong>
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{selectedMatch.homeTeam.name}</span>
                    <span className="font-bold">{selectedMatch.homeTeam.score}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">{selectedMatch.awayTeam.name}</span>
                    <span className="font-bold">{selectedMatch.awayTeam.score}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMatches;
