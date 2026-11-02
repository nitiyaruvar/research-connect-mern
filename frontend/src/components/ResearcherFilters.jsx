function ResearcherFilters({ filters, onChange, onReset }) {
  return (
    <aside className="filter-panel" aria-label="Researcher filters">
      <h3 className="filter-title">Refine discovery <button className="filter-reset" onClick={onReset} type="button">Reset</button></h3>
      <label className="filter-label" htmlFor="department">Department</label>
      <select className="filter-field" id="department" value={filters.department} onChange={(event) => onChange("department", event.target.value)}>
        <option value="">All departments</option>
        <option>Computer Science</option>
        <option>Life Sciences</option>
        <option>Engineering</option>
        <option>Social Sciences</option>
        <option>Public Health</option>
      </select>
      <label className="filter-label" htmlFor="expertise">Research area</label>
      <select className="filter-field" id="expertise" value={filters.expertise} onChange={(event) => onChange("expertise", event.target.value)}>
        <option value="">Any research area</option>
        <option>Artificial intelligence</option>
        <option>Climate science</option>
        <option>Data science</option>
        <option>Public health</option>
        <option>Robotics</option>
      </select>
      <label className="filter-check"><input type="checkbox" checked={filters.openToCollaboration} onChange={(event) => onChange("openToCollaboration", event.target.checked)} /> Open to collaboration</label>
    </aside>
  );
}

export default ResearcherFilters;
