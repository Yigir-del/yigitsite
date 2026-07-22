import type { CSSProperties } from 'react';
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
    <section className="memorial" aria-label="Anıt — Mustafa Kemal Atatürk">
      <SEOHead page="memorial" />

      <div className="memorial__atmosphere" aria-hidden>
        <div className="memorial__rays" />
        <div className="memorial__dust">
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} className="memorial__mote" style={{ '--i': i } as CSSProperties} />
          ))}
        </div>
      </div>

      <div className="memorial__inner">
        <figure className="memorial__portrait">
          <img
            src="/Ataturk1930s.jpg"
            alt="Mustafa Kemal Atatürk"
            width={480}
            height={600}
            decoding="async"
            fetchPriority="high"
          />
        </figure>

        <h1 className="memorial__title">Mustafa Kemal Atatürk</h1>

        <article className="memorial__hitabe" aria-label="Gençliğe Hitabe">
          <h2 className="visually-hidden">Gençliğe Hitabe</h2>
          {HITABE_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </article>
      </div>
    </section>
  );
}
