function ResearcherCard({ name, field }) {
  return (
    <article className="researcher-card">
      <h3>{name}</h3>
      <p>{field}</p>
    </article>
  );
}

export default ResearcherCard;