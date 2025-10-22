import React, { useRef } from "react";

export default function UploadBox({ onUpload, loading }) {
  const fileRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!file) return alert("Please select a file!");

    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    if (!allowed.includes(file.type)) {
      return alert("Only CSV or Excel (.xlsx) files are allowed!");
    }

    onUpload(file);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 15 }}>
      <input ref={fileRef} type="file" accept=".csv, .xlsx" />
      <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? "Processing..." : "Upload & Clean"}
      </button>
    </form>
  );
}
