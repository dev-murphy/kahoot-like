# Question Types

[← Back to README](../README.md)

All eight ship. Scoring is Kahoot-style (30–100% of base points based on
speed) for every type; Slider and Pin Answer additionally scale by proximity.
See [Scoring](ARCHITECTURE.md#scoring) for the formula.

| Type | Label | Player interaction | Correctness |
| ---- | ----- | ------------------- | ----------- |
| `quiz` | Quiz | Pick 1 of 2–4 choices | Matches the correct index |
| `true_false` | True or False | Pick true/false | Matches the correct boolean |
| `type_answer` | Type Answer | Free text | Forgiving match — trims, lowercases, collapses whitespace; any of the configured acceptable answers count |
| `slider` | Slider | Drag/±buttons to pick a number | Within tolerance of the correct value; score scales with proximity |
| `pin_answer` | Pin Answer | Tap a point on an image | Within radius of the correct point; score scales with proximity |
| `puzzle` | Puzzle | Drag cards into order | Exact order match |
| `fill_blank` | Fill in the Blank | Drag word-bank words into one or more `{blank}` slots in a sentence | Every blank matches its configured answer (forgiving text match) |
| `complete_text` | Complete the Text | Drag word-bank words into order to reconstruct a full sentence | Word sequence matches the tokenized sentence (forgiving text match) |

## Word-bank types

`fill_blank` and `complete_text` both need a word bank containing every
correct word **plus enough duplicate copies** to cover repeated words (e.g.
if the answer uses "the" twice, the bank needs two "the" entries) — the
Question Editor's "add answer words" / "auto-fill" buttons account for this
automatically. Distractor words can be added on top to make the round
harder.
