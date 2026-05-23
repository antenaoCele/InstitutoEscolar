import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({ children }) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row sm:p-0">
        {/* 🔹 Formulario (lado izquierdo) */}
        {children}

        {/*  Panel derecho */}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-[#0cc0df] lg:flex lg:justify-center">
          <div className="flex flex-col items-center text-center px-6">
            {/*  Logo */}
            <div className="block mb-6">
              <img
                src="/images/logo/logo 6.png"
                alt="Logo"
                className="w-[290px] h-[290px] mx-auto rounded-full object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-110"
              />
            </div>

            {/* 🔹 Título */}
            <h1 className="text-3xl font-bold text-white mb-3">
              Matecitos Grupo de Estudio
            </h1>

            {/* 🔹 Descripción */}
            <p className="text-white/80 max-w-xs">Instituto de apoyo escolar</p>
          </div>
        </div>

        {/* 🔹 Botón tema */}
        {/* <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div> */}
      </div>
    </div>
  );
}
