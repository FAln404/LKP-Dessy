import { db } from "./firebase-config.js";
import {
  ref,
  push,
  set,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const form = document.getElementById("pendaftaranForm");
const status = document.getElementById("status");
const remainingQuotaEl = document.getElementById("remainingQuota");
const maxQuotaEl = document.getElementById("maxQuota");

const pendaftarRef = ref(db, "pendaftaran/");
const kuotaRef = ref(db, "settings/kuotaMax");

// === 🔹 Tampilkan kuota secara realtime ===
async function updateQuotaDisplay() {
  const [kuotaSnap, dataSnap] = await Promise.all([
    get(kuotaRef),
    get(pendaftarRef),
  ]);

  const maxQuota = kuotaSnap.val() || 50;
  const current = Object.keys(dataSnap.val() || {}).length;
  const remaining = Math.max(0, maxQuota - current);

  maxQuotaEl.textContent = maxQuota;
  remainingQuotaEl.textContent = remaining;
}

// Listener realtime
onValue(pendaftarRef, updateQuotaDisplay);
onValue(kuotaRef, updateQuotaDisplay);

// === 🔹 Kirim data pendaftaran ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const email = document.getElementById("email").value.trim();
  const tanggal_lahir = document.getElementById("tanggal_lahir").value;
  const jenis_kelamin = document.getElementById("jenis_kelamin").value;
  const pendidikan = document.getElementById("pendidikan").value;
  const alamat = document.getElementById("alamat").value.trim();
  const telepon = document.getElementById("telepon").value.trim();

  // Validasi
  if (
    !nama ||
    !email ||
    !tanggal_lahir ||
    !jenis_kelamin ||
    !pendidikan ||
    !alamat ||
    !telepon
  ) {
    status.textContent = "❌ Lengkapi semua field sebelum mengirim.";
    return;
  }

  try {
    const snapshot = await get(pendaftarRef);
    const data = snapshot.val() || {};

    // Ambil kuota maksimum
    const kuotaSnap = await get(kuotaRef);
    const kuotaMax = kuotaSnap.val() || 50;
    const currentCount = Object.keys(data).length;

    // Jika kuota penuh
    if (currentCount >= kuotaMax) {
      status.textContent = "❌ Kuota pendaftaran sudah penuh.";
      return;
    }

    // Cegah duplikasi (nama + telepon + email)
    const duplikat = Object.values(data).some(
      (d) => d.nama === nama && d.telepon === telepon && d.email === email
    );

    if (duplikat) {
      status.textContent =
        "❌ Data dengan nama, telepon, dan email tersebut sudah terdaftar.";
      return;
    }

    // Simpan data baru
    const newRef = push(pendaftarRef);
    await set(newRef, {
      nama,
      email,
      tanggal_lahir,
      jenis_kelamin,
      pendidikan,
      alamat,
      telepon,
      tanggal_daftar: new Date().toISOString(),
    });

    status.textContent = "✅ Pendaftaran berhasil!";
    form.reset();
    updateQuotaDisplay();
  } catch (error) {
    console.error(error);
    status.textContent = "❌ Terjadi kesalahan, coba lagi.";
  }
});
