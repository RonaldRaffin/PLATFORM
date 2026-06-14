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

$id    = (int) $_POST['id'];
$nama  = mysqli_real_escape_string($koneksi, $_POST['nama_barang']);
$harga = $_POST['harga'];

if (!$id || !$nama || !$harga) {
    die(json_encode(["status" => "error", "pesan" => "Data tidak lengkap"]));
}

if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === 0) {
    $file_tmp       = $_FILES['gambar']['tmp_name'];
    $nama_file_baru = time() . "_" . $_FILES['gambar']['name'];

    $lama = mysqli_fetch_assoc(mysqli_query($koneksi, "SELECT gambar FROM barang WHERE id=$id"));
    if ($lama['gambar']) {
        $path_lama = "uploads/" . $lama['gambar'];
        if (file_exists($path_lama)) {
            unlink($path_lama);
        }
    }

    move_uploaded_file($file_tmp, "uploads/" . $nama_file_baru);
    $query = "UPDATE barang SET nama_barang='$nama', harga='$harga', gambar='$nama_file_baru' WHERE id=$id";
} else {
    $query = "UPDATE barang SET nama_barang='$nama', harga='$harga' WHERE id=$id";
}

if (mysqli_query($koneksi, $query)) {
    echo json_encode(["status" => "success", "pesan" => "Data berhasil diupdate"]);
} else {
    echo json_encode(["status" => "error", "pesan" => "Gagal mengupdate data"]);
}
?>