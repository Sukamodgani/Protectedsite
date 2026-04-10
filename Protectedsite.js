  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getAuth, onAuthStateChanged, signOut } 
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { getFirestore, doc, onSnapshot } 
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyC_ai3QC8MpUyVRrKrhvHr74ItTIsIl-pg",
    authDomain: "logindemo-34202.firebaseapp.com",
    projectId: "logindemo-34202",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "http://127.0.0.1:5500/5buttonlogin.html";
      return;
    }

    // 🔥 REAL-TIME BLOCK CHECK (INSTANT KICK)
    const blockedRef = doc(db, "blockedUsers", user.email);

    onSnapshot(blockedRef, (docSnap) => {
      if (docSnap.exists()) {
        alert("You have been kicked by admin.");
        signOut(auth);
        window.location.href = "http://127.0.0.1:5500/5buttonlogin.html";
      }
    });
  });

  window.logout = function () {
    signOut(auth).then(() => {
      window.location.href = "http://127.0.0.1:5500/5buttonlogin.html";
    });
  }