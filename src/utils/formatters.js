/**
 * Formatting Utilities for MoMech
 * Functions for formatting dates, currency, phone numbers, etc.
 */

/**
 * Format currency values
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

/**
 * Format date values
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'relative')
 * @returns {string} - Formatted date string
 */
export function formatDate(date, format = 'short') {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
    }
    
    switch (format) {
        case 'long':
            return dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
        case 'relative':
            return formatRelativeDate(dateObj);
            
        case 'short':
        default:
            return dateObj.toLocaleDateString('en-US');
    }
}

/**
 * Format time values
 * @param {string} time - Time string (HH:MM format)
 * @param {boolean} use24Hour - Whether to use 24-hour format
 * @returns {string} - Formatted time string
 */
export function formatTime(time, use24Hour = false) {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: !use24Hour
    });
}

/**
 * Format relative date (e.g., "2 days ago", "in 3 hours")
 * @param {Date} date - Date to format
 * @returns {string} - Relative date string
 */
export function formatRelativeDate(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) {
        return 'Just now';
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date);
    }
}

/**
 * Format phone numbers
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export function formatPhone(phone) {
    if (!phone) return '';
    
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else {
        return phone; // Return original if can't format
    }
}

/**
 * Format vehicle display string
 * @param {object} vehicle - Vehicle object
 * @returns {string} - Formatted vehicle string
 */
export function formatVehicle(vehicle) {
    if (!vehicle) return '';
    
    const parts = [];
    if (vehicle.year) parts.push(vehicle.year);
    if (vehicle.make) parts.push(vehicle.make);
    if (vehicle.model) parts.push(vehicle.model);
    
    return parts.join(' ');
}

/**
 * Format client name
 * @param {object} client - Client object
 * @returns {string} - Formatted client name
 */
export function formatClientName(client) {
    if (!client) return '';
    
    const parts = [];
    if (client.firstName || client.first_name) parts.push(client.firstName || client.first_name);
    if (client.lastName || client.last_name) parts.push(client.lastName || client.last_name);
    
    return parts.join(' ');
}

/**
 * Format address
 * @param {object} address - Address object or client object
 * @returns {string} - Formatted address string
 */
export function formatAddress(address) {
    if (!address) return '';
    
    const parts = [];
    if (address.address) parts.push(address.address);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode || address.zip_code) parts.push(address.zipCode || address.zip_code);
    
    return parts.join(', ');
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }
    
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format duration in minutes to human readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration
 */
export function formatDuration(minutes) {
    if (!minutes || minutes <= 0) return '0 min';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins} min`;
    } else if (mins === 0) {
        return `${hours} hr`;
    } else {
        return `${hours} hr ${mins} min`;
    }
}

/**
 * Format mileage
 * @param {number} mileage - Mileage value
 * @returns {string} - Formatted mileage
 */
export function formatMileage(mileage) {
    if (!mileage || mileage <= 0) return '0 mi';
    
    return `${mileage.toLocaleString()} mi`;
}

/**
 * Format VIN for display (show first 8 and last 4 characters)
 * @param {string} vin - VIN number
 * @returns {string} - Formatted VIN
 */
export function formatVIN(vin) {
    if (!vin) return '';
    if (vin.length !== 17) return vin;
    
    return `${vin.slice(0, 8)}...${vin.slice(-4)}`;
}

/**
 * Format work order number
 * @param {string} workOrderNumber - Work order number
 * @returns {string} - Formatted work order number
 */
export function formatWorkOrderNumber(workOrderNumber) {
    if (!workOrderNumber) return '';
    return workOrderNumber.toUpperCase();
}

/**
 * Format invoice number
 * @param {string} invoiceNumber - Invoice number
 * @returns {string} - Formatted invoice number
 */
export function formatInvoiceNumber(invoiceNumber) {
    if (!invoiceNumber) return '';
    return invoiceNumber.toUpperCase();
}

/**
 * Format status for display
 * @param {string} status - Status value
 * @returns {string} - Formatted status
 */
export function formatStatus(status) {
    if (!status) return '';
    
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Format priority for display
 * @param {string} priority - Priority value
 * @returns {string} - Formatted priority
 */
export function formatPriority(priority) {
    if (!priority) return '';
    
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 50, suffix = '...') {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Format table cell data based on type
 * @param {any} value - Value to format
 * @param {string} type - Data type
 * @param {object} options - Formatting options
 * @returns {string} - Formatted value
 */
export function formatTableCell(value, type, options = {}) {
    if (value === null || value === undefined) {
        return options.emptyText || '-';
    }
    
    switch (type) {
        case 'currency':
            return formatCurrency(value);
        case 'date':
            return formatDate(value, options.format);
        case 'time':
            return formatTime(value, options.use24Hour);
        case 'phone':
            return formatPhone(value);
        case 'percentage':
            return formatPercentage(value, options.decimals);
        case 'duration':
            return formatDuration(value);
        case 'mileage':
            return formatMileage(value);
        case 'status':
            return formatStatus(value);
        case 'priority':
            return formatPriority(value);
        case 'truncate':
            return truncateText(value, options.maxLength, options.suffix);
        default:
            return value.toString();
    }
}