import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, collection, getDocs, query, orderBy,
  deleteDoc, doc, setDoc, onSnapshot 
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

const tableBody = document.querySelector("#logTable tbody");

// 🔐 AUTH CHECK
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
    window.location.href = "http://127.0.0.1:5500/5button.html";
  }
});

// 📊 LOAD LOGS
async function loadLogs() {
  const q = query(collection(db, "logins"), orderBy("time", "desc"));
  const snapshot = await getDocs(q);

  tableBody.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    tableBody.innerHTML += `
      <tr>
        <td>${data.email || ""}</td>
        <td>${data.ip || ""}</td>
        <td>${data.city || ""}</td>
        <td>${data.country || ""}</td>
        <td>${data.time ? new Date(data.time.seconds * 1000).toLocaleString() : ""}</td>
        <td>
          <button onclick="kickUser('${data.email}')"
            style="background:orange;color:white;border:none;padding:5px 10px;border-radius:5px;">
            Kick
          </button>
        </td>
      </tr>
    `;
  });
}

// 🔍 SEARCH
window.filterTable = function () {
  const input = document.getElementById("search").value.toLowerCase();
  const rows = document.querySelectorAll("#logTable tbody tr");

  rows.forEach(row => {
    const email = row.cells[0].textContent.toLowerCase();
    row.style.display = email.includes(input) ? "" : "none";
  });
};

// 🚪 LOGOUT
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "http://127.0.0.1:5500/5buttonlogin.html";
  });
};

// 🗑 DELETE LOGS
window.deleteLogs = async function () {
  if (!confirm("Delete all logs?")) return;

  const snapshot = await getDocs(collection(db, "logins"));

  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, "logins", d.id));
  }

  alert("All logs deleted!");
  loadLogs();
};

// 👢 KICK USER
window.kickUser = async function(email) {
  const currentUser = auth.currentUser.email.toLowerCase();

  if (email === currentUser) {
    alert("You cannot kick yourself!");
    return;
  }

  await setDoc(doc(db, "blockedUsers", email), {
    email: email,
    blocked: true
  });

  // 🔥 remove instantly from online users
  await deleteDoc(doc(db, "onlineUsers", email));

  alert(email + " kicked!");
};

// 🚨 FORCE LOGOUT
window.forceLogoutAll = async function () {
  if (!confirm("Force logout ALL users?")) return;

  await setDoc(doc(db, "system", "config"), {
    forceLogout: Date.now()
  });

  alert("All users logged out!");
};

// 🟢 ONLINE USERS (WITH PAGE TRACKING)
function loadOnlineUsers() {
  const ref = collection(db, "onlineUsers");

  onSnapshot(ref, (snapshot) => {
    let html = "";
    let count = 0;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const email = data.email;
      const page = data.page || "unknown";

      if (email === "admin@gmail.com") {
        html += `
          <div class="user-row">
            <span style="color:green;"><b>${email} (ADMIN)</b> (${page})</span>
          </div>
        `;
      } else {
        html += `
          <div class="user-row">
            <span>${email} (${page})</span>
            <button onclick="kickUser('${email}')"
              style="background:orange;color:white;border:none;padding:4px 10px;border-radius:5px;">
              Kick
            </button>
          </div>
        `;
      }

      count++;
    });

    document.getElementById("onlineList").innerHTML =
      `<b>Online: ${count}</b><br>` + html;
  });
}

// 🧹 AUTO CLEAN OFFLINE USERS
setInterval(async () => {
  const snapshot = await getDocs(collection(db, "onlineUsers"));
  const now = Date.now();

  snapshot.forEach(async (d) => {
    const data = d.data();

    if (now - data.lastActive > 30000) {
      await deleteDoc(doc(db, "onlineUsers", d.id));
    }
  });
}, 30000);
