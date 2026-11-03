import { useEffect, useMemo, useState } from "react";
import { apiRequest, getProjects, getResearchers } from "../api/client";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ResearcherCard from "../components/ResearcherCard";
import ResearcherFilters from "../components/ResearcherFilters";
import AuthDialog from "../components/AuthDialog";
import WorkspaceDialog from "../components/WorkspaceDialog";
import ConnectDialog from "../components/ConnectDialog";

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
  const [liveResearchers, setLiveResearchers] = useState(null);
  const [liveProjects, setLiveProjects] = useState(null);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [recommendationProject, setRecommendationProject] = useState(null);
  const [recommendationResults, setRecommendationResults] = useState([]);
  const [recommendationStatus, setRecommendationStatus] = useState("");
  const [recommendationNotice, setRecommendationNotice] = useState("");
  const [allowAI, setAllowAI] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [connectResearcher, setConnectResearcher] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const oauthResult = url.searchParams.get("oauth");
    if (oauthResult) { url.searchParams.delete("oauth"); window.history.replaceState({}, "", url); }
    const hasToken = Boolean(window.localStorage.getItem("research-connect-token"));
    if (!hasToken && oauthResult !== "success") {
      if (oauthResult === "failed" || oauthResult === "cancelled") setNotice(oauthResult === "failed" ? "Google sign-in could not be completed." : "Google sign-in was cancelled.");
      return;
    }
    let active = true;
    apiRequest("/auth/me").then((result) => { if (active) setUser(result.data); }).catch(() => {
      window.localStorage.removeItem("research-connect-token");
      if (active) setNotice("Your session expired. Sign in again to continue.");
    });
    return () => { active = false; };
  }, []);
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

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const [researcherResponse, projectResponse] = await Promise.all([
          getResearchers({ search: query.trim(), ...filters }, controller.signal),
          getProjects(controller.signal),
        ]);
        setLiveResearchers((researcherResponse.data || []).map((researcher) => ({
          id: researcher._id,
          name: researcher.name,
          role: researcher.role,
          department: researcher.department || "Independent researcher",
          institution: researcher.institution || "Institution not listed",
          interests: [...(researcher.researchInterests || []), ...(researcher.skills || [])].slice(0, 4),
          openToCollaboration: researcher.isOpenToCollaboration,
        })));
        setLiveProjects((projectResponse.data || []).map((project) => ({
          id: project._id,
          title: project.title,
          summary: project.summary,
          status: project.status === "seeking-collaborators" ? "Seeking collaborators" : project.status,
          year: project.startDate ? new Date(project.startDate).getFullYear() : "Ongoing",
          lead: project.owner?.name || "Research team",
          areas: project.researchAreas || [],
        })));
        setApiUnavailable(false);
      } catch (error) {
        if (error.name !== "AbortError") setApiUnavailable(true);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [filters, query]);

  const displayedResearchers = liveResearchers ?? researchers;
  const displayedProjects = liveProjects ?? demoProjects;

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function showConnectNotice(researcher) {
    if (!user) { setAuthMode("login"); setNotice("Sign in to send a collaboration request."); return; }
    setConnectResearcher(researcher);
  }

  function openRecommendations(project) {
    setRecommendationProject(project);
    setRecommendationResults([]);
    setRecommendationStatus("");
    setRecommendationNotice("");
    setAllowAI(false);
  }

  async function findCollaborators(event) {
    event.preventDefault();
    setRecommendationStatus("Searching for a good fit…");
    setRecommendationResults([]);
    try {
      const result = await apiRequest("/recommendations", {
        method: "POST",
        body: { projectId: recommendationProject.id, allowAI },
      });
      setRecommendationResults(result.data || []);
      setRecommendationNotice(result.notice || (result.method === "openai" ? "AI assisted" : "Matched by overlapping research terms"));
      setRecommendationStatus(result.data?.length ? "" : "No close matches yet. Add more research areas or invite collaborators from discovery.");
    } catch (error) {
      setRecommendationStatus(error.message);
    }
  }

  return (
    <div id="top" className="site-shell">
      <Navbar user={user} onLogin={() => setAuthMode("login")} onJoin={() => setAuthMode("register")} onWorkspace={() => setWorkspace("profile")} />
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
            <button className="button button-outline" type="button" onClick={() => user ? setWorkspace("profile") : setAuthMode("register")}>{user ? "Edit your profile" : "Create your profile"} <span aria-hidden="true">↗</span></button>
          </div>
          <div className="directory-layout">
            <ResearcherFilters filters={filters} onChange={updateFilter} onReset={() => setFilters(initialFilters)} />
            <div>
              {displayedResearchers.length ? <div className="researcher-grid">{displayedResearchers.map((researcher) => <ResearcherCard key={researcher.id} researcher={researcher} onConnect={showConnectNotice} />)}</div> : <div className="empty-state"><strong>No researchers found</strong>Try a different search or clear the filters.</div>}
              {apiUnavailable && <p className="demo-note">API unavailable — showing sample profiles. Start the backend or check the VITE_API_URL setting.</p>}
            </div>
          </div>
        </section>

        <section id="projects" className="projects-section" aria-labelledby="projects-title">
          <div className="section-heading"><div><h2 id="projects-title">Research in motion</h2><p>Explore projects and see where your expertise could help.</p></div>{user ? <button className="button button-primary" type="button" onClick={() => setWorkspace("project")}>＋ Share a project</button> : <a className="button button-quiet" href="#discover">Explore all projects <span aria-hidden="true">→</span></a>}</div>
          <div className="researcher-grid">{displayedProjects.map((project) => <ProjectCard key={project.id} project={project} onRecommend={openRecommendations} />)}</div>
        </section>
      </main>
      <footer id="about" className="site-footer"><span>© 2025 Research Connect · Built for curious minds.</span><span>Discover · Share · Collaborate</span></footer>
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")} type="button" aria-label="Dismiss message">×</button></div>}
      {recommendationProject && <div className="modal-backdrop" role="presentation">
        <section className="recommendation-dialog" role="dialog" aria-modal="true" aria-labelledby="recommendation-title">
          <button className="modal-close" onClick={() => setRecommendationProject(null)} type="button" aria-label="Close recommendations">×</button>
          <span className="eyebrow"><span className="eyebrow-dot" /> Research fit</span>
          <h2 id="recommendation-title">Find collaborators</h2>
          <p className="dialog-project-title">{recommendationProject.title}</p>
          <p className="dialog-copy">We can match by shared research terms locally. You can optionally ask OpenAI to rank the fit and suggest complementary expertise.</p>
          <label className="consent-option"><input type="checkbox" checked={allowAI} onChange={(event) => setAllowAI(event.target.checked)} />
            <span><strong>Use AI for this request</strong><small>If selected, this project’s title, summary, research areas, keywords, and candidate research fields are sent to OpenAI. Names, email addresses, and account IDs are excluded.</small></span>
          </label>
          <p className="ai-note">Suggestions are only a starting point. Review profiles and make collaboration decisions yourself.</p>
          <div className="dialog-actions"><button className="button button-quiet" onClick={() => setRecommendationProject(null)} type="button">Cancel</button><button className="button button-primary" onClick={findCollaborators} type="button" disabled={recommendationStatus === "Searching for a good fit…"}>Find matches</button></div>
          {recommendationNotice && <p className="recommendation-notice" role="status">{recommendationNotice}</p>}
          {recommendationStatus && <p className="recommendation-status" role="status">{recommendationStatus}</p>}
          {recommendationResults.length > 0 && <ul className="recommendation-list">{recommendationResults.map(({ researcher, score, reason }) => <li key={researcher._id}><div className="recommendation-result-head"><strong>{researcher.name}</strong><span>{score}% fit</span></div><small>{researcher.department || "Independent researcher"}</small><p>{reason}</p></li>)}</ul>}
        </section>
      </div>}
      {authMode && <AuthDialog mode={authMode} onClose={() => setAuthMode("")} onAuthenticated={(nextUser) => { setUser(nextUser); setNotice(`Welcome, ${nextUser.name}. Your workspace is ready.`); }} />}
      {workspace && user && <WorkspaceDialog user={user} initialTab={workspace} onClose={() => setWorkspace("")} onUserUpdated={setUser} onNotice={setNotice} onProjectCreated={(project) => { setLiveProjects((current) => { const normalized = { id: project._id, title: project.title, summary: project.summary, status: project.status === "seeking-collaborators" ? "Seeking collaborators" : project.status, year: project.startDate ? new Date(project.startDate).getFullYear() : "Ongoing", lead: user.name, areas: project.researchAreas || [] }; return [normalized, ...(current || []).filter((item) => item.id !== project._id)]; }); }} onProjectDeleted={(projectId) => setLiveProjects((current) => (current || []).filter((item) => item.id !== projectId))} />}
      {connectResearcher && <ConnectDialog researcher={connectResearcher} projects={liveProjects || []} onClose={() => setConnectResearcher(null)} onNotice={setNotice} />}
    </div>
  );
}

export default Home;
