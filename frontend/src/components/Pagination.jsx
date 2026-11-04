function Pagination({ label, page, pages, onChange }) {
  if (pages < 2) return null;
  return <nav className="pagination" aria-label={`${label} pages`}>
    <button type="button" className="button button-outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
    <span aria-live="polite">Page <strong>{page}</strong> of {pages}</span>
    <button type="button" className="button button-outline" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
  </nav>;
}

export default Pagination;
