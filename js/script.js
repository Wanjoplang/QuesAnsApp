// js/script.js

const questionListContainer = document.getElementById('question-list-container');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const questionList = document.getElementById('question-list');
const noQuestionsMessage = document.getElementById('no-questions-message');
const createQuestionBtn = document.getElementById('create-question-btn');

const apiUrl = 'https://quesansapi.deno.dev'; // *** REPLACE THIS WITH YOUR ACTUAL DEPLOYED API URL ***
const repositoryName = '/QuesAnsApp/'; // *** REPLACE THIS WITH YOUR REPOSITORY NAME (or '/' if deployed to root) ***

async function fetchQuestions(tag = null, userId = null, search = null) {
    if (!questionListContainer) return;

    loadingMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    noQuestionsMessage.style.display = 'none';
    if (questionList) {
        questionList.innerHTML = '';
    }

    try {
        const response = await fetch(`${apiUrl}/questions`);
        if (!response.ok) {
            const errorData = await response.json();
            errorMessage.textContent = errorData?.userMessage || `HTTP error! status: ${response.status}`;
            errorMessage.style.display = 'block';
        } else {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                displayQuestions(data);
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

function displayQuestions(questions) {
    if (!questionList) return;
    questionList.innerHTML = '';
    questions.forEach(question => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `${repositoryName}questions/question_detail.html?id=${question.id}`;
        link.textContent = question.questionText;
        listItem.appendChild(link);
        questionList.appendChild(listItem);
    });
}

if (createQuestionBtn) {
    createQuestionBtn.addEventListener('click', () => {
        window.location.href = `${repositoryName}questions/new.html`;
    });
}

const createQuestionForm = document.getElementById('create-question-form');
const formErrorMessage = document.getElementById('form-error-message');
const formSuccessMessage = document.getElementById('form-success-message');

if (createQuestionForm) {
    createQuestionForm.addEventListener('submit', async (event) => {
        event.preventDefault();

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
                createQuestionForm.reset();
                setTimeout(() => {
                    window.location.href = `${repositoryName}index.html`;
                }, 1500);
            }
        } catch (error) {
            formErrorMessage.textContent = error.message || 'Failed to create question.';
            formErrorMessage.style.display = 'block';
        }
    });
}

if (!window.location.pathname.includes('/questions/new.html')) {
    document.addEventListener('DOMContentLoaded', fetchQuestions);
}