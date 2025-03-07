// import './App.css';
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function App() {
  const [beerCount, setBeerCount] = useState(0);

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

  const incrementBeerCount = async () => {
      try {
          const newCount = beerCount + 1;
          setBeerCount(newCount); // Update UI immediately

          // Save new count to Firestore with merge to prevent overwriting
          const docRef = doc(db, "global", "beerCount");
          await setDoc(docRef, { count: newCount }, { merge: true });

      } catch (error) {
          console.error("Error updating beer count:", error);
      }
  };

  return (
    <div style={{ textAlign: "center", margginTop: "50px" }}>
      <h1>🍺 Beer Counter</h1>
      <h2>{beerCount}</h2>
      <button 
          onClick={incrementBeerCount} 
          style={{ fontSize: "20px", padding: "10px", cursor: "pointer" }}
      >
        Add a Beer
      </button>
    </div>
  );

}

export default App;
