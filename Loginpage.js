import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getAuth, signInWithEmailAndPassword } 
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { getFirestore, collection, addDoc, serverTimestamp } 
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyC_ai3QC8MpUyVRrKrhvHr74ItTIsIl-pg",
    authDomain: "logindemo-34202.firebaseapp.com",
    projectId: "logindemo-34202",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  window.login = async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // 🌍 GET IP + LOCATION
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();

      // 🔥 SAVE LOGIN DATA
      await addDoc(collection(db, "logins"), {
        email: userCredential.user.email,
        ip: data.ip,
        city: data.city,
        country: data.country_name,
        time: serverTimestamp()
      });

      window.location.href = "http://127.0.0.1:5500/5button.html";

    } catch (err) {
      alert(err.message);
    }
  }