# Ferroscale Raycast Extension

Ferroscale is a single Raycast command for quick metal profile weight calculations, profile search, side-by-side comparison, material lookup, and recent calculation history.

## Command

| Command        | Description                                                                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ferroscale** | Unified entrypoint for quick calculations, dimension search, profile browsing, material browsing, comparison, reference help, and calculation history |

## What the Command Includes

- Quick metal weight calculation from shorthand input typed directly into the Raycast search bar
- Dimension search with `?<mm>` or `?<mm>x<mm>` across standard sizes
- Embedded tools for Browse Profiles, Browse Materials, Compare Profiles, and Calculation History
- Alias quick reference with ready-to-copy examples

## Quick Weight

### Query Grammar

```text
<alias> <dimensions>x<length> [flags...]
```

For EN standard-size profiles:

```text
<alias> <size>x<length> [flags...]
```

Dimensions and length are separated by `x`. A trailing unit suffix (`mm`, `cm`, `m`, `in`, `ft`) is accepted on any number. Bare numbers default to `mm` unless overridden with `unit=`.

### Profile Aliases

#### Bars

| Alias              | Profile    | Dimension Order            |
| ------------------ | ---------- | -------------------------- |
| `rb` / `roundbar`  | Round bar  | `D x L`                    |
| `sb` / `squarebar` | Square bar | `A x L`                    |
| `fb` / `flatbar`   | Flat bar   | `W x T x L` or `W x L t=T` |

#### Tubes - Custom Dimensions

| Alias                  | Profile                    | Dimension Order                |
| ---------------------- | -------------------------- | ------------------------------ |
| `chs` / `pipe`         | Circular hollow section    | `OD x T x L`                   |
| `shs` / `squarehollow` | Square hollow section      | `A x T x L` or `A x A x T x L` |
| `rhs` / `rectangular`  | Rectangular hollow section | `W x H x T x L`                |

#### Tubes - EN Standard Sizes

| Alias            | Profile              | Example              |
| ---------------- | -------------------- | -------------------- |
| `shss` / `shstd` | SHS (EN 10219/10210) | `shss 40x4x6000`     |
| `rhss` / `rhstd` | RHS (EN 10219/10210) | `rhss 100x60x5x6000` |

#### Structural Beams

| Alias | Profile                  | Standard |
| ----- | ------------------------ | -------- |
| `ipe` | IPE beam                 | EN 10365 |
| `ipn` | IPN beam                 | EN 10024 |
| `hea` | HEA wide flange (light)  | EN 10365 |
| `heb` | HEB wide flange (medium) | EN 10365 |
| `hem` | HEM wide flange (heavy)  | EN 10365 |

#### Channels

| Alias | Profile     | Standard |
| ----- | ----------- | -------- |
| `upn` | UPN channel | EN 10365 |
| `upe` | UPE channel | EN 10279 |

#### Tee Sections

| Alias       | Profile       | Standard |
| ----------- | ------------- | -------- |
| `tee` / `t` | Equal-leg tee | EN 10055 |

#### Angles

| Alias                 | Profile                      | Dimension Order                         |
| --------------------- | ---------------------------- | --------------------------------------- |
| `angle` / `l`         | Angle - custom dimensions    | `legA x legB x T x L` or `A x T x L`    |
| `la` / `leq` / `stda` | Equal-leg angle (EN 10056-1) | `A x T x L`, for example `la 80x8x6000` |

#### Sheets and Plates

| Alias           | Profile          | Dimension Order                          |
| --------------- | ---------------- | ---------------------------------------- |
| `sheet` / `sht` | Sheet            | `W x T x L`, `W x L x T`, or `W x L t=T` |
| `plate` / `pl`  | Plate            | same as sheet                            |
| `chequered`     | Chequered plate  | `W x T x L`                              |
| `expanded`      | Expanded metal   | `W x T x L`                              |
| `corrugated`    | Corrugated sheet | `W x T x L`                              |

### Flags

| Flag              | Default        | Description                                           |
| ----------------- | -------------- | ----------------------------------------------------- | --- | ---- | ---- | ------------------------------------------------------- |
| `qty=<n>`         | `1`            | Quantity (number of pieces)                           |
| `mat=<grade>`     | `steel-s235jr` | Material grade or alias                               |
| `dens=<kg/m3>`    | none           | Custom density override (takes precedence over `mat`) |
| `unit=<mm         | cm             | m                                                     | in  | ft>` | `mm` | Fallback unit for bare numbers without an inline suffix |
| `t=<value>`       | none           | Thickness shorthand for `fb`, `sheet`, `plate`        |
| `area=<mm2>`      | none           | Custom cross-section area override                    |
| `price=<value>`   | none           | Unit price amount                                     |
| `currency=<code>` | `EUR`          | Pricing currency: `EUR`, `USD`, `GBP`, `PLN`, `BAM`   |
| `basis=<basis>`   | `kg`           | Pricing basis: `kg`, `lb`, `m`, `ft`, `pc`            |

### Material Shortcuts

- Steel: `steel`, `s235`, `s275`, `s355`, `s420`, `s460`
- Stainless: `stainless`, `304`, `316`, `316l`, `duplex`
- Aluminum: `alu`, `6060`, `6061`, `6082`, `5754`, `3003`, `7075`
- Copper family: `copper`, `cu`, `brass`, `bronze`
- Titanium: `ti`, `tigrade2`, `tigrade5`, `ti6al4v`
- Cast iron: `castiron`, `greyiron`, `gjl250`, `gjl300`

### Examples

```text
rb 30x6000 qty=10 mat=s355
shss 40x4x6000 qty=5 mat=s355
rhss 100x60x5x6000 qty=4
ipe 200x6000 mat=s355 price=0.85
plate 1500x3000 t=10 qty=3
ipe 6000 area=3200 mat=s355
?40
?200x100
```

## Embedded Tools

### Compare Profiles

Enter query A, lock it, then enter query B to compare:

- profile, material, density, length, quantity, linear density, unit weight, total weight, surface area, and total price
- weight delta for B minus A
- export actions for Markdown and CSV

### Browse Profiles

Search all supported profile families and inspect:

- standard sizes
- cross-section areas
- perimeters where available
- formulas and EN references

### Browse Materials

Search material grades and inspect:

- density in `kg/m3`, `kg/dm3`, `g/cm3`, and `lb/ft3`
- EN references
- `mat=` shortcuts

### Calculation History

Calculations are auto-saved after 1.5 seconds. From the history list you can:

- re-run a saved query back into the main Ferroscale search bar
- view details for a saved calculation
- copy the query, weights, linear density, surface area, or total price
- export a single entry as JSON or Markdown
- delete one entry or clear all history
- bulk export all history as CSV

## Setup

```bash
npm install
npm run dev
npm run build
npm run lint
```

Before publishing, make sure the `author` field in `package.json` matches the Raycast account that will publish the extension.

## Troubleshooting

- Parser rejects input: start with a fully explicit query such as `shs 40x40x4x6000mm qty=1 mat=steel`
- Lint fails on metadata: verify the package metadata, author handle, and icon paths match the published extension
- Surface area is not shown: the selected profile does not expose a computable perimeter
