// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { createShortUrl, getUserUrls } from "../api/url.api";
// import { getQRCode } from "../api/qr.api";
// import { getAnalytics } from "../api/analytics.api";
// import { createPage } from "../api/page.api";

// import {
//   Link2,
//   QrCode,
//   LayoutGrid,
//   BarChart3,
//   Copy,
//   Check,
// } from "lucide-react";

// export default function URLShortener() {
//   const [activeTab, setActiveTab] = useState("home");

//   /* ================= DASHBOARD ================= */
//   const [url, setUrl] = useState("");
//   const [customAlias, setCustomAlias] = useState("");
//   const [shortUrl, setShortUrl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [links, setLinks] = useState([]);

//   /* ================= QR ================= */
//   const [qrInput, setQrInput] = useState("");
//   const [qrImage, setQrImage] = useState("");

//   /* ================= ANALYTICS ================= */
//   const [analyticsInput, setAnalyticsInput] = useState("");
//   const [analyticsData, setAnalyticsData] = useState(null);

//   /* ================= PAGES ================= */
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageUsername, setPageUsername] = useState("");
//   const [pageData, setPageData] = useState(null);

//   const [linkLabel, setLinkLabel] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   /* ================= LOGOUT (ONLY ADDITION) ================= */
//   const handleLogout = async () => {
//     try {
//       await api.post("/user/logout");
//       window.location.href = "/login";
//     } catch (err) {
//       console.error("Logout failed", err);
//     }
//   };

//   /* ================= FETCH DASHBOARD LINKS ================= */
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await getUserUrls();
//         setLinks(
//           res.data.urls.map((u) => ({
//             id: u._id,
//             original: u.redirectURL,
//             short: `http://localhost:8002/url/${u.shortId}`,
//             clicks: u.visitHistory.length,
//           }))
//         );
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   }, []);

//   /* ================= SHORTEN ================= */
//   const handleShorten = async () => {
//     try {
//       const res = await createShortUrl(url, customAlias);

//       const newLink = {
//         id: res.data.shortId,
//         original: url,
//         short: res.data.shortUrl,
//         clicks: 0,
//       };

//       setLinks((prev) => [newLink, ...prev]);
//       setShortUrl(res.data.shortUrl);
//       setUrl("");
//       setCustomAlias("");
//     } catch {
//       alert("Shorten failed");
//     }
//   };

//   /* ================= COPY ================= */
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };

//   /* ================= QR ================= */
//   const handleGenerateQR = async () => {
//     try {
//       let shortId = qrInput.trim().split("/").pop();
//       if (qrInput.startsWith("http")) {
//         const res = await createShortUrl(qrInput);
//         shortId = res.data.shortId;
//       }
//       const qr = await getQRCode(shortId);
//       setQrImage(qr.data.qrCode);
//     } catch {
//       alert("QR failed");
//     }
//   };

//   /* ================= ANALYTICS ================= */
//   const handleFetchAnalytics = async () => {
//     try {
//       const shortId = analyticsInput.trim().split("/").pop();
//       const res = await getAnalytics(shortId);
//       setAnalyticsData(res.data);
//     } catch {
//       alert("Analytics not found");
//     }
//   };

//   /* ================= PAGES ================= */
//   useEffect(() => {
//     if (activeTab !== "pages" || !pageUsername) return;

//     (async () => {
//       try {
//         const res = await api.get(`/page/${pageUsername}`);
//         setPageData(res.data);
//       } catch {
//         setPageData(null);
//       }
//     })();
//   }, [activeTab, pageUsername]);

//   const handleCreatePage = async () => {
//     await createPage({ title: pageTitle, username: pageUsername });
//     const res = await api.get(`/page/${pageUsername}`);
//     setPageData(res.data);
//   };

//   const handleAddLink = async () => {
//     if (!linkLabel || !linkUrl) {
//       alert("Label and URL required");
//       return;
//     }

//     const res = await api.post(`/page/${pageUsername}/link`, {
//       label: linkLabel,
//       url: linkUrl,
//     });

//     setPageData(res.data.page);
//     setLinkLabel("");
//     setLinkUrl("");
//   };

//   /* ================= UI ================= */
//   const NavButton = ({ icon: Icon, label, tab }) => (
//     <button
//       onClick={() => setActiveTab(tab)}
//       className={`flex items-center gap-3 px-4 py-3 rounded ${
//         activeTab === tab
//           ? "bg-violet-600 text-white"
//           : "text-gray-400 hover:bg-gray-800"
//       }`}
//     >
//       <Icon size={20} /> {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-black text-white flex">
//       <aside className="w-64 border-r border-gray-800 p-6 space-y-2">
//         <button
//           onClick={handleLogout}
//           className="w-full text-left text-red-400 hover:bg-gray-800 px-4 py-3 rounded"
//         >
//           Logout
//         </button>

//         <NavButton icon={Link2} label="Dashboard" tab="home" />
//         <NavButton icon={QrCode} label="QR Codes" tab="qr" />
//         <NavButton icon={LayoutGrid} label="Pages" tab="pages" />
//         <NavButton icon={BarChart3} label="Analytics" tab="analytics" />
//       </aside>

//       <main className="flex-1 p-8 overflow-auto">

//         {/* DASHBOARD */}
//         {activeTab === "home" && (
//           <>
//             <input
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Paste URL"
//             />
//             <input
//               value={customAlias}
//               onChange={(e) => setCustomAlias(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Custom alias (optional)"
//             />
//             <button onClick={handleShorten} className="bg-violet-600 p-3">
//               Shorten
//             </button>

//             {shortUrl && (
//               <div className="mt-4 flex gap-3 items-center">
//                 <span>{shortUrl}</span>
//                 <button onClick={() => copyToClipboard(shortUrl)}>
//                   {copied ? <Check /> : <Copy />}
//                 </button>
//               </div>
//             )}

//             <div className="mt-8 space-y-3">
//               {links.map((link) => (
//                 <div key={link.id} className="bg-gray-900 p-4 rounded">
//                   <p className="text-violet-400 break-all">{link.short}</p>
//                   <p className="text-gray-400 text-xs">{link.original}</p>
//                   <p className="text-xs text-gray-500">Clicks: {link.clicks}</p>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* QR */}
//         {activeTab === "qr" && (
//           <>
//             <input
//               value={qrInput}
//               onChange={(e) => setQrInput(e.target.value)}
//               className="w-full p-3 bg-gray-800"
//               placeholder="Paste URL or shortId"
//             />
//             <button onClick={handleGenerateQR} className="mt-3 bg-violet-600 p-3">
//               Generate QR
//             </button>
//             {qrImage && <img src={qrImage} className="mt-4 w-64" />}
//           </>
//         )}

//         {/* ANALYTICS */}
//         {activeTab === "analytics" && (
//           <>
//             <input
//               value={analyticsInput}
//               onChange={(e) => setAnalyticsInput(e.target.value)}
//               className="w-full p-3 bg-gray-800"
//               placeholder="Paste shortId"
//             />
//             <button
//               onClick={handleFetchAnalytics}
//               className="mt-3 bg-violet-600 p-3"
//             >
//               View Analytics
//             </button>
//             {analyticsData && (
//               <pre className="mt-6 bg-gray-900 p-4 text-sm overflow-auto">
//                 {JSON.stringify(analyticsData, null, 2)}
//               </pre>
//             )}
//           </>
//         )}

//         {/* PAGES */}
//         {activeTab === "pages" && (
//           <>
//             {!pageData && (
//               <>
//                 <input
//                   value={pageTitle}
//                   onChange={(e) => setPageTitle(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Page title"
//                 />
//                 <input
//                   value={pageUsername}
//                   onChange={(e) => setPageUsername(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="username"
//                 />
//                 <button onClick={handleCreatePage} className="bg-violet-600 p-3">
//                   Create Page
//                 </button>
//               </>
//             )}

//             {pageData && (
//               <>
//                 <p className="mt-4">
//                   Public URL:{" "}
//                   <a
//                     href={`http://localhost:5173/u/${pageData.username}`}
//                     target="_blank"
//                     rel="noreferrer"
//                     className="text-violet-400 underline"
//                   >
//                     http://localhost:5173/u/{pageData.username}
//                   </a>
//                 </p>

//                 <h3 className="mt-6 mb-2 text-lg">Add Link</h3>
//                 <input
//                   value={linkLabel}
//                   onChange={(e) => setLinkLabel(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Link label"
//                 />
//                 <input
//                   value={linkUrl}
//                   onChange={(e) => setLinkUrl(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="https://example.com"
//                 />
//                 <button onClick={handleAddLink} className="bg-violet-600 p-3">
//                   Add Link
//                 </button>
//               </>
//             )}
//           </>
//         )}

//       </main>
//     </div>
//   );
// }


///******* */

// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { createShortUrl, getUserUrls } from "../api/url.api";
// import { getAnalytics } from "../api/analytics.api";
// import { createPage } from "../api/page.api";

// import {
//   Link2,
//   QrCode,
//   LayoutGrid,
//   BarChart3,
//   Copy,
//   Check,
//   Download,
// } from "lucide-react";

// export default function URLShortener() {
//   const [activeTab, setActiveTab] = useState("home");

//   /* ================= DASHBOARD ================= */
//   const [url, setUrl] = useState("");
//   const [customAlias, setCustomAlias] = useState("");
//   const [shortUrl, setShortUrl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [links, setLinks] = useState([]);

//   /* ================= QR ================= */
//   const [qrInput, setQrInput] = useState("");
//   const [qrGenerated, setQrGenerated] = useState("");

//   /* ================= ANALYTICS ================= */
//   const [analyticsInput, setAnalyticsInput] = useState("");
//   const [analyticsData, setAnalyticsData] = useState(null);

//   /* ================= PAGES ================= */
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageUsername, setPageUsername] = useState("");
//   const [pageData, setPageData] = useState(null);

//   const [linkLabel, setLinkLabel] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   /* ================= LOGOUT ================= */
//   const handleLogout = async () => {
//     await api.post("/user/logout");
//     window.location.href = "/login";
//   };

//   /* ================= FETCH USER URLS ================= */
//   useEffect(() => {
//     (async () => {
//       const res = await getUserUrls();
//       setLinks(
//         res.data.urls.map((u) => ({
//           id: u._id,
//           shortId: u.shortId,
//           original: u.redirectURL,
//           short: `http://localhost:8002/url/${u.shortId}`,
//           clicks: u.visitHistory.length,
//         }))
//       );
//     })();
//   }, []);

//   /* ================= SHORTEN ================= */
//   const handleShorten = async () => {
//     const res = await createShortUrl(url, customAlias);

//     const newLink = {
//       id: res.data.shortId,
//       shortId: res.data.shortId,
//       original: url,
//       short: res.data.shortUrl,
//       clicks: 0,
//     };

//     setLinks((prev) => [newLink, ...prev]);
//     setShortUrl(res.data.shortUrl);
//     setUrl("");
//     setCustomAlias("");
//   };

//   /* ================= COPY ================= */
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };

//   /* ================= GENERATE QR ================= */
// // const handleGenerateQR = async () => {
// //   try {
// //     if (!qrInput.trim()) {
// //       alert("Paste short URL or shortId");
// //       return;
// //     }

// //     // ✅ ALWAYS extract shortId correctly
// //     let shortId = qrInput.trim();

// //     // if full URL pasted
// //     if (shortId.includes("/")) {
// //       shortId = shortId.split("/").pop();
// //     }

// //     const res = await api.get(`/url/qr/${shortId}`);
// //     setQrGenerated(res.data.qrCode);
// //   } catch (err) {
// //     console.error("QR ERROR:", err);
// //     alert("QR not found");
// //   }
// // };

//  const handleGenerateQR = async () => {
//     try {
//       const shortId = qrInput.trim().split("/").pop();
//       const res = await api.get(`/url/qr/${shortId}`);
//       setQrGenerated(res.data.qrCode);
//     } catch {
//       alert("QR not found");
//     }
//   };
//   /* ================= DOWNLOAD QR ================= */
//   const downloadQR = (shortId) => {
//     window.open(
//       `http://localhost:8002/url/qr/${shortId}/download`,
//       "_blank"
//     );
//   };

//   /* ================= ANALYTICS (FIXED) ================= */
//   const handleFetchAnalytics = async () => {
//     try {
//       const shortId = analyticsInput.trim().split("/").pop();
//       if (!shortId) {
//         alert("Enter valid shortId or URL");
//         return;
//       }
//       const res = await getAnalytics(shortId);
//       setAnalyticsData(res.data);
//     } catch {
//       alert("Analytics not found");
//     }
//   };

//   /* ================= PAGES (FIXED – NO /user/me) ================= */
//   useEffect(() => {
//     if (activeTab !== "pages" || !pageUsername) return;

//     (async () => {
//       try {
//         const res = await api.get(`/page/${pageUsername}`);
//         setPageData(res.data);
//       } catch {
//         setPageData(null);
//       }
//     })();
//   }, [activeTab, pageUsername]);

//   const handleCreatePage = async () => {
//     await createPage({ title: pageTitle, username: pageUsername });
//     const res = await api.get(`/page/${pageUsername}`);
//     setPageData(res.data);
//   };

//   const handleAddLink = async () => {
//     if (!linkLabel || !linkUrl) return alert("Required");

//     const res = await api.post(`/page/${pageUsername}/link`, {
//       label: linkLabel,
//       url: linkUrl,
//     });

//     setPageData(res.data.page);
//     setLinkLabel("");
//     setLinkUrl("");
//   };

//   /* ================= UI ================= */
//   const NavButton = ({ icon: Icon, label, tab }) => (
//     <button
//       onClick={() => setActiveTab(tab)}
//       className={`flex items-center gap-3 px-4 py-3 rounded ${
//         activeTab === tab
//           ? "bg-violet-600 text-white"
//           : "text-gray-400 hover:bg-gray-800"
//       }`}
//     >
//       <Icon size={20} /> {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-black text-white flex">
//       <aside className="w-64 border-r border-gray-800 p-6 space-y-2">
//         <button
//           onClick={handleLogout}
//           className="w-full text-left text-red-400 hover:bg-gray-800 px-4 py-3 rounded"
//         >
//           Logout
//         </button>

//         <NavButton icon={Link2} label="Dashboard" tab="home" />
//         <NavButton icon={QrCode} label="QR Codes" tab="qr" />
//         <NavButton icon={LayoutGrid} label="Pages" tab="pages" />
//         <NavButton icon={BarChart3} label="Analytics" tab="analytics" />
//       </aside>

//       <main className="flex-1 p-8 overflow-auto">
//         {/* DASHBOARD */}
//         {activeTab === "home" && (
//           <>
//             <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Paste URL" />
//             <input value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Custom alias (optional)" />
//             <button onClick={handleShorten} className="bg-violet-600 p-3">Shorten</button>

//             {shortUrl && (
//               <div className="mt-4 flex gap-2 items-center">
//                 <span>{shortUrl}</span>
//                 <button onClick={() => copyToClipboard(shortUrl)}>
//                   {copied ? <Check /> : <Copy />}
//                 </button>
//               </div>
//             )}

//             <div className="mt-8 space-y-3">
//               {links.map((link) => (
//                 <div key={link.id} className="bg-gray-900 p-4 rounded">
//                   <p className="text-violet-400">{link.short}</p>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* QR */}
//         {activeTab === "qr" && (
//           <>
//             <input value={qrInput} onChange={(e) => setQrInput(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Paste short URL or shortId" />
//             <button onClick={handleGenerateQR} className="bg-violet-600 p-3">Generate QR</button>

//             {qrGenerated && (
//               <div className="mt-4">
//                 <img src={qrGenerated} className="w-48 mb-2" />
//                 <button onClick={() => downloadQR(qrInput.trim().split("/").pop())} className="text-violet-400 underline">
//                   Download QR
//                 </button>
//               </div>
//             )}
//           </>
//         )}

//         {/* ANALYTICS */}
//         {activeTab === "analytics" && (
//           <>
//             <input value={analyticsInput} onChange={(e) => setAnalyticsInput(e.target.value)} className="w-full p-3 bg-gray-800" placeholder="Paste shortId" />
//             <button onClick={handleFetchAnalytics} className="mt-3 bg-violet-600 p-3">View Analytics</button>

//             {analyticsData && (
//               <pre className="mt-6 bg-gray-900 p-4 text-sm overflow-auto">
//                 {JSON.stringify(analyticsData, null, 2)}
//               </pre>
//             )}
//           </>
//         )}

//         {/* PAGES */}
//         {activeTab === "pages" && (
//           <>
//             {!pageData ? (
//               <>
//                 <input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Page title" />
//                 <input value={pageUsername} onChange={(e) => setPageUsername(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="username" />
//                 <button onClick={handleCreatePage} className="bg-violet-600 p-3">Create Page</button>
//               </>
//             ) : (
//               <>
//                 <p className="mb-4">
//                   Public URL:{" "}
//                   <a href={`http://localhost:5173/u/${pageData.username}`} className="text-violet-400 underline">
//                     http://localhost:5173/u/{pageData.username}
//                   </a>
//                 </p>

//                 <input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Label" />
//                 <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="URL" />
//                 <button onClick={handleAddLink} className="bg-violet-600 p-3">Add Link</button>
//               </>
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// }









// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { createShortUrl, getUserUrls } from "../api/url.api";
// import { getAnalytics } from "../api/analytics.api";
// import { createPage } from "../api/page.api";

// import {
//   Link2,
//   QrCode,
//   LayoutGrid,
//   BarChart3,
//   Copy,
//   Check,
//   Download,
// } from "lucide-react";

// export default function URLShortener() {
//   const [activeTab, setActiveTab] = useState("home");

//   /* ================= DASHBOARD ================= */
//   const [url, setUrl] = useState("");
//   const [customAlias, setCustomAlias] = useState("");
//   const [shortUrl, setShortUrl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [links, setLinks] = useState([]);

//   /* ================= QR ================= */
//   const [qrPreview, setQrPreview] = useState(""); // only after creation

//   /* ================= ANALYTICS ================= */
//   const [analyticsInput, setAnalyticsInput] = useState("");
//   const [analyticsData, setAnalyticsData] = useState(null);

//   /* ================= PAGES ================= */
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageUsername, setPageUsername] = useState("");
//   const [pageData, setPageData] = useState(null);

//   const [linkLabel, setLinkLabel] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   /* ================= LOGOUT ================= */
//   const handleLogout = async () => {
//     await api.post("/user/logout");
//     window.location.href = "/login";
//   };

//   /* ================= FETCH USER URLS ================= */
//   useEffect(() => {
//     (async () => {
//       const res = await getUserUrls();
//       setLinks(
//         res.data.urls.map((u) => ({
//           id: u._id,
//           shortId: u.shortId,
//           original: u.redirectURL,
//           short: `http://localhost:8002/url/${u.shortId}`,
//           clicks: u.visitHistory.length,
//         }))
//       );
//     })();
//   }, []);

//   /* ================= SHORTEN ================= */
//   const handleShorten = async () => {
//     const res = await createShortUrl(url, customAlias);

//     const newLink = {
//       id: res.data.shortId,
//       shortId: res.data.shortId,
//       original: url,
//       short: res.data.shortUrl,
//       clicks: 0,
//     };

//     setLinks((prev) => [newLink, ...prev]);
//     setShortUrl(res.data.shortUrl);
//     setQrPreview(res.data.qrCode); // 🔥 QR shown ONLY here
//     setUrl("");
//     setCustomAlias("");
//   };

//   /* ================= COPY ================= */
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };

//   /* ================= DOWNLOAD QR ================= */
//   const downloadQR = (shortId) => {
//     window.open(
//        `http://localhost:8002/url/qr/${shortId}/download`,
//     "_blank"
//     );
//   };

//   /* ================= ANALYTICS ================= */
//   const handleFetchAnalytics = async () => {
//     try {
//       const shortId = analyticsInput.trim().split("/").pop();
//       const res = await getAnalytics(shortId);
//       setAnalyticsData(res.data);
//     } catch {
//       alert("Not allowed");
//     }
//   };

//   /* ================= PAGES ================= */
//   useEffect(() => {
//     if (activeTab !== "pages") return;

//     (async () => {
//       try {
//         const me = await api.get("/user/me");
//         if (!me.data?.user) return;

//         const username = me.data.user.username;
//         setPageUsername(username);

//         const res = await api.get(`/page/${username}`);
//         setPageData(res.data);
//       } catch {
//         setPageData(null);
//       }
//     })();
//   }, [activeTab]);

//   const handleCreatePage = async () => {
//     await createPage({ title: pageTitle, username: pageUsername });
//     const res = await api.get(`/page/${pageUsername}`);
//     setPageData(res.data);
//   };

//   const handleAddLink = async () => {
//     if (!linkLabel || !linkUrl) return alert("Required");

//     const res = await api.post(`/page/${pageUsername}/link`, {
//       label: linkLabel,
//       url: linkUrl,
//     });

//     setPageData(res.data.page);
//     setLinkLabel("");
//     setLinkUrl("");
//   };

//   /* ================= UI ================= */
//   const NavButton = ({ icon: Icon, label, tab }) => (
//     <button
//       onClick={() => setActiveTab(tab)}
//       className={`flex items-center gap-3 px-4 py-3 rounded ${
//         activeTab === tab
//           ? "bg-violet-600 text-white"
//           : "text-gray-400 hover:bg-gray-800"
//       }`}
//     >
//       <Icon size={20} /> {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-black text-white flex">
//       <aside className="w-64 border-r border-gray-800 p-6 space-y-2">
//         <button
//           onClick={handleLogout}
//           className="w-full text-left text-red-400 hover:bg-gray-800 px-4 py-3 rounded"
//         >
//           Logout
//         </button>

//         <NavButton icon={Link2} label="Dashboard" tab="home" />
//         <NavButton icon={QrCode} label="QR Codes" tab="qr" />
//         <NavButton icon={LayoutGrid} label="Pages" tab="pages" />
//         <NavButton icon={BarChart3} label="Analytics" tab="analytics" />
//       </aside>

//       <main className="flex-1 p-8 overflow-auto">

//         {/* DASHBOARD */}
//         {activeTab === "home" && (
//           <>
//             <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Paste URL" />
//             <input value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Custom alias (optional)" />
//             <button onClick={handleShorten} className="bg-violet-600 p-3">Shorten</button>

//             {shortUrl && (
//               <div className="mt-4">
//                 <p>{shortUrl}</p>
//                 {qrPreview && <img src={qrPreview} className="w-48 mt-3" />}
//               </div>
//             )}

//             <div className="mt-8 space-y-3">
//               {links.map((link) => (
//                 <div key={link.id} className="bg-gray-900 p-4 rounded">
//                   <p className="text-violet-400">{link.short}</p>
//                   <button
//                     onClick={() => downloadQR(link.shortId)}
//                     className="text-sm text-violet-400 underline mt-2"
//                   >
//                     Download QR
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* QR TAB */}
//         {activeTab === "qr" && (
//           <>
//             <h2 className="text-xl mb-4">Your QR Codes</h2>
//             {links.map((link) => (
//               <div key={link.id} className="bg-gray-900 p-4 mb-3 rounded">
//                 <p className="text-violet-400">{link.short}</p>
//                 <button
//                   onClick={() => downloadQR(link.shortId)}
//                   className="flex items-center gap-2 text-sm text-violet-400 mt-2"
//                 >
//                   <Download size={16} /> Download QR
//                 </button>
//               </div>
//             ))}
//           </>
//         )}

//         {/* ANALYTICS */}
//         {activeTab === "analytics" && (
//           <>
//             <input value={analyticsInput} onChange={(e) => setAnalyticsInput(e.target.value)} className="w-full p-3 bg-gray-800" placeholder="Paste shortId" />
//             <button onClick={handleFetchAnalytics} className="mt-3 bg-violet-600 p-3">View Analytics</button>
//             {analyticsData && <pre className="mt-6 bg-gray-900 p-4">{JSON.stringify(analyticsData, null, 2)}</pre>}
//           </>
//         )}

//         {/* PAGES */}
//         {activeTab === "pages" && (
//           <>
//             {!pageData ? (
//               <>
//                 <input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Page title" />
//                 <button onClick={handleCreatePage} className="bg-violet-600 p-3">Create Page</button>
//               </>
//             ) : (
//               <>
//                 <p className="mb-4">
//                   Public URL:{" "}
//                   <a href={`http://localhost:5173/u/${pageData.username}`} className="text-violet-400 underline">
//                     http://localhost:5173/u/{pageData.username}
//                   </a>
//                 </p>

//                 <input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Label" />
//                 <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="URL" />
//                 <button onClick={handleAddLink} className="bg-violet-600 p-3">Add Link</button>
//               </>
//             )}
//           </>
//         )}

//       </main>
//     </div>
//   );
// }



//// -> code

// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { createShortUrl, getUserUrls } from "../api/url.api";
// import { getAnalytics } from "../api/analytics.api";
// import { createPage } from "../api/page.api";

// import {
//   Link2,
//   QrCode,
//   LayoutGrid,
//   BarChart3,
//   Copy,
//   Check,
//   Download,
// } from "lucide-react";

// export default function URLShortener() {
//   const [activeTab, setActiveTab] = useState("home");

//   /* ================= DASHBOARD ================= */
//   const [url, setUrl] = useState("");
//   const [customAlias, setCustomAlias] = useState("");
//   const [shortUrl, setShortUrl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [links, setLinks] = useState([]);

//   /* ================= QR ================= */
//   const [qrInput, setQrInput] = useState("");
//   const [qrGenerated, setQrGenerated] = useState("");

//   /* ================= ANALYTICS ================= */
//   const [analyticsInput, setAnalyticsInput] = useState("");
//   const [analyticsData, setAnalyticsData] = useState(null);

//   /* ================= PAGES ================= */
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageUsername, setPageUsername] = useState("");
//   const [pageData, setPageData] = useState(null);

//   const [linkLabel, setLinkLabel] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   /* ================= LOGOUT ================= */
//   const handleLogout = async () => {
//     await api.post("/user/logout");
//     window.location.href = "/login";
//   };

//   /* ================= FETCH USER URLS ================= */
//   useEffect(() => {
//     (async () => {
//       const res = await getUserUrls();
//       setLinks(
//         res.data.urls.map((u) => ({
//           id: u._id,
//           shortId: u.shortId,
//           original: u.redirectURL,
//           short: `http://localhost:8002/url/${u.shortId}`,
//           clicks: u.visitHistory.length,
//         }))
//       );
//     })();
//   }, []);

//   /* ================= SHORTEN ================= */
//   const handleShorten = async () => {
//     const res = await createShortUrl(url, customAlias);

//     const newLink = {
//       id: res.data.shortId,
//       shortId: res.data.shortId,
//       original: url,
//       short: res.data.shortUrl,
//       clicks: 0,
//     };

//     setLinks((prev) => [newLink, ...prev]);
//     setShortUrl(res.data.shortUrl);
//     setUrl("");
//     setCustomAlias("");
//   };

//   /* ================= COPY ================= */
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };

//   /* ================= GENERATE QR ================= */
//   const handleGenerateQR = async () => {
//     if (!qrInput.trim()) {
//       alert("Paste any URL or text");
//       return;
//     }

//     const encoded = encodeURIComponent(qrInput.trim());
//     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;

//     setQrGenerated(qrUrl);
//   };

//   /* ================= DOWNLOAD QR ================= */
//   const downloadQR = (shortId) => {
//     window.open(
//       `http://localhost:8002/url/qr/${shortId}/download`,
//       "_blank"
//     );
//   };

//   /* ================= ANALYTICS ================= */
//   const handleFetchAnalytics = async () => {
//     try {
//       const shortId = analyticsInput.trim().split("/").pop();
//       const res = await getAnalytics(shortId);
//       setAnalyticsData(res.data);
//     } catch {
//       alert("Analytics not found");
//     }
//   };

//   /* ================= PAGES ================= */
//   useEffect(() => {
//     if (activeTab !== "pages" || !pageUsername) return;

//     (async () => {
//       try {
//         const res = await api.get(`/page/${pageUsername}`);
//         setPageData(res.data);
//       } catch {
//         setPageData(null);
//       }
//     })();
//   }, [activeTab, pageUsername]);

//   const handleCreatePage = async () => {
//     await createPage({ title: pageTitle, username: pageUsername });
//     const res = await api.get(`/page/${pageUsername}`);
//     setPageData(res.data);
//   };

//   const handleAddLink = async () => {
//     if (!linkLabel || !linkUrl) return alert("Required");

//     const res = await api.post(`/page/${pageUsername}/link`, {
//       label: linkLabel,
//       url: linkUrl,
//     });

//     setPageData(res.data.page);
//     setLinkLabel("");
//     setLinkUrl("");
//   };

//   /* ================= UI ================= */
//   const NavButton = ({ icon: Icon, label, tab }) => (
//     <button
//       onClick={() => setActiveTab(tab)}
//       className={`flex items-center gap-3 px-4 py-3 rounded ${
//         activeTab === tab
//           ? "bg-violet-600 text-white"
//           : "text-gray-400 hover:bg-gray-800"
//       }`}
//     >
//       <Icon size={20} /> {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-black text-white flex">
//       <aside className="w-64 border-r border-gray-800 p-6 space-y-2">
//         <button
//           onClick={handleLogout}
//           className="w-full text-left text-red-400 hover:bg-gray-800 px-4 py-3 rounded"
//         >
//           Logout
//         </button>

//         <NavButton icon={Link2} label="Dashboard" tab="home" />
//         <NavButton icon={QrCode} label="QR Codes" tab="qr" />
//         <NavButton icon={LayoutGrid} label="Pages" tab="pages" />
//         <NavButton icon={BarChart3} label="Analytics" tab="analytics" />
//       </aside>

//       <main className="flex-1 p-8 overflow-auto">

//         {/* DASHBOARD */}
//         {activeTab === "home" && (
//           <>
//             <input
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Paste URL"
//             />
//             <input
//               value={customAlias}
//               onChange={(e) => setCustomAlias(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Custom alias (optional)"
//             />
//             <button onClick={handleShorten} className="bg-violet-600 p-3">
//               Shorten
//             </button>

//             {shortUrl && (
//               <div className="mt-4 flex gap-2 items-center">
//                 <span>{shortUrl}</span>
//                 <button onClick={() => copyToClipboard(shortUrl)}>
//                   {copied ? <Check /> : <Copy />}
//                 </button>
//               </div>
//             )}

//             {/* ✅ RESTORED LIST */}
//             <div className="mt-8 space-y-3">
//               {links.map((link) => (
//                 <div key={link.id} className="bg-gray-900 p-4 rounded">
//                   <p className="text-violet-400 break-all">{link.short}</p>
//                   <p className="text-xs text-gray-400">
//                     Clicks: {link.clicks}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* QR TAB */}
//         {activeTab === "qr" && (
//           <>
//             <input
//               value={qrInput}
//               onChange={(e) => setQrInput(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Paste short URL or text"
//             />

//             <button onClick={handleGenerateQR} className="bg-violet-600 p-3">
//               Generate QR
//             </button>

//             {qrGenerated && (
//               <div className="mt-4">
//                 <img src={qrGenerated} className="w-48 mb-2" />
//               </div>
//             )}

//             <h3 className="text-lg mt-8 mb-4">Your Generated QR Codes</h3>

//             {links.map((link) => (
//               <div key={link.id} className="bg-gray-900 p-4 mb-3 rounded">
//                 <p className="text-violet-400 break-all">{link.short}</p>
//                 <button
//                   onClick={() => downloadQR(link.shortId)}
//                   className="flex items-center gap-2 text-sm text-violet-400 mt-2"
//                 >
//                   <Download size={16} /> Download QR
//                 </button>
//               </div>
//             ))}
//           </>
//         )}

//         {/* ANALYTICS */}
//         {activeTab === "analytics" && (
//           <>
//             <input
//               value={analyticsInput}
//               onChange={(e) => setAnalyticsInput(e.target.value)}
//               className="w-full p-3 bg-gray-800"
//               placeholder="Paste shortId"
//             />
//             <button
//               onClick={handleFetchAnalytics}
//               className="mt-3 bg-violet-600 p-3"
//             >
//               View Analytics
//             </button>

//             {analyticsData && (
//               <pre className="mt-6 bg-gray-900 p-4 text-sm overflow-auto">
//                 {JSON.stringify(analyticsData, null, 2)}
//               </pre>
//             )}
//           </>
//         )}

//         {/* PAGES */}
//         {activeTab === "pages" && (
//           <>
//             {!pageData ? (
//               <>
//                 <input
//                   value={pageTitle}
//                   onChange={(e) => setPageTitle(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Page title"
//                 />
//                 <input
//                   value={pageUsername}
//                   onChange={(e) => setPageUsername(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="username"
//                 />
//                 <button
//                   onClick={handleCreatePage}
//                   className="bg-violet-600 p-3"
//                 >
//                   Create Page
//                 </button>
//               </>
//             ) : (
//               <>
//                 <p className="mb-4">
//                   Public URL:{" "}
//                   <a
//                     href={`http://localhost:5173/u/${pageData.username}`}
//                     className="text-violet-400 underline"
//                   >
//                     http://localhost:5173/u/{pageData.username}
//                   </a>
//                 </p>

//                 <input
//                   value={linkLabel}
//                   onChange={(e) => setLinkLabel(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Label"
//                 />
//                 <input
//                   value={linkUrl}
//                   onChange={(e) => setLinkUrl(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="URL"
//                 />
//                 <button
//                   onClick={handleAddLink}
//                   className="bg-violet-600 p-3"
//                 >
//                   Add Link
//                 </button>
//               </>
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// }


























//// -----------> final
// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { createShortUrl, getUserUrls } from "../api/url.api";
// import { getAnalytics } from "../api/analytics.api";
// import { createPage } from "../api/page.api";

// import {
//   Link2,
//   QrCode,
//   LayoutGrid,
//   BarChart3,
//   Copy,
//   Check,
//   Download,
// } from "lucide-react";

// export default function URLShortener() {
//   const [activeTab, setActiveTab] = useState("home");

//   /* ================= DASHBOARD ================= */
//   const [url, setUrl] = useState("");
//   const [customAlias, setCustomAlias] = useState("");
//   const [shortUrl, setShortUrl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [links, setLinks] = useState([]);

//   /* ================= QR ================= */
//   const [qrInput, setQrInput] = useState("");
//   const [qrGenerated, setQrGenerated] = useState("");

//   /* ================= ANALYTICS ================= */
//   const [analyticsInput, setAnalyticsInput] = useState("");
//   const [analyticsData, setAnalyticsData] = useState(null);

//   /* ================= PAGES ================= */
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageUsername, setPageUsername] = useState("");
//   const [pageData, setPageData] = useState(null);

//   const [linkLabel, setLinkLabel] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   /* ================= LOGOUT ================= */
//   const handleLogout = async () => {
//     await api.post("/user/logout");
//     window.location.href = "/login";
//   };

//   /* ================= FETCH USER URLS ================= */
//   useEffect(() => {
//     (async () => {
//       const res = await getUserUrls();
//       setLinks(
//         res.data.urls.map((u) => ({
//           id: u._id,
//           shortId: u.shortId,
//           original: u.redirectURL,
//           short: `http://localhost:8002/url/${u.shortId}`,
//           clicks: u.visitHistory.length,
//         }))
//       );
//     })();
//   }, []);

//   /* ================= SHORTEN ================= */
//   const handleShorten = async () => {
//     const res = await createShortUrl(url, customAlias);

//     const newLink = {
//       id: res.data.shortId,
//       shortId: res.data.shortId,
//       original: url,
//       short: res.data.shortUrl,
//       clicks: 0,
//     };

//     setLinks((prev) => [newLink, ...prev]);
//     setShortUrl(res.data.shortUrl);
//     setUrl("");
//     setCustomAlias("");
//   };

//   /* ================= COPY ================= */
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };

//   /* ================= GENERATE QR (ONLY CHANGE) ================= */

// const handleGenerateQR = async () => {
//   if (!qrInput.trim()) {
//     alert("Paste any URL or text");
//     return;
//   }

//   const encoded = encodeURIComponent(qrInput.trim());
//   const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;

//   setQrGenerated(qrUrl);
// };

//   /* ================= DOWNLOAD QR ================= */
//   const downloadQR = (shortId) => {
//     window.open(
//       `http://localhost:8002/url/qr/${shortId}/download`,
//       "_blank"
//     );
//   };

//   /* ================= ANALYTICS ================= */
//   const handleFetchAnalytics = async () => {
//     try {
//       const shortId = analyticsInput.trim().split("/").pop();
//       const res = await getAnalytics(shortId);
//       setAnalyticsData(res.data);
//     } catch {
//       alert("Analytics not found");
//     }
//   };

//   /* ================= PAGES ================= */
//   useEffect(() => {
//     if (activeTab !== "pages" || !pageUsername) return;

//     (async () => {
//       try {
//         const res = await api.get(`/page/${pageUsername}`);
//         setPageData(res.data);
//       } catch {
//         setPageData(null);
//       }
//     })();
//   }, [activeTab, pageUsername]);

//   const handleCreatePage = async () => {
//     await createPage({ title: pageTitle, username: pageUsername });
//     const res = await api.get(`/page/${pageUsername}`);
//     setPageData(res.data);
//   };

//   const handleAddLink = async () => {
//     if (!linkLabel || !linkUrl) return alert("Required");

//     const res = await api.post(`/page/${pageUsername}/link`, {
//       label: linkLabel,
//       url: linkUrl,
//     });

//     setPageData(res.data.page);
//     setLinkLabel("");
//     setLinkUrl("");
//   };

//   /* ================= UI ================= */
//   const NavButton = ({ icon: Icon, label, tab }) => (
//     <button
//       onClick={() => setActiveTab(tab)}
//       className={`flex items-center gap-3 px-4 py-3 rounded ${
//         activeTab === tab
//           ? "bg-violet-600 text-white"
//           : "text-gray-400 hover:bg-gray-800"
//       }`}
//     >
//       <Icon size={20} /> {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-black text-white flex">
//       <aside className="w-64 border-r border-gray-800 p-6 space-y-2">
//         <button
//           onClick={handleLogout}
//           className="w-full text-left text-red-400 hover:bg-gray-800 px-4 py-3 rounded"
//         >
//           Logout
//         </button>

//         <NavButton icon={Link2} label="Dashboard" tab="home" />
//         <NavButton icon={QrCode} label="QR Codes" tab="qr" />
//         <NavButton icon={LayoutGrid} label="Pages" tab="pages" />
//         <NavButton icon={BarChart3} label="Analytics" tab="analytics" />
//       </aside>

//       <main className="flex-1 p-8 overflow-auto">

//         {/* DASHBOARD */}
//         {activeTab === "home" && (
//           <>
//             <input
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Paste URL"
//             />
//             <input
//               value={customAlias}
//               onChange={(e) => setCustomAlias(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Custom alias (optional)"
//             />
//             <button onClick={handleShorten} className="bg-violet-600 p-3">
//               Shorten
//             </button>

//             {shortUrl && (
//               <div className="mt-4 flex gap-2 items-center">
//                 <span>{shortUrl}</span>
//                 <button onClick={() => copyToClipboard(shortUrl)}>
//                   {copied ? <Check /> : <Copy />}
//                 </button>
//               </div>
//             )}

//             <div className="mt-8 space-y-3">
//               {links.map((link) => (
//                 <div key={link.id} className="bg-gray-900 p-4 rounded">
//                   <p className="text-violet-400">{link.short}</p>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* QR TAB */}
//         {activeTab === "qr" && (
//           <>
//             <input
//               value={qrInput}
//               onChange={(e) => setQrInput(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Paste short URL or shortId"
//             />

//             <button onClick={handleGenerateQR} className="bg-violet-600 p-3">
//               Generate QR
//             </button>

//             {qrGenerated && (
//               <div className="mt-4">
//                 <img src={qrGenerated} className="w-48 mb-2" />
//                 <button
//                   onClick={() =>
//                     downloadQR(qrInput.trim().split("/").pop())
//                   }
//                   className="text-violet-400 underline"
//                 >
//                   Download QR
//                 </button>
//               </div>
//             )}
//           </>
//         )}

//         {/* ANALYTICS */}
//         {activeTab === "analytics" && (
//           <>
//             <input
//               value={analyticsInput}
//               onChange={(e) => setAnalyticsInput(e.target.value)}
//               className="w-full p-3 bg-gray-800"
//               placeholder="Paste shortId"
//             />
//             <button
//               onClick={handleFetchAnalytics}
//               className="mt-3 bg-violet-600 p-3"
//             >
//               View Analytics
//             </button>

//             {analyticsData && (
//               <pre className="mt-6 bg-gray-900 p-4 text-sm overflow-auto">
//                 {JSON.stringify(analyticsData, null, 2)}
//               </pre>
//             )}
//           </>
//         )}

//         {/* PAGES */}
//         {activeTab === "pages" && (
//           <>
//             {!pageData ? (
//               <>
//                 <input
//                   value={pageTitle}
//                   onChange={(e) => setPageTitle(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Page title"
//                 />
//                 <input
//                   value={pageUsername}
//                   onChange={(e) => setPageUsername(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="username"
//                 />
//                 <button
//                   onClick={handleCreatePage}
//                   className="bg-violet-600 p-3"
//                 >
//                   Create Page
//                 </button>
//               </>
//             ) : (
//               <>
//                 <p className="mb-4">
//                   Public URL:{" "}
//                   <a
//                     href={`http://localhost:5173/u/${pageData.username}`}
//                     className="text-violet-400 underline"
//                   >
//                     http://localhost:5173/u/{pageData.username}
//                   </a>
//                 </p>

//                 <input
//                   value={linkLabel}
//                   onChange={(e) => setLinkLabel(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Label"
//                 />
//                 <input
//                   value={linkUrl}
//                   onChange={(e) => setLinkUrl(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="URL"
//                 />
//                 <button
//                   onClick={handleAddLink}
//                   className="bg-violet-600 p-3"
//                 >
//                   Add Link
//                 </button>
//               </>
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// }










// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { createShortUrl, getUserUrls } from "../api/url.api";
// import { getAnalytics } from "../api/analytics.api";
// import { createPage } from "../api/page.api";

// import {
//   Link2,
//   QrCode,
//   LayoutGrid,
//   BarChart3,
//   Copy,
//   Check,
//   Download,
// } from "lucide-react";

// export default function URLShortener() {
//   const [activeTab, setActiveTab] = useState("home");

//   /* ================= DASHBOARD ================= */
//   const [url, setUrl] = useState("");
//   const [customAlias, setCustomAlias] = useState("");
//   const [shortUrl, setShortUrl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [links, setLinks] = useState([]);

//   /* ================= QR ================= */
//   const [qrPreview, setQrPreview] = useState(""); // preview ONLY after creation

//   /* ================= ANALYTICS ================= */
//   const [analyticsInput, setAnalyticsInput] = useState("");
//   const [analyticsData, setAnalyticsData] = useState(null);

//   /* ================= PAGES ================= */
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageUsername, setPageUsername] = useState("");
//   const [pageData, setPageData] = useState(null);

//   const [linkLabel, setLinkLabel] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   /* ================= LOGOUT ================= */
//   const handleLogout = async () => {
//     await api.post("/user/logout");
//     window.location.href = "/login";
//   };

//   /* ================= FETCH USER URLS ================= */
//   useEffect(() => {
//     (async () => {
//       const res = await getUserUrls();
//       setLinks(
//         res.data.urls.map((u) => ({
//           id: u._id,
//           shortId: u.shortId,
//           original: u.redirectURL,
//           short: `http://localhost:8002/url/${u.shortId}`,
//           clicks: u.visitHistory.length,
//         }))
//       );
//     })();
//   }, []);

//   /* ================= SHORTEN ================= */
//   const handleShorten = async () => {
//     const res = await createShortUrl(url, customAlias);

//     const newLink = {
//       id: res.data.shortId,
//       shortId: res.data.shortId,
//       original: url,
//       short: res.data.shortUrl,
//       clicks: 0,
//     };

//     setLinks((prev) => [newLink, ...prev]);
//     setShortUrl(res.data.shortUrl);
//     setQrPreview(res.data.qrCode); // ✅ preview only here
//     setUrl("");
//     setCustomAlias("");
//   };

//   /* ================= COPY ================= */
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };

//   /* ================= DOWNLOAD QR ================= */
//   const downloadQR = (shortId) => {
//     window.open(
//       `http://localhost:8002/url/qr/${shortId}/download`,
//       "_blank"
//     );
//   };

//   /* ================= ANALYTICS ================= */
//   const handleFetchAnalytics = async () => {
//     try {
//       const shortId = analyticsInput.trim().split("/").pop();
//       const res = await getAnalytics(shortId);
//       setAnalyticsData(res.data);
//     } catch {
//       alert("Not allowed");
//     }
//   };

//   /* ================= PAGES ================= */
//   useEffect(() => {
//     if (activeTab !== "pages") return;

//     (async () => {
//       try {
//         const me = await api.get("/user/me");
//         if (!me.data?.user) return;

//         const username = me.data.user.username;
//         setPageUsername(username);

//         const res = await api.get(`/page/${username}`);
//         setPageData(res.data);
//       } catch {
//         setPageData(null);
//       }
//     })();
//   }, [activeTab]);

//   const handleCreatePage = async () => {
//     await createPage({ title: pageTitle, username: pageUsername });
//     const res = await api.get(`/page/${pageUsername}`);
//     setPageData(res.data);
//   };

//   const handleAddLink = async () => {
//     if (!linkLabel || !linkUrl) return alert("Required");

//     const res = await api.post(`/page/${pageUsername}/link`, {
//       label: linkLabel,
//       url: linkUrl,
//     });

//     setPageData(res.data.page);
//     setLinkLabel("");
//     setLinkUrl("");
//   };

//   /* ================= UI ================= */
//   const NavButton = ({ icon: Icon, label, tab }) => (
//     <button
//       onClick={() => setActiveTab(tab)}
//       className={`flex items-center gap-3 px-4 py-3 rounded ${
//         activeTab === tab
//           ? "bg-violet-600 text-white"
//           : "text-gray-400 hover:bg-gray-800"
//       }`}
//     >
//       <Icon size={20} /> {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-black text-white flex">
//       <aside className="w-64 border-r border-gray-800 p-6 space-y-2">
//         <button
//           onClick={handleLogout}
//           className="w-full text-left text-red-400 hover:bg-gray-800 px-4 py-3 rounded"
//         >
//           Logout
//         </button>

//         <NavButton icon={Link2} label="Dashboard" tab="home" />
//         <NavButton icon={QrCode} label="QR Codes" tab="qr" />
//         <NavButton icon={LayoutGrid} label="Pages" tab="pages" />
//         <NavButton icon={BarChart3} label="Analytics" tab="analytics" />
//       </aside>

//       <main className="flex-1 p-8 overflow-auto">

//         {/* DASHBOARD */}
//         {activeTab === "home" && (
//           <>
//             <input
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Paste URL"
//             />
//             <input
//               value={customAlias}
//               onChange={(e) => setCustomAlias(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Custom alias (optional)"
//             />
//             <button onClick={handleShorten} className="bg-violet-600 p-3">
//               Shorten
//             </button>

//             {shortUrl && (
//               <div className="mt-4">
//                 <p>{shortUrl}</p>

//                 {qrPreview && (
//                   <img src={qrPreview} className="w-48 mt-3" />
//                 )}
//               </div>
//             )}

//             <div className="mt-8 space-y-3">
//               {links.map((link) => (
//                 <div key={link.id} className="bg-gray-900 p-4 rounded">
//                   <p className="text-violet-400">{link.short}</p>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* QR TAB */}
//         {activeTab === "qr" && (
//           <>
//             <h2 className="text-xl mb-4">Your QR Codes</h2>
//             {links.map((link) => (
//               <div key={link.id} className="bg-gray-900 p-4 mb-3 rounded">
//                 <p className="text-violet-400">{link.short}</p>
//                 <button
//                   onClick={() => downloadQR(link.shortId)}
//                   className="flex items-center gap-2 text-sm text-violet-400 mt-2"
//                 >
//                   <Download size={16} /> Download QR
//                 </button>
//               </div>
//             ))}
//           </>
//         )}

//         {/* ANALYTICS */}
//         {activeTab === "analytics" && (
//           <>
//             <input
//               value={analyticsInput}
//               onChange={(e) => setAnalyticsInput(e.target.value)}
//               className="w-full p-3 bg-gray-800"
//               placeholder="Paste shortId"
//             />
//             <button
//               onClick={handleFetchAnalytics}
//               className="mt-3 bg-violet-600 p-3"
//             >
//               View Analytics
//             </button>

//             {analyticsData && (
//               <pre className="mt-6 bg-gray-900 p-4">
//                 {JSON.stringify(analyticsData, null, 2)}
//               </pre>
//             )}
//           </>
//         )}

//         {/* PAGES */}
//         {activeTab === "pages" && (
//           <>
//             {!pageData ? (
//               <>
//                 <input
//                   value={pageTitle}
//                   onChange={(e) => setPageTitle(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Page title"
//                 />
//                 <button
//                   onClick={handleCreatePage}
//                   className="bg-violet-600 p-3"
//                 >
//                   Create Page
//                 </button>
//               </>
//             ) : (
//               <>
//                 <p className="mb-4">
//                   Public URL:{" "}
//                   <a
//                     href={`http://localhost:5173/u/${pageData.username}`}
//                     className="text-violet-400 underline"
//                   >
//                     http://localhost:5173/u/{pageData.username}
//                   </a>
//                 </p>

//                 <input
//                   value={linkLabel}
//                   onChange={(e) => setLinkLabel(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Label"
//                 />
//                 <input
//                   value={linkUrl}
//                   onChange={(e) => setLinkUrl(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="URL"
//                 />
//                 <button
//                   onClick={handleAddLink}
//                   className="bg-violet-600 p-3"
//                 >
//                   Add Link
//                 </button>
//               </>
//             )}
//           </>
//         )}

//       </main>
//     </div>
//   );
// }


// // ---->>>>>>****
// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { createShortUrl, getUserUrls } from "../api/url.api";
// import { getAnalytics } from "../api/analytics.api";
// import { createPage } from "../api/page.api";

// import {
//   Link2,
//   QrCode,
//   LayoutGrid,
//   BarChart3,
//   Copy,
//   Check,
//   Download,
// } from "lucide-react";

// export default function URLShortener() {
//   const [activeTab, setActiveTab] = useState("home");

//   /* ================= DASHBOARD ================= */
//   const [url, setUrl] = useState("");
//   const [customAlias, setCustomAlias] = useState("");
//   const [shortUrl, setShortUrl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [links, setLinks] = useState([]);

//   /* ================= QR ================= */
//   const [qrInput, setQrInput] = useState("");
//   const [qrGenerated, setQrGenerated] = useState("");

//   /* ================= ANALYTICS ================= */
//   const [analyticsInput, setAnalyticsInput] = useState("");
//   const [analyticsData, setAnalyticsData] = useState(null);

//   /* ================= PAGES ================= */
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageUsername, setPageUsername] = useState("");
//   const [pageData, setPageData] = useState(null);

//   const [linkLabel, setLinkLabel] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   /* ================= LOGOUT ================= */
//   const handleLogout = async () => {
//     await api.post("/user/logout");
//     window.location.href = "/login";
//   };

//   /* ================= FETCH USER URLS ================= */
//   useEffect(() => {
//     (async () => {
//       const res = await getUserUrls();
//       setLinks(
//         res.data.urls.map((u) => ({
//           id: u._id,
//           shortId: u.shortId,
//           original: u.redirectURL,
//           short: `http://localhost:8002/url/${u.shortId}`,
//           clicks: u.visitHistory.length,
//         }))
//       );
//     })();
//   }, []);

//   /* ================= SHORTEN ================= */
//   const handleShorten = async () => {
//     const res = await createShortUrl(url, customAlias);

//     const newLink = {
//       id: res.data.shortId,
//       shortId: res.data.shortId,
//       original: url,
//       short: res.data.shortUrl,
//       clicks: 0,
//     };

//     setLinks((prev) => [newLink, ...prev]);
//     setShortUrl(res.data.shortUrl);
//     setUrl("");
//     setCustomAlias("");
//   };

//   /* ================= COPY ================= */
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };

//   /* ================= GENERATE QR ================= */
//   const handleGenerateQR = async () => {
//     try {
//       const shortId = qrInput.trim().split("/").pop();
//       const res = await api.get(`/url/qr/${shortId}`);
//       setQrGenerated(res.data.qrCode);
//     } catch {
//       alert("QR not found");
//     }
//   };

//   /* ================= DOWNLOAD QR ================= */
//   const downloadQR = (shortId) => {
//     window.open(
//       `http://localhost:8002/url/qr/${shortId}/download`,
//       "_blank"
//     );
//   };

//   /* ================= ANALYTICS ================= */
//   const handleFetchAnalytics = async () => {
//     const shortId = analyticsInput.trim().split("/").pop();
//     const res = await getAnalytics(shortId);
//     setAnalyticsData(res.data);
//   };

//   /* ================= PAGES ================= */
//   useEffect(() => {
//     if (activeTab !== "pages") return;

//     (async () => {
//       try {
//         const me = await api.get("/user/me");
//         if (!me.data?.user) return;

//         const username = me.data.user.username;
//         setPageUsername(username);

//         const res = await api.get(`/page/${username}`);
//         setPageData(res.data);
//       } catch {
//         setPageData(null);
//       }
//     })();
//   }, [activeTab]);

//   const handleCreatePage = async () => {
//     await createPage({ title: pageTitle, username: pageUsername });
//     const res = await api.get(`/page/${pageUsername}`);
//     setPageData(res.data);
//   };

//   const handleAddLink = async () => {
//     if (!linkLabel || !linkUrl) return alert("Required");

//     const res = await api.post(`/page/${pageUsername}/link`, {
//       label: linkLabel,
//       url: linkUrl,
//     });

//     setPageData(res.data.page);
//     setLinkLabel("");
//     setLinkUrl("");
//   };

//   /* ================= UI ================= */
//   const NavButton = ({ icon: Icon, label, tab }) => (
//     <button
//       onClick={() => setActiveTab(tab)}
//       className={`flex items-center gap-3 px-4 py-3 rounded ${
//         activeTab === tab
//           ? "bg-violet-600 text-white"
//           : "text-gray-400 hover:bg-gray-800"
//       }`}
//     >
//       <Icon size={20} /> {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-black text-white flex">
//       <aside className="w-64 border-r border-gray-800 p-6 space-y-2">
//         <button
//           onClick={handleLogout}
//           className="w-full text-left text-red-400 hover:bg-gray-800 px-4 py-3 rounded"
//         >
//           Logout
//         </button>

//         <NavButton icon={Link2} label="Dashboard" tab="home" />
//         <NavButton icon={QrCode} label="QR Codes" tab="qr" />
//         <NavButton icon={LayoutGrid} label="Pages" tab="pages" />
//         <NavButton icon={BarChart3} label="Analytics" tab="analytics" />
//       </aside>

//       <main className="flex-1 p-8 overflow-auto">

//         {/* DASHBOARD */}
//         {activeTab === "home" && (
//           <>
//             <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Paste URL" />
//             <input value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Custom alias (optional)" />
//             <button onClick={handleShorten} className="bg-violet-600 p-3">Shorten</button>

//             {shortUrl && (
//               <div className="mt-4 flex gap-2 items-center">
//                 <span>{shortUrl}</span>
//                 <button onClick={() => copyToClipboard(shortUrl)}>
//                   {copied ? <Check /> : <Copy />}
//                 </button>
//               </div>
//             )}

//             <div className="mt-8 space-y-3">
//               {links.map((link) => (
//                 <div key={link.id} className="bg-gray-900 p-4 rounded">
//                   <p className="text-violet-400">{link.short}</p>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* QR */}
//         {activeTab === "qr" && (
//           <>
//             <h2 className="text-xl mb-4">Generate QR</h2>

//             <input
//               value={qrInput}
//               onChange={(e) => setQrInput(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Paste short URL or shortId"
//             />

//             <button onClick={handleGenerateQR} className="bg-violet-600 p-3">
//               Generate QR
//             </button>

//             {qrGenerated && (
//               <div className="mt-4">
//                 <img src={qrGenerated} className="w-48 mb-2" />
//                 <button
//                   onClick={() => downloadQR(qrInput.trim().split("/").pop())}
//                   className="text-violet-400 underline"
//                 >
//                   Download QR
//                 </button>
//               </div>
//             )}

//             <h3 className="text-lg mt-8 mb-3">Your Existing QR Codes</h3>
//             {links.map((link) => (
//               <div key={link.id} className="bg-gray-900 p-4 mb-3 rounded">
//                 <p className="text-violet-400">{link.short}</p>
//                 <button
//                   onClick={() => downloadQR(link.shortId)}
//                   className="flex items-center gap-2 text-sm text-violet-400 mt-2"
//                 >
//                   <Download size={16} /> Download QR
//                 </button>
//               </div>
//             ))}
//           </>
//         )}

//         {/* ANALYTICS */}
//         {activeTab === "analytics" && (
//           <>
//             <input
//               value={analyticsInput}
//               onChange={(e) => setAnalyticsInput(e.target.value)}
//               className="w-full p-3 bg-gray-800"
//               placeholder="Paste shortId"
//             />
//             <button onClick={handleFetchAnalytics} className="mt-3 bg-violet-600 p-3">
//               View Analytics
//             </button>

//             {analyticsData && (
//               <pre className="mt-6 bg-gray-900 p-4">
//                 {JSON.stringify(analyticsData, null, 2)}
//               </pre>
//             )}
//           </>
//         )}

//         {/* PAGES */}
//         {activeTab === "pages" && (
//           <>
//             {!pageData ? (
//               <>
//                 <input
//                   value={pageTitle}
//                   onChange={(e) => setPageTitle(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Page title"
//                 />
//                 <button onClick={handleCreatePage} className="bg-violet-600 p-3">
//                   Create Page
//                 </button>
//               </>
//             ) : (
//               <>
//                 <p className="mb-4">
//                   Public URL:{" "}
//                   <a
//                     href={`http://localhost:5173/u/${pageData.username}`}
//                     className="text-violet-400 underline"
//                   >
//                     http://localhost:5173/u/{pageData.username}
//                   </a>
//                 </p>

//                 <input
//                   value={linkLabel}
//                   onChange={(e) => setLinkLabel(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="Label"
//                 />
//                 <input
//                   value={linkUrl}
//                   onChange={(e) => setLinkUrl(e.target.value)}
//                   className="w-full p-3 bg-gray-800 mb-2"
//                   placeholder="URL"
//                 />
//                 <button onClick={handleAddLink} className="bg-violet-600 p-3">
//                   Add Link
//                 </button>
//               </>
//             )}
//           </>
//         )}

//       </main>
//     </div>
//   );
// }








// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { createShortUrl, getUserUrls } from "../api/url.api";
// import { getAnalytics } from "../api/analytics.api";
// import { createPage } from "../api/page.api";

// import {
//   Link2,
//   QrCode,
//   LayoutGrid,
//   BarChart3,
//   Copy,
//   Check,
//   Download,
// } from "lucide-react";

// export default function URLShortener() {
//   const [activeTab, setActiveTab] = useState("home");

//   /* ================= DASHBOARD ================= */
//   const [url, setUrl] = useState("");
//   const [customAlias, setCustomAlias] = useState("");
//   const [shortUrl, setShortUrl] = useState("");
//   const [copied, setCopied] = useState(false);
//   const [links, setLinks] = useState([]);

//   /* ================= QR ================= */
//   const [qrPreview, setQrPreview] = useState(""); // after shorten
//   const [qrInput, setQrInput] = useState("");     // 🔥 ADDED
//   const [qrGenerated, setQrGenerated] = useState(""); // 🔥 ADDED

//   /* ================= ANALYTICS ================= */
//   const [analyticsInput, setAnalyticsInput] = useState("");
//   const [analyticsData, setAnalyticsData] = useState(null);

//   /* ================= PAGES ================= */
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageUsername, setPageUsername] = useState("");
//   const [pageData, setPageData] = useState(null);

//   const [linkLabel, setLinkLabel] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   /* ================= LOGOUT ================= */
//   const handleLogout = async () => {
//     await api.post("/user/logout");
//     window.location.href = "/login";
//   };

//   /* ================= FETCH USER URLS ================= */
//   useEffect(() => {
//     (async () => {
//       const res = await getUserUrls();
//       setLinks(
//         res.data.urls.map((u) => ({
//           id: u._id,
//           shortId: u.shortId,
//           original: u.redirectURL,
//           short: `http://localhost:8002/url/${u.shortId}`,
//           clicks: u.visitHistory.length,
//         }))
//       );
//     })();
//   }, []);

//   /* ================= SHORTEN ================= */
//   const handleShorten = async () => {
//     const res = await createShortUrl(url, customAlias);

//     const newLink = {
//       id: res.data.shortId,
//       shortId: res.data.shortId,
//       original: url,
//       short: res.data.shortUrl,
//       clicks: 0,
//     };

//     setLinks((prev) => [newLink, ...prev]);
//     setShortUrl(res.data.shortUrl);
//     setQrPreview(res.data.qrCode);
//     setUrl("");
//     setCustomAlias("");
//   };

//   /* ================= COPY ================= */
//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1500);
//   };

//   /* ================= GENERATE QR (🔥 ADDED) ================= */
//   const handleGenerateQR = async () => {
//     try {
//       const shortId = qrInput.trim().split("/").pop();
//       const res = await api.get(`/url/qr/${shortId}`);
//       setQrGenerated(res.data.qrCode);
//     } catch {
//       alert("QR not found or not allowed");
//     }
//   };

//   /* ================= DOWNLOAD QR ================= */
//   const downloadQR = (shortId) => {
//     window.open(
//       `http://localhost:8002/url/qr/${shortId}/download`,
//       "_blank"
//     );
//   };

//   /* ================= ANALYTICS ================= */
//   const handleFetchAnalytics = async () => {
//     try {
//       const shortId = analyticsInput.trim().split("/").pop();
//       const res = await getAnalytics(shortId);
//       setAnalyticsData(res.data);
//     } catch {
//       alert("Not allowed");
//     }
//   };

//   /* ================= PAGES ================= */
//   useEffect(() => {
//     if (activeTab !== "pages") return;

//     (async () => {
//       try {
//         const me = await api.get("/user/me");
//         if (!me.data?.user) return;

//         const username = me.data.user.username;
//         setPageUsername(username);

//         const res = await api.get(`/page/${username}`);
//         setPageData(res.data);
//       } catch {
//         setPageData(null);
//       }
//     })();
//   }, [activeTab]);

//   const handleCreatePage = async () => {
//     await createPage({ title: pageTitle, username: pageUsername });
//     const res = await api.get(`/page/${pageUsername}`);
//     setPageData(res.data);
//   };

//   const handleAddLink = async () => {
//     if (!linkLabel || !linkUrl) return alert("Required");

//     const res = await api.post(`/page/${pageUsername}/link`, {
//       label: linkLabel,
//       url: linkUrl,
//     });

//     setPageData(res.data.page);
//     setLinkLabel("");
//     setLinkUrl("");
//   };

//   /* ================= UI ================= */
//   const NavButton = ({ icon: Icon, label, tab }) => (
//     <button
//       onClick={() => setActiveTab(tab)}
//       className={`flex items-center gap-3 px-4 py-3 rounded ${
//         activeTab === tab
//           ? "bg-violet-600 text-white"
//           : "text-gray-400 hover:bg-gray-800"
//       }`}
//     >
//       <Icon size={20} /> {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-black text-white flex">
//       <aside className="w-64 border-r border-gray-800 p-6 space-y-2">
//         <button
//           onClick={handleLogout}
//           className="w-full text-left text-red-400 hover:bg-gray-800 px-4 py-3 rounded"
//         >
//           Logout
//         </button>

//         <NavButton icon={Link2} label="Dashboard" tab="home" />
//         <NavButton icon={QrCode} label="QR Codes" tab="qr" />
//         <NavButton icon={LayoutGrid} label="Pages" tab="pages" />
//         <NavButton icon={BarChart3} label="Analytics" tab="analytics" />
//       </aside>

//       <main className="flex-1 p-8 overflow-auto">

//         {/* DASHBOARD */}
//         {activeTab === "home" && (
//           <>
//             <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Paste URL" />
//             <input value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Custom alias (optional)" />
//             <button onClick={handleShorten} className="bg-violet-600 p-3">Shorten</button>

//             {shortUrl && (
//               <div className="mt-4">
//                 <p>{shortUrl}</p>
//                 {qrPreview && <img src={qrPreview} className="w-48 mt-3" />}
//               </div>
//             )}
//           </>
//         )}

//         {/* QR TAB */}
//         {activeTab === "qr" && (
//           <>
//             <h2 className="text-xl mb-4">Generate QR</h2>

//             <input
//               value={qrInput}
//               onChange={(e) => setQrInput(e.target.value)}
//               className="w-full p-3 bg-gray-800 mb-2"
//               placeholder="Paste short URL or shortId"
//             />

//             <button onClick={handleGenerateQR} className="bg-violet-600 p-3">
//               Generate QR
//             </button>

//             {qrGenerated && (
//               <div className="mt-4">
//                 <img src={qrGenerated} className="w-48 mb-2" />
//                 <button
//                   onClick={() =>
//                     downloadQR(qrInput.trim().split("/").pop())
//                   }
//                   className="text-violet-400 underline"
//                 >
//                   Download QR
//                 </button>
//               </div>
//             )}

//             <h3 className="text-lg mt-8 mb-3">Your QR Codes</h3>
//             {links.map((link) => (
//               <div key={link.id} className="bg-gray-900 p-4 mb-3 rounded">
//                 <p className="text-violet-400">{link.short}</p>
//                 <button
//                   onClick={() => downloadQR(link.shortId)}
//                   className="flex items-center gap-2 text-sm text-violet-400 mt-2"
//                 >
//                   <Download size={16} /> Download QR
//                 </button>
//               </div>
//             ))}
//           </>
//         )}

//         {/* ANALYTICS */}
//         {activeTab === "analytics" && (
//           <>
//             <input value={analyticsInput} onChange={(e) => setAnalyticsInput(e.target.value)} className="w-full p-3 bg-gray-800" placeholder="Paste shortId" />
//             <button onClick={handleFetchAnalytics} className="mt-3 bg-violet-600 p-3">View Analytics</button>
//             {analyticsData && <pre className="mt-6 bg-gray-900 p-4">{JSON.stringify(analyticsData, null, 2)}</pre>}
//           </>
//         )}

//         {/* PAGES */}
//         {activeTab === "pages" && (
//           <>
//             {!pageData ? (
//               <>
//                 <input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Page title" />
//                 <button onClick={handleCreatePage} className="bg-violet-600 p-3">Create Page</button>
//               </>
//             ) : (
//               <>
//                 <p className="mb-4">
//                   Public URL:{" "}
//                   <a href={`http://localhost:5173/u/${pageData.username}`} className="text-violet-400 underline">
//                     http://localhost:5173/u/{pageData.username}
//                   </a>
//                 </p>

//                 <input value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="Label" />
//                 <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full p-3 bg-gray-800 mb-2" placeholder="URL" />
//                 <button onClick={handleAddLink} className="bg-violet-600 p-3">Add Link</button>
//               </>
//             )}
//           </>
//         )}

//       </main>
//     </div>
//   );
// }



























//working

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { createShortUrl, getUserUrls } from "../api/url.api";
import { getAnalytics } from "../api/analytics.api";
import { createPage } from "../api/page.api";
import {
  Link2,
  QrCode,
  LayoutGrid,
  BarChart3,
  Copy,
  Check,
  Download,
  LogOut,
} from "lucide-react";

import {
  Link,
  MousePointerClick,
  Sparkles,
} from "lucide-react";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const Card = ({ children }) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
      {children}
    </div>
  );
};


export default function URLShortener() {
  const [activeTab, setActiveTab] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);


  /* ================= DASHBOARD ================= */
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
//   const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
// const [copiedId, setCopiedId] = useState(null);

  const [links, setLinks] = useState([]);
 



  /* ================= QR ================= */
  const [qrInput, setQrInput] = useState("");
  const [qrGenerated, setQrGenerated] = useState("");

  /* ================= ANALYTICS ================= */
  const [analyticsInput, setAnalyticsInput] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);

  /* ================= PAGES ================= */
  const [pageTitle, setPageTitle] = useState("");
  const [pageUsername, setPageUsername] = useState("");
  const [pageData, setPageData] = useState(null);
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await api.post("/user/logout");
    window.location.href = "/login";
  };

  /* ================= FETCH USER URLS ================= */
  useEffect(() => {
    (async () => {
      const res = await getUserUrls();
      setLinks(
        res.data.urls.map((u) => ({
          id: u._id,
          shortId: u.shortId,
          original: u.redirectURL,
          short: `${BACKEND_URL}/url/${u.shortId}`,
          clicks: u.visitHistory.length,
        }))
      );
    })();
  }, []);

  /* ================= SHORTEN ================= */




const handleShorten = async () => {
  try {
    const res = await createShortUrl(url, customAlias);

    setLinks((prev) => [
      {
        id: res.data.shortId,
        shortId: res.data.shortId,
        original: url,
        short: res.data.shortUrl,
        clicks: 0,
      },
      ...prev,
    ]);

    setShortUrl(res.data.shortUrl);
    setUrl("");
    setCustomAlias("");

  } catch (err) {
    console.error("Shorten error:", err);

    // ✅ SAFE ERROR HANDLING (NO CRASH)
    if (err.response?.data?.error) {
      alert(err.response.data.error);
    } else {
      alert("Failed to create short URL");
    }
  }
};



const copyToClipboard = (text, id) => {
  navigator.clipboard.writeText(text);
  setCopiedId(id);

  setTimeout(() => {
    setCopiedId(null);
  }, 1500);
};



  /* ================= QR ================= */
  const handleGenerateQR = () => {
    if (!qrInput.trim()) return alert("Paste any URL");
    setQrGenerated(
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        qrInput
      )}`
    );
  };

//   const downloadQR = (shortId) => {
//     window.open(`http://localhost:8002/url/qr/${shortId}/download`, "_blank");
//   };
const downloadQR = async (qrUrl, filename = "qr-code.png") => {
  try {
    const response = await fetch(qrUrl);
    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    alert("Failed to download QR");
    console.error(err);
  }
};




  /* ================= ANALYTICS ================= */
  const handleFetchAnalytics = async () => {
    try {
      const shortId = analyticsInput.trim().split("/").pop();
      const res = await getAnalytics(shortId);
      setAnalyticsData(res.data);
    } catch {
      alert("Analytics not found");
    }
  };


useEffect(() => {
  if (activeTab !== "pages") return;

  api.get("/page/me")
    .then(res => setPageData(res.data))
    .catch(() => setPageData(null));
}, [activeTab]);



const handleCreatePage = async () => {
  if (!pageTitle.trim()) return alert("Title required");

  const res = await api.post("/page/create", { title: pageTitle });
  setPageData(res.data);
};





const handleAddLink = async () => {
  const res = await api.post("/page/link", {
    label: linkLabel,
    url: linkUrl,
  });

  setPageData(res.data);
};



const handleDeleteLink = async (linkId) => {
  try {
    const res = await api.delete(`/page/link/${linkId}`, {
      withCredentials: true,
    });

    setPageData(res.data); // refresh UI
  } catch (err) {
    alert("Failed to delete link");
    console.error(err);
  }
};

const handleDeletePage = async () => {
  const confirm = window.confirm(
    "Are you sure? This will delete your page and all links."
  );

  if (!confirm) return;

  try {
    await api.delete("/page/delete", { withCredentials: true });

    setPageData(null);      // reset UI
    setLinkLabel("");
    setLinkUrl("");
  } catch (err) {
    alert("Failed to delete page");
    console.error(err);
  }
};


  /* ================= UI HELPERS ================= */
  const NavButton = ({ icon: Icon, label, tab }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === tab
          ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
          : "text-slate-400 hover:bg-white/5"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );





  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* SIDEBAR */}
      <aside className="w-64 p-6 border-r border-white/10 space-y-4">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
          LinkShrink
        </h1>

        <NavButton icon={Link2} label="Dashboard" tab="home" />
        <NavButton icon={QrCode} label="QR Codes" tab="qr" />
        <NavButton icon={LayoutGrid} label="Pages" tab="pages" />
        <NavButton icon={BarChart3} label="Analytics" tab="analytics" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-slate-400 hover:text-red-400 mt-6"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10 overflow-auto">
        

          {/* ================= DASHBOARD ================= */}
          {/* {activeTab === "home" && (
            <Card >
              <h2 className="text-2xl font-semibold mb-6">
                Shorten Your Link
              </h2>

              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input"
                placeholder="Paste long URL"
              />
              <input
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="input mt-3"
                placeholder="Custom alias (optional)"
              />

              <button onClick={handleShorten} className="btn-primary mt-4">
                Shorten
              </button>

              {shortUrl && (
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-blue-400">{shortUrl}</span>
                 
                <button onClick={() => copyToClipboard(shortUrl, "single")}>
                {copiedId === "single" ? <Check size={18} /> : <Copy size={18} />}
          </button>


                </div>
              )}

             
<div className="mt-6 space-y-3">
 
  {links.map((l) => (
  <div
    key={l.id}
    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-center justify-between"
  >
    <div>
      <p className="text-blue-400 break-all">{l.short}</p>
      <p className="text-xs text-slate-400">Clicks: {l.clicks}</p>
    </div>

    <button
      onClick={() => copyToClipboard(l.short, l.id)}
      className="text-slate-400 hover:text-blue-400"
    >
      {copiedId === l.id ? <Check size={18} /> : <Copy size={18} />}
    </button>
  </div>
))}

</div>

</Card>
)} */}
{/* ================= DASHBOARD ================= */}
{activeTab === "home" && (
  <>
    {/* ===== TAGLINE / INTRO ===== */}
    <div className="mb-10">
      <h1 className="text-4xl font-bold mb-3 leading-tight">
        Short links.
        <span className="text-blue-400"> Powerful insights.</span>
      </h1>

      <p className="text-slate-400 max-w-2xl">
        <span className="text-white font-medium">LinkShrink</span> Shorten URLs, monitor link performance, generate QR codes, and create
public pages — all managed securely in one place.

      </p>
    </div>

    {/* ===== MAIN CARD (LOGIC UNCHANGED) ===== */}
    <Card>
      <h2 className="text-2xl font-semibold mb-6">
        Shorten Your Link
      </h2>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="input"
        placeholder="Paste long URL"
      />

      <input
        value={customAlias}
        onChange={(e) => setCustomAlias(e.target.value)}
        className="input mt-3"
        placeholder="Custom alias (optional)"
      />

      <button onClick={handleShorten} className="btn-primary mt-4">
        Shorten
      </button>

      {shortUrl && (
        <div className="flex items-center gap-3 mt-4">
          <span className="text-blue-400 break-all">
            {shortUrl}
          </span>

          <button onClick={() => copyToClipboard(shortUrl, "single")}>
            {copiedId === "single" ? (
              <Check size={18} />
            ) : (
              <Copy size={18} />
            )}
          </button>
        </div>
      )}

      {/* ===== USER LINKS LIST (UNCHANGED LOGIC) ===== */}
      <div className="mt-6 space-y-3">
        {links.map((l) => (
          <div
            key={l.id}
            className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-center justify-between"
          >
            <div>
              <p className="text-blue-400 break-all">
                {l.short}
              </p>
              <p className="text-xs text-slate-400">
                Clicks: {l.clicks}
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(l.short, l.id)}
              className="text-slate-400 hover:text-blue-400"
            >
              {copiedId === l.id ? (
                <Check size={18} />
              ) : (
                <Copy size={18} />
              )}
            </button>
          </div>
        ))}
      </div>
    </Card>
  </>
)}

          {/* ================= QR ================= */}
          {activeTab === "qr" && (
            <Card >
              <input
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="input"
                placeholder="Paste URL"
              />

              <button onClick={handleGenerateQR} className="btn-primary mt-3">
                Generate QR
              </button>

              {qrGenerated && (
                <img
                  src={qrGenerated}
                  className="mt-4 w-48 rounded-xl shadow-lg"
                />
              )}

            
              <div className="mt-6 space-y-4">
  {links.map((l) => (
    <div
      key={l.id}
      className="bg-white/5 p-4 rounded-xl flex items-center justify-between"
    >
      <div className="flex flex-col text-sm">
        <span className="text-slate-400">Short Link</span>
        <span className="text-blue-400 break-all">
          {l.short}
        </span>
      </div>

      {/* <button
        onClick={() => downloadQR(l.shortId)}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
      >
        <Download size={16} />
        Download QR

      </button> */}

       <button
  onClick={() =>
    downloadQR(
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        l.short
      )}`,
      `${l.shortId}.png`
    )
  }
  className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
>
  <Download size={16} />
  Download QR
</button>

    </div>
  ))}
</div>

            </Card>
          )}

          {/* ================= ANALYTICS ================= */}
          {activeTab === "analytics" && (
            <Card >
              <input
                value={analyticsInput}
                onChange={(e) => setAnalyticsInput(e.target.value)}
                className="input"
                placeholder="Paste short URL"
              />

              <button
                onClick={handleFetchAnalytics}
                className="btn-primary mt-3"
              >
                View Analytics
              </button>

              {analyticsData && (
  <div className="mt-6 space-y-4 text-sm">

    {/* Basic Info */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 p-4 rounded-xl">
        <p className="text-slate-400">Short ID</p>
        <p className="text-blue-400 font-medium">
          {analyticsData.shortId}
        </p>
      </div>

      <div className="bg-white/5 p-4 rounded-xl">
        <p className="text-slate-400">Total Clicks</p>
        <p className="text-2xl font-semibold text-white">
          {analyticsData.totalClicks}
        </p>
      </div>
    </div>

    {/* Redirect URL */}
    <div className="bg-white/5 p-4 rounded-xl">
      <p className="text-slate-400 mb-1">Redirect URL</p>
      <p className="text-blue-400 break-all">
        {analyticsData.redirectURL}
      </p>
    </div>

    {/* Time Info */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white/5 p-4 rounded-xl">
        <p className="text-slate-400">First Clicked</p>
        <p>
          {analyticsData.firstClicked
            ? new Date(analyticsData.firstClicked).toLocaleString()
            : "—"}
        </p>
      </div>

      <div className="bg-white/5 p-4 rounded-xl">
        <p className="text-slate-400">Last Clicked</p>
        <p>
          {analyticsData.lastClicked
            ? new Date(analyticsData.lastClicked).toLocaleString()
            : "—"}
        </p>
      </div>
    </div>

    {/* Clicks Per Day */}
    <div className="bg-white/5 p-4 rounded-xl">
      <p className="text-slate-400 mb-2">Clicks Per Day</p>

      {Object.keys(analyticsData.clicksPerDay || {}).length === 0 ? (
        <p className="text-slate-500">No click data available</p>
      ) : (
        <div className="space-y-2">
          {Object.entries(analyticsData.clicksPerDay).map(
            ([date, count]) => (
              <div
                key={date}
                className="flex justify-between bg-black/30 px-3 py-2 rounded-lg"
              >
                <span>{date}</span>
                <span className="text-blue-400 font-medium">
                  {count}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>

  </div>
)}

            </Card>
          )}

          {/* ================= PAGES ================= */}
          



{activeTab === "pages" && (
  <Card>

    {/* CASE 1: PAGE EXISTS */}
    {pageData ? (
      <>
        {/* PUBLIC LINK */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm">Your Public Page</p>
          <p className="text-blue-400 break-all">
            {FRONTEND_URL}/u/{pageData._id}
          </p>
        </div>

        <button
  onClick={handleDeletePage}
  className="mt-4 text-red-400 hover:text-red-500 text-sm"
>
  Delete Page
</button>


        {/* ADD LINK */}
        <input
          value={linkLabel}
          onChange={(e) => setLinkLabel(e.target.value)}
          className="input"
          placeholder="Link label"
        />

        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="input mt-3"
          placeholder="Link URL"
        />

        <button
          onClick={handleAddLink}
          className="btn-primary mt-4"
        >
          Add Link
        </button>

        {/* EXISTING LINKS */}
        <div className="mt-6 space-y-3">
          {pageData.links.map((l) => (
            <div
              key={l._id}
              className="bg-white/5 p-4 rounded-xl flex justify-between"
            >
              <span>{l.label}</span>
              <button
                onClick={() => handleDeleteLink(l._id)}
                className="text-red-400"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </>
    ) : (
      /* CASE 2: PAGE DOES NOT EXIST */
      <>
        <input
          value={pageTitle}
          onChange={(e) => setPageTitle(e.target.value)}
          className="input"
          placeholder="Page title"
        />

        <button
          onClick={handleCreatePage}
          className="btn-primary mt-4"
        >
          Create Page
        </button>
      </>
    )}

  </Card>
)}

        
      </main>

      {/* GLOBAL STYLES */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }
        .btn-primary {
          padding: 12px 22px;
          border-radius: 14px;
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          box-shadow: 0 15px 40px rgba(37, 99, 235, 0.35);
          transition: transform 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}


 










// import React, { useState, useEffect } from "react";
// import api from "../api/axios";
// import { createShortUrl, getUserUrls } from "../api/url.api";
// import { getAnalytics } from "../api/analytics.api";
// import { createPage } from "../api/page.api";
// import {
//   Link2,
//   QrCode,
//   LayoutGrid,
//   BarChart3,
//   Copy,
//   Check,
//   Download,
//   LogOut,
//   User,
//   Link as LinkIcon,
//   MousePointerClick,
//   Sparkles,
// } from "lucide-react";

// /* ================= CARD ================= */
// const Card = ({ children }) => (
//   <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
//     {children}
//   </div>
// );

// /* ================= NAV BUTTON ================= */
// const NavButton = ({ icon: Icon, label, tab, activeTab, setActiveTab }) => (
//   <button
//     onClick={() => setActiveTab(tab)}
//     className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
//       activeTab === tab
//         ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
//         : "text-slate-400 hover:bg-white/10 hover:text-white"
//     }`}
//   >
//     <Icon size={18} />
//     {label}
//   </button>
// );

// export default function URLShortener() {
//   const [activeTab, setActiveTab] = useState("home");
//   const [showProfile, setShowProfile] = useState(false);

//   /* ================= DASHBOARD ================= */
//   const [url, setUrl] = useState("");
//   const [customAlias, setCustomAlias] = useState("");
//   const [shortUrl, setShortUrl] = useState("");
//   const [copiedId, setCopiedId] = useState(null);
//   const [links, setLinks] = useState([]);

//   /* ================= QR ================= */
//   const [qrInput, setQrInput] = useState("");
//   const [qrGenerated, setQrGenerated] = useState("");

//   /* ================= ANALYTICS ================= */
//   const [analyticsInput, setAnalyticsInput] = useState("");
//   const [analyticsData, setAnalyticsData] = useState(null);

//   /* ================= PAGES ================= */
//   const [pageTitle, setPageTitle] = useState("");
//   const [pageData, setPageData] = useState(null);
//   const [linkLabel, setLinkLabel] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");

//   /* ================= LOGOUT ================= */
//   const handleLogout = async () => {
//     await api.post("/user/logout");
//     window.location.href = "/login";
//   };

//   /* ================= FETCH USER URLS ================= */
//   useEffect(() => {
//     (async () => {
//       const res = await getUserUrls();
//       setLinks(
//         res.data.urls.map((u) => ({
//           id: u._id,
//           shortId: u.shortId,
//           original: u.redirectURL,
//           short: `http://localhost:8002/url/${u.shortId}`,
//           clicks: u.visitHistory.length,
//         }))
//       );
//     })();
//   }, []);

//   /* ================= SHORTEN ================= */
//   const handleShorten = async () => {
//     try {
//       const res = await createShortUrl(url, customAlias);
//       setLinks((prev) => [
//         {
//           id: res.data.shortId,
//           shortId: res.data.shortId,
//           original: url,
//           short: res.data.shortUrl,
//           clicks: 0,
//         },
//         ...prev,
//       ]);
//       setShortUrl(res.data.shortUrl);
//       setUrl("");
//       setCustomAlias("");
//     } catch (err) {
//       alert(err.response?.data?.error || "Failed to create short URL");
//     }
//   };

//   const copyToClipboard = (text, id) => {
//     navigator.clipboard.writeText(text);
//     setCopiedId(id);
//     setTimeout(() => setCopiedId(null), 1500);
//   };

//   /* ================= QR ================= */
//   const handleGenerateQR = () => {
//     if (!qrInput.trim()) return alert("Paste any URL");
//     setQrGenerated(
//       `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
//         qrInput
//       )}`
//     );
//   };

//   const downloadQR = (shortId) => {
//     window.open(`http://localhost:8002/url/qr/${shortId}/download`, "_blank");
//   };

//   /* ================= ANALYTICS ================= */
//   const handleFetchAnalytics = async () => {
//     try {
//       const shortId = analyticsInput.trim().split("/").pop();
//       const res = await getAnalytics(shortId);
//       setAnalyticsData(res.data);
//     } catch {
//       alert("Analytics not found");
//     }
//   };

//   /* ================= PAGE FETCH ================= */
//   useEffect(() => {
//     if (activeTab !== "pages") return;
//     api
//       .get("/page/me")
//       .then((res) => setPageData(res.data))
//       .catch(() => setPageData(null));
//   }, [activeTab]);

//   /* ================= STATS ================= */
//   const totalLinks = links.length;
//   const totalClicks = links.reduce((s, l) => s + l.clicks, 0);
//   const totalQR = links.length;

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">

//       {/* ================= SIDEBAR ================= */}
//       <aside className="w-64 p-6 border-r border-white/10 flex flex-col justify-between">
//         <div className="space-y-2">
//           <h1 className="text-xl font-semibold mb-6 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
//             LinkShrink
//           </h1>

//           <NavButton icon={Link2} label="Dashboard" tab="home" activeTab={activeTab} setActiveTab={setActiveTab} />
//           <NavButton icon={QrCode} label="QR Codes" tab="qr" activeTab={activeTab} setActiveTab={setActiveTab} />
//           <NavButton icon={LayoutGrid} label="Pages" tab="pages" activeTab={activeTab} setActiveTab={setActiveTab} />
//           <NavButton icon={BarChart3} label="Analytics" tab="analytics" activeTab={activeTab} setActiveTab={setActiveTab} />
//         </div>

//         {/* PROFILE */}
//         <div className="relative mt-6">
//           <button
//             onClick={() => setShowProfile(!showProfile)}
//             className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition w-full"
//           >
//             <User size={18} />
//             Profile
//           </button>

//           {showProfile && (
//             <div className="absolute bottom-12 left-0 w-full z-50">
//               <Card>
//                 <p className="text-xs text-slate-400 mb-1">Logged in as</p>
//                 <p className="text-sm break-all mb-4">
//                   shrenikkondekar@gmail.com
//                 </p>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
//                 >
//                   <LogOut size={16} />
//                   Logout
//                 </button>
//               </Card>
//             </div>
//           )}
//         </div>
//       </aside>

//       {/* ================= MAIN ================= */}
//       <main className="flex-1 p-10 overflow-auto space-y-10">

//         {/* ================= DASHBOARD ================= */}
//         {activeTab === "home" && (
//           <>
//             <div>
//               <h2 className="text-4xl font-bold mb-2">
//                 Turn long links into powerful insights
//               </h2>
//               <p className="text-slate-400 max-w-2xl">
//                 Shorten URLs, track clicks, generate QR codes, and manage public pages —
//                 all from one secure dashboard.
//               </p>
//             </div>

//             <div className="grid grid-cols-3 gap-6">
//               <Card>
//                 <LinkIcon className="mb-2 text-indigo-400" />
//                 <p className="text-sm text-slate-400">Total Links</p>
//                 <p className="text-2xl font-bold">{totalLinks}</p>
//               </Card>
//               <Card>
//                 <MousePointerClick className="mb-2 text-blue-400" />
//                 <p className="text-sm text-slate-400">Total Clicks</p>
//                 <p className="text-2xl font-bold">{totalClicks}</p>
//               </Card>
//               <Card>
//                 <Sparkles className="mb-2 text-purple-400" />
//                 <p className="text-sm text-slate-400">QR Codes</p>
//                 <p className="text-2xl font-bold">{totalQR}</p>
//               </Card>
//             </div>

//             {/* ================= ORIGINAL DASHBOARD LOGIC ================= */}
//             <Card>
//               <h2 className="text-2xl font-semibold mb-6">
//                 Shorten Your Link
//               </h2>

//               <input
//                 value={url}
//                 onChange={(e) => setUrl(e.target.value)}
//                 className="input"
//                 placeholder="Paste long URL"
//               />
//               <input
//                 value={customAlias}
//                 onChange={(e) => setCustomAlias(e.target.value)}
//                 className="input mt-3"
//                 placeholder="Custom alias (optional)"
//               />

//               <button onClick={handleShorten} className="btn-primary mt-4">
//                 Shorten
//               </button>

//               {shortUrl && (
//                 <div className="flex items-center gap-3 mt-4">
//                   <span className="text-blue-400">{shortUrl}</span>
//                   <button onClick={() => copyToClipboard(shortUrl, "single")}>
//                     {copiedId === "single" ? <Check /> : <Copy />}
//                   </button>
//                 </div>
//               )}

//               <div className="mt-6 space-y-3">
//                 {links.map((l) => (
//                   <div
//                     key={l.id}
//                     className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition flex items-center justify-between"
//                   >
//                     <div>
//                       <p className="text-blue-400 break-all">{l.short}</p>
//                       <p className="text-xs text-slate-400">
//                         Clicks: {l.clicks}
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => copyToClipboard(l.short, l.id)}
//                       className="text-slate-400 hover:text-blue-400 transition"
//                     >
//                       {copiedId === l.id ? <Check /> : <Copy />}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//           </>
//         )}

//         {/* ================= QR ================= */}
//         {activeTab === "qr" && (
//           <Card>
//             <input
//               value={qrInput}
//               onChange={(e) => setQrInput(e.target.value)}
//               className="input"
//               placeholder="Paste URL"
//             />
//             <button onClick={handleGenerateQR} className="btn-primary mt-3">
//               Generate QR
//             </button>

//             {qrGenerated && (
//               <img src={qrGenerated} className="mt-4 w-48 rounded-xl shadow-lg" />
//             )}

//             <div className="mt-6 space-y-4">
//               {links.map((l) => (
//                 <div
//                   key={l.id}
//                   className="bg-white/5 p-4 rounded-xl flex items-center justify-between"
//                 >
//                   <span className="text-blue-400 break-all">{l.short}</span>
//                   <button
//                     onClick={() => downloadQR(l.shortId)}
//                     className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
//                   >
//                     <Download size={16} />
//                     Download
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         )}

//         {/* ================= ANALYTICS ================= */}
//         {activeTab === "analytics" && (
//           <Card>
//             <input
//               value={analyticsInput}
//               onChange={(e) => setAnalyticsInput(e.target.value)}
//               className="input"
//               placeholder="Paste short URL"
//             />
//             <button onClick={handleFetchAnalytics} className="btn-primary mt-3">
//               View Analytics
//             </button>

//             {analyticsData && (
//               <div className="mt-6 space-y-4 text-sm">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-white/5 p-4 rounded-xl">
//                     <p className="text-slate-400">Short ID</p>
//                     <p className="text-blue-400 font-medium">
//                       {analyticsData.shortId}
//                     </p>
//                   </div>
//                   <div className="bg-white/5 p-4 rounded-xl">
//                     <p className="text-slate-400">Total Clicks</p>
//                     <p className="text-2xl font-semibold">
//                       {analyticsData.totalClicks}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="bg-white/5 p-4 rounded-xl">
//                   <p className="text-slate-400 mb-1">Redirect URL</p>
//                   <p className="text-blue-400 break-all">
//                     {analyticsData.redirectURL}
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-white/5 p-4 rounded-xl">
//                     <p className="text-slate-400">First Clicked</p>
//                     <p>
//                       {analyticsData.firstClicked
//                         ? new Date(
//                             analyticsData.firstClicked
//                           ).toLocaleString()
//                         : "—"}
//                     </p>
//                   </div>
//                   <div className="bg-white/5 p-4 rounded-xl">
//                     <p className="text-slate-400">Last Clicked</p>
//                     <p>
//                       {analyticsData.lastClicked
//                         ? new Date(
//                             analyticsData.lastClicked
//                           ).toLocaleString()
//                         : "—"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="bg-white/5 p-4 rounded-xl">
//                   <p className="text-slate-400 mb-2">Clicks Per Day</p>
//                   {Object.keys(analyticsData.clicksPerDay || {}).length === 0 ? (
//                     <p className="text-slate-500">No click data available</p>
//                   ) : (
//                     <div className="space-y-2">
//                       {Object.entries(
//                         analyticsData.clicksPerDay
//                       ).map(([date, count]) => (
//                         <div
//                           key={date}
//                           className="flex justify-between bg-black/30 px-3 py-2 rounded-lg"
//                         >
//                           <span>{date}</span>
//                           <span className="text-blue-400 font-medium">
//                             {count}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </Card>
//         )}

//         {/* ================= PAGES ================= */}
//         {activeTab === "pages" && (
//           <Card>
//             {pageData ? (
//               <>
//                 <div className="mb-6">
//                   <p className="text-slate-400 text-sm">Your Public Page</p>
//                   <p className="text-blue-400 break-all">
//                     http://localhost:5173/u/{pageData._id}
//                   </p>
//                 </div>

//                 <button
//                   onClick={async () => {
//                     const confirm = window.confirm(
//                       "Are you sure? This will delete your page and all links."
//                     );
//                     if (!confirm) return;
//                     await api.delete("/page/delete", { withCredentials: true });
//                     setPageData(null);
//                     setLinkLabel("");
//                     setLinkUrl("");
//                   }}
//                   className="text-red-400 hover:text-red-500 text-sm mb-6"
//                 >
//                   Delete Page
//                 </button>

//                 <input
//                   value={linkLabel}
//                   onChange={(e) => setLinkLabel(e.target.value)}
//                   className="input"
//                   placeholder="Link label"
//                 />
//                 <input
//                   value={linkUrl}
//                   onChange={(e) => setLinkUrl(e.target.value)}
//                   className="input mt-3"
//                   placeholder="Link URL"
//                 />

//                 <button
//                   onClick={async () => {
//                     const res = await api.post("/page/link", {
//                       label: linkLabel,
//                       url: linkUrl,
//                     });
//                     setPageData(res.data);
//                   }}
//                   className="btn-primary mt-4"
//                 >
//                   Add Link
//                 </button>

//                 <div className="mt-6 space-y-3">
//                   {pageData.links.map((l) => (
//                     <div
//                       key={l._id}
//                       className="bg-white/5 p-4 rounded-xl flex justify-between"
//                     >
//                       <span>{l.label}</span>
//                       <button
//                         onClick={async () => {
//                           const res = await api.delete(
//                             `/page/link/${l._id}`,
//                             { withCredentials: true }
//                           );
//                           setPageData(res.data);
//                         }}
//                         className="text-red-400 hover:text-red-500"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <>
//                 <input
//                   value={pageTitle}
//                   onChange={(e) => setPageTitle(e.target.value)}
//                   className="input"
//                   placeholder="Page title"
//                 />
//                 <button
//                   onClick={async () => {
//                     if (!pageTitle.trim()) return alert("Title required");
//                     const res = await api.post("/page/create", {
//                       title: pageTitle,
//                     });
//                     setPageData(res.data);
//                   }}
//                   className="btn-primary mt-4"
//                 >
//                   Create Page
//                 </button>
//               </>
//             )}
//           </Card>
//         )}
//       </main>

//       {/* ================= GLOBAL STYLES ================= */}
//       <style jsx>{`
//         .input {
//           width: 100%;
//           padding: 12px;
//           border-radius: 12px;
//           background: rgba(255, 255, 255, 0.08);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//           color: white;
//         }
//         .btn-primary {
//           padding: 12px 22px;
//           border-radius: 14px;
//           background: linear-gradient(135deg, #4f46e5, #2563eb);
//           box-shadow: 0 15px 40px rgba(37, 99, 235, 0.35);
//           transition: transform 0.2s ease, box-shadow 0.2s ease;
//         }
//         .btn-primary:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 20px 50px rgba(37, 99, 235, 0.45);
//         }
//       `}</style>
//     </div>
//   );
// }




