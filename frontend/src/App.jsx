import React, { useState, useEffect } from "react";
import axios from "axios";
import UploadBox from "./components/UploadBox";

const BACKEND = "http://127.0.0.1:8000";

export default function App() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.body.classList.add("dark-mode");
    else document.body.classList.remove("dark-mode");
  }, [darkMode]);

  const handleUpload = async (file) => {
    setError("");
    setLoading(true);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${BACKEND}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;
      if (data.download_url && data.download_url.startsWith("/")) {
        data.download_url = BACKEND + data.download_url;
      }
      setSummary(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Error processing file.");
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (rows) => {
    if (!rows || rows.length === 0) return [];
    const columns = Object.keys(rows[0]);
    const insights = [];

    columns.forEach((col) => {
      const values = rows.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== "");
      if (values.length === 0) return;

      const numericValues = values.map((v) => parseFloat(v)).filter((v) => !isNaN(v));
      if (numericValues.length >= values.length * 0.7) {
        const avg = (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toFixed(2);
        insights.push(`Average ${col}: ${avg}`);
      } else {
        const freq = {};
        values.forEach((v) => {
          const val = String(v).trim();
          freq[val] = (freq[val] || 0) + 1;
        });
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          insights.push(`Most common ${col}: ${sorted[0][0]} (${sorted[0][1]} times)`);
        }
      }
    });

    return insights.slice(0, 3);
  };

  const insights = summary?.sample_data ? generateInsights(summary.sample_data) : [];
  const customInsights = summary?.category_summary || {};
  
  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
 
      <div style={{ textAlign: "right", marginBottom: 10 }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="toggle-btn"
        >
          {darkMode ? " Light Mode" : " Dark Mode"}
        </button>
      </div>

      <h1> DataClean Analyzer</h1>
      <p>Upload any CSV or Excel file — we’ll clean, analyze, and summarize it automatically.</p>

      <UploadBox onUpload={handleUpload} loading={loading} />

      {loading && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div className="loader"></div>
          <p style={{ color: "#888", marginTop: 10 }}>Processing file... please wait.</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {summary && (
        <div style={{ marginTop: 30 }}>
 
          <div className="section-box">
            <h2> Summary</h2>
            <ul>
              <li><b>Total Rows:</b> {summary.total_rows ?? "N/A"}</li>
              <li><b>Cleaned Rows:</b> {summary.cleaned_rows ?? "N/A"}</li>
              <li><b>Missing Values:</b> {summary.missing_values ?? "N/A"}</li>
              <li><b>Rows Removed:</b> {summary.rows_removed_percent ?? "N/A"}</li>
            </ul>
          </div>

          
          {insights.length > 0 && (
            <div className="section-box insights-box">
              <h3> Data Insights</h3>
              <ul>
                {insights.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(customInsights).length > 0 && (
            <div className="insights-box" style={{ backgroundColor: darkMode ? "#222" : "#e6f7ff" }}>
              <h3> Custom Insights (Most Common Category)</h3>
              <ul>
                {Object.entries(customInsights).map(([col, val]) => (
                  <li key={col}><b>{col}:</b> {val}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="section-box">
            <h3> Data Preview</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                {Array.isArray(summary.columns) && Array.isArray(summary.sample_data) ? (
                  <>
                    <thead>
                      <tr>
                        {summary.columns.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {summary.sample_data.map((row, i) => (
                        <tr key={i}>
                          {summary.columns.map((c) => (
                            <td key={c}>{row[c] ?? ""}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="100%">No data to display</td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>

{summary.plots && Object.keys(summary.plots).length > 0 && (
  <div className="section-box">
    <h2> Visualizations</h2>
    {Object.entries(summary.plots).map(([col, imgSrc]) => (
      <div key={col} style={{ marginBottom: 25 }}>
        <h4>{col}</h4>
        <img src={imgSrc} alt={col} style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #ccc" }} />
      </div>
    ))}
  </div>
)}


          {summary.download_url && (
            <div className="section-box" style={{ textAlign: "center" }}>
              <a href={summary.download_url} target="_blank" rel="noreferrer">
                <button className="download-btn">⬇ Download Cleaned CSV</button>
              </a>
            </div>
          )}
        </div>
      )}

      <style>{`
        
        .app-container {
          max-width: 900px;
          margin: 40px auto;
          padding: 20px;
          font-family: Arial;
          transition: background 0.3s, color 0.3s;
        }

        body.dark-mode, .app-container.dark {
          background-color: #121212 !important;
          color: #eee !important;
          min-height: 100vh;
        }

        .section-box img {
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
  max-height: 350px;
  object-fit: contain;
}

        /* ===== Buttons ===== */
        .toggle-btn {
          padding: 6px 12px;
          background: #333;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .toggle-btn:hover {
          opacity: 0.8;
        }

        .download-btn {
          padding: 10px 16px;
          cursor: pointer;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
        }
        .download-btn:hover {
          background: #a5a4a4ff;
        }

        /* ===== Loader ===== */
        .loader {
          width: 40px;
          height: 40px;
          border: 5px solid #ccc;
          border-top: 5px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* ===== Sections ===== */
        .section-box {
          margin-top: 25px;
          padding: 15px 20px;
          border-radius: 10px;
          background: rgba(240,240,240,0.1);
          border: 1px solid rgba(180,180,180,0.2);
        }

        /* ===== Table Styling ===== */
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          background: #f5f5f5;
          color: #000;
          padding: 8px;
          text-align: left;
          border-bottom: 2px solid #999;
        }
        .dark .data-table th {
          background: #e0e0e0;
          color: #000;
        }
        .data-table td {
          padding: 8px;
          border-bottom: 1px solid #ccc;
        }
        .data-table tr:nth-child(even) {
          background-color: rgba(0,0,0,0.03);
        }
        .dark .data-table tr:nth-child(even) {
          background-color: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}
