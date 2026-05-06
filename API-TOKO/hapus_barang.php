<?php
include "koneksi.php";

$json_data = file_get_contents('php://input');
$data = json_decode($json_data, true);

if (isset($data['id'])) {

    $id = (int) $data['id'];

    $query = "DELETE FROM barang WHERE id = $id";

    if (mysqli_query($koneksi, $query)) {
        if (mysqli_affected_rows($koneksi) > 0) {
            echo json_encode([
                "status" => "success",
                "pesan"  => "Data berhasil dihapus"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "pesan"  => "Data tidak ditemukan"
            ]);
        }
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