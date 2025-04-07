import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Thermometer,
  Sun,
  Move,
  Volume2,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import logo from "../../public/WEBICON-NoBG.png";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const links = [
    { to: "/", icon: <Home size={24} />, label: "Inicio", color: "text-white" },
    {
      to: "/temperature",
      icon: <Thermometer size={24} />,
      label: "Temperatura",
      color: "text-red-400",
    },
    {
      to: "/light",
      icon: <Sun size={24} />,
      label: "Luz",
      color: "text-yellow-400",
    },
    {
      to: "/movement",
      icon: <Move size={24} />,
      label: "Movimiento",
      color: "text-green-400",
    },
    {
      to: "/sound",
      icon: <Volume2 size={24} />,
      label: "Sonido",
      color: "text-blue-400",
    },
  ];

  return (
    <div className="pt-10 px-4 flex justify-evenly items-center w-full relative z-50">
      {/* Brand name (visible siempre) */}
      <div className="flex items-center space-x-2 ml-2">
        <img
          src={logo}
          alt="GuardianSens Logo"
          className="w-24 h-24"
        />
        <span className="text-white font-bold text-3xl">GuardianSens</span>
      </div>
      {/* Desktop nav */}
      <header className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl w-max z-50 hidden md:flex items-center space-x-6 text-lg font-semibold mx-auto">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center space-x-2 ${
              pathname === link.to
                ? `${link.color} font-bold`
                : "text-white/70 hover:text-white"
            }`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
        <button
          onClick={logout}
          className="flex items-center text-white/70 hover:text-red-400 space-x-2"
        >
          <LogOut size={22} />
          <span>Log Out</span>
        </button>
      </header>

      {/* Mobile nav */}
      <div className="md:hidden relative z-50">
        <button
          onClick={() => setOpen(!open)}
          className="text-white bg-white/10 p-2 rounded-lg shadow-md backdrop-blur"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {open && (
          <div className="absolute right-0 mt-3 bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-4 space-y-4 text-white text-base font-bold w-[40vh]">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`flex items-center space-x-2 ${
                  pathname === link.to
                    ? `${link.color} font-bold`
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-white/70 hover:text-red-400"
            >
              <LogOut size={22} />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
