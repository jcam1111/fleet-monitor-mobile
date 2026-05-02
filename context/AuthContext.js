// context/AuthContext.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { createContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../api/config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Para manejar la carga inicial del token

  useEffect(() => {
    // Al iniciar la app, intenta cargar el token desde el almacenamiento local
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error("Failed to load auth token.", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (username, password) => {
    const response = await axios.post(`${API_BASE_URL}/api/Auth/login`, {
      username,
      password,
    });
    const newToken = response.data.token;
    setToken(newToken);
    await AsyncStorage.setItem("authToken", newToken);
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem("authToken");
  };

  const getUser = () => {
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("Token inválido", error);
      logout();
      return null;
    }
  };

  const isAdmin = () => {
    const user = getUser();
    return user?.role === "Admin";
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
