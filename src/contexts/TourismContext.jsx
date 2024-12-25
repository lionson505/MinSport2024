import React, { createContext, useContext, useState } from 'react';

const TourismContext = createContext();

const TOURISM_CATEGORIES = {
  "Sports Events": {
    subCategories: ["Tournaments", "Championships", "Marathons", "Exhibitions"],
    levels: ["International", "National", "Regional"]
  },
  "Adventure Sports": {
    subCategories: ["Hiking", "Mountain Biking", "Rock Climbing", "Water Sports"],
    levels: ["Professional", "Amateur", "Recreational"]
  },
  "Cultural Sports": {
    subCategories: ["Traditional Games", "Cultural Festivals", "Community Events"],
    levels: ["National", "Community", "Exhibition"]
  }
};

export const TourismProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(TOURISM_CATEGORIES);

  const addEvent = (event) => {
    setEvents(prev => [...prev, { ...event, id: Date.now() }]);
  };

  const updateEvent = (id, data) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...data } : event
    ));
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const updateCategories = (newCategories) => {
    setCategories(newCategories);
  };

  const value = {
    events,
    categories,
    addEvent,
    updateEvent,
    deleteEvent,
    updateCategories,
  };

  return (
    <TourismContext.Provider value={value}>
      {children}
    </TourismContext.Provider>
  );
};

export const useTourism = () => {
  const context = useContext(TourismContext);
  if (!context) {
    throw new Error('useTourism must be used within a TourismProvider');
  }
  return context;
}; 