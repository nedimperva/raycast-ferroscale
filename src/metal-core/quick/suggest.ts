import { MATERIAL_GRADES } from "../datasets/materials";
import { getProfileById } from "../datasets/profiles";
import type {
  ProfileCategory,
  ProfileId,
  StandardProfileDefinition,
  StandardSizeOption,
} from "../datasets/types";
import { calculateQuickFromQuery } from "./calculate";

export type QuickSuggestionKind =
  | "profile"
  | "size"
  | "length"
  | "example"
  | "quantity"
  | "material"
  | "price"
  | "dimension-search";

export interface QuickSuggestionItem {
  kind: QuickSuggestionKind;
  title: string;
  subtitle: string;
  insertText: string;
  accessory?: string;
}

interface AliasConfig {
  aliases: string[];
  canonicalAlias: string;
  profileId: ProfileId;
  label: string;
  category: ProfileCategory;
  exampleGeometry?: string;
}

const ALIASES: AliasConfig[] = [
  {
    aliases: ["ipe"],
    canonicalAlias: "ipe",
    profileId: "beam_ipe_en",
    label: "IPE Beam",
    category: "structural",
  },
  {
    aliases: ["ipn"],
    canonicalAlias: "ipn",
    profileId: "beam_ipn_en",
    label: "IPN Beam",
    category: "structural",
  },
  {
    aliases: ["hea"],
    canonicalAlias: "hea",
    profileId: "beam_hea_en",
    label: "HEA Beam",
    category: "structural",
  },
  {
    aliases: ["heb"],
    canonicalAlias: "heb",
    profileId: "beam_heb_en",
    label: "HEB Beam",
    category: "structural",
  },
  {
    aliases: ["hem"],
    canonicalAlias: "hem",
    profileId: "beam_hem_en",
    label: "HEM Beam",
    category: "structural",
  },
  {
    aliases: ["upn"],
    canonicalAlias: "upn",
    profileId: "channel_upn_en",
    label: "UPN Channel",
    category: "structural",
  },
  {
    aliases: ["upe"],
    canonicalAlias: "upe",
    profileId: "channel_upe_en",
    label: "UPE Channel",
    category: "structural",
  },
  {
    aliases: ["tee", "t"],
    canonicalAlias: "tee",
    profileId: "tee_en",
    label: "Tee Section",
    category: "structural",
  },
  {
    aliases: ["shss", "shstd"],
    canonicalAlias: "shss",
    profileId: "shs_std_en",
    label: "Standard SHS",
    category: "tubes",
  },
  {
    aliases: ["rhss", "rhstd"],
    canonicalAlias: "rhss",
    profileId: "rhs_std_en",
    label: "Standard RHS",
    category: "tubes",
  },
  {
    aliases: ["la", "leq", "stda"],
    canonicalAlias: "la",
    profileId: "angle_std_en",
    label: "Standard Equal-Leg Angle",
    category: "structural",
  },
  {
    aliases: ["rb", "rnd", "roundbar"],
    canonicalAlias: "rb",
    profileId: "round_bar",
    label: "Round Bar",
    category: "bars",
    exampleGeometry: "30x6000",
  },
  {
    aliases: ["sb", "sq", "squarebar"],
    canonicalAlias: "sb",
    profileId: "square_bar",
    label: "Square Bar",
    category: "bars",
    exampleGeometry: "30x6000",
  },
  {
    aliases: ["fb", "flt", "flatbar"],
    canonicalAlias: "fb",
    profileId: "flat_bar",
    label: "Flat Bar",
    category: "bars",
    exampleGeometry: "80x8x6000",
  },
  {
    aliases: ["angle", "l"],
    canonicalAlias: "angle",
    profileId: "angle",
    label: "Custom Angle",
    category: "structural",
    exampleGeometry: "60x6x6000",
  },
  {
    aliases: ["chs", "pipe"],
    canonicalAlias: "chs",
    profileId: "pipe",
    label: "Circular Hollow Section",
    category: "tubes",
    exampleGeometry: "60.3x3.2x6000",
  },
  {
    aliases: ["shs", "squarehollow"],
    canonicalAlias: "shs",
    profileId: "square_hollow",
    label: "Custom SHS",
    category: "tubes",
    exampleGeometry: "40x4x6000",
  },
  {
    aliases: ["rhs", "rectangular"],
    canonicalAlias: "rhs",
    profileId: "rectangular_tube",
    label: "Custom RHS",
    category: "tubes",
    exampleGeometry: "100x60x5x6000",
  },
  {
    aliases: ["plate", "pl", "plt", "sheet", "sht"],
    canonicalAlias: "plate",
    profileId: "plate",
    label: "Plate",
    category: "plates_sheets",
    exampleGeometry: "1500x3000x10",
  },
  {
    aliases: ["chequered", "chq"],
    canonicalAlias: "chequered",
    profileId: "chequered_plate",
    label: "Chequered Plate",
    category: "plates_sheets",
    exampleGeometry: "1500x5x2x3000",
  },
  {
    aliases: ["expanded", "xpm"],
    canonicalAlias: "expanded",
    profileId: "expanded_metal",
    label: "Expanded Metal",
    category: "plates_sheets",
    exampleGeometry: "1250x2500x2",
  },
  {
    aliases: ["corrugated", "corr"],
    canonicalAlias: "corrugated",
    profileId: "corrugated_sheet",
    label: "Corrugated Sheet",
    category: "plates_sheets",
    exampleGeometry: "1250x2500x0.7",
  },
];

const FRONT_ALIASES = [
  "ipe",
  "hea",
  "heb",
  "shss",
  "rhss",
  "rb",
  "fb",
  "chs",
  "plate",
  "la",
];

const MATERIAL_SUGGESTIONS = [
  { alias: "s235", label: "S235", group: "Steel" },
  { alias: "s355", label: "S355", group: "Steel" },
  { alias: "s420", label: "S420", group: "Steel" },
  { alias: "304", label: "304", group: "Stainless" },
  { alias: "316", label: "316", group: "Stainless" },
  { alias: "alu", label: "Aluminium", group: "Aluminium" },
  { alias: "brass", label: "Brass", group: "Copper family" },
  { alias: "ti", label: "Titanium", group: "Titanium" },
];

const QUANTITY_SUGGESTIONS = ["2", "5", "10", "20"];
const LENGTH_SUGGESTIONS = ["3m", "4m", "6m", "12m"];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeSize(value: string): string {
  return value
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/\u00d7/g, "x")
    .replace(/\*/g, "x")
    .replace(/\s+/g, "");
}

function findAlias(token: string): AliasConfig | undefined {
  const key = normalize(token);
  return ALIASES.find((alias) => alias.aliases.some((item) => item === key));
}

function findAliasToken(token: string):
  | {
      alias: AliasConfig;
      body: string;
    }
  | undefined {
  const normalized = normalizeSize(token);
  const exact = findAlias(normalized);
  if (exact) return { alias: exact, body: "" };

  const aliases = ALIASES.flatMap((alias) =>
    alias.aliases.map((aliasValue) => ({ alias, aliasValue })),
  ).sort((a, b) => b.aliasValue.length - a.aliasValue.length);

  for (const item of aliases) {
    if (!normalized.startsWith(item.aliasValue)) continue;
    const body = normalized.slice(item.aliasValue.length);
    if (!body || !/\d/.test(body)) continue;
    return { alias: item.alias, body };
  }

  return undefined;
}

function findAliasMatches(partial: string): AliasConfig[] {
  const key = normalize(partial);
  const aliases = key
    ? ALIASES.filter(
        (entry) =>
          entry.aliases.some((alias) => alias.startsWith(key)) ||
          normalize(entry.label).startsWith(key),
      )
    : ALIASES.filter((entry) => FRONT_ALIASES.includes(entry.canonicalAlias));

  return aliases.slice(0, 10);
}

function stripAliasPrefix(alias: string, size: StandardSizeOption): string {
  const normalizedId = normalizeSize(size.id);
  const normalizedLabel = normalizeSize(size.label);
  if (normalizedId.startsWith(alias)) return normalizedId.slice(alias.length);
  if (normalizedLabel.startsWith(alias)) {
    return normalizedLabel.slice(alias.length);
  }
  if (size.id.startsWith("t") && alias === "tee") return size.id.slice(1);
  return size.id;
}

function profileSizes(alias: AliasConfig): StandardSizeOption[] {
  const profile = getProfileById(alias.profileId);
  return profile?.mode === "standard" ? profile.sizes : [];
}

function sizeSuggestions(
  alias: AliasConfig,
  partialGeometry: string,
): QuickSuggestionItem[] {
  const profile = getProfileById(alias.profileId);
  if (!profile || profile.mode !== "standard") return [];

  const partialSize = normalizeSize(partialGeometry.split("x")[0] ?? "");
  const sizes = rankSizes(profile, partialSize).slice(0, 8);

  return sizes.map((size) => {
    const shortSize = stripAliasPrefix(alias.canonicalAlias, size);
    const insertText = `${alias.canonicalAlias}${shortSize} `;
    return {
      kind: "size",
      title: `${alias.canonicalAlias.toUpperCase()} ${shortSize}`,
      subtitle: `Use ${size.label}, then choose a length`,
      insertText,
      accessory: `${size.areaMm2} mm2`,
    };
  });
}

function rankSizes(
  profile: StandardProfileDefinition,
  partialSize: string,
): StandardSizeOption[] {
  if (!partialSize) return profile.sizes.slice(0, 8);

  const queryNumber = Number(partialSize.match(/\d+(?:\.\d+)?/)?.[0]);
  return [...profile.sizes]
    .map((size) => {
      const normalized = normalizeSize(`${size.id} ${size.label}`);
      const leading = Number(
        normalizeSize(size.id).match(/\d+(?:\.\d+)?/)?.[0],
      );
      const starts = normalized.includes(partialSize) ? 0 : 1;
      const distance =
        Number.isFinite(queryNumber) && Number.isFinite(leading)
          ? Math.abs(leading - queryNumber)
          : 9999;
      return { size, starts, distance };
    })
    .sort((a, b) => a.starts - b.starts || a.distance - b.distance)
    .map((item) => item.size);
}

function hasFlag(query: string, flag: string): boolean {
  return new RegExp(`\\b${flag}=`).test(query);
}

function profileSuggestions(partial: string): QuickSuggestionItem[] {
  return findAliasMatches(partial).map((alias) => ({
    kind: "profile",
    title: alias.canonicalAlias.toUpperCase(),
    subtitle: `${alias.label} - ${alias.aliases.join(", ")}`,
    insertText: alias.canonicalAlias,
    accessory: alias.category.replace("_", " "),
  }));
}

function manualExampleSuggestions(alias: AliasConfig): QuickSuggestionItem[] {
  if (!alias.exampleGeometry) return [];
  const query = `${alias.canonicalAlias} ${alias.exampleGeometry}`;
  return [
    {
      kind: "example",
      title: query,
      subtitle: `Start with a common ${alias.label.toLowerCase()} shape`,
      insertText: query,
    },
  ];
}

function lengthSuggestions(query: string): QuickSuggestionItem[] {
  const base = query.trim();
  return LENGTH_SUGGESTIONS.map((length) => ({
    kind: "length",
    title: length,
    subtitle: "Set piece length",
    insertText: `${base} ${length} `,
  }));
}

function refinementSuggestions(query: string): QuickSuggestionItem[] {
  const suggestions: QuickSuggestionItem[] = [];

  if (!hasFlag(query, "qty") && !/\s[x×*]\d+(?:[.,]\d+)?\b/i.test(query)) {
    suggestions.push(
      ...QUANTITY_SUGGESTIONS.map((qty) => ({
        kind: "quantity" as const,
        title: `x${qty}`,
        subtitle: `Set quantity to ${qty} pieces`,
        insertText: `${query.trim()} x${qty}`,
      })),
    );
  }

  if (
    !hasFlag(query, "mat") &&
    !hasFlag(query, "dens") &&
    !/\s(?:s235|s275|s355|s420|s460|304|316|316l|alu|brass|ti)\b/i.test(query)
  ) {
    suggestions.push(
      ...MATERIAL_SUGGESTIONS.map((material) => ({
        kind: "material" as const,
        title: material.alias,
        subtitle: `${material.label} - ${material.group}`,
        insertText: `${query.trim()} ${material.alias}`,
      })),
    );
  }

  if (
    !hasFlag(query, "price") &&
    !/\s@?\d+(?:[.,]\d+)?\/(?:kg|lb|m|ft|pc|pcs|piece)\b/i.test(query)
  ) {
    suggestions.push(
      ...["@0.85/kg", "@1.20/kg", "@3.20/m", "@12/pc"].map((flag) => ({
        kind: "price" as const,
        title: flag,
        subtitle: "Add a Command price override",
        insertText: `${query.trim()} ${flag}`,
      })),
    );
  }

  return suggestions.slice(0, 10);
}

function partialFlagSuggestions(query: string): QuickSuggestionItem[] {
  const token = query.trim().split(/\s+/).pop() ?? "";
  const materialMatch = token.match(/^mat=(.*)$/i);
  if (materialMatch) {
    const partial = materialMatch[1].toLowerCase();
    const fromDataset = MATERIAL_GRADES.map((grade) => ({
      alias: grade.id,
      label: grade.label,
      group: grade.familyId.replace("_", " "),
    }));
    return [...MATERIAL_SUGGESTIONS, ...fromDataset]
      .filter(
        (material) =>
          material.alias.toLowerCase().startsWith(partial) ||
          material.label.toLowerCase().startsWith(partial),
      )
      .slice(0, 10)
      .map((material) => ({
        kind: "material",
        title: `mat=${material.alias}`,
        subtitle: `${material.label} - ${material.group}`,
        insertText: query.replace(/mat=\S*$/i, `mat=${material.alias}`),
      }));
  }

  return [];
}

function dimensionSuggestions(query: string): QuickSuggestionItem[] {
  const trimmed = query.trim();
  if (trimmed !== "" && trimmed !== "?") return [];
  return ["?40", "?80", "?100", "?200", "?200x100"].map((insertText) => ({
    kind: "dimension-search",
    title: insertText,
    subtitle: "Search standard profile sizes by nominal dimension",
    insertText,
  }));
}

export function buildQuickSuggestions(query: string): QuickSuggestionItem[] {
  const raw = query;
  const trimmed = raw.trim();
  const endsWithSpace = /\s$/.test(raw);

  if (!trimmed || trimmed === "?") {
    return [...profileSuggestions(""), ...dimensionSuggestions(trimmed)].slice(
      0,
      12,
    );
  }

  if (trimmed.startsWith("?")) return dimensionSuggestions(trimmed);

  const flagSuggestions = partialFlagSuggestions(raw);
  if (flagSuggestions.length > 0) return flagSuggestions;

  const tokens = trimmed.split(/\s+/);
  const aliasToken = findAliasToken(tokens[0]);
  const alias = aliasToken?.alias;

  if (!alias) {
    return profileSuggestions(tokens[0]);
  }

  const result = calculateQuickFromQuery(trimmed);
  if (result.ok) return refinementSuggestions(trimmed);

  const positional = [
    aliasToken.body,
    ...tokens.slice(1).filter((token) => !token.includes("=")),
  ].filter(Boolean);
  const geometry = positional.join("");
  const profile = getProfileById(alias.profileId);

  if (
    !aliasToken.body &&
    (!geometry || (tokens.length === 1 && !endsWithSpace))
  ) {
    if (profile?.mode === "standard") return sizeSuggestions(alias, "");
    return manualExampleSuggestions(alias);
  }

  if (aliasToken.body && tokens.length === 1) {
    if (endsWithSpace) return lengthSuggestions(trimmed);
    if (profile?.mode === "standard")
      return sizeSuggestions(alias, aliasToken.body);
    return lengthSuggestions(trimmed);
  }

  if (aliasToken.body && tokens.length > 1) {
    return lengthSuggestions(tokens[0]);
  }

  if (profile?.mode === "standard") {
    return sizeSuggestions(alias, geometry);
  }

  return manualExampleSuggestions(alias);
}

export function applyQuickSuggestion(item: QuickSuggestionItem): string {
  if (item.kind === "profile" || item.kind === "dimension-search") {
    return item.insertText;
  }
  return item.insertText.endsWith(" ")
    ? item.insertText
    : `${item.insertText} `;
}

export function popularSizesForAlias(aliasValue: string): string[] {
  const alias = findAlias(aliasValue);
  if (!alias) return [];
  return profileSizes(alias)
    .slice(0, 8)
    .map((size) => stripAliasPrefix(alias.canonicalAlias, size));
}
