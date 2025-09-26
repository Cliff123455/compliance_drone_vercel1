"""Generate a PDF report from the processed Excel workbook."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Dict

import pandas as pd
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas


def load_summary(excel_path: Path, metadata_path: Path | None = None) -> Dict[str, int]:
    if metadata_path and metadata_path.exists():
        try:
            return json.loads(metadata_path.read_text())
        except Exception:
            pass

    try:
        summary_df = pd.read_excel(excel_path, sheet_name="Summary")
        summary = summary_df.iloc[0].to_dict()
        return {k: int(v) for k, v in summary.items() if isinstance(v, (int, float))}
    except Exception:
        return {"total_files": 0, "anomalies_found": 0}


def build_report(excel_path: Path, pdf_path: Path, metadata_path: Path | None = None) -> None:
    summary = load_summary(excel_path, metadata_path)
    anomalies_df = pd.read_excel(excel_path, sheet_name="Anomalies")

    c = canvas.Canvas(str(pdf_path), pagesize=LETTER)
    width, height = LETTER
    styles = getSampleStyleSheet()
    textobject = c.beginText(1 * inch, height - 1 * inch)

    textobject.setFont("Helvetica-Bold", 18)
    textobject.textLine("ComplianceDrone Thermal Inspection Report")
    textobject.setFont("Helvetica", 12)
    textobject.textLine("")

    textobject.textLine(f"Total files processed: {summary.get('total_files', len(anomalies_df))}")
    textobject.textLine(f"Anomalies detected: {summary.get('anomalies_found', 0)}")
    textobject.textLine("")

    textobject.setFont("Helvetica-Bold", 14)
    textobject.textLine("Detected Files")
    textobject.setFont("Helvetica", 10)

    for _, row in anomalies_df.iterrows():
        flag = "YES" if bool(row.get("anomaly_detected")) else "NO"
        textobject.textLine(
            f"• {row.get('file_name')} — anomaly: {flag} — notes: {row.get('notes', '')}"
        )
        if textobject.getY() < 1 * inch:
            c.drawText(textobject)
            c.showPage()
            textobject = c.beginText(1 * inch, height - 1 * inch)
            textobject.setFont("Helvetica", 10)

    c.drawText(textobject)
    c.showPage()
    c.save()


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python ClaudeMain1_fixed.py <excel_path> <pdf_path> [metadata_path]", file=sys.stderr)
        sys.exit(1)

    excel_path = Path(sys.argv[1]).expanduser().resolve()
    pdf_path = Path(sys.argv[2]).expanduser().resolve()
    metadata_path = Path(sys.argv[3]).expanduser().resolve() if len(sys.argv) > 3 else excel_path.with_suffix(".json")

    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    build_report(excel_path, pdf_path, metadata_path)
    print(f"PDF report created at {pdf_path}")


if __name__ == "__main__":
    main()
