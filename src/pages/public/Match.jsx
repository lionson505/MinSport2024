import { useState, useEffect } from 'react';
import { cn } from "../../lib/utils"
import { Card } from "../../components/ui/card"
import { Modal } from "../../components/ui/Modal";
import axiosInstance from '../../utils/axiosInstance';
import { Form } from 'react-bootstrap';
import logo from "../../components/liveMatch/image.png";
import image1 from "../../components/liveMatch/a.jpg";
import image2 from "../../components/liveMatch/b.jpg";
import image3 from "../../components/liveMatch/c.jpg";
import image4 from "../../components/liveMatch/d.jpeg";
import image5 from "../../components/liveMatch/e.webp";
import HeaderTwo from '../../components/headerTwo';
import LiveMatches from '../../components/LiveMatches';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';


function LandingPageMatch() {
    const backgroundImages = [image1, image2, image3, image4, image5];
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
            if (activeTab === 'live') return match.status === 'In Progress';
            if (activeTab === 'upcoming') return new Date(match.matchDate) > new Date(); // Matches yet to happen
            if (activeTab === 'past') return new Date(match.matchDate) < new Date(); // Matches that have already happened
            return false;
        });


    useEffect(() => {
        const interval = setInterval(() => {
            setImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
        }, 5000);
        return () => clearInterval(interval);
    }, [backgroundImages.length])

    const image = backgroundImages[imageIndex];


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
                {/* Overlay for a slight dark effect */}
                <div className="overlay" style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.7)"
                }}></div>
                {/* Content Section */}
                <div className="flex w-full mt-24 space-x-10" style={{ maxWidth: "100%", textAlign: "center", zIndex: 1 }}>
                    <div className=' w-4/5 text-start'>
                        <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>
                            Welcome to Rwanda Sports Federations
                        </h1>
                        <p style={{ fontSize: "1.2rem", margin: "20px 0", maxWidth: "700px" }}>
                            Explore all the sports federations in Rwanda, including FERWAFA,
                            FERWABA, and many more. Stay updated on events, news, and achievements.
                        </p>
                        <button
                            className='hover:bg-[#ffffff83] bg-[#ffffff3b]'
                            style={{
                                padding: "20px 40px",
                                fontSize: "1rem",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            Read More
                        </button>
                    </div>
                    <div className="flex justify-end w-1/6 w-60 h-60">
                        <img src={logo} alt="rwandanLogo" className="w-full h-full" />
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
              <div key={match.id} className="match-card">
                <h3>{match.homeTeam} vs {match.awayTeam}</h3>
                <p>{match.competition}</p>
                <p>{match.status}</p>
                <p>{new Date(match.matchDate).toLocaleString()}</p>
              </div>
            ))}
          </div>


          <h2 className="text-white text-2xl font-bold mb-6">Gameweek 14</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredMatches.map((match) => {
            const matchDate = new Date(match.matchDate)
            const formattedDate = matchDate.toLocaleDateString('en-US', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })

            return (
              <Card
                key={match.id}
                className={cn(
                  "bg-gray-900/50 border-gray-800 p-6 cursor-pointer transition-all duration-200 hover:bg-gray-800/50",
                  selectedMatch === match.id && "bg-indigo-600/20 border-indigo-500"
                )}
                onClick={() => setSelectedMatch(match.id)}
              >
                <div className="text-xs text-gray-400 mb-4">{match.league}</div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={match.homeTeam.logo}
                      alt={match.homeTeam}
                      className="w-10 h-10 object-contain"
                    />
                    <span className="text-white text-sm">{match.homeTeam}</span>
                  </div>
                  <span className="text-gray-400 text-sm">VS</span>
                  <div className="flex flex-col items-center space-y-2">
                    <img
                      src={match.awayTeam.logo}
                      alt={match.awayTeam}
                      className="w-10 h-10 object-contain"
                    />
                    <span className="text-white text-sm">{match.awayTeam}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm">{formattedDate}</div>
                  <div className="text-gray-400 text-sm">{match.time}</div>
                </div>
              </Card>
            )
          })}
        </div>

        </TabsContent>

        {/* Live Events Tab */}
        <TabsContent value="live" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMatches.map((match) => (
              match.status === 'In Progress' && (
                <div key={match.id} className="match-card">
                  <h3>{match.homeTeam} vs {match.awayTeam}</h3>
                  <p>{match.competition}</p>
                  <p>{match.status}</p>
                  <p>{new Date(match.matchDate).toLocaleString()}</p>
                </div>
              )
            ))}
          </div>
        </TabsContent>

        {/* Upcoming Events Tab */}
        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMatches.map((match) => (
              new Date(match.matchDate) > new Date() && (
                <div key={match.id} className="match-card">
                  <h3>{match.homeTeam} vs {match.awayTeam}</h3>
                  <p>{match.competition}</p>
                  <p>{match.status}</p>
                  <p>{new Date(match.matchDate).toLocaleString()}</p>
                </div>
              )
            ))}
          </div>
        </TabsContent>

        {/* Past Events Tab */}
        <TabsContent value="past" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMatches.map((match) => (
              new Date(match.matchDate) < new Date() && (
                <div key={match.id} className="match-card">
                  <h3>{match.homeTeam} vs {match.awayTeam}</h3>
                  <p>{match.competition}</p>
                  <p>{match.status}</p>
                  <p>{new Date(match.matchDate).toLocaleString()}</p>
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