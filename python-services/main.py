from __future__ import annotations

import json
import os
import shutil
import subprocess
import uuid
from pathlib import Path
from typing import Dict, List, Optional

import pandas as pd
import psycopg2
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from psycopg2.extras import RealDictCursor

OUTPUT_DIR = Path(os.getenv("OUTPUT_ROOT", "/app/outputs"))
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable must be set for the Python service")


app = FastAPI(title="ComplianceDrone Python Services")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def _save_upload(file: UploadFile, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)


def _run_subprocess(command: List[str], cwd: Optional[Path] = None) -> None:
    try:
        subprocess.run(command, cwd=cwd, check=True)
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"Command failed: {' '.join(command)}") from exc


def _load_summary(metadata_path: Path, excel_path: Path) -> Dict[str, int]:
    if metadata_path.exists():
        try:
            return json.loads(metadata_path.read_text())
        except Exception:
            pass

    try:
        df = pd.read_excel(excel_path, sheet_name="Summary")
        summary = df.iloc[0].to_dict()
        return {k: int(v) for k, v in summary.items() if isinstance(v, (int, float))}
    except Exception:
        return {"total_files": 0, "anomalies_found": 0}


@app.post("/process-job")
async def process_job(
    pilot_id: str = Form(...),
    location: str = Form(...),
    files: List[UploadFile] = File(...),
):
    if not files:
        raise HTTPException(status_code=400, detail="At least one file must be provided")

    job_id = f"job_{uuid.uuid4().hex[:10]}"
    job_dir = OUTPUT_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    for uploaded in files:
        destination = job_dir / uploaded.filename
        _save_upload(uploaded, destination)
        uploaded.file.close()

    excel_path = job_dir / "Report_Input.xlsx"
    metadata_path = job_dir / "Report_Input.json"
    pdf_path = job_dir / "Final_Report.pdf"

    with get_db_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO jobs (job_id, pilot_id, location, status) VALUES (%s, %s, %s, %s)",
            (job_id, pilot_id, location, "processing"),
        )
        conn.commit()

    try:
        _run_subprocess([
            "python",
            "Drone_Data_Process.py",
            str(job_dir),
            str(excel_path),
            str(metadata_path),
        ], cwd=Path(__file__).parent)

        _run_subprocess([
            "python",
            "ClaudeMain1_fixed.py",
            str(excel_path),
            str(pdf_path),
            str(metadata_path),
        ], cwd=Path(__file__).parent)

        summary = _load_summary(metadata_path, excel_path)
        anomalies_found = int(summary.get("anomalies_found", 0))

        excel_url = f"/outputs/{job_id}/Report_Input.xlsx"
        pdf_url = f"/outputs/{job_id}/Final_Report.pdf"

        with get_db_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "UPDATE jobs SET status = %s WHERE job_id = %s",
                ("completed", job_id),
            )
            cur.execute(
                "INSERT INTO results (job_id, anomalies_found, excel_url, pdf_url) VALUES (%s, %s, %s, %s)",
                (job_id, anomalies_found, excel_url, pdf_url),
            )
            conn.commit()

        return JSONResponse(
            content={
                "job_id": job_id,
                "anomalies_found": anomalies_found,
                "excel_url": excel_url,
                "pdf_url": pdf_url,
            }
        )

    except Exception as exc:
        with get_db_conn() as conn, conn.cursor() as cur:
            cur.execute(
                "UPDATE jobs SET status = %s WHERE job_id = %s",
                ("failed", job_id),
            )
            conn.commit()
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    with get_db_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "SELECT job_id, pilot_id, location, status, created_at FROM jobs WHERE job_id = %s",
            (job_id,),
        )
        job = cur.fetchone()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        cur.execute(
            "SELECT anomalies_found, excel_url, pdf_url FROM results WHERE job_id = %s",
            (job_id,),
        )
        result = cur.fetchone()

    return JSONResponse(
        content={
            "job": job,
            "result": result,
        }
    )


@app.post("/generate-flight-path")
async def generate_flight_path(
    job_id: str = Form(...),
    kmz: UploadFile = File(...),
):
    with get_db_conn() as conn, conn.cursor() as cur:
        cur.execute("SELECT 1 FROM jobs WHERE job_id = %s", (job_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail="Job not found")

    job_dir = OUTPUT_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    flight_dir = job_dir / "flight_paths"
    flight_dir.mkdir(exist_ok=True)

    kmz_path = flight_dir / kmz.filename
    _save_upload(kmz, kmz_path)
    kmz.file.close()

    _run_subprocess(
        [
            "python",
            "FlightPlanTool.py",
            str(kmz_path),
            str(flight_dir),
        ],
        cwd=Path(__file__).parent,
    )

    kml_path = flight_dir / "flight_path.kml"
    geojson_path = flight_dir / "flight_path.geojson"

    kml_url = f"/outputs/{job_id}/flight_paths/{kml_path.name}"
    geojson_url = f"/outputs/{job_id}/flight_paths/{geojson_path.name}"
    kmz_url = f"/outputs/{job_id}/flight_paths/{kmz_path.name}"

    with get_db_conn() as conn, conn.cursor() as cur:
        cur.execute(
            "INSERT INTO flight_paths (job_id, kmz_file_url, generated_path_url, geojson_url) VALUES (%s, %s, %s, %s)",
            (job_id, kmz_url, kml_url, geojson_url),
        )
        conn.commit()

    return JSONResponse(
        content={
            "job_id": job_id,
            "kmz_url": kmz_url,
            "kml_url": kml_url,
            "geojson_url": geojson_url,
        }
    )


@app.get("/")
async def root():
    return {"status": "ok"}
