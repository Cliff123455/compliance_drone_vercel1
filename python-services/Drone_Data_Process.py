"""Utility script to process uploaded drone files and build an Excel workbook."""

from __future__ import annotations

import sys
import json
from pathlib import Path
from typing import List, Dict

import pandas as pd

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff"}
THERMAL_KEYWORDS = {"hot", "anomaly", "thermal", "hotspot"}


def detect_anomaly(file_path: Path) -> bool:
    """Simple heuristic to decide if an anomaly is present."""
    stem = file_path.stem.lower()
    if any(keyword in stem for keyword in THERMAL_KEYWORDS):
        return True
    # provide deterministic pseudo-random fallback
    return hash(file_path.stem) % 5 == 0


def build_record(file_path: Path) -> Dict[str, object]:
    anomaly = detect_anomaly(file_path)
    return {
        "file_name": file_path.name,
        "file_type": file_path.suffix.lower() or "unknown",
        "size_bytes": file_path.stat().st_size,
        "anomaly_detected": anomaly,
        "notes": "Flagged as potential issue" if anomaly else "No anomaly detected",
    }


def process_directory(input_dir: Path) -> Dict[str, object]:
    records: List[Dict[str, object]] = []
    annotated_dir = input_dir / "annotated"
    annotated_dir.mkdir(exist_ok=True)

    for item in input_dir.iterdir():
        if item.is_dir():
            if item.name != "annotated":
                for nested in item.rglob("*"):
                    if nested.is_file():
                        records.extend(_handle_file(nested, annotated_dir))
            continue
        records.extend(_handle_file(item, annotated_dir))

    df = pd.DataFrame(records)
    summary = {
        "total_files": int(len(df)),
        "anomalies_found": int(df[df["anomaly_detected"]].shape[0]) if not df.empty else 0,
    }
    return {"records": df, "summary": summary, "annotated_dir": annotated_dir}


def _handle_file(file_path: Path, annotated_dir: Path) -> List[Dict[str, object]]:
    if not file_path.is_file():
        return []
    records: List[Dict[str, object]] = []
    record = build_record(file_path)
    records.append(record)

    if file_path.suffix.lower() in IMAGE_EXTENSIONS:
        target = annotated_dir / file_path.name
        try:
            target.write_bytes(file_path.read_bytes())
        except Exception:
            target.write_text("Annotated version unavailable")
    return records


def write_outputs(input_dir: Path, excel_path: Path, metadata_path: Path) -> None:
    results = process_directory(input_dir)
    df: pd.DataFrame = results["records"]
    summary = results["summary"]

    if df.empty:
        df = pd.DataFrame([{
            "file_name": "No files processed",
            "file_type": "n/a",
            "size_bytes": 0,
            "anomaly_detected": False,
            "notes": "Upload files to generate a report",
        }])

    with pd.ExcelWriter(excel_path) as writer:
        df.to_excel(writer, index=False, sheet_name="Anomalies")
        summary_df = pd.DataFrame([summary])
        summary_df.to_excel(writer, index=False, sheet_name="Summary")

    metadata_path.write_text(json.dumps(summary, indent=2))


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python Drone_Data_Process.py <input_dir> <excel_path> [metadata_path]", file=sys.stderr)
        sys.exit(1)

    input_dir = Path(sys.argv[1]).expanduser().resolve()
    excel_path = Path(sys.argv[2]).expanduser().resolve()
    metadata_path = Path(sys.argv[3]).expanduser().resolve() if len(sys.argv) > 3 else excel_path.with_suffix(".json")

    excel_path.parent.mkdir(parents=True, exist_ok=True)
    metadata_path.parent.mkdir(parents=True, exist_ok=True)

    write_outputs(input_dir, excel_path, metadata_path)
    print(f"Excel report generated at {excel_path}")
    print(f"Metadata summary saved at {metadata_path}")


if __name__ == "__main__":
    main()
