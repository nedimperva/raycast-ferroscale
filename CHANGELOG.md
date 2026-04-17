# Ferroscale Changelog

## [0.2.0] - 2026-04-17

### Unified Command

- Keep a single `Ferroscale` Raycast command as the public entrypoint
- Surface quick calculation, dimension search, profile browsing, material browsing, comparison, history, and reference help from that command

### Calculator and Dataset Additions

- Add surface area output where profile perimeter data is available
- Add pricing support with `price=`, `currency=`, and `basis=`
- Add `area=<mm2>` custom cross-section override
- Add `t=<value>` shorthand for flat bar, sheet, and plate
- Add normalized input output for easier copy and reuse
- Add SHS standard sizes, RHS standard sizes, and equal-leg angle standard sizes
- Expand material coverage with additional steel, stainless, aluminum, copper-family, titanium, and cast iron grades

### Embedded Tools

- Add Compare Profiles with side-by-side output and Markdown/CSV export
- Add Browse Profiles with standard sizes, formulas, and EN references
- Add Browse Materials with densities, references, and `mat=` shortcuts
- Add Calculation History with list/detail views, re-run into the main calculator, single-entry JSON/Markdown export, and bulk CSV export

### Store-Ready Polish

- Align package metadata, README, and changelog with the single-command UX
- Remove private package metadata so the extension is ready for publishing
- Extract shared history persistence helpers to reduce drift between calculator and history views
- Normalize Raycast action titles and formatting so `ray lint` passes cleanly

## [0.1.0] - 2026-03-04

- Initial Quick Metal Weight release
- Support bars, tubes, plates, sheets, and EN structural profiles
- Support material, quantity, density, and unit flags
- Show live result updates as the user types
