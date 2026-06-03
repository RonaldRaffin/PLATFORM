<?php
include "koneksi.php";

// =================== PENGUNCI API ===================
$headers       = apache_request_headers();
$token_dikirim = isset($headers['Authorization']) ? $headers['Authorization'] : '';

$cek_token = mysqli_query($koneksi, "SELECT * FROM users WHERE token='$token_dikirim'");

if ($token_dikirim === '' || mysqli_num_rows($cek_token) === 0) {
    die(json_encode([
        "status" => "error",
        "pesan"  => "Akses Ditolak! Token Invalid."
    ]));
}
// ====================================================

$json_data = file_get_contents('php://input');
$data      = json_decode($json_data, true);

if (isset($data['id']) && isset($data['nama_barang']) && isset($data['harga'])) {

    $id    = (int) $data['id'];
    $nama  = mysqli_real_escape_string($koneksi, $data['nama_barang']);
    $harga = $data['harga'];

    $query = "UPDATE barang SET nama_barang='$nama', harga='$harga' WHERE id=$id";

    if (mysqli_query($koneksi, $query)) {
        echo json_encode([
            "status" => "success",
            "pesan"  => "Data berhasil diupdate"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "pesan"  => "Gagal mengupdate data"
        ]);
    }

} else {
    echo json_encode([
        "status" => "error",
        "pesan"  => "Data tidak lengkap"
    ]);
}
?>