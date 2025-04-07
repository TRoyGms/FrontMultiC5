import { createContext, useState, useEffect } from "react";

export const SensorContext = createContext();

export function SensorProvider({ children }) {
  const [data, setData] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [lastValues, setLastValues] = useState({
    Temperatura: 0,
    Luz: 0,
    Movimiento: 0,
    Sonido: 0,
  });

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname;
    //const socket = new WebSocket(`${protocol}://${host}/ws`);
    //const socket = new WebSocket("wss://guardiansens.duckdns.org/ws");
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const t = msg.tittle;

      const nuevo = {
        time: new Date(msg.created_at).toLocaleTimeString(),
        Temperatura: t === "Temperatura" ? msg.description : lastValues.Temperatura,
        Luz: t === "Luz" ? msg.description : lastValues.Luz,
        Movimiento: t === "Movimiento" ? msg.description : lastValues.Movimiento,
        Sonido: t === "Sonido" ? msg.description : lastValues.Sonido,
      };

      setLastValues(nuevo);
      setData((prev) => [...prev.slice(-20), nuevo]);

      const evento = {
        sensor: t,
        valor: msg.description,
        hora: nuevo.time,
      };
      setEventos((prev) => [...prev.slice(-49), evento]);
    };

    return () => socket.close();
  }, [lastValues]);

  return (
    <SensorContext.Provider value={{ data, eventos, lastValues }}>
      {children}
    </SensorContext.Provider>
  );
}
