// Popup script untuk mengelola interface ekstensi
document.addEventListener('DOMContentLoaded', function() {
    const startScrapingBtn = document.getElementById('startScraping');
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsList = document.getElementById('resultsList');
    const exportOptions = document.getElementById('exportOptions');
    const exportCsvBtn = document.getElementById('exportCsv');
    
    let scrapedData = null;

    // Check if current tab is Google Maps
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        if (!currentUrl.includes('maps.google.com') && !currentUrl.includes('google.com/maps')) {
            statusDot.className = 'status-dot';
            statusDot.style.background = '#ef4444';
            statusText.textContent = 'Buka Google Maps terlebih dahulu';
            startScrapingBtn.disabled = true;
            startScrapingBtn.textContent = '❌ Halaman tidak didukung';
        }
    });

    // Handle start scraping button
    startScrapingBtn.addEventListener('click', function() {
        startScraping();
    });

    // Handle export CSV button
    exportCsvBtn.addEventListener('click', function() {
        exportToCSV();
    });

    function startScraping() {
        // Update UI to show scraping in progress
        startScrapingBtn.disabled = true;
        startScrapingBtn.textContent = '⏳ Sedang Scraping...';
        statusDot.className = 'status-dot scraping';
        statusText.textContent = 'Mengekstrak data...';
        progressContainer.style.display = 'block';
        
        // Send message to content script to start scraping
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'startScraping'}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error:', chrome.runtime.lastError);
                    showError('Gagal memulai scraping. Refresh halaman dan coba lagi.');
                    return;
                }
                
                if (response && response.success) {
                    // Simulate progress (in real implementation, this would come from content script)
                    simulateProgress();
                } else {
                    showError(response ? response.error : 'Tidak dapat memulai scraping');
                }
            });
        });
    }

    function simulateProgress() {
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            progressFill.style.width = progress + '%';
            
            if (progress < 30) {
                progressText.textContent = 'Menganalisis halaman...';
            } else if (progress < 60) {
                progressText.textContent = 'Mengekstrak info dasar...';
            } else if (progress < 80) {
                progressText.textContent = 'Mengumpulkan review...';
            } else if (progress < 95) {
                progressText.textContent = 'Mengumpulkan foto...';
            } else {
                progressText.textContent = 'Menyelesaikan...';
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    showResults();
                }, 500);
            }
        }, 200);
    }

    function showResults() {
        // Hide progress
        progressContainer.style.display = 'none';
        
        // Update status
        statusDot.className = 'status-dot';
        statusDot.style.background = '#4ade80';
        statusText.textContent = 'Scraping selesai';
        
        // Reset button
        startScrapingBtn.disabled = false;
        startScrapingBtn.innerHTML = '<span class="icon">🔍</span>Scrape Lagi';
        
        // Show results (mock data for demo)
        scrapedData = generateMockData();
        displayResults(scrapedData);
        
        // Show results container
        resultsContainer.classList.add('show');
        exportOptions.classList.add('show');
    }

    function generateMockData() {
        return {
            basicInfo: {
                name: 'Warung Makan Sederhana',
                address: 'Jl. Sudirman No. 123, Jakarta Selatan',
                phone: '+62 21 1234 5678',
                rating: 4.5,
                totalReviews: 127
            },
            hours: {
                monday: '08:00 - 22:00',
                tuesday: '08:00 - 22:00',
                wednesday: '08:00 - 22:00',
                thursday: '08:00 - 22:00',
                friday: '08:00 - 22:00',
                saturday: '08:00 - 23:00',
                sunday: '09:00 - 21:00'
            },
            reviews: [
                {
                    author: 'John D.',
                    rating: 5,
                    text: 'Makanan enak dan pelayanan ramah',
                    date: '2024-01-15'
                },
                {
                    author: 'Sarah M.',
                    rating: 4,
                    text: 'Harga terjangkau, rasa oke',
                    date: '2024-01-10'
                }
            ],
            photos: [
                'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=sample1',
                'https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=sample2'
            ]
        };
    }

    function displayResults(data) {
        resultsList.innerHTML = `
            <div class="result-item">
                <div class="result-name">${data.basicInfo.name}</div>
                <div class="result-details">
                    📍 ${data.basicInfo.address}<br>
                    📞 ${data.basicInfo.phone}<br>
                    ⭐ ${data.basicInfo.rating} (${data.basicInfo.totalReviews} review)
                </div>
            </div>
            <div class="result-item">
                <div class="result-name">📸 Foto: ${data.photos.length} gambar</div>
                <div class="result-name">💬 Review: ${data.reviews.length} review</div>
            </div>
        `;
    }

    function exportToCSV() {
        if (!scrapedData) return;
        
        const exportBasicInfo = document.getElementById('exportBasicInfo').checked;
        const exportHours = document.getElementById('exportHours').checked;
        const exportReviews = document.getElementById('exportReviews').checked;
        const exportPhotos = document.getElementById('exportPhotos').checked;
        
        let csvContent = '';
        let headers = [];
        let values = [];
        
        // Basic info
        if (exportBasicInfo) {
            headers.push('Nama Bisnis', 'Alamat', 'Telepon', 'Rating', 'Total Review');
            values.push(
                scrapedData.basicInfo.name,
                scrapedData.basicInfo.address,
                scrapedData.basicInfo.phone,
                scrapedData.basicInfo.rating,
                scrapedData.basicInfo.totalReviews
            );
        }
        
        // Hours
        if (exportHours) {
            headers.push('Jam Senin', 'Jam Selasa', 'Jam Rabu', 'Jam Kamis', 'Jam Jumat', 'Jam Sabtu', 'Jam Minggu');
            values.push(
                scrapedData.hours.monday,
                scrapedData.hours.tuesday,
                scrapedData.hours.wednesday,
                scrapedData.hours.thursday,
                scrapedData.hours.friday,
                scrapedData.hours.saturday,
                scrapedData.hours.sunday
            );
        }
        
        // Photos
        if (exportPhotos) {
            headers.push('Jumlah Foto', 'URL Foto 1', 'URL Foto 2');
            values.push(
                scrapedData.photos.length,
                scrapedData.photos[0] || '',
                scrapedData.photos[1] || ''
            );
        }
        
        // Create CSV content
        csvContent = headers.join(',') + '\n';
        csvContent += values.map(value => `"${value}"`).join(',') + '\n';
        
        // Add reviews if selected
        if (exportReviews) {
            csvContent += '\n\nReview Data:\n';
            csvContent += 'Nama,Rating,Komentar,Tanggal\n';
            scrapedData.reviews.forEach(review => {
                csvContent += `"${review.author}","${review.rating}","${review.text}","${review.date}"\n`;
            });
        }
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `google-business-profile-${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        exportCsvBtn.innerHTML = '<span class="icon">✅</span>Berhasil Export!';
        setTimeout(() => {
            exportCsvBtn.innerHTML = '<span class="icon">📄</span>Export ke CSV';
        }, 2000);
    }

    function showError(message) {
        statusDot.className = 'status-dot';
        statusDot.style.background = '#ef4444';
        statusText.textContent = message;
        startScrapingBtn.disabled = false;
        startScrapingBtn.innerHTML = '<span class="icon">🔍</span>Coba Lagi';
        progressContainer.style.display = 'none';
    }
});