import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC_ai3QC8MpUyVRrKrhvHr74ItTIsIl-pg",
  authDomain: "logindemo-34202.firebaseapp.com",
  projectId: "logindemo-34202",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const tableBody = document.querySelector("#logTable tbody");

// ===============================
// ADMIN LOGIN CHECK
// ===============================
onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "https://protectedsite123.vercel.app/";
    return;
  }

  const email = (user.email || "").toLowerCase().trim();

  if (email === "admin@gmail.com") {
    loadLogs();
    loadOnlineUsers();
  } else {
    window.location.href = "Homepagetools.html";
  }

});

// ===============================
// LOAD LOGIN LOGS
// ===============================
async function loadLogs() {

  const q = query(
    collection(db, "logins"),
    orderBy("time", "desc")
  );

  const snapshot = await getDocs(q);

  tableBody.innerHTML = "";

  snapshot.forEach((docSnap) => {

    const data = docSnap.data();

    const loginTime = data.time
      ? new Date(data.time.seconds * 1000).toLocaleString()
      : "Unknown";

    const lastActive = data.lastActive
      ? new Date(data.lastActive).toLocaleString()
      : "Unknown";

    tableBody.innerHTML += `
      <tr>

        <td>${data.email || "Unknown"}</td>
        <td>${data.ip || "Unknown"}</td>
        <td>${data.city || "Unknown"}</td>
        <td>${data.country || "Unknown"}</td>

        <td>${loginTime}</td>

        <td>

          <button
            onclick="kickUser('${data.email}')"
            style="
              background:orange;
              color:white;
              border:none;
              padding:6px 12px;
              border-radius:5px;
              cursor:pointer;
            ">
            Kick
          </button>

        </td>

      </tr>
    `;

  });

}

// ===============================
// SEARCH
// ===============================
window.filterTable = function () {

  const input = document
    .getElementById("search")
    .value
    .toLowerCase();

  const rows = document.querySelectorAll("#logTable tbody tr");

  rows.forEach((row) => {

    const email = row.cells[0].textContent.toLowerCase();

    row.style.display = email.includes(input)
      ? ""
      : "none";

  });

};

// ===============================
// LOGOUT
// ===============================
window.logout = function () {

  signOut(auth).then(() => {

    window.location.href =
      "https://protectedsite123.vercel.app/";

  });

};

// ===============================
// DELETE ALL LOGS
// ===============================
window.deleteLogs = async function () {

  if (!confirm("Delete ALL login logs?"))
    return;

  const snapshot = await getDocs(
    collection(db, "logins")
  );

  for (const d of snapshot.docs) {

    await deleteDoc(
      doc(db, "logins", d.id)
    );

  }

  alert("All login logs deleted.");

  loadLogs();

};

// ===============================
// KICK USER
// ===============================
window.kickUser = async function (email) {

  const currentUser = auth.currentUser?.email?.toLowerCase();

  if (email.toLowerCase() === currentUser) {
    alert("You cannot kick yourself.");
    return;
  }

  try {

    // Block the user
    await setDoc(doc(db, "blockedUsers", email), {
      email: email,
      blocked: true,
      kickedAt: Date.now()
    });

    // Remove from online users immediately
    await deleteDoc(doc(db, "onlineUsers", email));

    alert(email + " has been kicked.");

  } catch (err) {
    console.error(err);
    alert("Failed to kick user.");
  }

};

// ===============================
// FORCE LOGOUT ALL USERS
// ===============================
window.forceLogoutAll = async function () {

  if (!confirm("Force logout ALL users?"))
    return;

  try {

    await setDoc(doc(db, "system", "config"), {
      forceLogout: Date.now()
    });

    alert("All users have been forced to logout.");

  } catch (err) {

    console.error(err);
    alert("Failed.");

  }

};

// ===============================
// ONLINE USERS
// ===============================
function loadOnlineUsers() {

  const ref = collection(db, "onlineUsers");

  onSnapshot(ref, (snapshot) => {

    let html = "";
    let total = 0;

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      const email = data.email || "Unknown";
      const page = data.page || "Unknown";
      const device = data.device || "Unknown Device";

      const active = data.lastActive
        ? new Date(data.lastActive).toLocaleString()
        : "Unknown";

      if (email.toLowerCase() === "admin@gmail.com") {

        html += `
          <div class="user-row">
            <span style="color:green;">
              <b>${email} (ADMIN)</b><br>
              📄 ${page}<br>
              🕒 ${active}
            </span>
          </div>
        `;

      } else {

        html += `
          <div class="user-row">

            <span>
              <b>${email}</b><br>
              📄 ${page}<br>
              🕒 ${active}
            </span>

            <button
              onclick="kickUser('${email}')"
              style="
                background:orange;
                color:white;
                border:none;
                padding:5px 10px;
                border-radius:5px;
                cursor:pointer;
              ">
              Kick
            </button>

          </div>
        `;

      }

      total++;

    });

    document.getElementById("onlineList").innerHTML =
      `<b>🟢 Online Users: ${total}</b><br><br>` + html;

  });

}

// ===============================
// AUTO REMOVE OFFLINE USERS
// ===============================
setInterval(async () => {

  const snapshot = await getDocs(
    collection(db, "onlineUsers")
  );

  const now = Date.now();

  snapshot.forEach(async (d) => {

    const data = d.data();

    if (!data.lastActive)
      return;

    if (now - data.lastActive > 30000) {

      await deleteDoc(
        doc(db, "onlineUsers", d.id)
      );

    }

  });

}, 30000);
