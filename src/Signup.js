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
  const [error, setError] = useState("");


  const handleSignup = async () => {
    // e.preventDefault();

    // Regular Expression: Only allows letters, numbers, underscores, and dashes (3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    
    if (!usernameRegex.test(name)) {
      setError("Der Benutzername darf nur Buchstaben, Zahlen, Unterstriche oder Bindestriche enthalten und muss 3-20 Zeichen lang sein.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save the user's name in Firestore
      await setDoc(doc(db, "users", user.uid), { name, email });

      // setUser(user)
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

        {error && <p className="error-text">{error}</p>} {/* ✅ Show error messages */}

        <p className="switch-text">Bereits am Biere zählen?</p>
        <button className="switch-button" onClick={() => navigate("/")}>Hier einloggen</button>

      </div>
    </div>
  );
};

export default Signup;
