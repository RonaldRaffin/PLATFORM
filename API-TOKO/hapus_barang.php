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

if (isset($data['id'])) {

    $id = (int) $data['id'];

    // Ambil nama file gambar dulu sebelum dihapus
    $cek = mysqli_query($koneksi, "SELECT gambar FROM barang WHERE id=$id");
    if ($row = mysqli_fetch_assoc($cek)) {
        $namaGambar = $row['gambar'];

        // Hapus file foto jika ada
        if (!empty($namaGambar)) {
            $pathGambar = __DIR__ . '/uploads/' . $namaGambar;
            if (file_exists($pathGambar)) {
                unlink($pathGambar);
            }
        }
    }

    // Hapus dari database
    $query = "DELETE FROM barang WHERE id=$id";

    if (mysqli_query($koneksi, $query)) {
        echo json_encode([
            "status" => "success",
            "pesan"  => "Data berhasil dihapus"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "pesan"  => "Gagal menghapus data"
        ]);
    }

} else {
    echo json_encode([
        "status" => "error",
        "pesan"  => "ID tidak ditemukan"
    ]);
}
?>