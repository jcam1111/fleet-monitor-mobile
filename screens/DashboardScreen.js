import * as signalR from "@microsoft/signalr";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { API_BASE_URL } from "../api/config";
import { AuthContext } from "../context/AuthContext"; // Asumiendo que tienes un AuthContext similar al web
import {
    getVehiclesFromDB,
    initDatabase,
    saveVehiclesToDB,
} from "../db/database";
import { registerForPushNotificationsAsync } from "../services/pushNotifications";

export default function DashboardScreen() {
  const { token, logout, isAdmin } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    initDatabase();
    if (isAdmin()) {
      registerForPushNotificationsAsync(token);
    }

    const fetchData = async () => {
      try {
        // Intenta obtener datos de la red
        const response = await axios.get(
          `${API_BASE_URL}/api/Vehicles/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setVehicles(response.data);
        saveVehiclesToDB(response.data); // Guarda en la DB local
      } catch (error) {
        // Si falla, carga desde la DB local
        console.log("Fallo al conectar, cargando desde caché local.");
        const cachedVehicles = await getVehiclesFromDB();
        setVehicles(cachedVehicles);
      }
    };

    fetchData();

    // Configuración de SignalR (similar a la web)
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/monitoringHub`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveLocationUpdate", (update) => {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleId === update.vehicleId ? { ...v, ...update } : v,
        ),
      );
    });

    connection.start();

    return () => connection.stop();
  }, [token]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 19.4326,
          longitude: -99.1332,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        <UrlTile urlTemplate="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=xxx_xxx_xxx" />
        {vehicles.map((v) => (
          <Marker
            key={v.vehicleId}
            coordinate={{ latitude: v.latitude, longitude: v.longitude }}
            title={v.licensePlate}
          />
        ))}
      </MapView>
      {/* Aquí podrías añadir un panel de alertas y un modal para los gráficos */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
});
