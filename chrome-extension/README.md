# Google Business Profile Scraper - Chrome Extension

Ekstensi Chrome untuk mengekstrak data profil bisnis dari Google Maps dengan fitur export ke CSV/Excel.

## 🚀 Fitur Utama

- **Scraping Otomatis**: Ekstrak data profil bisnis Google Maps secara otomatis
- **Data Lengkap**: Nama bisnis, alamat, telepon, jam operasional, rating, review, dan foto
- **Export Fleksibel**: Export data ke format CSV dengan pilihan kolom yang bisa dikustomisasi  
- **Interface Modern**: UI yang intuitive dengan animasi dan gradient yang menarik
- **Real-time Progress**: Progress bar dan status update selama proses scraping

## 📊 Data yang Dapat Diekstrak

### Info Dasar
- Nama bisnis
- Alamat lengkap
- Nomor telepon
- Rating (bintang)
- Jumlah total review

### Jam Operasional
- Jam buka/tutup untuk setiap hari dalam seminggu
- Status buka/tutup saat ini

### Review & Rating
- Nama reviewer
- Rating individual
- Teks review
- Tanggal review

### Foto Bisnis
- URL foto profil bisnis
- URL foto-foto tambahan
- Jumlah total foto

## 🛠️ Instalasi

### Manual Installation (Developer Mode)

1. **Download atau Clone Repository**
   ```bash
   git clone [repository-url]
   cd chrome-extension
   ```

2. **Buka Chrome Extensions**
   - Buka Chrome
   - Pergi ke `chrome://extensions/`
   - Aktifkan "Developer mode" (toggle di kanan atas)

3. **Load Extension**
   - Klik "Load unpacked"
   - Pilih folder `/app/chrome-extension`
   - Extension akan muncul di daftar

4. **Pin Extension** (Opsional)
   - Klik icon puzzle di toolbar Chrome  
   - Klik pin pada "Google Business Profile Scraper"

## 📖 Cara Penggunaan

### Langkah 1: Buka Google Maps
1. Pergi ke [Google Maps](https://maps.google.com)
2. Cari bisnis yang ingin di-scrape
3. Klik pada profil bisnis untuk membuka panel detail

### Langkah 2: Jalankan Scraper
1. Klik icon extension di toolbar Chrome
2. Pastikan status menunjukkan "Siap untuk scraping"
3. Klik tombol **"Mulai Scraping"**
4. Tunggu hingga proses selesai (progress bar akan menunjukkan kemajuan)

### Langkah 3: Export Data
1. Setelah scraping selesai, pilih data yang ingin diekspor:
   - ✅ Info Dasar (Nama, Alamat, Telepon)
   - ✅ Jam Operasional
   - ✅ Review & Rating  
   - ✅ URL Foto
2. Klik **"Export ke CSV"**
3. File akan otomatis ter-download

## 📁 Format Output CSV

File CSV yang dihasilkan memiliki struktur sebagai berikut:

```csv
Nama Bisnis,Alamat,Telepon,Rating,Total Review,Jam Senin,Jam Selasa,...
"Warung Makan Sederhana","Jl. Sudirman No. 123","021-1234567",4.5,127,"08:00-22:00","08:00-22:00",...

Review Data:
Nama,Rating,Komentar,Tanggal
"John D.",5,"Makanan enak dan pelayanan ramah","2024-01-15"
"Sarah M.",4,"Harga terjangkau, rasa oke","2024-01-10"
```

## ⚠️ Perhatian Penting

### Terms of Service
- **Gunakan dengan bijak**: Patuhi Terms of Service Google
- **Rate Limiting**: Jangan melakukan scraping berlebihan
- **Data Privacy**: Hormati privasi data bisnis dan reviewer

### Batasan Teknis
- Extension hanya bekerja di halaman Google Maps
- Beberapa data mungkin tidak tersedia untuk semua bisnis
- Kualitas data tergantung pada kelengkapan profil bisnis

### Troubleshooting
- **"Halaman tidak didukung"**: Pastikan Anda berada di Google Maps
- **Scraping gagal**: Refresh halaman dan coba lagi
- **Data kosong**: Profil bisnis mungkin tidak memiliki data lengkap

## 🔧 Pengembangan

### Struktur File
```
/chrome-extension/
├── manifest.json          # Extension manifest (v3)
├── popup.html             # UI popup extension
├── popup.js               # Logic untuk popup interface  
├── content.js             # Script untuk scraping data
├── background.js          # Service worker untuk background tasks
└── README.md              # Dokumentasi ini
```

### Teknologi yang Digunakan
- **Manifest V3**: Chrome Extension format terbaru
- **Vanilla JavaScript**: Tanpa framework external
- **CSS3**: Modern styling dengan gradients dan animations
- **Chrome APIs**: Storage, Downloads, Tabs APIs

### Customization
Anda dapat memodifikasi:
- **Selector CSS**: Update selector di `content.js` jika Google mengubah struktur
- **UI Styling**: Sesuaikan tampilan di `popup.html` dan CSS
- **Export Format**: Tambah format export lain di `background.js`

## 📝 Changelog

### v1.0 (Current)
- ✅ Basic scraping functionality
- ✅ CSV export feature
- ✅ Modern UI with animations
- ✅ Progress tracking
- ✅ Error handling

### Roadmap
- 📋 Batch scraping multiple businesses
- 📊 Excel export dengan formatting
- 🔄 Auto-sync dengan cloud storage
- 📱 Mobile support (jika memungkinkan)

## 📞 Support

Jika mengalami masalah atau memiliki saran:
1. Periksa console browser untuk error messages
2. Pastikan extension permissions sudah diberikan
3. Coba refresh halaman Google Maps
4. Restart Chrome jika diperlukan

---

**⚠️ Disclaimer**: Extension ini dibuat untuk tujuan edukasi dan penelitian. Pengguna bertanggung jawab untuk mematuhi Terms of Service Google dan peraturan yang berlaku.