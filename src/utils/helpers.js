/**
 * Helper Utilities for MoMech
 * General utility functions used throughout the application
 */

/**
 * Debounce function calls
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to call immediately
 * @returns {function} - Debounced function
 */
export function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Throttle function calls
 * @param {function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {function} - Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} - Cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
}

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} - Unique ID
 */
export function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2);
    return prefix + timestamp + random;
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Create DOM element from HTML string
 * @param {string} html - HTML string
 * @returns {Element} - DOM element
 */
export function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

/**
 * Get URL parameters from current location
 * @returns {object} - URL parameters object
 */
export function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

/**
 * Set URL parameters without page reload
 * @param {object} params - Parameters to set
 */
export function setUrlParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
    });
    window.history.replaceState({}, '', url);
}

/**
 * Download data as file
 * @param {string} data - Data to download
 * @param {string} filename - Filename
 * @param {string} type - MIME type
 */
export function downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            textArea.remove();
            return result;
        }
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone format
 * @param {string} phone - Phone to validate
 * @returns {boolean} - Whether phone is valid
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Convert camelCase to snake_case
 * @param {string} str - String to convert
 * @returns {string} - snake_case string
 */
export function camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 * @param {string} str - String to convert
 * @returns {string} - camelCase string
 */
export function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Convert object keys from camelCase to snake_case
 * @param {object} obj - Object to convert
 * @returns {object} - Object with snake_case keys
 */
export function objectToSnakeCase(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Array) return obj.map(item => objectToSnakeCase(item));
    
    const converted = {};
    Object.keys(obj).forEach(key => {
        const snakeKey = camelToSnake(key);
        converted[snakeKey] = objectToSnakeCase(obj[key]);
    });
    return converted;
}

/**
 * Convert object keys from snake_case to camelCase
 * @param {object} obj - Object to convert
 * @returns {object} - Object with camelCase keys
 */
export function objectToCamelCase(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Array) return obj.map(item => objectToCamelCase(item));
    
    const converted = {};
    Object.keys(obj).forEach(key => {
        const camelKey = snakeToCamel(key);
        converted[camelKey] = objectToCamelCase(obj[key]);
    });
    return converted;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after sleep
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with function result
 */
export async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i === maxRetries) break;
            
            const delay = baseDelay * Math.pow(2, i);
            await sleep(delay);
        }
    }
    
    throw lastError;
}

/**
 * Group array of objects by a key
 * @param {array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {object} - Grouped object
 */
export function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
}

/**
 * Sort array of objects by multiple keys
 * @param {array} array - Array to sort
 * @param {array} sortKeys - Array of sort key objects {key, order}
 * @returns {array} - Sorted array
 */
export function multiSort(array, sortKeys) {
    return array.sort((a, b) => {
        for (const { key, order = 'asc' } of sortKeys) {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

/**
 * Calculate pagination info
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} - Pagination info
 */
export function calculatePagination(page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
        page,
        limit,
        total,
        totalPages,
        offset,
        hasNext,
        hasPrev,
        startItem: offset + 1,
        endItem: Math.min(offset + limit, total)
    };
}

/**
 * Format search query for API
 * @param {string} query - Search query
 * @returns {string} - Formatted query
 */
export function formatSearchQuery(query) {
    if (!query) return '';
    return query.trim().toLowerCase();
}

/**
 * Check if device is mobile
 * @returns {boolean} - Whether device is mobile
 */
export function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Check if device is tablet
 * @returns {boolean} - Whether device is tablet
 */
export function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

/**
 * Check if device is desktop
 * @returns {boolean} - Whether device is desktop
 */
export function isDesktop() {
    return window.innerWidth > 1024;
}

/**
 * Scroll to element smoothly
 * @param {string|Element} element - Element or selector
 * @param {object} options - Scroll options
 */
export function scrollToElement(element, options = {}) {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
            ...options
        });
    }
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) {
        return '0';
    }
    return num.toLocaleString();
}

/**
 * Get status badge class for UI
 * @param {string} status - Status value
 * @returns {string} - CSS class string
 */
export function getStatusBadgeClass(status) {
    const classes = {
        // Appointment statuses
        scheduled: 'bg-blue-100 text-blue-800',
        confirmed: 'bg-green-100 text-green-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        no_show: 'bg-gray-100 text-gray-800',
        
        // Invoice statuses
        draft: 'bg-gray-100 text-gray-800',
        sent: 'bg-blue-100 text-blue-800',
        paid: 'bg-green-100 text-green-800',
        overdue: 'bg-red-100 text-red-800',
        
        // Work order statuses
        open: 'bg-blue-100 text-blue-800',
        
        // Priority levels
        low: 'bg-gray-100 text-gray-800',
        normal: 'bg-blue-100 text-blue-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800'
    };
    
    return classes[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get priority badge class for UI
 * @param {string} priority - Priority value
 * @returns {string} - CSS class string
 */
export function getPriorityBadgeClass(priority) {
    return getStatusBadgeClass(priority);
}

/**
 * Create a promise that resolves after specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Promise that resolves after delay
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param {any} value - Value to check
 * @returns {boolean} - Whether value is empty
 */
export function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} - Title case string
 */
export function titleCase(str) {
    if (!str) return '';
    return str.split(' ').map(word => capitalize(word)).join(' ');
}

/**
 * Generate color based on string (for avatars, etc.)
 * @param {string} str - String to generate color from
 * @returns {string} - Hex color
 */
export function stringToColor(str) {
    if (!str) return '#6b7280';
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} - Initials
 */
export function getInitials(name) {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted bytes
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} - Whether date is today
 */
export function isToday(date) {
    const today = new Date();
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    
    return today.toDateString() === checkDate.toDateString();
}

/**
 * Check if date is this week
 * @param {string|Date} date - Date to check
 * @returns {boolean} - Whether date is this week
 */
export function isThisWeek(date) {
    const today = new Date();
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    return checkDate >= startOfWeek && checkDate <= endOfWeek;
}

/**
 * Get business days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Number of business days
 */
export function getBusinessDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;
    
    while (start <= end) {
        const dayOfWeek = start.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
            businessDays++;
        }
        start.setDate(start.getDate() + 1);
    }
    
    return businessDays;
}

/**
 * Create a safe object accessor that won't throw errors
 * @param {object} obj - Object to access
 * @param {string} path - Dot notation path (e.g., 'user.profile.name')
 * @param {any} defaultValue - Default value if path doesn't exist
 * @returns {any} - Value at path or default value
 */
export function safeGet(obj, path, defaultValue = null) {
    if (!obj || !path) return defaultValue;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current;
}

/**
 * Merge multiple objects deeply
 * @param {...object} objects - Objects to merge
 * @returns {object} - Merged object
 */
export function deepMerge(...objects) {
    const result = {};
    
    for (const obj of objects) {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                        result[key] = deepMerge(result[key] || {}, obj[key]);
                    } else {
                        result[key] = obj[key];
                    }
                }
            }
        }
    }
    
    return result;
}