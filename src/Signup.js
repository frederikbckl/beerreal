import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase"; // Make sure the path is correct
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import "./Login.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save the user's name in Firestore
      await setDoc(doc(db, "users", user.uid), { name, email });

      alert("Account erstellt! Du kannst dich jetzt einloggen.");
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Fehler bei der Registrierung:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">Willkommen bei BeerReal!</h1>
        <p className="auth-subtitle">Neu dabei? Bitte erstelle einen Account, um fortzufahren.</p>
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>Name</label>
            <input
              type="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="login-btn" onClick={handleSignup}>
            Sign Up
          </button>
        </form>
        <p className="switch-text">Hier Account erstellen</p>
        <button className="switch-button" onClick={() => navigate("/login")}>Noch nicht dabei?</button>

        {/* <button className="login-btn" onClick={handleSignup}>Sign Up</button>

        <p className="auth-toggle">
          Bereits registriert?{" "}
          <button onClick={() => navigate("/")} className="signup-btn">
            Hier einloggen
          </button>
        </p> */}
      </div>
    </div>
  );
};

export default Signup;
