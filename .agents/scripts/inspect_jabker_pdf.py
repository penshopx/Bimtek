from pathlib import Path
import pymupdf

source = Path("attached_assets/SK-DJBK-Nomor-114-Thn-2024_4-Des_KPTS-Tentang-Penetapan-Jabker_1791458965022.pdf")
output = Path(".agents/outputs/jabker")
output.mkdir(parents=True, exist_ok=True)
doc = pymupdf.open(source)
print("Pages:", len(doc))
for index in [0, 6, 7, 9]:
    page = doc[index]
    page.get_pixmap(matrix=pymupdf.Matrix(1.3, 1.3)).save(output / f"page-{index+1}.png")
with (output / "source.txt").open("w") as text:
    for index, page in enumerate(doc):
        text.write(f"\n--- PDF PAGE {index+1} ---\n{page.get_text()}")
print("Rendered sample pages and extracted text to", output)
