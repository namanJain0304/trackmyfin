import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from './App.jsx'
import ReactDOM from "react-dom/client";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
      <ToastContainer />
    <App />
  </React.StrictMode>
);