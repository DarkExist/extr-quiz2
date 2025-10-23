document.addEventListener('DOMContentLoaded', function () {
    // Элементы DOM
    const mainMenu = document.getElementById('main-menu');
    const quizScreen = document.getElementById('quiz-screen');
    const editorScreen = document.getElementById('editor-screen');
    const resultsScreen = document.getElementById('results-screen'); // Новый экран результатов
    const startBtn = document.getElementById('start-btn');
    const editBtn = document.getElementById('edit-btn');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const questionText = document.getElementById('question-text');
    const questionMedia = document.getElementById('question-media');
    const answersContainer = document.getElementById('answers-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const currentQuestionSpan = document.getElementById('current-question');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const questionsContainer = document.getElementById('questions-container');
    const questionInput = document.getElementById('question-input');
    const mediaTypeSelect = document.getElementById('media-type');
    const mediaInputContainer = document.getElementById('media-input-container');
    const answersEditor = document.getElementById('answers-editor');
    const addAnswerBtn = document.getElementById('add-answer-btn');
    const saveQuestionBtn = document.getElementById('save-question-btn');
    const deleteQuestionBtn = document.getElementById('delete-question-btn');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const mediaModal = document.getElementById('media-modal');
    const modalImage = document.getElementById('modal-image');
    const modalVideo = document.getElementById('modal-video');
    const closeModal = document.querySelector('.close');

    // Переменные состояния
    let questions = [];
    let currentQuestionIndex = 0;
    let currentEditingQuestionIndex = -1;


    // Загрузка фонового изображения
    function loadBackgroundImage() {
        const backgroundImages = [
            'url("./images/background.jpg")'
        ];
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        document.body.style.backgroundImage = backgroundImages[randomIndex];
    }

    // Загрузка вопросов
    function loadQuestions() {
        const savedQuestions = localStorage.getItem('quizQuestions');
        // if (savedQuestions) {
        //     questions = JSON.parse(savedQuestions);
        //     updateTotalQuestions();
        //     return;
        // }
        
        // Загружаем вопросы из внешнего JSON файла
        fetch('questions.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Файл с вопросами не найден');
                }
                return response.json();
            })
            .then(data => {
                questions = data;
                saveQuestions();
                updateTotalQuestions();
            })
            .catch(error => {
                console.error('Ошибка загрузки вопросов:', error);
            });
    }

    function saveQuestions() {
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
    }

    function updateTotalQuestions() {
        totalQuestionsSpan.textContent = questions.length;
    }

    // Навигация
    startBtn.addEventListener('click', function () {
        if (questions.length === 0) {
            alert('Добавьте вопросы в редакторе перед началом квиза!');
            return;
        }
        questions.forEach(q => {
            delete q.userAnswerId; // или q.userAnswerId = null;
        });

        mainMenu.classList.remove('active');
        quizScreen.classList.add('active');
        currentQuestionIndex = 0;
        showQuestion(currentQuestionIndex);
    });

    editBtn.addEventListener('click', function () {
        mainMenu.classList.remove('active');
        editorScreen.classList.add('active');
        renderQuestionsList();
    });

    backToMenuBtn.addEventListener('click', function () {
        editorScreen.classList.remove('active');
        quizScreen.classList.remove('active');
        mainMenu.classList.add('active');
    });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // === ОТОБРАЖЕНИЕ ВОПРОСА ===
    function showQuestion(index) {
        nextBtn.classList.add("disabled")
        answersContainer.style.pointerEvents = "auto";

        if (index < 0 || index >= questions.length) return;

        const question = questions[index];
        questionText.textContent = question.question;
        currentQuestionSpan.textContent = index + 1;

        questionMedia.innerHTML = '';

        if (question.media.type !== 'none' && question.media.src.trim()) {
            const mediaContainer = document.createElement('div');
            mediaContainer.className = 'media-container';

            if (question.media.type === 'image') {
                const img = document.createElement('img');
                img.src = question.media.src.trim();
                img.alt = 'Иллюстрация к вопросу';
                img.addEventListener('click', () => showMediaModal('image', question.media.src.trim()));
                img.onerror = () => img.style.display = 'none';
                mediaContainer.appendChild(img);
            } else if (question.media.type === 'video') {
                const videoWrapper = document.createElement('div');
                videoWrapper.className = 'video-wrapper';
                const video = document.createElement('iframe');
                video.setAttribute('allowfullscreen', '');
                video.src = getEmbedUrl(question.media.src.trim());
                videoWrapper.appendChild(video);
                mediaContainer.appendChild(videoWrapper);
            }

            questionMedia.appendChild(mediaContainer);
        }

        answersContainer.innerHTML = '';

        const indices = Array.from({ length: question.answers.length }, (_, i) => i);

        // Перемешиваем индексы
        shuffleArray(indices);

        // Создаём элементы в новом порядке
        indices.forEach(i => {
            const answer = question.answers[i];
            const answerOption = document.createElement('div');
            answerOption.className = 'answer-option';
            answerOption.dataset.answerId = i; // ← всё ещё ссылается на правильный индекс в данных!

            if (question.userAnswerId === i) {
                answerOption.classList.add('selected');
                nextBtn.classList.remove("disabled");
            }

            answerOption.textContent = answer.text;
            answerOption.addEventListener('click', () => selectAnswer(i, index));
            answersContainer.appendChild(answerOption);
        });

        prevBtn.textContent = index === 0 ? "На главную" : "Назад";
        nextBtn.textContent = index === questions.length - 1 ? 'Завершить' : 'Далее';
    }

    function selectAnswer(answerId, questionIndex) {
        // Сохраняем выбор прямо в объект вопроса
        questions[questionIndex].userAnswerId = answerId;

        // Обновляем UI
        document.querySelectorAll('.answer-option').forEach(opt => {
            if (parseInt(opt.dataset.answerId) === answerId) {
                opt.classList.add('selected');
            } else {
                opt.classList.remove('selected');
            }
        });

        nextBtn.classList.remove("disabled");
    }

    // === ОБРАБОТКА КНОПКИ "ДАЛЕЕ" С АНИМАЦИЕЙ ===
    nextBtn.addEventListener('click', function () {
        if (!nextBtn.classList.contains("disabled")) {
            answersContainer.style.pointerEvents = "none";
        }
        
        const currentQuestion = questions[currentQuestionIndex];
        const userAnswerId = currentQuestion.userAnswerId;
        if (userAnswerId === undefined || userAnswerId === null) {
            alert('Пожалуйста, выберите ответ!');
            return;
        }

        const isCorrect = currentQuestion.answers[userAnswerId].correct;

        const selectedRow = document.querySelector('.answer-option.selected');
        nextBtn.disabled = true;
        nextBtn.style.transition = 'background-color 0.3s';
        nextBtn.style.backgroundColor = isCorrect ? '#4CAF50' : '#F44336';

        selectedRow.classList.remove("selected");
        selectedRow.classList.add(isCorrect ? "correct" : "incorrect");
        nextBtn.textContent = isCorrect ? 'Верно!' : 'Неверно!';

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
                nextBtn.disabled = false;
                nextBtn.style.backgroundColor = '';
                nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? 'Завершить' : 'Далее';
            } else {
                showResultsScreen();
            }
        }, 1000);
    });

    prevBtn.addEventListener('click', function () {
        if (currentQuestionIndex == 0) {
            location.reload();
        }
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    });

    // === ЭКРАН РЕЗУЛЬТАТОВ ===
    function showResultsScreen() {
        const resultsList = document.getElementById('results-list');
        let correctCount = 0;

        resultsList.innerHTML = '';

        questions.forEach((q, i) => {
            const userAnswerId = q.userAnswerId;
            const userAnswerText = userAnswerId !== undefined && userAnswerId !== null
                ? q.answers[userAnswerId].text
                : 'Не отвечено';

            const correctAnswerText = q.answers.find(a => a.correct).text;
            const isCorrect = userAnswerId !== undefined && userAnswerId !== null && q.answers[userAnswerId].correct;

            if (isCorrect) correctCount++;

            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <h3>Вопрос ${i + 1}: ${q.question}</h3>
                <p><strong>Ваш ответ:</strong> ${userAnswerText}</p>
                <p><strong>Правильный ответ:</strong> ${correctAnswerText}</p>
                <p class="${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? '✅ Верно' : '❌ Неверно'}
                </p>
                <hr>
            `;
            resultsList.appendChild(resultItem);
        });

        document.getElementById('correct-count').textContent = correctCount;
        document.getElementById('total-count').textContent = questions.length;

        quizScreen.classList.remove('active');
        document.getElementById('results-screen').classList.add('active');

        // Обработчик кнопки "На главную" — вынести ВНЕ цикла!
        const backToMainBtn = document.getElementById('back-to-main');
        backToMainBtn.onclick = () => {
            location.reload();
        };
    }

    // === РЕДАКТОР (остаётся без изменений, кроме мелких правок) ===
    function renderQuestionsList() {
        questionsContainer.innerHTML = '';
        questions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            if (index === currentEditingQuestionIndex) {
                questionItem.classList.add('active');
            }

            const questionPreview = document.createElement('div');
            questionPreview.className = 'question-preview';

            const questionNumber = document.createElement('div');
            questionNumber.className = 'question-number';
            questionNumber.textContent = index + 1;

            const questionTextPreview = document.createElement('div');
            questionTextPreview.className = 'question-text-preview';
            questionTextPreview.textContent = question.question;

            questionPreview.appendChild(questionNumber);
            questionPreview.appendChild(questionTextPreview);
            questionItem.appendChild(questionPreview);

            questionItem.addEventListener('click', function () {
                currentEditingQuestionIndex = index;
                renderQuestionsList();
                loadQuestionForEditing(index);
            });

            questionsContainer.appendChild(questionItem);
        });
    }

    function loadQuestionForEditing(index) {
        if (index < 0 || index >= questions.length) return;

        const question = questions[index];
        questionInput.value = question.question;

        mediaTypeSelect.value = question.media.type;
        updateMediaInput();

        if (question.media.type !== 'none') {
            const mediaSrcInput = document.getElementById('media-src');
            if (mediaSrcInput) mediaSrcInput.value = question.media.src;
        }

        answersEditor.innerHTML = '';
        question.answers.forEach((answer) => {
            addAnswerField(answer.text, answer.correct);
        });

        deleteQuestionBtn.style.display = 'block';
    }

    function updateMediaInput() {
        mediaInputContainer.innerHTML = '';
        const mediaType = mediaTypeSelect.value;

        if (mediaType !== 'none') {
            const mediaSrcInput = document.createElement('input');
            mediaSrcInput.type = 'text';
            mediaSrcInput.id = 'media-src';
            mediaSrcInput.placeholder = `Введите URL ${mediaType === 'image' ? 'изображения' : 'видео'}`;
            mediaInputContainer.appendChild(mediaSrcInput);
        }
    }

    mediaTypeSelect.addEventListener('change', updateMediaInput);

    function addAnswerField(text = '', correct = false) {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';

        const correctCheckbox = document.createElement('input');
        correctCheckbox.type = 'checkbox';
        correctCheckbox.className = 'correct-checkbox';
        correctCheckbox.checked = correct;

        const answerInput = document.createElement('input');
        answerInput.type = 'text';
        answerInput.placeholder = 'Текст ответа';
        answerInput.value = text;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-answer';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', function () {
            if (answersEditor.children.length > 2) {
                answerItem.remove();
            } else {
                alert('Должно быть как минимум 2 ответа!');
            }
        });

        answerItem.appendChild(correctCheckbox);
        answerItem.appendChild(answerInput);
        answerItem.appendChild(removeBtn);
        answersEditor.appendChild(answerItem);
    }

    addAnswerBtn.addEventListener('click', function () {
        if (answersEditor.children.length < 6) {
            addAnswerField();
        } else {
            alert('Максимум 6 ответов!');
        }
    });

    saveQuestionBtn.addEventListener('click', function () {
        const data = collectQuestionData();
        if (!data) return;

        if (currentEditingQuestionIndex === -1) {
            questions.push(data);
            currentEditingQuestionIndex = questions.length - 1;
        } else {
            questions[currentEditingQuestionIndex] = data;
        }

        saveQuestions();
        renderQuestionsList();
        updateTotalQuestions();
    });

    function getEmbedUrl(rawUrl) {
        if (rawUrl.includes("embed")) return rawUrl;
        if (rawUrl.includes("youtube.com")) return rawUrl.replace("watch?v=", "embed/");
        if (rawUrl.includes("rutube.ru")) return rawUrl.replace("video/", "play/embed/");
        return rawUrl;
    }

    function collectQuestionData() {
        const questionText = questionInput.value.trim();
        if (!questionText) {
            alert('Введите текст вопроса!');
            return null;
        }

        const mediaType = mediaTypeSelect.value;
        let mediaSrc = '';
        if (mediaType !== 'none') {
            const srcInput = document.getElementById('media-src');
            mediaSrc = srcInput ? srcInput.value.trim() : '';
            if (!mediaSrc) {
                alert(`Введите URL ${mediaType === 'image' ? 'изображения' : 'видео'}!`);
                return null;
            }
        }

        const answerItems = answersEditor.querySelectorAll('.answer-item');
        if (answerItems.length < 2) {
            alert('Должно быть как минимум 2 ответа!');
            return null;
        }

        const answers = [];
        let hasCorrect = false;
        answerItems.forEach(item => {
            const text = item.querySelector('input[type="text"]').value.trim();
            const correct = item.querySelector('.correct-checkbox').checked;
            if (text) {
                answers.push({ text, correct });
                if (correct) hasCorrect = true;
            }
        });

        if (answers.length < 2) {
            alert('Должно быть как минимум 2 ответа с текстом!');
            return null;
        }
        if (!hasCorrect) {
            alert('Должен быть хотя бы один правильный ответ!');
            return null;
        }

        return { question: questionText, media: { type: mediaType, src: mediaSrc }, answers };
    }

    deleteQuestionBtn.addEventListener('click', function () {
        if (currentEditingQuestionIndex !== -1 && confirm('Удалить этот вопрос?')) {
            questions.splice(currentEditingQuestionIndex, 1);
            saveQuestions();
            currentEditingQuestionIndex = -1;
            renderQuestionsList();
            clearQuestionEditor();
            updateTotalQuestions();
        }
    });

    addQuestionBtn.addEventListener('click', function () {
        currentEditingQuestionIndex = -1;
        clearQuestionEditor();
        deleteQuestionBtn.style.display = 'none';
    });

    function clearQuestionEditor() {
        questionInput.value = '';
        mediaTypeSelect.value = 'none';
        updateMediaInput();
        answersEditor.innerHTML = '';
        addAnswerField();
        addAnswerField();
    }

    // Модальное окно
    function showMediaModal(type, src) {
        modalImage.style.display = 'none';
        modalVideo.style.display = 'none';

        if (type === 'image') {
            modalImage.src = src;
            modalImage.style.display = 'block';
        } else if (type === 'video') {
            modalVideo.src = src;
            modalVideo.style.display = 'block';
        }

        mediaModal.style.display = 'block';
    }

    closeModal.addEventListener('click', function () {
        mediaModal.style.display = 'none';
        modalVideo.src = '';
    });

    window.addEventListener('click', function (event) {
        if (event.target === mediaModal) {
            mediaModal.style.display = 'none';
            modalVideo.src = '';
        }
    });

    // Инициализация
    loadBackgroundImage();
    loadQuestions();
    clearQuestionEditor();
});