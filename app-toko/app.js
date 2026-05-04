// ==============================
// AMBIL DATA BARANG
// ==============================
async function ambilDataBarang() {
  try {
    const response = await fetch('http://localhost:8080/platform/api-toko/get_barang.php');
    const hasil = await response.json();

    if (hasil.status === 'success') {
      if (typeof renderTable !== 'undefined') {
        renderTable(hasil.data);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

ambilDataBarang();

// ==============================
// REGISTER SERVICE WORKER
// ==============================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js')
      .then(registration => {
        console.log('Service Worker Berhasil Didaftarkan!', registration.scope);
      })
      .catch(err => {
        console.error('Service Worker Gagal:', err);
      });
  });
}