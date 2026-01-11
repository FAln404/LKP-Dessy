// js/banner-handler.js
import { db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const bannerImg = document.getElementById("mainBanner");
const bannerRef = ref(db, "settings/bannerUrl");

// 🔹 Dengarkan perubahan URL banner dari Firebase
onValue(bannerRef, (snapshot) => {
  if (snapshot.exists()) {
    bannerImg.src = snapshot.val();
  }
});
