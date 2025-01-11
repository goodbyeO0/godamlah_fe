import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import usernamesData from "../data/usernames.json";
import reportedLinksData from "../data/reportedLinks.json"; // Simulated JSON file for reports

const UserSection = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [monitoringStatus, setMonitoringStatus] = useState(false);
  const [buttonState, setButtonState] = useState("generate");
  const [lastGenerated, setLastGenerated] = useState(
    localStorage.getItem("lastGenerated") || null
  );
  const [groupLink, setGroupLink] = useState(""); // Report group link
  const [reportedLinks, setReportedLinks] = useState(reportedLinksData || []); // Reported links data
  console.log(user);

  useEffect(() => {
    // Start monitoring for new groups when component mounts
    const startMonitoring = async () => {
      try {
        // Make sure we have a user and their telegram username
        if (!user || !user.telegramUsername) {
          console.log("No user or telegram username available");
          return;
        }

        console.log("Starting monitoring for:", user.telegramUsername);

        const response = await fetch(
          "https://1b2c-210-19-68-36.ngrok-free.app/startMonitoring",
          {
            method: "POST",
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              telegramUsername: user.telegramUsername.replace("@", ""),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Monitoring response:", data);
        setMonitoringStatus(true);
      } catch (error) {
        console.error("Error starting monitoring:", error);
      }
    };

    startMonitoring();
  }, [user]); // Only depend on user changes

  const generateUsername = () => {
    const now = new Date();
    if (!lastGenerated || now - new Date(lastGenerated) >= 1 * 60 * 1000) {
      const randomIndex = Math.floor(Math.random() * usernamesData.length);
      const newUsername = usernamesData[randomIndex];

      setUsername(newUsername);
      setButtonState("generated");

      localStorage.setItem("username", newUsername);
      localStorage.setItem("lastGenerated", now);
      setLastGenerated(now);
    } else {
      alert("You can only generate a new username once every 12 hours.");
    }
  };

  const handleReportSubmit = async () => {
    if (groupLink.trim()) {
      try {
        const response = await fetch(
          "https://1b2c-210-19-68-36.ngrok-free.app/api/joinGroupViaLink",
          {
            method: "POST",
            headers: {
              "ngrok-skip-browser-warning": "true",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ inviteLink: groupLink }),
          }
        );

        const data = await response.json();

        if (data.success) {
          const updatedReports = [...reportedLinks, groupLink];
          setReportedLinks(updatedReports);
          setGroupLink("");
          alert("Report has been sent successfully!");
        } else {
          alert(`Failed to process report: ${data.error}`);
        }
      } catch (error) {
        console.error("Error submitting report:", error);
        alert("Failed to submit report. Please try again later.");
      }
    } else {
      alert("Please enter a valid group link.");
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center p-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-2xl font-semibold">Hi, {user?.fullName} 👋</h1>
          <p className="text-gray-500 text-sm">
            {monitoringStatus ? "Monitoring Active" : "Starting Monitoring..."}
          </p>
        </div>
      </div>

      {/* Report Section */}
      <div className="w-full mt-6 p-4 bg-gray-100 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          Report Telegram Scams Instantly
        </h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter Group Link"
            value={groupLink}
            onChange={(e) => setGroupLink(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleReportSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Username Generator */}
      <div className="mt-6 w-full">
        <button
          onClick={generateUsername}
          className={`w-full flex items-center justify-center py-2 px-4 rounded-lg shadow transition ${
            buttonState === "generate"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
          disabled={buttonState === "generated"}
        >
          {buttonState === "generate" ? (
            <>
              Generate Telegram Username <span className="ml-2">⚡</span>
            </>
          ) : (
            <>
              Generated Username <span className="ml-2">✅</span>
            </>
          )}
        </button>

        {/* Display Generated Username */}
        {username && (
          <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow">
            <p className="text-xs text-gray-500">GENERATED ACCOUNT</p>
            <div className="text-gray-800 font-mono text-lg">{username}</div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 w-full bg-white shadow-md">
        <div className="flex justify-around py-3 text-gray-600">
          {[
            { icon: "👤", label: "User" },
            { icon: "🏆", label: "Challenge" },
            { icon: "📊", label: "Leaderboard" },
            { icon: "📄", label: "Report" },
            { icon: "📈", label: "Analysis" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center cursor-pointer hover:text-blue-600 transition"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="text-xs">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserSection;
