// import './App.css';
import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./Auth";
import Signup from "./Signup";
import TabBar from "./TabBar";

function App() {
  const [user, setUser] = useState(null);
  const [beerCount, setBeerCount] = useState(0);
  const [username, setUsername] = useState("");


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user)); // Store user in localStorage

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUsername(userSnap.data().name);
        }
      } else {
        setUser(null);
        localStorage.removeItem("user"); // Remove user if logged out
      }
    });

  return () => unsubscribe();
}, []);


  useEffect(() => {
    const docRef = doc(db, "global", "beerCount");

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setBeerCount(docSnap.data().count);
      }
    });

    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once


  const containerStyle = {
    backgroundColor: "#1e1e1e",
    color: "white",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "5%",
  };

  const boxStyle = {
    backgroundColor: "#2a2a2a", // Lighter grey box
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    maxWidth: "500px",
    width: "90%", // Prevent full width stretch
  };

  const addBeer = async () => {
    if (!user) return; // Ensure user is logged in

    try {
      const docRef = doc(db, "global", "beerCount");
      const docSnap = await getDoc(docRef);
      
      let currentCount = docSnap.exists() ? docSnap.data().count : 0;
      const newCount = currentCount + 1;

      // Update Firestore first
      await setDoc(docRef, { count: newCount }, { merge: true });

      // Update local state AFTER Firestore confirms
      setBeerCount(newCount);

      // Add beer entry to Firestore
      await addDoc(collection(db, "beers"), {
        userId: user.uid,
        username: username,
        timestamp: serverTimestamp(),
        beerType: "Helles",
        photoURL: null,
        location: null,
      });
    } catch (error) {
      console.error("Error adding beer:", error);
    }
  };

  // Logout Function
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div style={{ paddingBottom: user ? "60px" : "0px" }}> {/* Prevent content from being blocked by tab bar when logged in */}
      <Routes>
        {/* Login Page */}
        <Route path="/" element={user ? (
          <div style={containerStyle}>
            <div style={boxStyle}>
              <h1>Road to One Million Beer</h1>
              <h1>{beerCount}</h1>
              <button
                onClick={addBeer}
                style={{
                  fontSize: "20px",
                  padding: "10px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "black",
                  backgroundColor: "#f5a623",
                  borderRadius: "6px",
                  border: "none"
                }}
              >
                🍺 Prost 🍺
              </button>
              <br />
              <h3>Wilkommen {username}!</h3>
              <p style={{ fontSize: "18px", fontWeight: "normal" }}>
                Danke, dass Du uns auf diesem Weg begleitest. 🍻
              </p>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: "18px",
                  marginTop: "20px",
                  background: "black",
                  color: "white",
                  borderRadius: "6px",
                  padding: "10px 20px",
                  border: "none"
                }}
              >
                Logout
              </button>
              <p style={{ fontSize: "14px", fontWeight: "normal", color: "grey", marginTop: "30px" }}>
                Biederstein Productions © 2025
              </p>
            </div>
          </div>
        ) : (
          <Auth setUser={setUser} />
        )} />

        {/* Signup Page */}
        <Route path="/signup" element={<Signup />} />
      </Routes>
      { user && <TabBar />}
    </div>
  );
}

export default App;
