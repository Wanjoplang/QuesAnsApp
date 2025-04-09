// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const questionsSection = document.getElementById('questions-section');
    const createQuestionSection = document.getElementById('create-question-section');
    const questionDetailSection = document.getElementById('question-detail-section');
    const askQuestionBtn = document.getElementById('ask-question-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const createQuestionForm = document.getElementById('create-question-form');
    const createQuestionError = document.getElementById('create-question-error');
    const usernameDisplay = document.getElementById('username-display');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mainNav = document.querySelector('.main-nav');
    const authButtons = document.querySelector('.auth-buttons');
    const userInfo = document.querySelector('.user-info');

    // Function to show a section and hide others
    function showSection(sectionId) {
        loginSection.style.display = 'none';
        questionsSection.style.display = 'none';
        createQuestionSection.style.display = 'none';
        questionDetailSection.style.display = 'none';

        if (sectionId) {
            const sectionToShow = document.getElementById(sectionId);
            if (sectionToShow) {
                sectionToShow.style.display = 'block';
            }
        }

        // Control visibility of Ask a Question button
        askQuestionBtn.style.display = (sectionId === 'questions-section' && localStorage.getItem('authToken')) ? 'block' : 'none';
    }

    // Event listeners for navigation
    if (askQuestionBtn) {
        askQuestionBtn.addEventListener('click', () => showSection('create-question-section'));
    }

    // Handle login button click
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showSection('login-section'));
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username'); // Clear username on logout
            updateAuthUI();
            window.loadQuestions(); // Reload questions after logout
            showSection('questions-section');
        });
    }

    // Update UI based on authentication status
    function updateAuthUI() {
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            if (userInfo) {
                userInfo.style.display = 'flex'; // Show user info after login
            }
            // Fetch and display username (you might need an API endpoint for this)
            const storedUsername = localStorage.getItem('username');
            usernameDisplay.textContent = storedUsername ? storedUsername : 'User'; // Default to 'User' if no username
            if (askQuestionBtn) {
                askQuestionBtn.style.display = 'block';
            }
        } else {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            if (userInfo) {
                userInfo.style.display = 'none'; // Hide user info on logout
            }
            usernameDisplay.textContent = '';
            askQuestionBtn.style.display = 'none';
            showSection('questions-section'); // Go back to questions on logout
        }
    }

    // Handle create question form submission
    if (createQuestionForm) {
        createQuestionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const titleInput = document.getElementById('question-title');
            const bodyInput = document.getElementById('question-body');
            const tagsInput = document.getElementById('question-tags');
            const authToken = localStorage.getItem('authToken');

            if (!authToken) {
                createQuestionError.textContent = 'You must be logged in to ask a question.';
                createQuestionError.style.display = 'block';
                return;
            }

            try {
                const response = await fetch('https://quesansapi.deno.dev/questions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        title: titleInput.value,
                        body: bodyInput.value,
                        tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    titleInput.value = '';
                    bodyInput.value = '';
                    tagsInput.value = '';
                    createQuestionError.style.display = 'none';
                    showSection('questions-section');
                    window.loadQuestions(); // Reload questions after creating one
                } else {
                    createQuestionError.textContent = data.userMessage || 'Failed to ask question. Please try again.';
                    createQuestionError.style.display = 'block';
                }

            } catch (error) {
                console.error('Error creating question:', error);
                createQuestionError.textContent = 'An unexpected error occurred while asking your question.';
                createQuestionError.style.display = 'block';
            }
        });
    }

    // Hamburger Menu Logic
    if (hamburgerMenu && mobileMenu && mainNav && authButtons) {
        hamburgerMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            mainNav.classList.toggle('open'); // You can style based on this class if needed

            // Move auth buttons to mobile menu on open, move back on close
            if (mobileMenu.classList.contains('open')) {
                mobileMenu.appendChild(authButtons);
            } else {
                mainNav.insertBefore(authButtons, hamburgerMenu); // Insert back before hamburger
            }
        });
    }

    // Initial setup
    updateAuthUI();
    showSection('questions-section'); // Show questions section on initial load
});