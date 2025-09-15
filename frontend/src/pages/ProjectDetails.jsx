import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [newMember, setNewMember] = useState({ email: "", role: "Member" });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    key: "",
    description: "",
    type: "software",
  });

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
      setForm({
        name: res.data.name,
        key: res.data.key,
        description: res.data.description || "",
        type: res.data.type,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to fetch project");
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  // 🔹 Update Project
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${import.meta.env.VITE_API_URL}/projects/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Project updated ✅");
      setEditMode(false);
      fetchProject();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update project");
    }
  };

  // 🔹 Delete Project
  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Project deleted 🗑️");
      navigate("/projects");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to delete project");
    }
  };

  // 🔹 Add Member
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

  // 🔹 Update Role
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

  // 🔹 Remove Member
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
    <>
      <div className="container mt-4">
        <div className="row g-4">
          {/* Project Info */}
          <div className="col-lg-6">
            <div className="card shadow-sm p-3 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                  {project.name} ({project.key})
                </h4>
                <div>
                  <button
                    className="btn btn-outline-warning btn-sm me-2"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? "Cancel" : "Edit"}
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleDeleteProject}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {!editMode ? (
                <>
                  <p className="text-muted">{project.description}</p>
                  <p>
                    <b>Type:</b> {project.type}
                  </p>
                  <p>
                    <b>Owner:</b> {project.owner}
                  </p>
                </>
              ) : (
                <form onSubmit={handleUpdateProject}>
                  <div className="mb-2">
                    <label>Project Name</label>
                    <input
                      className="form-control"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, [e.target.name]: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label>Key</label>
                    <input
                      className="form-control"
                      type="text"
                      name="key"
                      value={form.key}
                      onChange={(e) =>
                        setForm({ ...form, [e.target.name]: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label>Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, [e.target.name]: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label>Type</label>
                    <select
                      className="form-select"
                      name="type"
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, [e.target.name]: e.target.value })
                      }
                    >
                      <option value="software">Software</option>
                      <option value="service">Service Desk</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-success w-100">
                    Save Changes
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Members */}
          <div className="col-lg-6">
            <div className="card shadow-sm p-3 h-100">
              <h5>Members</h5>
              <table className="table table-hover table-sm align-middle">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {project.members.map((m) => (
                    <tr key={m.email}>
                      <td>{m.email}</td>
                      <td>
                        <select
                          value={m.role}
                          onChange={(e) =>
                            handleRoleChange(m.email, e.target.value)
                          }
                          className="form-select form-select-sm"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveMember(m.email)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <form className="mt-3" onSubmit={handleAddMember}>
                <div className="row g-2">
                  <div className="col-md-6">
                    <input
                      type="email"
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
          </div>
        </div>
      </div>
    </>
  );

  // return (
  //   <>
  //     <div className="container mt-4">
  //       <div className="d-flex justify-content-between align-items-center mb-3">
  //         <h2>
  //           {project.name} ({project.key})
  //         </h2>
  //         <div>
  //           <button
  //             className="btn btn-outline-warning me-2"
  //             onClick={() => setEditMode(!editMode)}
  //           >
  //             {editMode ? "Cancel" : "Edit Project"}
  //           </button>
  //           <button
  //             className="btn btn-outline-danger"
  //             onClick={handleDeleteProject}
  //           >
  //             Delete Project
  //           </button>
  //         </div>
  //       </div>

  //       {!editMode ? (
  //         <>
  //           <p>{project.description}</p>
  //           <p>
  //             <b>Type:</b> {project.type}
  //           </p>
  //           <p>
  //             <b>Owner:</b> {project.owner}
  //           </p>
  //         </>
  //       ) : (
  //         <form onSubmit={handleUpdateProject} className="card p-3 shadow-sm">
  //           <div className="mb-3">
  //             <label>Project Name</label>
  //             <input
  //               className="form-control"
  //               type="text"
  //               name="name"
  //               value={form.name}
  //               onChange={(e) =>
  //                 setForm({ ...form, [e.target.name]: e.target.value })
  //               }
  //               required
  //             />
  //           </div>
  //           <div className="mb-3">
  //             <label>Project Key</label>
  //             <input
  //               className="form-control"
  //               type="text"
  //               name="key"
  //               value={form.key}
  //               onChange={(e) =>
  //                 setForm({ ...form, [e.target.name]: e.target.value })
  //               }
  //               required
  //             />
  //           </div>
  //           <div className="mb-3">
  //             <label>Description</label>
  //             <textarea
  //               className="form-control"
  //               name="description"
  //               value={form.description}
  //               onChange={(e) =>
  //                 setForm({ ...form, [e.target.name]: e.target.value })
  //               }
  //             />
  //           </div>
  //           <div className="mb-3">
  //             <label>Type</label>
  //             <select
  //               className="form-select"
  //               name="type"
  //               value={form.type}
  //               onChange={(e) =>
  //                 setForm({ ...form, [e.target.name]: e.target.value })
  //               }
  //             >
  //               <option value="software">Software</option>
  //               <option value="service">Service Desk</option>
  //             </select>
  //           </div>
  //           <button type="submit" className="btn btn-success w-100">
  //             Save Changes
  //           </button>
  //         </form>
  //       )}

  //       <hr />
  //       <h4>Members</h4>
  //       <table className="table table-striped">
  //         <thead>
  //           <tr>
  //             <th>Email</th>
  //             <th>Role</th>
  //             <th>Actions</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {project.members.map((m) => (
  //             <tr key={m.email}>
  //               <td>{m.email}</td>
  //               <td>
  //                 <select
  //                   value={m.role}
  //                   onChange={(e) => handleRoleChange(m.email, e.target.value)}
  //                   className="form-select form-select-sm d-inline-block w-auto me-2"
  //                 >
  //                   <option value="Admin">Admin</option>
  //                   <option value="Member">Member</option>
  //                   <option value="Viewer">Viewer</option>
  //                 </select>
  //               </td>
  //               <td>
  //                 <button
  //                   className="btn btn-sm btn-danger"
  //                   onClick={() => handleRemoveMember(m.email)}
  //                 >
  //                   Remove
  //                 </button>
  //               </td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>

  //       <form className="mt-4" onSubmit={handleAddMember}>
  //         <h5>Add Member</h5>
  //         <div className="row g-2">
  //           <div className="col-md-6">
  //             <input
  //               type="email"
  //               name="email"
  //               placeholder="Email"
  //               className="form-control"
  //               value={newMember.email}
  //               onChange={(e) =>
  //                 setNewMember({ ...newMember, email: e.target.value })
  //               }
  //               required
  //             />
  //           </div>
  //           <div className="col-md-4">
  //             <select
  //               className="form-select"
  //               value={newMember.role}
  //               onChange={(e) =>
  //                 setNewMember({ ...newMember, role: e.target.value })
  //               }
  //             >
  //               <option value="Admin">Admin</option>
  //               <option value="Member">Member</option>
  //               <option value="Viewer">Viewer</option>
  //             </select>
  //           </div>
  //           <div className="col-md-2">
  //             <button type="submit" className="btn btn-success w-100">
  //               Add
  //             </button>
  //           </div>
  //         </div>
  //       </form>
  //     </div>
  //   </>
  // );
};

export default ProjectDetails;
