import React, { useState } from "react";
import styled from "styled-components";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import "./Login.css";
import { useNavigate } from "react-router-dom";


const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="login-container">
      {/* <div className="LoginBox"> */}
        <h2>Willkommen zurück bei BeerReal</h2>
        <p>Bitte logge Dich ein, um fortzufahren.</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
            />
            <label>Email</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
            />
            <label>Password</label>
          </div>
          <button>Login</button>
        </form>
        {/* <p className="switch-text">Don't have an account? <span>Sign Up</span></p> */}
        <p className="sign-up-text">Noch nicht dabei? <span>Hier Account erstellen und gemeinsam Biere zählen</span></p>
      </div>
    );
  };

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


//         <InputContainer>
//           <Input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder=" "
//           />
//           <FloatingLabel>Email</FloatingLabel>
//         </InputContainer>
//         <InputContainer>
//           <Input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder=" "
//           />
//           <FloatingLabel>Password</FloatingLabel>
//         </InputContainer>
//         <Button>Login</Button>
//         <ToggleText>Don't have an account? Sign Up</ToggleText>
//       </LoginBox>
//     </LoginContainer>
//   );
// };

export default Auth;


// export default function Auth({ setUser }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [name, setName] = useState("");
//   const [isLogin, setIsLogin] = useState(true);
//   const [error, setError] = useState("");

//   const handleAuth = async () => {
//     try {
//       setError("");
//       if (isLogin) {
//         await signInWithEmailAndPassword(auth, email, password);
//       } else {
//         await createUserWithEmailAndPassword(auth, email, password);
//       }
//     } catch (err) {
//       setError("⚠️ " + err.message);
//     }
//   };


//   return (
//     <Container>
//       <FormWrapper>
//         <h2>{isLogin ? "Login" : "Sign Up"}</h2>

//         {!isLogin && (
//           <InputField>
//             <Label hasValue={name !== ""}>Name</Label>
//             <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
//           </InputField>
//         )}

//         <InputField>
//           <Label hasValue={email !== ""}>E-Mail</Label>
//           <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
//         </InputField>

//         <InputField>
//           <Label hasValue={password !== ""}>Password</Label>
//           <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
//         </InputField>

//         {error && <ErrorMessage>{error}</ErrorMessage>}

//         <Button onClick={handleAuth}>{isLogin ? "Login" : "Sign Up"}</Button>
//         <Toggle onClick={() => setIsLogin(!isLogin)}>
//           {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
//         </Toggle>
//       </FormWrapper>
//     </Container>
//   );
// }

// export default Auth;
