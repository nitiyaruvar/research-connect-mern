function Navbar() {
  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Research Connect home">
        <span className="brand-mark" aria-hidden="true">R</span>
        <span>research<span style={{ color: "var(--forest)" }}>connect</span></span>
      </a>
      <nav className="nav-links" aria-label="Main navigation">
        <a className="active" href="#discover">Discover</a>
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
      </nav>
      <div className="nav-actions">
        <button className="button button-quiet" type="button">Log in</button>
        <button className="button button-primary" type="button">Join network <span aria-hidden="true">↗</span></button>
      </div>
    </header>
  );
}

export default Navbar;
