import API from '../utils/api.js';
import CartManager from '../utils/cartManager.js';

class ProductPage {
    constructor() {
        this.bookId = this.getBookIdFromUrl();
        this.initializePage();
    }

    getBookIdFromUrl() {
        // Get book ID from URL parameters
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    async initializePage() {
        try {
            const bookData = await this.getBookData();
            this.displayBookData(bookData);
            this.setupAddToCartButton();
        } catch (error) {
            console.error('Error initializing product page:', error);
        }
    }

    async getBookData() {
        const books = {
            '1': {
                id: '1',
                title: 'Write and Grow Rich',
                author: 'Yasmine Chraibi',
                price: 29.99,
                image: '../../assets/1.png',
                description: 'The Ultimate Manifestation Workbook for Abundance, Business, and Success',
                mainText: 'Imagine living a life where abundance flows effortlessly into your personal and professional world. This workbook is your all-in-one manifestation guide and planner toolkit for building wealth, managing your business, and manifesting success.',
                bulletPoints: [
                    'Exclusive Planner Tools to Build Wealth and Scale Your Business',
                    'Daily Money Manifestation Practices and Scripting Techniques',
                    'Weekly Alignment Practices for Financial Freedom'
                ]
            },
            '2': {
                id: '2',
                title: 'The Geometry of Spirit',
                author: 'Yasmine Chraibi',
                price: 24.99,
                image: '../../assets/2.png',
                description: 'Sacred Patterns of Existence',
                mainText: 'Explore the profound connection between geometric patterns and spiritual wisdom. This book reveals how sacred geometry shapes our universe and influences our consciousness.',
                bulletPoints: [
                    'Discover the hidden meanings behind sacred geometric patterns',
                    'Learn how to apply geometric principles to spiritual practice',
                    'Understand the universal language of sacred shapes'
                ]
            },
            '3': {
                id: '3',
                title: 'Everything and Beyond',
                author: 'Yasmine Chraibi',
                price: 34.99,
                image: '../../assets/3.png',
                description: 'A Journey Through Consciousness',
                mainText: 'Journey beyond the boundaries of conventional thinking. This book opens new perspectives on existence and consciousness, guiding you through transformative insights.',
                bulletPoints: [
                    'Explore advanced concepts of consciousness and reality',
                    'Learn practical techniques for expanding awareness',
                    'Discover the interconnectedness of all things'
                ]
            }
        };

        return books[this.bookId] || null;
    }

    displayBookData(book) {
        if (!book) {
            window.location.href = '/pages/shop.html';
            return;
        }

        document.title = `${book.title} - Alchemy Academy`;
        document.getElementById('bookImage').src = book.image;
        document.getElementById('bookImage').alt = book.title;
        document.getElementById('bookTitle').textContent = book.title;
        document.getElementById('bookSubtitle').textContent = book.description;
        document.getElementById('bookAuthor').textContent = book.author;
        document.getElementById('bookPrice').textContent = `$${book.price}`;
        document.getElementById('mainText').textContent = book.mainText;

        // Display bullet points
        const bulletPointsContainer = document.getElementById('bulletPoints');
        bulletPointsContainer.innerHTML = book.bulletPoints
            .map(point => `<li>${point}</li>`)
            .join('');
            
        // Show/hide feature banners based on product
        const featureBanners = document.getElementById('featureBanners');
        const productGallery = document.querySelector('.product-gallery');
        
        if (book.id === '1') { // Write and Grow Rich
            featureBanners.style.display = 'block';
            productGallery.style.display = 'block';
            this.setupSlider();  // Initialize slider only for Write and Grow Rich
        } else {
            featureBanners.style.display = 'none';
            productGallery.style.display = 'none';
        }
    }

    setupAddToCartButton() {
        const addToCartBtn = document.getElementById('addToCartBtn');
        const addedMessage = document.getElementById('addedMessage');

        addToCartBtn.addEventListener('click', () => {
            if (CartManager.addToCart(this.bookId)) {
                addedMessage.style.display = 'block';
                setTimeout(() => {
                    addedMessage.style.display = 'none';
                }, 2000);
            }
        });
    }

    setupSlider() {
        // Only setup slider if elements exist (Write and Grow Rich page)
        const track = document.getElementById('sliderTrack');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const dotsContainer = document.getElementById('sliderDots');
        
        if (!track || !prevBtn || !nextBtn || !dotsContainer) return;
        
        let currentSlide = 0;
        const slides = track.children;
        const slideCount = slides.length;
        
        // Create dots
        for (let i = 0; i < slideCount; i++) {
            const dot = document.createElement('div');
            dot.className = `dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
        
        const updateDots = () => {
            document.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        };
        
        const goToSlide = (n) => {
            currentSlide = (n + slideCount) % slideCount;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            updateDots();
        };
        
        prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
        
        // Auto advance slides
        setInterval(() => goToSlide(currentSlide + 1), 5000);
    }
}

// Initialize the product page
document.addEventListener('DOMContentLoaded', () => {
    new ProductPage();
}); 