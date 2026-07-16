/** Dilenci — kendi işi (krala / dilenme) */
export const BEGGAR_OWN = [
  'Kral, biraz bağış?',
  'Hey kral, cebin dolu mu?',
  'Bir kuruşluk merhamet, kralım!',
  'Kral bak buraya! Görmezden gelme.',
  'Tahtın güzel, cüzdanın da öyle midir?',
  'Kral, bugün lütuf günü mü?',
  'Dilenciyim ama gururum var… azıcık.',
  'Kral! Kral! Bakıyorum sana!',
  'Bir kahve parası, ey yüce kral.',
  'Sen kral, ben dilenci — sen ver, ben alırım.',
] as const;

/** Dilenci → bilge (nadiren) */
export const BEGGAR_TO_SAGE = [
  'Bilge, öğüdün bedava mı? Ben de bedavayım.',
  'Sus bilge, açken felsefe dinlenmez.',
  'Sakalın uzun, öğüdün boş.',
  'Öğüt yerine bir kuruş versene, bilge.',
  'Bilge kapat çeneni, krala bakıyorum.',
] as const;

/** Bilge — özlü sözler (kendi işi) */
export const SAGE_OWN = [
  'Sabrın sonu selamettir.',
  'Az konuş, çok dinle.',
  'Her karanlık gecenin bir sabahı vardır.',
  'Bilgi güçtür; bilgelik dengedir.',
  'Yavaş git, uzağa var.',
  'Kendi aynana bakmadan dünyayı yargılama.',
  'Sessizlik bazen en yüksek sesdir.',
  'Düşmeyen yükselmez.',
  'Gönül ne isterse yol oradan geçer.',
  'Bugünün işini yarına bırakma.',
] as const;

/** Bilge → dilenci (nadiren, laf sokarak öğüt) */
export const SAGE_TO_BEGGAR = [
  'Dilenci, açlık zihin açar — seninki hâlâ kapalı.',
  'Ey dilenci: önce kendini doyur, sonra kralı yargıla.',
  'Teneke kutu dolmazsa, dil de dinlensin.',
  'Bağış almak için yüzünü düzelt; o kaşlar korkutuyor.',
  'Merhamet dilenirsin; nezaket unutulmuş.',
] as const;

/** Bilge dilenciye X derse → dilenci buna cevaplar */
export const BEGGAR_REPLY_TO_SAGE: Record<string, string> = {
  [SAGE_TO_BEGGAR[0]]: 'Zihin açılmış da ne olmuş? Mide hâlâ boş, bilge.',
  [SAGE_TO_BEGGAR[1]]: 'Karnım doysun, kralı sonra yargılarım — sıra sende mi?',
  [SAGE_TO_BEGGAR[2]]: 'Dil dinlensin diyorsun; seninki hiç susmuyor.',
  [SAGE_TO_BEGGAR[3]]: 'Kaşlarım benim markam. Sen sakalınla ilgilen.',
  [SAGE_TO_BEGGAR[4]]: 'Nezaket karnı doyurmuyor — denedim, bilge.',
};

/** Dilenci bilgeye X derse → bilge buna cevaplar */
export const SAGE_REPLY_TO_BEGGAR: Record<string, string> = {
  [BEGGAR_TO_SAGE[0]]: 'Bedava öğüt değerli olur; seninki gürültü.',
  [BEGGAR_TO_SAGE[1]]: 'Açken dinlemeyen, tokken de dinlemez.',
  [BEGGAR_TO_SAGE[2]]: 'Sakal bilgelik taşımaz; boş laf da taşır — seninki gibi.',
  [BEGGAR_TO_SAGE[3]]: 'Kuruş veririm… ama önce teşekkür öğren.',
  [BEGGAR_TO_SAGE[4]]: 'Krala bak, tamam. Ama ayna da orada.',
};

export const FLYER_SPEAK = 'flyer-speak';

export type FlyerSpeakDetail = {
  from: 'sage' | 'beggar';
  kind: 'own' | 'jab';
  line: string;
};

export function pickRandom<T extends readonly string[]>(list: T): T[number] {
  return list[Math.floor(Math.random() * list.length)];
}

/** ~15% chance to jab the other; otherwise own business */
export function shouldJab(chance = 0.15): boolean {
  return Math.random() < chance;
}
