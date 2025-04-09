document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const questionsSection = document.getElementById('questions-section');
    const createQuestionSection = document.getElementById('create-question-section');
    const askQuestionBtn = document.getElementById('ask-question-btn');

    let authToken = localStorage.getItem('authToken');

    // Function to update UI based on authentication status
    function updateAuthUI() {
        if (authToken) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            loginSection.style.display = 'none';
            askQuestionBtn.style.display = 'block';
            createQuestionSection.style.display = 'none';
        } else {
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
            loginSection.style.display = 'none'; // Initially hidden
            askQuestionBtn.style.display = 'none';
            createQuestionSection.style.display = 'none';
        }
    }

    // Event listener for the "Login" button to show the login form
    loginBtn.addEventListener('click', () => {
        loginSection.style.display = 'block';
    });

    // Event listener for the login form submission
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
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                authToken = data.token;
                localStorage.setItem('authToken', authToken);
                loginError.style.display = 'none';
                usernameInput.value = '';
                passwordInput.value = '';
                updateAuthUI();
                // Potentially load questions after successful login
                loadQuestions();
            } else {
                loginError.textContent = data.userMessage || 'Login failed. Please try again.';
                loginError.style.display = 'block';
            }

        } catch (error) {
            console.error('Login error:', error);
            loginError.textContent = 'An unexpected error occurred during login.';
            loginError.style.display = 'block';
        }
    });

    // Event listener for the "Logout" button
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('https://quesansapi.deno.dev/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                authToken = null;
                localStorage.removeItem('authToken');
                updateAuthUI();
                // Potentially clear displayed questions
                document.getElementById('question-list').innerHTML = '';
            } else {
                console.error('Logout failed:', data);
                alert(data.userMessage || 'Logout failed. Please try again.');
            }

        } catch (error) {
            console.error('Logout error:', error);
            alert('An unexpected error occurred during logout.');
        }
    });

    // Initial UI update on page load
    updateAuthUI();

    // Load questions if a token is already present
    if (authToken) {
        loadQuestions();
    }
});