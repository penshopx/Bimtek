"""Transcribe NEW nomenclature only; never import the superseded left columns."""
from pathlib import Path
import hashlib
import json
import re
import pymupdf

SOURCE = Path("attached_assets/SK-DJBK-Nomor-114-Thn-2024_4-Des_KPTS-Tentang-Penetapan-Jabker_1791458965022.pdf")
TARGET = Path("src/data/construction-catalog.json")


def clean(value):
    return " ".join((value or "").split())


def title(value):
    return clean(value).title()


def main():
    doc = pymupdf.open(SOURCE)
    classification = ""
    subclassification = ""
    taxonomy = {}
    entries = {}
    state = {}
    for index in range(6, 130):
        page = doc[index]
        scope = "umum" if index < 125 else "asn"
        text = clean(page.get_text())
        match = re.search(r"[A-H]\.\s*JABATAN KERJA PADA KLASIFIKASI (.*?) NO ", text)
        if match:
            classification = title(match.group(1))
            state = {}
        tables = page.find_tables().tables
        assert tables, f"No table found on PDF page {index+1}"
        for table in tables:
            rows = table.extract()
            subrow = next((clean(v) for row in rows for v in row if v and "SUBKLASIFIKASI :" in v), None)
            assert subrow, f"Missing subclassification on {index+1}"
            current_sub = title(subrow.split(":", 1)[1])
            if current_sub != subclassification:
                state = {}
            subclassification = current_sub
            taxonomy.setdefault(classification, set()).add(subclassification)
            header_index = next((i for i, row in enumerate(rows) if "(13)" in map(clean, row)), None)
            if header_index is None:
                # Some continuation pages omit the numbered header, but retain
                # the exact same table geometry and column-title positions.
                assert table.col_count == 20 and clean(rows[1][9]).startswith("BIDANG/JABATAN"), f"Unexpected layout on {index+1}"
                header_index = next(i for i, row in enumerate(rows) if any(v and "SUBKLASIFIKASI :" in v for v in row))
                columns = dict(zip(["jobTitle", "schemeName", "level", "standard", "notes"], [9, 11, 14, 15, 18]))
            else:
                header = list(map(clean, rows[header_index]))
                columns = {key: header.index(f"({number})") for key, number in
                           [("jobTitle", 7), ("schemeName", 8), ("level", 9), ("standard", 10), ("notes", 13)]}
            for row in rows[header_index+1:]:
                for key, col in columns.items():
                    if row[col] is not None:
                        state[key] = clean(row[col])
                scheme = state.get("schemeName", "")
                job = state.get("jobTitle", "")
                grade = state.get("level", "")
                # A scheme name can span several explicit new-level rows.
                # Only an explicit NEW level creates a record; legacy rows do not.
                if row[columns["level"]] is None or not re.fullmatch(r"[1-9](?:\s*,\s*[1-9])*", grade):
                    continue
                if job in ("", "-") or scheme in ("", "-"):
                    continue
                for level in map(int, grade.split(",")):
                    identity = "|".join([classification, subclassification, job, scheme, str(level), scope])
                    record_id = "djbk114-" + hashlib.sha256(identity.encode()).hexdigest()[:12]
                    if record_id in entries:
                        entries[record_id]["sourcePages"].append(index+1)
                        continue
                    entries[record_id] = {
                        "id": record_id,
                        "classification": classification,
                        "subclassification": subclassification,
                        "jobTitle": job,
                        "schemeName": scheme,
                        "level": level,
                        "qualification": "Ahli" if level >= 7 else "Teknisi/Analis" if level >= 4 else "Operator",
                        "standard": state.get("standard", ""),
                        "notes": state.get("notes", ""),
                        "scope": scope,
                        "sourcePages": [index+1],
                    }
    records = sorted(entries.values(), key=lambda x: (x["classification"], x["subclassification"], x["jobTitle"], x["scope"], x["level"]))
    output = {
        "source": {
            "document": "SK DJBK Nomor 114/KPTS/Dk/2024",
            "title": "Penetapan Jabatan Kerja dan Jenjang Kualifikasi atas Jabatan Kerja di Bidang Jasa Konstruksi",
            "date": "2024-12-04",
            "sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            "url": "/references/sk-djbk-114-2024.pdf",
            "coverage": "Lampiran I dan II (umum dan khusus ASN). Lampiran III program akselerasi fresh graduate belum dimasukkan.",
        },
        "classifications": [{"name": name, "subclassifications": sorted(subs)} for name, subs in taxonomy.items()],
        "entries": records,
    }
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
    print("Schemes:", len(records), "Unique jobs:", len(set((x["classification"], x["subclassification"], x["jobTitle"], x["scope"]) for x in records)))
    print("Classes:", len(taxonomy), "Subclassifications:", sum(map(len, taxonomy.values())))
    print("Scopes:", {scope: sum(x["scope"] == scope for x in records) for scope in ["umum", "asn"]})
    print("Source statuses:", [(x["schemeName"], x["standard"], x["sourcePages"]) for x in records if not x["standard"]][:20])


if __name__ == "__main__":
    main()
