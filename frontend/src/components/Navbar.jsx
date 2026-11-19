function Navbar({ user, onLogout }) {
  return (
    <nav>
      <h2>Research Connect</h2>
      <div className="nav-account">
        <span>@{user.username}</span>
        <button type="button" onClick={onLogout}>Sign out</button>
      </div>
    </nav>
  );
}

export default Navbar;