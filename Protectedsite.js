import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, doc, onSnapshot,
  setDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_ai3QC8MpUyVRrKrhvHr74ItTIsIl-pg",
  authDomain: "logindemo-34202.firebaseapp.com",
  projectId: "logindemo-34202",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let userRef = null;

// 🔐 MAIN AUTH + LISTENERS
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.log("No user");
    window.location.href = "http://127.0.0.1:5500/5buttonlogin.html";
    return;
  }

  const email = (user.email || "").toLowerCase().trim();

  console.log("Logged in:", email);

  // 🟢 =========================
  // ONLINE USER SYSTEM (NEW)
  // =========================
  userRef = doc(db, "onlineUsers", email);

  await setDoc(userRef, {
    email: email,
    time: Date.now()
  });

  // 🔴 Remove when user leaves
  window.addEventListener("beforeunload", async () => {
    if (userRef) {
      await deleteDoc(userRef);
    }
  });

  // 🔥 =========================
  // FORCE LOGOUT LISTENER
  // =========================
const systemRef = doc(db, "system", "config");

let lastLogout = Number(localStorage.getItem("lastLogout")) || 0;

onSnapshot(systemRef, (snap) => {
  if (!snap.exists()) return;

  const data = snap.data();

  console.log("ForceLogout value:", data.forceLogout);
  console.log("LastLogout stored:", lastLogout);

  if (data.forceLogout && data.forceLogout > lastLogout) {

    // ❌ skip admin
    if (email === "admin@gmail.com") return;

    // ✅ update stored value
    localStorage.setItem("lastLogout", data.forceLogout);

    alert("Force logout triggered!");
    signOut(auth);
    window.location.href = "http://127.0.0.1:5500/5buttonlogin.html";
  }
});

  // 🔥 =========================
  // BLOCK USER LISTENER
  // =========================
  const blockedRef = doc(db, "blockedUsers", email);

  onSnapshot(blockedRef, (snap) => {
    if (snap.exists()) {
      alert("You have been kicked by admin!");
      signOut(auth);
      window.location.href = "http://127.0.0.1:5500/5buttonlogin.html";
    }
  });
});

// 🚪 LOGOUT BUTTON
window.logout = function () {
  // 🔴 Remove from online users on manual logout
  if (userRef) {
    deleteDoc(userRef);
  }

  signOut(auth).then(() => {
    window.location.href = "http://127.0.0.1:5500/5buttonlogin.html";
  });
};
