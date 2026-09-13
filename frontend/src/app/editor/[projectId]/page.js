"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import socket from "@/lib/socket";

const LANGUAGE_MAP = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  json: "json",
  css: "css",
  scss: "scss",
  html: "html",
  py: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
  md: "markdown",
  yml: "yaml",
  yaml: "yaml",
};

function getLanguage(fileName) {
  const ext = fileName?.split(".").pop();
  return LANGUAGE_MAP[ext] || "plaintext";
}

function EditorContent() {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openFiles, setOpenFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  const [newFileName, setNewFileName] = useState("");
  const [showNewFileInput, setShowNewFileInput] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviting, setInviting] = useState(false);

  const isRemoteChange = useRef(false);

  const activeFile = openFiles.find((f) => f._id === activeFileId) || null;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data.data.project);
        setFiles(res.data.data.files);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  useEffect(() => {
    socket.connect();
    socket.emit("join_project", projectId);

    socket.on("receive_code_change", ({ fileId, content }) => {
      setOpenFiles((current) =>
        current.map((f) => (f._id === fileId ? { ...f, content } : f)),
      );

      setActiveFileId((currentActiveId) => {
        if (currentActiveId === fileId) {
          isRemoteChange.current = true;
          setCode(content);
        }
        return currentActiveId;
      });
    });

    return () => {
      socket.off("receive_code_change");
      socket.disconnect();
    };
  }, [projectId]);

  const openFile = (file) => {
    setOpenFiles((prev) => {
      const exists = prev.some((f) => f._id === file._id);
      return exists ? prev : [...prev, file];
    });
    setActiveFileId(file._id);
    setCode(file.content || "");
  };

  const closeTab = (e, fileId) => {
    e.stopPropagation();
    setOpenFiles((prev) => {
      const remaining = prev.filter((f) => f._id !== fileId);
      if (activeFileId === fileId) {
        const next = remaining[remaining.length - 1];
        setActiveFileId(next ? next._id : null);
        setCode(next ? next.content || "" : "");
      }
      return remaining;
    });
  };

  const switchTab = (file) => {
    setActiveFileId(file._id);
    setCode(file.content || "");
  };

  const handleCodeChange = (value) => {
    setCode(value);

    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    if (!activeFile) return;

    socket.emit("code_change", {
      projectId,
      fileId: activeFile._id,
      content: value,
    });
  };

  const handleSave = async () => {
    if (!activeFile) return;

    setSaving(true);
    try {
      await api.put(`/projects/${projectId}/files/${activeFile._id}`, {
        content: code,
      });
      setFiles((prev) =>
        prev.map((f) =>
          f._id === activeFile._id ? { ...f, content: code } : f,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    try {
      const res = await api.post(`/projects/${projectId}/files`, {
        fileName: newFileName,
      });
      setFiles((prev) => [...prev, res.data.data]);
      setNewFileName("");
      setShowNewFileInput(false);
      openFile(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFile = async (e, fileId) => {
    e.stopPropagation();
    if (!confirm("Delete this file?")) return;

    try {
      await api.delete(`/projects/${projectId}/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
      setOpenFiles((prev) => {
        const remaining = prev.filter((f) => f._id !== fileId);
        if (activeFileId === fileId) {
          const next = remaining[remaining.length - 1];
          setActiveFileId(next ? next._id : null);
          setCode(next ? next.content || "" : "");
        }
        return remaining;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviting(true);

    try {
      const res = await api.post(`/projects/${projectId}/collaborators`, {
        email: inviteEmail,
      });
      setProject(res.data.data);
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (err) {
      setInviteError(err.response?.data?.message || "Something went wrong");
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        Loading project...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-xs font-bold text-black">
            {"</>"}
          </span>
          <h2 className="text-sm font-medium text-zinc-300">{project?.name}</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Invite
          </button>
          <button
            onClick={handleSave}
            disabled={!activeFile || saving}
            className="rounded bg-emerald-500 px-3 py-1 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-56 flex-col border-r border-zinc-800 bg-zinc-900 p-2">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-xs uppercase tracking-wide text-zinc-600">
              Files
            </span>
            <button
              onClick={() => setShowNewFileInput(true)}
              className="text-zinc-500 hover:text-zinc-200"
            >
              +
            </button>
          </div>

          {showNewFileInput && (
            <form onSubmit={handleCreateFile} className="mb-1 px-1">
              <input
                type="text"
                placeholder="filename.js"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                autoFocus
                onBlur={() => setShowNewFileInput(false)}
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-emerald-600"
              />
            </form>
          )}

          <div className="flex flex-col">
            {files.map((file) => (
              <div
                key={file._id}
                onClick={() => openFile(file)}
                className={`group flex cursor-pointer items-center justify-between rounded px-2 py-1 text-sm ${
                  activeFileId === file._id
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800/60"
                }`}
              >
                <span className="truncate">{file.fileName}</span>
                <button
                  onClick={(e) => handleDeleteFile(e, file._id)}
                  className="hidden text-zinc-600 hover:text-red-400 group-hover:block"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {openFiles.length > 0 && (
            <div className="flex overflow-x-auto border-b border-zinc-800 bg-zinc-900">
              {openFiles.map((file) => (
                <div
                  key={file._id}
                  onClick={() => switchTab(file)}
                  className={`group flex cursor-pointer items-center gap-2 border-r border-zinc-800 px-3 py-2 text-sm ${
                    activeFileId === file._id
                      ? "bg-zinc-950 text-zinc-100"
                      : "text-zinc-500 hover:bg-zinc-800/60"
                  }`}
                >
                  <span>{file.fileName}</span>
                  <button
                    onClick={(e) => closeTab(e, file._id)}
                    className="text-zinc-600 opacity-0 hover:text-zinc-200 group-hover:opacity-100"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1">
            {activeFile ? (
              <Editor
                key={activeFile._id}
                height="100%"
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                language={getLanguage(activeFile.fileName)}
                options={{
                  fontSize: 14,
                  minimap: { enabled: true },
                  automaticLayout: true,
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                Select a file to start editing
              </div>
            )}
          </div>
        </div>

        <div className="flex w-64 flex-col border-l border-zinc-800 bg-zinc-900 p-3">
          <span className="text-xs uppercase tracking-wide text-zinc-600">
            Collaborators
          </span>
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-xs font-medium text-black">
                {project?.owner?.name?.[0]?.toUpperCase() || "?"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm text-zinc-200">
                  {project?.owner?.name}
                  {project?.owner?._id === user?._id ? " (You)" : ""}
                </p>
                <p className="text-xs text-zinc-500">Owner</p>
              </div>
            </div>

            {project?.collaborators?.map((c) => (
              <div key={c._id} className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-700 text-xs font-medium text-zinc-200">
                  {c.name?.[0]?.toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-200">
                    {c.name}
                    {c._id === user?._id ? " (You)" : ""}
                  </p>
                  <p className="text-xs text-zinc-500">Collaborator</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-sm font-medium">Invite collaborator</h2>
            <form onSubmit={handleInvite}>
              <input
                type="email"
                placeholder="Enter email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-600"
              />
              {inviteError && (
                <p className="mt-2 text-xs text-red-400">{inviteError}</p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
                >
                  {inviting ? "Inviting..." : "Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  );
}
