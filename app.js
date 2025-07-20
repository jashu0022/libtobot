// LibroBot - Smart Library Assistant JavaScript

class LibroBot {
    constructor() {
        this.currentSession = {
            id: this.generateSessionId(),
            context: {},
            step: 'initial',
            searchResults: []
        };
        
        this.sampleBooks = [
            {
                id: 1,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                category: "Literature",
                department: "English Literature",
                shelf: "A1-15",
                total_copies: 5,
                available_copies: 3,
                isbn: "9780743273565",
                description: "A classic American novel set in the Jazz Age"
            },
            {
                id: 2,
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                category: "Literature",
                department: "English Literature",
                shelf: "A1-22",
                total_copies: 4,
                available_copies: 2,
                isbn: "9780061120084",
                description: "A gripping tale of racial injustice and childhood innocence"
            },
            {
                id: 3,
                title: "Introduction to Algorithms",
                author: "Thomas H. Cormen",
                category: "Computer Science",
                department: "Computer Science",
                shelf: "C2-08",
                total_copies: 3,
                available_copies: 1,
                isbn: "9780262033848",
                description: "Comprehensive guide to algorithms and data structures"
            },
            {
                id: 4,
                title: "Clean Code",
                author: "Robert C. Martin",
                category: "Programming",
                department: "Computer Science",
                shelf: "C2-15",
                total_copies: 6,
                available_copies: 4,
                isbn: "9780132350884",
                description: "A handbook of agile software craftsmanship"
            },
            {
                id: 5,
                title: "A Brief History of Time",
                author: "Stephen Hawking",
                category: "Physics",
                department: "Science",
                shelf: "B3-12",
                total_copies: 3,
                available_copies: 2,
                isbn: "9780553380163",
                description: "Popular science book on cosmology and physics"
            },
            {
                id: 6,
                title: "Pride and Prejudice",
                author: "Jane Austen",
                category: "Literature",
                department: "English Literature",
                shelf: "A1-08",
                total_copies: 4,
                available_copies: 3,
                isbn: "9780141439518",
                description: "A romantic novel of manners"
            },
            {
                id: 7,
                title: "Design Patterns",
                author: "Gang of Four",
                category: "Programming",
                department: "Computer Science",
                shelf: "C2-22",
                total_copies: 2,
                available_copies: 0,
                isbn: "9780201633610",
                description: "Elements of reusable object-oriented software"
            },
            {
                id: 8,
                title: "The Origin of Species",
                author: "Charles Darwin",
                category: "Biology",
                department: "Science",
                shelf: "B2-05",
                total_copies: 2,
                available_copies: 1,
                isbn: "9780486450063",
                description: "Groundbreaking work on evolution"
            }
        ];

        this.responses = {
            greeting: "Hello! I'm LibroBot 📚. How can I help you today?",
            options: ["Search by Book Name", "Search by Category", "View Trending Books", "Ask a Librarian"],
            book_not_found: "Sorry, I couldn't find that book in our catalog. Would you like me to suggest similar books or search for something else?",
            multiple_results: "I found {count} books matching your search. Here are the results:",
            single_result: "Great! I found the book you're looking for:",
            availability_available: "✅ Available ({available}/{total} copies)",
            availability_unavailable: "❌ Currently not available (0/{total} copies)",
            shelf_location: "📍 Shelf Location: {shelf}",
            similar_books: "🔄 Would you like to see similar books in this category?"
        };

        this.categories = ["Literature", "Computer Science", "Programming", "Physics", "Biology", "Science"];
        this.departments = ["English Literature", "Computer Science", "Science", "History", "Mathematics"];
        this.typingTimeout = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.initDarkMode();
    }

    bindEvents() {
        // Start chat button
        document.getElementById('startChatBtn').addEventListener('click', () => {
            this.showChatInterface();
        });

        // New chat button
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.resetChat();
        });

        // Send button and enter key
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Back to chat button
        document.getElementById('backToChatBtn').addEventListener('click', () => {
            this.showChatInterface();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleDarkMode();
        });
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showChatInterface() {
        document.getElementById('welcomeBanner').classList.add('hidden');
        document.getElementById('chatContainer').classList.remove('hidden');
        document.getElementById('searchResults').classList.add('hidden');
        
        // Enable input and send button
        document.getElementById('chatInput').disabled = false;
        document.getElementById('sendBtn').disabled = false;
        
        if (this.currentSession.step === 'initial') {
            this.sendBotMessage(this.responses.greeting);
            this.showOptions(this.responses.options);
            this.currentSession.step = 'menu';
        }
    }

    resetChat() {
        this.currentSession = {
            id: this.generateSessionId(),
            context: {},
            step: 'initial',
            searchResults: []
        };
        
        // Clear typing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        document.getElementById('chatMessages').innerHTML = '';
        document.getElementById('chatOptions').innerHTML = '';
        document.getElementById('chatInput').value = '';
        
        this.showChatInterface();
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addUserMessage(message);
        input.value = '';
        
        this.processUserInput(message);
    }

    addUserMessage(message) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = 'message message--user';
        messageEl.innerHTML = `<div class="message-bubble">${this.escapeHtml(message)}</div>`;
        messagesContainer.appendChild(messageEl);
        this.scrollToBottom();
    }

    sendBotMessage(message) {
        this.showTypingIndicator();
        
        // Clear any existing typing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        this.typingTimeout = setTimeout(() => {
            this.hideTypingIndicator();
            const messagesContainer = document.getElementById('chatMessages');
            const messageEl = document.createElement('div');
            messageEl.className = 'message message--bot fade-in';
            messageEl.innerHTML = `<div class="message-bubble">${message}</div>`;
            messagesContainer.appendChild(messageEl);
            this.scrollToBottom();
            this.typingTimeout = null;
        }, 1500);
    }

    showOptions(options) {
        // Clear any existing typing timeout
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        
        this.typingTimeout = setTimeout(() => {
            // Ensure typing indicator is hidden before showing options
            this.hideTypingIndicator();
            
            const optionsContainer = document.getElementById('chatOptions');
            optionsContainer.innerHTML = '';
            
            options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option;
                button.addEventListener('click', () => {
                    this.handleOptionClick(option);
                });
                optionsContainer.appendChild(button);
            });
            this.typingTimeout = null;
        }, 1600);
    }

    handleOptionClick(option) {
        this.addUserMessage(option);
        document.getElementById('chatOptions').innerHTML = '';
        this.processUserInput(option);
    }

    processUserInput(input) {
        const lowerInput = input.toLowerCase();
        
        switch (this.currentSession.step) {
            case 'menu':
                this.handleMenuSelection(input);
                break;
            case 'search_by_name':
                this.searchByBookName(input);
                break;
            case 'search_by_category':
                this.handleCategorySearch(input);
                break;
            case 'category_selected':
                this.searchByCategory(input);
                break;
            default:
                this.handleGeneralInput(input);
                break;
        }
    }

    handleMenuSelection(selection) {
        const option = selection.toLowerCase();
        
        if (option.includes('book name')) {
            this.sendBotMessage("Please enter the name of the book you're looking for:");
            this.currentSession.step = 'search_by_name';
        } else if (option.includes('category')) {
            this.sendBotMessage("Please select a category:");
            this.showOptions(this.categories);
            this.currentSession.step = 'search_by_category';
        } else if (option.includes('trending')) {
            this.showTrendingBooks();
        } else if (option.includes('librarian')) {
            this.sendBotMessage("I'll connect you with our librarian. In the meantime, you can email us at librarian@library.com or call (555) 123-4567. How else can I help you?");
            this.showMainMenu();
        } else {
            this.handleGeneralInput(selection);
        }
    }

    searchByBookName(bookName) {
        const results = this.sampleBooks.filter(book => 
            book.title.toLowerCase().includes(bookName.toLowerCase()) ||
            book.author.toLowerCase().includes(bookName.toLowerCase())
        );

        if (results.length === 0) {
            this.sendBotMessage(this.responses.book_not_found);
            this.showOptions(["Try another search", "View similar books", "Main menu"]);
        } else if (results.length === 1) {
            this.sendBotMessage(this.responses.single_result);
            this.displaySearchResults(results);
        } else {
            this.sendBotMessage(this.responses.multiple_results.replace('{count}', results.length));
            this.displaySearchResults(results);
        }
        
        this.currentSession.searchResults = results;
        this.currentSession.step = 'results';
    }

    handleCategorySearch(category) {
        if (this.categories.includes(category)) {
            this.currentSession.context.selectedCategory = category;
            this.sendBotMessage(`Great! You selected ${category}. Now searching for books in this category...`);
            this.searchByCategory(category);
        } else {
            this.sendBotMessage("Please select a valid category from the options provided:");
            this.showOptions(this.categories);
        }
    }

    searchByCategory(category) {
        const results = this.sampleBooks.filter(book => 
            book.category.toLowerCase() === category.toLowerCase()
        );

        if (results.length === 0) {
            this.sendBotMessage(`Sorry, no books found in the ${category} category.`);
            this.showMainMenu();
        } else {
            this.sendBotMessage(`Found ${results.length} book(s) in ${category}:`);
            this.displaySearchResults(results);
        }
        
        this.currentSession.searchResults = results;
        this.currentSession.step = 'results';
    }

    showTrendingBooks() {
        // Show books with highest availability ratio
        const trending = this.sampleBooks
            .filter(book => book.available_copies > 0)
            .sort((a, b) => (b.available_copies / b.total_copies) - (a.available_copies / a.total_copies))
            .slice(0, 3);
            
        this.sendBotMessage("Here are our trending books this week:");
        this.displaySearchResults(trending);
        this.currentSession.searchResults = trending;
        this.currentSession.step = 'results';
    }

    displaySearchResults(books) {
        // Clear any existing typing timeout and hide typing indicator
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
        this.hideTypingIndicator();
        
        setTimeout(() => {
            document.getElementById('chatContainer').classList.add('hidden');
            document.getElementById('searchResults').classList.remove('hidden');
            
            const resultsGrid = document.getElementById('resultsGrid');
            resultsGrid.innerHTML = '';
            
            books.forEach(book => {
                const bookCard = this.createBookCard(book);
                resultsGrid.appendChild(bookCard);
            });
        }, 2000);
    }

    createBookCard(book) {
        const card = document.createElement('div');
        card.className = 'book-card fade-in';
        
        const availability = book.available_copies > 0 
            ? this.responses.availability_available.replace('{available}', book.available_copies).replace('{total}', book.total_copies)
            : this.responses.availability_unavailable.replace('{total}', book.total_copies);
            
        const availabilityClass = book.available_copies > 0 ? 'availability-available' : 'availability-unavailable';
        
        card.innerHTML = `
            <h4 class="book-title">${book.title}</h4>
            <p class="book-author">by ${book.author}</p>
            <div class="book-details">
                <div class="book-detail-item">
                    <span>📚</span>
                    <span>${book.category}</span>
                </div>
                <div class="book-detail-item">
                    <span>🏛️</span>
                    <span>${book.department}</span>
                </div>
                <div class="book-detail-item">
                    <span>📍</span>
                    <span>Shelf: ${book.shelf}</span>
                </div>
                <div class="book-detail-item ${availabilityClass}">
                    <span>${availability}</span>
                </div>
            </div>
            <div class="book-actions">
                <button class="btn btn--primary btn--sm" onclick="libroBot.findSimilarBooks(${book.id})">
                    Similar Books
                </button>
                <button class="btn btn--outline btn--sm" onclick="libroBot.showMainMenu()">
                    New Search
                </button>
            </div>
        `;
        
        return card;
    }

    findSimilarBooks(bookId) {
        const book = this.sampleBooks.find(b => b.id === bookId);
        if (!book) return;
        
        const similar = this.sampleBooks.filter(b => 
            b.id !== bookId && 
            (b.category === book.category || b.department === book.department || b.author === book.author)
        ).slice(0, 3);
        
        if (similar.length > 0) {
            this.displaySearchResults(similar);
        } else {
            this.showChatInterface();
            this.sendBotMessage("Sorry, no similar books found. Let me help you search for something else!");
            this.showMainMenu();
        }
    }

    showMainMenu() {
        this.currentSession.step = 'menu';
        setTimeout(() => {
            this.showChatInterface();
            this.sendBotMessage("How else can I help you?");
            this.showOptions(this.responses.options);
        }, 500);
    }

    handleGeneralInput(input) {
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('hi') || lowerInput.includes('hello') || lowerInput.includes('hey')) {
            this.sendBotMessage(this.responses.greeting);
            this.showOptions(this.responses.options);
            this.currentSession.step = 'menu';
        } else if (lowerInput.includes('thank') || lowerInput.includes('thanks')) {
            this.sendBotMessage("You're welcome! Is there anything else I can help you find?");
            this.showOptions(["Search again", "Main menu", "Exit"]);
        } else if (lowerInput.includes('exit') || lowerInput.includes('quit') || lowerInput.includes('bye')) {
            this.sendBotMessage("Thank you for using LibroBot! Have a great day! 📚✨");
            setTimeout(() => {
                document.getElementById('chatContainer').classList.add('hidden');
                document.getElementById('welcomeBanner').classList.remove('hidden');
                this.resetChat();
            }, 2000);
        } else {
            // Try to search for the input as a book name
            this.searchByBookName(input);
        }
    }

    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.classList.remove('hidden');
            this.scrollToBottom();
        }
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.classList.add('hidden');
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Dark Mode functionality
    initDarkMode() {
        const savedTheme = 'light'; // Don't use localStorage per strict instructions
        this.setTheme(savedTheme);
    }

    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        document.getElementById('darkModeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
        // Don't use localStorage per strict instructions
    }
}

// Initialize LibroBot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.libroBot = new LibroBot();
});

// Expose for global access
window.LibroBot = LibroBot;