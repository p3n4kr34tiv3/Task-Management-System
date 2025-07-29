// Content script untuk scraping data dari Google Maps
console.log('Google Business Profile Scraper loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'startScraping') {
        console.log('Starting scraping process...');
        
        // Check if we're on a Google Maps business profile page
        if (!isBusinessProfilePage()) {
            sendResponse({success: false, error: 'Tidak berada di halaman profil bisnis Google Maps'});
            return;
        }
        
        try {
            const businessData = scrapeBusinessData();
            sendResponse({success: true, data: businessData});
        } catch (error) {
            console.error('Scraping error:', error);
            sendResponse({success: false, error: 'Gagal mengekstrak data: ' + error.message});
        }
    }
    
    return true; // Keep message channel open for async response
});

function isBusinessProfilePage() {
    // Check if current page is a Google Maps business profile
    const url = window.location.href;
    const hasBusinessPanel = document.querySelector('[data-value="Directions"]') || 
                            document.querySelector('[data-value="Save"]') ||
                            document.querySelector('button[data-value="Directions"]');
    
    return (url.includes('maps.google.com') || url.includes('google.com/maps')) && hasBusinessPanel;
}

function scrapeBusinessData() {
    const data = {
        basicInfo: {},
        hours: {},
        reviews: [],
        photos: []
    };
    
    // Scrape basic information
    data.basicInfo = scrapeBasicInfo();
    
    // Scrape operating hours
    data.hours = scrapeOperatingHours();
    
    // Scrape reviews
    data.reviews = scrapeReviews();
    
    // Scrape photos
    data.photos = scrapePhotos();
    
    console.log('Scraped data:', data);
    return data;
}

function scrapeBasicInfo() {
    const basicInfo = {};
    
    try {
        // Business name - multiple possible selectors
        const nameSelectors = [
            'h1[data-attrid="title"]',
            'h1.DUwDvf',
            '.DUwDvf.lfPIob', 
            '[data-attrid="title"] span',
            '.qrShPb .fontHeadlineLarge'
        ];
        
        for (const selector of nameSelectors) {
            const nameElement = document.querySelector(selector);
            if (nameElement && nameElement.textContent.trim()) {
                basicInfo.name = nameElement.textContent.trim();
                break;
            }
        }
        
        // Address
        const addressSelectors = [
            '[data-item-id="address"] .Io6YTe',
            '.Io6YTe.fontBodyMedium',
            '[data-item-id="address"] .rogA2c .Io6YTe'
        ];
        
        for (const selector of addressSelectors) {
            const addressElement = document.querySelector(selector);
            if (addressElement && addressElement.textContent.trim()) {
                basicInfo.address = addressElement.textContent.trim();
                break;
            }
        }
        
        // Phone number
        const phoneSelectors = [
            '[data-item-id*="phone"] .Io6YTe',
            'span[data-phone-number]',
            '.rogA2c:has([data-item-id*="phone"]) .Io6YTe'
        ];
        
        for (const selector of phoneSelectors) {
            const phoneElement = document.querySelector(selector);
            if (phoneElement && phoneElement.textContent.trim()) {
                basicInfo.phone = phoneElement.textContent.trim();
                break;
            }
        }
        
        // Rating and reviews count
        const ratingSelectors = [
            '.MW4etd',
            '.ceNzKf',
            'span.yi40Hd.YrbPuc'
        ];
        
        for (const selector of ratingSelectors) {
            const ratingElement = document.querySelector(selector);
            if (ratingElement && ratingElement.textContent.trim()) {
                const ratingText = ratingElement.textContent.trim();
                const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
                if (ratingMatch) {
                    basicInfo.rating = parseFloat(ratingMatch[1]);
                    break;
                }
            }
        }
        
        // Reviews count
        const reviewsSelectors = [
            '.UY7F9',
            'button.HHrUdb.fontTitleSmall.rqjGif',
            '.F7nice span[aria-label*="reviews"]'
        ];
        
        for (const selector of reviewsSelectors) {
            const reviewsElement = document.querySelector(selector);
            if (reviewsElement) {
                const reviewsText = reviewsElement.textContent || reviewsElement.getAttribute('aria-label') || '';
                const reviewsMatch = reviewsText.match(/(\d+(?:,\d+)*)/);
                if (reviewsMatch) {
                    basicInfo.totalReviews = parseInt(reviewsMatch[1].replace(/,/g, ''));
                    break;
                }
            }
        }
        
    } catch (error) {
        console.error('Error scraping basic info:', error);
    }
    
    return basicInfo;
}

function scrapeOperatingHours() {
    const hours = {};
    
    try {
        // Look for hours section
        const hoursSelectors = [
            '[data-item-id="oh"] .t39EBf',
            '.OqCZI .t39EBf',
            '.lubh7d .t39EBf'
        ];
        
        let hoursContainer = null;
        for (const selector of hoursSelectors) {
            hoursContainer = document.querySelector(selector);
            if (hoursContainer) break;
        }
        
        if (hoursContainer) {
            const dayRows = hoursContainer.querySelectorAll('.y0skZc');
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            
            dayRows.forEach((row, index) => {
                const dayText = row.querySelector('.ylH6lf')?.textContent?.trim();
                const hoursText = row.querySelector('.G8aQO')?.textContent?.trim();
                
                if (dayText && hoursText) {
                    // Map Indonesian day names to English keys
                    const dayMap = {
                        'Minggu': 'sunday',
                        'Senin': 'monday', 
                        'Selasa': 'tuesday',
                        'Rabu': 'wednesday',
                        'Kamis': 'thursday',
                        'Jumat': 'friday',
                        'Sabtu': 'saturday'
                    };
                    
                    const dayKey = dayMap[dayText] || days[index] || `day_${index}`;
                    hours[dayKey] = hoursText;
                }
            });
        }
        
        // Alternative method: look for "Show hours" button and try to extract
        if (Object.keys(hours).length === 0) {
            const showHoursButton = document.querySelector('[data-value="Open hours"]');
            if (showHoursButton) {
                // Click to expand hours (this might not work due to dynamic content)
                // For now, we'll just indicate hours are available but collapsed
                hours.note = 'Jam operasional tersedia, klik "Show hours" untuk detail';
            }
        }
        
    } catch (error) {
        console.error('Error scraping hours:', error);
    }
    
    return hours;
}

function scrapeReviews() {
    const reviews = [];
    
    try {
        // Look for existing reviews on the page
        const reviewSelectors = [
            '.jftiEf .fontBodyMedium',
            '.MyEned .wiI7pd',
            '.gws-localreviews__google-review'
        ];
        
        let reviewElements = [];
        for (const selector of reviewSelectors) {
            reviewElements = document.querySelectorAll(selector);
            if (reviewElements.length > 0) break;
        }
        
        reviewElements.forEach((reviewElement, index) => {
            if (index >= 5) return; // Limit to first 5 reviews
            
            try {
                const review = {};
                
                // Author name
                const authorElement = reviewElement.querySelector('.d4r55') || 
                                    reviewElement.querySelector('.X43Kjb');
                if (authorElement) {
                    review.author = authorElement.textContent.trim();
                }
                
                // Rating
                const ratingElement = reviewElement.querySelector('.kvMYJc') ||
                                    reviewElement.querySelector('span[role="img"]');
                if (ratingElement) {
                    const ariaLabel = ratingElement.getAttribute('aria-label') || '';
                    const ratingMatch = ariaLabel.match(/(\d+)/);
                    if (ratingMatch) {
                        review.rating = parseInt(ratingMatch[1]);
                    }
                }
                
                // Review text
                const textElement = reviewElement.querySelector('.wiI7pd') ||
                                  reviewElement.querySelector('.MyEned');
                if (textElement) {
                    review.text = textElement.textContent.trim();
                }
                
                // Date
                const dateElement = reviewElement.querySelector('.rsqaWe') ||
                                  reviewElement.querySelector('.p2TkOb');
                if (dateElement) {
                    review.date = dateElement.textContent.trim();
                }
                
                if (review.author || review.text) {
                    reviews.push(review);
                }
                
            } catch (reviewError) {
                console.error('Error scraping individual review:', reviewError);
            }
        });
        
    } catch (error) {
        console.error('Error scraping reviews:', error);
    }
    
    return reviews;
}

function scrapePhotos() {
    const photos = [];
    
    try {
        // Look for photo elements
        const photoSelectors = [
            '.DaScie img',
            '.loaded img[src*="googleusercontent"]',
            '.gallery img'
        ];
        
        let photoElements = [];
        for (const selector of photoSelectors) {
            photoElements = document.querySelectorAll(selector);
            if (photoElements.length > 0) break;
        }
        
        photoElements.forEach((img, index) => {
            if (index >= 10) return; // Limit to first 10 photos
            
            const src = img.src || img.getAttribute('data-src');
            if (src && src.includes('googleusercontent')) {
                // Clean up the URL and make it higher resolution
                const cleanUrl = src.split('=')[0] + '=w600-h400';
                photos.push(cleanUrl);
            }
        });
        
        // Remove duplicates
        const uniquePhotos = [...new Set(photos)];
        
    } catch (error) {
        console.error('Error scraping photos:', error);
    }
    
    return photos;
}

// Add some utility functions
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                obs.disconnect();
            }
        });
        
        observer.observe(document, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}