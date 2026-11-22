import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    return usuarioGuardado
      ? JSON.parse(usuarioGuardado)
      : null;
  });

  const iniciarSesion = (datosUsuario) => {
    setUsuario(datosUsuario);

    localStorage.setItem(
      "usuario",
      JSON.stringify(datosUsuario)
    );
  };

  const cerrarSesion = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  return (
    <AuthContext.Provider
      value={{ usuario, iniciarSesion, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}