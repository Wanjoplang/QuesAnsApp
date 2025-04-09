document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginSection = document.getElementById('login-section');
    const questionsSection = document.getElementById('questions-section');
    const loginError = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const askQuestionBtn = document.getElementById('ask-question-btn');
    const usernameDisplay = document.getElementById('username-display'); // Get the new display element

    // Check for existing token on page load
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        loginSection.style.display = 'none';
        questionsSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        loginBtn.style.display = 'none';
        askQuestionBtn.style.display = 'block';
        // Optionally, try to fetch user info here to display username if not stored
    } else {
        loginSection.style.display = 'block';
        questionsSection.style.display = 'none';
        logoutBtn.style.display = 'none';
        loginBtn.style.display = 'block';
        askQuestionBtn.style.display = 'none';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const username = usernameInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('https://quesansapi.deno.dev/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('authToken', data.token);
                    loginSection.style.display = 'none';
                    questionsSection.style.display = 'block';
                    logoutBtn.style.display = 'block';
                    loginBtn.style.display = 'none';
                    askQuestionBtn.style.display = 'block';
                    loginError.style.display = 'none';
                    usernameDisplay.textContent = username; // Display the username
                    window.loadQuestions(); // Load questions after successful login
                } else {
                    loginError.textContent = data.userMessage || 'Login failed. Please check your credentials.';
                    loginError.style.display = 'block';
                }
            } catch (error) {
                console.error('Login error:', error);
                loginError.textContent = 'An unexpected error occurred during login.';
                loginError.style.display = 'block';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            loginSection.style.display = 'block';
            questionsSection.style.display = 'none';
            logoutBtn.style.display = 'none';
            loginBtn.style.display = 'block';
            askQuestionBtn.style.display = 'none';
            usernameDisplay.textContent = ''; // Clear the username display
        });
    }
});