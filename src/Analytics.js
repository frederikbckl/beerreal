import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Title } from "chart.js";

// Register chart elements
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title);

const Analytics = ({ user }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState("all-time");
  const [beerCount, setBeerCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [userStats, setUserStats] = useState({});
  const [chartData, setChartData] = useState(null);

  // Fetch leaderboard data
// Fetch leaderboard data and include usernames

useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      console.log("📢 Fetching leaderboard data...");
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

      console.log(`📡 Firestore Query Executed: ${timeframe}`);
      console.log("Fetching data from Firestore...");

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn("⚠️ No beers found in Firestore!");
        setLeaderboard([]); // Clear leaderboard if no data
        return;
      }

      console.log("✅ Beers found in Firestore:", snapshot.docs.map(doc => doc.data()));

      // Step 1: Count beers per userId
      const beerCounts = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId) {
          beerCounts[data.userId] = (beerCounts[data.userId] || 0) + 1;
        }
      });

      const userIds = Object.keys(beerCounts);
      console.log("🆔 User IDs for leaderboard:", userIds);

      // Step 2: Fetch usernames in batches of 10 (due to Firestore query limit)
      const userMap = {};
      for (let i = 0; i < userIds.length; i += 10) {
        const batch = userIds.slice(i, i + 10); // Split into chunks of 10
        const userDocs = await getDocs(query(usersRef, where("__name__", "in", batch)));

        userDocs.forEach((doc) => {
          userMap[doc.id] = doc.data().name; // Store username by userId
        });
      }

      console.log("🔗 User Map (ID -> Name):", userMap);

      // Step 3: Map userIds to usernames in leaderboard
      const sortedLeaderboard = Object.entries(beerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => ({
          username: userMap[userId] || "Unknown User", // Use username or fallback
          count,
        }));

      console.log("🏆 Final Leaderboard:", sortedLeaderboard);

      setLeaderboard(sortedLeaderboard);
    } catch (error) {
      console.error("🔥 Firestore Error:", error.code, error.message);
      setLeaderboard([]); // Prevent crashing
    }
  };

  fetchLeaderboard();
}, [timeframe]);

  // Fetch global beer count and total users
  useEffect(() => {
    const fetchGlobalStats = async () => {
      console.log("Fetching global beer count...");
      try {
        const beersRef = collection(db, "beers");
        const usersRef = collection(db, "users");

        console.log("Fetching global beer count...");
        const beersSnapshot = await getDocs(beersRef);
        setBeerCount(beersSnapshot.size);
        console.log("✅ Beer count fetched:", beersSnapshot.size);

        console.log("Fetching total user count...");
        const usersSnapshot = await getDocs(usersRef);
        setTotalUsers(usersSnapshot.size);
        console.log("✅ Total users fetched:", usersSnapshot.size);
      } catch (error) {
        console.error("❌ Firestore Error: Global Stats Query Failed", error);
      }
    };

    fetchGlobalStats();
  }, []);

  // Fetch user's personal stats
  useEffect(() => {
    if (!user) return;

    const fetchUserStats = async () => {
      try {
        const userBeersRef = collection(db, "beers");
        const userQuery = query(userBeersRef, where("userId", "==", user.uid));

        console.log(`Fetching personal beer stats for user: ${user.uid}`);
        const snapshot = await getDocs(userQuery);
        console.log("✅ User beer stats fetched:", snapshot.size);

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

  // Estimate time to 1 million beers
  const beersPerDay = beerCount / 30;
  const daysLeft = (1000000 - beerCount) / beersPerDay;
  const years = Math.floor(daysLeft / 365);
  const days = Math.floor(daysLeft % 365);
  const hours = Math.floor((daysLeft % 1) * 24);

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>Leaderboard</h2>
      <p onClick={() => setTimeframe(timeframe === "all-time" ? "30d" : timeframe === "30d" ? "7d" : "all-time")}>
        {timeframe} ⏷
      </p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {leaderboard.length > 0 ? (
          leaderboard.map((entry, index) => (
            <li key={index} style={{ padding: "5px 0", fontSize: "18px" }}>
              <strong>#{index + 1}</strong> {entry.username} - <span style={{ fontWeight: "bold", color: "#f5a623" }}>{entry.count} beers</span>
            </li>
          ))
        ) : (
          <p>No beers added yet!</p>
        )}
      </ul>
      
      {/* <h2>Leaderboard</h2>
      <p onClick={() => setTimeframe(timeframe === "all-time" ? "30d" : timeframe === "30d" ? "7d" : "all-time")}>
        {timeframe} ⏷
      </p>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={index}>
            #{index + 1} {entry.userId} - {entry.count} beers
          </li>
        ))}
      </ul> */}

      <h2>Global Stats</h2>
      <p>Total Beers: {beerCount}</p>
      <p>Time to 1M: {years} years, {days} days, {hours} hours</p>
      <p>Avg Beers/User: {(beerCount / totalUsers).toFixed(2)}</p>

      <h2>Your Stats</h2>
      <p>Total Beers: {userStats.totalBeers || 0}</p>
      <p>Beers per Week: {userStats.weeklyAvg || 0}</p>
      <p>Bathtubs Filled: {userStats.bathtubsFilled || 0}</p>
    </div>
  );
};

export default Analytics;



// import React, { useState, useEffect } from "react";
// import { db } from "./firebase";
// import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
// import { Line } from "react-chartjs-2";
// import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Title } from "chart.js";

// // Register chart elements
// ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title);

// const Analytics = ({ user }) => {
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [timeframe, setTimeframe] = useState("all-time");
//   const [beerCount, setBeerCount] = useState(0);
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [userStats, setUserStats] = useState({});
//   const [chartData, setChartData] = useState(null);

//   // Fetch leaderboard data (with logs)
//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       try {
//         console.log("Fetching leaderboard data...");

//         const beersCollection = collection(db, "beers");
//         const snapshot = await getDocs(beersCollection);

//         if (!snapshot.empty) {
//           console.log("Data fetched:", snapshot.docs.map(doc => doc.data()));
//         } else {
//           console.log("No beers found in Firestore.");
//         }
//       } catch (error) {
//         console.error("Firestore Error:", error.code, error.message); // 🔥 Logs exact error
//       }
//     };

//     fetchLeaderboard();
//   }, []);


//   // Fetch leaderboard data
//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       const beersRef = collection(db, "beers");
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
//       console.log("Fetching data from Firestore... beersRef");

//       const snapshot = await getDocs(q);
//       const beerCounts = {};

//       snapshot.forEach((doc) => {
//         const data = doc.data();
//         if (data.userId) {
//           beerCounts[data.userId] = (beerCounts[data.userId] || 0) + 1;
//         }
//       });

//       const sortedLeaderboard = Object.entries(beerCounts)
//         .sort(([, a], [, b]) => b - a)
//         .slice(0, 5)
//         .map(([userId, count]) => ({ userId, count }));

//       setLeaderboard(sortedLeaderboard);
//     };

//     fetchLeaderboard();
//   }, [timeframe]);

//   // Fetch global beer count and total users
//   useEffect(() => {
//     const fetchGlobalStats = async () => {
//       const beersRef = collection(db, "beers");
//       const usersRef = collection(db, "users");

//       const beersSnapshot = await getDocs(beersRef);
//       setBeerCount(beersSnapshot.size);

//       const usersSnapshot = await getDocs(usersRef);
//       setTotalUsers(usersSnapshot.size);
//     };

//     fetchGlobalStats();
//   }, []);

//   // Fetch user's personal stats
//   useEffect(() => {
//     if (!user) return;

//     const fetchUserStats = async () => {
//       const userBeersRef = collection(db, "beers");
//       const userQuery = query(userBeersRef, where("userId", "==", user.uid));
//       console.log("Fetching data from Firestore... userBeersRef");

//       const snapshot = await getDocs(userQuery);
//       console.log("Fetching data from Firestore... snapshot");

//       const totalBeers = snapshot.size;
//       const weeklyAvg = (totalBeers / 7).toFixed(2);
//       const bathtubsFilled = ((totalBeers * 0.5) / 120).toFixed(2);

//       setUserStats({ totalBeers, weeklyAvg, bathtubsFilled });
//     };

//     fetchUserStats();
//   }, [user]);

//   // Fetch and prepare chart data
//   useEffect(() => {
//     const fetchChartData = async () => {
//       const beersRef = collection(db, "beers");
//       const q = query(beersRef, orderBy("timestamp", "asc"));
//       console.log("Fetching data from Firestore... beersRef2");

//       const snapshot = await getDocs(q);
      
//       const beerGrowth = [];
//       let count = 0;

//       snapshot.forEach((doc) => {
//         count += 1;
//         beerGrowth.push({ time: doc.data().timestamp.toDate(), count });
//       });

//       setChartData({
//         labels: beerGrowth.map((entry) => entry.time.toDateString()),
//         datasets: [
//           {
//             label: "Beer Growth Over Time",
//             data: beerGrowth.map((entry) => entry.count),
//             borderColor: "#f5a623",
//             borderWidth: 2,
//           },
//         ],
//       });
//     };

//     fetchChartData();
//   }, []);

//   // Estimate time to 1 million beers
//   const beersPerDay = beerCount / 30;
//   const daysLeft = (1000000 - beerCount) / beersPerDay;
//   const years = Math.floor(daysLeft / 365);
//   const days = Math.floor(daysLeft % 365);
//   const hours = Math.floor((daysLeft % 1) * 24);

//   return (
//     <div style={{ padding: "20px", color: "white" }}>
//       <h2>Leaderboard</h2>
//       <p onClick={() => setTimeframe(timeframe === "all-time" ? "30d" : timeframe === "30d" ? "7d" : "all-time")}>
//         {timeframe} ⏷
//       </p>
//       <ul>
//         {leaderboard.map((entry, index) => (
//           <li key={index}>
//             #{index + 1} {entry.userId} - {entry.count} beers
//           </li>
//         ))}
//       </ul>

//       <h2>Global Stats</h2>
//       <p>Total Beers: {beerCount}</p>
//       <p>Time to 1M: {years} years, {days} days, {hours} hours</p>
//       <p>Avg Beers/User: {(beerCount / totalUsers).toFixed(2)}</p>

//       <h2>Beer Growth</h2>
//       {chartData ? <Line data={chartData} /> : <p>Loading chart...</p>}

//       <h2>Your Stats</h2>
//       <p>Total Beers: {userStats.totalBeers || 0}</p>
//       <p>Beers per Week: {userStats.weeklyAvg || 0}</p>
//       <p>Bathtubs Filled: {userStats.bathtubsFilled || 0}</p>
//     </div>
//   );
// };

// export default Analytics;
