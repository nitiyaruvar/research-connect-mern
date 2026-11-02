function ResearcherCard({ researcher, onConnect }) {
  const initials = researcher.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <article className="researcher-card">
      <div className="researcher-top">
        <div className="avatar" aria-hidden="true">{initials}</div>
        <div>
          <h3 className="researcher-name">{researcher.name}</h3>
          <p className="researcher-role">{researcher.role}</p>
        </div>
      </div>
      <p className="researcher-field">{researcher.department}</p>
      <div className="tag-list" aria-label="Research interests">
        {researcher.interests.map((interest) => <span className="tag" key={interest}>{interest}</span>)}
      </div>
      <div className="card-footer">
        <span className="location">{researcher.institution}</span>
        <button className="connect-link" type="button" onClick={() => onConnect(researcher)}>
          Connect <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  );
}

export default ResearcherCard;
