function ProjectCard({ project, onRecommend }) {
  return (
    <article className="project-card">
      <div className="project-topline"><span className="project-status">{project.status}</span><span className="project-year">{project.year}</span></div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <div className="tag-list">{project.areas.map((area) => <span className="tag" key={area}>{area}</span>)}</div>
      <div className="project-owner">Led by <strong>{project.lead}</strong></div>
      {onRecommend && /^[a-f\d]{24}$/i.test(project.id) && <button className="project-action" type="button" onClick={() => onRecommend(project)}>Find collaborators <span aria-hidden="true">↗</span></button>}
    </article>
  );
}

export default ProjectCard;
