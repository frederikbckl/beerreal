import React, { useState } from "react";
import styled from "styled-components";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

// Styled Components for Modern UI
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: url("https://source.unsplash.com/1600x900/?beer") center/cover no-repeat;
  color: white;
  font-family: "Poppins", sans-serif;
`;

const FormWrapper = styled.div`
  background: rgba(0, 0, 0, 0.7);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
`;

const InputField = styled.div`
  position: relative;
  margin: 20px 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #222;
  color: white;
  font-size: 16px;
  outline: none;
`;

const Label = styled.label`
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
  font-size: 16px;
  color: #aaa;
  transition: all 0.3s ease-in-out;
  pointer-events: none;

  ${({ hasValue }) =>
    hasValue &&
    `
    top: 6px;
    font-size: 12px;
    color: #f9a825;
  `}
`;

const Toggle = styled.p`
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  cursor: pointer;
  color: #f9a825;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
`;

const Button = styled.button`
  width: 100%;
  background: #f9a825;
  color: black;
  font-size: 16px;
  font-weight: bold;
  padding: 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;

  &:hover {
    background: #ffa726;
  }
`;


export default function Auth({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    try {
      setError("");
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError("⚠️ " + err.message);
    }
  };

  // // Handle Sign In / Sign Up
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");

  //   try {
  //     if (isLogin) {
  //       const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //       setUser(userCredential.user);
  //     } else {
  //       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  //       const user = userCredential.user;

  //       // ✅ Store username in Firestore
  //       await setDoc(doc(db, "users", user.uid), { name });

  //       setUser(user);
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //   }
  // };

  return (
    <Container>
      <FormWrapper>
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>

        {!isLogin && (
          <InputField>
            <Label hasValue={name !== ""}>Name</Label>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </InputField>
        )}

        <InputField>
          <Label hasValue={email !== ""}>E-Mail</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </InputField>

        <InputField>
          <Label hasValue={password !== ""}>Password</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </InputField>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button onClick={handleAuth}>{isLogin ? "Login" : "Sign Up"}</Button>
        <Toggle onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </Toggle>
      </FormWrapper>
    </Container>
  );

  // return (
  //   <div style={{ textAlign: "center", marginTop: "50px" }}>
  //     <h2>{isLogin ? "Login" : "Sign Up"}</h2>
  //     <form onSubmit={handleSubmit}>
  //       {!isLogin && (
  //         <input
  //           type="text"
  //           placeholder="Enter your name"
  //           value={name}
  //           onChange={(e) => setName(e.target.value)}
  //           required
  //         />
  //       )}
  //       <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
  //       <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
  //       <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
  //     </form>
  //     <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer", color: "blue" }}>
  //       {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
  //     </p>
  //     {error && <p style={{ color: "red" }}>{error}</p>}
  //   </div>
  // );
}

// export default Auth;
