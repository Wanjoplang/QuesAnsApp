// js/answers.js
document.addEventListener('DOMContentLoaded', () => {
    const answerForm = document.getElementById('answer-form');
    const answerListContainer = document.getElementById('answer-list');
    const answerError = document.getElementById('answer-error');

    async function fetchAnswers(questionId) {
        try {
            const authToken = localStorage.getItem('authToken');
            if (!authToken) {
                console.error('Authentication token not found. Cannot fetch answers.');
                answerListContainer.innerHTML = '<p class="error">You are not logged in. Please log in to see answers.</p>';
                return;
            }
            const response = await fetch(`https://quesansapi.deno.dev/questions/${questionId}/answers`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                displayAnswers(data);
            } else if (response.status === 401) {
                console.error(`Failed to fetch answers for question ID ${questionId}: Unauthorized`);
                answerListContainer.innerHTML = '<p class="error">You are not authorized to see answers for this question. Please log in.</p>';
            } else {
                console.error(`Failed to fetch answers for question ID ${questionId}:`, data);
                answerListContainer.innerHTML = '<p class="error">Failed to load answers.</p>';
            }
        } catch (error) {
            console.error(`Error fetching answers for question ID ${questionId}:`, error);
            answerListContainer.innerHTML = '<p class="error">An unexpected error occurred while loading answers.</p>';
        }
    }

    function displayAnswers(answers) {
        answerListContainer.innerHTML = '';
        if (answers && answers.length > 0) {
            answers.forEach(answer => {
                const answerDiv = document.createElement('div');
                answerDiv.classList.add('answer-item');
                answerDiv.innerHTML = `<p>${answer.body}</p><p class="created-at">Answered on: ${new Date(answer.created_at).toLocaleDateString()} ${new Date(answer.created_at).toLocaleTimeString()}</p><hr>`;
                answerListContainer.appendChild(answerDiv);
            });
        } else {
            answerListContainer.innerHTML = '<p>No answers yet.</p>';
        }
    }

    if (answerForm) {
        answerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const answerBodyInput = document.getElementById('answer-body');
            const answerBody = answerBodyInput.value;
            const questionId = document.querySelector('#question-detail-section')?.dataset?.questionId;
            const authToken = localStorage.getItem('authToken');

            if (!questionId) {
                console.error('Question ID not found when submitting answer.');
                answerError.textContent = 'Could not submit answer. Question ID is missing.';
                answerError.style.display = 'block';
                return;
            }

            if (!authToken) {
                answerError.textContent = 'You must be logged in to submit an answer.';
                answerError.style.display = 'block';
                return;
            }

            try {
                const response = await fetch('https://quesansapi.deno.dev/answers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ question_id: questionId, body: answerBody })
                });

                const data = await response.json();

                if (response.ok) {
                    answerBodyInput.value = '';
                    answerError.style.display = 'none';
                    // Re-fetch answers to display the new one
                    fetchAnswers(questionId);
                } else {
                    answerError.textContent = data.userMessage || 'Failed to submit answer. Please try again.';
                    answerError.style.display = 'block';
                }

            } catch (error) {
                console.error('Error submitting answer:', error);
                answerError.textContent = 'An unexpected error occurred while submitting your answer.';
                answerError.style.display = 'block';
            }
        });
    }

    // Make the fetchAnswers function globally accessible so questions.js can call it
    window.fetchAnswers = fetchAnswers;
});