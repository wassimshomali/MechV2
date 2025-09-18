/**
 * Global State Manager for MoMech
 * Handles application state with event-driven updates
 */

export class StateManager {
    constructor() {
        this.state = new Map();
        this.listeners = new Map();
        this.middleware = [];
    }
    
    /**
     * Get a value from the state
     * @param {string} key - State key
     * @returns {any} - State value
     */
    get(key) {
        return this.state.get(key);
    }
    
    /**
     * Set a value in the state
     * @param {string} key - State key
     * @param {any} value - State value
     */
    set(key, value) {
        const oldValue = this.state.get(key);
        
        // Run through middleware
        let newValue = value;
        for (const middleware of this.middleware) {
            newValue = middleware(key, newValue, oldValue);
        }
        
        this.state.set(key, newValue);
        this.notify(key, newValue, oldValue);
    }
    
    /**
     * Update an object in the state
     * @param {string} key - State key
     * @param {object} updates - Object with updates to merge
     */
    update(key, updates) {
        const current = this.get(key) || {};
        const updated = { ...current, ...updates };
        this.set(key, updated);
    }
    
    /**
     * Delete a key from the state
     * @param {string} key - State key to delete
     */
    delete(key) {
        const oldValue = this.state.get(key);
        this.state.delete(key);
        this.notify(key, undefined, oldValue);
    }
    
    /**
     * Check if a key exists in the state
     * @param {string} key - State key
     * @returns {boolean} - Whether the key exists
     */
    has(key) {
        return this.state.has(key);
    }
    
    /**
     * Clear all state
     */
    clear() {
        const keys = Array.from(this.state.keys());
        this.state.clear();
        
        // Notify all listeners
        keys.forEach(key => this.notify(key, undefined, this.state.get(key)));
    }
    
    /**
     * Subscribe to state changes
     * @param {string} key - State key to watch
     * @param {function} callback - Callback function
     * @returns {function} - Unsubscribe function
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        
        this.listeners.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            const keyListeners = this.listeners.get(key);
            if (keyListeners) {
                keyListeners.delete(callback);
                if (keyListeners.size === 0) {
                    this.listeners.delete(key);
                }
            }
        };
    }
    
    /**
     * Subscribe to all state changes
     * @param {function} callback - Callback function
     * @returns {function} - Unsubscribe function
     */
    subscribeAll(callback) {
        return this.subscribe('*', callback);
    }
    
    /**
     * Notify listeners of state changes
     * @param {string} key - State key that changed
     * @param {any} newValue - New value
     * @param {any} oldValue - Previous value
     */
    notify(key, newValue, oldValue) {
        // Notify specific key listeners
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error('Error in state listener:', error);
                }
            });
        }
        
        // Notify global listeners
        const globalListeners = this.listeners.get('*');
        if (globalListeners) {
            globalListeners.forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error('Error in global state listener:', error);
                }
            });
        }
    }
    
    /**
     * Add middleware to process state changes
     * @param {function} middleware - Middleware function
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    
    /**
     * Remove middleware
     * @param {function} middleware - Middleware function to remove
     */
    removeMiddleware(middleware) {
        const index = this.middleware.indexOf(middleware);
        if (index !== -1) {
            this.middleware.splice(index, 1);
        }
    }
    
    /**
     * Get a snapshot of the current state
     * @returns {object} - State snapshot
     */
    getSnapshot() {
        const snapshot = {};
        for (const [key, value] of this.state) {
            snapshot[key] = value;
        }
        return snapshot;
    }
    
    /**
     * Load state from a snapshot
     * @param {object} snapshot - State snapshot
     */
    loadSnapshot(snapshot) {
        this.clear();
        Object.entries(snapshot).forEach(([key, value]) => {
            this.set(key, value);
        });
    }
    
    /**
     * Persist state to localStorage
     * @param {string} key - Storage key
     */
    persist(key = 'momech-state') {
        try {
            const snapshot = this.getSnapshot();
            localStorage.setItem(key, JSON.stringify(snapshot));
        } catch (error) {
            console.error('Failed to persist state:', error);
        }
    }
    
    /**
     * Restore state from localStorage
     * @param {string} key - Storage key
     */
    restore(key = 'momech-state') {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const snapshot = JSON.parse(stored);
                this.loadSnapshot(snapshot);
            }
        } catch (error) {
            console.error('Failed to restore state:', error);
        }
    }
    
    /**
     * Create a computed value that updates when dependencies change
     * @param {array} dependencies - Array of state keys to depend on
     * @param {function} compute - Function to compute the value
     * @returns {function} - Function to get the computed value
     */
    computed(dependencies, compute) {
        let cachedValue;
        let isValid = false;
        
        const unsubscribers = dependencies.map(dep => 
            this.subscribe(dep, () => {
                isValid = false;
            })
        );
        
        const getter = () => {
            if (!isValid) {
                const values = dependencies.map(dep => this.get(dep));
                cachedValue = compute(...values);
                isValid = true;
            }
            return cachedValue;
        };
        
        // Add cleanup method
        getter.cleanup = () => {
            unsubscribers.forEach(unsub => unsub());
        };
        
        return getter;
    }
}