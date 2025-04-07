import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { SensorProvider } from './context/SensorContext';

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js")
  .then((reg) => console.log("✅ SW registrado", reg))
  .catch((err) => console.error("❌ Error SW", err));
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SensorProvider>
      <App />
    </SensorProvider>
  </React.StrictMode>,
);
