document.addEventListener('DOMContentLoaded', () => {
    const questionList = document.getElementById('question-list');
    const loadMoreQuestionsBtn = document.getElementById('load-more-questions-btn');
    const questionDetailSection = document.getElementById('question-detail-section');
    const questionsSection = document.getElementById('questions-section');
    const questionDetailsContainer = document.getElementById('question-details');

    let currentPage = 1;
    const questionsPerPage = 10;
    let hasMoreQuestions = true;
    let currentQuestions = [];

    // Function to fetch questions from the API
    async function fetchQuestions(page) {
        try {
            const response = await fetch(`https://quesansapi.deno.dev/questions?page=${page}&limit=${questionsPerPage}`);
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

    // Function to display the list of questions in the DOM
    function displayQuestions(questions) {
        questionList.innerHTML = '';
        questions.forEach(question => {
            const questionItem = document.createElement('div');
            questionItem.classList.add('question-item');
            const titleElement = document.createElement('h4');
            titleElement.textContent = question.title;
            titleElement.style.cursor = 'pointer'; // Indicate it's clickable
            titleElement.addEventListener('click', () => showQuestionDetails(question.id));

            const tagsElement = document.createElement('p');
            tagsElement.classList.add('tags');
            tagsElement.textContent = question.tags ? `Tags: ${question.tags.join(', ')}` : 'No tags';

            questionItem.appendChild(titleElement);
            questionItem.appendChild(tagsElement);
            questionList.appendChild(questionItem);
        });
    }

    // Event listener for the "Load More" button
    loadMoreQuestionsBtn.addEventListener('click', () => {
        currentPage++;
        fetchQuestions(currentPage);
    });

    // Function to fetch and display details of a specific question
    async function fetchQuestionDetails(questionId) {
        try {
            const response = await fetch(`https://quesansapi.deno.dev/questions/${questionId}`);
            const data = await response.json();
            if (response.ok) {
                displayQuestionDetails(data);
                // Optionally, fetch and display answers here or in a separate function
                fetchAnswers(questionId);
            } else {
                console.error(`Failed to fetch question details for ID ${questionId}:`, data);
                questionDetailsContainer.innerHTML = '<p class="error">Failed to load question details.</p>';
            }
        } catch (error) {
            console.error(`Error fetching question details for ID ${questionId}:`, error);
            questionDetailsContainer.innerHTML = '<p class="error">An unexpected error occurred while loading question details.</p>';
        }
    }

    // Function to display the details of a question in the DOM
    function displayQuestionDetails(question) {
        questionDetailsContainer.innerHTML = `
            <h3>${question.title}</h3>
            ${question.body ? `<p>${question.body}</p>` : ''}
            <p class="created-at">Asked on: ${new Date(question.created_at).toLocaleDateString()} ${new Date(question.created_at).toLocaleTimeString()}</p>
            ${question.tags ? `<p class="tags">Tags: ${question.tags.join(', ')}</p>` : ''}
            <div id="answers-section">
                <h4>Answers</h4>
                <div id="answer-list">
                    </div>
            </div>
        `;
        // Show the question detail section and hide the questions list
        questionsSection.style.display = 'none';
        questionDetailSection.style.display = 'block';
        document.getElementById('answer-form').style.display = 'block'; // Show the answer form
    }

    // Function to navigate back to the list of questions
    function goBackToQuestions() {
        questionsSection.style.display = 'block';
        questionDetailSection.style.display = 'none';
        document.getElementById('answer-form').style.display = 'none'; // Hide the answer form
        document.getElementById('answer-list').innerHTML = ''; // Clear previous answers
    }

    // Make the question title clickable to show details
    function attachQuestionTitleListeners() {
        const questionTitles = document.querySelectorAll('#question-list h4');
        questionTitles.forEach(title => {
            title.addEventListener('click', () => {
                const questionId = title.parentElement ? title.parentElement.dataset.questionId : null;
                if (questionId) {
                    showQuestionDetails(questionId);
                }
            });
        });
    }

    // Function to show question details by ID
    function showQuestionDetails(questionId) {
        fetchQuestionDetails(questionId);
    }

    // Initial load of questions
    fetchQuestions(currentPage);

    // Add a "Back to Questions" button in the question detail section
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Questions';
    backButton.addEventListener('click', goBackToQuestions);
    questionDetailSection.prepend(backButton);
});

// Function to be called from auth.js after successful login
function loadQuestions() {
    currentPage = 1;
    currentQuestions = [];
    hasMoreQuestions = true;
    document.getElementById('question-list').innerHTML = ''; // Clear existing questions
    const questionsSection = document.getElementById('questions-section');
    if (questionsSection) {
        questionsSection.style.display = 'block';
    }
    fetchQuestions(currentPage);
}