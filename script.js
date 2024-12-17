// Calendar Functionality
class Calendar {
    constructor(year, month) {
        this.year = year;
        this.month = month;
        this.today = new Date();
        this.months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.events = new Map(); // Store events by date
    }

    generateCalendar() {
        const firstDay = new Date(this.year, this.month, 1);
        const lastDay = new Date(this.year, this.month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const calendarGrid = document.querySelector('.calendar-grid');
        if (!calendarGrid) return;

        // Clear existing calendar
        while (calendarGrid.children.length > 7) { // Keep day headers
            calendarGrid.removeChild(calendarGrid.lastChild);
        }

        // Add empty cells for days before the first of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Check if this date has events
            const dateStr = `${this.year}-${this.month + 1}-${day}`;
            if (this.events.has(dateStr)) {
                dayElement.classList.add('has-event');
                dayElement.setAttribute('data-events', JSON.stringify(this.events.get(dateStr)));
            }

            // Highlight today
            if (this.isToday(day)) {
                dayElement.classList.add('today');
            }

            dayElement.addEventListener('click', () => this.handleDayClick(dayElement, day));
            calendarGrid.appendChild(dayElement);
        }

        // Update calendar header
        document.querySelector('.calendar-header h3').textContent = 
            `${this.months[this.month]} ${this.year}`;
    }

    isToday(day) {
        return this.today.getDate() === day && 
               this.today.getMonth() === this.month && 
               this.today.getFullYear() === this.year;
    }

    handleDayClick(element, day) {
        if (element.classList.contains('empty')) return;

        const dateStr = `${this.year}-${this.month + 1}-${day}`;
        const events = this.events.get(dateStr);
        
        if (events) {
            this.showEventDetails(events, day);
        }
    }

    showEventDetails(events, day) {
        const modal = document.getElementById('event-modal');
        const modalContent = modal.querySelector('.modal-content');
        modalContent.innerHTML = `
            <h3>Events on ${this.months[this.month]} ${day}</h3>
            <div class="event-list">
                ${events.map(event => `
                    <div class="modal-event-item">
                        <h4>${event.title}</h4>
                        <p><i class="fas fa-clock"></i> ${event.time}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                        <p>${event.description}</p>
                        <a href="${event.registerLink}" class="btn-register">Register</a>
                    </div>
                `).join('')}
            </div>
        `;
        modal.style.display = 'block';
    }

    nextMonth() {
        if (this.month === 11) {
            this.month = 0;
            this.year++;
        } else {
            this.month++;
        }
        this.generateCalendar();
    }

    previousMonth() {
        if (this.month === 0) {
            this.month = 11;
            this.year--;
        } else {
            this.month--;
        }
        this.generateCalendar();
    }

    addEvent(date, event) {
        if (!this.events.has(date)) {
            this.events.set(date, []);
        }
        this.events.get(date).push(event);
    }
}

// News Filter and Archive Functionality
class NewsArchive {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.filters = {
            category: '',
            year: ''
        };
    }

    async fetchNews() {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch('/api/news?' + new URLSearchParams({
            page: this.currentPage,
            limit: this.itemsPerPage,
            category: this.filters.category,
            year: this.filters.year
        }));
        return await response.json();
    }

    async updateNewsGrid() {
        const newsGrid = document.querySelector('.archive-section .news-grid');
        if (!newsGrid) return;

        // Show loading state
        newsGrid.innerHTML = '<div class="loading">Loading...</div>';

        try {
            const news = await this.fetchNews();
            newsGrid.innerHTML = news.items.map(item => this.createNewsCard(item)).join('');
            this.updatePagination(news.total);
        } catch (error) {
            newsGrid.innerHTML = '<div class="error">Failed to load news items</div>';
            console.error('Error loading news:', error);
        }
    }

    createNewsCard(item) {
        return `
            <article class="news-card">
                <div class="news-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="news-content">
                    <span class="news-category">${item.category}</span>
                    <h3>${item.title}</h3>
                    <div class="news-meta">
                        <span><i class="fas fa-calendar"></i> ${item.date}</span>
                    </div>
                    <p>${item.excerpt}</p>
                    <a href="${item.link}" class="btn-read-more">Read More</a>
                </div>
            </article>
        `;
    }

    updatePagination(total) {
        const totalPages = Math.ceil(total / this.itemsPerPage);
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        let paginationHTML = `
            <button class="page-nav" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <span class="page-number ${i === this.currentPage ? 'active' : ''}">${i}</span>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<span class="page-dots">...</span>';
            }
        }

        paginationHTML += `
            <button class="page-nav" ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;
    }

    setFilter(type, value) {
        this.filters[type] = value;
        this.currentPage = 1; // Reset to first page when filtering
        this.updateNewsGrid();
    }

    goToPage(page) {
        this.currentPage = page;
        this.updateNewsGrid();
    }
}

// Newsletter Subscription
class NewsletterSubscription {
    constructor() {
        this.form = document.querySelector('.subscribe-form');
        this.setupListeners();
    }

    setupListeners() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = this.form.querySelector('input[type="email"]').value;
            await this.submitSubscription(email);
        });
    }

    async submitSubscription(email) {
        try {
            // Simulate API call - replace with actual API endpoint
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                this.showMessage('Successfully subscribed to newsletter!', 'success');
                this.form.reset();
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            this.showMessage('Failed to subscribe. Please try again later.', 'error');
            console.error('Subscription error:', error);
        }
    }

    showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `subscription-message ${type}`;
        messageElement.textContent = message;

        this.form.appendChild(messageElement);
        setTimeout(() => messageElement.remove(), 5000);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Calendar
    const calendar = new Calendar(new Date().getFullYear(), new Date().getMonth());
    
    // Add sample events
    calendar.addEvent('2024-3-20', {
        title: 'International Conference on Technology',
        time: '9:00 AM - 5:00 PM',
        location: 'Main Auditorium',
        description: 'Join us for the annual International Conference on Technology and Innovation.',
        registerLink: '#'
    });
    calendar.addEvent('2024-3-25', {
        title: 'Career Fair 2024',
        time: '10:00 AM - 4:00 PM',
        location: 'University Hall',
        description: 'Connect with leading employers and explore career opportunities.',
        registerLink: '#'
    });
    calendar.addEvent('2024-3-30', {
        title: 'Cultural Day Celebration',
        time: '11:00 AM - 6:00 PM',
        location: 'Sports Complex',
        description: 'Celebrate diversity with cultural performances, food, and exhibitions.',
        registerLink: '#'
    });

    calendar.generateCalendar();

    // Set up calendar navigation
    document.querySelectorAll('.calendar-nav').forEach(button => {
        button.addEventListener('click', () => {
            if (button.querySelector('.fa-chevron-left')) {
                calendar.previousMonth();
            } else {
                calendar.nextMonth();
            }
        });
    });

    // Initialize News Archive
    const newsArchive = new NewsArchive();
    
    // Set up filter listeners
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', () => {
            const type = select.id === 'category-filter' ? 'category' : 'year';
            newsArchive.setFilter(type, select.value);
        });
    });

    // Set up pagination listeners
    document.querySelector('.pagination')?.addEventListener('click', (e) => {
        const target = e.target.closest('.page-number, .page-nav');
        if (!target) return;

        if (target.classList.contains('page-number')) {
            newsArchive.goToPage(parseInt(target.textContent));
        } else if (target.classList.contains('page-nav')) {
            const direction = target.querySelector('.fa-chevron-left') ? -1 : 1;
            newsArchive.goToPage(newsArchive.currentPage + direction);
        }
    });

    // Initialize Newsletter Subscription
    new NewsletterSubscription();
});
