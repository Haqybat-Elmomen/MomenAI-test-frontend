import { useState, useEffect } from 'react';

function useLocalStorage(key: string, initialValue: string) {
  // Initialize state from localStorage (if available)
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        return item ? item : initialValue;
      } catch (error) {
        console.error('Error accessing localStorage during initialization', error);
        return initialValue;
      }
    } else {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          setStoredValue(item);
        }
      } catch (error) {
        console.error('Error reading from localStorage', error);
      }
    }
  }, [key]);

  const setValue = (value: string) => {
    setStoredValue(value);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Error saving to localStorage', error);
      }
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
