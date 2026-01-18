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



import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function PublicPage() {
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/page/${pageId}`) // ✅ SAME AS YOUR OLD WORKING CODE
      .then((res) => setPage(res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [pageId]);

  if (loading) {
    return <div className="pp-loading">Loading...</div>;
  }

  if (!page) {
    return <div className="pp-error">Page not found</div>;
  }

  return (
    <div className="pp-wrapper">
      <div className="pp-card">

        {/* HEADER */}
        <div className="pp-header">
          <div className="pp-avatar">
            {page.title?.charAt(0).toUpperCase()}
          </div>
          <h1>{page.title}</h1>
          <p className="pp-subtitle">My important links</p>
        </div>

        {/* LINKS */}
        <div className="pp-links">
          {page.links.map((link) => (
            <a
              key={link._id}
              href={`http://localhost:8002/page/${pageId}/${link._id}`} // ✅ SAME AS BEFORE
              target="_blank"
              rel="noreferrer"
              className="pp-link"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* FOOTER */}
        <div className="pp-footer">
          Powered by LinkShrink
        </div>
      </div>
    </div>
  );
}
