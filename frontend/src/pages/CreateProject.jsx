import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CreateProject = () => {
  const [form, setForm] = useState({
    name: "",
    key: "",
    description: "",
    type: "software",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL}/projects`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Project created successfully ✅");
      navigate("/projects");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to create project");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "500px" }}
      >
        <h3 className="text-center mb-4">Create Project</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Project Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>Project Key</label>
            <input
              type="text"
              name="key"
              className="form-control"
              value={form.key}
              onChange={handleChange}
              required
            />
            <small className="text-muted">Short code (e.g., SPR)</small>
          </div>
          <div className="mb-3">
            <label>Description</label>
            <textarea
              name="description"
              className="form-control"
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label>Type</label>
            <select
              name="type"
              className="form-control"
              value={form.type}
              onChange={handleChange}
            >
              <option value="software">Software</option>
              <option value="service">Service Desk</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success w-100">
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
