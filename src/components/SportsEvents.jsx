import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function SportsEvents() {
  const events = [
    {
      id: 1,
      title: 'BASKETBALL AFRICA LEAGUE 2024',
      subtitle: 'The biggest show in basketball is coming to Kigali',
      image: '/events/bal.jpg',
      date: '2024',
      tag: 'NEW'
    },
    {
      id: 2,
      title: 'VETERANS CLUB WORLD CUP 2024',
      subtitle: '150 football legends live in Kigali',
      image: '/events/vcwc.jpg',
      date: '2024',
      tag: 'LIVE'
    },
    {
      id: 3,
      title: 'FIFA CONGRESS',
      subtitle: '73rd fifa congress',
      image: '/events/fifa.jpg',
      date: '2024'
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1B2559]">Sports Events</h2>
        <Link 
          to="/sports-events" 
          className="text-[#4318FF] flex items-center text-sm font-medium hover:opacity-80"
        >
          View all <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="space-y-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-[20px] overflow-hidden shadow-sm"
          >
            <div className="relative h-[200px]">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {event.tag && (
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                  event.tag === 'NEW' ? 'bg-[#05CD99] text-white' : 'bg-[#FF5B5B] text-white'
                }`}>
                  {event.tag}
                </span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#1B2559] mb-2">{event.title}</h3>
              <p className="text-[#A3AED0] text-sm mb-4">{event.subtitle}</p>
              <div className="text-sm text-[#A3AED0]">{event.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SportsEvents; 