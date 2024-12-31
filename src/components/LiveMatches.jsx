import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import aprLogo from './liveMatch/aprLogo.jpeg';
import rayonLogo from './liveMatch/rayonLogo.jpg';
// import "./../assets/livematchmodal.css";
import useFetchLiveMatches from '../utils/fetchLiveMatches';
import MatchModal from './matchDetailsModal';

const LiveMatches = () => {
  // const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("Summary");
  const { matches = [], liveMatchError } = useFetchLiveMatches()

  const dummyData = {
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    competition: "Premier League",
    homeScore: 2,
    awayScore: 1,
    status: "In Progress",
    matchDate: "2024-06-15T18:00:00.000Z",
    startTime: "2024-06-15T18:00:00.000Z",
    venue: "Old Trafford",
  };

  const dummyLineUp = {
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    homePlayers: [
      { number: 1, name: "David de Gea", position: "Goalkeeper" },
      { number: 2, name: "Aaron Wan-Bissaka", position: "Defender" },
      { number: 5, name: "Harry Maguire", position: "Defender" },
      { number: 6, name: "Lisandro Martínez", position: "Defender" },
      { number: 23, name: "Luke Shaw", position: "Defender" },
      { number: 18, name: "Casemiro", position: "Midfielder" },
      { number: 14, name: "Christian Eriksen", position: "Midfielder" },
      { number: 8, name: "Bruno Fernandes", position: "Midfielder" },
      { number: 10, name: "Marcus Rashford", position: "Forward" },
      { number: 7, name: "Jadon Sancho", position: "Forward" },
      { number: 9, name: "Anthony Martial", position: "Forward" },
    ],
    awayPlayers: [
      { number: 1, name: "Alisson Becker", position: "Goalkeeper" },
      { number: 66, name: "Trent Alexander-Arnold", position: "Defender" },
      { number: 4, name: "Virgil van Dijk", position: "Defender" },
      { number: 5, name: "Ibrahima Konaté", position: "Defender" },
      { number: 26, name: "Andrew Robertson", position: "Defender" },
      { number: 3, name: "Fabinho", position: "Midfielder" },
      { number: 6, name: "Thiago Alcântara", position: "Midfielder" },
      { number: 14, name: "Jordan Henderson", position: "Midfielder" },
      { number: 11, name: "Mohamed Salah", position: "Forward" },
      { number: 9, name: "Darwin Núñez", position: "Forward" },
      { number: 23, name: "Luis Díaz", position: "Forward" },
    ],
  };

  const groupMatches = (matches) => {
    const liveMatches = matches.filter((match) => match.status === "LIVE");
    const upcomingMatches = matches.filter((match) => match.status === "UPCOMING");
    const pastMatches = matches.filter((match) => match.status === "In Progress");

    return [...liveMatches, ...upcomingMatches, ...pastMatches];
  };

  const groupedMatches = groupMatches(matches);

  // console.log("Live Matches:", groupedMatches.filter(m => m.status === "LIVE"));
  // console.log("Upcoming Matches:", groupedMatches.filter(m => m.status === "UPCOMING"));
  // console.log("Past Matches:", groupedMatches.filter(m => m.status === "In Progress"));



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

  const tabs = ['Info', 'Summary', 'Line-Up'];

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      <button
        onClick={() => scrollContainer('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 -ml-4"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => scrollContainer('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 -mr-4"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      {/* Matches Container */}
      <div
        id="matches-container"
        className="flex overflow-x-auto hide-scrollbar gap-4 px-6 py-4 "
      >

        {groupedMatches.map((match) => (

          <div
            key={match.id}
            className="flex-shrink-0 w-[250px] md:w-[280px] p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer"
            onClick={() => handleMatchClick(match)}
          >
            {/* Match Header */}
            <div className="flex justify-between items-center mb-4">
              <div className='flex flex-col'>
                <span className="text-base font-medium text-gray-900">{match.competition}</span>
                <span className="text-sm text-gray-900">{match.gameType}</span>
              </div>
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
                    src={match.homeTeam.logo || aprLogo}
                    alt={match.homeTeam || 'Unknown team name'}
                    className="h-8 w-8 object-contain"
                  />
                  <span className="font-medium text-gray-900">
                    {match.homeTeam}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {match.homeScore || '0'}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={match.awayTeamLogo || rayonLogo}
                    alt={match.awayTeam}
                    className="h-8 w-8 object-contain"
                  />
                  <span className="font-medium text-gray-900">
                    {match.awayTeam}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {match.awayScore || '0'}
                </span>
              </div>
            </div>

            {/* Match Info */}
            <div className="mt-4 text-sm text-gray-500">
              <div className="text-center font-medium text-red-500">
                {match.time || '82`'}
              </div>
              <div className="text-center mt-1">{match.venue}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedMatch && (
        <MatchModal
          selectedMatch={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
};

export default LiveMatches;