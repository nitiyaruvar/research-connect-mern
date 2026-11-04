import { useEffect, useState } from "react";
import { apiRequest, uploadFile } from "../api/client";
import { assetUrl } from "../api/config";
import Pagination from "./Pagination";

function WorkspaceDialog({ user, initialTab = "profile", onClose, onUserUpdated, onNotice, onSignedOut, onProjectCreated, onProjectDeleted }) {
  const [tab, setTab] = useState(initialTab);
  const [requests, setRequests] = useState([]);
  const [requestPage, setRequestPage] = useState(1);
  const [requestPages, setRequestPages] = useState(1);
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(user);

  useEffect(() => {
    if (tab !== "requests") return;
    let active = true;
    apiRequest(`/collaborations?page=${requestPage}&limit=12`).then((result) => {
      if (!active) return;
      setRequests(result.data || []);
      const pages = Math.max(1, result.pagination?.pages || 1);
      setRequestPages(pages);
      if (requestPage > pages) setRequestPage(pages);
    }).catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [tab, requestPage]);

  useEffect(() => {
    if (tab !== "project") return;
    let active = true;
    apiRequest("/projects?page=1&limit=100").then((result) => {
      if (active) setProjects((result.data || []).filter((project) => String(project.owner?._id || project.owner) === user._id));
    }).catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [tab, user._id]);

  useEffect(() => {
    if (tab !== "files") return;
    let active = true;
    apiRequest("/uploads?page=1&limit=50").then((result) => { if (active) setFiles(result.data || []); }).catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [tab]);

  async function saveProfile(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(["name", "department", "institution", "bio", "website"].map((key) => [key, form.get(key)]));
    body.researchInterests = String(form.get("researchInterests") || "").split(",").map((value) => value.trim()).filter(Boolean);
    body.skills = String(form.get("skills") || "").split(",").map((value) => value.trim()).filter(Boolean);
    body.isOpenToCollaboration = form.get("isOpenToCollaboration") === "on";
    const file = form.get("avatar");
    try {
      if (file?.size) { const uploaded = await uploadFile(file); body.profilePicture = uploaded.url; }
      const result = await apiRequest("/auth/me", { method: "PUT", body });
      setProfile(result.data); onUserUpdated(result.data); setMessage("Profile saved successfully.");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function createProject(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const body = Object.fromEntries(["title", "summary", "description", "department", "status", "startDate", "endDate"].map((key) => [key, form.get(key)]));
    body.researchAreas = String(form.get("researchAreas") || "").split(",").map((value) => value.trim()).filter(Boolean);
    body.keywords = String(form.get("keywords") || "").split(",").map((value) => value.trim()).filter(Boolean);
    const uploads = form.getAll("newAttachments").filter((file) => file.size > 0);
    const retainedAttachments = form.getAll("keepAttachment");
    if (retainedAttachments.length + uploads.length > 8) {
      setBusy(false); setMessage("A project can have up to 8 files."); return;
    }
    if (!body.startDate) delete body.startDate;
    if (!body.endDate) delete body.endDate;
    try {
      const uploaded = await Promise.all(uploads.map(uploadFile));
      body.attachments = [...retainedAttachments, ...uploaded.map((file) => file.url)];
      const result = await apiRequest(editingProject ? `/projects/${editingProject._id}` : "/projects", { method: editingProject ? "PUT" : "POST", body });
      const saved = result.data;
      setProjects((current) => editingProject ? current.map((project) => project._id === saved._id ? saved : project) : [saved, ...current]);
      onProjectCreated(saved); setEditingProject(null); setMessage(editingProject ? "Project changes saved." : "Project published. It is now visible in discovery."); formElement.reset();
    }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function editProject(project) {
    setMessage("");
    try { const result = await apiRequest(`/projects/${project._id}`); setEditingProject(result.data); }
    catch (error) { setMessage(error.message); }
  }

  async function deleteProject(project) {
    if (deleteCandidate !== project._id) { setDeleteCandidate(project._id); return; }
    setBusy(true); setMessage("");
    try { await apiRequest(`/projects/${project._id}`, { method: "DELETE" }); setProjects((current) => current.filter((item) => item._id !== project._id)); onProjectDeleted(project._id); setDeleteCandidate(""); setMessage("Project deleted."); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function deleteFile(file) {
    setBusy(true); setMessage("");
    try { await apiRequest(`/uploads/${file._id}`, { method: "DELETE" }); setFiles((current) => current.filter((item) => item._id !== file._id)); setMessage("File deleted."); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function respond(request, status) {
    setMessage("");
    try { const result = await apiRequest(`/collaborations/${request._id}`, { method: "PATCH", body: { status } }); setRequests((current) => current.map((item) => item._id === request._id ? result.data : item)); }
    catch (error) { setMessage(error.message); }
  }

  async function signOut() {
    setBusy(true); setMessage("");
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      onSignedOut(); onNotice("You have signed out."); onClose();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="recommendation-dialog workspace-dialog" role="dialog" aria-modal="true" aria-labelledby="workspace-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
      <span className="eyebrow"><span className="eyebrow-dot" /> Your research workspace</span>
      <h2 id="workspace-title">Hello, {profile.name?.split(" ")[0]}</h2>
      <div className="workspace-tabs" role="tablist" aria-label="Workspace sections">
        {[ ["profile", "Profile"], ["project", "Projects"], ["requests", "Requests"], ["files", "Files"] ].map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} className={tab === value ? "selected" : ""} onClick={() => { setTab(value); setMessage(""); }}>{label}</button>)}
      </div>
      {tab === "profile" && <form className="form-stack workspace-form" onSubmit={saveProfile}>
        <label>Full name<input name="name" defaultValue={profile.name || ""} required maxLength="100" /></label>
        <div className="form-row"><label>Department<input name="department" defaultValue={profile.department || ""} maxLength="120" /></label><label>Institution<input name="institution" defaultValue={profile.institution || ""} maxLength="160" /></label></div>
        <label>About your research<textarea name="bio" defaultValue={profile.bio || ""} rows="3" maxLength="1200" /></label>
        <label>Research interests <small>Separate with commas</small><input name="researchInterests" defaultValue={(profile.researchInterests || []).join(", ")} /></label>
        <label>Skills <small>Separate with commas</small><input name="skills" defaultValue={(profile.skills || []).join(", ")} /></label>
        <div className="form-row"><label>Website (HTTPS)<input name="website" type="url" defaultValue={profile.website || ""} placeholder="https://…" /></label><label>Profile image<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" /><small>JPEG, PNG, or WebP · up to 5 MB</small></label></div>
        <label className="workspace-check"><input name="isOpenToCollaboration" type="checkbox" defaultChecked={profile.isOpenToCollaboration !== false} /> Open to collaboration requests</label>
        <button className="button button-primary form-submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
      </form>}
      {tab === "project" && <>
        {projects.length > 0 && <div className="owned-projects"><h3>Your projects</h3>{projects.map((project) => <article key={project._id} className="owned-project"><div><strong>{project.title}</strong><small>{project.status.replaceAll("-", " ")}</small></div><div className="owned-actions"><button className="button button-outline" type="button" onClick={() => editProject(project)}>Edit</button><button className="button button-outline delete-action" type="button" disabled={busy} onClick={() => deleteProject(project)}>{deleteCandidate === project._id ? "Confirm delete" : "Delete"}</button></div></article>)}</div>}
        <form key={editingProject?._id || "new-project"} className="form-stack workspace-form" onSubmit={createProject}>
          <h3>{editingProject ? "Edit project" : "Publish a project"}</h3>
          <label>Project title<input name="title" required maxLength="160" defaultValue={editingProject?.title || ""} /></label>
          <label>Short summary<input name="summary" required maxLength="320" defaultValue={editingProject?.summary || ""} /></label>
          <label>Project details<textarea name="description" rows="4" required maxLength="8000" defaultValue={editingProject?.description || ""} /></label>
          <div className="form-row"><label>Department<input name="department" maxLength="120" defaultValue={editingProject?.department || profile.department || ""} /></label><label>Status<select name="status" defaultValue={editingProject?.status || "seeking-collaborators"}><option value="seeking-collaborators">Seeking collaborators</option><option value="active">Active</option><option value="completed">Completed</option></select></label></div>
          <label>Research areas <small>Comma separated, up to 12</small><input name="researchAreas" defaultValue={(editingProject?.researchAreas || []).join(", ")} /></label>
          <label>Keywords <small>Comma separated, up to 12</small><input name="keywords" defaultValue={(editingProject?.keywords || []).join(", ")} /></label>
          {editingProject?.attachments?.length > 0 && <fieldset className="attachment-fieldset"><legend>Keep project files</legend>{editingProject.attachments.map((file) => <label className="attachment-check" key={file}><input type="checkbox" name="keepAttachment" value={file} defaultChecked />{file.split("/").pop()}</label>)}</fieldset>}
          <label>Attach files <small>PNG, JPEG, WebP, or PDF · 5 MB each · up to 8 total. Project files are publicly accessible.</small><input name="newAttachments" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" multiple /></label>
          <div className="form-row"><label>Start date<input name="startDate" type="date" defaultValue={editingProject?.startDate?.slice(0, 10) || ""} /></label><label>End date<input name="endDate" type="date" defaultValue={editingProject?.endDate?.slice(0, 10) || ""} /></label></div>
          <div className="form-row"><button className="button button-primary form-submit" disabled={busy}>{busy ? "Saving…" : editingProject ? "Save project changes" : "Publish project"}</button>{editingProject && <button className="button button-outline" type="button" onClick={() => setEditingProject(null)}>Cancel edit</button>}</div>
        </form>
      </>}
      {tab === "requests" && <><div className="request-list">{requests.length ? requests.map((item) => <article className="request-card" key={item._id}><div className="request-title"><strong>{item.requester?._id === user._id ? `To ${item.recipient?.name}` : item.requester?.name}</strong><span className={`request-status ${item.status}`}>{item.status}</span></div><p>{item.message || "I'd like to connect about our research."}</p>{item.project && <small>Project: {item.project.title}</small>}{item.status === "pending" && item.requester?._id === user._id && <div className="request-actions"><button className="button button-outline" type="button" onClick={() => respond(item, "withdrawn")}>Withdraw request</button></div>}{item.status === "pending" && item.recipient?._id === user._id && <div className="request-actions"><button className="button button-outline" type="button" onClick={() => respond(item, "declined")}>Decline</button><button className="button button-primary" type="button" onClick={() => respond(item, "accepted")}>Accept</button></div>}</article>) : <p className="empty-state">No collaboration requests yet. When a researcher reaches out, you can review it here.</p>}</div><Pagination label="Requests" page={requestPage} pages={requestPages} onChange={setRequestPage} /></>}
      {tab === "files" && <div className="request-list">{files.length ? files.map((file) => <article className="request-card file-card" key={file._id}><div><a href={assetUrl(file.url)} target="_blank" rel="noreferrer">{file.originalName}</a><small>{file.mimeType} · {(file.size / (1024 * 1024)).toFixed(2)} MB</small></div><button className="button button-outline delete-action" type="button" disabled={busy} onClick={() => deleteFile(file)}>Delete</button></article>) : <p className="empty-state">No uploaded files yet. Add a profile image or attach a file to one of your projects.</p>}</div>}
      {message && <p className="form-feedback" role="status">{message}</p>}
      <div className="workspace-bottom"><span>Signed in as @{user.username}</span><button type="button" disabled={busy} onClick={signOut}>Sign out</button></div>
    </section>
  </div>;
}

export default WorkspaceDialog;
