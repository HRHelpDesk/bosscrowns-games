import React, { createContext, useState } from 'react';

export const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const [user, setUser] = useState(null); // No login required, so user can be null
  const [isLoading, setIsLoading] = useState(false);

  return (
    <UserDataContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </UserDataContext.Provider>
  );
};