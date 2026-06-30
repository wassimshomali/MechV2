/**
 * Notification Component for MoMech
 * Toast notifications and alert system
 */

export class NotificationManager {
    constructor() {
        this.notifications = new Map();
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
    }
    
    /**
     * Initialize notification system
     */
    init() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            console.warn('Notification container not found');
        }
    }
    
    /**
     * Show a notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, warning, info)
     * @param {object} options - Additional options
     * @returns {string} - Notification ID
     */
    show(message, type = 'info', options = {}) {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const duration = options.duration || this.defaultDuration;
        const persistent = options.persistent || false;
        const actions = options.actions || [];
        
        const notification = {
            id,
            message,
            type,
            duration,
            persistent,
            actions,
            createdAt: Date.now()
        };
        
        this.notifications.set(id, notification);
        this.renderNotification(notification);
        
        // Auto-remove if not persistent
        if (!persistent && duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, duration);
        }
        
        // Remove oldest if too many notifications
        if (this.notifications.size > this.maxNotifications) {
            const oldest = Array.from(this.notifications.values())
                .sort((a, b) => a.createdAt - b.createdAt)[0];
            this.remove(oldest.id);
        }
        
        return id;
    }
    
    /**
     * Remove a notification
     * @param {string} id - Notification ID
     */
    remove(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        const element = document.getElementById(id);
        if (element) {
            // Animate out
            element.classList.add('translate-x-full', 'opacity-0');
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                this.notifications.delete(id);
            }, 300);
        } else {
            this.notifications.delete(id);
        }
    }
    
    /**
     * Clear all notifications
     */
    clearAll() {
        this.notifications.forEach((_, id) => this.remove(id));
    }
    
    /**
     * Render a notification
     * @param {object} notification - Notification object
     */
    renderNotification(notification) {
        if (!this.container) return;
        
        const { id, message, type, actions } = notification;
        
        const colors = {
            success: 'bg-green-500 border-green-600',
            error: 'bg-red-500 border-red-600',
            warning: 'bg-yellow-500 border-yellow-600',
            info: 'bg-blue-500 border-blue-600'
        };
        
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        
        const notificationHTML = `
            <div 
                id="${id}"
                class="notification transform translate-x-full transition-all duration-300 ease-in-out max-w-sm w-full ${colors[type]} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 mb-4"
            >
                <div class="p-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <i data-feather="${icons[type]}" class="w-6 h-6 text-white"></i>
                        </div>
                        <div class="ml-3 w-0 flex-1 pt-0.5">
                            <p class="text-sm font-medium text-white">${message}</p>
                            ${actions.length > 0 ? `
                                <div class="mt-3 flex space-x-2">
                                    ${actions.map(action => `
                                        <button 
                                            type="button"
                                            class="notification-action bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs font-medium px-3 py-1.5 rounded-md"
                                            data-action="${action.name}"
                                            data-notification-id="${id}"
                                        >
                                            ${action.label}
                                        </button>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="ml-4 flex-shrink-0 flex">
                            <button 
                                type="button"
                                class="notification-close bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md inline-flex text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                                data-notification-id="${id}"
                            >
                                <span class="sr-only">Close</span>
                                <i data-feather="x" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('afterbegin', notificationHTML);
        
        // Animate in
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('translate-x-full');
            }
        }, 100);
        
        // Attach event listeners
        this.attachNotificationListeners(id);
        
        // Replace feather icons
        replaceFeatherIcons();
    }
    
    /**
     * Attach event listeners to notification
     * @param {string} id - Notification ID
     */
    attachNotificationListeners(id) {
        const element = document.getElementById(id);
        if (!element) return;
        
        // Close button
        const closeBtn = element.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.remove(id));
        }
        
        // Action buttons
        const actionBtns = element.querySelectorAll('.notification-action');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const actionName = btn.dataset.action;
                const notification = this.notifications.get(id);
                const action = notification.actions.find(a => a.name === actionName);
                
                if (action && action.handler) {
                    action.handler();
                }
                
                // Remove notification after action unless persistent
                if (!notification.persistent) {
                    this.remove(id);
                }
            });
        });
    }
    
    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {object} options - Additional options
     * @returns {string} - Notification ID
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }
    
    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {object} options - Additional options
     * @returns {string} - Notification ID
     */
    error(message, options = {}) {
        return this.show(message, 'error', { duration: 8000, ...options });
    }
    
    /**
     * Show warning notification
     * @param {string} message - Warning message
     * @param {object} options - Additional options
     * @returns {string} - Notification ID
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', { duration: 6000, ...options });
    }
    
    /**
     * Show info notification
     * @param {string} message - Info message
     * @param {object} options - Additional options
     * @returns {string} - Notification ID
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }
    
    /**
     * Show progress notification
     * @param {string} message - Progress message
     * @param {number} progress - Progress percentage (0-100)
     * @returns {string} - Notification ID
     */
    progress(message, progress = 0) {
        const id = `progress-${Date.now()}`;
        
        const progressHTML = `
            <div 
                id="${id}"
                class="notification transform translate-x-full transition-all duration-300 ease-in-out max-w-sm w-full bg-blue-500 border-blue-600 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 mb-4"
            >
                <div class="p-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <i data-feather="download" class="w-6 h-6 text-white"></i>
                        </div>
                        <div class="ml-3 w-0 flex-1">
                            <p class="text-sm font-medium text-white">${message}</p>
                            <div class="mt-2">
                                <div class="bg-white bg-opacity-20 rounded-full h-2">
                                    <div class="progress-bar bg-white rounded-full h-2 transition-all duration-300" style="width: ${progress}%"></div>
                                </div>
                                <p class="text-xs text-white mt-1">${Math.round(progress)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('afterbegin', progressHTML);
        
        // Animate in
        setTimeout(() => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('translate-x-full');
            }
        }, 100);
        
        replaceFeatherIcons();
        
        return id;
    }
    
    /**
     * Update progress notification
     * @param {string} id - Notification ID
     * @param {number} progress - Progress percentage
     * @param {string} message - Updated message
     */
    updateProgress(id, progress, message = null) {
        const element = document.getElementById(id);
        if (!element) return;
        
        const progressBar = element.querySelector('.progress-bar');
        const progressText = element.querySelector('.text-xs');
        const messageElement = element.querySelector('.text-sm');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}%`;
        }
        
        if (message && messageElement) {
            messageElement.textContent = message;
        }
        
        // Auto-remove when complete
        if (progress >= 100) {
            setTimeout(() => this.remove(id), 2000);
        }
    }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Override global notification function
window.showNotification = (message, type, duration) => {
    return notificationManager.show(message, type, { duration });
};

export default notificationManager;