import { useState, useEffect } from 'react';
import { sportsEventService } from '../../services/sportsEventService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { format } from 'date-fns';
import { Loader2, MapPin, Calendar, Clock, Trophy, ClipboardList, Radio } from 'lucide-react';
import PublicLayout from '../../components/layouts/PublicLayout';
import logo from "../../components/liveMatch/image.png";
import image1 from "../../components/liveMatch/a.jpg";
import image2 from "../../components/liveMatch/b.jpg";
import image3 from "../../components/liveMatch/c.jpg";
import image4 from "../../components/liveMatch/d.jpeg";
import image5 from "../../components/liveMatch/e.webp";
import axiosInstance from '../../utils/axiosInstance';
import federationImage from '../../components/liveMatch/federationImgFallBack.png';

function Federation() {
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // const [showDialog, setShowDialog] = useState(false);
  // const [activeTab, setActiveTab] = useState('all');
  const [eventResults, setEventResults] = useState(null);


  const backgroundImages = [image1, image2, image3, image4, image5];
  const [imageIndex, setImageIndex] = useState(0);
  const [federations, setFederations] = useState([]);
  const [error, setError] = useState(null);
  console.log("here is fetched federations: ", federations)


  useEffect(() => {
    const fetchFederations = async () => {
      try {

        const response = await axiosInstance.get('/federations');
        await setFederations(response.data);
      } catch (err) {
        setError('Error fetching federations');
        console.error('Error fetching federations:', err);

      }

    };

    fetchFederations();

  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  useEffect(() => {
    const interval = setInterval(() => {
      setImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length])

  const image = backgroundImages[imageIndex];
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns the date in YYYY-MM-DD format
  };
  // const events = federations.map((federation) => ({
  //   id: federation.id,
  //   title: federation.name,
  //   subtitle: federation.acronym || federation.address, // Provide meaningful fallback
  //   // image: federation.logo || federationImage , // Assuming this is the correct path for the image
  //   image: federationImage, // Assuming this is the correct path for the image
  //   startDate: formatDate(federation.createdAt),  // Use a relevant date field
  //   category: federation.name,                  // Placeholder (adjust based on data)
  // }));

  // console.log(events);


  // const filterEvents = (status) => {
  //   if (!Array.isArray(events)) return [];
  //   if (status === 'all') return events;
  //   return events.filter(event => event.status === status);
  // };

  // const renderEventCard = (event) => (
  // <div
  //   key={federation.id}
  //   className="relative group cursor-pointer"
  // >
  //   <div className="h-80 relative overflow-hidden rounded-lg bg-blue-400 flex justify-center transform transition-all duration-300 hover:shadow-xl hover:shadow-black hover:scale-105 hover:bg-blue-500 hover:shadow-lg hover:opacity-80">
  //     <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white mt-10">
  //       <img
  //         src={federation.image}
  //         alt={federation.title}
  //         className="w-full h-full object-cover"
  //       />
  //     </div>
  //     <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-90"></div>

  //     {/* Text content */}
  //     <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
  //       <div className="text-xs mb-2">{federation.title}</div>
  //       <h3 className="font-bold mb-1">{federation.subtitle}</h3>
  //       <p className="text-sm text-gray-200">{federation.startDate}</p>
  //     </div>
  //   </div>
  // </div>
  // );

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    return (
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold mb-1">{selectedEvent.title}</DialogTitle>
              <DialogDescription className="text-gray-500">
                {selectedEvent.category}
              </DialogDescription>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedEvent.status === 'LIVE' ? 'bg-red-500 text-white' :
              selectedEvent.status === 'UPCOMING' ? 'bg-green-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
              {selectedEvent.status}
            </span>
          </div>
        </DialogHeader> */}

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-lg font-medium">{selectedEvent.subtitle}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center text-gray-600 mb-3">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="font-medium">Date & Time</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Start</span>
                      <span className="text-sm font-medium">
                        {format(new Date(selectedEvent.startDate), 'PPP p')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">End</span>
                      <span className="text-sm font-medium">
                        {format(new Date(selectedEvent.endDate), 'PPP p')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-5 h-5 mr-2 text-red-600" />
                    <span className="font-medium">Location</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">BK Arena, Kigali</p>
                    <p className="text-sm text-gray-500">KG 200 St</p>
                  </div>
                </div>
              </div>

              {selectedEvent.status === 'PAST' && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                    Event Results
                  </h3>
                  <div className="space-y-4">
                    {eventResults ? (
                      <div className="text-gray-600">
                        {eventResults.summary}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center p-8 text-gray-500">
                        <div className="text-center">
                          <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">Results are being compiled...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedEvent.status === 'UPCOMING' && (
                <div className="bg-blue-50 rounded-xl p-5">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Upcoming Event</h3>
                      <p className="text-blue-700 text-sm">
                        This event hasn't started yet. Mark your calendar and stay tuned for updates!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.status === 'LIVE' && (
                <div className="bg-red-50 rounded-xl p-5">
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 rounded-lg p-2">
                      <Radio className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-900 mb-1 flex items-center">
                        Live Now
                        <span className="w-2 h-2 bg-red-500 rounded-full ml-2 animate-pulse" />
                      </h3>
                      <p className="text-red-700 text-sm">
                        This event is happening right now! Don't miss out on the action.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Event Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedEvent.subtitle}
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </PublicLayout>
    );
  }


  return (
    <>
      <div
        className="px-10"
        style={{
          backgroundImage: `url(${image})`, // Ensure the correct path to federation.png
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          position: "relative",
          // marginBottom: "2rem"
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
        <div className="flex" style={{ maxWidth: "100%", textAlign: "center", zIndex: 1 }}>
          <div className='w-full sm:w-4/5  text-start'>
            <h1 className='!text-4xl' style={{ fontWeight: "bold" }}>
              Welcome to Rwanda Sports Federations
            </h1>
            <p style={{ margin: "10px 0", maxWidth: "700px" }}>
              Explore all the sports federations in Rwanda, including FERWAFA,
              FERWABA, and many more. Stay updated on events, news, and achievements.
            </p>
          </div>
          <div className="hidden sm:flex justify-end w-1/6 w-60 h-60">
            <img src={logo} alt="rwandanLogo" className="w-full h-full" />
          </div>

        </div>
      </div>
      <PublicLayout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-12">FEDERATIONS</h1>

          <Tabs defaultValue="all" className="mb-8">
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {federations.map((federation) => (
                  < div
                    key={federation.id}
                    className="aspect-square m-4 border-2 rounded-xl bg-blue-500 flex flex-col items-center justify-between p-4 cursor-pointer hover:opacity-90 transition-all transform hover:scale-105"
                  >
                    {/* Logo */}
                    <img
                      src={federationImage || federation.logo}
                      alt={`${federation.name} logo`}
                      className="h-16 w-16 mb-4"
                    />

                    {/* Federation Name and Acronym */}
                    <div className="text-center">
                      <h2 className="text-white font-bold text-lg">{federation.name}</h2>
                      {federation.acronym && (
                        <span className="text-white text-sm">({federation.acronym})</span>
                      )}
                    </div>

                    {/* Optional Information */}
                    <p className="text-white text-xs mt-2">
                      Representative: {federation.legalRepresentativeName || "N/A"}
                    </p>

                    {/* Year Founded and Website */}
                    <div className="flex justify-between items-center w-full mt-4 text-xs text-white">
                      <span>Founded: {federation.yearFounded || "N/A"}</span>
                      <a
                        href={federation.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Website
                      </a>
                    </div>
                  </div>
                ))}
                {/* // acronym
                  // address
                  // createdAt
                  // id
                  // legalRepresentativeEmail
                  // legalRepresentativeGender
                  // legalRepresentativeName
                  // legalRepresentativePhone
                  // loginEmail
                  // loginPassword
                  // logo
                  // name
                  // updatedAt
                  // website
                  // yearFounded */}


                {/* {filterEvents('all').map(renderEventCard)} */}
                {/* Logo */}

                {/* {federations.map((federation) => 
                <div key={federation.id}>
                  <img
                  src={federation.logo}
                  alt={`${federation.name} logo`}
                  className="h-16 w-16 mb-4"
                />

                {/* Federation Name and Acronym */}
                {/* <div className="text-center">
                  <h2 className="text-white font-bold text-lg">{federation.name}</h2>
                  {federation.acronym && (
                    <span className="text-white text-sm">({federation.acronym})</span>
                  )}
                </div>

                {/* Optional Information 
                <p className="text-white text-xs mt-2">
                  Representative: {federation.legalRepresentativeName || "N/A"}
                </p>

                {/* Year Founded and Website 
                <div className="flex justify-between items-center w-full mt-4 text-xs text-white">
                  <span>Founded: {federation.yearFounded || "N/A"}</span>
                  <a
                    href={federation.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Website
                  </a>
                </div>
                </div>
                ) */}
                {/* } */}

              </div>
            </TabsContent>
          </Tabs>

          <Dialog
            open={!!selectedEvent}
            onOpenChange={(open) => !open && setSelectedEvent(null)}
          >
            {renderEventDetails()}
          </Dialog>
        </div>
      </PublicLayout >
    </>
  );

}

export default Federation; 