import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Projects</h2>
        <Link to="/projects/new" className="btn btn-primary">
          + Create Project
        </Link>
      </div>
      {projects.length === 0 ? (
        <p>No projects yet. Create one to get started.</p>
      ) : (
        <div className="row">
          {projects.map((p) => (
            <div key={p.id} className="col-md-4 mb-3">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{p.key}</h6>
                  <p className="card-text">{p.description}</p>
                  <Link
                    to={`/projects/${p.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
