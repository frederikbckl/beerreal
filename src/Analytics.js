import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import "./Login.css";

const Analytics = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState("all-time");
  const [beerCount, setBeerCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userStats, setUserStats] = useState({});
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const beersRef = collection(db, "beers");
      const usersRef = collection(db, "users");
      let q;
      const now = new Date();
      const last30Days = new Date(now.setDate(now.getDate() - 30));
      const last7Days = new Date(now.setDate(now.getDate() - 7));

      if (timeframe === "all-time") {
        q = query(beersRef);
      } else if (timeframe === "30d") {
        q = query(beersRef, where("timestamp", ">", last30Days));
      } else if (timeframe === "7d") {
        q = query(beersRef, where("timestamp", ">", last7Days));
      }

      const snapshot = await getDocs(q);
      const beerCounts = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          beerCounts[data.userId] = (beerCounts[data.userId] || 0) + 1;
        }
      });

      const userIds = Object.keys(beerCounts);
      console.log("🆔 User IDs for leaderboard:", userIds);

      const userMap = {};
      for (let i = 0; i < userIds.length; i += 10) {
        const batch = userIds.slice(i, i + 10);
        const userDocs = await getDocs(query(usersRef, where("__name__", "in", batch)));

        userDocs.forEach((doc) => {
          userMap[doc.id] = doc.data().name;
        });
      }

      console.log("🔗 User Map (ID -> Name):", userMap);

      const sortedLeaderboard = Object.entries(beerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId, count], index) => ({
          rank: index + 1,
          username: userMap[userId] || "Unknown User",
          count,
        }));

      setLeaderboard(sortedLeaderboard);
    };

    fetchLeaderboard();
  }, [timeframe]);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const beersRef = collection(db, "beers");
        const usersRef = collection(db, "users");

        const beersSnapshot = await getDocs(beersRef);
        setBeerCount(beersSnapshot.size);

        const usersSnapshot = await getDocs(usersRef);
        setTotalUsers(usersSnapshot.size);
      } catch (error) {
        console.error("❌ Firestore Error: Global Stats Query Failed", error);
      }
    };

    fetchGlobalStats();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchUserStats = async () => {
      try {
        const userBeersRef = collection(db, "beers");
        const userQuery = query(userBeersRef, where("userId", "==", user.uid));

        const snapshot = await getDocs(userQuery);

        const totalBeers = snapshot.size;
        const weeklyAvg = (totalBeers / 7).toFixed(2);
        const bathtubsFilled = ((totalBeers * 0.5) / 120).toFixed(2);

        setUserStats({ totalBeers, weeklyAvg, bathtubsFilled });
      } catch (error) {
        console.error("❌ Firestore Error: User Stats Query Failed", error);
      }
    };

    fetchUserStats();
  }, [user]);

  const beersPerDay = beerCount / 30;
  const daysLeft = (1000000 - beerCount) / beersPerDay;
  const years = Math.floor(daysLeft / 365);
  const days = Math.floor(daysLeft % 365);
  const hours = Math.floor((daysLeft % 1) * 24);

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        {/* Leaderboard Header */}
        <div style={{ height: "60px" }}></div>
        <div style={styles.header}>
          <h2 style={styles.centeredTitle}>Leaderboard</h2>
          <button
            className="timeframe-btn"
            style={styles.toggleButton}
            onClick={() =>
              setTimeframe(
                timeframe === "all-time" ? "30d" : timeframe === "30d" ? "7d" : "all-time"
              )
            }
          >
            {timeframe} ▼
          </button>
        </div>

        {/* Leaderboard Table */}
        {leaderboard.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "15%" }}>Rang</th>
                <th style={{ ...styles.th, width: "50%" }}>Name</th>
                <th style={{ ...styles.th, width: "20%" }}># Biere</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={styles.centeredText}>#{entry.rank}</td>
                  <td style={styles.centeredText}>{entry.username}</td>
                  <td style={styles.centeredText}>{entry.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.noData}>No beers added yet!</p>
        )}


        {/* Global Stats */}
        <h2>Gruppenstatistik</h2>
        <p>
          Bisher wurden <strong>{beerCount}</strong> Bier getrunken. Wenn Ihr weiter in diesem Tempo trinkt, erreicht Ihr 
          eine Millionen Bier in <strong>{years} Jahren, {days} Tagen und {hours} Stunden</strong>! Zum Wohle.
        </p>
        <p>Im Durchschnitt hat jeder von euch bisher <strong>{(beerCount / totalUsers).toFixed(2)}</strong> Bier getrunken.</p>

        {/* User Stats */}
        <h2>Deine Statistik</h2>
        {userStats.totalBeers > 0 ? (
          <p>
            Du hast bisher <strong>{userStats.totalBeers}</strong> Bier beigetragen. Damit stehst du aktuell bei <strong>{userStats.weeklyAvg}</strong> Bier pro Woche. Da geht noch mehr!
            Fun Fact: Mit deinem bisherigen Konsum hättest Du bereits <strong>{userStats.bathtubsFilled}</strong> Badewannen mit Bier fülllen können. #bierbebadbarkeit
          </p>
        ) : (
          <p>Start adding beers to see your stats here!</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;

/** STYLES **/
const styles = {
  container: {
    backgroundColor: "#1e1e1e",
    color: "white",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column", // Ensures top alignment
    justifyContent: "flex-start", // aligns content from the top
    alignItems: "center",
    padding: "5%",
    paddingTop: "30px", // Prevent content from being out of reach
  },
  box: {
    backgroundColor: "#2a2a2a",
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
    maxWidth: "700px",
    width: "100%",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
    paddingTop: "15px",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "15px",
  },
  centeredTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "10px",
  },
  toggleButton: {
    background: "#f5a623",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "black",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    textAlign: "center",
  },
  th: {
    backgroundColor: "#333",
    padding: "12px",
    borderBottom: "2px solid #444",
    fontWeight: "bold",
    textAlign: "center",
  },
  centeredText: {
    padding: "12px",
    borderBottom: "1px solid #444",
    textAlign: "center",
  },
  rowEven: {
    backgroundColor: "#222",
  },
  rowOdd: {
    backgroundColor: "#2d2d2d",
  },
  noData: {
    marginTop: "10px",
    fontStyle: "italic",
    color: "gray",
  },
};

