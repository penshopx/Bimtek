---
name: Quiz statistics performance
description: Batas manfaat indeks satu kolom untuk agregasi seluruh riwayat kuis.
---

Jangan menjanjikan statistik kuis di bawah satu milidetik untuk semua ukuran riwayat hanya dengan indeks `question_id`.

**Why:** Pengukuran SQLite dengan riwayat yang bergantian antarsoal menunjukkan kedua agregasi bisa lebih lambat setelah indeks satu kolom digunakan. Indeks bukan covering index untuk nilai yang dibaca, dan agregasi tetap membaca seluruh riwayat. Penggunaan indeks di query plan bukan bukti peningkatan waktu.

**How to apply:** Ukur sebelum/sesudah dengan distribusi soal, opsi, dan percobaan invalidated yang realistis. Covering index yang mencakup kolom agregasi terbukti mempercepat kedua kueri pada distribusi bergantian maupun terkumpul, tetapi waktu tetap bertambah bersama jumlah baris. Untuk target waktu yang tidak bergantung pada volume, evaluasi ringkasan inkremental sebagai perubahan terpisah dan pertahankan aturan retensi, invalidasi, dan reset.
