import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const IssuesBoard = () => {
  const { projectId } = useParams();
  const [issues, setIssues] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "To Do",
  });
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState("Viewer");

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/issues`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIssues(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load issues");
    }
  };

  const fetchProjectRole = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRole(res.data.current_user_role);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch project role");
    }
  };

  useEffect(() => {
    fetchProjectRole();
    fetchIssues();
  }, [projectId]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/issues`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Issue created ✅");
      setForm({ title: "", description: "", status: "To Do" });
      setShowForm(false);
      fetchIssues();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to create issue");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this issue?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/projects/${projectId}/issues/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Issue deleted 🗑️");
      fetchIssues();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Delete failed");
    }
  };

  const grouped = {
    "To Do": issues.filter((i) => i.status === "To Do"),
    "In Progress": issues.filter((i) => i.status === "In Progress"),
    Done: issues.filter((i) => i.status === "Done"),
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Issues Board</h3>
        {role !== "Viewer" && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close" : "+ Create Issue"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card shadow-sm p-3 mb-4">
          <h5 className="mb-3">New Issue</h5>
          <form onSubmit={handleCreate}>
            <div className="mb-2">
              <label>Title</label>
              <input
                className="form-control"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-2">
              <label>Description</label>
              <textarea
                className="form-control"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div className="mb-2">
              <label>Status</label>
              <select
                className="form-select"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success w-100">
              Create
            </button>
          </form>
        </div>
      )}

      <div className="row g-3">
        {Object.keys(grouped).map((status) => (
          <div key={status} className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white">
                <h6 className="mb-0">{status}</h6>
              </div>
              <div className="card-body">
                {grouped[status].length === 0 ? (
                  <p className="text-muted small">No issues</p>
                ) : (
                  grouped[status].map((issue) => (
                    <div key={issue.id} className="card mb-2 border">
                      <div className="card-body p-2">
                        <h6 className="mb-1">{issue.title}</h6>
                        <p className="mb-1 text-muted small">
                          {issue.description}
                        </p>
                        <div className="d-flex justify-content-between">
                          <small>Reporter: {issue.reporter}</small>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(issue.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IssuesBoard;
