import CONFIG from '../../config/config.js';
import { handleError } from './helpers.js';

class API {
    static async request(endpoint, options = {}) {
        try {
            const url = CONFIG.API.BASE_URL + endpoint;
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            // Add auth token if it exists
            const token = localStorage.getItem('authToken');
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                data
            };
        } catch (error) {
            return handleError(error);
        }
    }

    // Books API methods
    static async getBooks(page = 1, filters = {}) {
        return await this.request(`${CONFIG.API.ENDPOINTS.BOOKS}?page=${page}`, {
            method: 'GET'
        });
    }

    static async getBookById(id) {
        return await this.request(`${CONFIG.API.ENDPOINTS.BOOKS}/${id}`, {
            method: 'GET'
        });
    }

    // Consultations API methods
    static async getConsultationSlots() {
        // For demonstration, return mock data
        // In a real application, this would fetch from your backend
        return {
            success: true,
            data: {
                // Mock some booked slots
                '2024-01-20': ['09:00', '14:00'],
                '2024-01-21': ['10:00', '15:00'],
                '2024-01-22': ['11:00', '16:00']
            }
        };
    }

    static async bookConsultation(formData) {
        // For demonstration, simulate a successful booking
        // In a real application, this would send data to your backend
        console.log('Booking consultation with data:', formData);
        return {
            success: true,
            data: {
                message: 'Consultation booked successfully'
            }
        };
    }

    static async login(email, password) {
        // For demonstration, simulate a successful login
        // In a real application, this would make a request to your backend
        if (email === 'yaschraibi16@gmail.com' && password === 'radieusebelle18') {
            return {
                success: true,
                data: {
                    token: 'admin-token',
                    user: {
                        id: 1,
                        email: email,
                        name: 'Yasmine Chraibi',
                        role: 'admin'
                    }
                }
            };
        } else if (email === 'demo@example.com' && password === 'password') {
            return {
                success: true,
                data: {
                    token: 'user-token',
                    user: {
                        id: 2,
                        email: email,
                        name: 'Demo User',
                        role: 'user'
                    }
                }
            };
        }
        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

    static async getOrders() {
        return await this.request('/api/admin/orders', {
            method: 'GET'
        });
    }

    static async updateOrderStatus(orderId, status) {
        return await this.request(`/api/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }
}

export default API;
