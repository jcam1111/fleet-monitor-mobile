// import * as SQLite from "expo-sqlite";
import { openDatabase } from "expo-sqlite";

// const db = SQLite.openDatabase("fleet_monitor.db");

// CORRECCIÓN: openDatabase es ahora la exportación por defecto.
// La manera correcta de accederla es a través de SQLite.openDatabase()
// o importando directamente { openDatabase } si fuera una exportación nombrada.
// Para este caso, la sintaxis correcta es la siguiente.
// const db = SQLite.openDatabase("fleet_monitor.db");

// CORRECCIÓN DEFINITIVA: Importamos 'openDatabase' directamente como una exportación nombrada.
// Ya no necesitamos el "namespace" 'SQLite'.
const db = openDatabase("fleet_monitor.db");

export const initDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS vehicles (
                vehicleId INTEGER PRIMARY KEY NOT NULL,
                deviceId TEXT NOT NULL,
                licensePlate TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                speedKmh INTEGER
            );`,
    );
  });
};

export const saveVehiclesToDB = (vehicles) => {
  db.transaction((tx) => {
    // Limpiar la tabla antes de insertar nuevos datos para evitar duplicados
    tx.executeSql("DELETE FROM vehicles;");
    vehicles.forEach((v) => {
      tx.executeSql(
        "INSERT INTO vehicles (vehicleId, deviceId, licensePlate, latitude, longitude, speedKmh) VALUES (?, ?, ?, ?, ?, ?);",
        [
          v.vehicleId,
          v.deviceId,
          v.licensePlate,
          v.latitude,
          v.longitude,
          v.speedKmh,
        ],
      );
    });
  });
};

export const getVehiclesFromDB = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM vehicles;",
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => {
          reject(error);
          return false; // para evitar error de tipo
        },
      );
    });
  });
};
