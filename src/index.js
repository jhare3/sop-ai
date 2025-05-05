import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // your global styles

console.log("✅ App component loaded");

const root = ReactDOM.createRoot(document.getElementById('root')); // Ensure 'root' exists in your HTML
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
