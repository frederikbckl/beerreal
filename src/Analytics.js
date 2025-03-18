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
        <div style={styles.header}>
          <h2 style={styles.title}>Leaderboard</h2>
          <button className="timeframe-btn" style={styles.toggleButton} onClick={() => setTimeframe(timeframe === "all-time" ? "30d" : timeframe === "30d" ? "7d" : "all-time")}>
            {timeframe} ▼
          </button>
        </div>

        {/* Leaderboard Table */}
        {leaderboard.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: "50px" }}>Rank</th>
                <th style={{ ...styles.th, width: "350px" }}>User</th>
                <th style={{ ...styles.th, width: "80px" }}>Beers</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  <td style={styles.td}>#{entry.rank}</td>
                  <td style={styles.td}>{entry.username}</td>
                  <td style={styles.td}>{entry.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.noData}>No beers added yet!</p>
        )}



        {/* Global Stats */}
        <h2>Global Stats</h2>
        <p>
          <strong>{beerCount}</strong> beers have been added in total. If your group keeps drinking at this pace, you'll reach{" "}
          <strong>one million beers in {years} years, {days} days, and {hours} hours</strong>!
        </p>
        <p>On average, each user has added <strong>{(beerCount / totalUsers).toFixed(2)}</strong> beers.</p>

        {/* User Stats */}
        <h2>Your Stats</h2>
        {userStats.totalBeers > 0 ? (
          <p>
            You've contributed <strong>{userStats.totalBeers}</strong> beers! This means you drink around <strong>{userStats.weeklyAvg}</strong> beers per week.
            With your beer consumption, you could have filled <strong>{userStats.bathtubsFilled}</strong> bathtubs!
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
    justifyContent: "center",
    alignItems: "center",
    padding: "5%",
  },
  box: {
    backgroundColor: "#2a2a2a",
    padding: "30px",
    borderRadius: "12px",
    textAlign: "center",
    maxWidth: "700px",
    width: "100%",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
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
};





// import React, { useState, useEffect } from "react";
// import { db } from "./firebase";
// import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
// import "./Login.css";

// const Analytics = ({ user }) => {
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [timeframe, setTimeframe] = useState("all-time");
//   const [beerCount, setBeerCount] = useState(0);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [userStats, setUserStats] = useState({});
//   const [userMap, setUserMap] = useState({});

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       const beersRef = collection(db, "beers");
//       const usersRef = collection(db, "users");
//       let q;
//       const now = new Date();
//       const last30Days = new Date(now.setDate(now.getDate() - 30));
//       const last7Days = new Date(now.setDate(now.getDate() - 7));

//       if (timeframe === "all-time") {
//         q = query(beersRef);
//       } else if (timeframe === "30d") {
//         q = query(beersRef, where("timestamp", ">", last30Days));
//       } else if (timeframe === "7d") {
//         q = query(beersRef, where("timestamp", ">", last7Days));
//       }

//       const snapshot = await getDocs(q);
//       const beerCounts = {};

//       snapshot.forEach((doc) => {
//         const data = doc.data();
//         if (data.userId) {
//           beerCounts[data.userId] = (beerCounts[data.userId] || 0) + 1;
//         }
//       });

//       const userIds = Object.keys(beerCounts);
//       console.log("🆔 User IDs for leaderboard:", userIds);

//       const userMap = {};
//       for (let i = 0; i < userIds.length; i += 10) {
//         const batch = userIds.slice(i, i + 10);
//         const userDocs = await getDocs(query(usersRef, where("__name__", "in", batch)));

//         userDocs.forEach((doc) => {
//           userMap[doc.id] = doc.data().name;
//         });
//       }

//       console.log("🔗 User Map (ID -> Name):", userMap);

//       const sortedLeaderboard = Object.entries(beerCounts)
//         .sort(([, a], [, b]) => b - a)
//         .slice(0, 5)
//         .map(([userId, count], index) => ({
//           rank: index + 1,
//           username: userMap[userId] || "Unknown User",
//           count,
//         }));

//       setLeaderboard(sortedLeaderboard);
//     };

//     fetchLeaderboard();
//   }, [timeframe]);

//   useEffect(() => {
//     const fetchGlobalStats = async () => {
//       try {
//         const beersRef = collection(db, "beers");
//         const usersRef = collection(db, "users");

//         const beersSnapshot = await getDocs(beersRef);
//         setBeerCount(beersSnapshot.size);

//         const usersSnapshot = await getDocs(usersRef);
//         setTotalUsers(usersSnapshot.size);
//       } catch (error) {
//         console.error("❌ Firestore Error: Global Stats Query Failed", error);
//       }
//     };

//     fetchGlobalStats();
//   }, []);

//   useEffect(() => {
//     if (!user) return;

//     const fetchUserStats = async () => {
//       try {
//         const userBeersRef = collection(db, "beers");
//         const userQuery = query(userBeersRef, where("userId", "==", user.uid));

//         const snapshot = await getDocs(userQuery);

//         const totalBeers = snapshot.size;
//         const weeklyAvg = (totalBeers / 7).toFixed(2);
//         const bathtubsFilled = ((totalBeers * 0.5) / 120).toFixed(2);

//         setUserStats({ totalBeers, weeklyAvg, bathtubsFilled });
//       } catch (error) {
//         console.error("❌ Firestore Error: User Stats Query Failed", error);
//       }
//     };

//     fetchUserStats();
//   }, [user]);

//   const beersPerDay = beerCount / 30;
//   const daysLeft = (1000000 - beerCount) / beersPerDay;
//   const years = Math.floor(daysLeft / 365);
//   const days = Math.floor(daysLeft % 365);
//   const hours = Math.floor((daysLeft % 1) * 24);

//   return (
//     <div style={styles.container}>
//       <div style={styles.box}>
//         {/* Leaderboard Header */}
//         <div style={styles.header}>
//           <h2 style={styles.title}>Leaderboard</h2>
//           <button className="timeframe-btn" style={styles.toggleButton} onClick={() => setTimeframe(timeframe === "all-time" ? "30d" : timeframe === "30d" ? "7d" : "all-time")}>
//             {timeframe} ▼
//           </button>
//         </div>

//         {/* Leaderboard Table */}
//         {leaderboard.length > 0 ? (
//           <table style={styles.table}>
//             <thead>
//               <tr>
//                 <th style={styles.th}>Rank</th>
//                 <th style={{ ...styles.th, width: "50%" }}>User</th>
//                 <th style={styles.th}>Beers</th>
//               </tr>
//             </thead>
//             <tbody>
//               {leaderboard.map((entry, index) => (
//                 <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
//                   <td style={styles.td}>#{entry.rank}</td>
//                   <td style={styles.td}>{entry.username}</td>
//                   <td style={styles.td}>{entry.count}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p style={styles.noData}>No beers added yet!</p>
//         )}

//         {/* Global Stats */}
//         <h2>Global Stats</h2>
//         <p>
//           <strong>{beerCount}</strong> beers have been added in total. If your group keeps drinking at this pace, you'll reach{" "}
//           <strong>one million beers in {years} years, {days} days, and {hours} hours</strong>!
//         </p>
//         <p>On average, each user has added <strong>{(beerCount / totalUsers).toFixed(2)}</strong> beers.</p>

//         {/* User Stats */}
//         <h2>Your Stats</h2>
//         {userStats.totalBeers > 0 ? (
//           <p>
//             You've contributed <strong>{userStats.totalBeers}</strong> beers! This means you drink around <strong>{userStats.weeklyAvg}</strong> beers per week.
//             With your beer consumption, you could have filled <strong>{userStats.bathtubsFilled}</strong> bathtubs!
//           </p>
//         ) : (
//           <p>Start adding beers to see your stats here!</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Analytics;

// /** STYLES **/
// const styles = {
//   container: {
//     backgroundColor: "#1e1e1e",
//     color: "white",
//     minHeight: "100vh",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: "5%",
//   },
//   box: {
//     backgroundColor: "#2a2a2a",
//     padding: "30px",
//     borderRadius: "12px",
//     textAlign: "center",
//     maxWidth: "700px",
//     width: "100%",
//     boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
//   },
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "15px",
//   },
//   title: {
//     fontSize: "22px",
//     fontWeight: "bold",
//   },
//   toggleButton: {
//     background: "#f5a623",
//     border: "none",
//     padding: "5px 10px",
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontWeight: "bold",
//     color: "black",
//   },
// };
















// import React, { useState, useEffect } from "react";
// import { db } from "./firebase";
// import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
// import "./Login.css";


// const Analytics = ({ user }) => {
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [timeframe, setTimeframe] = useState("all-time");
//   const [beerCount, setBeerCount] = useState(0);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [userStats, setUserStats] = useState({});
//     const [userMap, setUserMap] = useState({});
//   const [chartData, setChartData] = useState(null);

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       const beersRef = collection(db, "beers");
//       const usersRef = collection(db, "users");
//       let q;
//       const now = new Date();
//       const last30Days = new Date(now.setDate(now.getDate() - 30));
//       const last7Days = new Date(now.setDate(now.getDate() - 7));

//       if (timeframe === "all-time") {
//         q = query(beersRef);
//       } else if (timeframe === "30d") {
//         q = query(beersRef, where("timestamp", ">", last30Days));
//       } else if (timeframe === "7d") {
//         q = query(beersRef, where("timestamp", ">", last7Days));
//       }

//       const snapshot = await getDocs(q);
//       const beerCounts = {};

//       snapshot.forEach((doc) => {
//         const data = doc.data();
//         if (data.userId) {
//           beerCounts[data.userId] = (beerCounts[data.userId] || 0) + 1;
//         }
//       });

//       const userIds = Object.keys(beerCounts);
//       console.log("🆔 User IDs for leaderboard:", userIds);


//       const userMap = {};
//       for (let i = 0; i < userIds.length; i += 10) {
//         const batch = userIds.slice(i, i + 10); // Split into chunks of 10
//         const userDocs = await getDocs(query(usersRef, where("__name__", "in", batch)));

//         userDocs.forEach((doc) => {
//           userMap[doc.id] = doc.data().name; // Store username by userId
//         });
//       }

//       console.log("🔗 User Map (ID -> Name):", userMap);


//       const sortedLeaderboard = Object.entries(beerCounts)
//         .sort(([, a], [, b]) => b - a)
//         .slice(0, 5)
//         .map(([userId, count], index) => ({
//           rank: index + 1,
//           username: userMap[userId] || "Unknown User",
//           count,
//         }));

//       setLeaderboard(sortedLeaderboard);
//     };

//     fetchLeaderboard();
//   }, [timeframe]);

//   useEffect(() => {
//     const fetchGlobalStats = async () => {
//       console.log("Fetching global beer count...");
//       try {
//         const beersRef = collection(db, "beers");
//         const usersRef = collection(db, "users");

//         console.log("Fetching global beer count...");
//         const beersSnapshot = await getDocs(beersRef);
//         setBeerCount(beersSnapshot.size);
//         console.log("✅ Beer count fetched:", beersSnapshot.size);

//         console.log("Fetching total user count...");
//         const usersSnapshot = await getDocs(usersRef);
//         setTotalUsers(usersSnapshot.size);
//         console.log("✅ Total users fetched:", usersSnapshot.size);
//       } catch (error) {
//         console.error("❌ Firestore Error: Global Stats Query Failed", error);
//       }
//     };

//     fetchGlobalStats();
//   }, []);

//   // Fetch user's personal stats
//   useEffect(() => {
//     if (!user) return;

//     const fetchUserStats = async () => {
//       try {
//         const userBeersRef = collection(db, "beers");
//         const userQuery = query(userBeersRef, where("userId", "==", user.uid));

//         console.log(`Fetching personal beer stats for user: ${user.uid}`);
//         const snapshot = await getDocs(userQuery);
//         console.log("✅ User beer stats fetched:", snapshot.size);

//         const totalBeers = snapshot.size;
//         const weeklyAvg = (totalBeers / 7).toFixed(2);
//         const bathtubsFilled = ((totalBeers * 0.5) / 120).toFixed(2);

//         setUserStats({ totalBeers, weeklyAvg, bathtubsFilled });
//       } catch (error) {
//         console.error("❌ Firestore Error: User Stats Query Failed", error);
//       }
//     };

//     fetchUserStats();
//   }, [user]);

//   // Estimate time to 1 million beers
//   const beersPerDay = beerCount / 30;
//   const daysLeft = (1000000 - beerCount) / beersPerDay;
//   const years = Math.floor(daysLeft / 365);
//   const days = Math.floor(daysLeft % 365);
//   const hours = Math.floor((daysLeft % 1) * 24);

//   return (
//     <div style={styles.container}>
//       <div style={styles.box}>
//         {/* Header */}
//         <div style={styles.header}>
//           <h2 style={styles.title}>Leaderboard</h2>
//           <button className="timeframe-btn" onClick={() => setTimeframe(timeframe === "all-time" ? "30d" : timeframe === "30d" ? "7d" : "all-time")}>
//             {timeframe} ▼
//           </button>
//         </div>

//         {/* Leaderboard Table */}
//         {leaderboard.length > 0 ? (
//           <table style={styles.table}>
//             <thead>
//               <tr>
//                 <th style={styles.th}>Rank</th>
//                 <th style={styles.th}>User</th>
//                 <th style={styles.th}>Beers</th>
//               </tr>
//             </thead>
//             <tbody>
//               {leaderboard.map((entry, index) => (
//                 <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
//                   <td style={styles.td}>#{entry.rank}</td>
//                   <td style={styles.td}>{entry.username}</td>
//                   <td style={styles.td}>{entry.count}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <p style={styles.noData}>No beers added yet!</p>
//         )}
//         <h2>Global Stats</h2>
//         <p>Total Beers: {beerCount}</p>
//         <p>Time to 1M: {years} years, {days} days, {hours} hours</p>
//         <p>Avg Beers/User: {(beerCount / totalUsers).toFixed(2)}</p>

//         <h2>Your Stats</h2>
//         <p>Total Beers: {userStats.totalBeers || 0}</p>
//         <p>Beers per Week: {userStats.weeklyAvg || 0}</p>
//         <p>Bathtubs Filled: {userStats.bathtubsFilled || 0}</p>

//       </div>
//     </div>
//   );
// };

// export default Analytics;

// /** STYLES **/
// const styles = {
//   container: {
//     backgroundColor: "#1e1e1e",
//     color: "white",
//     minHeight: "100vh",
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: "5%",
//   },
//   box: {
//     backgroundColor: "#2a2a2a",
//     padding: "30px",
//     borderRadius: "12px",
//     textAlign: "center",
//     maxWidth: "600px",
//     width: "100%",
//     boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
//   },
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "15px",
//   },
//   title: {
//     fontSize: "22px",
//     fontWeight: "bold",
//   },
//   toggleButton: {
//     background: "#f5a623",
//     border: "none",
//     padding: "8px 16px",
//     borderRadius: "6px",
//     cursor: "pointer",
//     fontWeight: "bold",
//     color: "black",
//   },
//   table: {
//     width: "100%",
//     borderCollapse: "collapse",
//     marginTop: "10px",
//   },
//   th: {
//     backgroundColor: "#333",
//     padding: "10px",
//     borderBottom: "2px solid #444",
//     fontWeight: "bold",
//   },
//   td: {
//     padding: "10px",
//     borderBottom: "1px solid #444",
//     textAlign: "center",
//   },
//   rowEven: {
//     backgroundColor: "#222",
//   },
//   rowOdd: {
//     backgroundColor: "#2d2d2d",
//   },
//   noData: {
//     marginTop: "10px",
//     fontStyle: "italic",
//     color: "gray",
//   },
// };

