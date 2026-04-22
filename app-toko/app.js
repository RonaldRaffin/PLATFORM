// ==============================
// AMBIL DATA BARANG
// ==============================
async function ambilDataBarang() {
    try {
        const response = await fetch('http://localhost:8080/platform/api-toko/get_barang.php');
        const hasil = await response.json();

        if (hasil.status === 'success') {
            let html = '';

            hasil.data.forEach(barang => {
                html += `
                    <tr class="text-center border-b">
                        <td class="p-2">${barang.id}</td>
                        <td class="p-2">${barang.nama_barang}</td>
                        <td class="p-2">Rp ${barang.harga}</td>
                    </tr>
                `;
            });

            document.getElementById('tabel-barang').innerHTML = html;
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
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker Berhasil Didaftarkan!', registration.scope);
            })
            .catch(err => {
                console.error('Service Worker Gagal:', err);
            });
    });
}
