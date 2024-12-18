import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { DarkModeProvider } from './contexts/DarkModeContext'
import { Calendar } from './components/ui/calendar'
import axiosInstance from '../src/utils/axiosInstance'

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-events');
        // Transform API data to match Calendar component format
        const transformedEvents = response.data.map(event => ({
          date: event.startDate,
          title: event.name
        }));
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <DarkModeProvider>
      <div>
        <Calendar events={events} />
      </div>
    </DarkModeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
) 