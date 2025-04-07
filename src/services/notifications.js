import { messaging, getToken, onMessage } from "../infrastruture/firebase/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;


const backendUrl = 'https://guardiansensfcm.duckdns.org';
const topic = localStorage.getItem("sensorTopic");

function showNotificationButton() {
  Notification.requestPermission()
    .then(async (permission) => {
      if (permission === 'granted') {
        try {
          const token = await getToken(messaging, {
            vapidKey: 'BE_jQIwsH6tcbrpUexwsWDYfJSknW_S5_7ryOExehA0ddeKw2DAKsmr6mCGl6iZwf8X11X6IiH9jmHh6LwqWHZM',
          });

          if (token) {
            console.log('Token recibido:', token);
            const topic = localStorage.getItem("sensorTopic"); // Define aquí el topic dinámicamente
            subscribeToBackend(token, topic);
          }
        } catch (err) {
          console.error('Error obteniendo token de FCM:', err);
        }
      }
    })
   .catch((error) => console.error('Error solicitando permisos:', error));
}

function subscribeToBackend(token, topic) {
  fetch(`${backendUrl}/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, topic }),
  })
    .then((res) => res.json())
    .then((data) => {
    console.log(data.message);
    })
    .catch((err) => {
    console.error('🚨 Error en la suscripción:', err);
    });
}


export const requestPermissionAndGetToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
    console.warn("Notificaciones denegadas");
      return;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    //console.log("✅ Token FCM:", token);
    subscribeToBackend(token, topic);

    return token;
  } catch (err) {
    console.error("❌ Error al obtener el token:", err);
  }
};

export const listenToForegroundMessages = (callback) => {
  onMessage(messaging, (payload) => {
    //console.log("📨 Mensaje recibido en primer plano:", payload);
    callback(payload);
  });
};
