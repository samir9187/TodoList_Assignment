import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="App-header">
      <nav>
        <Link to="/" className="nav-link">
          Home
        </Link>
        {!authState.isAuthenticated ? (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </>
        ) : (
          <button onClick={handleLogout} className="nav-link">
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
