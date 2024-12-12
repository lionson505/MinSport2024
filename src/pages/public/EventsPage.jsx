import { useState, useEffect } from 'react';
import HeaderTwo from '../../components/headerTwo';
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

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [eventResults, setEventResults] = useState(null);

  const tempEvents = [
    {
      id: 1,
      title: 'BASKETBALL AFRICA LEAGUE 2024',
      subtitle: 'The biggest show in basketball is coming to Kigali',
      image: '/events/bal.jpg',
      startDate: '2024-03-25T10:00:00',
      endDate: '2024-04-10T18:00:00',
      category: 'BASKETBALL AFRICA LEAGUE 2024',
      status: 'UPCOMING',
      time: '04:22'
    },
    {
      id: 2,
      title: 'VETERANS CLUB WORLD CUP 2024',
      subtitle: '150 football legends live in Kigali',
      image: '/events/vcwc.jpg',
      startDate: '2024-03-15T14:00:00',
      endDate: '2024-03-20T22:00:00',
      category: 'VETERANS CLUB WORLD CUP 2024',
      status: 'LIVE',
      time: '04:22'
    },
    {
      id: 3,
      title: 'FIFA CONGRESS',
      subtitle: '73rd fifa congress',
      image: '/events/fifa.jpg',
      startDate: '2024-05-17T09:00:00',
      endDate: '2024-05-17T17:00:00',
      category: 'FIFA CONGRESS',
      status: 'UPCOMING',
      time: '04:22'
    },
    {
      id: 4,
      title: 'RWANDA SUMMER GOLF',
      subtitle: 'Falcon & Country club presents Rwanda summer golf',
      image: '/events/golf.jpg',
      startDate: '2024-06-01T09:00:00',
      endDate: '2024-06-03T17:00:00',
      category: 'RWANDA SUMMER GOLF',
      status: 'UPCOMING',
      time: '04:22'
    },
    {
      id: 5,
      title: 'WORLD TENNIS TOUR JUNIORS',
      subtitle: 'IPRC Kigali ecology club',
      image: '/events/tennis.jpg',
      startDate: '2024-04-22T09:00:00',
      endDate: '2024-04-24T17:00:00',
      category: 'WORLD TENNIS TOUR JUNIORS',
      status: 'PAST',
      time: '04:22'
    }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // const data = await sportsEventService.getAllEvents();
      setEvents(tempEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents(tempEvents);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (status) => {
    if (!Array.isArray(events)) return [];
    if (status === 'all') return events;
    return events.filter(event => event.status === status);
  };

  const renderEventCard = (event) => (
    <div 
      key={event.id} 
      className="relative group cursor-pointer"
      onClick={() => setSelectedEvent(event)}
    >
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-90"></div>
        
        {/* Status badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
          event.status === 'LIVE' ? 'bg-red-500 text-white' :
          event.status === 'UPCOMING' ? 'bg-green-500 text-white' :
          'bg-gray-500 text-white'
        }`}>
          {event.status}
        </div>
        
        {/* Time badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center">
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {event.time}
        </div>
        
        {/* Text content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="text-xs mb-2">{event.category}</div>
          <h3 className="font-bold mb-1">{event.title}</h3>
          <p className="text-sm text-gray-200">{event.subtitle}</p>
        </div>
      </div>
    </div>
  );

  const renderEventDetails = () => {
    if (!selectedEvent) return null;

    return (
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold mb-1">{selectedEvent.title}</DialogTitle>
              <DialogDescription className="text-gray-500">
                {selectedEvent.category}
              </DialogDescription>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              selectedEvent.status === 'LIVE' ? 'bg-red-500 text-white' :
              selectedEvent.status === 'UPCOMING' ? 'bg-green-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {selectedEvent.status}
            </span>
          </div>
        </DialogHeader>
        
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
    <PublicLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Sports Events</h1>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="all" onClick={() => setActiveTab('all')}>
              All Events
            </TabsTrigger>
            <TabsTrigger value="live" onClick={() => setActiveTab('LIVE')}>
              Live
            </TabsTrigger>
            <TabsTrigger value="upcoming" onClick={() => setActiveTab('UPCOMING')}>
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" onClick={() => setActiveTab('PAST')}>
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterEvents('all').map(renderEventCard)}
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterEvents('LIVE').map(renderEventCard)}
            </div>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterEvents('UPCOMING').map(renderEventCard)}
            </div>
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filterEvents('PAST').map(renderEventCard)}
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
    </PublicLayout>
  );
}

export default EventsPage; 