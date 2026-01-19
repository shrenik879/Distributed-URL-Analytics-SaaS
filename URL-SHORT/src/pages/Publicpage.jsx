// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../api/axios";

// export default function PublicPage() {
//   const { pageId } = useParams();

//   const [page, setPage] = useState(null);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await api.get(`/page/${pageId}`);
//         setPage(res.data);
//       } catch {
//         setPage(null);
//       }
//     })();
//   }, [username]);

//   if (!page) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-black text-white">
//         Page not found
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white flex justify-center">
//       <div className="w-full max-w-md p-6">
//         <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
//         {page.bio && <p className="text-gray-400 mb-6">{page.bio}</p>}

//         <div className="space-y-4">
//           {page.links.map((link) => (
//             <a
//               key={link._id}
//               href={`http://localhost:8002/page/${pageId}/${link._id}`}
//               className="block w-full text-center bg-gray-900 hover:bg-gray-800 p-4 rounded"
//             >
//               {link.label}
//             </a>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }



// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../api/axios";

// export default function PublicPage() {
//   const { pageId } = useParams();
//   const [page, setPage] = useState(null);

//   useEffect(() => {
//     api
//       .get(`/page/${pageId}`)
//       .then((res) => setPage(res.data))
//       .catch(() => setPage(null));
//   }, [pageId]);

//   if (!page) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-white">
//         Page not found
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-white flex justify-center">
//       <div className="w-full max-w-md p-6">
//         <h1 className="text-2xl font-semibold mb-6">{page.title}</h1>

//         <div className="space-y-4">
//           {page.links.map((link) => (
//             <a
//               key={link._id}
//               href={`http://localhost:8002/page/${pageId}/${link._id}`}
//               target="_blank"
//               rel="noreferrer"
//               className="block bg-white/10 hover:bg-white/20 transition rounded-xl px-4 py-3"
//             >
//               {link.label}
//             </a>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }



// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../api/axios";

// export default function PublicPage() {
//   const { pageId } = useParams();
//   const [page, setPage] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api
//       .get(`/page/${pageId}`) // ✅ SAME AS YOUR OLD WORKING CODE
//       .then((res) => setPage(res.data))
//       .catch(() => setPage(null))
//       .finally(() => setLoading(false));
//   }, [pageId]);

//   if (loading) {
//     return <div className="pp-loading">Loading...</div>;
//   }

//   if (!page) {
//     return <div className="pp-error">Page not found</div>;
//   }

//   return (
//     <div className="pp-wrapper">
//       <div className="pp-card">

//         {/* HEADER */}
//         <div className="pp-header">
//           <div className="pp-avatar">
//             {page.title?.charAt(0).toUpperCase()}
//           </div>
//           <h1>{page.title}</h1>
//           <p className="pp-subtitle">My important links</p>
//         </div>

//         {/* LINKS */}
//         <div className="pp-links">
//           {page.links.map((link) => (
//             <a
//               key={link._id}
//               href={`http://localhost:8002/page/${pageId}/${link._id}`} // ✅ SAME AS BEFORE
//               target="_blank"
//               rel="noreferrer"
//               className="pp-link"
//             >
//               {link.label}
//             </a>
//           ))}
//         </div>

//         {/* FOOTER */}
//         <div className="pp-footer">
//           Powered by LinkShrink
//         </div>
//       </div>
//     </div>
//   );
// }





// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import api from "../api/axios";

// export default function PublicPage() {
//   const { pageId } = useParams();
//   const [page, setPage] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api
//       .get(`/page/public/${pageId}`)
//       .then((res) => setPage(res.data))
//       .catch(() => setPage(null))
//       .finally(() => setLoading(false));
//   }, [pageId]);

//   if (loading) return <div className="pp-loading">Loading...</div>;
//   if (!page) return <div className="pp-error">Page not found</div>;

//   return (
//     <div className="pp-container">
//       {/* HEADER */}
//       <div className="pp-header-bg">
//         <div className="pp-avatar">
//           {page.title?.charAt(0).toUpperCase()}
//         </div>
//       </div>

//       {/* CARD */}
//       <div className="pp-card">
//         <h1 className="pp-name">{page.title}</h1>
//         <p className="pp-subtitle">My important links</p>

//         {/* LINKS */}
//         <div className="pp-links">
//           {page.links.map((link) => (
//             <a
//               key={link._id}
//               href={link.url}
//               target="_blank"
//               rel="noreferrer"
//               className="pp-link"
//             >
//               {link.label}
//             </a>
//           ))}
//         </div>

//         <div className="pp-footer">
//           Powered by <span>LinkShrink</span>
//         </div>
//       </div>

//       {/* STYLES */}
//       <style jsx>{`
//         .pp-container {
//           min-height: 100vh;
//           background: #f4f6f8;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//         }

//         .pp-header-bg {
//           width: 100%;
//           height: 180px;
//           background: linear-gradient(135deg, #14b8a6, #0f766e);
//           display: flex;
//           justify-content: center;
//           align-items: flex-end;
//         }

//         .pp-avatar {
//           width: 110px;
//           height: 110px;
//           border-radius: 50%;
//           background: #fff;
//           color: #0f766e;
//           font-size: 48px;
//           font-weight: bold;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin-bottom: -55px;
//           box-shadow: 0 10px 30px rgba(0,0,0,0.2);
//         }

//         .pp-card {
//           background: #fff;
//           width: 92%;
//           max-width: 420px;
//           margin-top: 70px;
//           padding: 30px 24px;
//           border-radius: 24px;
//           text-align: center;
//           box-shadow: 0 20px 40px rgba(0,0,0,0.08);
//         }

//         .pp-name {
//           font-size: 22px;
//           font-weight: 700;
//           margin-bottom: 6px;
//         }

//         .pp-subtitle {
//           font-size: 14px;
//           color: #6b7280;
//           margin-bottom: 24px;
//         }

//         .pp-links {
//           display: flex;
//           flex-direction: column;
//           gap: 14px;
//         }

//         .pp-link {
//           padding: 14px;
//           border-radius: 14px;
//           background: #f0fdfa;
//           color: #0f766e;
//           font-weight: 600;
//           text-decoration: none;
//           transition: all 0.2s ease;
//           box-shadow: 0 6px 16px rgba(20,184,166,0.15);
//         }

//         .pp-link:hover {
//           transform: translateY(-2px);
//           background: #ccfbf1;
//         }

//         .pp-footer {
//           margin-top: 28px;
//           font-size: 12px;
//           color: #9ca3af;
//         }

//         .pp-footer span {
//           color: #0f766e;
//           font-weight: 600;
//         }

//         .pp-loading,
//         .pp-error {
//           min-height: 100vh;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 18px;
//         }
//       `}</style>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function PublicPage() {
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/page/public/${pageId}`)
      .then((res) => setPage(res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [pageId]);

  if (loading) return <div className="pp-loading">Loading...</div>;
  if (!page) return <div className="pp-error">Page not found</div>;

  return (
    <div className="pp-container">
      {/* HEADER */}
      <div className="pp-header-bg">
        <div className="pp-avatar">
          {page.title?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* CARD */}
      <div className="pp-card">
        <h1 className="pp-name">{page.title}</h1>

        {/* 👇 EMAIL (FROM BACKEND) */}
        <p className="pp-email">
          {page.createdBy?.email}
        </p>

        <p className="pp-subtitle">My important links</p>

        {/* LINKS */}
        <div className="pp-links">
          {page.links.map((link) => (
            <a
              key={link._id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="pp-link"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="pp-footer">
          Powered by <span>LinkShrink</span>
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .pp-container {
          min-height: 100vh;
          background: radial-gradient(
            circle at top,
            #0f172a,
            #020617
          );
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
        }

        .pp-header-bg {
          width: 100%;
          height: 180px;
          background: linear-gradient(
            135deg,
            #4f46e5,
            #2563eb
          );
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        .pp-avatar {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: #020617;
          color: #60a5fa;
          font-size: 48px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: -55px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          border: 2px solid rgba(255,255,255,0.1);
        }

        .pp-card {
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
          width: 92%;
          max-width: 420px;
          margin-top: 70px;
          padding: 30px 24px;
          border-radius: 24px;
          text-align: center;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .pp-name {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .pp-email {
          font-size: 13px;
          color: #94a3b8;
          margin-bottom: 16px;
          word-break: break-all;
        }

        .pp-subtitle {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 24px;
        }

        .pp-links {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pp-link {
          padding: 14px;
          border-radius: 14px;
          background: linear-gradient(
            135deg,
            #1e293b,
            #020617
          );
          color: #60a5fa;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 10px 25px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .pp-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 40px rgba(37,99,235,0.35);
        }

        .pp-footer {
          margin-top: 28px;
          font-size: 12px;
          color: #64748b;
        }

        .pp-footer span {
          color: #60a5fa;
          font-weight: 600;
        }

        .pp-loading,
        .pp-error {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
}
