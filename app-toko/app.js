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


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js')
      .then(registration => {
        console.log('Service Worker Berhasil Didaftarkan!', registration.scope);

       
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
          
            if (newWorker.state === 'activated') {
              window.location.reload();
            }
          });
        });
      })
      .catch(err => {
        console.error('Service Worker Gagal:', err);
      });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  });
}