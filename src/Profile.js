import React, { useState, useEffect } from "react";
import { auth, db, storage } from "./firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./Profile.css"; // Ensure you create this CSS file for styling

const defaultProfilePic = "profile-icon.png"; // Default profile icon from TabBar

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [editingField, setEditingField] = useState(null);
    const [newValue, setNewValue] = useState("");
    const [profilePic, setProfilePic] = useState(defaultProfilePic);
    const [displayName, setDisplayName] = useState(auth.currentUser?.displayName || "Nutzer");
    
    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const userRef = doc(db, "users", auth.currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                    setProfilePic(userSnap.data().profilePic || defaultProfilePic);
                    setDisplayName(auth.currentUser.displayName || userSnap.data().name);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleEdit = (field) => {
        setEditingField(field);
        setNewValue(userData[field]);
    };

    const handleSave = async (field) => {
        if (!newValue.trim()) return;
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { [field]: newValue });
        setUserData({ ...userData, [field]: newValue });
        setEditingField(null);

        // Update Firebase Authentication for immediate sync
        if (field === "name") {
            await updateProfile(auth.currentUser, { displayName: newValue });
            setDisplayName(newValue);
        } else if (field === "email") {
            try {
                // Send email verification after changing the email
                await updateEmail(auth.currentUser, newValue);
                await auth.currentUser.sendEmailVerification();
                alert("Please verify your new email address before logging in again.");
            } catch (error) {
                console.error("Error updating email:", error.message);
            }
        } else if (field === "password") {
            await updatePassword(auth.currentUser, newValue);
        }
    };


    const handleProfilePicChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await updateDoc(doc(db, "users", auth.currentUser.uid), { profilePic: downloadURL });
            setProfilePic(downloadURL);
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
    };

    return (
        <div className="profile-container">
            <div className="profile-box">
                <div className="profile-pic-section">
                    <div className="profile-pic-wrapper">
                        <img
                            src={profilePic}
                            alt="Profile"
                            className="profile-pic"
                            onClick={() => document.getElementById("fileInput").click()}
                        />
                    </div>
                    <input
                        type="file"
                        id="fileInput"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleProfilePicChange}
                    />
                </div>
                <div className="profile-details">
                    {userData && (
                        <>
                            {[['name', 'Benutzername'], ['email', 'E-Mail-Adresse'], ['password', 'Passwort']].map(([field, label]) => (
                                <div key={field} className="profile-field-container">
                                    <label className="profile-label">{label}</label>
                                    <div className="profile-field">
                                        {editingField === field ? (
                                            <input
                                                type={field === "password" ? "password" : "text"}
                                                className="profile-input"
                                                value={newValue}
                                                onChange={(e) => setNewValue(e.target.value)}
                                            />
                                        ) : (
                                            <div className="input-box">{field === "password" ? "********" : userData[field]}</div>
                                        )}
                                        {editingField === field ? (
                                            <button className="save-btn" onClick={() => handleSave(field)}>Speichern</button>
                                        ) : (
                                            <button className="change-btn" onClick={() => handleEdit(field)}>Ändern</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default Profile;
