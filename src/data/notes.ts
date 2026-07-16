export interface Note {
  id: string;
  text: string;
  author: string;
  isAdmin: boolean;
  x: number; // Random positioning %
  y: number; // Random positioning %
  rotation: number;
  date?: string;
  created_at?: string;
}

// Initial placeholder notes for the wall
export const initialNotes: Note[] = [
  {
    id: "admin_1",
    text: "Burası benim dijital not defterim. İstediğin gibi dolaş, bir şeyler karala. Sadece ortamı çok dağıtma yeter.",
    author: "Yiğit",
    isAdmin: true,
    x: 45,
    y: 30,
    rotation: -2,
    date: "10/06/2026"
  },
  {
    id: "visitor_1",
    text: "Sitenin atmosferi çok iyi, cidden karanlık bir gecede not defteri okuyormuş gibi hissettiriyor.",
    author: "Anonim Gezgin",
    isAdmin: false,
    x: 20,
    y: 50,
    rotation: 3,
    date: "12/06/2026"
  },
  {
    id: "visitor_2",
    text: "Kahve ısmarladım, projelerinde başarılar! :)",
    author: "Frontendci",
    isAdmin: false,
    x: 70,
    y: 40,
    rotation: -4,
    date: "15/06/2026"
  },
  {
    id: "visitor_3",
    text: "Arkadaki yıldızlara tıklayınca ne oluyor cidden?",
    author: "Meraklı",
    isAdmin: false,
    x: 35,
    y: 75,
    rotation: 1,
    date: "20/06/2026"
  },
  {
    id: "quote_1",
    text: "Bütün büyük yanlışlar, gururun eseri olmuştur.",
    author: "Friedrich Nietzsche",
    isAdmin: false,
    x: 0, y: 0, rotation: 0,
    date: "25/06/2026"
  },
  {
    id: "quote_2",
    text: "Eğer karanlıkta daha iyi görüyorsan, aydınlıkta gözlerini kısman normaldir.",
    author: "Anonim",
    isAdmin: false,
    x: 0, y: 0, rotation: 0,
    date: "28/06/2026"
  },
  {
    id: "quote_3",
    text: "Kodlar asla bitmez, sadece terkedilir.",
    author: "Geliştirici Atasözü",
    isAdmin: false,
    x: 0, y: 0, rotation: 0,
    date: "01/07/2026"
  },
  {
    id: "quote_4",
    text: "Varlığını hissetmediğin bir şeyin yokluğu seni üzmez.",
    author: "Marcus Aurelius",
    isAdmin: false,
    x: 0, y: 0, rotation: 0,
    date: "05/07/2026"
  },
  {
    id: "quote_5",
    text: "Uzay boşluğu kadar sessiz bir yer arıyordum, galiba buldum.",
    author: "Gece Kuşu",
    isAdmin: false,
    x: 0, y: 0, rotation: 0,
    date: "10/07/2026"
  }
];
