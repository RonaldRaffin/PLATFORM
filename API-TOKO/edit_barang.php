<?php
include "koneksi.php";

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (isset($data['id']) && isset($data['nama_barang']) && isset($data['harga'])) {

    $id    = (int) $data['id'];
    $nama  = $data['nama_barang'];
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