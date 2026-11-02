import Navbar from "../components/Navbar";
import ResearcherCard from "../components/ResearcherCard";

function Home() {
  return (
    <>
      <Navbar />

      <ResearcherCard
        name="Dr. John"
        field="Artificial Intelligence"
      />

      <ResearcherCard
        name="Dr. Sarah"
        field="Data Science"
      />
    </>
  );
}

export default Home;