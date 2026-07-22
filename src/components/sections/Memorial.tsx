import SilentGuardians from '../events/SilentGuardians';
import SEOHead from '../../seo/SEOHead';

/**
 * Complete text of Gençliğe Hitabe (Atatürk, 20 Ekim 1927).
 * Source form aligned with Türk Dil Kurumu publication.
 */
const HITABE_PARAGRAPHS = [
  'Ey Türk gençliği! Birinci vazifen; Türk istiklalini, Türk cumhuriyetini, ilelebet muhafaza ve müdafaa etmektir.',
  'Mevcudiyetinin ve istikbalinin yegâne temeli budur. Bu temel, senin en kıymetli hazinendir. İstikbalde dahi seni bu hazineden mahrum etmek isteyecek dâhilî ve haricî bedhahların olacaktır. Bir gün, istiklal ve cumhuriyeti müdafaa mecburiyetine düşersen, vazifeye atılmak için içinde bulunacağın vaziyetin imkân ve şeraitini düşünmeyeceksin. Bu imkân ve şerait, çok namüsait bir mahiyette tezahür edebilir. İstiklal ve cumhuriyetine kastedecek düşmanlar, bütün dünyada emsali görülmemiş bir galibiyetin mümessili olabilirler. Cebren ve hile ile aziz vatanın bütün kaleleri zapt edilmiş, bütün tersanelerine girilmiş, bütün orduları dağıtılmış ve memleketin her köşesi bilfiil işgal edilmiş olabilir. Bütün bu şeraitten daha elim ve daha vahim olmak üzere, memleketin dâhilinde iktidara sahip olanlar, gaflet ve dalalet ve hatta hıyanet içinde bulunabilirler. Hatta bu iktidar sahipleri, şahsi menfaatlerini müstevlilerin siyasi emelleriyle tevhit edebilirler. Millet, fakruzaruret içinde harap ve bitap düşmüş olabilir.',
  'Ey Türk istikbalinin evladı! İşte, bu ahval ve şerait içinde dahi vazifen, Türk istiklal ve cumhuriyetini kurtarmaktır. Muhtaç olduğun kudret, damarlarındaki asil kanda mevcuttur.',
] as const;

export default function Memorial() {
  return (
    <section
      className="memorial-section projects-section"
      aria-label="Mustafa Kemal Atatürk"
      style={{ padding: '6rem 2rem', minHeight: '100vh', maxWidth: '1000px', margin: '0 auto' }}
    >
      <SEOHead page="memorial" />

      <div className="project-section memorial-project" style={{ position: 'relative' }}>
        <div
          className="project-section__line"
          style={{
            position: 'absolute',
            left: '-2rem',
            top: 0,
            bottom: 0,
            width: '1px',
            background: 'linear-gradient(to bottom, transparent, var(--timeline), transparent)',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                marginBottom: '0.5rem',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-title)',
                fontWeight: 400,
              }}
            >
              Mustafa Kemal Atatürk
            </h1>

            <p
              style={{
                marginBottom: '2rem',
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                fontStyle: 'italic',
              }}
            >
              Bir milletin kaderini değiştiren lider.
            </p>

            <SilentGuardians />

            <h2
              style={{
                fontSize: '1rem',
                color: 'var(--accent-pale-gray)',
                marginBottom: '1.25rem',
                marginTop: '2rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-title)',
                fontWeight: 400,
              }}
            >
              Gençliğe Hitabe
            </h2>

            {HITABE_PARAGRAPHS.map((paragraph) => (
              <p
                key={paragraph.slice(0, 24)}
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  marginBottom: '1.5rem',
                  color: 'var(--text-primary, var(--text-main))',
                  fontFamily: 'var(--font-title)',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div
            className="card-surface memorial-portrait-card"
            style={{
              flex: '1 1 300px',
              minHeight: '360px',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="memorial-portrait-card__light"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse 70% 50% at 50% 20%, rgba(203, 213, 225, 0.12), transparent 60%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
              aria-hidden
            />
            <div
              style={{
                width: '100%',
                height: '100%',
                padding: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <img
                src="/Ataturk1930s.jpg"
                alt="Mustafa Kemal Atatürk"
                width={480}
                height={600}
                decoding="async"
                fetchPriority="high"
                style={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '420px',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: '6px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
