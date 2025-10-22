from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
import io
import base64
import matplotlib.pyplot as plt
import seaborn as sns

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = FastAPI(title="DataClean Analyzer - CSV/Excel Version")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NUMERIC_OUTLIER_MIN = 0
NUMERIC_OUTLIER_MAX = 3e10
DROP_ROW_THRESHOLD = 1
DROP_COL_THRESHOLD = 0.7

def plot_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return f"data:image/png;base64,{encoded}"

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filename = file.filename.lower()
    if not (filename.endswith(".csv") or filename.endswith(".xlsx")):
        return JSONResponse(content={"error": "Only CSV or Excel files are allowed"}, status_code=400)

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())

    try:
        df = pd.read_csv(file_path) if filename.endswith(".csv") else pd.read_excel(file_path)
    except Exception as e:
        return JSONResponse(content={"error": f"Failed to read file: {str(e)}"}, status_code=500)

    if df.empty:
        return JSONResponse(content={"error": "Uploaded file is empty"}, status_code=400)

    original_total_rows = len(df)
    df = df.dropna(axis=1, thresh=int((1 - DROP_COL_THRESHOLD) * len(df)))

    numeric_cols, text_cols = [], []
    for col in df.columns:
        converted = pd.to_numeric(df[col], errors="coerce")
        if converted.notna().sum() / len(df) > 0.5:
            df[col] = converted
            numeric_cols.append(col)
        else:
            df[col] = df[col].astype(str).str.strip().replace({"": "N/A"})
            text_cols.append(col)

    
    for col in numeric_cols:
        df[col] = df[col].mask((df[col] < NUMERIC_OUTLIER_MIN) | (df[col] > NUMERIC_OUTLIER_MAX))
        median = df[col].median()
        df[col] = df[col].fillna(median).round(2)

    df = df.dropna(axis=0, thresh=len(df.columns) - DROP_ROW_THRESHOLD)
    missing_values = df.isna().sum().sum() + (df[text_cols] == "N/A").sum().sum()

    
    category_summary = {}
    for col in text_cols:
        values = df[col][df[col] != "N/A"]
        if not values.empty:
            most_common = values.mode().iloc[0]
            count = (values == most_common).sum()
            category_summary[col] = f"{most_common} ({count} times)"

    cleaned_filename = "cleaned_" + os.path.splitext(file.filename)[0] + ".csv"
    cleaned_path = os.path.join(UPLOAD_FOLDER, cleaned_filename)
    df.to_csv(cleaned_path, index=False)

    df_preview = df.head(5).copy()
    for col in numeric_cols:
        df_preview[col] = df_preview[col].apply(lambda x: None if pd.isna(x) else round(float(x), 2))
    sample_data = df_preview.to_dict(orient="records")

    cleaned_rows = len(df)
    cleaned_percentage = round(((original_total_rows - cleaned_rows) / original_total_rows) * 100, 2) if original_total_rows > 0 else 0

    
    plots = {}
    try:
       
        for col in numeric_cols:
            fig, ax = plt.subplots()
            sns.histplot(df[col], kde=True, ax=ax)
            ax.set_title(f"Distribution of {col}")
            plots[col] = plot_to_base64(fig)

        for col in text_cols:
            counts = df[col][df[col] != "N/A"].value_counts().head(10)
            if not counts.empty:
                fig, ax = plt.subplots()
                sns.barplot(x=counts.values, y=counts.index, ax=ax, palette="viridis")
                ax.set_title(f"Top categories in {col}")
                plots[col] = plot_to_base64(fig)
    except Exception as e:
        print("Plotting error:", e)

    return {
        "total_rows": int(original_total_rows),
        "cleaned_rows": int(cleaned_rows),
        "rows_removed_percent": f"{cleaned_percentage}%",
        "missing_values": int(missing_values),
        "columns": df.columns.tolist(),
        "sample_data": sample_data,
        "download_url": f"http://127.0.0.1:8000/download/{cleaned_filename}",
        "category_summary": category_summary,
        "plots": plots  
    }

@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="text/csv", filename=filename)
    return JSONResponse(content={"error": "File not found"}, status_code=404)
