const API = 'http://localhost:8080/platform/api-toko';

let halamanSaatIni = 1;
let totalHalaman = 1;
let searchTimer = null;

function getParams() {
    const cari = document.getElementById('searchInput').value.trim();
    const kategori = window.activeKategori || 'semua';
    const sort = window.activeSorting || 'default';
    return { cari, kategori, sort };
}

async function ambilDataBarang() {
    const { cari, kategori, sort } = getParams();

    const url = new URL(API + '/get_barang.php');
    url.searchParams.set('cari', cari);
    url.searchParams.set('kategori', kategori);
    url.searchParams.set('sort', sort);
    url.searchParams.set('page', halamanSaatIni);

    try {
        const response = await fetch(url.toString());
        const hasil = await response.json();

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

// ============================================
// DASHBOARD CHART
// ============================================
let currentChartType = 'bar';

async function renderDashboard() {
    try {
        const token = localStorage.getItem('token_toko');
        const response = await fetch(API + '/statistik.php', {
            headers: { 'Authorization': token }
        });
        const json = await response.json();

        if (json.status === 'success') {
            const ctx = document.getElementById('myChart');
            if (!ctx) return;

            // Bug fix: hancurkan grafik lama agar tidak ghosting
            const existing = Chart.getChart('myChart');
            if (existing) existing.destroy();

            const labels = json.chart_data.labels;
            const values = json.chart_data.values;

            const COLORS = [
                'rgba(10,  10,  10,  0.85)',
                'rgba(100, 100, 100, 0.75)',
                'rgba(180, 180, 180, 0.75)',
                'rgba(60,  60,  60,  0.80)',
                'rgba(140, 140, 140, 0.70)',
            ];

            const isPie = currentChartType === 'pie' || currentChartType === 'doughnut';

            new Chart(ctx, {
                type: currentChartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Harga (Rp)',
                        data: values,
                        backgroundColor: isPie ? COLORS : COLORS.map(c => c.replace(/[\d.]+\)$/, '0.75)')),
                        borderColor: isPie ? '#fff' : 'rgba(10,10,10,0.9)',
                        borderWidth: isPie ? 2 : 1,
                        borderRadius: currentChartType === 'bar' ? 6 : 0,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: isPie,
                            position: 'right',
                            labels: {
                                font: { family: 'DM Sans', size: 11 },
                                boxWidth: 12,
                                padding: 14,
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const val = context.parsed.y ?? context.parsed;
                                    return ' Rp ' + Number(val).toLocaleString('id-ID');
                                }
                            }
                        }
                    },
                    scales: currentChartType === 'bar' || currentChartType === 'line' ? {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: val => {
                                    if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(0) + ' jt';
                                    return 'Rp ' + Number(val).toLocaleString('id-ID');
                                },
                                font: { family: 'DM Mono', size: 10 }
                            },
                            grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: {
                            ticks: { font: { family: 'DM Sans', size: 11 } },
                            grid: { display: false }
                        }
                    } : {}
                }
            });
        }
    } catch (err) {
        console.error('Gagal memuat grafik:', err);
    }
}

function gantiChart(type) {
    currentChartType = type;
    document.querySelectorAll('.btn-chart-type').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-' + type);
    if (activeBtn) activeBtn.classList.add('active');
    renderDashboard();
}

let statsVisible = false;

function toggleStatistik() {
    const panel = document.getElementById('statsPanel');
    const btn = document.getElementById('btnToggleStats');
    const label = document.getElementById('btnStatsLabel');

    statsVisible = !statsVisible;

    if (statsVisible) {
        panel.style.maxHeight = '500px';
        panel.style.opacity = '1';
        panel.style.paddingBottom = '28px';
        label.textContent = 'Sembunyikan Statistik';
        btn.style.background = 'var(--ink)';
        btn.style.color = '#fff';
        btn.style.borderColor = 'var(--ink)';
        renderDashboard();
    } else {
        panel.style.maxHeight = '0';
        panel.style.opacity = '0';
        panel.style.paddingBottom = '0';
        label.textContent = 'Lihat Statistik';
        btn.style.background = 'transparent';
        btn.style.color = 'var(--ink3)';
        btn.style.borderColor = 'var(--border-lt)';
    }
}

// ============================================
// KERANJANG (localStorage, frontend-only)
// ============================================
const CART_KEY = 'keranjang_toko';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(barang) {
    const cart = getCart();
    const existing = cart.find(item => item.id === barang.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: barang.id,
            nama_barang: barang.nama_barang,
            harga: barang.harga,
            gambar: barang.gambar || null,
            qty: 1
        });
    }
    saveCart(cart);
}

function flyToCart(sourceEl) {
    const cartBtn = document.querySelector('.nav-icon-btn');
    if (!cartBtn || !sourceEl) return;

    const start = sourceEl.getBoundingClientRect();
    const end = cartBtn.getBoundingClientRect();

    const clone = document.createElement('div');
    clone.style.cssText = `
    position: fixed;
    z-index: 99999;
    pointer-events: none;
    left: ${start.left}px;
    top: ${start.top}px;
    width: ${start.width}px;
    height: ${start.height}px;
    border-radius: 12px;
    overflow: hidden;
    transition: left 0.7s cubic-bezier(.4,0,.2,1),
                top 0.7s cubic-bezier(.4,0,.2,1),
                width 0.7s cubic-bezier(.4,0,.2,1),
                height 0.7s cubic-bezier(.4,0,.2,1),
                border-radius 0.7s ease,
                opacity 0.5s ease 0.2s;
    opacity: 1;
  `;

    // salin background/gambar dari elemen sumber
    const img = sourceEl.querySelector('img') || sourceEl;
    if (img.tagName === 'IMG') {
        const cloneImg = document.createElement('img');
        cloneImg.src = img.src;
        cloneImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
        clone.appendChild(cloneImg);
    } else {
        // fallback: tidak ada gambar, pakai background abu
        clone.style.background = 'var(--bg3, #efefef)';
    }

    document.body.appendChild(clone);

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            const endCenterX = end.left + end.width / 2;
            const endCenterY = end.top + end.height / 2;
            const size = 28;

            clone.style.left = (endCenterX - size / 2) + 'px';
            clone.style.top = (endCenterY - size / 2) + 'px';
            clone.style.width = size + 'px';
            clone.style.height = size + 'px';
            clone.style.borderRadius = '50%';
            clone.style.opacity = '0';
        });
    });

    setTimeout(function () {
        clone.remove();
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.classList.remove('cart-bounce');
            void badge.offsetWidth;
            badge.classList.add('cart-bounce');
        }
    }, 800);
}

function removeFromCart(id) {
    const cart = getCart().filter(item => item.id !== id);
    saveCart(cart);
}

function updateCartQty(id, qty) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, qty);
    saveCart(cart);
}

function cartTotalItems() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
    const total = cartTotalItems();
    const badge = document.getElementById('cartBadge');
    const badgeMobile = document.getElementById('cartBadgeMobile');
    [badge, badgeMobile].forEach(function (el) {
        if (!el) return;
        el.textContent = total;
        el.style.display = total > 0 ? (el.id === 'cartBadgeMobile' ? 'inline-flex' : 'flex') : 'none';
    });
}

document.addEventListener('DOMContentLoaded', updateCartBadge);

// ============================================
// NOTIFIKASI (log aktivitas admin, localStorage)
// ============================================
const NOTIF_KEY = 'notifikasi_toko';
const NOTIF_MAX = 30;

function getNotifList() {
    try {
        return JSON.parse(localStorage.getItem(NOTIF_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveNotifList(list) {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
    updateNotifBadge();
}

function pushNotif(message, jenis) {
    const list = getNotifList();
    list.unshift({
        id: Date.now() + Math.random().toString(16).slice(2),
        message: message,
        jenis: jenis || 'info',
        waktu: new Date().toISOString(),
        dibaca: false
    });
    saveNotifList(list.slice(0, NOTIF_MAX));
    renderNotifList();
}

function unreadNotifCount() {
    return getNotifList().filter(n => !n.dibaca).length;
}

function updateNotifBadge() {
    const total = unreadNotifCount();
    const badge = document.getElementById('notifBadge');
    const badgeMobile = document.getElementById('notifBadgeMobile');
    [badge, badgeMobile].forEach(function (el) {
        if (!el) return;
        el.textContent = total > 9 ? '9+' : total;
        el.style.display = total > 0 ? (el.id === 'notifBadgeMobile' ? 'inline-flex' : 'flex') : 'none';
    });
}

function waktuRelatif(iso) {
    const detik = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (detik < 60) return 'Baru saja';
    const menit = Math.floor(detik / 60);
    if (menit < 60) return menit + ' menit lalu';
    const jam = Math.floor(menit / 60);
    if (jam < 24) return jam + ' jam lalu';
    const hari = Math.floor(jam / 24);
    return hari + ' hari lalu';
}

const NOTIF_ICONS = {
    tambah: '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 1v12M1 7h12"/></svg>',
    edit: '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 1.5l3 3L4 13H1v-3l8.5-8.5z"/></svg>',
    hapus: '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h10M5 4V2.5A1 1 0 016 1.5h2a1 1 0 011 1V4m-7 0l.6 8a1 1 0 001 .9h4.8a1 1 0 001-.9L11 4"/></svg>',
    info: '<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="6"/><path d="M7 6.5v3.5M7 4.2v.1"/></svg>'
};

function renderNotifList() {
    const list = getNotifList();
    const html = !list.length
        ? '<div class="notif-empty">Belum ada aktivitas.</div>'
        : list.map(function (n) {
            const icon = NOTIF_ICONS[n.jenis] || NOTIF_ICONS.info;
            return '<div class="notif-item' + (n.dibaca ? '' : ' unread') + '">' +
                '<div class="notif-item-icon ' + n.jenis + '">' + icon + '</div>' +
                '<div class="notif-item-body">' +
                '<div class="notif-item-msg">' + n.message + '</div>' +
                '<div class="notif-item-time">' + waktuRelatif(n.waktu) + '</div>' +
                '</div></div>';
        }).join('');

    ['notifList', 'notifListMobile'].forEach(function (id) {
        const wrap = document.getElementById(id);
        if (wrap) wrap.innerHTML = html;
    });
}

function toggleNotifDropdown(e, isMobile) {
    if (e) e.stopPropagation();
    const wrap = document.getElementById(isMobile ? 'notifMenuWrapMobile' : 'notifMenuWrap');
    if (!wrap) return;
    const willOpen = !wrap.classList.contains('open');
    wrap.classList.toggle('open');
    if (willOpen) {
        const list = getNotifList();
        if (list.some(n => !n.dibaca)) {
            list.forEach(n => n.dibaca = true);
            saveNotifList(list);
        }
        renderNotifList();
    }
}

document.addEventListener('DOMContentLoaded', updateNotifBadge);
document.addEventListener('click', function (e) {
    const wrap = document.getElementById('notifMenuWrap');
    if (wrap && !wrap.contains(e.target)) wrap.classList.remove('open');
    const wrapMobile = document.getElementById('notifMenuWrapMobile');
    if (wrapMobile && !wrapMobile.contains(e.target)) wrapMobile.classList.remove('open');
});