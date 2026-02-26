import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { Loader2 } from "lucide-react";

/* Default Cliq theme (orange/white) */
const DEFAULT_THEME = {
  headerBg: "linear-gradient(135deg, #EE6123 0%, #d4510f 100%)",
  textColor: "#fff",
  linkBg: "#fff",
  linkText: "#EE6123",
  avatarBg: "rgba(255,255,255,0.2)",
};

/* Extract a solid color from a gradient string for fallback */
function extractColor(bg) {
  const match = bg.match(/#[0-9a-fA-F]{3,8}/);
  return match ? match[0] : "#EE6123";
}

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

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!page) {
    return (
      <div style={styles.errorScreen}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Page not found
        </h1>
        <p style={{ opacity: 0.6, fontSize: 14 }}>
          This page doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  // Resolve theme (fall back to orange/white Cliq default)
  const raw = page.theme && page.theme.headerBg ? page.theme : DEFAULT_THEME;
  const headerBg = raw.headerBg || DEFAULT_THEME.headerBg;
  const textColor = raw.textColor || DEFAULT_THEME.textColor;
  const primaryColor = extractColor(headerBg);

  // Links always use white bg + primary color text (matching template preview)
  const linkTextColor =
    !raw.linkText || raw.linkText === "#fff" || raw.linkText === "#ffffff"
      ? primaryColor
      : raw.linkText;

  const initials = page.title
    ? page.title
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "?";

  return (
    <div style={styles.pageWrapper}>
      {/* ── Colored header ── */}
      <div
        style={{
          background: headerBg,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            padding: "48px 24px 56px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Radial overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          {/* Avatar */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              color: textColor,
              fontSize: 28,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              border: `2.5px solid ${textColor}30`,
              position: "relative",
              zIndex: 1,
            }}
          >
            {initials}
          </div>

          {/* Title + subtitle */}
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: textColor,
              marginBottom: 6,
              position: "relative",
              zIndex: 1,
            }}
          >
            {page.title}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: `${textColor}99`,
              position: "relative",
              zIndex: 1,
            }}
          >
            My important links
          </p>
        </div>
      </div>

      {/* ── White card with links ── */}
      <div style={styles.cardBody}>
        <div style={styles.linkList}>
          {page.links.map((link) => (
            <a
              key={link._id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "14px 20px",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                textAlign: "center",
                transition: "all 0.25s ease",
                background: "#ffffff",
                color: linkTextColor,
                border: `1.5px solid ${linkTextColor}25`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 8px 20px ${linkTextColor}15`;
                e.currentTarget.style.borderColor = `${linkTextColor}50`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)";
                e.currentTarget.style.borderColor = `${linkTextColor}25`;
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Footer */}
        <p style={styles.footer}>
          Powered by{" "}
          <span style={{ color: "#EE6123", fontWeight: 700 }}>Cliq</span>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#f8f9fa",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cardBody: {
    width: "100%",
    maxWidth: 480,
    background: "#ffffff",
    borderRadius: 24,
    marginTop: -24,
    padding: "36px 24px 32px",
    position: "relative",
    zIndex: 2,
    boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
    marginBottom: 40,
  },
  linkList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  footer: {
    marginTop: 32,
    fontSize: 12,
    textAlign: "center",
    color: "#9ca3af",
  },
  loadingScreen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
    color: "#9ca3af",
  },
  errorScreen: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f9fa",
    color: "#0B1736",
  },
};
