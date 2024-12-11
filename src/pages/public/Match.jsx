import { useState, useEffect } from 'react';
import { cn } from "../../lib/utils"
import { Modal } from "../../components/ui/Modal";
import axiosInstance from '../../utils/axiosInstance';
import { Form } from 'react-bootstrap';
import logo from "../../components/liveMatch/image.png";
import image1 from "../../components/liveMatch/a.jpg";
import image2 from "../../components/liveMatch/b.jpg";
import matchesBackground from "../../components/liveMatch/matchBackground.jpg";
import HeaderTwo from '../../components/headerTwo';
import LiveMatches from '../../components/LiveMatches';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';


function LandingPageMatch() {
    const [imageIndex, setImageIndex] = useState(0);
    const [matches, setMatches] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedMatch, setSelectedMatch] = useState(null);

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

    const image = matchesBackground;


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
            <LiveMatches />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="bg-white p-1 rounded-lg shadow-sm">
                    <TabsTrigger value="all">
                        All Events
                    </TabsTrigger>
                    <TabsTrigger value="live">
                        Live
                    </TabsTrigger>
                    <TabsTrigger value="upcoming">
                        Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="past">
                        Past
                    </TabsTrigger>
                </TabsList>

                {/* All Events Tab */}
                <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredMatches.map((match) => (
                            <div
                                key={match.id}
                                className="!border-[1px] !h-[480px] pt-2  max-w-sm rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 active:shadow-none"
                            >
                                <div className='w-full flex justify-end px-6'>
                                    <p
                                        className={`px-2 py-1 rounded-full text-xs ${match.status === 'LIVE' ? 'bg-red-100 text-red-600' :
                                            match.status === 'UPCOMING' ? 'bg-green-100 text-green-600' :
                                              'bg-gray-100 text-gray-600'
                                          }`}
                                    >{match.status}</p>
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

                        ))}


                    </div>


                </TabsContent>

                {/* Live Events Tab */}
                <TabsContent value="live" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredMatches.map((match) => (
                            match.status === 'LIVE' && (
                                <div
                                    key={match.id}
                                    className="!border-[1px] !h-[390px] pt-10  max-w-sm rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 active:shadow-none"
                                >
                                    <div className='w-full flex justify-end px-6'>
                                    <p
                                        className={`px-2 py-1 rounded-full text-xs ${match.status === 'LIVE' ? 'bg-red-100 text-red-600' :
                                            ""}`}
                                    >{match.status}</p>
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
                            )
                        ))}
                    </div>
                </TabsContent>

                {/* Upcoming Events Tab */}
                <TabsContent value="upcoming" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredMatches.map((match) => (
                            match.status === 'UPCOMING' && (
                                <div
                                    key={match.id}
                                    className="!border-[1px] !h-[390px] pt-10  max-w-sm rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 active:shadow-none"
                                >
                                    <div className='w-full flex justify-end px-6'>
                                    <p
                                        className={`px-2 py-1 rounded-full text-xs ${match.status === 'UPCOMING' ? 'bg-green-100 text-green-600' :
                                              'bg-gray-100 text-gray-600'
                                          }`}
                                    >{match.status}</p>
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
                            )
                        ))}
                    </div>
                </TabsContent>

                {/* Past Events Tab */}
                <TabsContent value="past" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredMatches.map((match) => (
                            match.status === 'In Progress' && (
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
                            )
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </>
    );
}

export default LandingPageMatch;