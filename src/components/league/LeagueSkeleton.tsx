export default function LeagueSkeleton() {
  return (
    <div aria-busy="true" aria-label="Yükleniyor">
      <div className="league-skeleton" style={{ height: 140, marginBottom: '1.5rem' }} />
      <div className="league-skeleton" style={{ height: 72, marginBottom: '1.5rem' }} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '0.85rem',
          marginBottom: '2rem',
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="league-skeleton" style={{ height: 120 }} />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="league-skeleton"
          style={{ height: 72, marginBottom: '0.65rem' }}
        />
      ))}
    </div>
  );
}
