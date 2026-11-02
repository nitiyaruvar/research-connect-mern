import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ResearcherCard from "../components/ResearcherCard";
import ResearcherFilters from "../components/ResearcherFilters";

const demoResearchers = [
  { id: "r1", name: "Aisha Rao", role: "Associate Professor", department: "Computer Science", institution: "Northbridge University", interests: ["Artificial intelligence", "Climate science"], openToCollaboration: true },
  { id: "r2", name: "Daniel Kim", role: "Research Fellow", department: "Life Sciences", institution: "Northbridge University", interests: ["Data science", "Public health"], openToCollaboration: true },
  { id: "r3", name: "Maya Thompson", role: "Assistant Professor", department: "Engineering", institution: "Northbridge University", interests: ["Robotics", "Artificial intelligence"], openToCollaboration: false },
  { id: "r4", name: "Omar Patel", role: "Doctoral Researcher", department: "Social Sciences", institution: "Northbridge University", interests: ["Public health", "Data science"], openToCollaboration: true },
];

const demoProjects = [
  { id: "p1", title: "Mapping urban heat resilience", summary: "Combining satellite data and community research to understand heat risk across neighborhoods.", status: "Seeking collaborators", year: "2025–26", lead: "Aisha Rao", areas: ["Climate science", "Data science"] },
  { id: "p2", title: "Accessible robotics for care", summary: "A cross-disciplinary study of assistive robotics and inclusive design in community care.", status: "Active project", year: "2025–27", lead: "Maya Thompson", areas: ["Robotics", "Public health"] },
];

const initialFilters = { department: "", expertise: "", openToCollaboration: false };

function Home() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [notice, setNotice] = useState("");
  const researchers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return demoResearchers.filter((researcher) => {
      const text = [researcher.name, researcher.role, researcher.department, researcher.institution, ...researcher.interests].join(" ").toLowerCase();
      return (!search || text.includes(search))
        && (!filters.department || researcher.department === filters.department)
        && (!filters.expertise || researcher.interests.includes(filters.expertise))
        && (!filters.openToCollaboration || researcher.openToCollaboration);
    });
  }, [filters, query]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function showConnectNotice(researcher) {
    setNotice(`Sign in to send a collaboration request to ${researcher.name}.`);
    window.setTimeout(() => setNotice(""), 3800);
  }

  return (
    <div id="top" className="site-shell">
      <Navbar />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <span className="eyebrow"><span className="eyebrow-dot" /> A brighter way to do research</span>
          <h1 id="hero-title">Great research starts with a connection.</h1>
          <p>Find people working on the questions that matter to you. Share what you are building. Make your next collaboration happen.</p>
          <form className="hero-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <input aria-label="Search researchers and topics" placeholder="Try a topic, name, or department" value={query} onChange={(event) => setQuery(event.target.value)} />
            <button className="search-button" type="submit">Find researchers <span aria-hidden="true">→</span></button>
          </form>
        </section>

        <section id="discover" className="page-content" aria-labelledby="discover-title">
          <div className="section-heading">
            <div><h2 id="discover-title">Meet your next collaborator</h2><p>Discover the people behind ideas across your institution.</p></div>
            <button className="button button-outline" type="button" onClick={() => setNotice("Create a profile to appear in researcher discovery.")}>Create your profile <span aria-hidden="true">↗</span></button>
          </div>
          <div className="directory-layout">
            <ResearcherFilters filters={filters} onChange={updateFilter} onReset={() => setFilters(initialFilters)} />
            <div>
              {researchers.length ? <div className="researcher-grid">{researchers.map((researcher) => <ResearcherCard key={researcher.id} researcher={researcher} onConnect={showConnectNotice} />)}</div> : <div className="empty-state"><strong>No researchers found</strong>Try a different search or clear the filters.</div>}
              <p className="demo-note">Sample profiles shown for product preview.</p>
            </div>
          </div>
        </section>

        <section id="projects" className="projects-section" aria-labelledby="projects-title">
          <div className="section-heading"><div><h2 id="projects-title">Research in motion</h2><p>Explore projects and see where your expertise could help.</p></div><a className="button button-quiet" href="#discover">Explore all projects <span aria-hidden="true">→</span></a></div>
          <div className="researcher-grid">{demoProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div>
        </section>
      </main>
      <footer id="about" className="site-footer"><span>© 2025 Research Connect · Built for curious minds.</span><span>Discover · Share · Collaborate</span></footer>
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")} type="button" aria-label="Dismiss message">×</button></div>}
    </div>
  );
}

export default Home;
