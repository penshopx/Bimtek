---
name: Transisi token sesi
description: Kebijakan kompatibilitas saat memperkuat pembuatan token sesi.
---

Penguatan generator token berlaku untuk sesi baru. Jangan mencabut massal sesi aktif hanya untuk mengganti format token.

**Why:** pekerjaan ini dilanjutkan dengan batasan mempertahankan sesi aktif agar pengguna tidak dipaksa keluar. Ini memilih kompatibilitas selama transisi, bukan klaim bahwa token lama ikut diperkuat.

**How to apply:** pertahankan pembacaan sesi lama sampai berakhir atau dicabut melalui kebijakan yang berlaku. Jika ada insiden yang memerlukan pencabutan massal, jelaskan dampaknya dan minta persetujuan secara terpisah.
