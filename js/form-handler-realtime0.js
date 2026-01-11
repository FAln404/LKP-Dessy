import { db } from "./firebase-config.js";
import {
  ref,
  push,
  set,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const form = document.getElementById("pendaftaranForm");
const status = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const tanggal_lahir = document.getElementById("tanggal_lahir").value;
  const jenis_kelamin = document.getElementById("jenis_kelamin").value;
  const alamat = document.getElementById("alamat").value.trim();
  const telepon = document.getElementById("telepon").value.trim();

  if (!nama || !tanggal_lahir || !jenis_kelamin || !alamat || !telepon) {
    status.textContent = "❌ Lengkapi semua field sebelum mengirim.";
    return;
  }

  try {
    const pendaftarRef = ref(db, "pendaftaran/");
    const newData = push(pendaftarRef);

    await set(newData, {
      nama,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      telepon,
      tanggal_daftar: new Date().toISOString(),
    });

    status.textContent = "✅ Pendaftaran berhasil dikirim!";
    form.reset();
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    status.textContent = "❌ Terjadi kesalahan, coba lagi.";
  }
});
