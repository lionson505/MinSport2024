import { useState, useEffect } from 'react';
import { Calendar } from '../ui/calendar';
import axiosInstance from '../../utils/axiosInstance';

export function EventCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-events');
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    fetchEvents();
  }, []);

  const eventDates = events.reduce((acc, event) => {
    const date = new Date(event.startDate).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push({
      id: event.id,
      title: event.name,
      time: `${event.timeFrom} - ${event.timeTo}`,
      startDate: event.startDate,
      // Add any other event properties you need
    });
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        modifiers={{
          hasEvent: (date) => {
            const dateStr = date.toISOString().split('T')[0];
            return !!eventDates[dateStr];
          }
        }}
        modifiersStyles={{
          hasEvent: { 
            backgroundColor: '#EBF4FF',
            color: '#2563EB',
            fontWeight: 'bold'
          }
        }}
      />
      
      <div className="mt-4 space-y-2">
        {eventDates[selectedDate.toISOString().split('T')[0]]?.map(event => (
          <div
            key={event.id}
            className="p-2 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer"
            onClick={() => onEventClick(event)}
          >
            <p className="font-medium">{event.title}</p>
            <p className="text-sm text-gray-500">{event.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 