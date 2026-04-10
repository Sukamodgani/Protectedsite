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

// 🔁 UPDATE USER ACTIVITY
function updateUserActivity(email) {
  const page = window.location.pathname;

  userRef = doc(db, "onlineUsers", email);

  setDoc(userRef, {
    email: email,
    page: page,
    online: true,
    lastActive: Date.now()
  }, { merge: true });
}

// ✅ START APP AFTER AUTH READY
function startApp(user) {
  const email = (user.email || "").toLowerCase().trim();

  console.log("Logged in:", email);

  updateUserActivity(email);

  // 🔁 ONE interval only
  setInterval(() => {
    updateUserActivity(email);
  }, 5000);

  // 🔴 Remove when tab closed
  window.addEventListener("beforeunload", async () => {
    if (userRef) {
      await deleteDoc(userRef);
    }
  });

  // 🚨 FORCE LOGOUT
  const systemRef = doc(db, "system", "config");
  let lastLogout = Number(localStorage.getItem("lastLogout")) || 0;

  onSnapshot(systemRef, async (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    if (data.forceLogout && data.forceLogout > lastLogout) {

      if (email === "admin@gmail.com") return;

      localStorage.setItem("lastLogout", data.forceLogout);

      alert("Force logout triggered!");

      if (userRef) await deleteDoc(userRef);

      await signOut(auth);
      window.location.href = "/";
    }
  });

  // 🚫 BLOCK USER
  const blockedRef = doc(db, "blockedUsers", email);

  onSnapshot(blockedRef, async (snap) => {
    if (snap.exists()) {
      alert("You have been kicked by admin!");

      if (userRef) await deleteDoc(userRef);

      await signOut(auth);
      window.location.href = "/";
    }
  });
}

// 🔐 AUTH FIX (IMPORTANT)
let authChecked = false;

onAuthStateChanged(auth, (user) => {
  if (authChecked) return;

  setTimeout(() => {
    if (!user) {
      window.location.href = "/";
    } else {
      startApp(user);
    }
    authChecked = true;
  }, 500);
});

// 🚪 LOGOUT
window.logout = async function () {
  if (userRef) {
    await deleteDoc(userRef);
  }

  await signOut(auth);
  window.location.href = "/";
};
