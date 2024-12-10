import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import LiveMatches from '../components/LiveMatches';

function LandingPage() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedSport, setSelectedSport] = useState('BASKETBALL');
  
  const navigation = ['HOME', 'FEDERATION', 'EVENTS', 'MATCHES', 'INFRASTRUCTURE'];

  const leagues = [
    { 
      name: 'RPL', 
      logo: '/logos/rpl.svg',
      color: 'bg-blue-900',
      bgPattern: 'bg-[url("/patterns/rpl-pattern.svg")]'
    },
    { 
      name: 'RBL', 
      logo: '/logos/rbl.svg',
      color: 'bg-blue-500',
      bgPattern: 'bg-[url("/patterns/rbl-pattern.svg")]'
    },
    { 
      name: 'FRVB', 
      logo: '/logos/frvb.svg',
      color: 'bg-purple-900',
      bgPattern: 'bg-[url("/patterns/frvb-pattern.svg")]'
    },
    { 
      name: 'Tour Du Rwanda', 
      logo: '/logos/tour.svg',
      color: 'bg-yellow-500',
      bgPattern: 'bg-[url("/patterns/tour-pattern.svg")]'
    },
    { 
      name: 'Rwanda Handball League', 
      logo: '/logos/handball.svg',
      color: 'bg-green-600',
      bgPattern: 'bg-[url("/patterns/handball-pattern.svg")]'
    },
    { 
      name: 'NPC', 
      logo: '/logos/npc.svg',
      color: 'bg-gray-500',
      bgPattern: 'bg-[url("/patterns/npc-pattern.svg")]'
    }
  ];

  const sportsEvents = [
    {
      title: 'BASKETBALL AFRICA LEAGUE 2024',
      subtitle: 'The biggest show in basketball is coming to Kigali',
      date: '04:22',
      image: '/events/bal.jpg',
      category: 'BASKETBALL AFRICA LEAGUE 2024'
    },
    {
      title: 'VETERANS CLUB WORLD CUP 2024',
      subtitle: '150 football legends live in Kigali',
      date: '04:22',
      image: '/events/vcwc.jpg',
      category: 'VETERANS CLUB WORLD CUP 2024'
    },
    {
      title: 'FIFA CONGRESS',
      subtitle: '73rd fifa congress',
      date: '04:22',
      image: '/events/fifa.jpg',
      category: 'FIFA CONGRESS'
    },
    {
      title: 'RWANDA SUMMER GOLF',
      subtitle: 'Falcon & Country club presents Rwanda summer golf',
      date: '04:22',
      image: '/events/golf.jpg',
      category: 'RWANDA SUMMER GOLF'
    },
    {
      title: 'WORLD TENNIS TOUR JUNIORS',
      subtitle: 'IPRC Kigali ecology club',
      date: '04:22',
      image: '/events/tennis.jpg',
      category: 'WORLD TENNIS TOUR JUNIORS'
    }
  ];

  // Add ref and scroll functions for leagues
  const leaguesContainerRef = React.useRef(null);

  const scrollLeagues = (direction) => {
    if (leaguesContainerRef.current) {
      const container = leaguesContainerRef.current;
      const scrollAmount = 300; // Adjust this value as needed
      const currentScroll = container.scrollLeft;
      
      container.scrollTo({
        left: currentScroll + (direction === 'right' ? scrollAmount : -scrollAmount),
        behavior: 'smooth'
      });
    }
  };

  // Update the sports data to use a single logo per sport
  const sports = [
    { 
      name: 'BASKETBALL', 
      logo: '/logos/basketball.svg',  // Single basketball logo for all divisions
      divisions: [
        { name: 'DIVISION I' },
        { name: 'DIVISION II' },
        { name: 'DIVISION III' },
        { name: 'DIVISION IV' }
      ]
    },
    { 
      name: 'FOOTBALL', 
      logo: '/logos/football.svg',    // Single football logo for all divisions
      divisions: [
        { name: 'PREMIER LEAGUE' },
        { name: 'SECOND DIVISION' },
        { name: 'WOMEN LEAGUE' }
      ]
    },
    { 
      name: 'VOLLEYBALL', 
      logo: '/logos/volleyball.svg',  // Single volleyball logo for all divisions
      divisions: [
        { name: 'DIVISION I' },
        { name: 'DIVISION II' },
        { name: 'BEACH VOLLEYBALL' }
      ]
    },
    { 
      name: 'HANDBALL', 
      logo: '/logos/handball.svg',    // Single handball logo for all divisions
      divisions: [
        { name: 'NATIONAL LEAGUE' },
        { name: 'SECOND DIVISION' }
      ]
    },
    { 
      name: 'CYCLING', 
      logo: '/logos/cycling.svg',     // Single cycling logo for all divisions
      divisions: [
        { name: 'PROFESSIONAL' },
        { name: 'AMATEUR' }
      ]
    }
  ];

  const matchResults = [
    {
      date: 'Friday - February 25',
      matches: [
        {
          team1: { 
            name: 'REG BBC', 
            logo: '/teams/reg.svg', 
            score: 95, 
            record: '22-9' 
          },
          team2: { 
            name: 'APR BBC', 
            logo: '/teams/apr.svg', 
            score: 92, 
            record: '22-9' 
          },
          status: 'Final'
        },
        {
          team1: { 
            name: 'APR BBC', 
            logo: '/teams/apr.svg', 
            score: 95, 
            record: '22-9' 
          },
          team2: { 
            name: 'PATRIOT BBC', 
            logo: '/teams/patriots.svg', 
            score: 92, 
            record: '22-9' 
          },
          status: 'Final'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow fixed top-0 w-full z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <img src="/logo/logo.svg" alt="MINISPORTS" className="h-12 w-auto" />
            
            <nav className="hidden md:flex space-x-10">
              {navigation.map((item) => (
                <button
                  key={item}
                  className={`px-6 py-2.5 rounded-lg text-base ${
                    activeTab === item 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(item)}
                >
                  {item}
                </button>
              ))}
            </nav>

            <Link
              to="/login"
              className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base"
            >
              LOGIN
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-24 pb-12">
        {/* Live Matches Section */}
        <div className="mb-16">
          <LiveMatches />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-12">
          {/* Left Content */}
          <div className="col-span-12 lg:col-span-8">
            {/* Leagues Section */}
            <section className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Leagues To Browse</h2>
                <Link 
                  to="/leagues" 
                  className="text-gray-500 hover:text-gray-600 flex items-center text-base"
                >
                  View all
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
              
              <div className="grid grid-cols-6 gap-6">
                {leagues.slice(0, 6).map((league, index) => (
                  <div 
                    key={index}
                    className={`aspect-square rounded-xl ${league.color} flex flex-col items-center justify-center p-4 cursor-pointer hover:opacity-90 transition-all transform hover:scale-105`}
                  >
                    <img 
                      src={league.logo} 
                      alt={league.name} 
                      className="h-16 w-16 mb-4" 
                    />
                    <span className="text-white text-center font-medium text-sm">
                      {league.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Sports Events Section */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Sports Event</h2>
                <Link 
                  to="/events" 
                  className="text-red-500 hover:text-red-600 flex items-center text-base"
                >
                  View all
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
              <div className="grid grid-cols-5 gap-6">
                {sportsEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg">
                      <img 
                        src={event.image} 
                        alt={event.title} 
                        className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-90"></div>
                      
                      {/* Time badge */}
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        {event.date}
                      </div>
                      
                      {/* Text content */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="text-xs mb-2">{event.category}</div>
                        <h3 className="font-bold mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-200">{event.subtitle}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar - Matches Section */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Matches</h2>
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 px-4 py-1 bg-blue-600 text-white rounded-full text-sm"
                    onClick={() => document.getElementById('sportsDropdown').classList.toggle('hidden')}
                  >
                    <span>{selectedSport}</span>
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                  
                  {/* Sports Dropdown */}
                  <div 
                    id="sportsDropdown"
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg hidden z-50"
                  >
                    {sports.map((sport) => (
                      <button
                        key={sport.name}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => {
                          setSelectedSport(sport.name);
                          document.getElementById('sportsDropdown').classList.add('hidden');
                        }}
                      >
                        {sport.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Division Icons */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {sports.find(sport => sport.name === selectedSport)?.divisions.map((division, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <img 
                      src={sports.find(sport => sport.name === selectedSport)?.logo}
                      alt={division.name}
                      className="w-12 h-12 mb-2"
                    />
                    <span className="text-xs text-center font-medium">{division.name}</span>
                  </div>
                ))}
              </div>

              {/* Match Results */}
              <div className="space-y-4">
                <div className="flex space-x-8 border-b">
                  <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-2">
                    Upcoming
                  </button>
                  <button className="text-sm font-medium text-gray-500 pb-2">
                    Past Matches
                  </button>
                </div>

                {matchResults.map((day, dayIndex) => (
                  <div key={dayIndex}>
                    <h3 className="text-sm text-gray-600 mb-4">{day.date}</h3>
                    <div className="space-y-4">
                      {day.matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                              <img src={match.team1.logo} alt={match.team1.name} className="w-8 h-8" />
                              <span className="text-sm font-medium">{match.team1.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold">{match.team1.score}</span>
                              <div className="text-xs text-gray-500">{match.team1.record}</div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <img src={match.team2.logo} alt={match.team2.name} className="w-8 h-8" />
                              <span className="text-sm font-medium">{match.team2.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold">{match.team2.score}</span>
                              <div className="text-xs text-gray-500">{match.team2.record}</div>
                            </div>
                          </div>
                          <div className="text-center mt-2 text-sm text-gray-600">
                            {match.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage; 