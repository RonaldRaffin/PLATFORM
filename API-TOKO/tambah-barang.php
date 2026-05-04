<?php
include "koneksi.php";

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (isset($data['nama_barang']) && isset($data['harga'])) {

    $nama  = $data['nama_barang'];
    $harga = $data['harga'];

    $query = "INSERT INTO barang (nama_barang, harga) 
              VALUES ('$nama', '$harga')";

    if (mysqli_query($koneksi, $query)) {
        echo json_encode([
            "status" => "success",
            "pesan" => "data berhasil ditambahkan"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "pesan" => "gagal menambahkan data"
        ]);
    }

} else {
    echo json_encode([
        "status" => "error",
        "pesan" => "data tidak lengkap"
    ]);
}
?>