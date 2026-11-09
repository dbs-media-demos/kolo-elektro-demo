"""
The two font files phones load (public/fonts), and the metrics of their Arial/Roboto stand-ins.
Desktop keeps its fonts from next/font in layout.tsx. Phones get:
  geologica-phone.woff2   Geologica 500 (headings), one static instance
  instrument-phone.woff2  Instrument Sans 400-600 (body), variable weight, normal width
Latin plus Latin Extended-A (č ć š ž đ for Serbian) and the punctuation the copy uses.
Mono labels use the system monospace and the handwriting uses the heading face, slanted (globals.css).

Sources (OFL), from github.com/google/fonts: ofl/geologica, ofl/instrumentsans
  python scripts/phone-fonts.py "Geologica[CRSV,SHRP,slnt,wght].ttf" "InstrumentSans[wdth,wght].ttf"
"""
import sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

OUT = Path(__file__).resolve().parent.parent / "public" / "fonts"
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x180))
    + [0x2C6, 0x2DA, 0x2DC, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E, 0x2022, 0x2026]
    + [0x2032, 0x2033, 0x2039, 0x203A, 0x20AC, 0x2122, 0x2190, 0x2192, 0x2197, 0x2212]
)
# The text a fallback is sized against: average width of lowercase running text
SAMPLE = "the quick brown fox jumps over a lazy dog and a few more common letters električar dođe kad kaže "


def avg_width(font: TTFont) -> float:
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    widths = [hmtx[cmap[ord(c)]][0] for c in SAMPLE if ord(c) in cmap]
    return sum(widths) / len(widths) / font["head"].unitsPerEm


def build(src: str, out: str, axes: dict) -> TTFont:
    font = instancer.instantiateVariableFont(TTFont(src), axes)
    options = subset.Options()
    options.layout_features = ["kern", "liga", "mark", "mkmk", "ccmp", "locl", "tnum", "case"]
    options.flavor = "woff2"
    options.name_IDs = [1, 2, 4, 6]
    options.hinting = False
    options.desubroutinize = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=UNICODES)
    subsetter.subset(font)
    font.flavor = "woff2"
    font.save(OUT / out)
    print(f"{out}: {(OUT / out).stat().st_size / 1024:.1f} KB")
    return font


def fallback(font: TTFont, name: str) -> None:
    """size-adjust and overrides for an Arial stand-in, the way next/font computes them."""
    arial = TTFont("C:/Windows/Fonts/arial.ttf")
    ratio = avg_width(font) / avg_width(arial)
    upm = font["head"].unitsPerEm
    hhea = font["hhea"]
    print(
        f'{name}: size-adjust: {ratio * 100:.2f}%; ascent-override: {hhea.ascent / upm / ratio * 100:.2f}%; '
        f'descent-override: {abs(hhea.descent) / upm / ratio * 100:.2f}%; line-gap-override: {hhea.lineGap / upm / ratio * 100:.2f}%;'
    )


OUT.mkdir(parents=True, exist_ok=True)
geo = build(sys.argv[1], "geologica-phone.woff2", {"wght": 500, "CRSV": 0, "SHRP": 0, "slnt": 0})
ins = build(sys.argv[2], "instrument-phone.woff2", {"wdth": 100, "wght": (400, 600)})
fallback(geo, "Geologica Phone Fallback")
fallback(instancer.instantiateVariableFont(TTFont(sys.argv[2]), {"wdth": 100, "wght": 400}), "Instrument Phone Fallback")
