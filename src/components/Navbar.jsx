import React from "react";
import { SiMoneygram } from "react-icons/si";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from "react-router-dom";
import userSvg from "../assets/user.svg";

import { toast } from 'react-toastify';

function Navbar() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully!');
      navigate('/login'); // Redirect to login after successful logout
    } catch (error) {
      toast.error('Error logging out: ' + error.message);
    }
  };

  return (
    <nav className="navbar bg-body-primary bg-primary">
      <div className="container-fluid">
        <a className="navbar-brand text-white" href="#">
          <SiMoneygram />
          TrackMyFin
        </a>
        {/* Only show Logout and user info if user is logged in */}
        {user && (
          <div className="ms-auto d-flex align-items-center">
            <span style={{ marginRight: "1rem" }}>
            <img
              src={user.photoURL ? user.photoURL : userSvg}
              width={user.photoURL ? "32" : "24"}
              style={{ borderRadius: "50%" }}
            />
          </span>
          
            <button
              className="btn btn-light text-primary"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
