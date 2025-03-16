import React, { useState } from "react";
// import styled from "styled-components";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { setDoc, doc } from "firebase/firestore";
import "./Login.css";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Auth = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only used for signup
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔍 Debugging Firebase Connection
  console.log("Firebase Auth Object:", auth);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    try {
      let userCredential;
      if (isSignup) {
        // Regular Expression: Only allows letters, numbers, underscores, and dashes (3-20 chars)
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        
        if (!usernameRegex.test(name)) {
          setError("Der Benutzername darf nur Buchstaben, Zahlen, Unterstriche oder Bindestriche enthalten und muss 3-20 Zeichen lang sein.");
          return;
        }


        // SIGNUP: Create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save the user's name in Firestore
        await setDoc(doc(db, "users", user.uid), { name, email });

        setUser(user)
        alert("Account erstellt! Du kannst dich jetzt einloggen.");
        navigate("/"); // Redirect to login page
        
        // userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Signup Successful:", userCredential);
      } else {
        // LOGIN: Sign in with Firebase
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login Successful:", userCredential);
      }

      setUser(userCredential.user);
      navigate("/"); // Redirect to home
    } catch (error) {
      console.error("Authentication Error:", error.message);
      setError(error.message);

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        alert("Falsche Anmeldedaten oder Konto existiert nicht.");
      } else if (error.code === "auth/network-request-failed") {
        alert("Keine Internetverbindung. Überprüfe deine Netzwerkverbindung.");
      } else {
        alert("Fehler: " + error.message);
      }
    }
  };

    return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">
          {isSignup ? "Neu dabei?" : "Willkommen zurück bei BeerReal"}
        </h1>
        <p className="auth-subtitle">
          {isSignup ? "Bitte erstelle einen Account, um fortzufahren." : "Bitte logge Dich ein, um fortzufahren."}
        </p>

        <form onSubmit={handleAuth}>
          {isSignup && (
            <div className="input-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" " // Ensures floating label works
                required
              />
              <label>Name</label>
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" " // Ensures floating label works
              required
            />
            <label>Email</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
            />
            <label>Passwort</label>
          </div>

          <button className="auth-button" type="submit">
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        <p className="switch-text">{isSignup ? "Bereits registriert?" : "Noch nicht dabei?"}</p>
        <button className="switch-button" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? "Hier einloggen" : "Hier Account erstellen"}
        </button>
      </div>
    </div>
  );
};

export default Auth;