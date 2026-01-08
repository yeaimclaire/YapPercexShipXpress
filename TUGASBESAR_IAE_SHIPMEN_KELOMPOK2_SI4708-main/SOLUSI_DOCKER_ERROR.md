# 🔧 Solusi Error Docker Hub Authentication

## ❌ Error yang Terjadi
```
401 Unauthorized: email must be verified before using account
```

## ✅ SOLUSI LENGKAP (Ikuti Langkah Demi Langkah)

### **LANGKAH 1: Verifikasi Email Docker Hub**

1. **Buka browser dan kunjungi:** https://hub.docker.com
2. **Login ke akun Docker Hub Anda** (atau buat akun baru jika belum punya)
3. **Cek email Anda** - Docker Hub akan mengirim email verifikasi
4. **Klik link verifikasi** di email tersebut
5. **Pastikan email sudah terverifikasi** - cek di https://hub.docker.com/settings/email

### **LANGKAH 2: Login ke Docker dari PowerShell**

Setelah email terverifikasi, jalankan:

```powershell
docker login
```

**Masukkan:**
- Username: username Docker Hub Anda
- Password: password Docker Hub Anda

**Contoh output yang benar:**
```
Login Succeeded
```

### **LANGKAH 3: Pull Images**

Setelah login berhasil, pull images:

```powershell
docker pull node:18-alpine
docker pull postgres:15-alpine
```

### **LANGKAH 4: Build dan Start Services**

```powershell
docker-compose up --build
```

---

## 🚀 ALTERNATIF: Jika Tidak Bisa Login

### **Opsi A: Gunakan Script Fix**

```powershell
.\fix-docker.ps1
```

Script ini akan membantu Anda step-by-step.

### **Opsi B: Build Tanpa Pull (Jika Image Sudah Ada)**

```powershell
# Cek image yang sudah ada
docker images

# Jika node:18-alpine dan postgres:15-alpine sudah ada, langsung build
docker-compose build
docker-compose up
```

### **Opsi C: Buat Akun Docker Hub Baru**

1. Buka: https://hub.docker.com/signup
2. Buat akun baru dengan email yang valid
3. Verifikasi email (cek inbox/spam)
4. Login: `docker login`
5. Pull images dan build

---

## 📝 CATATAN PENTING

- **Docker Hub gratis** - tidak perlu bayar untuk pull public images
- **Email HARUS diverifikasi** - ini wajib untuk pull images
- **Jika lupa password** - reset di https://hub.docker.com/forgot-password

---

## 🔍 Troubleshooting

### Masih Error Setelah Login?

```powershell
# Logout dan login lagi
docker logout
docker login

# Clear Docker cache
docker system prune -a

# Coba lagi
docker pull node:18-alpine
```

### Docker Desktop Tidak Running?

1. Buka Docker Desktop
2. Tunggu sampai status "Running" (ikon hijau)
3. Coba lagi

### Network/Firewall Issue?

```powershell
# Test koneksi ke Docker Hub
ping registry-1.docker.io

# Jika tidak bisa ping, cek firewall/proxy settings
```

---

## ✅ Setelah Berhasil

Setelah semua langkah di atas berhasil, jalankan:

```powershell
docker-compose up --build
```

Services akan mulai running di:
- Gateway: http://localhost:4000/graphql
- Customer: http://localhost:4001/graphql
- Vehicle: http://localhost:4002/graphql
- Driver: http://localhost:4003/graphql
- Shipment: http://localhost:4004/graphql
- Tracking: http://localhost:4005/graphql

