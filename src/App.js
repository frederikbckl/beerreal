// import './App.css';
import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./Auth";
import Signup from "./Signup";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);
  const [beerCount, setBeerCount] = useState(0);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user)); // ✅ Store user in localStorage

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUsername(userSnap.data().name);
        }
      } else {
        setUser(null);
        localStorage.removeItem("user"); // ❌ Remove user if logged out
      }
    });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    const fetchBeerCount = async () => {
      try {
        const docRef = doc(db, "global", "beerCount");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBeerCount(docSnap.data().count); // Load count from Firestore
        } else {
          console.log("No document found. Initializing beerCount to 0.");
          await setDoc(docRef, { count: 0 }, { merge: true }); // Initialize if missing
          setBeerCount(0);
        }
      } catch (error) {
        console.error("Error fetching beer count:", error);
      }
    };

    // Fetch beer count initially and set up Firestore listener
    fetchBeerCount();

    // Listen for real-time updates
    const unsubscribe = onSnapshot(doc(db, "global", "beerCount"), (doc) => {
      if (doc.exists()) {
        setBeerCount(doc.data().count);
      }
    });

    return () => unsubscribe();
  }, []);


  // Load Global Beer Count from Firestore
  // useEffect(() => {
  //     const fetchBeerCount = async () => {
  //         try {
  //             const docRef = doc(db, "global", "beerCount");
  //             const docSnap = await getDoc(docRef);

  //             if (docSnap.exists()) {
  //                 setBeerCount(docSnap.data().count); // Load count from Firestore
  //             } else {
  //                 console.log("No document found. Initializing beerCount to 0.");
  //                 await setDoc(docRef, { count: 0 }, { merge: true }); // Initialize if missing
  //                 setBeerCount(0);
  //             }
  //         } catch (error) {
  //             console.error("Error fetching beer count:", error);
  //         }
  //     };

  //     fetchBeerCount();
  // }, []);

  const containerStyle = {
    backgroundColor: "#1e1e1e",
    color: "white",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  // Add a new beer
  const addBeer = async () => {
    if (!user) return; // Ensure user is logged in

    try {
      const docRef = doc(db, "global", "beerCount");
      const docSnap = await getDoc(docRef);

      let newCount = 1; // Default if document doesn't exist

      if (docSnap.exists()) {
        newCount = docSnap.data().count + 1;
      }

      // Update Firestore first before updating local state
      await setDoc(docRef, { count: newCount }, { merge: true });

      // ✅ Fetch the updated count to ensure UI is always in sync
      setBeerCount(newCount);

      // ✅ Log Firestore update for debugging
      console.log("Beer added. New count:", newCount);

      // Log the beer entry in Firestore
      await addDoc(collection(db, "beers"), {
        userId: user.uid,
        username: username || "Unknown",
        timestamp: serverTimestamp(),
        beerType: "Helles",
        photoURL: null,
        location: null,
      });

    } catch (error) {
      console.error("Error adding beer:", error);
    }
  };




  //   const newCount = beerCount + 1;
  //   setBeerCount(newCount);

  //   await setDoc(doc(db, "global", "beerCount"), { count: newCount }, { merge: true });

  //   await addDoc(collection(db, "beers"), {
  //     userId: user.uid,
  //     username: username,
  //     timestamp: serverTimestamp(),
  //     beerType: "Helles",
  //     photoURL: null,
  //     location: null,
  //   });
  // };

  // Logout Function
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <Routes>
      {/* Login Page */}
      <Route path="/" element={user ? (
        <div style={{ textAlign: "center", marginTop: "80px" }}>
          <h1>Road to One Million Beer</h1>
          <h1>{beerCount}</h1>
          <button
            onClick={() => setBeerCount(beerCount + 1)}
            style={{ fontSize: "20px", padding: "10px", cursor: "pointer", fontWeight: "bold", color: "white" }}
          >
            🍺 Prost 🍺
          </button>
          <br />
          <h3>Wilkommen {username}!</h3>
          <p style={{ fontSize: "18px", fontWeight: "normal" }}>
            Danke, dass Du uns auf diesem Weg begleitest. 🍻
          </p>
          <button
            onClick={() => setUser(null)}
            style={{ fontSize: "18px", marginTop: "20px", background: "black", color: "white" }}
          >
            Logout
          </button>
          <p style={{ fontSize: "14px", fontWeight: "normal", color: "grey", marginTop: "30px" }}>
            Biederstein Productions © 2025
          </p>
        </div>
      ) : (
        <Auth setUser={setUser} />
      )} />

      {/* Signup Page */}
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default App;
