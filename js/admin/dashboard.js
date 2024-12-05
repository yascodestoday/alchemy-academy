import API from '../utils/api.js';
import AdminAuthGuard from './authGuard.js';

class AdminDashboard {
    constructor() {
        if (!AdminAuthGuard.checkAdminAccess()) {
            return;
        }
        this.orders = [];
        this.currentFilter = 'all';
        this.initializeDashboard();
    }

    async initializeDashboard() {
        await this.loadOrders();
        this.setupEventListeners();
    }

    async loadOrders() {
        try {
            const response = await API.getOrders();
            if (response.success) {
                this.orders = response.data;
                this.renderOrders();
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        }
    }

    setupEventListeners() {
        // Status filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderOrders();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/pages/account/login.html';
        });

        // Navigation
        document.querySelectorAll('.admin-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.dataset.section);
            });
        });
    }

    renderOrders() {
        const tableBody = document.getElementById('ordersTableBody');
        tableBody.innerHTML = '';

        const filteredOrders = this.currentFilter === 'all' 
            ? this.orders 
            : this.orders.filter(order => order.status === this.currentFilter);

        filteredOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order._id.slice(-6)}</td>
                <td>${order.shippingAddress.name}</td>
                <td>${this.formatOrderItems(order.items)}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="viewOrder('${order._id}')">View</button>
                    <select onchange="updateOrderStatus('${order._id}', this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    formatOrderItems(items) {
        return items.map(item => 
            `${item.product.title} (${item.quantity})`
        ).join(', ');
    }

    async viewOrder(orderId) {
        const order = this.orders.find(o => o._id === orderId);
        if (!order) return;

        const modal = document.getElementById('orderModal');
        const details = document.getElementById('orderDetails');
        
        details.innerHTML = `
            <div class="order-detail-grid">
                <div class="order-info">
                    <h3>Order Information</h3>
                    <p><strong>Order ID:</strong> #${order._id}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                </div>
                
                <div class="customer-info">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${order.shippingAddress.name}</p>
                    <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
                    <p><strong>Address:</strong> ${order.shippingAddress.address}</p>
                    <p><strong>City:</strong> ${order.shippingAddress.city}</p>
                    <p><strong>Country:</strong> ${order.shippingAddress.country}</p>
                </div>
                
                <div class="order-items">
                    <h3>Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.product.title}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${item.price.toFixed(2)}</td>
                                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            const response = await API.updateOrderStatus(orderId, newStatus);
            if (response.success) {
                const order = this.orders.find(o => o._id === orderId);
                if (order) {
                    order.status = newStatus;
                    this.renderOrders();
                }
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});

// Make functions available globally for inline event handlers
window.viewOrder = (orderId) => {
    window.adminDashboard.viewOrder(orderId);
};

window.updateOrderStatus = (orderId, status) => {
    window.adminDashboard.updateOrderStatus(orderId, status);
}; 