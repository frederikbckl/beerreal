import React, { useState } from "react";
// import styled from "styled-components";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { setDoc, doc } from "firebase/firestore";
import "./Login.css";
import { useNavigate } from "react-router-dom";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/beer-counter"); // ✅ Redirect to home after login
    } catch (err) {
      setError("Falsche Anmeldedaten oder Konto existiert nicht.");
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>{isSignup ? "Neu dabei?" : "Willkommen zurück bei BeerReal"}</h2>
        <p>
          {isSignup
            ? "Bitte erstelle einen Account, um fortzufahren."
            : "Bitte logge Dich ein, um fortzufahren."}
        </p>
        <form onSubmit={handleLogin}>
          {isSignup && (
            <input
              type="text"
              placeholder="Name"
              className="input-box"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="input-box"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Passwort"
            className="input-box"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="button" type="submit">
            {isSignup ? "Sign Up" : "Login"}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="toggle-container">
          <p>{isSignup ? "Bereits registriert?" : "Noch nicht dabei?"}</p>
          <button
            className="toggle-button"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Hier einloggen" : "Hier Account erstellen"}
          </button>
        </div>
      </div>
    </div>
  );
};



//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>Willkommen zurück bei BeerReal</h2>
//         <p>Bitte logge Dich ein, um fortzufahren.</p>

//         <input type="email" placeholder="Email" />
//         <input type="password" placeholder="Passwort" />

//         <button className="login-btn">Login</button>

//         <p className="auth-toggle">
//           Noch nicht dabei?{" "}
//           <button onClick={() => navigate("/signup")} className="signup-btn">
//             Hier Account erstellen
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };

export default Login;


//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>Willkommen zurück bei BeerReal</h2>
//         <p>Bitte logge Dich ein, um fortzufahren.</p>
        
//         <input type="email" placeholder="Email" />
//         <input type="password" placeholder="Passwort" />
        
//         <button className="login-btn">Login</button>
        
//         <p className="auth-toggle">
//           {isSignup ? "Bereits registriert?" : "Noch nicht dabei?"}{" "}
//           <button onClick={toggleAuthMode} className="signup-btn">
//             {isSignup ? "Hier einloggen" : "Hier Account erstellen"}
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// };
