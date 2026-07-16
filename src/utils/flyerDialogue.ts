/**
 * Dilenci & Bilge diyalog havuzu
 * Kral = ziyaretçi (ekranda görünmez; dördüncü duvar yıkık)
 * ~%15 jab; geri kalan kendi işleri
 */

/** Dilenci — kendi sözleri (kralla konuşur) */
export const BEGGAR_OWN = [
  'Bakıyor öyle heykel gibi... Telefonunun ekran süresi mi bitti kral? Şuraya iki tıklat da dükkanın önü açılsın.',
  'Yavaş ol be, rüzgarından şapkamız uçtu! Burası otoban mı? Madem o kadar hızlısın, sadakamızı da jet hızıyla fırlat!',
  "Bilgisayar mühendisi olmuşsun ama bize bi' çay ısmarlayacak vizyonun yok. Hani nerede o yeşil paralar?",
  "MURYOKUSHO falan yazmışsın da, buranın esnafı biziz aslanım. Domain ücretini ödemekle kral olunmuyor.",
  'Not bırakmaya kalemin var ama fakire fukaraya bütçen mi yok? Hadi oradan klavye delikanlısı.',
  'Bize mi öyle yukarıdan bakıyorsun? Sen yokken de bu yıldızlar buradaydı, sen gidince de burada olacak.',
  "Kral, localhost'tan 3-5 port ateşle be, canımız sıkıldı.",
  'Bize de mi CSS öğreteceksin dayı, at şuradan iki satır kod da yolumuzu bulalım.',
] as const;

/** Dilenci → bilge (nadiren) */
export const BEGGAR_TO_SAGE = [
  "Kral, localhost'tan 3-5 port ateşle be!",
] as const;

/** Bilge — kendi sözleri (faniye / krala) */
export const SAGE_OWN = [
  "Açtın yine o konsolu... Gerçekliği F12 ile manipüle edebileceğini sanan zavallı bir fani daha.",
  'Zamanını bu ekrana akıtıyorsun. Zaman akıp gidiyor, sen ise hâlâ bir pikseller bütününün üzerinde kayboluyorsun. Yazık.',
  "Sana 'kral' dediler diye gerçekten tahtın olduğunu mu sandın? Sen sadece bu sitenin geçici bir misafirisin.",
  'CSS biliyormuş gibi yapıyorsun ya... Aslında yaşamayı da biliyormuş gibi yapıyorsun. Seni görüyorum.',
  'Bana bakma, ben senin o sığ dünyandaki hiçbir algoritmayla açıklanamam.',
  'Aşağıda iz bırakmaya çalışıyorsun ama bıraktığın her iz eninde sonunda bu veritabanının hiçliğinde kaybolacak.',
] as const;

/** Bilge → dilenci (nadiren) */
export const SAGE_TO_BEGGAR = [
  'Her şey bir hiçlikten ibarettir...',
  "Ona 'kral' diyerek kendi köleliğini tescilliyorsun. O sadece camın arkasındaki bir gözlemci.",
  'Zaman akıp gidiyor fani...',
] as const;

/** Bilge dilenciye X derse → dilenci buna cevaplar */
export const BEGGAR_REPLY_TO_SAGE: Record<string, string> = {
  [SAGE_TO_BEGGAR[0]]:
    'Başlatma hiçliğine be dayı! Hiçlikten iki ekmek çıkıyor mu? Konuşma boş boş, asabımı bozma!',
  [SAGE_TO_BEGGAR[1]]:
    'Gözlemci gözlemci... Gözlemci bize bir kahve ısmarlayacaksa ben kölesi de olurum, sana ne?!',
  [SAGE_TO_BEGGAR[2]]:
    'Zaman akıyor da dayı, senin çene de hiç durmuyor be! Kafa kalmadı yeminle.',
};

/** Dilenci bilgeye X derse → bilge buna cevaplar */
export const SAGE_REPLY_TO_BEGGAR: Record<string, string> = {
  [BEGGAR_TO_SAGE[0]]:
    "Ona 'kral' diyerek kendi köleliğini tescilliyorsun. O sadece camın arkasındaki bir gözlemci.",
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
