"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

const CARD_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-rose-500",
];

function DashboardContent() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const res = await api.post("/projects", { name: newProjectName });
      setShowModal(false);
      setNewProjectName("");
      router.push(`/editor/${res.data.data._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!confirm("Delete this project? This cannot be undone.")) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  const totalCollaborators = new Set(
    projects.flatMap((p) => p.collaborators || []),
  ).size;

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-2 lg:justify-start lg:gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-black">
            {"</>"}
          </span>
          <span className="font-medium text-zinc-900">CodeFlow</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-zinc-500 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        <span className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          Dashboard
        </span>
      </nav>

      <div className="mt-auto border-t border-zinc-100 pt-4">
        <div className="flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
            {user?.name?.[0]?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-800">
              {user?.name}
            </p>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-3 w-full rounded-lg px-2 py-1.5 text-left text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
        >
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-col border-r border-zinc-200 bg-white p-4 lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white p-4">
            {sidebarContent}
          </aside>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-8">
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-600"
          >
            <Menu size={22} />
          </button>
          <span className="font-medium text-zinc-900">CodeFlow</span>
        </div>

        <h1 className="mt-4 text-lg font-semibold text-zinc-900 sm:mt-0 sm:text-xl">
          Good morning, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Keep building, keep growing.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">Total Projects</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {projects.length}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">Collaborators</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">
              {totalCollaborators}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">Last Active</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">Today</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-zinc-700">Your Projects</h2>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400"
          >
            New project
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No projects yet. Create your first one to get started.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <div
                key={project._id}
                onClick={() => router.push(`/editor/${project._id}`)}
                className="group cursor-pointer rounded-xl border border-zinc-200 bg-white p-4 hover:border-emerald-300"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white ${
                      CARD_COLORS[i % CARD_COLORS.length]
                    }`}
                  >
                    {project.name?.[0]?.toUpperCase()}
                  </span>
                  <button
                    onClick={(e) => handleDeleteProject(e, project._id)}
                    className="text-xs text-zinc-400 hover:text-red-500 sm:hidden sm:group-hover:block"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-900">
                  {project.name}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Updated {new Date(project.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-medium text-zinc-900">
              Create new project
            </h2>
            <form onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-black hover:bg-emerald-400 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
