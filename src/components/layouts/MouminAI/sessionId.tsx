import { useState, useEffect } from 'react';

function useLocalStorage(key: string, defaultValue: string) {
  // Get stored value during initialization
  const getStoredValue = () => {
    try {
      if (typeof window === 'undefined') {
        return defaultValue;
      }
      
      const item = window.localStorage.getItem(key);
      if (item) {
        return item;
      }
      
      // If no value exists, store the default value
      window.localStorage.setItem(key, defaultValue);
      return defaultValue;
      
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return defaultValue;
    }
  };

  const [value, setValue] = useState(getStoredValue());

  const setStoredValue = (newValue: string) => {
    try {
      // Save to localStorage
      window.localStorage.setItem(key, newValue);
      // Save state
      setValue(newValue);
    } catch (error) {
      console.error('Error setting localStorage value:', error);
    }
  };

  return [value, setStoredValue] as const;
}

export default useLocalStorage;