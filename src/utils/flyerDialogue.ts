/**
 * Dilenci & Bilge diyalog havuzu
 * Kral = ziyaretçi (ekranda görünmez; dördüncü duvar yıkık)
 * ~%15 jab; geri kalan kendi işleri
 */

export const BEGGAR_OWN = [
  'Bakma öyle heykel gibi, tıkla da dükkan açılsın!',
  'Yavaş ol be, rüzgarından şapkamız uçtu!',
  'Kuru tebrikle karın doymuyor aslanım, icraat görsün gözler.',
  'Karakteriz diye havayla mı besleniyoruz?',
  'Burada playlist fantezisi yapma, git kendi evinde dinle!',
  'Camın arkasından izleme öyle sinsi sinsi...',
] as const;

export const BEGGAR_TO_SAGE = [
  'Kral, şuradan cebimize iki kuruş ateşle!',
  'Dayı, karamsar felsefenle rızkımı kesme, git öteye!',
] as const;

export const SAGE_OWN = [
  'Açtın yine o konsolu... Zavallı fani.',
  'Zamanını piksellerin üzerinde harcıyorsun. Yazık.',
  'Sana "kral" dediler diye gerçekten tahtın mı var sandın?',
  'Bıraktığın tüm izler eninde sonunda hiçlikte kaybolacak.',
] as const;

export const SAGE_TO_BEGGAR = [
  'Her şey bir hiçlikten ibarettir...',
  'Ona "kral" deme, o sadece camın arkasında bir gözlemci.',
  'Zaman akıp gidiyor fani...',
  'Bu dilenci, bu alanda bile hâlâ maddiyat peşinde...',
] as const;

export const BEGGAR_REPLY_TO_SAGE: Record<string, string> = {
  [SAGE_TO_BEGGAR[0]]: 'Başlatma hiçliğine! Hiçlikten ekmek çıkıyor mu?',
  [SAGE_TO_BEGGAR[1]]: 'Gözlemci bize kahve ısmarlayacaksa kölesi olurum!',
  [SAGE_TO_BEGGAR[2]]: 'Zaman akıyor da senin çene hiç durmuyor dayı!',
  [SAGE_TO_BEGGAR[3]]: 'Akşama senin felsefe kitaplarını mı kemireceğim?',
};

export const SAGE_REPLY_TO_BEGGAR: Record<string, string> = {
  [BEGGAR_TO_SAGE[0]]: 'Ona "kral" deme, o sadece camın arkasında bir gözlemci.',
  [BEGGAR_TO_SAGE[1]]: 'Asıl rızık zihnin dinginliğidir, cahil fani.',
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
