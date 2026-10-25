export function Skeleton() {
  return (
    <div
      className="product-grid"
      aria-label="Loading listings"
      aria-busy="true"
    >
      {[1, 2, 3, 4].map((i) => (
        <div className="skeleton-card" key={i}>
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
