import React, { useState } from "react";
// import styled from "styled-components";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { setDoc, doc } from "firebase/firestore";
import "./Login.css";
import { useNavigate } from "react-router-dom";


const Auth = () => {
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
      setError("Invalid email or password. Please try again.");
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Willkommen zurück bei BeerReal</h2>
        <p>Bitte logge Dich ein, um fortzufahren.</p>
        
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Passwort" />
        
        <button className="login-btn">Login</button>
        
        <p className="auth-toggle">
          {isSignup ? "Bereits registriert?" : "Noch nicht dabei?"}{" "}
          <button onClick={toggleAuthMode} className="signup-btn">
            {isSignup ? "Hier einloggen" : "Hier Account erstellen"}
          </button>
        </p>
      </div>
    </div>
  );
};

  // return (
  //   <div className="login-container">
  //     {/* <div className="LoginBox"> */}
  //       <h2>Willkommen zurück bei BeerReal</h2>
  //       <p>Bitte logge Dich ein, um fortzufahren.</p>
  //       <form onSubmit={handleLogin}>
  //         <div className="input-group">
  //           <input
  //             type="email"
  //             value={email}
  //             onChange={(e) => setEmail(e.target.value)}
  //             required
  //             placeholder=" "
  //           />
  //           <label>Email</label>
  //         </div>

  //         <div className="input-group">
  //           <input
  //             type="password"
  //             value={password}
  //             onChange={(e) => setPassword(e.target.value)}
  //             required
  //             placeholder=" "
  //           />
  //           <label>Password</label>
  //         </div>
  //         <button>Login</button>
  //       </form>
  //       {/* <p className="switch-text">Don't have an account? <span>Sign Up</span></p> */}
  //       <p className="sign-up-text">Noch nicht dabei? <span>Hier Account erstellen und gemeinsam Biere zählen</span></p>
  //     </div>
  //   );
  // };

{/* 
        <form onSubmit={handleLogin}>
          <div className="input-container">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className={email ? "floating" : ""}>Email</label>
          </div>
          <div className="input-container">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label className={password ? "floating" : ""}>Password</label>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p className="switch-text">Don't have an account? <span>Sign Up</span></p>
      </div>
    </div>
  );
}; */}


export default Auth;
