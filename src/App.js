// import './App.css';
import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./Auth";

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


  // Load Global Beer Count from Firestore
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

      fetchBeerCount();
  }, []);


  // Add a new beer
  const addBeer = async () => {
    if (!user) return; // Ensure user is logged in

    const newCount = beerCount + 1;
    setBeerCount(newCount);

    await setDoc(doc(db, "global", "beerCount"), { count: newCount }, { merge: true });

    await addDoc(collection(db, "beers"), {
      userId: user.uid,
      username: username,
      timestamp: serverTimestamp(),
      beerType: "Helles",
      photoURL: null,
      location: null,
    });
  };

  // Logout Function
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };


  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      {user ? (
        <>
          <h1>Nächster Halt: Eine Millionen Bier</h1>
          <h1>{beerCount}</h1>
          <button onClick={addBeer} style={{ fontSize: "20px", padding: "10px", cursor: "pointer", fontWeight: "bold", color: "black" }}>
            🍺  Prost  🍺
          </button>
          <br />
          <h3>Wilkommen {username}!</h3>
          <p style={{ fontSize: "18px", fontWeight: "normal" }}>
            Danke, dass Du uns auf diesem Weg begleitest! 🍻
          </p>
          <button onClick={handleLogout} style={{ fontSize: "18px", marginTop: "20px", background: "black", color: "white" }}>
            Logout
          </button>
          <p style={{ fontSize: "14px", fontWeight: "normal", color: "grey", marginTop: "30px" }}>
            Biederstein Productions © 2025
          </p>
        </>
      ) : (
        <Auth setUser={setUser} />
      )}
    </div>
  );
}



//   return (
//     <div style={{ textAlign: "center", margginTop: "50px" }}>
//       <h1>🍺 Beer Counter</h1>
//       <h2>{beerCount}</h2>
//       <button 
//           onClick={incrementBeerCount} 
//           style={{ fontSize: "20px", padding: "10px", cursor: "pointer" }}
//       >
//         Add a Beer
//       </button>
//     </div>
//   );

// }

export default App;
