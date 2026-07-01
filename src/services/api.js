import {
  API_BASE,
  TIMEOUT,
  DEFAULT_HEADERS,
  ERROR_MESSAGES,
  HTTP_STATUS,
  HTTP_METHODS,
} from '../config/api.js';

class ApiService {
  constructor() {
    this.baseURL = API_BASE;
    this.timeout = TIMEOUT;
    this.defaultHeaders = DEFAULT_HEADERS;
    this.token = this.getStoredToken();
  }

  getStoredToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  setToken(token, remember = false) {
    this.token = token;
    if (remember) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }

  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  buildUrl(endpoint) {
    if (endpoint.startsWith('http')) return endpoint;
    return `${this.baseURL}${endpoint}`;
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const error = new Error(data.message || ERROR_MESSAGES.SERVER_ERROR);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  handleError(error) {
    if (!error.status) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    if (error.status === HTTP_STATUS.UNAUTHORIZED) {
      this.clearToken();
      throw new Error('Unauthorized');
    }
    throw error;
  }

  async request(method, endpoint, options = {}) {
    const { data, headers: customHeaders, ...otherOptions } = options;
    const requestConfig = {
      method,
      headers: this.getHeaders(customHeaders),
      ...otherOptions,
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      requestConfig.body = JSON.stringify(data);
    }

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
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      }
      return this.handleError(error);
    }
  }

  get(endpoint, params = {}, options = {}) {
    const url = new URL(this.buildUrl(endpoint));
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
    return this.request(HTTP_METHODS.GET, url.toString(), options);
  }

  post(endpoint, data = {}, options = {}) {
    return this.request(HTTP_METHODS.POST, endpoint, { data, ...options });
  }

  put(endpoint, data = {}, options = {}) {
    return this.request(HTTP_METHODS.PUT, endpoint, { data, ...options });
  }

  patch(endpoint, data = {}, options = {}) {
    return this.request(HTTP_METHODS.PATCH, endpoint, { data, ...options });
  }

  delete(endpoint, options = {}) {
    return this.request(HTTP_METHODS.DELETE, endpoint, options);
  }
}

const apiService = new ApiService();
export default apiService;
