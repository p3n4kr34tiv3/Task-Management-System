# Panduan Instalasi Chrome Extension

## Langkah-langkah Instalasi

### 1. Persiapan File
Pastikan semua file extension berada di folder `/app/chrome-extension/`:
```
chrome-extension/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
├── icons/
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md
```

### 2. Buka Chrome Extensions
1. Buka Google Chrome
2. Ketik di address bar: `chrome://extensions/`
3. Atau melalui menu: **⋮ > More Tools > Extensions**

### 3. Aktifkan Developer Mode
1. Di halaman Extensions, cari toggle **"Developer mode"** di kanan atas
2. Klik untuk mengaktifkannya
3. Akan muncul tombol tambahan: "Load unpacked", "Pack extension", dll.

### 4. Load Extension
1. Klik tombol **"Load unpacked"**
2. Pilih folder `/app/chrome-extension/` (folder yang berisi manifest.json)  
3. Klik **"Select Folder"**
4. Extension akan muncul di daftar dengan nama "Google Business Profile Scraper"

### 5. Pin Extension (Opsional)
1. Klik icon puzzle 🧩 di toolbar Chrome (sebelah address bar)
2. Cari "Google Business Profile Scraper"
3. Klik icon pin 📌 untuk menambahkan ke toolbar

## Penggunaan

### Langkah 1: Buka Google Maps
1. Pergi ke [maps.google.com](https://maps.google.com)
2. Cari bisnis yang ingin di-scrape
3. Klik pada bisnis untuk membuka detail panel

### Langkah 2: Jalankan Extension
1. Klik icon extension di toolbar (atau dari menu puzzle)
2. Popup akan muncul dengan interface scraper
3. Klik **"Mulai Scraping"**
4. Tunggu proses selesai

### Langkah 3: Export Data
1. Pilih data yang ingin diekspor
2. Klik **"Export ke CSV"**
3. File akan ter-download otomatis

## Troubleshooting

### Extension tidak muncul
- Pastikan folder berisi file `manifest.json`
- Check console untuk error messages
- Restart Chrome

### "Halaman tidak didukung"
- Pastikan berada di Google Maps
- Refresh halaman Maps
- Klik pada profil bisnis terlebih dahulu

### Scraping gagal
- Refresh halaman dan coba lagi
- Check console browser (F12) untuk error
- Pastikan profil bisnis memiliki data lengkap

### Data tidak lengkap
- Google Maps memiliki struktur yang dinamis
- Tidak semua bisnis memiliki data lengkap
- Coba bisnis lain untuk testing

## Update Extension

Jika melakukan perubahan pada code:
1. Pergi ke `chrome://extensions/`
2. Cari extension "Google Business Profile Scraper"
3. Klik tombol **refresh** 🔄
4. Extension akan reload dengan perubahan terbaru

## Uninstall

1. Pergi ke `chrome://extensions/`
2. Cari extension "Google Business Profile Scraper"  
3. Klik **"Remove"**
4. Konfirmasi penghapusan