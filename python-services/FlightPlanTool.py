"""Simplified flight path generator.

This placeholder reads an uploaded KMZ/KML file and emits a deterministic KML and
GeoJSON path so the frontend has downloadable artefacts.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Dict

EXAMPLE_COORDS = [
    (-97.7431, 30.2672),
    (-97.7425, 30.2675),
    (-97.7419, 30.2678),
]


def generate_paths(output_dir: Path) -> Dict[str, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    kml_path = output_dir / "flight_path.kml"
    geojson_path = output_dir / "flight_path.geojson"

    kml_content = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Generated Flight Path</name>
    <Placemark>
      <LineString>
        <coordinates>
{coords}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
</kml>
""".format(
        coords="
".join([f"        {lon},{lat},0" for lon, lat in EXAMPLE_COORDS])
    )
    kml_path.write_text(kml_content)

    geojson_payload = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"name": "Generated Flight Path"},
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[lon, lat, 0] for lon, lat in EXAMPLE_COORDS],
                },
            }
        ],
    }
    geojson_path.write_text(json.dumps(geojson_payload, indent=2))

    return {"kml": kml_path, "geojson": geojson_path}


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python FlightPlanTool.py <kmz_path> <output_dir>", file=sys.stderr)
        sys.exit(1)

    _ = Path(sys.argv[1]).expanduser().resolve()
    output_dir = Path(sys.argv[2]).expanduser().resolve()

    output_dir.mkdir(parents=True, exist_ok=True)
    artifacts = generate_paths(output_dir)
    print(f"Flight path KML created at {artifacts['kml']}")
    print(f"Flight path GeoJSON created at {artifacts['geojson']}")


if __name__ == "__main__":
    main()
