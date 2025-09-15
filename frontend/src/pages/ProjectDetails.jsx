import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [newMember, setNewMember] = useState({ email: "", role: "Member" });

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/projects/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProject(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to fetch project");
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/projects/${id}/members`,
        newMember,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Member added ✅");
      setNewMember({ email: "", role: "Member" });
      fetchProject();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to add member");
    }
  };

  const handleRoleChange = async (email, role) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${
          import.meta.env.VITE_API_URL
        }/projects/${id}/members/${email}?role=${role}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Role updated ✅");
      fetchProject();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (email) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/projects/${id}/members/${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Member removed ✅");
      fetchProject();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove member");
    }
  };

  if (!project) return <p className="container mt-5">Loading project...</p>;

  return (
    <div className="container mt-5">
      <h2>
        {project.name} ({project.key})
      </h2>
      <p>{project.description}</p>
      <p>
        <b>Type:</b> {project.type}
      </p>
      <p>
        <b>Owner:</b> {project.owner}
      </p>

      <hr />
      <h4>Members</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {project.members.map((m) => (
            <tr key={m.email}>
              <td>{m.email}</td>
              <td>
                <select
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.email, e.target.value)}
                  className="form-select form-select-sm d-inline-block w-auto me-2"
                >
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveMember(m.email)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form className="mt-4" onSubmit={handleAddMember}>
        <h5>Add Member</h5>
        <div className="row g-2">
          <div className="col-md-6">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control"
              value={newMember.email}
              onChange={(e) =>
                setNewMember({ ...newMember, email: e.target.value })
              }
              required
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={newMember.role}
              onChange={(e) =>
                setNewMember({ ...newMember, role: e.target.value })
              }
            >
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-success w-100">
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectDetails;
