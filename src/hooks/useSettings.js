import { useState, useCallback } from 'react';

export const useSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => !prev);
  }, []);

  return {
    notificationsEnabled,
    toggleNotifications,
  };
};
