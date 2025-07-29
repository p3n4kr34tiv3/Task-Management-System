// Background script untuk mengelola ekstensi
console.log('Google Business Profile Scraper background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details);
    
    if (details.reason === 'install') {
        // Set up default settings
        chrome.storage.sync.set({
            'scraping_enabled': true,
            'export_format': 'csv',
            'max_reviews': 10,
            'max_photos': 10
        });
    }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    if (request.action === 'saveScrapedData') {
        // Save scraped data to storage
        saveScrapedData(request.data)
            .then(() => {
                sendResponse({success: true});
            })
            .catch((error) => {
                console.error('Error saving data:', error);
                sendResponse({success: false, error: error.message});
            });
        return true; // Keep message channel open
    }
    
    if (request.action === 'getScrapedData') {
        // Retrieve scraped data from storage
        getScrapedData()
            .then((data) => {
                sendResponse({success: true, data: data});
            })
            .catch((error) => {
                console.error('Error retrieving data:', error);
                sendResponse({success: false, error: error.message});
            });
        return true;
    }
    
    if (request.action === 'exportData') {
        // Handle data export
        exportData(request.data, request.format)
            .then(() => {
                sendResponse({success: true});
            })
            .catch((error) => {
                console.error('Export error:', error);
                sendResponse({success: false, error: error.message});
            });
        return true;
    }
});

// Save scraped data to Chrome storage
async function saveScrapedData(data) {
    const timestamp = new Date().toISOString();
    const dataEntry = {
        ...data,
        timestamp: timestamp,
        id: generateId()
    };
    
    try {
        // Get existing data
        const result = await chrome.storage.local.get(['scrapedBusinesses']);
        const existingData = result.scrapedBusinesses || [];
        
        // Add new entry
        existingData.push(dataEntry);
        
        // Keep only last 50 entries to avoid storage limit
        if (existingData.length > 50) {
            existingData.splice(0, existingData.length - 50);
        }
        
        // Save back to storage
        await chrome.storage.local.set({'scrapedBusinesses': existingData});
        
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Error saving to storage:', error);
        throw error;
    }
}

// Retrieve scraped data from Chrome storage
async function getScrapedData() {
    try {
        const result = await chrome.storage.local.get(['scrapedBusinesses']);
        return result.scrapedBusinesses || [];
    } catch (error) {
        console.error('Error retrieving from storage:', error);
        throw error;
    }
}

// Export data to CSV
async function exportData(data, format = 'csv') {
    try {
        let content = '';
        let filename = '';
        let mimeType = '';
        
        if (format === 'csv') {
            content = convertToCSV(data);
            filename = `google-business-data-${Date.now()}.csv`;
            mimeType = 'text/csv';
        } else if (format === 'json') {
            content = JSON.stringify(data, null, 2);
            filename = `google-business-data-${Date.now()}.json`;
            mimeType = 'application/json';
        }
        
        // Create blob and download
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        // Use Chrome downloads API
        await chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
        });
        
        console.log('Export completed');
    } catch (error) {
        console.error('Export error:', error);
        throw error;
    }
}

// Convert data to CSV format
function convertToCSV(data) {
    if (!Array.isArray(data)) {
        data = [data];
    }
    
    const headers = [
        'Timestamp',
        'Business Name',
        'Address', 
        'Phone',
        'Rating',
        'Total Reviews',
        'Monday Hours',
        'Tuesday Hours',
        'Wednesday Hours',
        'Thursday Hours',
        'Friday Hours',
        'Saturday Hours',
        'Sunday Hours',
        'Photo Count',
        'Sample Photo URLs',
        'Sample Reviews'
    ];
    
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(entry => {
        const row = [
            entry.timestamp || '',
            `"${entry.basicInfo?.name || ''}"`,
            `"${entry.basicInfo?.address || ''}"`,
            `"${entry.basicInfo?.phone || ''}"`,
            entry.basicInfo?.rating || '',
            entry.basicInfo?.totalReviews || '',
            `"${entry.hours?.monday || ''}"`,
            `"${entry.hours?.tuesday || ''}"`,
            `"${entry.hours?.wednesday || ''}"`,
            `"${entry.hours?.thursday || ''}"`,
            `"${entry.hours?.friday || ''}"`,
            `"${entry.hours?.saturday || ''}"`,
            `"${entry.hours?.sunday || ''}"`,
            entry.photos?.length || 0,
            `"${entry.photos?.slice(0, 3).join('; ') || ''}"`,
            `"${entry.reviews?.slice(0, 2).map(r => `${r.author}: ${r.text}`).join('; ') || ''}"`
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Handle context menu (optional feature)
chrome.contextMenus.create({
    id: "scrapeCurrentBusiness",
    title: "Scrape Business Profile",
    contexts: ["page"],
    documentUrlPatterns: ["*://maps.google.com/*", "*://www.google.com/maps/*"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "scrapeCurrentBusiness") {
        // Send message to content script to start scraping
        chrome.tabs.sendMessage(tab.id, {action: 'startScraping'});
    }
});

// Handle browser action click (when user clicks extension icon)
chrome.action.onClicked.addListener((tab) => {
    // Open popup (this is handled automatically by manifest, but we can add custom logic here)
    console.log('Extension icon clicked on tab:', tab.url);
});