/**
 * Simple Hash-based Router for MoMech SPA
 * Handles client-side routing without page refreshes
 */

export class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.params = {};
    }
    
    /**
     * Add a route to the router
     * @param {string} pattern - Route pattern (e.g., '/users/:id')
     * @param {function} handler - Function to call when route matches
     */
    addRoute(pattern, handler) {
        this.routes.set(pattern, {
            pattern,
            handler,
            regex: this.createRegex(pattern),
            paramNames: this.extractParamNames(pattern)
        });
    }
    
    /**
     * Initialize the router and start listening for hash changes
     */
    init() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial route
        this.handleRoute();
    }
    
    /**
     * Navigate to a specific route
     * @param {string} path - Path to navigate to
     */
    navigate(path) {
        window.location.hash = path;
    }
    
    /**
     * Handle the current route
     */
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const route = this.matchRoute(hash);
        
        if (route) {
            this.currentRoute = route;
            this.params = this.extractParams(hash, route);
            
            try {
                route.handler(this.params);
            } catch (error) {
                console.error('Error handling route:', error);
                this.handleError(error);
            }
        } else {
            // No matching route found, try wildcard
            const wildcardRoute = this.routes.get('*');
            if (wildcardRoute) {
                wildcardRoute.handler();
            } else {
                console.warn('No route found for:', hash);
            }
        }
    }
    
    /**
     * Match a path against all registered routes
     * @param {string} path - Path to match
     * @returns {object|null} - Matching route object or null
     */
    matchRoute(path) {
        for (const [pattern, route] of this.routes) {
            if (pattern === '*') continue; // Skip wildcard for now
            
            if (route.regex.test(path)) {
                return route;
            }
        }
        return null;
    }
    
    /**
     * Create a regex pattern from a route pattern
     * @param {string} pattern - Route pattern
     * @returns {RegExp} - Regular expression for matching
     */
    createRegex(pattern) {
        if (pattern === '*') return /.*/;
        
        // Escape special characters and replace parameters
        const regexPattern = pattern
            .replace(/\//g, '\\/')
            .replace(/:\w+/g, '([^/]+)');
        
        return new RegExp(`^${regexPattern}$`);
    }
    
    /**
     * Extract parameter names from a route pattern
     * @param {string} pattern - Route pattern
     * @returns {array} - Array of parameter names
     */
    extractParamNames(pattern) {
        const matches = pattern.match(/:\w+/g);
        return matches ? matches.map(match => match.slice(1)) : [];
    }
    
    /**
     * Extract parameter values from a path using a route
     * @param {string} path - Current path
     * @param {object} route - Route object
     * @returns {object} - Object with parameter key-value pairs
     */
    extractParams(path, route) {
        const matches = path.match(route.regex);
        const params = {};
        
        if (matches && route.paramNames.length > 0) {
            route.paramNames.forEach((name, index) => {
                params[name] = matches[index + 1];
            });
        }
        
        return params;
    }
    
    /**
     * Handle routing errors
     * @param {Error} error - Error object
     */
    handleError(error) {
        console.error('Router error:', error);
        // You could navigate to an error page here
        this.navigate('/error');
    }
    
    /**
     * Get current route information
     * @returns {object} - Current route and params
     */
    getCurrentRoute() {
        return {
            route: this.currentRoute,
            params: this.params,
            path: window.location.hash.slice(1) || '/'
        };
    }
    
    /**
     * Go back in history
     */
    back() {
        window.history.back();
    }
    
    /**
     * Go forward in history
     */
    forward() {
        window.history.forward();
    }
    
    /**
     * Replace current route without adding to history
     * @param {string} path - Path to replace with
     */
    replace(path) {
        window.location.replace(`#${path}`);
    }
}