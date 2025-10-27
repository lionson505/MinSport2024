
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import LiveMatches from '../../components/LiveMatches.jsx';
import HeaderTwo from '../../components/headerTwo.jsx';
import MyMap from './MyMap.jsx';
import { Pagination, Autoplay, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import axiosInstance from '../../utils/axiosInstance.js';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import federationImage from '../../components/liveMatch/federationImgFallBack.png';
import eventImage from '../../components/liveMatch/eventFallbackImg.jpeg';
import PublicLayout from '../../components/layouts/PublicLayout.jsx';
import { toast } from 'react-hot-toast';

// Utility function to strip HTML tags
const stripHtmlTags = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

function LandingPage() {
  const [federations, setFederations] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)

  // fetch federation 
  useEffect(() => {
    const fetchFederations = async () => {
      try {

        const response = await axiosInstance.get('/federations');
        await setFederations(response.data);
        console.log("fetching federation in landing Page succeed : ", federations);
      } catch (err) {
        setError('Error fetching federations');
        console.error('Error fetching federations:', err);

      }
    };

    fetchFederations();

  }, []);

  // Listen to screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedSport, setSelectedSport] = useState('BASKETBALL');
  const colors = [
    "bg-[#041779]",
    "bg-[#32a8dd]",
    "bg-[#32174c]",
    "bg-[#44ab40]",
    "bg-[#041779]",
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-events');
        setEvents(response.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events');
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-categories');
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      }
    };

    fetchEvents();
    fetchCategories();
  }, []);

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

    <div className="min-h-screen bg-gray-50   border-red-400">
      {/* Header */}
      <HeaderTwo />
      <PublicLayout>

        <main className="container mx-auto px-6 pt-8 pb-12">
          {/* Live Matches Section */}
          <div className="mb-16">
            <Link
              to="/match"
              className="text-gray-500 hover:text-gray-600 flex items-center text-base justify-end"
            >
              Explore Matches
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
            <LiveMatches />
          </div>

          {/* Main Content Grid */}
          <div className="flex gap-12 border-black">
            {/* Left Content */}
            {/* lg:col-span-3 xl:col-span-2  */}
            <div className=" border-green-400 w-full">
              <div className="flex flex-col md:flex-row space-x-4">
                {/* Leagues Section */}
                <div className="w-full md:w-3/4">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="lg:text-3xl md:text-2xl text-lg font-bold">Federations To Browse</h2>
                    <Link
                      to="/federation"
                      className="text-gray-500 hover:text-gray-600 flex items-center text-base"
                    >
                      View Federations
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Link>
                  </div>

                  {isMobile ? (
                    <Swiper
                      modules={[Pagination, Autoplay, A11y]}
                      spaceBetween={0} // Ensure no gap between slides for small devices
                      slidesPerView={1}
                      centeredSlides={true} // Center the active slide
                      pagination={{ clickable: true }}
                      // loop={true}
                      // autoplay={{
                      //   delay: 1000,
                      //   disableOnInteraction: false,
                      // }}
                      className="pb-10 px-6 py-4 w-full"
                      breakpoints={{
                        360: {
                          slidesPerView: 1,
                          spaceBetween: 0, // No space for small devices
                          centeredSlides: true, // Ensure centering is respected
                        },
                        640: {
                          slidesPerView: 2,
                          spaceBetween: 20,
                        },
                        768: {
                          slidesPerView: 3,
                          spaceBetween: 30,
                        },
                      }}
                    >
                      {federations.map((federation, index) => {
                        const color = colors[index % colors.length];

                        return (
                          <SwiperSlide
                            key={federation.id}
                            className={`aspect-square m-4 rounded-xl !w-[250px] !md:w-[280px] ${color} flex flex-col items-center justify-center p-4 cursor-pointer hover:opacity-90 transition-all transform hover:scale-105`}
                          >
                            <img
                              src={`${axiosInstance.defaults.baseURL}${federation.logo}` || federationImage}
                              alt={federation.name}
                              className="h-16 w-16 mb-4 rounded-full"
                            />
                            <span className="text-white text-center font-medium text-sm">
                              {federation.name}
                            </span>
                          </SwiperSlide>
                        )
                      })}
                    </Swiper>

                  ) : (
                    <div className="md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 w-full">
                      {federations.map((federation, index) => {
                        const color = colors[index % colors.length];
                        return (
                          <div
                            key={federation.id}
                            className={`aspect-square my-2 rounded-xl w-[175px] lg:w-[265px] xl:w-[230px] 2xl:w-[275px] ${color} flex flex-col items-center justify-center p-4 cursor-pointer hover:opacity-90 transition-all transform hover:scale-105`}
                          >                      <img src={`${axiosInstance.defaults.baseURL}${federation.logo}`} alt="federation Logo" className="w-12 h-12 object-cover rounded-full" />
                            {/* {console.log(`Logo Path: ${axiosInstance.defaults.baseURL}${federation.logo}`)} Log the logo path */}

                            <span className="text-white text-center font-medium text-sm">
                              {federation.name}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                {/* Right Sidebar - Matches Section */}
                <div className="bg-white rounded-xl p-8 shadow-md w-full md:w-1/2">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="lg:text-3xl md:text-2xl text-lg font-bold">Matches</h2>
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

              {/* Sports Events Section */}
              <section className='px-2 py-8'>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="lg:text-3xl md:text-2xl text-lg font-bold">Sports Event</h2>
                  <Link
                    to="/events"
                    className="text-red-500 hover:text-red-600 flex items-center text-base"
                  >
                    See Events
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
                <Swiper
                  // Install Swiper modules
                  modules={[Pagination, Autoplay, A11y]}
                  spaceBetween={50} // Default for larger devices
                  slidesPerView={4} // Default for larger devices
                  pagination={{ clickable: true }}
                  loop={true}
                  autoplay={{
                    delay: 2000, // Delay between transitions in milliseconds
                    disableOnInteraction: false, // Continue autoplay after user interaction
                  }}
                  className="pb-10 px-6 py-4 w-full"
                  breakpoints={{
                    360: { // xs: Extra small devices
                      slidesPerView: 1, // Show 1 slide for small phones
                      spaceBetween: 10, // Minimal spacing
                    },
                    640: { // sm: Small devices
                      slidesPerView: 2, // Show 2 slides for small devices
                      spaceBetween: 20, // Increase spacing for readability
                    },
                    768: { // md: Medium devices (tablets)
                      slidesPerView: 3, // Show 3 slides for tablets
                      spaceBetween: 30, // Balanced spacing
                    },
                    1024: { // lg: Large devices (desktops)
                      slidesPerView: 4, // Default 4 slides
                      spaceBetween: 40, // Wider spacing for desktops
                    },
                    1280: { // xl: Extra-large devices
                      slidesPerView: 5, // Add an extra slide for large desktops
                      spaceBetween: 50, // Spacious layout for larger screens
                    },
                    1440: { // 2xl: 2X large devices
                      slidesPerView: 6, // Maximize content display
                      spaceBetween: 60, // Generous spacing
                    },
                    1920: { // 3xl: Ultra-wide screens
                      slidesPerView: 7, // Showcase more slides on ultra-wide
                      spaceBetween: 70, // Maximize spacing
                    },
                  }}
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* {sportsEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="relative group cursor-pointer"> */}
                    {events.map((event) => {
                      const date = new Date(event.startDate); // Create a Date object
                      const formattedDate = date.toISOString().split('T')[0]; // Extract date (YYYY-MM-DD)
                      const formattedTime = date.toTimeString().slice(0, 5); // Extract time (HH:mm)

                      return (
                        <SwiperSlide
                          key={event.id}
                          className="relative group cursor-pointer"
                        >
                          <div className="relative overflow-hidden rounded-lg md:w-[210px] lg:w-[225px] xl:w-[230px] 2xl:w-[205px]">

                            {console.log(event.banner)}
                            <img
                              src={`${axiosInstance.defaults.baseURL}${event.banner}`}
                              alt={event.name}
                              className="w-full aspect-[3/4] object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-90"></div>

                            {/* Time badge */}
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center">
                              <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                              </svg>
                              {formattedTime}
                            </div>

                            {/* Text content */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              <div className="text-xs mb-2">{categories.find(cat => cat.id === event.categoryId)?.name || 'Unknown Category'}</div>
                              <h3 className="font-bold mb-1">{event.name}</h3>
                              <p className="text-sm text-gray-200">{stripHtmlTags(event.description)}</p>
                            </div>
                          </div>
                        </SwiperSlide>
                        // </div>
                      )
                    })}
                  </div>
                </Swiper>
              </section>

              <section className="mb-16">
                <MyMap />
              </section>

            </div>

          </div >

        </main >
      </PublicLayout>
    </div >

  );
}

export default LandingPage; 