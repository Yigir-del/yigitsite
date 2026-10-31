export type AchievementId =
  | 'oyuk_entered'
  | 'five_inscriptions'
  | 'hidden_cave_symbol'
  | 'first_note'
  | 'music_rejected'
  | 'all_domains'
  | 'world_flip'
  | 'sudo_discovered'
  | 'wreath_offered'
  | 'not_found_discovered'
  | 'golden_trophy';

export type AchievementCategory =
  | 'oyuk'
  | 'echoes'
  | 'universe'
  | 'hidden'
  | 'respect'
  | 'trophy';

export type AchievementIconKind =
  | 'spark'
  | 'compass'
  | 'coin'
  | 'cave'
  | 'torch'
  | 'quill'
  | 'music'
  | 'cosmos'
  | 'terminal'
  | 'door'
  | 'wreath'
  | 'crown'
  | 'trophy';

export interface AchievementDefinition {
  id: AchievementId;
  order: number;
  title: string;
  description: string;
  category: AchievementCategory;
  icon: AchievementIconKind;
  /** True for the 10 required achievements; false for the final meta-achievement `golden_trophy` (§8) */
  requiredForCompletion: boolean;
}

export const ACHIEVEMENT_CATEGORY_LABELS: Record<
  Exclude<AchievementCategory, 'trophy'>,
  string
> = {
  oyuk: 'Derinlik',
  echoes: 'Frekans ve Kalem',
  universe: 'Boşluk',
  hidden: 'Saklı Olanlar',
  respect: 'Saygı',
};

/**
 * Canonical 10 required achievements + 1 final Golden Trophy meta-achievement (§7.2, §8 & Additional 404 Update).
 */
export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  // ── 1–3: OYUK (Derinlik) ──
  {
    id: 'oyuk_entered',
    order: 1,
    title: 'Kapıyı Açan',
    description: 'Bir dilencinin peşinden bilinmeyene girdin.',
    category: 'oyuk',
    icon: 'cave',
    requiredForCompletion: true,
  },
  {
    id: 'five_inscriptions',
    order: 2,
    title: 'Duvarların Hafızası',
    description: 'Taşlar konuştu. Sen dinledin.',
    category: 'oyuk',
    icon: 'torch',
    requiredForCompletion: true,
  },
  {
    id: 'hidden_cave_symbol',
    order: 3,
    title: 'İkisine de İnanma',
    description: 'Saklanan bir iz daha buldun.',
    category: 'oyuk',
    icon: 'cave',
    requiredForCompletion: true,
  },

  // ── 4–5: NOTES AND MUSIC (Frekans ve Kalem) ──
  {
    id: 'first_note',
    order: 4,
    title: 'Bir İz Bıraktın',
    description: 'Artık burada senden bir şey var.',
    category: 'echoes',
    icon: 'quill',
    requiredForCompletion: true,
  },
  {
    id: 'music_rejected',
    order: 5,
    title: 'Burada Demokrasi Yok',
    description: 'DJ seni reddetti. Şaşırdık mı?',
    category: 'echoes',
    icon: 'music',
    requiredForCompletion: true,
  },

  // ── 6–8: THE UNIVERSE (Boşluk) ──
  {
    id: 'all_domains',
    order: 6,
    title: 'Üç Yüzlü Boşluk',
    description: 'Boşluğun üç yüzünü de gördün.',
    category: 'universe',
    icon: 'cosmos',
    requiredForCompletion: true,
  },
  {
    id: 'world_flip',
    order: 7,
    title: 'Dünya Tersine Döndü',
    description: 'Bazı şeylere fazla tıklamamak gerekiyordu.',
    category: 'universe',
    icon: 'cosmos',
    requiredForCompletion: true,
  },
  {
    id: 'sudo_discovered',
    order: 8,
    title: 'Yetkisiz Bilgelik',
    description: 'Sisteme hükmettiğini sandın.',
    category: 'universe',
    icon: 'terminal',
    requiredForCompletion: true,
  },

  // ── 9: RESPECT (Saygı) ──
  {
    id: 'wreath_offered',
    order: 9,
    title: 'Bir Çelenk',
    description: 'Bir iz de saygıyla bırakılır.',
    category: 'respect',
    icon: 'wreath',
    requiredForCompletion: true,
  },

  // ── 10: CUSTOM 404 DISCOVERY (Saklı Olanlar) ──
  {
    id: 'not_found_discovered',
    order: 10,
    title: 'Yanlış Kapı',
    description: 'Yanlış yere geldin. Belki de gelmen gereken yer burasıydı.',
    category: 'hidden',
    icon: 'door',
    requiredForCompletion: true,
  },

  // ── FINAL META-ACHIEVEMENT — GOLDEN TROPHY (§8) ──
  {
    id: 'golden_trophy',
    order: 11,
    title: 'Hiçliğin Kralı',
    description: 'Bütün izleri buldun. Artık hiçlik seni tanıyor.',
    category: 'trophy',
    icon: 'trophy',
    requiredForCompletion: false,
  },
] as const;

export const ACHIEVEMENT_CATEGORIES: ReadonlyArray<{
  key: Exclude<AchievementCategory, 'trophy'>;
  label: string;
  subtitle: string;
}> = [
  {
    key: 'oyuk',
    label: 'Derinlik',
    subtitle: 'Bir dilencinin peşinden inilen mağarada fenerle aydınlanan sırlar.',
  },
  {
    key: 'echoes',
    label: 'Frekans ve Kalem',
    subtitle: 'Bırakılan gerçek izler ve reddedilen şarkılar.',
  },
  {
    key: 'universe',
    label: 'Boşluk',
    subtitle: 'Üç alan genişletmesi, ters dönen dünya ve sistemin çatlakları.',
  },
  {
    key: 'hidden',
    label: 'Saklı Olanlar',
    subtitle: 'Yanlış kapıların ardında çöken gerçeklik.',
  },
  {
    key: 'respect',
    label: 'Saygı',
    subtitle: 'Sözün bittiği yerde sessizce bırakılan iz.',
  },
];

export const ALL_ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] =
  ACHIEVEMENT_DEFINITIONS;

export const ACHIEVEMENT_MAP: Record<AchievementId, AchievementDefinition> =
  ACHIEVEMENT_DEFINITIONS.reduce(
    (acc, def) => {
      acc[def.id] = def;
      return acc;
    },
    {} as Record<AchievementId, AchievementDefinition>,
  );

export const ACHIEVEMENT_DEFINITIONS_MAP: ReadonlyMap<
  AchievementId,
  AchievementDefinition
> = new Map(ACHIEVEMENT_DEFINITIONS.map((def) => [def.id, def]));

export const REQUIRED_ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] =
  ACHIEVEMENT_DEFINITIONS.filter((def) => def.requiredForCompletion);

export const REQUIRED_ACHIEVEMENT_IDS: readonly AchievementId[] =
  REQUIRED_ACHIEVEMENT_DEFINITIONS.map((def) => def.id);

export const TOTAL_REQUIRED_ACHIEVEMENTS: number =
  REQUIRED_ACHIEVEMENT_DEFINITIONS.length;

export const GOLDEN_TROPHY_DEFINITION: AchievementDefinition =
  ACHIEVEMENT_MAP.golden_trophy;

export function isValidAchievementId(id: unknown): id is AchievementId {
  return typeof id === 'string' && Object.prototype.hasOwnProperty.call(ACHIEVEMENT_MAP, id);
}
