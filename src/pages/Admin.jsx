import { useState } from "react";
import Swal from "sweetalert2";
import { LogOut } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Admin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    id_esp32: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(`${API_URL}/admin/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        Swal.fire("Error", errorData.error || "Error interno del servidor", "error");
        return;
      }
  
      const data = await res.json();
      Swal.fire("Éxito", data.message, "success");
      setFormData({ username: "", password: "", id_esp32: "" });
    } catch (err) {
      Swal.fire("Error de conexión", "No se pudo contactar al servidor", "error");
    }
  };
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-cyan-600 relative">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-4 bg-white/10 backdrop-blur-md gap-2">
        <div className="flex items-center gap-2">
          <img src="/WEBICON-NoBG.png" alt="Logo" className="h-12 sm:h-20" />
          <h1 className="text-white font-bold text-2xl sm:text-4xl">GuardianSens</h1>
        </div>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="flex items-center gap-2 text-white bg-red-500 hover:bg-red-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      {/* FORMULARIO */}
      <div className="flex justify-center items-center mt-16 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white/20 backdrop-blur-lg p-8 rounded-xl shadow-xl w-full max-w-2xl text-white space-y-4"
        >
          <h2 className="text-2xl font-bold text-center mb-4">Vincular Usuario</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="username"
              placeholder="Usuario"
              value={formData.username}
              onChange={handleChange}
              className="p-2 rounded bg-white/10 border placeholder-white/80 border-white/30 focus:outline-none"
              required
            />
            <input
              name="password"
              type="text"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              className="p-2 rounded bg-white/10 border placeholder-white/80 border-white/30 focus:outline-none"
              required
            />
            <input
              name="id_esp32"
              placeholder="ID del Dispositivo"
              value={formData.id_esp32}
              onChange={handleChange}
              className="p-2 rounded bg-white/10 border placeholder-white/80 border-white/30 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 p-2 rounded text-white font-semibold"
          >
            Vincular
          </button>
        </form>
      </div>
    </div>
  );
}
