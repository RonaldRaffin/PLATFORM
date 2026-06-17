<?php
include "koneksi.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$cari     = isset($_GET['cari'])      ? trim($_GET['cari'])           : '';
$kategori = isset($_GET['kategori'])  ? trim($_GET['kategori'])       : 'semua';
$sort     = isset($_GET['sort'])      ? trim($_GET['sort'])           : 'default';
$page     = isset($_GET['page'])      ? max(1, (int)$_GET['page'])   : 1;
$ambilSemua = isset($_GET['all']) && $_GET['all'] === '1'; 
$limit    = 5;
$offset   = ($page - 1) * $limit;

$where_parts = [];
$params      = [];
$types       = '';

if ($cari !== '') {
    $where_parts[] = "nama_barang LIKE ?";
    $params[]      = '%' . $cari . '%';
    $types        .= 's';
}

$kategori_map = [
    'mouse'    => ['mouse', 'logitech', 'razer', 'corsair'],
    'gpu'      => ['rtx', 'gtx', 'rx ', 'vga', 'gpu', 'geforce', 'radeon', 'gigabyte'],
    'monitor'  => ['monitor', 'display', 'lcd', 'led', 'ips', 'inch'],
    'keyboard' => ['keyboard', 'mechanical', 'gaming keyboard', 'keychron'],
    'laptop'   => ['laptop', 'notebook', 'asus', 'lenovo', 'acer', 'dell', 'rog', 'tuf'],
];

if ($kategori !== 'semua' && isset($kategori_map[$kategori])) {
    $kat_conditions = [];
    foreach ($kategori_map[$kategori] as $kw) {
        $kat_conditions[] = "nama_barang LIKE ?";
        $params[]         = '%' . $kw . '%';
        $types           .= 's';
    }
    $where_parts[] = '(' . implode(' OR ', $kat_conditions) . ')';
}

$where_sql = count($where_parts) > 0 ? 'WHERE ' . implode(' AND ', $where_parts) : '';

switch ($sort) {
    case 'termurah': $order_sql = 'ORDER BY CAST(harga AS UNSIGNED) ASC';  break;
    case 'termahal': $order_sql = 'ORDER BY CAST(harga AS UNSIGNED) DESC'; break;
    default:         $order_sql = 'ORDER BY id DESC';
}

$count_sql  = "SELECT COUNT(*) as total FROM barang $where_sql";
$stmt_count = mysqli_prepare($koneksi, $count_sql);

if (!$stmt_count) {
    echo json_encode([
        "status"  => "error",
        "message" => "Query count gagal: " . mysqli_error($koneksi)
    ]);
    exit;
}

if ($types !== '') {
    mysqli_stmt_bind_param($stmt_count, $types, ...$params);
}
mysqli_stmt_execute($stmt_count);
$result_count  = mysqli_stmt_get_result($stmt_count);
$row_count     = mysqli_fetch_assoc($result_count);
$total_data    = (int)$row_count['total'];
$total_halaman = (int)ceil($total_data / $limit);
mysqli_stmt_close($stmt_count);

if ($ambilSemua) {
    $data_sql = "SELECT * FROM barang $where_sql $order_sql";
} else {
    $data_sql = "SELECT * FROM barang $where_sql $order_sql LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types   .= 'ii';
}

$stmt = mysqli_prepare($koneksi, $data_sql);

if (!$stmt) {
    echo json_encode([
        "status"  => "error",
        "message" => "Query data gagal: " . mysqli_error($koneksi)
    ]);
    exit;
}

if ($types !== '') {
    mysqli_stmt_bind_param($stmt, $types, ...$params);
}
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$data_barang = [];
while ($baris = mysqli_fetch_assoc($result)) {
    $data_barang[] = $baris;
}
mysqli_stmt_close($stmt);

echo json_encode([
    "status"         => "success",
    "message"        => "Berhasil mengambil data",
    "data"           => $data_barang,
    "total_data"     => $total_data,
    "total_halaman"  => $total_halaman,
    "halaman_ini"    => $page,
    "limit"          => $limit,
]);