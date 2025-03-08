import React, { useState } from "react";
import styled from "styled-components";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

// Styled Components for Modern UI
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url("/beer-bg.jpg") no-repeat center center;
  background-size: cover;
  padding: 20px;
`;

const LoginBox = styled.div`
  background: rgba(0, 0, 0, 0.8);
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Title = styled.h2`
  color: white;
  margin-bottom: 20px;
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const FloatingLabel = styled.label`
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 14px;
  color: #bbb;
  transition: all 0.3s;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.8);
  padding: 2px 5px;
`;

const Input = styled.input`
  width: calc(100% - 24px);
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #222;
  color: white;
  font-size: 16px;
  outline: none;
  &:focus + ${FloatingLabel}, &:not(:placeholder-shown) + ${FloatingLabel} {
    top: -8px;
    font-size: 12px;
    color: orange;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: orange;
  color: black;
  font-size: 18px;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background: darkorange;
  }
`;

const ToggleText = styled.p`
  margin-top: 15px;
  font-size: 14px;
  color: lightgray;
  cursor: pointer;
  &:hover {
    color: orange;
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <LoginContainer>
      <LoginBox>
        <Title>Login</Title>
        <InputContainer>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
          />
          <FloatingLabel>Email</FloatingLabel>
        </InputContainer>
        <InputContainer>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
          />
          <FloatingLabel>Password</FloatingLabel>
        </InputContainer>
        <Button>Login</Button>
        <ToggleText>Don't have an account? Sign Up</ToggleText>
      </LoginBox>
    </LoginContainer>
  );
};

export default Login;


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
