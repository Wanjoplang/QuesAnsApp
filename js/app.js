// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const askQuestionBtn = document.getElementById('ask-question-btn');
    const createQuestionSection = document.getElementById('create-question-section');
    const createQuestionForm = document.getElementById('create-question-form');
    const createQuestionError = document.getElementById('create-question-error');
    const questionsSection = document.getElementById('questions-section');
    const usernameDisplay = document.getElementById('username-display');

    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        usernameDisplay.textContent = storedUsername;
    }

    if (askQuestionBtn) {
        askQuestionBtn.addEventListener('click', () => {
            createQuestionSection.style.display = 'block';
            questionsSection.style.display = 'none';
        });
    }

    if (createQuestionForm) {
        createQuestionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const titleInput = document.getElementById('question-title');
            const bodyInput = document.getElementById('question-body');
            const tagsInput = document.getElementById('question-tags');
            const title = titleInput.value;
            const body = bodyInput.value;
            const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
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
                    body: JSON.stringify({ title, body, tags })
                });

                const data = await response.json();

                if (response.ok) {
                    titleInput.value = '';
                    bodyInput.value = '';
                    tagsInput.value = '';
                    createQuestionError.style.display = 'none';
                    createQuestionSection.style.display = 'none';
                    questionsSection.style.display = 'block';
                    window.loadQuestions();
                } else {
                    createQuestionError.textContent = data.userMessage || 'Failed to ask question. Please try again.';
                    createQuestionError.style.display = 'block';
                }

            } catch (error) {
                console.error('Error asking question:', error);
                createQuestionError.textContent = 'An unexpected error occurred while asking your question.';
                createQuestionError.style.display = 'block';
            }
        });
    }
});