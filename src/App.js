// import './App.css';
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function App() {
  const [beerCount, setBeerCount] = useState(0);

  useEffect(() => {
    const fetchBeerCount = async () => {
      const docRef = doc(db, "global", "beerCount");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBeerCount(docSnap.data().count);
      }
    };
    fetchBeerCount();
  }, []);

  const incrementBeerCount = async () => {
    const newCount = beerCount + 1;
    setBeerCount(newCount);
    await setDoc(doc(db, "global", "beerCount"), { count: newCount });
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
