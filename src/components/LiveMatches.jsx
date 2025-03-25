import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import aprLogo from './liveMatch/aprLogo.jpeg';
import rayonLogo from './liveMatch/rayonLogo.jpg';
import useFetchLiveMatches from '../utils/fetchLiveMatches';
import MatchModal from './matchDetailsModal';
import { calculateMatchMinute } from '../utils/matchTimeUtils';

const LiveMatches = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState("Summary");
  const { matches = [], liveMatchError } = useFetchLiveMatches();
  const [matchMinutes, setMatchMinutes] = useState({});
  
  // Calculate the count of matches
  const count = matches.length;

  const formatMatchTime = (matchId) => {
    if (!matchMinutes[matchId]) return '0\'';

    const minutes = parseInt(matchMinutes[matchId], 10);
    if (isNaN(minutes)) return '0\'';

    if (minutes <= 90) {
      return `${minutes}\'`;
    } else {
      const extraTime = minutes - 90;
      return `90+${extraTime}\'`;
    }
  };

  const groupMatches = (matches) => {
    const liveMatches = matches.filter((match) => match.status === "ONGOING");
    const HALFTIME = matches.filter((match) => match.status === "HALFTIME");
    const ENDED = matches.filter((match) => match.status === "ENDED");
    const NOT_STARTED = matches.filter((match) => match.status === "NOT_STARTED");
    const upcomingMatches = matches.filter((match) => match.status === "UPCOMING");
    const pastMatches = matches.filter((match) => match.status === "In Progress");

    return [...liveMatches, ...HALFTIME, ...ENDED, ...NOT_STARTED, ...upcomingMatches, ...pastMatches];
  };

  const groupedMatches = groupMatches(matches);

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

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
  };

  const handleCloseModal = () => {
    setSelectedMatch(null);
  };

  useEffect(() => {
    const initializeMinutes = () => {
      if (!Array.isArray(matches)) return;

      const newMinutes = {};
      matches.forEach(match => {
        if (match.startTime && match.updatedAt) {
          newMinutes[match.id] = calculateMatchMinute(
            match.startTime,
            match.updatedAt,
            match.firstTime,
            match.firstAddedTime,
            match.secondTime || 0,
            match.secondAddedTime || 0
          );
        }
      });
      setMatchMinutes(newMinutes);
    };

    initializeMinutes();
    const timer = setInterval(initializeMinutes, 60000);
    return () => clearInterval(timer);
  }, [matches]);

  return (
    <div className="relative">
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

      <div
        id="matches-container"
        className="flex overflow-x-auto hide-scrollbar gap-4 px-6 py-4"
      >
        {groupedMatches.map((match) => (
          <div
            key={match.id}
            className="flex-shrink-0 w-[250px] md:w-[280px] p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer"
            onClick={() => handleMatchClick(match)}
          >
            <div className="flex justify-between items-center mb-4">
              <div className='flex flex-col'>
                <span className="text-base font-medium text-gray-900">{match.competition}</span>
                <span className="text-sm text-gray-900">{match.gameType}</span>
              </div>
              <span className="flex items-center">
                <span
                  className={`h-2 w-2 rounded-full animate-pulse mr-2 ${match.status === 'NOT_STARTED'
                      ? 'bg-gray-500'
                      : match.status === 'ONGOING'
                        ? 'bg-red-500'
                        : match.status === 'HALFTIME'
                          ? 'bg-orange-500'
                          : ''
                    }`}
                ></span>
                <span
                  className={`text-sm ${match.status === 'NOT_STARTED'
                      ? 'text-gray-500'
                      : match.status === 'ENDED'
                        ? 'text-blue-500'
                        : match.status === 'ONGOING'
                          ? 'text-red-500'
                          : match.status === 'HALFTIME'
                            ? 'text-orange-500'
                            : ''
                    }`}
                 >
                  {match.status}
                </span>
              </span>

            </div>

            <div className="space-y-4">
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

            <div className="mt-4 text-sm text-gray-500">
              <div className="text-center font-medium text-red-500">
                {formatMatchTime(match.id)}
              </div>
              <div className="text-center mt-1">{match.venue}</div>
            </div>
          </div>
        ))}
      </div>

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