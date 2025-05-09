import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import image1 from "../../components/liveMatch/a.jpg";
import image2 from "../../components/liveMatch/b.jpg";
import matchesBackground from "../../components/liveMatch/matchBackground.jpg";
import HeaderTwo from '../../components/headerTwo';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabsTwo';
import aprLogo from '../../components/liveMatch/aprLogo.jpeg';
import rayonLogo from '../../components/liveMatch/rayonLogo.jpg';
import MatchModal from '../../components/matchDetailsModal';
import useFetchLiveMatches from '../../utils/fetchLiveMatches';
import Fallback from './fallback';
import PublicLayout from '../../components/layouts/PublicLayout.jsx';
import { calculateMatchMinute } from '../../utils/matchTimeUtils';

function LandingPageMatch() {
    const [imageIndex, setImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [searchedMatch, setSelectedsearchedMatch] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { matches = [], liveMatchError } = useFetchLiveMatches([]);
    const [matchMinutes, setMatchMinutes] = useState({});

    const filteredMatches = matches.filter(match => {
        if (activeTab === 'all') return true;
        if (activeTab === 'ONGOING') return match.status === 'ONGOING';
        if (activeTab === 'HALFTIME') return match.status === 'HALFTIME';
        if (activeTab === 'NOT_STARTED') return match.status === 'NOT_STARTED';
        if (activeTab === 'ENDED') return match.status === 'ENDED';
        return false;
    });

    const searchedMatches = matches.filter(searchedMatch => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            searchedMatch.homeTeam.toLowerCase().includes(lowerCaseSearchTerm) ||
            searchedMatch.awayTeam.toLowerCase().includes(lowerCaseSearchTerm) ||
            searchedMatch.competition.toLowerCase().includes(lowerCaseSearchTerm) ||
            searchedMatch.venue.toLowerCase().includes(lowerCaseSearchTerm)
        );
    });

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

    const image = matchesBackground;

    const handleMatchClick = (match) => {
        setSelectedMatch(match);
    };

    const handlesearchedMatchClick = (searchedMatch) => {
        setSelectedsearchedMatch(searchedMatch);
    };

    const handleCloseModal = () => {
        setSelectedMatch(null);
        setSelectedsearchedMatch(null);
    };

    // console.log("filteredMatches", filteredMatches);

    return (
        <>
            <HeaderTwo />
            <PublicLayout>
                <div
                    className="px-24"
                    style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: "100% 100%",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        height: "50vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        position: "relative",
                        marginBottom: "2rem"
                    }}
                >
                    <div className="flex w-full mt-24 space-x-10" style={{ maxWidth: "100%", textAlign: "center", zIndex: 1 }}>
                        <div className='w-4/5 text-start'>
                            <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>ALL MATCHES</h1>
                        </div>
                    </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                    <TabsList className="bg-white p-2 sm:p-4 shadow-sm flex flex-wrap items-center gap-2 sm:flex-col md:flex-row lg:gap-6">
                        <div className=''>
                            <TabsTrigger value="all" onClick={() => setActiveTab('all')}>
                                ALL MATCHES
                            </TabsTrigger>
                            <TabsTrigger value="ONGOING" onClick={() => setActiveTab('ONGOING')}>
                                ONGOING
                            </TabsTrigger>
                            <TabsTrigger value="HALFTIME" onClick={() => setActiveTab('HALFTIME')}>
                                HALFTIME
                            </TabsTrigger>
                            <TabsTrigger value="NOT_STARTED" onClick={() => setActiveTab('NOT_STARTED')}>
                                UPCOMING
                            </TabsTrigger>
                            <TabsTrigger value="ENDED" onClick={() => setActiveTab('ENDED')}>
                                PAST
                            </TabsTrigger>
                        </div>
                        <div className=''>
                            <input onClick={() => setActiveTab('search')}
                                type="text"
                                placeholder="Search Matches..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </TabsList>

                    {/* All Matches Tab */}
                    <TabsContent value="all" className={`mt-6 flex justify-center ${activeTab !== 'all' ? 'hidden' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-6 bg-white rounded-lg shadow-md">
                            {filteredMatches.length > 0 ? (
                                filteredMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        className="flex-shrink-0 w-[280px] p-4 rounded-lg bg-white shadow-sm cursor-pointer m-8"
                                        onClick={() => handleMatchClick(match)}
                                    >
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-medium text-gray-900">
                                                {match.competition}
                                            </span>
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
                                ))
                            ) : (
                                <div className="flex items-center justify-center col-span-full min-h-[400px]">
                                    <Fallback
                                        className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg shadow-md"
                                        message="No Games Available"
                                        onRetry={() => console.log("Retry clicked!")}
                                    />
                                </div>
                            )}
                        </div>
                        {selectedMatch && (
                            <MatchModal
                                selectedMatch={selectedMatch}
                                onClose={() => setSelectedMatch(null)}
                            />
                        )}
                    </TabsContent>

                    {/* Live Events Tab */}
                    <TabsContent value="ONGOING" className={`mt-6 flex justify-center ${activeTab !== 'ONGOING' ? 'hidden' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-6 bg-white rounded-lg shadow-md">
                            {filteredMatches.some(match => match.status === 'ONGOING') ? (
                                filteredMatches.map((match) =>
                                    match.status === 'ONGOING' ? (
                                        <div
                                            key={match.id}
                                            className="flex-shrink-0 w-[280px] p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer m-8"
                                            onClick={() => handleMatchClick(match)}
                                        >
                                            {/* Match content - same structure as all matches */}
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {match.competition}
                                                </span>
                                                <span className="flex items-center">
                                                    <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                                                    <span className="text-sm text-red-500">{match.status}</span>
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
                                    ) : null
                                )
                            ) : (
                                <div className="flex items-center justify-center col-span-full min-h-[400px]">
                                    <Fallback
                                        className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg shadow-md"
                                        message="No ONGOING Games Available"
                                        onRetry={() => console.log("Retry clicked!")}
                                    />
                                </div>
                            )}
                        </div>
                        {selectedMatch && (
                            <MatchModal
                                selectedMatch={selectedMatch}
                                onClose={() => setSelectedMatch(null)}
                            />
                        )}
                    </TabsContent>

                    {/* HALFTIME Events Tab */}
                    <TabsContent value="HALFTIME" className={`mt-6 flex justify-center ${activeTab !== 'HALFTIME' ? 'hidden' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-6 bg-white rounded-lg shadow-md">
                            {filteredMatches.some(match => match.status === 'HALFTIME') ? (
                                filteredMatches.map((match) =>
                                    match.status === 'HALFTIME' ? (
                                        <div
                                            key={match.id}
                                            className="flex-shrink-0 w-[280px] p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer m-8"
                                            onClick={() => handleMatchClick(match)}
                                        >
                                            {/* Match content - same structure as all matches */}
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {match.competition}
                                                </span>
                                                <span className="flex items-center">
                                                    <span className="h-2 w-2 bg-orange-500 rounded-full animate-pulse mr-2"></span>
                                                    <span className="text-sm text-orange-500">{match.status}</span>
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
                                    ) : null
                                )
                            ) : (
                                <div className="flex items-center justify-center col-span-full min-h-[400px]">
                                    <Fallback
                                        className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg shadow-md"
                                        message="No HALFTIME Games Available"
                                        onRetry={() => console.log("Retry clicked!")}
                                    />
                                </div>
                            )}
                        </div>
                        {selectedMatch && (
                            <MatchModal
                                selectedMatch={selectedMatch}
                                onClose={() => setSelectedMatch(null)}
                            />
                        )}
                    </TabsContent>

                    {/* Upcoming Events Tab */}
                    {/* match.status === 'UPCOMING' ? ( */}
                    <TabsContent value="NOT_STARTED" className={`mt-6 flex justify-center ${activeTab !== 'NOT_STARTED' ? 'hidden' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-6 bg-white rounded-lg shadow-md">
                            {filteredMatches.some(match => match.status === 'NOT_STARTED') ? (
                                filteredMatches.map((match) =>
                                    match.status === 'NOT_STARTED' ? (
                                        <div
                                            key={match.id}
                                            className="!border-[1px] !h-[390px] pt-10 max-w-sm rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 active:shadow-none"
                                        >
                                            <div className="w-full flex justify-end px-6">
                                                <p className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                                    UPCOMING
                                                </p>
                                            </div>

                                            {/* Competition Name */}
                                            <p className="text-gray-600 my-8 text-center font-semibold">
                                                {match.competition}
                                            </p>

                                            {/* Teams Section */}
                                            <div className="flex items-center justify-between h-1/2">
                                                {/* Home Team */}
                                                <div className="flex flex-col items-center w-full h-full">
                                                    <img
                                                        src={match.homeTeamLogo || image1}
                                                        alt={`${match.homeTeam} logo`}
                                                        className="h-24 w-24 object-fill rounded-full mb-4"
                                                    />
                                                    <p className="text-gray-800 text-sm font-medium">{match.homeTeam}</p>
                                                </div>
                                                <p className="text-gray-600 font-bold text-2xl">vs</p>
                                                {/* Away Team */}
                                                <div className="flex flex-col items-center w-full h-full">
                                                    <img
                                                        src={match.awayTeamLogo || image2}
                                                        alt={`${match.awayTeam} logo`}
                                                        className="h-24 w-24 object-fill rounded-full mb-4"
                                                    />
                                                    <p className="text-gray-800 text-sm font-medium">{match.awayTeam}</p>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="flex justify-center p-4 border-t border-gray-200">
                                                {/* Match Details */}
                                                <div className="flex justify-center items-center">
                                                    <div className="p-4">
                                                        <p className="text-gray-600 text-sm">
                                                            {new Date(match.matchDate).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-gray-600 text-sm">
                                                            {new Date(match.matchDate).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null
                                )
                            ) : (
                                <div className="flex items-center justify-center col-span-full min-h-[400px]">
                                    <Fallback
                                        className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg shadow-md"
                                        message="No Upcoming Games Available"
                                        onRetry={() => console.log("Retry clicked!")}
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            {selectedMatch && (
                                <MatchModal
                                    selectedMatch={selectedMatch}
                                    onClose={() => setSelectedMatch(null)}
                                />
                            )}
                        </div>
                    </TabsContent>

                    {/* Past Events Tab */}
                    <TabsContent value="ENDED" className={`mt-6 flex justify-center ${activeTab !== 'ENDED' ? 'hidden' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-6 bg-white rounded-lg shadow-md">
                            {filteredMatches.some(match => match.status === 'ENDED') ? (
                                filteredMatches.map((match) =>
                                    match.status === 'ENDED' ? (
                                        <div
                                            key={match.id}
                                            className="flex-shrink-0 w-[280px] p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer m-8"
                                            onClick={() => handleMatchClick(match)}
                                        >
                                            {/* Match content - same structure as all matches */}
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {match.competition}
                                                </span>
                                                <span className="flex items-center">
                                                    <span className="text-sm text-blue-500">{match.status}</span>
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
                                    ) : null
                                )
                            ) : (
                                <div className="flex items-center justify-center col-span-full min-h-[400px]">
                                    <Fallback
                                        className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg shadow-md"
                                        message="No Past Games Available"
                                        onRetry={() => console.log("Retry clicked!")}
                                    />
                                </div>
                            )}
                        </div>
                        {selectedMatch && (
                            <MatchModal
                                selectedMatch={selectedMatch}
                                onClose={() => setSelectedMatch(null)}
                            />
                        )}
                    </TabsContent>



                    {/* search events Tab  */}
                    <TabsContent value="search" className={`mt-6 flex justify-center ${activeTab !== 'search' ? 'hidden' : ''}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full p-6 bg-white rounded-lg shadow-md">
                            {searchedMatches.length > 0 ? (
                                searchedMatches.map((searchedMatch) =>
                                    <div
                                        key={searchedMatch.id}
                                        className="flex-shrink-0 w-[280px] p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer m-8"
                                        onClick={() => handlesearchedMatchClick(searchedMatch)}
                                     >
                                        {/* Match Header */}
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-medium text-gray-900">
                                                {searchedMatch.competition}
                                            </span>
                                            <span className="flex items-center">
                                                <span
                                                    className={`h-2 w-2 rounded-full animate-pulse mr-2 ${searchedMatch.status === 'NOT_STARTED'
                                                        ? 'bg-gray-500'
                                                        : searchedMatch.status === 'ONGOING'
                                                            ? 'bg-red-500'
                                                            : searchedMatch.status === 'HALFTIME'
                                                                ? 'bg-orange-500'
                                                                : ''
                                                        }`}
                                                ></span>
                                                <span
                                                    className={`text-sm ${searchedMatch.status === 'NOT_STARTED'
                                                        ? 'text-gray-500'
                                                        : searchedMatch.status === 'ENDED'
                                                            ? 'text-blue-500'
                                                            : searchedMatch.status === 'ONGOING'
                                                                ? 'text-red-500'
                                                                : searchedMatch.status === 'HALFTIME'
                                                                    ? 'text-orange-500'
                                                                    : ''
                                                        }`}
                                                >
                                                    {searchedMatch.status}
                                                </span>
                                            </span>
                                        </div>

                                        {/* Teams */}
                                        <div className="space-y-4">
                                            {/* Home Team */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={searchedMatch.homeTeam.logo || aprLogo}
                                                        alt={searchedMatch.homeTeam || 'Unknown team name'}
                                                        className="h-8 w-8 object-contain"
                                                    />
                                                    <span className="font-medium text-gray-900">
                                                        {searchedMatch.homeTeam}
                                                    </span>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900">
                                                    {searchedMatch.homeScore || '0'}
                                                </span>
                                            </div>

                                            {/* Away Team */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={searchedMatch.awayTeamLogo || rayonLogo}
                                                        alt={searchedMatch.awayTeam}
                                                        className="h-8 w-8 object-contain"
                                                    />
                                                    <span className="font-medium text-gray-900">
                                                        {searchedMatch.awayTeam}
                                                    </span>
                                                </div>
                                                <span className="text-lg font-bold text-gray-900">
                                                    {searchedMatch.awayScore || '0'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Match Info */}
                                        <div className="mt-4 text-sm text-gray-500">
                                            <div className="text-center font-medium text-red-500">
                                                {formatMatchTime(searchedMatch.id)}
                                            </div>
                                            <div className="text-center mt-1">{searchedMatch.venue}</div>
                                        </div>
                                    </div>
                                )) : (
                                <div className="flex items-center justify-center col-span-full min-h-[400px]">
                                    <Fallback
                                        className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg shadow-md"
                                        message="Sorry! We Can't find "
                                        response={searchTerm}
                                        onRetry={() => console.log("Retry clicked!")}
                                    />
                                </div>
                            )}
                        </div>
                        {searchedMatch && (
                            <MatchModal
                                selectedMatch={searchedMatch}
                                onClose={() => setSelectedsearchedMatch(null)}
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </PublicLayout>
        </>
    );
}

export default LandingPageMatch;