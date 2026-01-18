// import { useState } from "react";
// import api from "../api/axios";

// export default function Signup() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSignup = async () => {
//     setError("");
//     setLoading(true);

//     try {
//       const res = await api.post("/user", {
//         name,
//         email,
//         password,
//       });

//       // ✅ SUCCESS
//       if (res.status === 201) {
//         window.location.href = "/login";
//       }

//     } catch (err) {
//       // ✅ READ BACKEND ERROR MESSAGE
//       if (err.response && err.response.data?.error) {
//         setError(err.response.data.error);
//       } else {
//         setError("Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center text-white">
//       <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-8">

//         <h2 className="text-2xl font-semibold mb-6 text-center">
//           Create your account
//         </h2>

//         {error && (
//           <p className="mb-4 text-sm text-red-400 bg-red-900/20 p-2 rounded">
//             {error}
//           </p>
//         )}

//         <div className="space-y-4">
//           <input
//             type="text"
//             placeholder="Full name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full p-3 bg-gray-800 border border-gray-700 rounded outline-none focus:border-violet-500"
//           />

//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-3 bg-gray-800 border border-gray-700 rounded outline-none focus:border-violet-500"
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-3 bg-gray-800 border border-gray-700 rounded outline-none focus:border-violet-500"
//           />

//           <button
//             onClick={handleSignup}
//             disabled={loading}
//             className="w-full bg-violet-600 hover:bg-violet-700 transition p-3 rounded font-medium disabled:opacity-60"
//           >
//             {loading ? "Creating account..." : "Sign up"}
//           </button>
//         </div>

//         <p className="mt-6 text-sm text-center text-gray-400">
//           Already have an account?{" "}
//           <a href="/login" className="text-violet-400 hover:underline">
//             Login
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import api from "../api/axios";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/user", {
        name,
        email,
        password,
      });

      // ✅ SUCCESS
      if (res.status === 201) {
        window.location.href = "/login";
      }
    } catch (err) {
      if (err.response && err.response.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">

        {/* BRAND */}
        <h1 className="text-3xl font-bold text-center mb-1 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
          LinkShrink
        </h1>
        <p className="text-sm text-slate-400 text-center mb-8">
          Create your account to start shortening links
        </p>

        {/* ERROR */}
        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-500/30 p-3 rounded-lg">
            {error}
          </p>
        )}

        {/* FORM */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/20 outline-none focus:border-indigo-400 transition"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/20 outline-none focus:border-indigo-400 transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/20 outline-none focus:border-indigo-400 transition"
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 transition shadow-lg disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </div>

        {/* LOGIN LINK */}
        <p className="mt-6 text-sm text-center text-slate-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition"
          >
            Login
          </a>
        </p>

      </div>
    </div>
  );
}
