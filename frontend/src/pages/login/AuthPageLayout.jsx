import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        {/* 🔹 Panel izquierdo (Logo y Título) */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-[#0cc0df]">
          <div className="flex flex-col items-center text-center px-6">
            <div className="mb-6">
              <img
                src="/images/logo/logo 6.png"
                alt="Logo"
                className="w-[290px] h-[290px] mx-auto rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-110"
              />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Matecitos Grupo de Estudio
            </h1>
            <p className="text-white/80 max-w-xs">Instituto de apoyo escolar</p>
          </div>
        </div>

        {/* 🔹 Panel derecho (Formulario) */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2">
          {children}
        </div>
      </div>
    </div>
  );
}
