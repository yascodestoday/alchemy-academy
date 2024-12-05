import API from '../utils/api.js';

class ConsultationBooking {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableSlots = {};

        this.initializeCalendar();
        this.setupEventListeners();
        this.fetchAvailableSlots();
    }

    initializeCalendar() {
        this.updateCalendarHeader();
        this.renderCalendar();
    }

    updateCalendarHeader() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        
        document.getElementById('currentMonth').textContent = 
            `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    renderCalendar() {
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const calendar = document.getElementById('calendarGrid');
        calendar.innerHTML = '';

        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day header';
            dayHeader.textContent = day;
            calendar.appendChild(dayHeader);
        });

        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day disabled';
            calendar.appendChild(emptyDay);
        }

        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            const currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            if (currentDate < new Date().setHours(0,0,0,0)) {
                dayElement.classList.add('disabled');
            } else {
                dayElement.addEventListener('click', () => this.selectDate(currentDate));
            }

            calendar.appendChild(dayElement);
        }
    }

    async fetchAvailableSlots() {
        try {
            const response = await API.getConsultationSlots();
            if (response.success) {
                this.availableSlots = response.data;
                this.updateTimeSlots();
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    }

    updateTimeSlots() {
        const slotsContainer = document.getElementById('timeSlots');
        slotsContainer.innerHTML = '';

        if (!this.selectedDate) return;

        const dateString = this.selectedDate.toISOString().split('T')[0];
        const availableTimesForDate = this.availableSlots[dateString] || [];

        const timeSlots = [
            '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'
        ];

        timeSlots.forEach(time => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            if (availableTimesForDate.includes(time)) {
                slot.classList.add('disabled');
            } else {
                slot.addEventListener('click', () => this.selectTime(time));
            }
            slot.textContent = time;
            slotsContainer.appendChild(slot);
        });
    }

    selectDate(date) {
        this.selectedDate = date;
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        event.target.classList.add('selected');
        this.updateTimeSlots();
    }

    selectTime(time) {
        this.selectedTime = time;
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        event.target.classList.add('selected');
        document.getElementById('bookingForm').style.display = 'block';
    }

    setupEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.initializeCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.initializeCalendar();
        });

        document.getElementById('consultationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                date: this.selectedDate,
                time: this.selectedTime,
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                topic: document.getElementById('topic').value,
                notes: document.getElementById('notes').value
            };

            try {
                const response = await API.bookConsultation(formData);
                if (response.success) {
                    alert('Consultation booked successfully!');
                    window.location.reload();
                }
            } catch (error) {
                console.error('Error booking consultation:', error);
                alert('Failed to book consultation. Please try again.');
            }
        });
    }
}

// Initialize the booking system
document.addEventListener('DOMContentLoaded', () => {
    new ConsultationBooking();
});
