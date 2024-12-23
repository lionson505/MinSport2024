import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import image1 from "../../components/liveMatch/a.jpg";
import image2 from "../../components/liveMatch/b.jpg";
import matchesBackground from "../../components/liveMatch/matchBackground.jpg";
import HeaderTwo from '../../components/headerTwo';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabsTwo';
import aprLogo from '../../components/liveMatch/aprLogo.jpeg';
import rayonLogo from '../../components/liveMatch/rayonLogo.jpg';


function LandingPageMatch() {
    const [imageIndex, setImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [searchedMatch, setSelectedsearchedMatch] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [matches, setMatches] = useState([]);
    //fetch matches
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
    console.log('fetched matches on the page: ', matches);

    // Filter matches based on the active tab
    const filteredMatches = matches.filter(match => {
        if (activeTab === 'all') return true;
        if (activeTab === 'live') return match.status === 'LIVE';
        if (activeTab === 'upcoming') return match.status === 'UPCOMING'; // Matches yet to happen
        if (activeTab === 'past') return match.status === 'In Progress'; // Matches that have already happened
        return false;
    });

    //Filter matches based on search inputs
    const searchedMatches = matches.filter(searchedMatch => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            searchedMatch.homeTeam.toLowerCase().includes(lowerCaseSearchTerm) ||
            searchedMatch.awayTeam.toLowerCase().includes(lowerCaseSearchTerm) ||
            searchedMatch.competition.toLowerCase().includes(lowerCaseSearchTerm) ||
            searchedMatch.venue.toLowerCase().includes(lowerCaseSearchTerm)
        );
    });



    const image = matchesBackground;

    //setting modal
    const handleMatchClick = (match) => {
        setSelectedMatch(match); // Set the clicked match data
    };

    //setting modal on searched
    const handlesearchedMatchClick = (searchedMatch) => {
        setSelectedsearchedMatch(searchedMatch); // Set the clicked match data
    };

    const handleCloseModal = () => {
        setSelectedMatch(null); // Close the modal
        setSelectedsearchedMatch(null);
    };

    const tabs = ['Info', 'Summary', 'Line-Up'];


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


    return (
        <>
            <HeaderTwo />
            <div
                className="px-24"
                style={{
                    backgroundImage: `url(${image})`, // Ensure the correct path to federation.png
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    height: "70vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    position: "relative",
                    marginBottom: "2rem"
                }}
            >
                {/* Content Section */}
                <div className="flex w-full mt-24 space-x-10" style={{ maxWidth: "100%", textAlign: "center", zIndex: 1 }}>
                    <div className=' w-4/5 text-start'>
                        <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>
                            ALL MATCHES
                        </h1>
                    </div>

                </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                {/* Tabs List with Search */}
                <TabsList className="bg-white p-2 sm:p-4  shadow-sm flex flex-wrap items-center gap-2 
                     sm:flex-col md:flex-row lg:gap-6">
                    <div className=''>
                        <TabsTrigger value="all" onClick={() => setActiveTab('all')}>
                            All Matches
                        </TabsTrigger>
                        <TabsTrigger value="live" onClick={() => setActiveTab('live')}>
                            Live
                        </TabsTrigger>
                        <TabsTrigger value="upcoming" onClick={() => setActiveTab('upcoming')}>
                            Upcoming
                        </TabsTrigger>
                        <TabsTrigger value="past" onClick={() => setActiveTab('past')}>
                            Past
                        </TabsTrigger>
                    </div>
                    <div className=''>
                        {/* <SearchModal /> */}
                        <input onClick={() => setActiveTab('search')}
                            type="text"
                            placeholder="Search Matches..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </TabsList>
                <TabsContent value="all" className={`mt-6 flex justify-center ${activeTab !== 'all' ? 'hidden' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {filteredMatches.length > 0 ? (
                            filteredMatches.map((match) =>
                                <div
                                    key={match.id}
                                    className="flex-shrink-0 w-[280px] p-4 rounded-lg bg-white shadow-sm cursor-pointer m-8"
                                    onClick={() => handleMatchClick(match)}
                                >
                                    {/* Match Header */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {match.competition}
                                        </span>
                                        <span className="flex items-center">
                                            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                                            <span className="text-sm text-red-500">{match.status}</span>
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
                            )) : (
                            <div className="flex w-full justify-center ">
                                <div className="text-center mx-auto">
                                    <h1 className="text-2xl font-semibold text-gray-800">
                                        No Games Available Yet
                                    </h1>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        {selectedMatch && (
                            <div
                                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-background w-[90%] max-w-4xl rounded-lg shadow-lg overflow-hidden">
                                    {/* Match Score Header */}
                                    <div className="bg-[#004d14] p-6 text-white text-muted-foreground">
                                        <div className="flex justify-between items-center mb-4">
                                            <div
                                                onClick={handleCloseModal}
                                                className='bg-white hover:bg-[#046200] px-4 py-2 rounded-full hover:bg-white/80 me-8'>
                                                <button
                                                    className="text-black text-xl"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            <span className="text-white/80">{selectedMatch.competition}</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
                                            <div className="flex sm:w-1/4 w-3/4 items-center gap-2 flex-1 justify-start">
                                                <img
                                                    src={selectedMatch.homeTeam.logo || rayonLogo}
                                                    alt=""
                                                    className="h-16 w-16 object-contain"
                                                />
                                                <span className="md:text-lg text-sm lg:text-lg font-semibold">{selectedMatch.homeTeam}</span>
                                            </div>
                                            <div className="flex flex-col sm:w-1/4 w-1/2">
                                                <div className='flex justify-center items-center gap-4 text-3xl font-bold'>
                                                    <span>{selectedMatch.homeScore}</span>
                                                    <span>-</span>
                                                    <span>{selectedMatch.awayScore}</span>
                                                </div>
                                                <div className="mt-4 text-center text-white/80">
                                                    <span className=''>{selectedMatch.time || '82`'}</span>
                                                    <span className="mx-2">•</span>
                                                    <span className='break-words'>{selectedMatch.venue}</span>
                                                </div>
                                            </div>
                                            <div className="flex sm:w-1/4 w-3/4 items-center gap-2 flex-1 justify-start">
                                                <span className="order-2 sm:order-1 !text-start md:text-md text-sm lg:text-lg font-semibold order">{selectedMatch.awayTeam}</span>
                                                <img
                                                    src={selectedMatch.awayTeam.logo || aprLogo}
                                                    alt={selectedMatch.awayTeam}
                                                    className="order-1 sm:order-2 h-16 w-16 object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Match Details Tabs */}
                                    <div className="border-b border-border">
                                        <nav className="flex gap-4 p-4">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* Match Events */}
                                    {activeTab === "Summary" ? (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">2'</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">Goal</span>
                                                        <span className="text-sm text-muted-foreground">N. Milenković (E. Anderson)</span>
                                                    </div>
                                                </div>
                                                {/* Add more events as needed */}
                                            </div>
                                        </div>
                                    ) : activeTab === "Info" ? (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="space-y-4">
                                                {/* Match Title */}
                                                <div className="text-center mb-4">
                                                    <h1 className="text-lg font-bold">
                                                        {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                                                    </h1>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedMatch.competition} - {selectedMatch.venue}
                                                    </p>
                                                </div>

                                                {/* Scores */}
                                                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
                                                    <div className="text-center">
                                                        <h2 className="text-xl font-semibold">{selectedMatch.homeTeam}</h2>
                                                        <p className="text-2xl font-bold">{selectedMatch.homeScore}</p>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">VS</span>
                                                    <div className="text-center">
                                                        <h2 className="text-xl font-semibold">{selectedMatch.awayTeam}</h2>
                                                        <p className="text-2xl font-bold">{selectedMatch.awayScore}</p>
                                                    </div>
                                                </div>

                                                {/* Match Details */}
                                                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Status:</span>
                                                        <span className="text-muted-foreground">{selectedMatch.status}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Date:</span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(selectedMatch.matchDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Start Time:</span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(selectedMatch.startTime).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Venue:</span>
                                                        <span className="text-muted-foreground">{selectedMatch.venue}</span>
                                                    </div>
                                                </div>

                                                {/* Additional Dummy Data */}
                                                <div className="bg-gray-100 p-4 rounded-md">
                                                    <h3 className="font-semibold mb-2">Additional Info:</h3>
                                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                        <li>Referee: Michael Oliver</li>
                                                        <li>Weather: Cloudy, 18°C</li>
                                                        <li>Attendance: 75,000</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Home Team Line-up */}
                                                <div className="border-r border-gray-300 pr-4">
                                                    <h2 className="text-lg font-bold mb-2">{selectedMatch.homeTeam} Line-up</h2>
                                                    <ul className="space-y-2">
                                                        {dummyLineUp.homePlayers.map((player, index) => (
                                                            <li key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                                                                <span>{player.number}. {player.name}</span>
                                                                <span className="text-sm text-muted-foreground">{player.position}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Away Team Line-up */}
                                                <div className="pl-4">
                                                    <h2 className="text-lg font-bold mb-2">{selectedMatch.awayTeam} Line-up</h2>
                                                    <ul className="space-y-2">
                                                        {dummyLineUp.awayPlayers.map((player, index) => (
                                                            <li key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                                                                <span>{player.number}. {player.name}</span>
                                                                <span className="text-sm text-muted-foreground">{player.position}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>


                </TabsContent>


                {/* Live Events Tab */}
                <TabsContent value="live" className={`mt-6 flex justify-center ${activeTab !== 'live' ? 'hidden' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {filteredMatches.some(match => match.status === 'LIVE') ? (
                            filteredMatches.map((match) =>
                                match.status === 'LIVE' ? (
                                    <div
                                        key={match.id}
                                        className="flex-shrink-0 w-[280px] p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer m-8"
                                        onClick={() => handleMatchClick(match)}
                                    >
                                        {/* Match Header */}
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-medium text-gray-900">
                                                {match.competition}
                                            </span>
                                            <span className="flex items-center">
                                                <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                                                <span className="text-sm text-red-500">{match.status}</span>
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
                                ) : null
                            )
                        ) : (
                            <h1>No Past Match Yet</h1>
                        )}
                    </div>
                    <div>
                        {selectedMatch && (
                            <div
                                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-background w-[90%] max-w-4xl rounded-lg shadow-lg overflow-hidden">
                                    {/* Match Score Header */}
                                    <div className="bg-[#004d14] p-6 text-white text-muted-foreground">
                                        <div className="flex justify-between items-center mb-4">
                                            <div
                                                onClick={handleCloseModal}
                                                className='bg-white hover:bg-[#046200] px-4 py-2 rounded-full hover:bg-white/80'>
                                                <button
                                                    className="text-black text-xl"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <span className="text-white/80">{selectedMatch.competition}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-8">
                                            <div className="flex items-center gap-4 flex-1">
                                                <img
                                                    src={selectedMatch.homeTeam.logo || rayonLogo}
                                                    alt=""
                                                    className="h-16 w-16 object-contain"
                                                />
                                                <span className="text-xl font-semibold">{selectedMatch.homeTeam}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-3xl font-bold">
                                                <span>{selectedMatch.homeScore}</span>
                                                <span>-</span>
                                                <span>{selectedMatch.awayScore}</span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-1 justify-end">
                                                <span className="text-xl font-semibold">{selectedMatch.awayTeam}</span>
                                                <img
                                                    src={selectedMatch.awayTeam.logo || aprLogo}
                                                    alt={selectedMatch.awayTeam}
                                                    className="h-16 w-16 object-contain"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center text-white/80">
                                            <span>{selectedMatch.time || '82`'}</span>
                                            <span className="mx-2">•</span>
                                            <span>{selectedMatch.venue}</span>
                                        </div>
                                    </div>

                                    {/* Match Details Tabs */}
                                    <div className="border-b border-border">
                                        <nav className="flex gap-4 p-4">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* Match Events */}
                                    {activeTab === "Summary" ? (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">2'</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">Goal</span>
                                                        <span className="text-sm text-muted-foreground">N. Milenković (E. Anderson)</span>
                                                    </div>
                                                </div>
                                                {/* Add more events as needed */}
                                            </div>
                                        </div>
                                    ) : activeTab === "Info" ? (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="space-y-4">
                                                {/* Match Title */}
                                                <div className="text-center mb-4">
                                                    <h1 className="text-lg font-bold">
                                                        {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                                                    </h1>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedMatch.competition} - {selectedMatch.venue}
                                                    </p>
                                                </div>

                                                {/* Scores */}
                                                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
                                                    <div className="text-center">
                                                        <h2 className="text-xl font-semibold">{selectedMatch.homeTeam}</h2>
                                                        <p className="text-2xl font-bold">{selectedMatch.homeScore}</p>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">VS</span>
                                                    <div className="text-center">
                                                        <h2 className="text-xl font-semibold">{selectedMatch.awayTeam}</h2>
                                                        <p className="text-2xl font-bold">{selectedMatch.awayScore}</p>
                                                    </div>
                                                </div>

                                                {/* Match Details */}
                                                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Status:</span>
                                                        <span className="text-muted-foreground">{selectedMatch.status}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Date:</span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(selectedMatch.matchDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Start Time:</span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(selectedMatch.startTime).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Venue:</span>
                                                        <span className="text-muted-foreground">{selectedMatch.venue}</span>
                                                    </div>
                                                </div>

                                                {/* Additional Dummy Data */}
                                                <div className="bg-gray-100 p-4 rounded-md">
                                                    <h3 className="font-semibold mb-2">Additional Info:</h3>
                                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                        <li>Referee: Michael Oliver</li>
                                                        <li>Weather: Cloudy, 18°C</li>
                                                        <li>Attendance: 75,000</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Home Team Line-up */}
                                                <div className="border-r border-gray-300 pr-4">
                                                    <h2 className="text-lg font-bold mb-2">{selectedMatch.homeTeam} Line-up</h2>
                                                    <ul className="space-y-2">
                                                        {dummyLineUp.homePlayers.map((player, index) => (
                                                            <li key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                                                                <span>{player.number}. {player.name}</span>
                                                                <span className="text-sm text-muted-foreground">{player.position}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Away Team Line-up */}
                                                <div className="pl-4">
                                                    <h2 className="text-lg font-bold mb-2">{selectedMatch.awayTeam} Line-up</h2>
                                                    <ul className="space-y-2">
                                                        {dummyLineUp.awayPlayers.map((player, index) => (
                                                            <li key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                                                                <span>{player.number}. {player.name}</span>
                                                                <span className="text-sm text-muted-foreground">{player.position}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Upcoming Events Tab */}
                <TabsContent value="upcoming" className={`mt-6 flex justify-center ${activeTab !== 'upcoming' ? 'hidden' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                        {filteredMatches.map((match) => (
                            match.status === 'UPCOMING' && (
                                <div
                                    key={match.id}
                                    className="flex-shrink-0 w-[280px] p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer m-8"
                                    onClick={() => handleMatchClick(match)}
                                >
                                    {/* Match Header */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-medium text-gray-900">
                                            {match.competition}
                                        </span>
                                        <span className="flex items-center">
                                            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                                            <span className="text-sm text-red-500">{match.status}</span>
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
                            )
                        ))}
                    </div>
                    <div>
                        {selectedMatch && (
                            <div
                                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-background w-[90%] max-w-4xl rounded-lg shadow-lg overflow-hidden">
                                    {/* Match Score Header */}
                                    <div className="bg-[#004d14] p-6 text-white text-muted-foreground">
                                        <div className="flex justify-between items-center mb-4">
                                            <div
                                                onClick={handleCloseModal}
                                                className='bg-white hover:bg-[#046200] px-4 py-2 rounded-full hover:bg-white/80'>
                                                <button
                                                    className="text-black text-xl"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <span className="text-white/80">{selectedMatch.competition}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-8">
                                            <div className="flex items-center gap-4 flex-1">
                                                <img
                                                    src={selectedMatch.homeTeam.logo || rayonLogo}
                                                    alt=""
                                                    className="h-16 w-16 object-contain"
                                                />
                                                <span className="text-xl font-semibold">{selectedMatch.homeTeam}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-3xl font-bold">
                                                <span>{selectedMatch.homeScore}</span>
                                                <span>-</span>
                                                <span>{selectedMatch.awayScore}</span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-1 justify-end">
                                                <span className="text-xl font-semibold">{selectedMatch.awayTeam}</span>
                                                <img
                                                    src={selectedMatch.awayTeam.logo || aprLogo}
                                                    alt={selectedMatch.awayTeam}
                                                    className="h-16 w-16 object-contain"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center text-white/80">
                                            <span>{selectedMatch.time || '82`'}</span>
                                            <span className="mx-2">•</span>
                                            <span>{selectedMatch.venue}</span>
                                        </div>
                                    </div>

                                    {/* Match Details Tabs */}
                                    <div className="border-b border-border">
                                        <nav className="flex gap-4 p-4">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* Match Events */}
                                    {activeTab === "Summary" ? (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">2'</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">Goal</span>
                                                        <span className="text-sm text-muted-foreground">N. Milenković (E. Anderson)</span>
                                                    </div>
                                                </div>
                                                {/* Add more events as needed */}
                                            </div>
                                        </div>
                                    ) : activeTab === "Info" ? (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="space-y-4">
                                                {/* Match Title */}
                                                <div className="text-center mb-4">
                                                    <h1 className="text-lg font-bold">
                                                        {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                                                    </h1>
                                                    <p className="text-sm text-muted-foreground">
                                                        {selectedMatch.competition} - {selectedMatch.venue}
                                                    </p>
                                                </div>

                                                {/* Scores */}
                                                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
                                                    <div className="text-center">
                                                        <h2 className="text-xl font-semibold">{selectedMatch.homeTeam}</h2>
                                                        <p className="text-2xl font-bold">{selectedMatch.homeScore}</p>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">VS</span>
                                                    <div className="text-center">
                                                        <h2 className="text-xl font-semibold">{selectedMatch.awayTeam}</h2>
                                                        <p className="text-2xl font-bold">{selectedMatch.awayScore}</p>
                                                    </div>
                                                </div>

                                                {/* Match Details */}
                                                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Status:</span>
                                                        <span className="text-muted-foreground">{selectedMatch.status}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Date:</span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(selectedMatch.matchDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Start Time:</span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(selectedMatch.startTime).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Venue:</span>
                                                        <span className="text-muted-foreground">{selectedMatch.venue}</span>
                                                    </div>
                                                </div>

                                                {/* Additional Dummy Data */}
                                                <div className="bg-gray-100 p-4 rounded-md">
                                                    <h3 className="font-semibold mb-2">Additional Info:</h3>
                                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                        <li>Referee: Michael Oliver</li>
                                                        <li>Weather: Cloudy, 18°C</li>
                                                        <li>Attendance: 75,000</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Home Team Line-up */}
                                                <div className="border-r border-gray-300 pr-4">
                                                    <h2 className="text-lg font-bold mb-2">{selectedMatch.homeTeam} Line-up</h2>
                                                    <ul className="space-y-2">
                                                        {dummyLineUp.homePlayers.map((player, index) => (
                                                            <li key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                                                                <span>{player.number}. {player.name}</span>
                                                                <span className="text-sm text-muted-foreground">{player.position}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Away Team Line-up */}
                                                <div className="pl-4">
                                                    <h2 className="text-lg font-bold mb-2">{selectedMatch.awayTeam} Line-up</h2>
                                                    <ul className="space-y-2">
                                                        {dummyLineUp.awayPlayers.map((player, index) => (
                                                            <li key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                                                                <span>{player.number}. {player.name}</span>
                                                                <span className="text-sm text-muted-foreground">{player.position}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Past Events Tab */}
                <TabsContent value="past" className={`mt-6 flex justify-center ${activeTab !== 'past' ? 'hidden' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
                        {filteredMatches.some(match => match.status === 'PAST') ? (
                            filteredMatches.map((match) =>
                                match.status === 'PAST' ? (
                                    <div
                                        key={match.id}
                                        className="!border-[1px] !h-[390px] pt-10  max-w-sm rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 active:shadow-none"
                                    >
                                        <div className='w-full flex justify-end px-6'>
                                            <p
                                                className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 "
                                            >Past</p>
                                        </div>

                                        {/* Competition Name */}
                                        <p className="text-gray-600 my-8 text-center font-semibold">
                                            {match.competition}
                                        </p>
                                        {/* Teams Section */}
                                        <div className="flex items-center justify-between  h-1/2">
                                            {/* Home Team */}
                                            <div className="flex flex-col items-center  w-full h-full">
                                                <img
                                                    src={match.homeTeamLogo || image1}
                                                    alt={`${match.homeTeam} logo`}
                                                    className="h-24 w-24   object-fill rounded-full mb-4"
                                                />
                                                <p className="text-gray-800 text-sm font-medium">{match.homeTeam}</p>
                                            </div>
                                            <p className="text-gray-600 font-bold text-2xl">vs</p>
                                            {/* Away Team */}
                                            <div className="flex flex-col items-center  w-full h-full">
                                                <img
                                                    src={match.awayTeamLogo || image2}
                                                    alt={`${match.awayTeam} logo`}
                                                    className="h-24 w-24   object-fill rounded-full mb-4"
                                                />
                                                <p className="text-gray-800 text-sm font-medium">{match.awayTeam}</p>
                                            </div>
                                        </div>


                                        {/* Action Button */}
                                        <div className="flex justify-center p-4 border-t border-gray-200">
                                            {/* Match Details */}
                                            <div className='flex justify-center items-center'>
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
                            <div className="flex w-full justify-center">
                                <div className="text-center mx-auto">
                                    <h1 className="text-2xl font-semibold text-gray-800">
                                        No Past Games Available
                                    </h1>
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>



                {/* search events Tab  */}
                <TabsContent value="search" className={`mt-6 flex justify-center ${activeTab !== 'search' ? 'hidden' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
                                            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse mr-2"></span>
                                            <span className="text-sm text-red-500">{searchedMatch.status}</span>
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
                                            {searchedMatch.time || '82`'}
                                        </div>
                                        <div className="text-center mt-1">{searchedMatch.venue}</div>
                                    </div>
                                </div>
                            )) : (
                            <div className="flex w-full justify-center ">
                                <div className="text-center mx-auto">
                                    <h1 className="text-2xl font-semibold">
                                        Sorry! We Can't find " {searchTerm} "
                                    </h1>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        {searchedMatch && (
                            <div
                                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-background w-[90%] max-w-4xl rounded-lg shadow-lg overflow-hidden">
                                    {/* Match Score Header */}
                                    <div className="bg-[#004d14] p-6 text-white text-muted-foreground">
                                        <div className="flex justify-between items-center mb-4">
                                            <div
                                                onClick={handleCloseModal}
                                                className='bg-white hover:bg-[#046200] px-4 py-2 rounded-full hover:bg-white/80'>
                                                <button
                                                    className="text-black text-xl"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            <span className="text-white/80">{searchedMatch.competition}</span>
                                        </div>
                                        <div className="flex justify-between items-center gap-8">
                                            <div className="flex items-center gap-4 flex-1">
                                                <img
                                                    src={searchedMatch.homeTeam.logo || rayonLogo}
                                                    alt=""
                                                    className="h-16 w-16 object-contain"
                                                />
                                                <span className="text-xl font-semibold">{searchedMatch.homeTeam}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-3xl font-bold">
                                                <span>{searchedMatch.homeScore}</span>
                                                <span>-</span>
                                                <span>{searchedMatch.awayScore}</span>
                                            </div>
                                            <div className="flex items-center gap-4 flex-1 justify-end">
                                                <span className="text-xl font-semibold">{searchedMatch.awayTeam}</span>
                                                <img
                                                    src={searchedMatch.awayTeam.logo || aprLogo}
                                                    alt={searchedMatch.awayTeam}
                                                    className="h-16 w-16 object-contain"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 text-center text-white/80">
                                            <span>{searchedMatch.time || '82`'}</span>
                                            <span className="mx-2">•</span>
                                            <span>{searchedMatch.venue}</span>
                                        </div>
                                    </div>

                                    {/* Match Details Tabs */}
                                    <div className="border-b border-border">
                                        <nav className="flex gap-4 p-4">
                                            {tabs.map((tab) => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === tab
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                >
                                                    {tab}
                                                </button>
                                            ))}
                                        </nav>
                                    </div>

                                    {/* Match Events */}
                                    {activeTab === "Summary" ? (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">2</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">Goal</span>
                                                        <span className="text-sm text-muted-foreground">N. Milenković (E. Anderson)</span>
                                                    </div>
                                                </div>
                                                {/* Add more events as needed */}
                                            </div>
                                        </div>
                                    ) : activeTab === "Info" ? (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="space-y-4">
                                                {/* Match Title */}
                                                <div className="text-center mb-4">
                                                    <h1 className="text-lg font-bold">
                                                        {searchedMatch.homeTeam} vs {searchedMatch.awayTeam}
                                                    </h1>
                                                    <p className="text-sm text-muted-foreground">
                                                        {searchedMatch.competition} - {searchedMatch.venue}
                                                    </p>
                                                </div>

                                                {/* Scores */}
                                                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md">
                                                    <div className="text-center">
                                                        <h2 className="text-xl font-semibold">{searchedMatch.homeTeam}</h2>
                                                        <p className="text-2xl font-bold">{searchedMatch.homeScore}</p>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">VS</span>
                                                    <div className="text-center">
                                                        <h2 className="text-xl font-semibold">{searchedMatch.awayTeam}</h2>
                                                        <p className="text-2xl font-bold">{searchedMatch.awayScore}</p>
                                                    </div>
                                                </div>

                                                {/* Match Details */}
                                                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Status:</span>
                                                        <span className="text-muted-foreground">{searchedMatch.status}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Date:</span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(searchedMatch.matchDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Start Time:</span>
                                                        <span className="text-muted-foreground">
                                                            {new Date(searchedMatch.startTime).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Venue:</span>
                                                        <span className="text-muted-foreground">{searchedMatch.venue}</span>
                                                    </div>
                                                </div>

                                                {/* Additional Dummy Data */}
                                                <div className="bg-gray-100 p-4 rounded-md">
                                                    <h3 className="font-semibold mb-2">Additional Info:</h3>
                                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                                        <li>Referee: Michael Oliver</li>
                                                        <li>Weather: Cloudy, 18°C</li>
                                                        <li>Attendance: 75,000</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 max-h-[400px] overflow-y-auto">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Home Team Line-up */}
                                                <div className="border-r border-gray-300 pr-4">
                                                    <h2 className="text-lg font-bold mb-2">{searchedMatch.homeTeam} Line-up</h2>
                                                    <ul className="space-y-2">
                                                        {dummyLineUp.homePlayers.map((player, index) => (
                                                            <li key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                                                                <span>{player.number}. {player.name}</span>
                                                                <span className="text-sm text-muted-foreground">{player.position}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Away Team Line-up */}
                                                <div className="pl-4">
                                                    <h2 className="text-lg font-bold mb-2">{searchedMatch.awayTeam} Line-up</h2>
                                                    <ul className="space-y-2">
                                                        {dummyLineUp.awayPlayers.map((player, index) => (
                                                            <li key={index} className="flex justify-between bg-gray-100 p-2 rounded-md">
                                                                <span>{player.number}. {player.name}</span>
                                                                <span className="text-sm text-muted-foreground">{player.position}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}

export default LandingPageMatch;