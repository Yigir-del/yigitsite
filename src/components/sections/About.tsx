import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      gsap.fromTo(textRef.current.children, 
        { y: 50, opacity: 0 },
        { 
          y: 0, opacity: 1, stagger: 0.2, duration: 1,
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 80%',
          }
        }
      );
    }
  }, []);

  return (
    <section className="about-section" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem'
    }}>
      <div ref={textRef} style={{ maxWidth: '800px', position: 'relative', lineHeight: '1.8', width: '100%' }}>
        <h2 className="glitch" data-text="Hakkımda" style={{ marginBottom: '3rem', fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', color: 'var(--text-main)' }}>
          Hakkımda
        </h2>
        
        <p style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Çocukken oyuncakların içindeki çarkları söküp nasıl çalıştığını anlayan o klasik mühendis ruhlu çocuklardan değildim. Ben makinelerin değil, insanların mekaniğini merak eden taraftaydım. İnsanların neden aynı şeye bakıp bambaşka kararlar verdiğini, davranışlarının altındaki o görünmez kodları anlamaya çalışırdım.
        </p>
        
        <p style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Yazılım benim için hiçbir zaman sadece kod yazmak olmadı. Kod, hayatta merak ettiğim karmaşık sorulara cevap aramanın en güçlü yolu oldu.
        </p>
        
        <p style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Bir sohbetten anlam çıkarmak... <br />
          Bir öğrencinin geleceğine dair ince ipuçları aramak... <br />
          Binlerce verinin içinde kimsenin fark etmediği o görünmez desenleri yakalamak...
        </p>
        
        <p style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Galiba hayatta en sevdiğim şey bu. İnsanların bıraktığı küçük izlerden büyük hikâyeler çıkarmaya çalışmak. İnsanlara bakınca sadece bir dış görünüş veya veri değil; onların içlerini, hislerini görmeye çalışırım. Kendimi hep teknik olduğum kadar duygusal alanda da geliştirmeye odaklandım.
        </p>

        <p style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Benim gözümde olay hiçbir zaman sadece çalışmak ya da iş yapmak olmadı; olay insan kazanmak, insanı öğrenmekti. İnsanların birbirine çok benzer paternlere sahip olduğunu düşünüyorum. Aslında kimse sandığı kadar farklı değil.
        </p>

        <p style={{ fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', marginBottom: '2.5rem', color: 'var(--text-primary)' }}>
          Eğer bir gün yaptığım bütün projeleri ve yazdığım satırlarca kodu tek bir cümlede özetlemem gerekirse, muhtemelen şunu söylerdim:
        </p>

        <blockquote style={{ 
          fontSize: 'clamp(1.15rem, 4vw, 1.5rem)', 
          fontStyle: 'italic', 
          borderLeft: '4px solid var(--accent-pale-gray)', 
          paddingLeft: '1.5rem', 
          margin: '0 0 3rem 0',
          color: 'var(--text-main)',
          fontWeight: 'bold'
        }}>
          "İnsanların bıraktığı verileri değil, o verilerin anlattığı hikâyeleri merak ediyorum."
        </blockquote>

        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Ondokuz Mayıs Üniversitesi</span>
            <span style={{ color: 'var(--text-muted)' }}>Bilgisayar Mühendisliği (4. Sınıf)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <span>📍</span> Samsun, Türkiye
          </div>
        </div>

        <div className="handwriting about-aside-note" style={{ position: 'absolute', right: '-150px', top: '150px', opacity: 0.5, transform: 'rotate(15deg)' }}>
          bence de çok güzel bitirebiliriz...
        </div>
      </div>
    </section>
  );
}
