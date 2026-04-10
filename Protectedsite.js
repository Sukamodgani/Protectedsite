import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, doc, onSnapshot,
  setDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyC_ai3QC8MpUyVRrKrhvHr74ItTIsIl-pg",
  authDomain: "logindemo-34202.firebaseapp.com",
  projectId: "logindemo-34202",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let userRef = null;

// 🔁 UPDATE USER ACTIVITY (NEW 🔥)
function updateUserActivity(email) {
  const page = window.location.pathname;

  userRef = doc(db, "onlineUsers", email);

  setDoc(userRef, {
    email: email,
    page: page,               // ✅ TRACK PAGE
    online: true,
    lastActive: Date.now()
  }, { merge: true });
}

// 🔐 MAIN AUTH + SYSTEM
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "https://protectedsite123.vercel.app/";
    return;
  }

  const email = (user.email || "").toLowerCase().trim();
  updateUserActivity(email);

   // 🔁 keep updating activity + page
    setInterval(() => {
  updateUserActivity(email);
}, 5000);

  console.log("Logged in:", email);

  // =========================
  // 🟢 ONLINE USER SYSTEM + PAGE TRACKING
  // =========================
  updateUserActivity(email);

  // 🔁 Update every 5 seconds (LIVE)
  setInterval(() => {
    updateUserActivity(email);
  }, 5000);

  // 🔴 Remove when tab closed
  window.addEventListener("beforeunload", async () => {
    if (userRef) {
      await deleteDoc(userRef);
    }
  });

  // =========================
  // 🚨 FORCE LOGOUT SYSTEM
  // =========================
  const systemRef = doc(db, "system", "config");

  let lastLogout = Number(localStorage.getItem("lastLogout")) || 0;

  onSnapshot(systemRef, async (snap) => {
    if (!snap.exists()) return;

    const data = snap.data();

    if (data.forceLogout && data.forceLogout > lastLogout) {

      // ❌ skip admin
      if (email === "admin@gmail.com") return;

      localStorage.setItem("lastLogout", data.forceLogout);

      alert("Force logout triggered!");

      // ✅ REMOVE from online users
      if (userRef) {
        await deleteDoc(userRef);
      }

      await signOut(auth);
      window.location.href = "https://protectedsite123.vercel.app/";
    }
  });

  // =========================
  // 🚫 BLOCK USER SYSTEM
  // =========================
  const blockedRef = doc(db, "blockedUsers", email);

  onSnapshot(blockedRef, async (snap) => {
    if (snap.exists()) {
      alert("You have been kicked by admin!");

      if (userRef) {
        await deleteDoc(userRef);
      }

      await signOut(auth);
      window.location.href = "https://protectedsite123.vercel.app/";
    }
  });
});

// 🚪 LOGOUT BUTTON
window.logout = async function () {
  if (userRef) {
    await deleteDoc(userRef);
  }

  await signOut(auth);
  window.location.href = "https://protectedsite123.vercel.app/";
};
