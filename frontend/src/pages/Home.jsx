import Navbar from "../components/Navbar";
import ResearcherCard from "../components/ResearcherCard";

function Home({ user, onLogout }) {
  return (
    <>
      <Navbar user={user} onLogout={onLogout} />

      <main className="home-page">
        <p className="eyebrow">RESEARCH CONNECT</p>
        <h1>Good to see you, {user.name}.</h1>
        <p className="home-copy">Explore researchers working across disciplines and find your next collaboration.</p>

        <div className="researcher-grid">
          <ResearcherCard name="Dr. John" field="Artificial Intelligence" />
          <ResearcherCard name="Dr. Sarah" field="Data Science" />
        </div>
      </main>

    </>
  );
}

export default Home;