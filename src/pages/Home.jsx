import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import Swal from "sweetalert2";

const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
const host = window.location.hostname;
const socket = new WebSocket(`${protocol}://${host}/ws`);
// const socket = new WebSocket("ws://localhost:8080/ws");
//const socket = new WebSocket("wss://guardiansens.duckdns.org/ws");


socket.onopen = () => {
  const sensorTopic = localStorage.getItem("sensorTopic");
  if (sensorTopic) {
    socket.send(JSON.stringify({ tipo: "serie", valor: sensorTopic }));
  }
};


export default function Home() {
  const [data, setData] = useState(() => {
    const saved = sessionStorage.getItem("data");
    return saved ? JSON.parse(saved) : [];
  });

  const [filtroSensor, setFiltroSensor] = useState("Todos");
  const [messages, setMessages] = useState([]);
  const [lastValues, setLastValues] = useState({
    Temperatura: 0,
    Luz: 0,
    Movimiento: 0,
    Sonido: 0,
  });

  const unidades = {
    Temperatura: "°C",
    Luz: "lm",
    Movimiento: "m/s²",
    Sonido: "dB",
  };

  // ✅ Mapea nombres técnicos a nombres lógicos
  function traducirNombreSensor(nombre) {
    const mapa = {
      "GY-61": "Movimiento",
      "GY-302": "Luz",
      "DHT11": "Temperatura",
      "sonido": "Sonido",
      " sonido": "Sonido", // por si llega con espacio
    };
    return mapa[nombre.trim()] || nombre;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 text-black p-2 rounded shadow text-sm">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index}>
              {entry.name}: {entry.value} {unidades[entry.name] || ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const [eventos, setEventos] = useState(() => {
    const stored = sessionStorage.getItem("eventos");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const sensorNombre = traducirNombreSensor(msg.tittle);

      setLastValues((prev) => {
        const updated = {
          ...prev,
          [sensorNombre]: msg.description,
        };

        const nuevoDato = {
          time: new Date().toLocaleTimeString(),
          Temperatura: updated.Temperatura,
          Luz: updated.Luz,
          Movimiento: updated.Movimiento,
          Sonido: updated.Sonido,
        };

        setData((prev) => {
          const nuevos = [...prev.slice(-19), nuevoDato];
          sessionStorage.setItem("data", JSON.stringify(nuevos));
          return nuevos;
        });

        const nuevoEvento = {
          sensor: sensorNombre,
          valor: msg.description,
          hora: nuevoDato.time,
        };

        setEventos((prev) => {
          const actualizados = [...prev.slice(-49), nuevoEvento];
          sessionStorage.setItem("eventos", JSON.stringify(actualizados));
          return actualizados;
        });

        return updated;
      });

      // Toast
      const text = `${sensorNombre}: ${msg.description}`;
      setMessages((prev) => {
        if (prev[prev.length - 1] === text) return prev;
        const nuevos = [...prev.slice(-3), text];
        setTimeout(() => {
          setMessages((actuales) => actuales.filter((m) => m !== text));
        }, 3000);
        return nuevos;
      });
    };
  }, []);

  function getToastColor(msg) {
    if (msg.includes("Temperatura")) return "border-red-500";
    if (msg.includes("Movimiento")) return "border-green-500";
    if (msg.includes("Sonido")) return "border-blue-500";
    if (msg.includes("Luz")) return "border-yellow-400";
    return "border-gray-400";
  }

  function getToastBarColor(msg) {
    if (msg.includes("Temperatura")) return "bg-red-500";
    if (msg.includes("Movimiento")) return "bg-green-500";
    if (msg.includes("Sonido")) return "bg-blue-500";
    if (msg.includes("Luz")) return "bg-yellow-400";
    return "bg-gray-400";
  }

  function getToastLabel(msg) {
    if (msg.includes("Temperatura")) return "🌡️ Temperatura";
    if (msg.includes("Movimiento")) return "🏃‍♂️ Movimiento";
    if (msg.includes("Sonido")) return "🔊 Sonido";
    if (msg.includes("Luz")) return "💡 Luz";
    return "Sensor";
  }

  return (
    <div className="w-full p-6 text-white">
      {/* Toasts */}
      <div className="fixed top-32 right-4 space-y-4 z-40 w-80">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`relative p-4 rounded border shadow text-sm bg-white text-black border-l-4 ${getToastColor(m)} animate-fade-in-out`}
          >
            <div className="font-semibold mb-1">{getToastLabel(m)}</div>
            <div>
              {m.split(":")[0]}: {m.split(":")[1]} {unidades[m.split(":")[0]] || ""}
            </div>
            <div className={`absolute bottom-0 left-0 h-1 ${getToastBarColor(m)} toast-bar`} />
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-6">Welcome to GuardianSens</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Gráfica */}
        <div className="lg:w-1/2 w-full bg-[#1e2a47]/90 p-6 rounded-xl shadow-xl text-white h-[470px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Line type="monotone" dataKey="Temperatura" stroke="#f87171" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Luz" stroke="#facc15" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Movimiento" stroke="#34d399" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="Sonido" stroke="#60a5fa" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla */}
        <div className="lg:w-1/2 w-full bg-[#1e2a47]/90 p-6 rounded-xl shadow-xl text-white text-xl h-[470px] overflow-y-auto relative">
          <div className="sticky -top-6 bg-[#1e2a47] p-2 z-10 rounded">
            <h2 className="text-2xl font-semibold mb-2">Eventos Recientes</h2>
            <select
              value={filtroSensor}
              onChange={(e) => setFiltroSensor(e.target.value)}
              className="mb-2 p-2 rounded border text-black w-full"
            >
              <option value="Todos">🔄 Todos</option>
              <option value="Temperatura">🌡️ Temperatura</option>
              <option value="Luz">💡 Luz</option>
              <option value="Movimiento">🏃‍♂️ Movimiento</option>
              <option value="Sonido">🔊 Sonido</option>
            </select>
          </div>
          <table className="p-8 w-full text-sm text-white">
            <thead>
              <tr className="text-left border-b p-8 border-white/30">
                <th className="pb-1">Sensor</th>
                <th className="pb-1">Valor</th>
                <th className="pb-1">Hora</th>
              </tr>
            </thead>
            <tbody>
              {eventos
                .filter((e) => filtroSensor === "Todos" || e.sensor === filtroSensor)
                .slice(-15)
                .reverse()
                .map((e, i) => (
                  <tr key={i} className="border-b p-8 border-white/10">
                    <td className="py-1">{e.sensor}</td>
                    <td className="py-1">{e.valor} {unidades[e.sensor] || ""}</td>
                    <td className="py-1">{e.hora}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
