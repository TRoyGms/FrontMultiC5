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
import { Move } from "lucide-react";

const sensorName = "Movimiento";
const strokeColor = "#34d399";
const borderColor = "border-green-500";
const barColor = "bg-green-500";
const unidad = "m/s²";

// Tooltip personalizado
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 text-black p-2 rounded shadow text-sm">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index}>
            {entry.name}: {entry.value} {unidad}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function Movement() {
  const [data, setData] = useState(() => {
    const stored = sessionStorage.getItem("data");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((d) => ({
      time: d.time,
      valor: d[sensorName],
    }));
  });

  const [eventos, setEventos] = useState(() => {
    const stored = sessionStorage.getItem("eventos");
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed
      .filter((e) => e.sensor === sensorName)
      .map((e) => ({ valor: e.valor, hora: e.hora }));
  });

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.hostname;
    const socket = new WebSocket(`${protocol}://${host}/ws`);

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.tittle !== sensorName) return;

      const nuevo = {
        time: new Date(msg.created_at).toLocaleTimeString(),
        valor: msg.description,
      };

      setData((prev) => [...prev.slice(-19), nuevo]);
      setEventos((prev) => [
        ...prev.slice(-14),
        { valor: msg.description, hora: nuevo.time },
      ]);

      const toastMsg = `${sensorName}: ${msg.description}`;
      setMessages((prev) => {
        if (prev[prev.length - 1] === toastMsg) return prev;
        const nuevos = [...prev.slice(-3), toastMsg];
        setTimeout(() => {
          setMessages((actuales) => actuales.filter((m) => m !== toastMsg));
        }, 3000);
        return nuevos;
      });
    };

    return () => socket.close();
  }, []);

  return (
    <div className="p-6">
      {/* Toasts */}
      <div className="fixed top-24 right-4 space-y-4 z-45 w-80">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`relative p-4 rounded border shadow text-sm bg-white text-black border-l-4 ${borderColor} animate-fade-in-out`}
          >
            <div className="font-semibold mb-1">{sensorName}</div>
            <div>
              {m.split(":")[0]}: {m.split(":")[1]} {unidad}
            </div>
            <div className={`absolute bottom-0 left-0 h-1 ${barColor} toast-bar`} />
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-4 text-white">
        Sensor: {sensorName}
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Gráfica */}
        <div className="lg:w-1/2 text-white w-full bg-[#1e2a47]/70 backdrop-blur-md p-4 rounded-xl shadow-xl">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#fff" }} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={strokeColor}
                strokeWidth={4}
                dot={true}
                name="Movimiento"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla */}
        <div className="lg:w-1/2 w-full bg-[#1e2a47]/70 backdrop-blur-md p-4 rounded-xl shadow-xl max-h-[350px] overflow-y-auto relative">
          <div className="sticky -mt-2 px-2 -top-6 z-20 rounded-xl bg-[#1e2a47] py-2">
            <h2 className="font-semibold text-2xl text-white mb-2">Eventos Recientes</h2>
            <table className="w-full text-xl text-white">
              <thead className="sticky top-[3.5rem] bg-[#1e2a47] z-10">
                <tr className="text-left border-b border-white/40">
                  <th className="pb-1">Valor</th>
                  <th className="pb-1">Hora</th>
                </tr>
              </thead>
            </table>
          </div>

          <table className="w-full text-xl bg-[#1e2a47]/10 text-white">
            <tbody>
              {eventos.map((e, i) => (
                <tr key={i} className="border-b bg-[#1e2a47]/10 border-white/10">
                  <td className="py-1 px-10">{e.valor} {unidad}</td>
                  <td className="py-1 mr-28">{e.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
