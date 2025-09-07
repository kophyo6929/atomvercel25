const API_URL = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || `HTTP ${response.status}` };
      }

      return { data, message: data.message };
    } catch (error) {
      console.error('API Request failed:', error);
      return { error: 'Network error or server unavailable' };
    }
  }

  // Auth endpoints
  async register(username: string, password: string, securityAmount: number) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, securityAmount }),
    });
  }

  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async resetPassword(userId: number, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId, newPassword }),
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async clearNotifications() {
    return this.request('/users/clear-notifications', {
      method: 'POST',
    });
  }

  async getSettings() {
    return this.request('/users/settings');
  }

  // Product endpoints
  async getProducts() {
    return this.request('/products');
  }

  async getProduct(id: number) {
    return this.request(`/products/${id}`);
  }

  // Order endpoints
  async getUserOrders() {
    return this.request('/orders');
  }

  async createCreditOrder(amount: number, proofImage?: string) {
    return this.request('/orders/credit', {
      method: 'POST',
      body: JSON.stringify({ amount, proofImage }),
    });
  }

  async createProductOrder(productId: string) {
    return this.request('/orders/product', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  // Admin endpoints
  async getAdminUsers() {
    return this.request('/admin/users');
  }

  async getAdminOrders() {
    return this.request('/admin/orders');
  }

  async updateOrderStatus(orderId: number, status: string) {
    return this.request(`/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async banUser(userId: number, banned: boolean) {
    return this.request(`/admin/users/${userId}/ban`, {
      method: 'PUT',
      body: JSON.stringify({ banned }),
    });
  }

  async broadcastMessage(message: string, targetIds?: number[]) {
    return this.request('/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify({ message, targetIds }),
    });
  }

  async updatePaymentAccount(provider: string, name: string, number: string, active: boolean = true) {
    return this.request(`/admin/payment-accounts/${provider}`, {
      method: 'PUT',
      body: JSON.stringify({ name, number, active }),
    });
  }

  async updateSetting(key: string, value: string) {
    return this.request(`/admin/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }
}

export const api = new ApiClient();
export default api;