import React from 'react';

const LocationValidator = ({ city, onValidLocation, onInvalidLocation }) => {
  const validCities = {
    'Andhra Pradesh': [
      'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Kadapa',
      'Tirupati', 'Kakinada', 'Rajahmundry', 'Anantapur', 'Eluru', 'Machilipatnam'
    ],
    'Telangana': [
      'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam',
      'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet'
    ]
  };

  const validateLocation = (cityName) => {
    const normalizedCity = cityName.trim().toLowerCase();
    
    for (const state in validCities) {
      if (validCities[state].some(city => city.toLowerCase() === normalizedCity)) {
        return true;
      }
    }
    return false;
  };

  React.useEffect(() => {
    if (city) {
      if (validateLocation(city)) {
        onValidLocation(city);
      } else {
        onInvalidLocation();
      }
    }
  }, [city, onValidLocation, onInvalidLocation]);

  return null;
};

export default LocationValidator; 