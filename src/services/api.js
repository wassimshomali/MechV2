/**
 * Base API Service for MoMech
 * Centralized HTTP client with error handling, authentication, and request/response interceptors
 */

import config from '../../config/api.js';

class ApiService {
  constructor() {
    this.baseURL = config.API_CONFIG.API_BASE;
    this.timeout = config.API_CONFIG.TIMEOUT;
    this.defaultHeaders = config.DEFAULT_HEADERS;
    this.token = this.getStoredToken();
  }

  /**
   * Get stored authentication token
   */
  getStoredToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  /**
   * Set authentication token
   */
  setToken(token, remember = false) {
    this.token = token;
    if (remember) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  /**
   * Get request headers
   */
  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    // No authentication required for single-user app
    // if (this.token) {
    //   headers.Authorization = `Bearer ${this.token}`;
    // }

    return headers;
  }

  /**
   * Build full URL
   */
  buildUrl(endpoint) {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data.message || config.ERROR_MESSAGES.SERVER_ERROR);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    console.error('API Error:', error);

    // Network errors
    if (!error.status) {
      throw new Error(config.ERROR_MESSAGES.NETWORK_ERROR);
    }

    // HTTP status errors
    switch (error.status) {
      case config.HTTP_STATUS.UNAUTHORIZED:
        // No auth handling needed for single-user app
        // this.clearToken();
        // window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new Error(config.ERROR_MESSAGES.UNAUTHORIZED);
      
      case config.HTTP_STATUS.NOT_FOUND:
        throw new Error(config.ERROR_MESSAGES.NOT_FOUND);
      
      case config.HTTP_STATUS.UNPROCESSABLE_ENTITY:
        throw new Error(config.ERROR_MESSAGES.VALIDATION_ERROR);
      
      case config.HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case config.HTTP_STATUS.SERVICE_UNAVAILABLE:
        throw new Error(config.ERROR_MESSAGES.SERVER_ERROR);
      
      default:
        throw error;
    }
  }

  /**
   * Make HTTP request
   */
  async request(method, endpoint, options = {}) {
    const { data, headers: customHeaders, ...otherOptions } = options;
    
    const requestConfig = {
      method,
      headers: this.getHeaders(customHeaders),
      ...otherOptions
    };

    // Add body for POST, PUT, PATCH requests
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (data instanceof FormData) {
        // Remove Content-Type header for FormData (browser will set it)
        delete requestConfig.headers['Content-Type'];
        requestConfig.body = data;
      } else {
        requestConfig.body = JSON.stringify(data);
      }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    requestConfig.signal = controller.signal;

    try {
      const response = await fetch(this.buildUrl(endpoint), requestConfig);
      clearTimeout(timeoutId);
      return await this.handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(config.ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      
      return this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}, options = {}) {
    const url = new URL(this.buildUrl(endpoint));
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request(config.HTTP_METHODS.GET, url.toString(), options);
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}, options = {}) {
    return this.request(config.HTTP_METHODS.POST, endpoint, { data, ...options });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}, options = {}) {
    return this.request(config.HTTP_METHODS.PUT, endpoint, { data, ...options });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data = {}, options = {}) {
    return this.request(config.HTTP_METHODS.PATCH, endpoint, { data, ...options });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(config.HTTP_METHODS.DELETE, endpoint, options);
  }

  /**
   * Upload file
   */
  async upload(endpoint, file, additionalData = {}, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const options = {
      data: formData
    };

    // Add progress tracking if callback provided
    if (onProgress && typeof onProgress === 'function') {
      options.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    return this.post(endpoint, formData, options);
  }

  /**
   * Download file
   */
  async download(endpoint, filename = null) {
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        headers: this.getHeaders(),
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const response = await this.post(config.API_CONFIG.AUTH.REFRESH);
      if (response.token) {
        this.setToken(response.token);
        return response.token;
      }
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Request interceptor
const originalRequest = apiService.request.bind(apiService);
apiService.request = async function(method, endpoint, options = {}) {
  // Add request timestamp
  const requestStart = Date.now();
  
  try {
    const result = await originalRequest(method, endpoint, options);
    
    // Log successful requests in development
    if (config.API_CONFIG.BASE_URL.includes('localhost')) {
      console.log(`✅ ${method} ${endpoint} - ${Date.now() - requestStart}ms`);
    }
    
    return result;
  } catch (error) {
    // Log failed requests
    if (config.API_CONFIG.BASE_URL.includes('localhost')) {
      console.error(`❌ ${method} ${endpoint} - ${Date.now() - requestStart}ms`, error);
    }
    
    // No authentication handling needed for single-user app
    // if (error.status === 401 && endpoint !== config.API_CONFIG.AUTH.REFRESH) {
    //   try {
    //     await apiService.refreshToken();
    //     // Retry original request with new token
    //     return originalRequest(method, endpoint, options);
    //   } catch (refreshError) {
    //     // Refresh failed, redirect to login
    //     window.dispatchEvent(new CustomEvent('auth:logout'));
    //     throw refreshError;
    //   }
    // }
    
    throw error;
  }
};

export default apiService;
