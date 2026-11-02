function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <div className="project-topline"><span className="project-status">{project.status}</span><span className="project-year">{project.year}</span></div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="tag-list">{project.areas.map((area) => <span className="tag" key={area}>{area}</span>)}</div>
      <div className="project-owner">Led by <strong>{project.lead}</strong></div>
    </article>
  );
}

export default ProjectCard;
