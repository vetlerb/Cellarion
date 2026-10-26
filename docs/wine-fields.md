# Wine Identity Fields — name, appellation and classification

Three fields on a registry wine describe what the bottle *is*, and they are easy to mix up: a tier word can sit in any of them, depending on who wrote the label. This page states which field each piece of label text belongs in, gives worked examples, and points to where each rule is enforced.

It is written for contributors filing corrections, sommeliers reviewing them, and anyone writing a prompt or an MCP schema that produces these fields.

> **Status: draft.** The rules come from discussion #1696 and are tracked in #1700; most of the enforcement lands in #1701. Two conventions are still open for comment in the discussion and are marked *proposed* below: tier words printed in the name, and production-method terms.

---

## The short version

| Field | Holds | Never holds |
|---|---|---|
| **name** | What tells this bottle apart within the producer's range | The producer, the vintage, a classification line on its own |
| **appellation** | The appellation as the register names it | The regulatory mark (DOCG, AOC, DO …), a production method |
| **classification** | A quality tier granted on top of the appellation | A regulatory mark (DOCG, DOC, AOC …) |

The one-line test: **DOCG, DOC, AOC and their peers follow from the appellation, so they belong in no field.** Everything else has one home, and a tier word printed as part of the wine's name may have two.

---

## name

The name is what distinguishes the bottle within the producer's range, without the producer and without the vintage.

- **Producer out.** "Cloudy Bay Sauvignon Blanc" is name "Sauvignon Blanc", producer "Cloudy Bay".
- **Estate wines take the estate's name.** A château's grand vin with no separate cuvée name has name equal to producer: name "Château Margaux", producer "Château Margaux". This is correct, not a duplicate.
- **A classification line on its own is never a name.** "Grand Cru Classé en 1855" printed under the estate goes in `classification`; the name falls back to the estate.
- **Tier words printed as part of the name stay in the name** (*proposed*). "Riesling Spätlese", "Rioja Gran Reserva": the word stays, *and* `classification` is set too (see [Tier words in two fields](#tier-words-in-two-fields)).
- **A tier word may stand alone as the name** when the producer's range uses it as the wine's name: the Rioja convention (Crianza, Reserva, Gran Reserva) and Champagne co-op cuvées. Premier Cru and Grand Cru in Burgundy and its peers are appellation material instead.
- **Production method is not name material** (*proposed*), unless the label prints it as part of the cuvée's own name.

## appellation

The appellation is the appellation **as the register names it, without the regulatory mark**.

- **The mark goes.** "Barolo DOCG" → "Barolo"; "DOCa Rioja" → "Rioja"; "Chianti Denominazione di Origine Controllata" → "Chianti". This is stripped automatically on write, as a prefix, a suffix or a spelled-out phrase.
- **Tier words that are part of the legal name stay.** "Chablis Premier Cru", "Saint-Émilion Grand Cru", "Alsace Grand Cru", "Gevrey-Chambertin Premier Cru" are the appellations themselves. The registry holds several hundred of these and they are correct. Do not move Premier Cru or Grand Cru out of the appellation in these regions.
- **Champagne is the exception.** There, Premier Cru and Grand Cru rate the village, not the appellation: the appellation stays "Champagne" and the cru goes in `classification`.
- **Some marks are the official form.** "Kamptal DAC" and "VQA Ontario" keep their mark, because that is how the register names them.
- **A bare Prädikat is not an appellation.** "Spätlese" alone in the appellation field is moved to `classification` automatically.
- **Production method is not an appellation** (*proposed*). "Metodo Classico", "Méthode Traditionnelle", "Méthode Cap Classique" do not go here. Only a handful of registry rows hold one today.

## classification

The classification is a quality tier granted on top of the appellation: Riserva, Reserva, Gran Reserva, Grand Cru Classé en 1855, Premier Grand Cru Classé, Cru Bourgeois, Grosses Gewächs, Premier Cru and Grand Cru in Champagne, and the German Prädikat (Kabinett, Spätlese, Auslese …).

- **A regulatory mark is never a classification.** "Riserva DOCG" is stored as "Riserva", and a value that is only a mark ("DOCG", "D.O.C.G.", "Appellation d'Origine Protégée") is stored as no classification at all. This is stripped automatically on every write, with the same rule the appellation uses.
- **Leave it empty** when the label states no tier. Do not infer one: "Cuvée Réservée" or "Réserve" is marketing, not a classification.

### Tier words in two fields

*Proposed; open for comment in #1696.*

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
| Pierre Gimonnet, Cuis 1er Cru Blanc de Blancs, Champagne | Cuis 1er Cru Blanc de Blancs | Champagne | Premier Cru |
| Dr. Loosen, Wehlener Sonnenuhr Riesling Spätlese | Wehlener Sonnenuhr Riesling Spätlese | Mosel | Spätlese |
| La Rioja Alta, Gran Reserva 904, DOCa Rioja | Gran Reserva 904 | Rioja | Gran Reserva |
| Pongrácz, Blanc de Blancs, Méthode Cap Classique, WO Western Cape | Blanc de Blancs | Western Cape | *(empty)* |

Notes on the examples:

- **Figeac:** "Grand Cru" is part of the appellation; "Premier Grand Cru Classé" is the tier on top of it. They are not the same thing.
- **Gimonnet:** in Champagne the cru is a classification, not part of the appellation. The tier is printed as part of the name, so it is in both (*proposed*).
- **Corton:** Burgundy grand-cru vineyards are appellations in their own right, so the appellation is "Corton" and the grand-cru status follows from it.
- **Amarone:** the DOCG follows from the appellation, so classification stays empty. This is the case that started this page.

---

## Where each rule is enforced

| Rule | Where | Status |
|---|---|---|
| Strip DOCG, AOC, DO … from the appellation | `normalizeAppellation` in `backend/src/utils/normalize.js` | In place |
| Strip regulatory marks from the classification; empty when only a mark is left | `normalizeClassification` in `backend/src/utils/normalize.js`, applied by the `WineDefinition` pre-validate hook and explicitly in the mint, admin routes, proposals and drafts | #1701 |
| Clean the existing classifications (dry run by default) | `backend/src/scripts/normalize-classification-tiers.js` | #1701 |
| Move a bare Prädikat from appellation to classification | `splitPradikatFromAppellation` in `backend/src/utils/styleTerms.js` | In place |
| Keep a Kabinett and a Spätlese from one estate apart | `conflictingStyleTerms` in `backend/src/utils/styleTerms.js` | In place |
| A Bordeaux classification line is not a name | `unpolluteEstateName` / `CLASSIFICATION_ONLY_NAME_RX` in `backend/src/services/findOrCreateWine.js` | In place |
| Prompts ask for a tier on top of the appellation, never the mark | `backend/src/config/aiConfig.js` (label scan, back label, import lookup, text search, valuation) | #1701 |
| One field description for `appellation`, `region` and `classification` in every MCP tool that takes them | `FIELD_DESCRIPTIONS` in `backend/src/mcp/toolUtil.js` | #1701 |
| `classification` on `add_bottle`, `bulk_add`, `resolve_wine`, `admin_add_registry_wine` | `backend/src/mcp/tools/write.js`, `adminRegistry.js` | #1701 |
| `classification` on the admin wine edit route and form | `backend/src/routes/admin/wines.js`, `frontend/src/pages/AdminWines.js` | #1701 |
| Production method out of the appellation | `backend/src/config/aiConfig.js` | Open: the prompts still put it in the appellation |

---

## Key Files

| File | Role |
|---|---|
| `backend/src/utils/normalize.js` | `normalizeAppellation` and `normalizeClassification`: tier tokens, dotted forms and spelled-out phrases |
| `backend/src/utils/styleTerms.js` | Prädikat and sweetness vocabulary, the Prädikat split, the style-term duplicate guard |
| `backend/src/services/findOrCreateWine.js` | The mint and lookup pipeline, including the estate-name pollution guard |
| `backend/src/scripts/fix-classification-polluted-names.js` | Backfill sharing the estate-name guard's pattern |
| `backend/src/scripts/normalize-classification-tiers.js` | Backfill that strips regulatory marks from existing classifications |
| `backend/src/config/aiConfig.js` | The prompts that produce these fields (label scan, back label, import lookup, text search, valuation) |
| `backend/src/mcp/toolUtil.js` | `FIELD_DESCRIPTIONS`, the shared MCP text for these fields |
| `backend/src/mcp/tools/write.js` | `NEW_WINE_SHAPE`, `resolve_wine`, `add_bottle`, `bulk_add` |
| `backend/src/mcp/tools/corrections.js` | `suggest_wine_correction` |
