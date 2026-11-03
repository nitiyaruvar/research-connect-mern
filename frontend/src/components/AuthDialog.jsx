import { useState } from "react";
import { apiRequest } from "../api/client";
import { apiUrl } from "../api/config";

function AuthDialog({ mode: initialMode = "login", onClose, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await apiRequest(`/auth/${mode === "register" ? "register" : "login"}`, { method: "POST", body: values });
      window.localStorage.setItem("research-connect-token", result.data.token);
      onAuthenticated(result.data.user);
      onClose();
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="recommendation-dialog auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
      <span className="eyebrow"><span className="eyebrow-dot" /> Research Connect</span>
      <h2 id="auth-title">{mode === "register" ? "Join the network" : "Welcome back"}</h2>
      <p className="dialog-copy">{mode === "register" ? "Create a researcher account to share your work and connect with collaborators." : "Sign in to manage your profile, projects, and collaboration requests."}</p>
      <form className="form-stack" onSubmit={submit}>
        {mode === "register" && <>
          <label>Your name<input name="name" autoComplete="name" required maxLength="100" /></label>
          <label>Username<input name="username" autoComplete="username" required minLength="3" maxLength="30" pattern="[A-Za-z0-9_]+" /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
        </>}
        {mode === "login" && <label>Username or email<input name="identity" autoComplete="username" required /></label>}
        <label>Password<input name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 12 : 1} maxLength="128" />{mode === "register" && <small>12+ characters with uppercase, lowercase, number, and symbol.</small>}</label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary form-submit" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
      </form>
      <div className="auth-divider"><span>or</span></div>
      <button className="button button-outline google-button" type="button" onClick={() => window.location.assign(apiUrl("/auth/google"))}>Continue with Google</button>
      <p className="auth-switch">{mode === "register" ? "Already have an account?" : "New to Research Connect?"} <button type="button" onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}>{mode === "register" ? "Sign in" : "Create an account"}</button></p>
    </section>
  </div>;
}

export default AuthDialog;
