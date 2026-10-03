"""Build only the explicitly allowed extension files, without dependencies."""
from pathlib import Path
import json
import zipfile

ROOT = Path(__file__).resolve().parent
FILES = ("manifest.json", "noad.js", "README.md", "LICENSE")
manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
assert manifest["manifest_version"] == 3
assert manifest["content_scripts"][0]["js"] == ["noad.js"]
output = ROOT / "dist" / "yt-noad.zip"
output.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as archive:
    for name in FILES:
        entry = zipfile.ZipInfo("yt-noad/" + name, date_time=(2026, 10, 3, 0, 0, 0))
        entry.compress_type = zipfile.ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, (ROOT / name).read_bytes())
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    assert archive.namelist() == ["yt-noad/" + name for name in FILES]
print("Built dist/yt-noad.zip:", output.stat().st_size, "bytes")
