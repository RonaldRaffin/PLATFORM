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

// 1. Tangkap Teks Biasa
$nama  = mysqli_real_escape_string($koneksi, $_POST['nama_barang']);
$harga = mysqli_real_escape_string($koneksi, $_POST['harga']);
$nama_file_baru = ""; // Default kosong jika tidak ada gambar

// 2. Cek Apakah ada file gambar yang diupload
if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === 0) {
    $file_tmp = $_FILES['gambar']['tmp_name'];

    // Tambahkan fungsi time() agar nama file unik dan tidak tertimpa
    $nama_file_baru = time() . "_" . $_FILES['gambar']['name'];

    // Pindahkan file dari temporary ke folder uploads/
    move_uploaded_file($file_tmp, "uploads/" . $nama_file_baru);
}

// 3. Masukkan ke Database
$query = "INSERT INTO barang (nama_barang, harga, gambar) VALUES ('$nama', '$harga', '$nama_file_baru')";

if (mysqli_query($koneksi, $query)) {
    echo json_encode(["status" => "success", "pesan" => "Barang & Gambar disimpan!"]);
} else {
    echo json_encode(["status" => "error", "pesan" => "Gagal simpan ke DB"]);
}
?>