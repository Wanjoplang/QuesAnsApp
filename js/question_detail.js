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

    const editQuestionBtn = document.getElementById('edit-question-btn');
    const deleteQuestionBtn = document.getElementById('delete-question-btn');
    const editQuestionForm = document.getElementById('edit-question-form');
    const editQuestionTextarea = document.getElementById('edit-question-text');
    const editTagsInput = document.getElementById('edit-tags');
    const saveQuestionBtn = document.getElementById('save-question-btn');
    const cancelEditQuestionBtn = document.getElementById('cancel-edit-question-btn');
    const editQuestionError = document.getElementById('edit-question-error');
    const editQuestionSuccess = document.getElementById('edit-question-success');

    const urlParams = new URLSearchParams(window.location.search);
    const questionId = urlParams.get('id');
    const apiUrl = 'https://quesansapi.deno.dev'; // Replace with your actual API URL
    const repositoryName = '/QuesAnsApp/'; // Replace with your repository name if needed

    let currentQuestionData = null; // Store the fetched question data

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
            currentQuestionData = question; // Store the data
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
            question.answers.forEach((answer, index) => {
                const answerItem = document.createElement('li');
                answerItem.textContent = answer.answerText;
                const answerMeta = document.createElement('p');
                answerMeta.classList.add('meta');
                answerMeta.textContent = `Answered At: ${new Date(answer.createdAt).toLocaleString()}`;
                answerItem.appendChild(answerMeta);

                // Add Edit and Delete buttons for each answer
                const answerActions = document.createElement('div');
                answerActions.classList.add('answer-actions');
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => handleEditAnswer(index, answer));
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => handleDeleteAnswer(index));
                answerActions.appendChild(editButton);
                answerActions.appendChild(deleteButton);
                answerItem.appendChild(answerActions);

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
                method: 'PUT', // Assuming you update the question with a new answer
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
            answerTextarea.value = '';
            answerSuccessMessage.textContent = 'Answer submitted successfully!';
            answerSuccessMessage.style.display = 'block';
            fetchQuestionDetails(questionId); // Re-fetch to display new answer
        } catch (error) {
            console.error('Error submitting answer:', error);
            answerErrorMessage.textContent = 'Error: Failed to connect to the API.';
            answerErrorMessage.style.display = 'block';
        }
    }

    // --- Edit Question Functionality ---
    if (editQuestionBtn) {
        editQuestionBtn.addEventListener('click', () => {
            if (currentQuestionData) {
                editQuestionTextarea.value = currentQuestionData.questionText;
                editTagsInput.value = currentQuestionData.tags ? currentQuestionData.tags.join(', ') : '';
                editQuestionForm.style.display = 'block';
                editQuestionBtn.style.display = 'none';
                deleteQuestionBtn.style.display = 'none';
            }
        });
    }

    if (cancelEditQuestionBtn) {
        cancelEditQuestionBtn.addEventListener('click', () => {
            editQuestionForm.style.display = 'none';
            editQuestionBtn.style.display = 'block';
            deleteQuestionBtn.style.display = 'block';
            editQuestionError.style.display = 'none';
            editQuestionSuccess.style.display = 'none';
        });
    }

    if (saveQuestionBtn) {
        saveQuestionBtn.addEventListener('click', async () => {
            const updatedQuestionText = editQuestionTextarea.value.trim();
            const updatedTags = editTagsInput.value.trim().split(',').map(tag => tag.trim()).filter(tag => tag !== "");

            if (!updatedQuestionText) {
                editQuestionError.textContent = 'Question text cannot be empty.';
                editQuestionError.style.display = 'block';
                return;
            }

            editQuestionError.style.display = 'none';
            editQuestionSuccess.style.display = 'none';

            try {
                const response = await fetch(`${apiUrl}/questions/${questionId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        questionText: updatedQuestionText,
                        tags: updatedTags.length > 0 ? updatedTags : [],
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error updating question:', errorData);
                    editQuestionError.textContent = errorData?.userMessage || 'Failed to update question.';
                    editQuestionError.style.display = 'block';
                } else {
                    const updatedData = await response.json();
                    editQuestionSuccess.textContent = 'Question updated successfully!';
                    editQuestionSuccess.style.display = 'block';
                    fetchQuestionDetails(questionId); // Re-fetch to update the displayed question
                    setTimeout(() => {
                        editQuestionForm.style.display = 'none';
                        editQuestionBtn.style.display = 'block';
                        deleteQuestionBtn.style.display = 'block';
                        editQuestionSuccess.style.display = 'none';
                    }, 1500);
                }
            } catch (error) {
                console.error('Error updating question:', error);
                editQuestionError.textContent = 'Failed to connect to the API to update question.';
                editQuestionError.style.display = 'block';
            }
        });
    }

    // --- Delete Question Functionality ---
    if (deleteQuestionBtn) {
        deleteQuestionBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this question?')) {
                try {
                    const response = await fetch(`${apiUrl}/questions/${questionId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error deleting question:', errorData);
                        alert(errorData?.userMessage || 'Failed to delete question.');
                    } else {
                        alert('Question deleted successfully!');
                        window.location.href = `${repositoryName}index.html`; // Redirect to homepage
                    }
                } catch (error) {
                    console.error('Error deleting question:', error);
                    alert('Failed to connect to the API to delete question.');
                }
            }
        });
    }

    // --- Edit Answer Functionality ---
    function handleEditAnswer(answerIndex, answerData) {
        const answerItem = answersListElement.children[answerIndex];
        if (!answerItem) return;

        const originalText = answerData.answerText;
        answerItem.innerHTML = `
            <textarea id="edit-answer-textarea-${answerIndex}" rows="3" cols="50">${originalText}</textarea>
            <div class="edit-actions">
                <button class="save-edit-answer-btn" data-index="${answerIndex}">Save</button>
                <button class="cancel-edit-answer-btn" data-index="${answerIndex}">Cancel</button>
                <div id="edit-answer-error-${answerIndex}" class="error-message" style="display:none;"></div>
            </div>
        `;

        const saveButton = answerItem.querySelector('.save-edit-answer-btn');
        const cancelButton = answerItem.querySelector('.cancel-edit-answer-btn');
        const errorDiv = answerItem.querySelector(`#edit-answer-error-${answerIndex}`);

        saveButton.addEventListener('click', () => saveEditedAnswer(answerIndex));
        cancelButton.addEventListener('click', () => fetchQuestionDetails(questionId)); // Re-fetch to reset display
    }

    async function saveEditedAnswer(answerIndex) {
        const answerItem = answersListElement.children[answerIndex];
        if (!answerItem) return;

        const editTextarea = answerItem.querySelector(`#edit-answer-textarea-${answerIndex}`);
        const updatedAnswerText = editTextarea.value.trim();
        const errorDiv = answerItem.querySelector(`#edit-answer-error-${answerIndex}`);

        if (!updatedAnswerText) {
            errorDiv.textContent = 'Answer text cannot be empty.';
            errorDiv.style.display = 'block';
            return;
        }

        errorDiv.style.display = 'none';

        try {
            const response = await fetch(`${apiUrl}/questions/${questionId}/answers/${answerIndex}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answerText: updatedAnswerText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error updating answer:', errorData);
                errorDiv.textContent = errorData?.userMessage || 'Failed to update answer.';
                errorDiv.style.display = 'block';
            } else {
                fetchQuestionDetails(questionId); // Re-fetch to update the displayed answer
            }
        } catch (error) {
            console.error('Error updating answer:', error);
            errorDiv.textContent = 'Failed to connect to the API to update answer.';
            errorDiv.style.display = 'block';
        }
    }

    // --- Delete Answer Functionality ---
    async function handleDeleteAnswer(answerIndex) {
        if (confirm('Are you sure you want to delete this answer?')) {
            try {
                const response = await fetch(`${apiUrl}/questions/${questionId}/answers/${answerIndex}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error deleting answer:', errorData);
                    alert(errorData?.userMessage || 'Failed to delete answer.');
                } else {
                    alert('Answer deleted successfully!');
                    fetchQuestionDetails(questionId); // Re-fetch to update the displayed answers
                }
            } catch (error) {
                console.error('Error deleting answer:', error);
                alert('Failed to connect to the API to delete answer.');
            }
        }
    }

    // Fetch question details when the page loads
    fetchQuestionDetails(questionId);
});