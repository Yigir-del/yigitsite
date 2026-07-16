/**
 * Dilenci & Bilge diyalog havuzu
 * Kral = ziyaretçi (ekranda görünmez; dördüncü duvar yıkık)
 * ~%15 jab; geri kalan kendi işleri
 */

/** Dilenci — arsız, racon kesen, kaybedecek şeyi yok */
export const BEGGAR_OWN = [
  // Kullanıcı metinleri
  'Bakıyor öyle heykel gibi... Telefonunun ekran süresi mi bitti kral? Şuraya iki tıklat da dükkanın önü açılsın.',
  'Yavaş ol be, rüzgarından şapkamız uçtu! Burası otoban mı? Madem o kadar hızlısın, sadakamızı da jet hızıyla fırlat!',
  "Bilgisayar mühendisi olmuşsun ama bize bi' çay ısmarlayacak vizyonun yok. Hani nerede o yeşil paralar?",
  "MURYOKUSHO falan yazmışsın da, buranın esnafı biziz aslanım. Domain ücretini ödemekle kral olunmuyor.",
  'Not bırakmaya kalemin var ama fakire fukaraya bütçen mi yok? Hadi oradan klavye delikanlısı.',
  'Bize mi öyle yukarıdan bakıyorsun? Sen yokken de bu yıldızlar buradaydı, sen gidince de burada olacak.',
  "Kral, localhost'tan 3-5 port ateşle be, canımız sıkıldı.",
  'Bize de mi CSS öğreteceksin dayı, at şuradan iki satır kod da yolumuzu bulalım.',
  // Ek — aynı ton
  'Kral bak, scroll’un parasını da mı biz ödeyeceğiz? Dur bir nefes al, cebine bak.',
  'Portfolio mu bu, yoksa bizi aç bırakma simülasyonu mu? Net söyle.',
  'Ey kral: F5 atıp kaçma. Sadaka F5’le gelmez, tıklamayla gelir.',
  'Cursor’un titriyor — ya korkuyorsun ya cüzdanın ağır. İkisinden biri bize yarasın.',
  'Stüdyoma foto koyuyorsun da, dilenciye bir JPEG bile yok. Racon bu mu?',
  'Sen “iz bırak” diyorsun; ben “iz bırak, parayı da bırak” diyorum. Net.',
] as const;

/** Dilenci → bilge (nadiren, atarlı) */
export const BEGGAR_TO_SAGE = [
  "Kral, localhost'tan 3-5 port ateşle be!",
  'Başlatma hiçliğine be dayı! Hiçlikten iki ekmek çıkıyor mu?',
  'Sus bilge, açken felsefe dinlenmez — karnım gürültü yapıyor.',
  'Sakalın Wi‑Fi gibi: herkese açık, kimseye yaramıyor.',
  'Öğüt yerine bir kuruş versene bilge; PDF’in tok tutmuyor.',
  'Bilge kapat çeneni, krala bakıyorum — o varlıklı görünüyor.',
] as const;

/** Bilge — kibirli, pasif-agresif, fani ziyaretçiye üstten */
export const SAGE_OWN = [
  // Kullanıcı metinleri
  "Açtın yine o konsolu... Gerçekliği F12 ile manipüle edebileceğini sanan zavallı bir fani daha.",
  'Zamanını bu ekrana akıtıyorsun. Zaman akıp gidiyor, sen ise hâlâ bir pikseller bütününün üzerinde kayboluyorsun. Yazık.',
  "Sana 'kral' dediler diye gerçekten tahtın olduğunu mu sandın? Sen sadece bu sitenin geçici bir misafirisin.",
  'CSS biliyormuş gibi yapıyorsun ya... Aslında yaşamayı da biliyormuş gibi yapıyorsun. Seni görüyorum.',
  'Bana bakma, ben senin o sığ dünyandaki hiçbir algoritmayla açıklanamam.',
  'Aşağıda iz bırakmaya çalışıyorsun ama bıraktığın her iz eninde sonunda bu veritabanının hiçliğinde kaybolacak.',
  // Ek — aynı ton
  'Her şey bir hiçlikten ibarettir... Sen de, scroll’un da, o “önemli” işlerin de.',
  'Zaman akıp gidiyor fani... Sen hâlâ bir butona tıklayıp anlam sanıyorsun.',
  'Faniler sadece ekranı kaydırır. Bilgeler ise kaydırmadan görür. Tahmin et hangisisin.',
  'Dark mode’un ruhunu karartmaz; zaten karanlıktın. Ben sadece ışığı kapattım.',
  'Responsive’sin sandın — aslında her ekrana uyum sağlayan bir kaçışın var.',
  'MURYOKUSHO bir alan değil; senin dikkatinin mezarı. Hoş geldin.',
  'Commit atıyorsun hayata. Diff’in boş. Merge conflict: sen vs. gerçeğin.',
] as const;

/** Bilge → dilenci (nadiren, laf sokarak “öğüt”) */
export const SAGE_TO_BEGGAR = [
  'Her şey bir hiçlikten ibarettir...',
  'Zaman akıp gidiyor fani... Sen de o gürültüyle birlikte.',
  "Ona 'kral' diyerek kendi köleliğini tescilliyorsun. O sadece camın arkasındaki bir gözlemci.",
  'Dilenci, açlık zihin açar — seninki hâlâ 404.',
  'Teneke kutu dolmazsa dil dinlensin; felsefe karnı doyurmaz, susmak da doyurmaz — ama susmak daha ucuz.',
  'Bağış dilersin, racon kesersin… Algoritman bozuk: input yok, output gürültü.',
] as const;

/** Bilge dilenciye X derse → dilenci buna cevaplar */
export const BEGGAR_REPLY_TO_SAGE: Record<string, string> = {
  [SAGE_TO_BEGGAR[0]]:
    'Başlatma hiçliğine be dayı! Hiçlikten iki ekmek çıkıyor mu? Konuşma boş boş, asabımı bozma!',
  [SAGE_TO_BEGGAR[1]]: 'Zaman akıyor da dayı, senin çene de hiç durmuyor be! Kafa kalmadı yeminle.',
  [SAGE_TO_BEGGAR[2]]:
    'Gözlemci gözlemci... Gözlemci bize bir kahve ısmarlayacaksa ben kölesi de olurum, sana ne?!',
  [SAGE_TO_BEGGAR[3]]: '404’müşüm — bari error page’e reklam koy, para çıksın.',
  [SAGE_TO_BEGGAR[4]]: 'Ucuz olan senin öğüdün bilge. Benim açlığım premium.',
  [SAGE_TO_BEGGAR[5]]: 'Input yok diyorsun — kralın cüzdanı input, benim elım output. Pipeline kur dayı.',
};

/** Dilenci bilgeye X derse → bilge buna cevaplar */
export const SAGE_REPLY_TO_BEGGAR: Record<string, string> = {
  [BEGGAR_TO_SAGE[0]]:
    "Ona 'kral' diyerek kendi köleliğini tescilliyorsun. O sadece camın arkasındaki bir gözlemci.",
  [BEGGAR_TO_SAGE[1]]: 'Hiçlik ekmek vermez; sen de vermezsin — farkındalık ise pahalıdır, ödeyemezsin.',
  [BEGGAR_TO_SAGE[2]]: 'Açken dinlemeyen, tokken de dinlemez. Senin protokolün bozulmuş.',
  [BEGGAR_TO_SAGE[3]]: 'Wi‑Fi şifresiz olur; bilgelik olmaz. Sen sinyal arıyorsun, ben kuleyim.',
  [BEGGAR_TO_SAGE[4]]: 'Kuruş veririm… ama önce “teşekkür” string’ini parse etmeyi öğren.',
  [BEGGAR_TO_SAGE[5]]: 'Krala bak, tamam. Ama ayna da orada — ikisi de seni yargılamıyor, umursamıyor.',
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
