# Wine Identity Fields — name, appellation and classification

Three fields on a registry wine describe what the bottle *is*, and they are easy to mix up: a tier word can sit in any of them, depending on who wrote the label. This page states which field each piece of label text belongs in, gives worked examples, and points to where each rule is enforced.

It is written for contributors filing corrections, sommeliers reviewing them, and anyone writing a prompt or an MCP schema that produces these fields.

> **Status: draft.** The rules below were settled in the discussion that led to #1700. Some of the enforcement is still being built there; those rows are marked *planned* in the tables.

---

## The short version

| Field | Holds | Never holds |
|---|---|---|
| **name** | What tells this bottle apart within the producer's range | The producer, the vintage, a classification line on its own |
| **appellation** | The appellation as the register names it | The regulatory mark (DOCG, AOC, DO …), a production method |
| **classification** | A quality tier on top of the appellation | A regulatory mark (DOCG, DOC, AOC …) |

The one-line test: **DOCG, DOC, AOC and their peers follow from the appellation, so they belong in no field.** Everything else has one home, and a tier word printed as part of the wine's name may have two.

---

## name

The name is what distinguishes the bottle within the producer's range, without the producer and without the vintage.

- **Producer out.** "Cloudy Bay Sauvignon Blanc" is name "Sauvignon Blanc", producer "Cloudy Bay".
- **Estate wines take the estate's name.** A château's grand vin with no separate cuvée name has name equal to producer: name "Château Margaux", producer "Château Margaux". This is correct, not a duplicate.
- **A classification line on its own is never a name.** "Grand Cru Classé en 1855" printed under the estate goes in `classification`; the name falls back to the estate.
- **Tier words printed as part of the name stay in the name.** "Riesling Spätlese", "Rioja Gran Reserva": the word stays, *and* `classification` is set too (see [Tier words in two fields](#tier-words-in-two-fields)).
- **A tier word may stand alone as the name** when the producer's range uses it as the wine's name: the Rioja convention (Crianza, Reserva, Gran Reserva) and Champagne co-op cuvées. Premier Cru and Grand Cru in Burgundy and its peers are appellation material instead.
- **Production method is not name material**, unless the label prints it as part of the cuvée's own name.

## appellation

The appellation is the appellation **as the register names it, without the regulatory mark**.

- **The mark goes.** "Barolo DOCG" → "Barolo"; "DOCa Rioja" → "Rioja"; "Chianti Denominazione di Origine Controllata" → "Chianti". This is stripped automatically on write, as a prefix, a suffix or a spelled-out phrase.
- **Tier words that are part of the legal name stay.** "Chablis Premier Cru", "Saint-Émilion Grand Cru", "Alsace Grand Cru", "Gevrey-Chambertin Premier Cru" are the appellations themselves. The registry holds several hundred of these and they are correct. Do not move Premier Cru or Grand Cru out of the appellation in these regions.
- **Some marks are the official form.** "Kamptal DAC" and "VQA Ontario" keep their mark, because that is how the register names them.
- **A bare Prädikat is not an appellation.** "Spätlese" alone in the appellation field is moved to `classification` automatically.
- **Production method is not an appellation.** "Metodo Classico", "Méthode Traditionnelle", "Méthode Cap Classique" do not go here (*planned:* the prompts that put them here are being corrected).

## classification

The classification is a quality tier on top of the appellation: Riserva, Reserva, Gran Reserva, Grand Cru Classé en 1855, Premier Grand Cru Classé, Cru Bourgeois, Grosses Gewächs, and the German Prädikat (Kabinett, Spätlese, Auslese …).

- **No regulatory marks.** "DOCG", "Riserva DOCG", "AOC" do not go here. "Riserva DOCG" is classification "Riserva". (*Planned:* stripped automatically on write, the same way the appellation already is, with a backfill of the existing rows.)
- **Leave it empty** when the label states no tier. Do not infer one: "Cuvée Réservée" or "Réserve" is marketing, not a classification.

### Tier words in two fields

When the label prints a tier as part of the wine's name, the word goes in **both** `name` and `classification`.

- `name` needs it because the duplicate guard tells an estate's Kabinett from its Spätlese by the words in the name (see `utils/styleTerms.js`). Without it, two different wines can be filed as one.
- `classification` needs it so the tier is consistent and filterable across the registry.

---

## Worked examples

| Label | name | appellation | classification |
|---|---|---|---|
| Château Lynch-Bages, Pauillac, Grand Cru Classé en 1855 | Château Lynch-Bages | Pauillac | Grand Cru Classé en 1855 |
| Château Figeac, Saint-Émilion Grand Cru, Premier Grand Cru Classé | Château Figeac | Saint-Émilion Grand Cru | Premier Grand Cru Classé |
| Giacomo Borgogno, Barolo Riserva DOCG | Barolo Riserva | Barolo | Riserva |
| Alpha Zeta, Amarone della Valpolicella DOCG | Amarone della Valpolicella | Amarone della Valpolicella | *(empty)* |
| Joseph Drouhin, Chablis Premier Cru "Vaillons" | Vaillons | Chablis Premier Cru | *(empty)* |
| Domaine Faiveley, Corton Grand Cru "Clos des Cortons" | Clos des Cortons | Corton | *(empty)* |
| Dr. Loosen, Wehlener Sonnenuhr Riesling Spätlese | Wehlener Sonnenuhr Riesling Spätlese | Mosel | Spätlese |
| La Rioja Alta, Gran Reserva 904, DOCa Rioja | Gran Reserva 904 | Rioja | Gran Reserva |
| Pongrácz, Blanc de Blancs, Méthode Cap Classique, WO Western Cape | Blanc de Blancs | Western Cape | *(empty)* |

Notes on the examples:

- **Figeac:** "Grand Cru" is part of the appellation; "Premier Grand Cru Classé" is the tier on top of it. They are not the same thing.
- **Corton:** Burgundy grand-cru vineyards are appellations in their own right, so the appellation is "Corton" and the grand-cru status follows from it.
- **Amarone:** the DOCG follows from the appellation, so classification stays empty. This is the case that started this page.

---

## Where each rule is enforced

| Rule | Where | Status |
|---|---|---|
| Strip DOCG, AOC, DO … from the appellation | `normalizeAppellation` in `backend/src/utils/normalize.js` | In place |
| Move a bare Prädikat from appellation to classification | `splitPradikatFromAppellation` in `backend/src/utils/styleTerms.js` | In place |
| Keep a Kabinett and a Spätlese from one estate apart | `conflictingStyleTerms` in `backend/src/utils/styleTerms.js` | In place |
| A Bordeaux classification line is not a name | `unpolluteEstateName` / `CLASSIFICATION_ONLY_NAME_RX` in `backend/src/services/findOrCreateWine.js` | In place |
| Prompts ask for a tier, not a regulatory mark | `backend/src/config/aiConfig.js` | Planned (#1700) |
| Production method out of the appellation | `backend/src/config/aiConfig.js` | Planned (#1700) |
| Strip regulatory marks from classification, plus backfill | write path and a backfill script | Planned (#1700) |
| `classification` on `add_bottle`, `bulk_add`, `resolve_wine`, `admin_add_registry_wine` | `backend/src/mcp/tools/write.js`, `adminRegistry.js` | Planned (#1700) |
| Field descriptions on `appellation`, `region`, `classification` in MCP schemas | `backend/src/mcp/tools/` | Planned (#1700) |

---

## Key Files

| File | Role |
|---|---|
| `backend/src/utils/normalize.js` | Appellation normalisation: tier tokens, leading tokens and spelled-out phrases |
| `backend/src/utils/styleTerms.js` | Prädikat and sweetness vocabulary, the Prädikat split, the style-term duplicate guard |
| `backend/src/services/findOrCreateWine.js` | The mint and lookup pipeline, including the estate-name pollution guard |
| `backend/src/scripts/fix-classification-polluted-names.js` | Backfill sharing the estate-name guard's pattern |
| `backend/src/config/aiConfig.js` | Label scan, import lookup and text search prompts that produce these fields |
| `backend/src/mcp/tools/write.js` | `NEW_WINE_SHAPE`, `resolve_wine`, `add_bottle`, `bulk_add` |
| `backend/src/mcp/tools/corrections.js` | `suggest_wine_correction` |
