import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMe();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2>Dashboard</h2>
        {user ? (
          <div>
            <p>
              <b>Username:</b> {user.username}
            </p>
            <p>
              <b>Email:</b> {user.email}
            </p>
          </div>
        ) : (
          <p>Loading user info...</p>
        )}
      </div>
    </>
  );
};

export default Dashboard;
