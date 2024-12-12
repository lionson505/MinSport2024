import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MapPin, Users, Clock, Tag, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import axiosInstance from '../../utils/axiosInstance';

const TourismCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

  // Transform events for FullCalendar
  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.name,
    start: `${event.startDate}T${event.timeFrom}`,
    end: `${event.endDate}T${event.timeTo}`,
    backgroundColor: 
      event.category === 0 ? '#3B82F6' :
      event.category === 1 ? '#10B981' :
      '#8B5CF6',
    borderColor: 
      event.category === 0 ? '#2563EB' :
      event.category === 1 ? '#059669' :
      '#7C3AED',
    textColor: '#FFFFFF',
    extendedProps: {
      ...event,
      category: event.category === 0 ? 'Sports Events' : 
                event.category === 1 ? 'Adventure Sports' : 
                'Other Events',
      location: {
        province: event.province,
        district: event.district,
        sector: event.sector,
        cell: event.cell,
        village: event.village
      },
      participants: {
        male: event.maleParticipants,
        female: event.femaleParticipants
      },
      fees: event.participantsFee,
      startTime: event.timeFrom,
      endTime: event.timeTo
    }
  }));

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
    setShowEventDetails(true);
  };

  const EventDetailsModal = () => (
    <Modal
      isOpen={showEventDetails}
      onClose={() => setShowEventDetails(false)}
      title="Event Details"
      size="lg"
    >
      {selectedEvent && (
        <div className="space-y-6">
          {/* Event Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold">{selectedEvent.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedEvent.category === 'Sports Events' ? 'bg-blue-100 text-blue-800' :
                selectedEvent.category === 'Adventure Sports' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {selectedEvent.category}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Tag className="h-4 w-4" />
              <span>{selectedEvent.subCategory}</span>
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Date & Time</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {format(new Date(selectedEvent.startDate), 'MMM d, yyyy')}
                    {selectedEvent.startDate !== selectedEvent.endDate && 
                      ` - ${format(new Date(selectedEvent.endDate), 'MMM d, yyyy')}`}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {`${selectedEvent.location.district}, ${selectedEvent.location.province}`}
                    <br />
                    {`${selectedEvent.location.sector}, ${selectedEvent.location.cell}, ${selectedEvent.location.village}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Participants</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Male: {selectedEvent.participants.male} | Female: {selectedEvent.participants.female}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Event Fees</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    RWF {parseInt(selectedEvent.fees).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedEvent.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEventDetails(false)}>
              Close
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              Register for Event
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          height="auto"
          aspectRatio={1.8}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          nowIndicator={true}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          eventDisplay="block"
          eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
          views={{
            dayGridMonth: {
              titleFormat: { year: 'numeric', month: 'long' }
            },
            timeGridWeek: {
              titleFormat: { year: 'numeric', month: 'long', day: '2-digit' }
            },
            timeGridDay: {
              titleFormat: { year: 'numeric', month: 'long', day: '2-digit' }
            }
          }}
        />
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal />
    </div>
  );
};

export default TourismCalendar; 