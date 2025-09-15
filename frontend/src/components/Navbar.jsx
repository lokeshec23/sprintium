import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("token");
      //   toast.success("Logged out successfully ✅");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Logout failed ⚠️");
    }
  };

  return (
    <nav className="navbar navbar-light bg-light shadow-sm">
      <div className="container-fluid d-flex justify-content-between">
        <span className="navbar-brand mb-0 h1">Sprintium</span>
        <button onClick={handleLogout} className="btn btn-outline-danger">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
