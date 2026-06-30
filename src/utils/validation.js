/**
 * Validation Utilities for MoMech
 * Client-side form validation functions
 */

export class Validator {
    constructor() {
        this.rules = new Map();
        this.messages = new Map();
    }
    
    /**
     * Add a validation rule
     * @param {string} name - Rule name
     * @param {function} validator - Validation function
     * @param {string} message - Default error message
     */
    addRule(name, validator, message) {
        this.rules.set(name, validator);
        this.messages.set(name, message);
    }
    
    /**
     * Validate a single value against rules
     * @param {any} value - Value to validate
     * @param {array} rules - Array of rule names or rule objects
     * @returns {array} - Array of error messages
     */
    validate(value, rules) {
        const errors = [];
        
        for (const rule of rules) {
            let ruleName, ruleParams, customMessage;
            
            if (typeof rule === 'string') {
                ruleName = rule;
                ruleParams = [];
                customMessage = null;
            } else {
                ruleName = rule.name;
                ruleParams = rule.params || [];
                customMessage = rule.message;
            }
            
            const validator = this.rules.get(ruleName);
            if (validator) {
                const isValid = validator(value, ...ruleParams);
                if (!isValid) {
                    const message = customMessage || this.messages.get(ruleName) || 'Validation failed';
                    errors.push(message);
                }
            }
        }
        
        return errors;
    }
    
    /**
     * Validate an object against a schema
     * @param {object} data - Data to validate
     * @param {object} schema - Validation schema
     * @returns {object} - Validation result with errors
     */
    validateObject(data, schema) {
        const errors = {};
        let isValid = true;
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            const fieldErrors = this.validate(value, rules);
            
            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
                isValid = false;
            }
        }
        
        return { isValid, errors };
    }
}

// Create default validator instance with common rules
const validator = new Validator();

// Required validation
validator.addRule('required', (value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined && value !== '';
}, 'This field is required');

// Email validation
validator.addRule('email', (value) => {
    if (!value) return true; // Allow empty if not required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}, 'Please enter a valid email address');

// Phone validation
validator.addRule('phone', (value) => {
    if (!value) return true; // Allow empty if not required
    const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
    return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
}, 'Please enter a valid phone number');

// Minimum length validation
validator.addRule('minLength', (value, minLength) => {
    if (!value) return true; // Allow empty if not required
    return value.toString().length >= minLength;
}, 'Value is too short');

// Maximum length validation
validator.addRule('maxLength', (value, maxLength) => {
    if (!value) return true; // Allow empty if not required
    return value.toString().length <= maxLength;
}, 'Value is too long');

// Numeric validation
validator.addRule('numeric', (value) => {
    if (!value) return true; // Allow empty if not required
    return !isNaN(value) && !isNaN(parseFloat(value));
}, 'Please enter a valid number');

// Positive number validation
validator.addRule('positive', (value) => {
    if (!value) return true; // Allow empty if not required
    return parseFloat(value) > 0;
}, 'Value must be positive');

// Integer validation
validator.addRule('integer', (value) => {
    if (!value) return true; // Allow empty if not required
    return Number.isInteger(parseFloat(value));
}, 'Please enter a whole number');

// Date validation
validator.addRule('date', (value) => {
    if (!value) return true; // Allow empty if not required
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
}, 'Please enter a valid date');

// Future date validation
validator.addRule('futureDate', (value) => {
    if (!value) return true; // Allow empty if not required
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
}, 'Date must be today or in the future');

// VIN validation
validator.addRule('vin', (value) => {
    if (!value) return true; // Allow empty if not required
    return value.length === 17 && /^[A-HJ-NPR-Z0-9]+$/i.test(value);
}, 'VIN must be exactly 17 characters');

// Year validation
validator.addRule('year', (value) => {
    if (!value) return true; // Allow empty if not required
    const year = parseInt(value);
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear + 1;
}, 'Please enter a valid year');

// URL validation
validator.addRule('url', (value) => {
    if (!value) return true; // Allow empty if not required
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}, 'Please enter a valid URL');

// Custom validation for specific business rules
validator.addRule('licensePlate', (value) => {
    if (!value) return true; // Allow empty if not required
    // Basic license plate validation (can be customized per state)
    return value.length >= 2 && value.length <= 8 && /^[A-Z0-9\-\s]+$/i.test(value);
}, 'Please enter a valid license plate');

export default validator;

// Export validation schemas for common forms
export const clientSchema = {
    firstName: ['required', { name: 'maxLength', params: [50] }],
    lastName: ['required', { name: 'maxLength', params: [50] }],
    email: ['email', { name: 'maxLength', params: [100] }],
    phone: ['phone'],
    zipCode: [{ name: 'maxLength', params: [10] }]
};

export const vehicleSchema = {
    clientId: ['required'],
    make: ['required', { name: 'maxLength', params: [50] }],
    model: ['required', { name: 'maxLength', params: [50] }],
    year: ['required', 'year'],
    vin: ['vin'],
    licensePlate: ['licensePlate'],
    mileage: ['numeric', 'positive']
};

export const appointmentSchema = {
    clientId: ['required'],
    vehicleId: ['required'],
    appointmentDate: ['required', 'date', 'futureDate'],
    appointmentTime: ['required'],
    estimatedDuration: ['numeric', 'positive']
};

export const inventorySchema = {
    name: ['required', { name: 'maxLength', params: [100] }],
    costPrice: ['numeric', 'positive'],
    sellingPrice: ['numeric', 'positive'],
    quantityOnHand: ['numeric'],
    minimumQuantity: ['numeric'],
    reorderPoint: ['numeric'],
    reorderQuantity: ['numeric']
};

export const invoiceSchema = {
    clientId: ['required'],
    invoiceDate: ['required', 'date'],
    dueDate: ['required', 'date'],
    subtotal: ['numeric', 'positive'],
    totalAmount: ['numeric', 'positive']
};

export const paymentSchema = {
    clientId: ['required'],
    amount: ['required', 'numeric', 'positive'],
    paymentMethod: ['required'],
    paymentDate: ['required', 'date']
};