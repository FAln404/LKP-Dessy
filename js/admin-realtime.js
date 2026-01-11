import { db } from "./firebase-config.js";
import {
  ref,
  onValue,
  remove,
  update,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {

  // =============================
  // VARIABEL UMUM
  // =============================
  const tableBody = document.getElementById("tableBody");
  const exportBtn = document.getElementById("exportExcel");
  const maxQuotaSpan = document.getElementById("maxQuota");
  const currentCountSpan = document.getElementById("currentCount");
  const remainingQuotaSpan = document.getElementById("remainingQuota");
  const updateQuotaBtn = document.getElementById("updateQuota");
  const newQuotaInput = document.getElementById("newQuota");

  const pendaftarRef = ref(db, "pendaftaran/");
  const kuotaRef = ref(db, "settings/kuotaMax");

  // =============================
  // BANNER (BASE64 – LAMA)
  // =============================
  const bannerInput = document.getElementById("bannerInput");
  const uploadBannerBtn = document.getElementById("uploadBannerBtn");
  const bannerPreview = document.getElementById("bannerPreview");
  const bannerBase64Ref = ref(db, "settings/bannerBase64");

  // ⛔ JIKA HALAMAN TIDAK PUNYA BANNER
  if (bannerPreview) {
    onValue(bannerBase64Ref, (snapshot) => {
      if (snapshot.exists()) {
        bannerPreview.src = snapshot.val();
      }
    });
  }

  if (uploadBannerBtn && bannerInput) {
    uploadBannerBtn.addEventListener("click", () => {
      const file = bannerInput.files[0];
      if (!file) return alert("Pilih gambar terlebih dahulu!");

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result;
        await set(bannerBase64Ref, base64String);
        if (bannerPreview) bannerPreview.src = base64String;
        alert("✅ Banner berhasil diperbarui!");
      };
      reader.readAsDataURL(file);
    });
  }

  // =============================
  // DATA PENDAFTAR
  // =============================
  if (tableBody) {
    onValue(pendaftarRef, (snapshot) => {
      tableBody.innerHTML = "";
      let no = 1;
      const data = snapshot.val() || {};
      const entries = Object.entries(data);

      if (currentCountSpan) {
        currentCountSpan.textContent = entries.length;
      }

      entries.forEach(([id, item]) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${no++}</td>
          <td>${item.nama}</td>
          <td>${item.email || "-"}</td>
          <td>${item.pendidikan || "-"}</td>
          <td>${item.tanggal_lahir}</td>
          <td>${item.jenis_kelamin}</td>
          <td>${item.alamat}</td>
          <td>${item.telepon}</td>
          <td>${new Date(item.tanggal_daftar).toLocaleString()}</td>
          <td>
            <button class="editBtn" data-id="${id}">✏️</button>
            <button class="deleteBtn" data-id="${id}">🗑️</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      updateQuotaDisplay();
    });
  }

  // =============================
  // KUOTA
  // =============================
  if (updateQuotaBtn && newQuotaInput) {
    onValue(kuotaRef, (snapshot) => {
      const kuota = snapshot.val() || 50;
      if (maxQuotaSpan) maxQuotaSpan.textContent = kuota;
      updateQuotaDisplay();
    });

    updateQuotaBtn.addEventListener("click", async () => {
      const newVal = parseInt(newQuotaInput.value);
      if (!newVal || newVal <= 0) return alert("Masukkan kuota yang valid.");
      await set(kuotaRef, newVal);
      alert("Kuota berhasil diperbarui!");
      newQuotaInput.value = "";
    });
  }

  async function updateQuotaDisplay() {
    if (!remainingQuotaSpan) return;

    const [kuotaSnap, dataSnap] = await Promise.all([
      get(kuotaRef),
      get(pendaftarRef),
    ]);

    const maxQuota = kuotaSnap.val() || 50;
    const current = Object.keys(dataSnap.val() || {}).length;
    remainingQuotaSpan.textContent = Math.max(0, maxQuota - current);
  }

  // =============================
  // EDIT & HAPUS
  // =============================
  if (tableBody) {
    tableBody.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (!id) return;

      if (e.target.classList.contains("deleteBtn")) {
        if (confirm("Yakin ingin menghapus data ini?")) {
          await remove(ref(db, `pendaftaran/${id}`));
          alert("Data berhasil dihapus.");
        }
      }

      if (e.target.classList.contains("editBtn")) {
        const dataRef = ref(db, `pendaftaran/${id}`);
        const snap = await get(dataRef);
        const data = snap.val();

        const newNama = prompt("Edit nama:", data.nama);
        const newTelepon = prompt("Edit nomor telepon:", data.telepon);

        if (newNama && newTelepon) {
          await update(dataRef, { nama: newNama, telepon: newTelepon });
          alert("Data berhasil diperbarui!");
        }
      }
    });
  }

  // =============================
  // EXPORT EXCEL
  // =============================
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const table = document.getElementById("dataTable");
      if (!table) return;

      const clonedTable = table.cloneNode(true);
      const aksiIndex = Array.from(table.querySelectorAll("th")).findIndex(
        (th) => th.textContent.trim().toLowerCase() === "aksi"
      );

      if (aksiIndex !== -1) {
        clonedTable.querySelectorAll("tr").forEach((row) => {
          if (row.cells.length > aksiIndex) row.deleteCell(aksiIndex);
        });
      }

      const workbook = window.XLSX.utils.table_to_book(clonedTable, {
        sheet: "Data Pendaftar",
      });
      window.XLSX.writeFile(workbook, "data_pendaftar.xlsx");
    });
  }

});
