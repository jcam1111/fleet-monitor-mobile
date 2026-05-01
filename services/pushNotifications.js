import axios from "axios";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { API_BASE_URL } from "../api/config"; // Tu archivo de configuración de API

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(authToken) {
  let token;
  if (!Device.isDevice) {
    alert("Debes usar un dispositivo físico para las notificaciones push.");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    alert("No se pudo obtener el token para las notificaciones push.");
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;

  // Enviar el token a tu backend para guardarlo
  try {
    await axios.post(
      `${API_BASE_URL}/api/Users/register-push-token`,
      JSON.stringify(token),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  } catch (error) {
    console.error("Error al registrar el token de notificación:", error);
  }

  return token;
}
