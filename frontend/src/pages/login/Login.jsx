// import { useState } from "react";
// import { useAuth } from "../context/Auth.jsx";

// export const Login = () => {
//   const { error, login, setError } = useAuth();

//   const [open, setOpen] = useState(false);
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);

//     if (!username.trim() || !password) {
//       setError("El nombre de usuario y la contraseña son obligatorios.");
//       return;
//     }

//     setLoading(true);
//     const result = await login(username.trim(), password);
//     setLoading(false);

//     if (result.success) {
//       setOpen(false);
//     }
//   };

//   return (
//     <>
//       <button onClick={() => setOpen(true)}>Ingresar</button>
//       <dialog open={open}>
//         <article>
//           <h2>Ingresar nombre y contraseña</h2>
//           <form onSubmit={handleSubmit}>
//             <fieldset>
//               <label htmlFor="username">Nombre de usuario</label>
//               <input
//                 name="username"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//               />
//               <label htmlFor="password">Contraseña:</label>
//               <input
//                 name="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//               {error && <p style={{ color: "red" }}>{error}</p>}
//             </fieldset>
//             <footer>
//               <div className="grid">
//                 <input type="submit" value="Ingresar" aria-busy={loading} />
//               </div>
//             </footer>
//           </form>
//         </article>
//       </dialog>
//     </>
//   );
// };

import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function Login() {
  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
