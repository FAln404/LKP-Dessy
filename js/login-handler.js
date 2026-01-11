import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    status.textContent = "✅ Login berhasil! Mengalihkan...";
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1000);
  } catch (error) {
    console.error(error);
    status.textContent = "❌ Email atau password salah.";
  }
});
