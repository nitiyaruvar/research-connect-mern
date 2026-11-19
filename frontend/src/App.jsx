import { useState } from "react";
import Home from "./pages/Home";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("researchConnectUser") || "null"));

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || "Authentication failed");
      return;
    }

    localStorage.setItem("researchConnectToken", data.token);
    localStorage.setItem("researchConnectUser", JSON.stringify(data.user));
    setUser(data.user);
    setMessage(mode === "login" ? "Signed in successfully." : "Account created successfully.");
  }

  function handleLogout() {
    localStorage.removeItem("researchConnectToken");
    localStorage.removeItem("researchConnectUser");
    setUser(null);
    setMessage("");
  }

  if (user) {
    return <Home user={user} onLogout={handleLogout} />;
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">RESEARCH CONNECT</p>
        <h1>{mode === "login" ? "Welcome back" : "Join the network"}</h1>
        <p className="auth-copy">Connect with researchers and turn shared questions into meaningful work.</p>
        <form onSubmit={handleSubmit}>
          <label>Username<input required minLength="3" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} /></label>
          {mode === "register" && <>
            <label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
            <label>Email<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          </>}
          <label>Password<input required minLength="6" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <button type="submit">{mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        {message && <p className="form-message" role="status">{message}</p>}
        <button className="switch-button" type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setMessage(""); }}>
          {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}

export default App;