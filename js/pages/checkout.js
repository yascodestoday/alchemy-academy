import API from '../utils/api.js';

class CheckoutPage {
    constructor() {
        this.cart = [];
        this.books = {};
        this.loadCart();
        this.loadBooks();
        this.renderOrderSummary();
        this.initializePayPal();
    }

    loadCart() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (this.cart.length === 0) {
            window.location.href = '/pages/cart.html';
            return;
        }
    }

    loadBooks() {
        // Load books from API
        API.getBooks().then(books => {
            this.books = books;
        });
    }

    renderOrderSummary() {
        const orderItems = document.getElementById('orderItems');
        let subtotal = 0;

        this.cart.forEach(item => {
            const book = this.books[item.id];
            if (!book) return;

            const itemTotal = book.price * item.quantity;
            subtotal += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <img src="${book.image}" alt="${book.title}">
                <div class="item-details">
                    <h3>${book.title}</h3>
                    <p class="quantity">Quantity: ${item.quantity}</p>
                </div>
                <div class="item-price">$${itemTotal.toFixed(2)}</div>
            `;
            orderItems.appendChild(itemElement);
        });

        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }

    async initializePayPal() {
        paypal.Buttons({
            createOrder: async () => {
                try {
                    const response = await fetch('/api/payments/create-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            total: this.total,
                            items: this.cart
                        })
                    });
                    const order = await response.json();
                    return order.id;
                } catch (error) {
                    console.error('Error creating order:', error);
                }
            },
            onApprove: async (data, actions) => {
                try {
                    const response = await fetch('/api/payments/capture-order', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            orderID: data.orderID,
                            items: this.cart,
                            total: this.total,
                            shippingAddress: this.getShippingAddress()
                        })
                    });

                    const orderData = await response.json();
                    if (orderData.success) {
                        // Clear cart and redirect to success page
                        localStorage.removeItem('cart');
                        window.location.href = '/pages/order-success.html';
                    }
                } catch (error) {
                    console.error('Error capturing order:', error);
                }
            },
            onError: (err) => {
                console.error('PayPal Error:', err);
                alert('There was an error processing your payment. Please try again.');
            }
        }).render('#paypal-button-container');
    }

    getShippingAddress() {
        // Get shipping info from form
        return {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value,
            postalCode: document.getElementById('postalCode').value
        };
    }
}

// Initialize checkout
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutPage();
}); 