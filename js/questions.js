// js/questions.js
(function() { // Immediately Invoked Function Expression (IIFE) to contain scope
    const questionList = document.getElementById('question-list');
    const questionsSection = document.getElementById('questions-section');
    const loadMoreQuestionsBtn = document.getElementById('load-more-questions-btn');
    const questionDetailSection = document.getElementById('question-detail-section');
    const answerForm = document.getElementById('answer-form');
    const answerListContainer = document.getElementById('answer-list');
    const questionDetailsContainer = document.querySelector('#question-detail-section .question-details-container'); // Declare here

    let currentPage = 1;
    const questionsPerPage = 10;
    let hasMoreQuestions = true;
    let currentQuestions = [];

    async function fetchQuestions(page) {
        if (!questionList || !loadMoreQuestionsBtn) return;
        try {
            const response = await fetch(`https://quesansapi.deno.dev/questions?page=${page}&limit=${questionsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                if (data.results && data.results.length > 0) {
                    currentQuestions = currentQuestions.concat(data.results);
                    displayQuestions(currentQuestions);
                    hasMoreQuestions = !!data.next;
                    loadMoreQuestionsBtn.style.display = hasMoreQuestions ? 'block' : 'none';
                } else if (page === 1) {
                    questionList.innerHTML = '<p>No questions available yet.</p>';
                    loadMoreQuestionsBtn.style.display = 'none';
                    hasMoreQuestions = false;
                } else {
                    hasMoreQuestions = false;
                    loadMoreQuestionsBtn.style.display = 'none';
                }
            } else if (response.status === 401) {
                console.error('Unauthorized to fetch questions.');
                questionList.innerHTML = '<p class="error">You are not authorized to view questions. Please log in.</p>';
                loadMoreQuestionsBtn.style.display = 'none';
                hasMoreQuestions = false;
                // Optionally redirect to login page if not logged in
            } else {
                console.error('Failed to fetch questions:', data);
                questionList.innerHTML = '<p class="error">Failed to load questions.</p>';
                loadMoreQuestionsBtn.style.display = 'none';
                hasMoreQuestions = false;
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            questionList.innerHTML = '<p class="error">An unexpected error occurred while loading questions.</p>';
            loadMoreQuestionsBtn.style.display = 'none';
            hasMoreQuestions = false;
        }
    }

    function displayQuestions(questions) {
        if (!questionList) return;
        questionList.innerHTML = '';
        questions.forEach(question => {
            const questionItem = document.createElement('div');
            questionItem.classList.add('question-item');
            questionItem.dataset.questionId = question.id; // Add data-question-id
            const titleElement = document.createElement('h4');
            titleElement.textContent = question.title;
            titleElement.style.cursor = 'pointer';
            const tagsElement = document.createElement('p');
            tagsElement.classList.add('tags');
            tagsElement.textContent = question.tags ? `Tags: ${question.tags.join(', ')}` : 'No tags';
            questionItem.appendChild(titleElement);
            questionItem.appendChild(tagsElement);
            questionList.appendChild(questionItem);
        });
    }

    function showQuestionDetails(questionId) {
        async function fetchQuestionDetails(questionId) {
            if (!questionDetailsContainer || !questionDetailSection) return;
            try {
                const response = await fetch(`https://quesansapi.deno.dev/questions/${questionId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    displayQuestionDetails(data);
                    window.fetchAnswers(questionId);
                } else if (response.status === 401) {
                    console.error('Unauthorized to fetch question details.');
                    questionDetailsContainer.innerHTML = '<p class="error">You are not authorized to view question details. Please log in.</p>';
                } else {
                    console.error(`Failed to fetch question details for ID ${questionId}:`, data);
                    questionDetailsContainer.innerHTML = '<p class="error">Failed to load question details.</p>';
                }
            } catch (error) {
                console.error(`Error fetching question details for ID ${questionId}:`, error);
                questionDetailsContainer.innerHTML = '<p class="error">An unexpected error occurred while loading question details.</p>';
            }
        }

        function displayQuestionDetails(question) {
            if (!questionDetailsContainer || !questionDetailSection) return;
            const questionTitleElement = questionDetailSection.querySelector('.question-title');
            const questionBodyElement = questionDetailSection.querySelector('.question-body');
            const createdAtElement = questionDetailSection.querySelector('.created-at');
            const tagsContainerElement = questionDetailSection.querySelector('.tags-container');

            questionTitleElement.textContent = question.title;
            questionBodyElement.textContent = question.body || '';
            createdAtElement.textContent = `${new Date(question.created_at).toLocaleDateString()} ${new Date(question.created_at).toLocaleTimeString()}`;

            if (tagsContainerElement) {
                tagsContainerElement.innerHTML = '';
                if (question.tags && question.tags.length > 0) {
                    question.tags.forEach(tag => {
                        const tagElement = document.createElement('span');
                        tagElement.classList.add('tag');
                        tagElement.textContent = tag;
                        tagsContainerElement.appendChild(tagElement);
                    });
                }
            }

            questionDetailSection.dataset.questionId = question.id;
            if (questionsSection) questionsSection.style.display = 'none';
            questionDetailSection.style.display = 'block';
            if (answerForm) answerForm.style.display = 'block';
        }
        fetchQuestionDetails(questionId);
    }

    function goBackToQuestions() {
        if (questionsSection) questionsSection.style.display = 'block';
        if (questionDetailSection) questionDetailSection.style.display = 'none';
        if (answerForm) answerForm.style.display = 'none';
        if (answerListContainer) answerListContainer.innerHTML = '';
        window.loadQuestions(); // Reload questions on going back
    }

    window.loadQuestions = function() {
        currentPage = 1;
        hasMoreQuestions = true;
        currentQuestions = [];
        fetchQuestions(currentPage);
        if (questionsSection) questionsSection.style.display = 'block';
    };

    document.addEventListener('DOMContentLoaded', () => {
        const backButton = document.getElementById('back-to-questions-btn');

        if (questionList) {
            questionList.addEventListener('click', (event) => {
                const titleElement = event.target.closest('h4');
                if (titleElement) {
                    const questionItem = titleElement.closest('.question-item');
                    if (questionItem && questionItem.dataset.questionId) {
                        showQuestionDetails(questionItem.dataset.questionId);
                    }
                }
            });
        }

        if (backButton) {
            backButton.addEventListener('click', goBackToQuestions);
        }

        if (localStorage.getItem('authToken')) {
            window.loadQuestions();
        }
    });
})();