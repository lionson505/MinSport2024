import { useState, useEffect } from 'react';
import { sportsEventService } from '../services/sportsEventService';
import { Dialog } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

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
      status: 'UPCOMING'
    },
    // ... add more temporary events
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setEvents(tempEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents(tempEvents);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventResults = async (eventId) => {
    try {
      const results = await sportsEventService.getEventResults(eventId);
      setEventResults(results);
    } catch (error) {
      console.error('Error fetching event results:', error);
    }
  };

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    if (event.status === 'PAST') {
      await fetchEventResults(event.id);
    }
    setShowDialog(true);
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
      onClick={() => handleEventClick(event)}
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
          event.status === 'ONGOING' ? 'bg-red-500 text-white' :
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
          {format(new Date(event.startDate), 'HH:mm')}
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
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">{selectedEvent.title}</h2>
        <div className="mb-4">
          <img 
            src={selectedEvent.image} 
            alt={selectedEvent.title} 
            className="w-full rounded-lg"
          />
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Event Details</h3>
            <p className="text-gray-600">{selectedEvent.subtitle}</p>
          </div>
          
          <div className="flex gap-4">
            <div>
              <h4 className="font-medium text-gray-700">Start Date</h4>
              <p>{format(new Date(selectedEvent.startDate), 'PPP')}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">End Date</h4>
              <p>{format(new Date(selectedEvent.endDate), 'PPP')}</p>
            </div>
          </div>

          {selectedEvent.status === 'PAST' && eventResults && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Event Results</h3>
              {/* Render event results based on your data structure */}
              <div className="bg-gray-50 p-4 rounded-lg">
                {eventResults.summary}
              </div>
            </div>
          )}

          {selectedEvent.status === 'UPCOMING' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-700">
                This event hasn't started yet. Stay tuned for updates!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Sports Events</h1>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        {renderEventDetails()}
      </Dialog>
    </div>
  );
}

export default EventsPage; 