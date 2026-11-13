# Smoother mascot

`directions.png` is the original transparent 5x5 sheet generated with the built-in image
tool from `characters/utkarsh/directions.png`. The exact prompt is in `prompt.md`.
Columns turn left to right; rows tilt up to down. The center is row 3, column 3.
The reactions reuse `characters/utkarsh/reactions.png`; no new expressions were generated.

From the project root, with Python and Pillow, NumPy, and SciPy installed:

```sh
python scripts/build-mascot-atlases.py utkarsh-smooth --anchor shoulders --reactions characters/utkarsh/reactions.png
python scripts/verify-mascot-atlases.py utkarsh-smooth
```

The adapted MIT-licensed page-mascot pipeline outputs a 5x5 direction atlas and a 3x3
reaction atlas at 256px per cell. It anchors shoulders, aligns expressions, and adds
the original soft bottom fade. The original nine-pose assets are preserved.

Build validation at 140px rendered: 0.00px direction movement, 0.00px movement on click,
81.8% palette overlap, and 4.2% shoulder-width difference between directions and reactions.
Atlases are approximately 386KB and 128KB respectively. The builder removes stray
generated islands from directions while retaining the expression symbols.

Development comparison: `/mascot-preview`. This route returns 404 in production.
The homepage uses the 25-pose version. Cursor tracking uses damping and hysteresis;
neighboring poses are held briefly so a fast reversal does not skip straight across.
Tracking stops when settled, flipped to the photo, the document is hidden, or reduced
motion is enabled. Touch devices keep the neutral pose and support tap expressions.
