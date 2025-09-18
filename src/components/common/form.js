/**
 * Form Component for MoMech
 * Reusable form component with validation and error handling
 */

import validator from '../../utils/validation.js';
import { debounce } from '../../utils/helpers.js';

export class Form {
    constructor(options = {}) {
        this.containerId = options.containerId;
        this.fields = options.fields || [];
        this.data = options.data || {};
        this.schema = options.schema || {};
        this.onSubmit = options.onSubmit || null;
        this.onChange = options.onChange || null;
        this.submitText = options.submitText || 'Save';
        this.cancelText = options.cancelText || 'Cancel';
        this.showCancel = options.showCancel !== false;
        this.autoSave = options.autoSave || false;
        this.autoSaveDelay = options.autoSaveDelay || 2000;
        
        this.errors = {};
        this.touched = new Set();
        this.isSubmitting = false;
        
        if (this.autoSave) {
            this.debouncedSave = debounce(this.handleAutoSave.bind(this), this.autoSaveDelay);
        }
    }
    
    /**
     * Render the form
     * @returns {string} - Form HTML
     */
    render() {
        return `
            <form id="form-${this.containerId}" class="space-y-6" novalidate>
                ${this.fields.map(field => this.renderField(field)).join('')}
                
                <div class="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    ${this.showCancel ? `
                        <button 
                            type="button" 
                            id="cancel-btn"
                            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            ${this.cancelText}
                        </button>
                    ` : ''}
                    <button 
                        type="submit" 
                        id="submit-btn"
                        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span class="submit-text">${this.submitText}</span>
                        <div class="submit-loading hidden">
                            <div class="loading w-4 h-4"></div>
                        </div>
                    </button>
                </div>
            </form>
        `;
    }
    
    /**
     * Render a form field
     * @param {object} field - Field configuration
     * @returns {string} - Field HTML
     */
    renderField(field) {
        const value = this.data[field.name] || field.defaultValue || '';
        const error = this.errors[field.name];
        const hasError = error && this.touched.has(field.name);
        
        let fieldHTML = '';
        
        switch (field.type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
            case 'password':
                fieldHTML = this.renderTextInput(field, value, hasError);
                break;
            case 'textarea':
                fieldHTML = this.renderTextarea(field, value, hasError);
                break;
            case 'select':
                fieldHTML = this.renderSelect(field, value, hasError);
                break;
            case 'checkbox':
                fieldHTML = this.renderCheckbox(field, value);
                break;
            case 'radio':
                fieldHTML = this.renderRadio(field, value);
                break;
            case 'date':
            case 'time':
            case 'datetime-local':
                fieldHTML = this.renderDateTimeInput(field, value, hasError);
                break;
            case 'file':
                fieldHTML = this.renderFileInput(field, hasError);
                break;
            default:
                fieldHTML = this.renderTextInput(field, value, hasError);
        }
        
        return `
            <div class="form-field ${field.className || ''}">
                ${fieldHTML}
                ${hasError ? `<p class="mt-1 text-sm text-red-600">${error[0]}</p>` : ''}
                ${field.help ? `<p class="mt-1 text-sm text-gray-500">${field.help}</p>` : ''}
            </div>
        `;
    }
    
    /**
     * Render text input
     */
    renderTextInput(field, value, hasError) {
        return `
            <label for="${field.name}" class="block text-sm font-medium text-gray-700">
                ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
            </label>
            <input 
                type="${field.type || 'text'}"
                id="${field.name}"
                name="${field.name}"
                value="${value}"
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
                ${field.readonly ? 'readonly' : ''}
                ${field.disabled ? 'disabled' : ''}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}"
                ${field.attributes || ''}
            >
        `;
    }
    
    /**
     * Render textarea
     */
    renderTextarea(field, value, hasError) {
        return `
            <label for="${field.name}" class="block text-sm font-medium text-gray-700">
                ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
            </label>
            <textarea 
                id="${field.name}"
                name="${field.name}"
                rows="${field.rows || 3}"
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
                ${field.readonly ? 'readonly' : ''}
                ${field.disabled ? 'disabled' : ''}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}"
            >${value}</textarea>
        `;
    }
    
    /**
     * Render select dropdown
     */
    renderSelect(field, value, hasError) {
        return `
            <label for="${field.name}" class="block text-sm font-medium text-gray-700">
                ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
            </label>
            <select 
                id="${field.name}"
                name="${field.name}"
                ${field.required ? 'required' : ''}
                ${field.disabled ? 'disabled' : ''}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}"
            >
                ${field.placeholder ? `<option value="">${field.placeholder}</option>` : ''}
                ${field.options.map(option => `
                    <option value="${option.value}" ${option.value === value ? 'selected' : ''}>
                        ${option.label}
                    </option>
                `).join('')}
            </select>
        `;
    }
    
    /**
     * Render checkbox
     */
    renderCheckbox(field, value) {
        return `
            <div class="flex items-center">
                <input 
                    type="checkbox"
                    id="${field.name}"
                    name="${field.name}"
                    value="1"
                    ${value ? 'checked' : ''}
                    ${field.disabled ? 'disabled' : ''}
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label for="${field.name}" class="ml-2 block text-sm text-gray-900">
                    ${field.label}
                </label>
            </div>
        `;
    }
    
    /**
     * Render radio buttons
     */
    renderRadio(field, value) {
        return `
            <fieldset>
                <legend class="block text-sm font-medium text-gray-700">
                    ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
                </legend>
                <div class="mt-2 space-y-2">
                    ${field.options.map(option => `
                        <div class="flex items-center">
                            <input 
                                type="radio"
                                id="${field.name}-${option.value}"
                                name="${field.name}"
                                value="${option.value}"
                                ${option.value === value ? 'checked' : ''}
                                ${field.disabled ? 'disabled' : ''}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            >
                            <label for="${field.name}-${option.value}" class="ml-2 block text-sm text-gray-900">
                                ${option.label}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </fieldset>
        `;
    }
    
    /**
     * Render date/time input
     */
    renderDateTimeInput(field, value, hasError) {
        return `
            <label for="${field.name}" class="block text-sm font-medium text-gray-700">
                ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
            </label>
            <input 
                type="${field.type}"
                id="${field.name}"
                name="${field.name}"
                value="${value}"
                ${field.required ? 'required' : ''}
                ${field.readonly ? 'readonly' : ''}
                ${field.disabled ? 'disabled' : ''}
                min="${field.min || ''}"
                max="${field.max || ''}"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}"
            >
        `;
    }
    
    /**
     * Render file input
     */
    renderFileInput(field, hasError) {
        return `
            <label for="${field.name}" class="block text-sm font-medium text-gray-700">
                ${field.label} ${field.required ? '<span class="text-red-500">*</span>' : ''}
            </label>
            <input 
                type="file"
                id="${field.name}"
                name="${field.name}"
                ${field.required ? 'required' : ''}
                ${field.disabled ? 'disabled' : ''}
                accept="${field.accept || ''}"
                ${field.multiple ? 'multiple' : ''}
                class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${hasError ? 'border-red-300' : ''}"
            >
        `;
    }
    
    /**
     * Initialize form functionality
     */
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = this.render();
        this.attachEventListeners();
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const form = document.getElementById(`form-${this.containerId}`);
        if (!form) return;
        
        // Form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Cancel button
        const cancelBtn = form.querySelector('#cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCancel());
        }
        
        // Field change events
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input.name));
            input.addEventListener('input', () => {
                this.touched.add(input.name);
                if (this.onChange) {
                    this.onChange(this.getFormData());
                }
                if (this.autoSave) {
                    this.debouncedSave();
                }
            });
        });
    }
    
    /**
     * Handle form submission
     * @param {Event} event - Submit event
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Mark all fields as touched
        this.fields.forEach(field => this.touched.add(field.name));
        
        // Validate all fields
        const isValid = this.validateForm();
        
        if (!isValid) {
            this.showValidationErrors();
            return;
        }
        
        // Set submitting state
        this.setSubmitting(true);
        
        try {
            const formData = this.getFormData();
            
            if (this.onSubmit) {
                await this.onSubmit(formData);
            }
            
            window.showNotification('Form submitted successfully!', 'success');
            
        } catch (error) {
            console.error('Form submission error:', error);
            window.showNotification('Error submitting form. Please try again.', 'error');
            
            // Handle server validation errors
            if (error.data && error.data.errors) {
                this.setServerErrors(error.data.errors);
            }
        } finally {
            this.setSubmitting(false);
        }
    }
    
    /**
     * Handle cancel action
     */
    handleCancel() {
        if (this.hasUnsavedChanges()) {
            Modal.confirm(
                'Unsaved Changes',
                'You have unsaved changes. Are you sure you want to cancel?',
                () => {
                    this.reset();
                    window.history.back();
                }
            );
        } else {
            window.history.back();
        }
    }
    
    /**
     * Handle auto-save
     */
    async handleAutoSave() {
        if (!this.hasUnsavedChanges()) return;
        
        try {
            const formData = this.getFormData();
            // You could implement auto-save logic here
            console.log('Auto-saving:', formData);
        } catch (error) {
            console.error('Auto-save error:', error);
        }
    }
    
    /**
     * Validate a single field
     * @param {string} fieldName - Field name
     * @returns {boolean} - Whether field is valid
     */
    validateField(fieldName) {
        const field = this.fields.find(f => f.name === fieldName);
        const rules = this.schema[fieldName];
        
        if (!field || !rules) return true;
        
        const value = this.getFieldValue(fieldName);
        const errors = validator.validate(value, rules);
        
        if (errors.length > 0) {
            this.errors[fieldName] = errors;
        } else {
            delete this.errors[fieldName];
        }
        
        this.updateFieldError(fieldName);
        
        return errors.length === 0;
    }
    
    /**
     * Validate entire form
     * @returns {boolean} - Whether form is valid
     */
    validateForm() {
        let isValid = true;
        
        this.fields.forEach(field => {
            const fieldValid = this.validateField(field.name);
            if (!fieldValid) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * Update field error display
     * @param {string} fieldName - Field name
     */
    updateFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const fieldContainer = field?.closest('.form-field');
        
        if (!fieldContainer) return;
        
        // Remove existing error
        const existingError = fieldContainer.querySelector('.text-red-600');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error if exists
        const error = this.errors[fieldName];
        if (error && this.touched.has(fieldName)) {
            fieldContainer.insertAdjacentHTML('beforeend', `
                <p class="mt-1 text-sm text-red-600">${error[0]}</p>
            `);
            
            // Update field styling
            field.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
            field.classList.remove('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');
        } else {
            // Reset field styling
            field.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
            field.classList.add('border-gray-300', 'focus:border-blue-500', 'focus:ring-blue-500');
        }
    }
    
    /**
     * Show validation errors
     */
    showValidationErrors() {
        Object.keys(this.errors).forEach(fieldName => {
            this.updateFieldError(fieldName);
        });
        
        // Focus first error field
        const firstErrorField = Object.keys(this.errors)[0];
        if (firstErrorField) {
            const field = document.getElementById(firstErrorField);
            if (field) {
                field.focus();
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    /**
     * Set server validation errors
     * @param {object} serverErrors - Server errors object
     */
    setServerErrors(serverErrors) {
        this.errors = { ...this.errors, ...serverErrors };
        this.showValidationErrors();
    }
    
    /**
     * Get form data
     * @returns {object} - Form data object
     */
    getFormData() {
        const form = document.getElementById(`form-${this.containerId}`);
        if (!form) return {};
        
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (const [key, value] of formData.entries()) {
            if (data[key]) {
                // Handle multiple values (like checkboxes)
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }
        
        // Handle checkboxes that aren't checked
        this.fields.forEach(field => {
            if (field.type === 'checkbox' && !(field.name in data)) {
                data[field.name] = false;
            }
        });
        
        return data;
    }
    
    /**
     * Get field value
     * @param {string} fieldName - Field name
     * @returns {any} - Field value
     */
    getFieldValue(fieldName) {
        const field = document.getElementById(fieldName);
        if (!field) return null;
        
        if (field.type === 'checkbox') {
            return field.checked;
        } else if (field.type === 'radio') {
            const checked = document.querySelector(`input[name="${fieldName}"]:checked`);
            return checked ? checked.value : null;
        } else {
            return field.value;
        }
    }
    
    /**
     * Set form data
     * @param {object} data - Data to set
     */
    setData(data) {
        this.data = { ...this.data, ...data };
        
        Object.entries(data).forEach(([key, value]) => {
            const field = document.getElementById(key);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = !!value;
                } else if (field.type === 'radio') {
                    const radio = document.querySelector(`input[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    field.value = value || '';
                }
            }
        });
    }
    
    /**
     * Reset form to initial state
     */
    reset() {
        const form = document.getElementById(`form-${this.containerId}`);
        if (form) {
            form.reset();
        }
        
        this.errors = {};
        this.touched.clear();
        this.data = {};
    }
    
    /**
     * Set submitting state
     * @param {boolean} submitting - Whether form is submitting
     */
    setSubmitting(submitting) {
        this.isSubmitting = submitting;
        
        const submitBtn = document.getElementById('submit-btn');
        const submitText = submitBtn?.querySelector('.submit-text');
        const submitLoading = submitBtn?.querySelector('.submit-loading');
        
        if (submitBtn) {
            submitBtn.disabled = submitting;
        }
        
        if (submitText && submitLoading) {
            if (submitting) {
                submitText.classList.add('hidden');
                submitLoading.classList.remove('hidden');
            } else {
                submitText.classList.remove('hidden');
                submitLoading.classList.add('hidden');
            }
        }
    }
    
    /**
     * Check if form has unsaved changes
     * @returns {boolean} - Whether form has changes
     */
    hasUnsavedChanges() {
        const currentData = this.getFormData();
        return JSON.stringify(currentData) !== JSON.stringify(this.data);
    }
    
    /**
     * Destroy form and clean up
     */
    destroy() {
        if (this.debouncedSave) {
            this.debouncedSave.cancel();
        }
    }
}