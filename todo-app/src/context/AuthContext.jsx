import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthState({ isAuthenticated: true, user: { token } });
    }
  }, []);

  const login = (user) => {
    localStorage.setItem("token", user.token);
    setAuthState({ isAuthenticated: true, user });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({ isAuthenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
