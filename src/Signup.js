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
        <h2>Neu dabei?</h2>
        <p>Bitte erstelle einen Account, um fortzufahren.</p>

        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="login-btn" onClick={handleSignup}>Sign Up</button>

        <p className="auth-toggle">
          Bereits registriert?{" "}
          <button onClick={() => navigate("/")} className="signup-btn">
            Hier einloggen
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
