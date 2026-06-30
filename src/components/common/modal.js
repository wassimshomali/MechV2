/**
 * Modal Component for MoMech
 * Reusable modal dialog component
 */

export class Modal {
    constructor(options = {}) {
        this.id = options.id || `modal-${Date.now()}`;
        this.title = options.title || '';
        this.content = options.content || '';
        this.size = options.size || 'medium'; // small, medium, large, xl
        this.closable = options.closable !== false;
        this.backdrop = options.backdrop !== false;
        this.keyboard = options.keyboard !== false;
        this.onClose = options.onClose || null;
        this.onOpen = options.onOpen || null;
        this.isOpen = false;
    }
    
    /**
     * Render the modal
     * @returns {string} - Modal HTML
     */
    render() {
        const sizeClasses = {
            small: 'max-w-md',
            medium: 'max-w-lg',
            large: 'max-w-2xl',
            xl: 'max-w-4xl',
            full: 'max-w-full mx-4'
        };
        
        return `
            <div id="${this.id}" class="fixed inset-0 z-50 overflow-y-auto hidden" aria-labelledby="${this.id}-title" role="dialog" aria-modal="true">
                <!-- Backdrop -->
                <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="modal-backdrop fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
                    
                    <!-- Modal panel -->
                    <div class="modal-panel inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[this.size]} sm:w-full">
                        <!-- Header -->
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="flex items-center justify-between">
                                <h3 class="modal-title text-lg leading-6 font-medium text-gray-900" id="${this.id}-title">
                                    ${this.title}
                                </h3>
                                ${this.closable ? `
                                    <button type="button" class="modal-close bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <span class="sr-only">Close</span>
                                        <i data-feather="x" class="w-6 h-6"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- Content -->
                        <div class="modal-content bg-white px-4 pb-4 sm:p-6 sm:pt-0">
                            ${this.content}
                        </div>
                        
                        <!-- Footer (if needed) -->
                        <div class="modal-footer bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse hidden">
                            <!-- Footer content will be added dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Show the modal
     */
    show() {
        if (this.isOpen) return;
        
        // Render modal if not already in DOM
        let modalElement = document.getElementById(this.id);
        if (!modalElement) {
            const container = document.getElementById('modals-container');
            container.insertAdjacentHTML('beforeend', this.render());
            modalElement = document.getElementById(this.id);
            this.attachEventListeners();
        }
        
        // Show modal
        modalElement.classList.remove('hidden');
        this.isOpen = true;
        
        // Focus management
        this.trapFocus();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Call onOpen callback
        if (this.onOpen) {
            this.onOpen();
        }
        
        // Replace feather icons
        replaceFeatherIcons();
    }
    
    /**
     * Hide the modal
     */
    hide() {
        if (!this.isOpen) return;
        
        const modalElement = document.getElementById(this.id);
        if (modalElement) {
            modalElement.classList.add('hidden');
        }
        
        this.isOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Call onClose callback
        if (this.onClose) {
            this.onClose();
        }
    }
    
    /**
     * Destroy the modal and remove from DOM
     */
    destroy() {
        this.hide();
        const modalElement = document.getElementById(this.id);
        if (modalElement) {
            modalElement.remove();
        }
    }
    
    /**
     * Update modal content
     * @param {string} content - New content HTML
     */
    setContent(content) {
        this.content = content;
        const contentElement = document.querySelector(`#${this.id} .modal-content`);
        if (contentElement) {
            contentElement.innerHTML = content;
            replaceFeatherIcons();
        }
    }
    
    /**
     * Update modal title
     * @param {string} title - New title
     */
    setTitle(title) {
        this.title = title;
        const titleElement = document.querySelector(`#${this.id} .modal-title`);
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
    
    /**
     * Set modal footer content
     * @param {string} footerContent - Footer HTML
     */
    setFooter(footerContent) {
        const footerElement = document.querySelector(`#${this.id} .modal-footer`);
        if (footerElement) {
            footerElement.innerHTML = footerContent;
            footerElement.classList.remove('hidden');
            replaceFeatherIcons();
        }
    }
    
    /**
     * Hide modal footer
     */
    hideFooter() {
        const footerElement = document.querySelector(`#${this.id} .modal-footer`);
        if (footerElement) {
            footerElement.classList.add('hidden');
        }
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const modalElement = document.getElementById(this.id);
        if (!modalElement) return;
        
        // Close button
        const closeButton = modalElement.querySelector('.modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.hide());
        }
        
        // Backdrop click
        if (this.backdrop) {
            const backdrop = modalElement.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.addEventListener('click', () => this.hide());
            }
        }
        
        // Keyboard events
        if (this.keyboard) {
            document.addEventListener('keydown', this.handleKeydown.bind(this));
        }
    }
    
    /**
     * Handle keyboard events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeydown(event) {
        if (!this.isOpen) return;
        
        if (event.key === 'Escape' && this.closable) {
            this.hide();
        }
    }
    
    /**
     * Trap focus within modal
     */
    trapFocus() {
        const modalElement = document.getElementById(this.id);
        if (!modalElement) return;
        
        const focusableElements = modalElement.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }
        
        // Handle tab navigation
        modalElement.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    if (document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
    
    /**
     * Static method to create and show a simple alert modal
     * @param {string} title - Alert title
     * @param {string} message - Alert message
     * @param {string} type - Alert type (success, error, warning, info)
     * @returns {Modal} - Modal instance
     */
    static alert(title, message, type = 'info') {
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        
        const colors = {
            success: 'text-green-600',
            error: 'text-red-600',
            warning: 'text-yellow-600',
            info: 'text-blue-600'
        };
        
        const content = `
            <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'success' ? 'green' : 'blue'}-100 sm:mx-0 sm:h-10 sm:w-10">
                    <i data-feather="${icons[type]}" class="w-6 h-6 ${colors[type]}"></i>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div class="mt-2">
                        <p class="text-sm text-gray-500">${message}</p>
                    </div>
                </div>
            </div>
        `;
        
        const modal = new Modal({
            title,
            content,
            size: 'small'
        });
        
        modal.setFooter(`
            <button type="button" onclick="document.getElementById('${modal.id}').querySelector('.modal-close').click()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                OK
            </button>
        `);
        
        modal.show();
        return modal;
    }
    
    /**
     * Static method to create and show a confirmation modal
     * @param {string} title - Confirmation title
     * @param {string} message - Confirmation message
     * @param {function} onConfirm - Callback for confirm action
     * @param {function} onCancel - Callback for cancel action
     * @returns {Modal} - Modal instance
     */
    static confirm(title, message, onConfirm, onCancel = null) {
        const content = `
            <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <i data-feather="alert-triangle" class="w-6 h-6 text-red-600"></i>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div class="mt-2">
                        <p class="text-sm text-gray-500">${message}</p>
                    </div>
                </div>
            </div>
        `;
        
        const modal = new Modal({
            title,
            content,
            size: 'small'
        });
        
        modal.setFooter(`
            <button type="button" id="confirm-btn-${modal.id}" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                Confirm
            </button>
            <button type="button" id="cancel-btn-${modal.id}" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
            </button>
        `);
        
        // Add event listeners after modal is shown
        modal.onOpen = () => {
            const confirmBtn = document.getElementById(`confirm-btn-${modal.id}`);
            const cancelBtn = document.getElementById(`cancel-btn-${modal.id}`);
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    modal.hide();
                    if (onConfirm) onConfirm();
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    modal.hide();
                    if (onCancel) onCancel();
                });
            }
        };
        
        modal.show();
        return modal;
    }
    
    /**
     * Static method to create a form modal
     * @param {string} title - Form title
     * @param {string} formContent - Form HTML content
     * @param {function} onSubmit - Submit callback
     * @param {function} onCancel - Cancel callback
     * @returns {Modal} - Modal instance
     */
    static form(title, formContent, onSubmit, onCancel = null) {
        const modal = new Modal({
            title,
            content: `<form id="modal-form-${Date.now()}">${formContent}</form>`,
            size: 'large'
        });
        
        modal.setFooter(`
            <button type="submit" form="modal-form-${Date.now()}" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                Save
            </button>
            <button type="button" class="modal-cancel mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
            </button>
        `);
        
        modal.onOpen = () => {
            const form = document.querySelector(`#${modal.id} form`);
            const cancelBtn = document.querySelector(`#${modal.id} .modal-cancel`);
            
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    if (onSubmit) {
                        const formData = new FormData(form);
                        const data = Object.fromEntries(formData);
                        onSubmit(data, modal);
                    }
                });
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    modal.hide();
                    if (onCancel) onCancel();
                });
            }
        };
        
        modal.show();
        return modal;
    }
    
    /**
     * Static method to show loading modal
     * @param {string} message - Loading message
     * @returns {Modal} - Modal instance
     */
    static loading(message = 'Loading...') {
        const content = `
            <div class="text-center py-8">
                <div class="loading mx-auto mb-4"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        
        const modal = new Modal({
            title: '',
            content,
            size: 'small',
            closable: false,
            backdrop: false,
            keyboard: false
        });
        
        modal.show();
        return modal;
    }
}