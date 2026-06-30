/**
 * Formatting Utilities for MoMech
 * Canadian locale defaults (CAD, km, DD/MM/YYYY)
 */

import { t, tStatus, tPriority, getLocale } from '../i18n/index.js';
import { LOCALE_CONFIG } from '../config/locale.js';

/**
 * Format currency values in CAD using active locale
 * fr-CA → "1 234,56 $" | en-CA → "$1,234.56"
 */
export function formatCurrency(amount, currency = LOCALE_CONFIG.DEFAULT_CURRENCY) {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return new Intl.NumberFormat(getLocale(), {
            style: 'currency',
            currency,
        }).format(0);
    }

    return new Intl.NumberFormat(getLocale(), {
        style: 'currency',
        currency,
    }).format(amount);
}

/**
 * Format date for display as DD/MM/YYYY (storage remains ISO)
 */
export function formatDate(date, format = 'short') {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date.includes('T') ? date : `${date}T12:00:00`) : date;

    if (isNaN(dateObj.getTime())) {
        return '';
    }

    const locale = getLocale();

    switch (format) {
        case 'long':
            return dateObj.toLocaleDateString(locale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

        case 'relative':
            return formatRelativeDate(dateObj);

        case 'short':
        default:
            return formatDateShort(dateObj);
    }
}

/**
 * DD/MM/YYYY display format (Quebec standard)
 */
export function formatDateShort(dateObj) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Format time values
 */
export function formatTime(time, use24Hour = true) {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));

    return date.toLocaleTimeString(getLocale(), {
        hour: 'numeric',
        minute: '2-digit',
        hour12: !use24Hour,
    });
}

export function formatRelativeDate(date) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
        return t('time.justNow');
    } else if (diffMinutes < 60) {
        const key = diffMinutes === 1 ? 'time.minutesAgo' : 'time.minutesAgo_plural';
        return t(key, { count: diffMinutes });
    } else if (diffHours < 24) {
        const key = diffHours === 1 ? 'time.hoursAgo' : 'time.hoursAgo_plural';
        return t(key, { count: diffHours });
    } else if (diffDays < 30) {
        const key = diffDays === 1 ? 'time.daysAgo' : 'time.daysAgo_plural';
        return t(key, { count: diffDays });
    } else {
        return formatDate(date);
    }
}

/**
 * Format Canadian phone numbers as (514) 555-1234
 */
export function formatPhone(phone) {
    if (!phone) return '';

    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
        return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    return phone;
}

/**
 * Format Canadian postal code as A1A 1A1
 */
export function formatPostalCode(postalCode) {
    if (!postalCode) return '';

    const cleaned = postalCode.replace(/\s/g, '').toUpperCase();
    if (cleaned.length === 6) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    }

    return postalCode.toUpperCase();
}

export function formatVehicle(vehicle) {
    if (!vehicle) return '';

    const parts = [];
    if (vehicle.year) parts.push(vehicle.year);
    if (vehicle.make) parts.push(vehicle.make);
    if (vehicle.model) parts.push(vehicle.model);

    return parts.join(' ');
}

export function formatClientName(client) {
    if (!client) return '';

    const parts = [];
    if (client.firstName || client.first_name) parts.push(client.firstName || client.first_name);
    if (client.lastName || client.last_name) parts.push(client.lastName || client.last_name);

    return parts.join(' ');
}

export function formatAddress(address) {
    if (!address) return '';

    const parts = [];
    if (address.address) parts.push(address.address);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    const postal = address.zipCode || address.zip_code;
    if (postal) parts.push(formatPostalCode(postal));

    return parts.join(', ');
}

export function formatFileSize(bytes) {
    if (bytes === 0) return `0 ${t('units.bytes')}`;

    const k = 1024;
    const sizes = [t('units.bytes'), 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0%';
    }

    return `${value.toFixed(decimals)}%`;
}

export function formatDuration(minutes) {
    if (!minutes || minutes <= 0) return `0 ${t('units.min')}`;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins} ${t('units.min')}`;
    }
    if (mins === 0) {
        return `${hours} ${t('units.hr')}`;
    }
    return `${hours} ${t('units.hr')} ${mins} ${t('units.min')}`;
}

/**
 * Format odometer reading in kilometres
 */
export function formatMileage(kilometres) {
    if (!kilometres || kilometres <= 0) {
        return `0 ${t('units.km')}`;
    }

    return `${kilometres.toLocaleString(getLocale())} ${t('units.km')}`;
}

export function formatVIN(vin) {
    if (!vin) return '';
    if (vin.length !== 17) return vin;

    return `${vin.slice(0, 8)}...${vin.slice(-4)}`;
}

export function formatWorkOrderNumber(workOrderNumber) {
    if (!workOrderNumber) return '';
    return workOrderNumber.toUpperCase();
}

export function formatInvoiceNumber(invoiceNumber) {
    if (!invoiceNumber) return '';
    return invoiceNumber.toUpperCase();
}

export function formatStatus(status) {
    return tStatus(status);
}

export function formatPriority(priority) {
    return tPriority(priority);
}

export function truncateText(text, maxLength = 50, suffix = '...') {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength - suffix.length) + suffix;
}

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
