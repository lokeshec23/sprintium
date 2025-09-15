import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [form, setForm] = useState({ token: "", new_password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        form
      );
      toast.success("Password reset successful ✅");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to reset password");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4">Reset Password</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Reset Token</label>
            <input
              className="form-control"
              type="text"
              name="token"
              value={form.token}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label>New Password</label>
            <input
              className="form-control"
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn btn-success w-100" type="submit">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
