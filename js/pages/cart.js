import CartManager from '../utils/cartManager.js';

class CartPage {
    constructor() {
        this.cart = [];
        this.books = {};
        this.loadCart();
        this.loadBooks();
        this.renderCart();
        this.setupEventListeners();
        this.initializePayPal();
    }

    loadCart() {
        this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    }

    async loadBooks() {
        // In a real app, this would fetch from an API
        this.books = {
            '1': {
                id: '1',
                title: 'Write and Grow Rich',
                price: 29.99,
                image: '../assets/1.png'
            },
            '2': {
                id: '2',
                title: 'The Geometry of Spirit',
                price: 24.99,
                image: '../assets/2.png'
            },
            '3': {
                id: '3',
                title: 'Everything and Beyond',
                price: 34.99,
                image: '../assets/3.png'
            }
        };
    }

    renderCart() {
        const cartItems = document.getElementById('cartItems');
        cartItems.innerHTML = '';

        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.style.display = this.cart.length === 0 ? 'none' : 'block';
        }

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p>Your cart is empty</p>';
            return;
        }

        this.cart.forEach(item => {
            const book = this.books[item.id];
            if (!book) return;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${book.image}" alt="${book.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${book.title}</h3>
                    <p class="cart-item-price">$${book.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-id="${book.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-id="${book.id}" data-action="increase">+</button>
                    </div>
                </div>
                <button class="remove-btn" data-id="${book.id}">×</button>
            `;
            cartItems.appendChild(itemElement);
        });

        this.updateSummary();
    }

    updateSummary() {
        const subtotal = this.cart.reduce((sum, item) => {
            const book = this.books[item.id];
            return sum + (book ? book.price * item.quantity : 0);
        }, 0);

        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }

    setupEventListeners() {
        document.getElementById('cartItems').addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const { id, action } = button.dataset;
            
            if (action === 'increase' || action === 'decrease') {
                this.updateQuantity(id, action === 'increase' ? 1 : -1);
            } else if (button.classList.contains('remove-btn')) {
                this.removeItem(id);
            }
        });

        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.cart.length === 0) {
                    alert('Your cart is empty');
                    return;
                }
                window.location.href = '/pages/checkout.html';
            });
        }
    }

    updateQuantity(id, change) {
        const item = this.cart.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, item.quantity + change);
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.renderCart();
            CartManager.updateCartCount();
        }
    }

    removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.renderCart();
        CartManager.updateCartCount();
    }

    initializePayPal() {
        // Wait for DOM to be ready
        setTimeout(() => {
            if (this.cart.length === 0) {
                document.querySelector('.payment-section').style.display = 'none';
                return;
            }

            paypal.Buttons({
                createOrder: (data, actions) => {
                    const total = this.calculateTotal();
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: total.toFixed(2)
                            }
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    const order = await actions.order.capture();
                    
                    // Clear cart
                    localStorage.removeItem('cart');
                    
                    // Redirect to success page
                    window.location.href = '/pages/order-success.html';
                },
                onError: (err) => {
                    console.error('PayPal Error:', err);
                    alert('There was an error processing your payment. Please try again.');
                }
            }).render('#paypal-button-container');
        }, 1000); // Give PayPal SDK time to load
    }

    calculateTotal() {
        const subtotal = this.cart.reduce((sum, item) => {
            const book = this.books[item.id];
            return sum + (book ? book.price * item.quantity : 0);
        }, 0);
        const tax = subtotal * 0.1; // 10% tax
        return subtotal + tax;
    }
}

// Initialize the cart page
document.addEventListener('DOMContentLoaded', () => {
    new CartPage();
}); 