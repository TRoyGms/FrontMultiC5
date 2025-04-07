import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { requestPermissionAndGetToken } from "../services/notifications";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const showAlert = (title, text, icon = "error") => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: "#3085d6",
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isRegistering ? "users" : "verify";
      const body = isRegistering
        ? { username, password, tipo: "user" }
        : { username, password };

      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      // Soporte para "Authorization" y "authorization"
      let token = null;
      const authHeader =
        res.headers.get("Authorization") || res.headers.get("authorization");

      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      const data = await res.json(); // leer el body después de obtener el header

      if (res.ok) {
        if (isRegistering) {
          Swal.fire({
            title: "¡Registro exitoso!",
            text: "Tu cuenta ha sido creada con éxito",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            background: "#f0fdf4",
            color: "#0f5132",
          });
          setIsRegistering(false);
          setUsername("");
          setPassword("");
        } else if (token && data.tipo && data.id_esp32) {
          // Guardar token y datos del usuario
          localStorage.setItem("token", token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              role: data.tipo,
              username,
              id_esp32: data.id_esp32,
            })
          );
          
          // Guardar el topic (id_esp32) y suscribirse
          localStorage.setItem("sensorTopic", data.id_esp32);
          await requestPermissionAndGetToken();

          Swal.fire({
            title: "¡Bienvenido!",
            text: "Inicio de sesión correcto",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            background: "#f0fdf4",
            color: "#0f5132",
          });

          setTimeout(() => {
            if (data.tipo === "admin") {
              navigate("/admin");
            } else {
              navigate("/");
            }
          }, 1600);
        } else {
          console.log("DEBUG - data:", data);
          console.log("DEBUG - token:", token);
          showAlert("Error", "Token no recibido o datos incompletos");
        }
      } else {
        showAlert("Error", data.message || "Ocurrió un error");
      }
    } catch (error) {
      showAlert("Error", "Error en la autenticación");
    }
  };

  const toggleAuthMode = () => {
    setIsRegistering((prev) => !prev);
    setUsername("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2e3192] via-[#1b69a0] to-[#18c1c1]">
      <form
        onSubmit={handleAuth}
        className="bg-white/20 backdrop-blur-md p-8 rounded-xl text-white shadow-xl w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
        </h2>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 rounded bg-white/10 border border-white/30 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded bg-white/10 border border-white/30 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-white/30 hover:bg-white/40 text-white font-semibold p-2 rounded"
        >
          {isRegistering ? "Registrarse" : "Entrar"}
        </button>
        <p
          onClick={toggleAuthMode}
          className="text-sm text-center underline text-white/80 cursor-pointer"
        >
          {isRegistering
            ? "¿Ya tienes una cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
        </p>
      </form>
    </div>
  );
}
