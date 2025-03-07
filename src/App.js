// import './App.css';
import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./Auth";

function App() {
  const [user, setUser] = useState(null);
  const [beerCount, setBeerCount] = useState(0);

  // Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
      timestamp: serverTimestamp(),
      beerType: "Helles",
      photoURL: null,
      location: null,
    });
  };

  // const incrementBeerCount = async () => {
  //     try {
  //         const newCount = beerCount + 1;
  //         setBeerCount(newCount); // Update UI immediately

  //         // Save new count to Firestore with merge to prevent overwriting
  //         const docRef = doc(db, "global", "beerCount");
  //         await setDoc(docRef, { count: newCount }, { merge: true });

  //     } catch (error) {
  //         console.error("Error updating beer count:", error);
  //     }
  // };

  // Logout Function
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };


  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {user ? (
        <>
          <h1>🍺 Beer Counter</h1>
          <h2>{beerCount}</h2>
          <button onClick={addBeer} style={{ fontSize: "20px", padding: "10px", cursor: "pointer" }}>
            Add a Beer
          </button>
          <br />
          <button onClick={handleLogout} style={{ marginTop: "10px", background: "red", color: "white" }}>
            Logout
          </button>
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
