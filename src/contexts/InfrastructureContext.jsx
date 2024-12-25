import React, { createContext, useContext, useState } from 'react';

const InfrastructureContext = createContext();

const INFRASTRUCTURE_CATEGORIES = {
  "Stadium": {
    subCategories: ["National Stadium", "Regional Stadium", "District Stadium"],
    levels: ["International", "National", "Regional"]
  },
  "Sports Complex": {
    subCategories: ["Multi-purpose", "Training Center", "Youth Center"],
    levels: ["Professional", "Amateur", "Training"]
  },
  "Court": {
    subCategories: ["Basketball", "Volleyball", "Tennis"],
    levels: ["Competition", "Practice", "Recreational"]
  },
  "Field": {
    subCategories: ["Football", "Rugby", "Athletics"],
    levels: ["Professional", "Standard", "Basic"]
  }
};

export const InfrastructureProvider = ({ children }) => {
  const [infrastructures, setInfrastructures] = useState([]);
  const [categories, setCategories] = useState(INFRASTRUCTURE_CATEGORIES);

  const updateCategories = (newCategories) => {
    setCategories(newCategories);
  };

  const addInfrastructure = (infrastructure) => {
    setInfrastructures(prev => [...prev, { ...infrastructure, id: Date.now() }]);
  };

  const updateInfrastructure = (id, data) => {
    setInfrastructures(prev => 
      prev.map(infra => infra.id === id ? { ...infra, ...data } : infra)
    );
  };

  const deleteInfrastructure = (id) => {
    setInfrastructures(prev => prev.filter(infra => infra.id !== id));
  };

  const value = {
    infrastructures,
    categories,
    addInfrastructure,
    updateInfrastructure,
    deleteInfrastructure,
    updateCategories,
  };

  return (
    <InfrastructureContext.Provider value={value}>
      {children}
    </InfrastructureContext.Provider>
  );
};

export const useInfrastructure = () => {
  const context = useContext(InfrastructureContext);
  if (!context) {
    throw new Error('useInfrastructure must be used within an InfrastructureProvider');
  }
  return context;
}; 