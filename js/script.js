// js/script.js

const questionListContainer = document.getElementById('question-list-container');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const questionList = document.getElementById('question-list');
const noQuestionsMessage = document.getElementById('no-questions-message');
const createQuestionBtn = document.getElementById('create-question-btn');

const apiUrl = 'https://quesansapi.deno.dev'; // *** REPLACE THIS WITH YOUR ACTUAL DEPLOYED API URL ***

// Function to fetch questions from the API
async function fetchQuestions() {
    if (!questionListContainer) return; // Ensure the element exists on the page

    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    noQuestionsMessage.style.display = 'none';fetch(`${apiUrl}/questions`)
    questionList.innerHTML = ''; // Clear previous list

    try {
        const response = await fetch(`${apiUrl}/questions`);
        if (!response.ok) {
            const errorData = await response.json();
            errorMessage.textContent = errorData?.userMessage || `HTTP error! status: ${response.status}`;
            errorMessage.style.display = 'block';
        } else {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(question => {
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = `/questions/${question.id}`; // We'll handle navigation later
                    link.textContent = question.questionText;
                    listItem.appendChild(link);
                    questionList.appendChild(listItem);
                });
            } else {
                noQuestionsMessage.style.display = 'block';
            }
        }
    } catch (error) {
        errorMessage.textContent = error.message || 'Failed to fetch questions.';
        errorMessage.style.display = 'block';
    } finally {
        loadingMessage.style.display = 'none';
    }
}

// Event listener for the "Create New Question" button (on homepage)
if (createQuestionBtn) {
    createQuestionBtn.addEventListener('click', () => {
        window.location.href = '/QuesAnsApp/questions/new.html';
    });
}

// --- Code for handling the Create New Question form ---
const createQuestionForm = document.getElementById('create-question-form');
const formErrorMessage = document.getElementById('form-error-message');
const formSuccessMessage = document.getElementById('form-success-message');

if (createQuestionForm) {
    createQuestionForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        formErrorMessage.style.display = 'none';
        formSuccessMessage.style.display = 'none';

        const questionText = document.getElementById('questionText').value.trim();
        const answersText = document.getElementById('answers').value.trim();
        const tagsInput = document.getElementById('tags').value.trim();
        const userId = document.getElementById('userId').value.trim();

        const answersArray = answersText.split('\n')
            .map(answer => answer.trim())
            .filter(answer => answer !== "")
            .map(answer => ({ answerText: answer }));

        const tagsArray = tagsInput.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== "");

        if (!questionText) {
            formErrorMessage.textContent = 'Question text is required.';
            formErrorMessage.style.display = 'block';
            return;
        }

        if (answersArray.length === 0) {
            formErrorMessage.textContent = 'At least one answer is required.';
            formErrorMessage.style.display = 'block';
            return;
        }

        const newQuestionData = {
            questionText: questionText,
            answers: answersArray,
            tags: tagsArray.length > 0 ? tagsArray : undefined,
            userId: userId || undefined,
        };

        try {
            const response = await fetch(`${apiUrl}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newQuestionData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                formErrorMessage.textContent = errorData?.userMessage || `HTTP error! status: ${response.status}`;
                formErrorMessage.style.display = 'block';
            } else {
                formSuccessMessage.style.display = 'block';
                createQuestionForm.reset(); // Clear the form
                setTimeout(() => {
                    window.location.href = '/QuesAnsApp/index.html'; // Redirect to homepage after a short delay
                }, 1500);
            }
        } catch (error) {
            formErrorMessage.textContent = error.message || 'Failed to create question.';
            formErrorMessage.style.display = 'block';
        }
    });
}

// Call fetchQuestions when the homepage loads
if (!window.location.pathname.includes('/questions/new.html')) {
    document.addEventListener('DOMContentLoaded', fetchQuestions);
}