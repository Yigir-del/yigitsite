export interface Project {
  id: string;
  title: string;
  role: string;
  description: string;
  technologies: string[];
  timeline: string;
  lessonsLearned: string;
  link: string;
  images: string[];
}

export const projects: Project[] = [
  {
    id: "sinavizcisi",
    title: "Sınavizcisi.com",
    role: "Kurucu Ortak",
    description: "Her şey tek bir soruyla başladı:\n\"Neden bunun için beş farklı site dolaşıyorum?\"\n\nÜniversite taban puanları bir yerde, lise verileri başka yerde, öğrenci yorumları bambaşka bir köşedeydi. Hepsini tek bir yerde toplamaya karar verdik. Sonra olay büyüdü. Her yeni özellik, peşinden başka bir soruyu sürükledi.\n\nHiç bilmediğimiz teknolojilerle boğuşurken, ortağımla günlerce tek bir problemi çözmeye çalıştığımız oldu. Amacımız sadece yeni bir site yapmak değildi; insanların saatlerce sekmeler arasında kaybolmayacağı bir yer inşa etmekti.\n\nİnternette aslında her şey vardı, sadece aynı yerde değillerdi.",
    technologies: ["Python", "Django", "PostgreSQL", "JavaScript", "HTML/CSS", "Gunicorn", "WhiteNoise", "psycopg2", "python-decouple", "Django Silk"],
    timeline: "Ağustos 2023 - Günümüz",
    lessonsLearned: "Bazen en zor şey kod yazmak değil, neyi yazmaman gerektiğine karar vermektir. Bir vizyonu başkalarıyla paylaşmak ve onu hayatta tutmak, en az mimari kurmak kadar karmaşıktır.",
    link: "https://sinavizcisi.com",
    images: ["https://sinavizcisi.com/static/images/icon_son.png"]
  },
  {
    id: "chatstats",
    title: "ChatStats: Sohbet Analiz",
    role: "Kurucu",
    description: "Bugüne kadar yaparken en çok keyif aldığım şey buydu.\n\nİnsanlarla konuşmayı hep sevdim ama onları anlamaya çalışmayı daha çok. \"Kim neden geç cevap veriyor? Bir sohbet gerçekten dengeli mi?\" Bu saf merak, zamanla koda dönüştü. Bunu kimseyi memnun etmek için yapmadım, önce kendimi ikna etmeliydim.\n\nPazardaki analiz uygulamalarını denedikçe hep \"Keşke şunu da gösterse\" diyordum. Sonunda kendim yazmaya başladım. Cevap süreleri, saatlik aktiviteler, duygu analizi... Bazıları çalıştı, bazıları istediğim gibi olmadı ama hepsini denedim.\n\nBelki bir gün birisi daha iyisini yapar ama o zamana kadar, en azından benim gözümde, çıta bu.",
    technologies: ["React Native", "Expo", "Zustand", "Lottie", "Chart Kit", "React Navigation", "AsyncStorage", "jsPDF & Print", "Paper UI", "File System"],
    timeline: "Ocak 2024 - Günümüz",
    lessonsLearned: "Veriler sadece sayılardan ibaret değildir. Eğer doğru soruyu sorarsan, her satır log dosyası sana insanların karakterleri hakkında bir hikaye anlatabilir.",
    link: "https://play.google.com/store/apps/details?id=com.whatsapp.chatanalyzer",
    images: ["https://play-lh.googleusercontent.com/1uUuIsQ3Dc92ScuLu_mx5JgyYHATcYcG6Bwdq4D4NGmkGZG924vAazfjJ9EReyrxEsacdxwwq3s8LbVrvBD9UA"]
  },
  {
    id: "tubitak2209",
    title: "TÜBİTAK 2209-A",
    role: "Proje Yürütücüsü / Geliştirici",
    description: "Sınavİzcisi üzerinde çalışırken aklımı kurcalayan başka bir soru vardı:\nÖğrenciler sadece bugünü değil, yarın nerede olacaklarını da merak ediyor.\n\nYKS döneminde herkesin aklındaki o \"Acaba kaç bine girerim?\" sorusuna kimsenin kesin bir cevabı yoktu. Biz de üç arkadaş oturduk ve düşündük; belki geleceği söyleyemeyiz ama belirsizliği biraz azaltabiliriz.\n\nBu fikirle bir TÜBİTAK projesine başladık. Amacımız sadece düz bir sıralama tahmini yapmak değil; öğrencinin bugünkü performansına bakıp olası senaryoları çizen, benzeşen öğrencilerden ders çıkaran ve \"biraz yavaşladın\" diyebilen dijital bir yol arkadaşı yapmaktı.\n\nHiçbir algoritma geleceği garanti etmez ama bazen insanın ihtiyacı kesin bir cevap değil, sadece yanında yürüyen bir şeydir.",
    technologies: ["React", "Vite", "Recharts", "Playwright", "Python", "Pandas", "NumPy", "Scikit-learn", "SciPy", "XGBoost", "SHAP", "Matplotlib", "Joblib", "Narwhals"],
    timeline: "Yakında Başlıyor",
    lessonsLearned: "Geleceği tahmin etmek imkansızdır, ancak belirsizliği modellemek insana umut verir. İnsanların psikolojisini anlayan algoritmalar tasarlamak her zaman en zoru.",
    link: "#",
    images: ["https://avatars.githubusercontent.com/u/15082103?v=4"]
  }
];
