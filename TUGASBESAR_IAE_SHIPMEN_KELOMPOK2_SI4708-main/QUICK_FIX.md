# 🔧 Quick Fix: Docker Hub Authentication Error

## Error yang Terjadi
```
401 Unauthorized: email must be verified before using account
failed to fetch oauth token
```

## ⚠️ PENTING: Email Harus Diverifikasi!

**Error ini terjadi karena email Docker Hub Anda belum diverifikasi.**

## ✅ Solusi Cepat (Ikuti Urutan)

### Solusi 1: Verifikasi Email Dulu (WAJIB!)

**Langkah 1: Verifikasi Email**
1. Buka: https://hub.docker.com
2. Login ke akun Anda
3. Cek email Anda (cek juga folder spam)
4. Klik link verifikasi email dari Docker Hub
5. Pastikan status email "Verified" di https://hub.docker.com/settings/email

**Langkah 2: Login dari PowerShell**
```powershell
docker login
# Masukkan username dan password
```

**Langkah 3: Pull Images**
```powershell
docker pull node:18-alpine
docker pull postgres:15-alpine
```

**Langkah 4: Build Services**
```powershell
docker-compose up --build
```

### Solusi 2: Pull Image Manual Dulu
```powershell
# Pull base images terlebih dahulu
docker pull node:18-alpine
docker pull postgres:15-alpine

# Kemudian jalankan docker-compose
docker-compose up --build
```

### Solusi 3: Gunakan Setup Script
```powershell
# Windows PowerShell
.\setup.ps1

# Script akan otomatis pull images dan start services
```

### Solusi 4: Build Tanpa Pull (Jika Image Sudah Ada)
```powershell
# Cek apakah image sudah ada
docker images | findstr "node\|postgres"

# Jika sudah ada, langsung build tanpa pull
docker-compose build
docker-compose up
```

### Solusi 5: Bypass dengan Build Cache
```powershell
# Clear build cache dulu
docker builder prune -f

# Kemudian build lagi
docker-compose up --build
```

## 🚀 Setelah Login/Berhasil Pull Images

Jalankan:
```powershell
docker-compose up --build
```

## 📝 Catatan Penting

- **Email HARUS diverifikasi** - ini adalah requirement Docker Hub
- Jika tidak punya akun, buat akun gratis di https://hub.docker.com
- **Cek folder spam** - email verifikasi mungkin masuk ke spam
- Setelah verifikasi email, tunggu 1-2 menit sebelum login
- Jika masih error setelah verifikasi, coba:
  ```powershell
  docker logout
  docker login
  ```

## 🆘 Masih Error?

Jalankan script helper:
```powershell
.\fix-docker.ps1
```

Atau baca panduan lengkap di: `SOLUSI_DOCKER_ERROR.md`

