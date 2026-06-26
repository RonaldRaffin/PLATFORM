<?php
include "koneksi.php";
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// === TOP 5 TERMAHAL ===
$q1 = "SELECT nama_barang, harga FROM barang ORDER BY CAST(harga AS UNSIGNED) DESC LIMIT 5";
$r1 = mysqli_query($koneksi, $q1);
$labels_termahal = [];
$values_termahal = [];
while ($row = mysqli_fetch_assoc($r1)) {
    $labels_termahal[] = $row['nama_barang'];
    $values_termahal[] = (int) $row['harga'];
}

// === TOP 5 TERMURAH ===
$q2 = "SELECT nama_barang, harga FROM barang ORDER BY CAST(harga AS UNSIGNED) ASC LIMIT 5";
$r2 = mysqli_query($koneksi, $q2);
$labels_termurah = [];
$values_termurah = [];
while ($row = mysqli_fetch_assoc($r2)) {
    $labels_termurah[] = $row['nama_barang'];
    $values_termurah[] = (int) $row['harga'];
}

// === TOTAL BARANG ===
$q3 = "SELECT COUNT(*) as total FROM barang";
$r3 = mysqli_query($koneksi, $q3);
$total_barang = (int) mysqli_fetch_assoc($r3)['total'];

// === HARGA RATA-RATA ===
$q4 = "SELECT AVG(CAST(harga AS UNSIGNED)) as rata FROM barang";
$r4 = mysqli_query($koneksi, $q4);
$rata_harga = (int) mysqli_fetch_assoc($r4)['rata'];

// === HARGA TERTINGGI ===
$q5 = "SELECT MAX(CAST(harga AS UNSIGNED)) as maks FROM barang";
$r5 = mysqli_query($koneksi, $q5);
$harga_maks = (int) mysqli_fetch_assoc($r5)['maks'];

// === HARGA TERENDAH ===
$q6 = "SELECT MIN(CAST(harga AS UNSIGNED)) as min FROM barang";
$r6 = mysqli_query($koneksi, $q6);
$harga_min = (int) mysqli_fetch_assoc($r6)['min'];

echo json_encode([
    "status" => "success",
    "ringkasan" => [
        "total_barang" => $total_barang,
        "rata_harga"   => $rata_harga,
        "harga_maks"   => $harga_maks,
        "harga_min"    => $harga_min,
    ],
    "chart_data" => [
        "labels" => $labels_termahal,
        "values" => $values_termahal,
    ],
    "chart_termurah" => [
        "labels" => $labels_termurah,
        "values" => $values_termurah,
    ]
]);
?>