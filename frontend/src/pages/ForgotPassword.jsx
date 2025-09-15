import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        { email }
      );
      setResetToken(res.data.reset_token); // temp: show token
      toast.success("Reset link generated (check console or email)");
      console.log("Reset token:", res.data.reset_token);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to request reset");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h3 className="text-center mb-4">Forgot Password</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100" type="submit">
            Request Reset
          </button>
        </form>
        {resetToken && (
          <p className="mt-3 text-muted small">
            Dev Mode: Token logged in console
          </p>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
