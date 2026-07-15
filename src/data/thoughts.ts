export interface Thought {
  id: string;
  text: string;
  date: string;
  type: 'idea' | 'philosophy' | 'code' | 'midnight' | 'funny' | 'observation' | 'nonsense';
  rotation: number; // For the scattered visual effect
}

export const thoughts: Thought[] = [
  {
    id: "1",
    text: "Bazen bir hatayı çözmek için sadece bilgisayarı kapatıp uyumak gerekir. Sabah kalktığında kodun kendi kendini düzelttiğini sanırsın, ama aslında düzelen sensindir.",
    date: "Gece yarısı",
    type: "midnight",
    rotation: -2
  },
  {
    id: "2",
    text: "Console.log('buraya girmemeli'); // Girdi.",
    date: "Bir Salı sabahı",
    type: "code",
    rotation: 4
  },
  {
    id: "3",
    text: "İnsanların ürettiği en karmaşık sistem yine insanların kendilerini anlamaması üzerine kurulu.",
    date: "Bilinmiyor",
    type: "philosophy",
    rotation: -1
  },
  {
    id: "4",
    text: "Eğer bir kod bloğu çok temiz görünüyorsa, kesin bir yerlerde bir edge-case patlamaya hazırdır.",
    date: "Dün",
    type: "observation",
    rotation: 3
  }
];
