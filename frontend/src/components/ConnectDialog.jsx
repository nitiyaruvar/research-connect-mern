import { useState } from "react";
import { apiRequest } from "../api/client";

function ConnectDialog({ researcher, projects, onClose, onNotice }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const projectId = form.get("projectId");
    try {
      await apiRequest("/collaborations", { method: "POST", body: { recipientId: researcher.id, message: form.get("message"), ...(projectId ? { projectId } : {}) } });
      onNotice(`Collaboration request sent to ${researcher.name}.`); onClose();
    } catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="recommendation-dialog" role="dialog" aria-modal="true" aria-labelledby="connect-title"><button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button><span className="eyebrow"><span className="eyebrow-dot" /> Start a conversation</span><h2 id="connect-title">Connect with {researcher.name}</h2><p className="dialog-copy">Send a short note to introduce your research interests.</p><form className="form-stack" onSubmit={submit}><label>Related project (optional)<select name="projectId"><option value="">General collaboration</option>{projects.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}</select></label><label>Message<textarea name="message" required rows="4" maxLength="2000" placeholder="Tell them what you are working on and why you would like to connect." /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary form-submit" disabled={busy}>{busy ? "Sending…" : "Send request"}</button></form></section></div>;
}

export default ConnectDialog;
