class CartManager {
    static init() {
        this.updateCartCount();
        this.setupCartListeners();
    }

    static updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        }
    }

    static addToCart(bookId) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if item already exists in cart
        const existingItem = cart.find(item => item.id === bookId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: bookId,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCount();
        return true;
    }

    static setupCartListeners() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const bookId = e.target.dataset.id;
                if (this.addToCart(bookId)) {
                    // Show feedback
                    const originalText = e.target.textContent;
                    e.target.textContent = 'Added! ✓';
                    e.target.disabled = true;
                    
                    setTimeout(() => {
                        e.target.textContent = originalText;
                        e.target.disabled = false;
                    }, 2000);
                }
            });
        });
    }
}

export default CartManager; 