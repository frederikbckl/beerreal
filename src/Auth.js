import React, { useState } from "react";
// import styled from "styled-components";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// import { setDoc, doc } from "firebase/firestore";
import "./Login.css";
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
        // SIGNUP: Create user in Firebase
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
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


  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     // Simulate authentication (Replace with Firebase Auth logic)
  //     if (email === "test@example.com" && password === "password") {
  //       setUser({ email });
  //       navigate("/beer-counter");
  //     } else {
  //       alert("Falsche Anmeldedaten oder Konto existiert nicht.");
  //     }
  //   } catch (error) {
  //     console.error("Login failed", error);
  //   }
  // };

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   try {
  //     await signInWithEmailAndPassword(auth, email, password);
  //     navigate("/beer-counter"); // ✅ Redirect to home after login
  //   } catch (err) {
  //     setError("Falsche Anmeldedaten oder Konto existiert nicht.");
  //   }
  // };

  // const toggleAuthMode = () => {
  //   setIsSignup(!isSignup);
  // };

//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h1 className="auth-title">Willkommen zurück bei BeerReal</h1>
//         <p className="auth-subtitle">Bitte logge Dich ein, um fortzufahren.</p>
//         <form onSubmit={handleLogin}>
//           <div className="input-group">
//             <label>Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
//           <div className="input-group">
//             <label>Passwort</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button className="auth-button" type="submit">
//             Login
//           </button>
//         </form>
//         <p className="switch-text">Noch nicht dabei?</p>
//         <button className="switch-button" onClick={() => navigate("/signup")}>Hier Account erstellen</button>
//       </div>
//     </div>
//   );
// };


//   return (
//     <div className="auth-container">
//       <div className="auth-box">
//         <h2>{isSignup ? "Neu dabei?" : "Willkommen zurück bei BeerReal"}</h2>
//         <p>
//           {isSignup
//             ? "Bitte erstelle einen Account, um fortzufahren."
//             : "Bitte logge Dich ein, um fortzufahren."}
//         </p>
//         <form onSubmit={handleLogin}>
//           {isSignup && (
//             <input
//               type="text"
//               placeholder="Name"
//               className="input-box"
//             />
//           )}
//           <input
//             type="email"
//             placeholder="Email"
//             className="input-box"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <input
//             type="password"
//             placeholder="Passwort"
//             className="input-box"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button className="button" type="submit">
//             {isSignup ? "Sign Up" : "Login"}
//           </button>
//           {error && <p className="error-message">{error}</p>}
//         </form>
//         <div className="toggle-container">
//           <p>{isSignup ? "Bereits registriert?" : "Noch nicht dabei?"}</p>
//           <button
//             className="toggle-button"
//             onClick={() => setIsSignup(!isSignup)}
//           >
//             {isSignup ? "Hier einloggen" : "Hier Account erstellen"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };


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

export default Auth;


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
