document.addEventListener('DOMContentLoaded', () => {
    const questionTextElement = document.getElementById('question-text');
    const createdAtElement = document.getElementById('created-at');
    const tagsElement = document.getElementById('tags');
    const userIdElement = document.getElementById('user-id');
    const answersListElement = document.getElementById('answers-list');
    const addAnswerForm = document.getElementById('add-answer-form');
    const answerTextarea = document.getElementById('answer-text');
    const answerErrorMessage = document.getElementById('answer-error-message');
    const answerSuccessMessage = document.getElementById('answer-success-message');

    const urlParams = new URLSearchParams(window.location.search);
    const questionId = urlParams.get('id');
    const apiUrl = 'https://quesansapi.deno.dev'; // Replace with your actual API URL

    if (!questionId) {
        console.error('Question ID not found in the URL.');
        questionTextElement.textContent = 'Error: Question ID missing.';
        return;
    }

    async function fetchQuestionDetails(id) {
        try {
            const response = await fetch(`${apiUrl}/questions/${id}`);
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error fetching question:', errorData);
                questionTextElement.textContent = `Error: Could not load question (${response.status})`;
                return;
            }
            const question = await response.json();
            displayQuestion(question);
        } catch (error) {
            console.error('Error fetching question:', error);
            questionTextElement.textContent = 'Error: Failed to connect to the API.';
        }
    }

    function displayQuestion(question) {
        questionTextElement.textContent = question.questionText;
        createdAtElement.textContent = new Date(question.createdAt).toLocaleString();
        tagsElement.textContent = question.tags ? question.tags.join(', ') : 'No tags';
        userIdElement.textContent = question.userId || 'Anonymous';

        answersListElement.innerHTML = '';
        if (question.answers && question.answers.length > 0) {
            question.answers.forEach(answer => {
                const answerItem = document.createElement('li');
                answerItem.textContent = answer.answerText;
                const answerMeta = document.createElement('p');
                answerMeta.classList.add('meta');
                answerMeta.textContent = `Answered At: ${new Date(answer.createdAt).toLocaleString()}`;
                answerItem.appendChild(answerMeta);
                answersListElement.appendChild(answerItem);
            });
        } else {
            const noAnswersItem = document.createElement('li');
            noAnswersItem.textContent = 'No answers yet.';
            answersListElement.appendChild(noAnswersItem);
        }
    }

    async function submitAnswer(event) {
        event.preventDefault();

        const answerText = answerTextarea.value.trim();

        if (!answerText) {
            answerErrorMessage.textContent = 'Please enter your answer.';
            answerErrorMessage.style.display = 'block';
            answerSuccessMessage.style.display = 'none';
            return;
        }

        answerErrorMessage.style.display = 'none';
        answerSuccessMessage.style.display = 'none';

        try {
            const response = await fetch(`${apiUrl}/questions/${questionId}`, {
                method: 'PUT', // Assuming you'll update the question with a new answer
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers: [
                        {
                            answerText: answerText
                        }
                    ]
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error submitting answer:', errorData);
                answerErrorMessage.textContent = `Error: ${errorData.userMessage || 'Failed to submit answer.'}`;
                answerErrorMessage.style.display = 'block';
                return;
            }

            const updatedQuestion = await response.json();
            answerTextarea.value = ''; // Clear the input
            answerSuccessMessage.textContent = 'Answer submitted successfully!';
            answerSuccessMessage.style.display = 'block';
            // Re-fetch the question details to display the new answer
            fetchQuestionDetails(questionId);

        } catch (error) {
            console.error('Error submitting answer:', error);
            answerErrorMessage.textContent = 'Error: Failed to connect to the API.';
            answerErrorMessage.style.display = 'block';
        }
    }

    if (addAnswerForm) {
        addAnswerForm.addEventListener('submit', submitAnswer);
    }

    // Fetch question details when the page loads
    fetchQuestionDetails(questionId);
});