const API = 'http://localhost:8080/platform/api-toko';

let halamanSaatIni  = 1;
let totalHalaman    = 1;
let searchTimer     = null;

function getParams() {
    const cari     = document.getElementById('searchInput').value.trim();
    const kategori = window.activeKategori || 'semua';
    const sort     = window.activeSorting  || 'default';
    return { cari, kategori, sort };
}

async function ambilDataBarang() {
    const { cari, kategori, sort } = getParams();

    const url = new URL(API + '/get_barang.php');
    url.searchParams.set('cari',     cari);
    url.searchParams.set('kategori', kategori);
    url.searchParams.set('sort',     sort);
    url.searchParams.set('page',     halamanSaatIni);

    try {
        const response = await fetch(url.toString());
        const hasil    = await response.json();

        if (hasil.status === 'success') {
            totalHalaman = hasil.total_halaman || 1;
            if (typeof renderTable !== 'undefined') {
                renderTable(hasil.data, hasil.total_data);
            }
            updatePagination();
        }
    } catch (error) {
        console.error('Error:', error);
        if (typeof showToast !== 'undefined') {
            showToast('Gagal memuat data. Coba refresh halaman.', 'error');
        }
        const grid = document.getElementById('cardGrid');
        if (grid) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-num">!</div><div class="empty-text">Gagal memuat data. Periksa koneksi server.</div></div>';
        }
    }
}

function updatePagination() {
    const info = document.getElementById('pageInfo');
    const prev = document.getElementById('btnPrev');
    const next = document.getElementById('btnNext');
    if (!info || !prev || !next) return;

    info.textContent = 'Hal ' + halamanSaatIni + ' / ' + totalHalaman;
    prev.disabled = halamanSaatIni <= 1;
    next.disabled = halamanSaatIni >= totalHalaman;
}

function goPrev() {
    if (halamanSaatIni > 1) {
        halamanSaatIni--;
        ambilDataBarang();
    }
}

function goNext() {
    if (halamanSaatIni < totalHalaman) {
        halamanSaatIni++;
        ambilDataBarang();
    }
}

function resetHalaman() {
    halamanSaatIni = 1;
}

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