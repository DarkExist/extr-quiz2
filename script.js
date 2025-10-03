// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const mainMenu = document.getElementById('main-menu');
    const quizScreen = document.getElementById('quiz-screen');
    const editorScreen = document.getElementById('editor-screen');
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
    let selectedAnswers = [];
    let currentEditingQuestionIndex = -1;

    // Загрузка фонового изображения
    function loadBackgroundImage() {
        // В реальном приложении здесь будет логика выбора случайного изображения из папки background
        const backgroundImages = [
            'url("https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
            'url("https://images.unsplash.com/photo-1505506874110-6a7a69069a08?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
            'url("https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")'
        ];
        
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        document.body.style.backgroundImage = backgroundImages[randomIndex];
    }

    // Загрузка вопросов из localStorage или использование демо-данных
    function loadQuestions() {
        const savedQuestions = localStorage.getItem('quizQuestions');
        if (savedQuestions) {
            questions = JSON.parse(savedQuestions);
        } else {
            // Демо-вопросы
            questions = [
                {
                    question: "Какой язык программирования используется для создания веб-страниц?",
                    media: { type: "none", src: "" },
                    answers: [
                        { text: "JavaScript", correct: true },
                        { text: "Python", correct: false },
                        { text: "Java", correct: false },
                        { text: "C++", correct: false }
                    ]
                },
                {
                    question: "Какое животное является символом России?",
                    media: { type: "image", src: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80" },
                    answers: [
                        { text: "Медведь", correct: true },
                        { text: "Волк", correct: false },
                        { text: "Орел", correct: false },
                        { text: "Тигр", correct: false }
                    ]
                },
                {
                    question: "Сколько планет в Солнечной системе?",
                    media: { type: "none", src: "" },
                    answers: [
                        { text: "8", correct: true },
                        { text: "9", correct: false },
                        { text: "7", correct: false },
                        { text: "10", correct: false }
                    ]
                }
            ];
            saveQuestions();
        }
        updateTotalQuestions();
    }

    // Сохранение вопросов в localStorage
    function saveQuestions() {
        localStorage.setItem('quizQuestions', JSON.stringify(questions));
    }

    // Обновление счетчика вопросов
    function updateTotalQuestions() {
        totalQuestionsSpan.textContent = questions.length;
    }

    // Навигация по экранам
    startBtn.addEventListener('click', function() {
        if (questions.length === 0) {
            alert('Добавьте вопросы в редакторе перед началом квиза!');
            return;
        }
        
        mainMenu.classList.remove('active');
        quizScreen.classList.add('active');
        currentQuestionIndex = 0;
        selectedAnswers = new Array(questions.length).fill(null);
        showQuestion(currentQuestionIndex);
    });

    editBtn.addEventListener('click', function() {
        mainMenu.classList.remove('active');
        editorScreen.classList.add('active');
        renderQuestionsList();
    });

    backToMenuBtn.addEventListener('click', function() {
        editorScreen.classList.remove('active');
        quizScreen.classList.remove('active');
        mainMenu.classList.add('active');
    });

    // Функционал квиза
    function showQuestion(index) {
        if (index < 0 || index >= questions.length) return;
        
        const question = questions[index];
        questionText.textContent = question.question;
        currentQuestionSpan.textContent = index + 1;
        
        // Очистка медиа-контейнера
        questionMedia.innerHTML = '';
        
        // Добавление медиа, если есть
        if (question.media.type !== 'none' && question.media.src) {
            const mediaContainer = document.createElement('div');
            mediaContainer.className = 'media-container';
            
            if (question.media.type === 'image') {
                const img = document.createElement('img');
                img.src = question.media.src;
                img.alt = 'Иллюстрация к вопросу';
                
                img.onload = function() {
                    console.log("Изображение загружено, добавляем обработчик клика");
                    img.addEventListener('click', function() {
                        console.log("Клик по изображению!");
                        showMediaModal('image', question.media.src);
                    });
                };
                
                // Также добавляем обработчик на случай, если изображение уже загружено
                img.addEventListener('click', function() {
                    console.log("Клик по изображению (второй обработчик)!");
                    showMediaModal('image', question.media.src);
                });
                
                // Обработчик ошибки загрузки
                img.onerror = function() {
                    console.error("Ошибка загрузки изображения:", question.media.src);
                    img.style.display = 'none';
                };
                
                mediaContainer.appendChild(img);
            } else if (question.media.type === 'video') {
                const videoWrapper = document.createElement('div');
                videoWrapper.className = 'video-wrapper';
                
                const video = document.createElement('iframe');
                video.setAttribute('allowfullscreen', '');
                video.src = getEmbedUrl(question.media.src);
                video.poster = '';
                
                videoWrapper.appendChild(video);
                mediaContainer.appendChild(videoWrapper);
            }
            
        questionMedia.appendChild(mediaContainer);
        }
        
        // Очистка и добавление вариантов ответов
        answersContainer.innerHTML = '';
        question.answers.forEach((answer, i) => {
            const answerOption = document.createElement('div');
            answerOption.className = 'answer-option';
            if (selectedAnswers[index] === i) {
                answerOption.classList.add('selected');
            }
            answerOption.textContent = answer.text;
            answerOption.addEventListener('click', function() {
                selectAnswer(i);
            });
            answersContainer.appendChild(answerOption);
        });
        
        // Обновление состояния кнопок навигации
        prevBtn.disabled = index === 0;
        nextBtn.textContent = index === questions.length - 1 ? 'Завершить' : 'Далее';
    }

    function selectAnswer(answerIndex) {
        selectedAnswers[currentQuestionIndex] = answerIndex;
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach((option, i) => {
            if (i === answerIndex) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    prevBtn.addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    });

    nextBtn.addEventListener('click', function() {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        } else {
            // Завершение квиза
            showResults();
        }
    });

    function showResults() {
        let correctAnswers = 0;
        questions.forEach((question, i) => {
            if (selectedAnswers[i] !== null && question.answers[selectedAnswers[i]].correct) {
                correctAnswers++;
            }
        });
        
        const resultMessage = `Вы ответили правильно на ${correctAnswers} из ${questions.length} вопросов!`;
        alert(resultMessage);
        
        // Возврат в главное меню
        quizScreen.classList.remove('active');
        mainMenu.classList.add('active');
    }

    // Функционал редактора
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
            
            questionItem.addEventListener('click', function() {
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
        
        // Установка типа медиа
        mediaTypeSelect.value = question.media.type;
        updateMediaInput();
        
        // Установка источника медиа, если есть
        if (question.media.type !== 'none') {
            document.getElementById('media-src').value = question.media.src;
        }
        
        // Очистка и добавление ответов
        answersEditor.innerHTML = '';
        question.answers.forEach((answer, i) => {
            addAnswerField(answer.text, answer.correct);
        });
        
        // Показать кнопку удаления
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
        
        const answerInput = document.createElement('input');
        answerInput.type = 'text';
        answerInput.placeholder = 'Текст ответа';
        answerInput.value = text;
        
        const correctCheckbox = document.createElement('input');
        correctCheckbox.type = 'checkbox';
        correctCheckbox.className = 'correct-checkbox';
        correctCheckbox.checked = correct;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-answer';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', function() {
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

    addAnswerBtn.addEventListener('click', function() {
        if (answersEditor.children.length < 6) {
            addAnswerField();
        } else {
            alert('Максимум 6 ответов!');
        }
    });

    saveQuestionBtn.addEventListener('click', function() {
        if (currentEditingQuestionIndex === -1) {
            // Добавление нового вопроса
            const newQuestion = collectQuestionData();
            if (newQuestion) {
                questions.push(newQuestion);
                currentEditingQuestionIndex = questions.length - 1;
                saveQuestions();
                renderQuestionsList();
                loadQuestionForEditing(currentEditingQuestionIndex);
                updateTotalQuestions();
            }
        } else {
            // Редактирование существующего вопроса
            const updatedQuestion = collectQuestionData();
            if (updatedQuestion) {
                questions[currentEditingQuestionIndex] = updatedQuestion;
                saveQuestions();
                renderQuestionsList();
                updateTotalQuestions();
            }
        }
    });

    function getEmbedUrl(rawUrl) {
        if (rawUrl.includes("embed")) {
            return rawUrl;
        }
        // Temporary only for youtube and rutube
        if (rawUrl.includes("youtube.com")) {
            return rawUrl.replace("watch?v=", "embed/")
        }
        else if (rawUrl.includes("rutube.ru")) {
            return rawUrl.replace("video/", "play/embed/")
        }
        
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
            mediaSrc = document.getElementById('media-src').value.trim();
            if (!mediaSrc) {
                alert(`Введите URL ${mediaType === 'image' ? 'изображения' : 'видео'}!`);
                return null;
            }
        }
        
        const answers = [];
        const answerItems = answersEditor.querySelectorAll('.answer-item');
        if (answerItems.length < 2) {
            alert('Должно быть как минимум 2 ответа!');
            return null;
        }
        
        let hasCorrectAnswer = false;
        answerItems.forEach(item => {
            const answerText = item.querySelector('input[type="text"]').value.trim();
            const isCorrect = item.querySelector('.correct-checkbox').checked;
            
            if (answerText) {
                answers.push({ text: answerText, correct: isCorrect });
                if (isCorrect) hasCorrectAnswer = true;
            }
        });
        
        if (answers.length < 2) {
            alert('Должно быть как минимум 2 ответа с текстом!');
            return null;
        }
        
        if (!hasCorrectAnswer) {
            alert('Должен быть хотя бы один правильный ответ!');
            return null;
        }
        
        return {
            question: questionText,
            media: { type: mediaType, src: mediaSrc },
            answers: answers
        };
    }

    deleteQuestionBtn.addEventListener('click', function() {
        if (currentEditingQuestionIndex !== -1 && confirm('Удалить этот вопрос?')) {
            questions.splice(currentEditingQuestionIndex, 1);
            saveQuestions();
            currentEditingQuestionIndex = -1;
            renderQuestionsList();
            clearQuestionEditor();
            updateTotalQuestions();
        }
    });

    addQuestionBtn.addEventListener('click', function() {
        currentEditingQuestionIndex = -1;
        clearQuestionEditor();
        deleteQuestionBtn.style.display = 'none';
    });

    function clearQuestionEditor() {
        questionInput.value = '';
        mediaTypeSelect.value = 'none';
        updateMediaInput();
        answersEditor.innerHTML = '';
        // Добавить 2 пустых ответа по умолчанию
        addAnswerField();
        addAnswerField();
    }

    // Модальное окно для медиа
    function showMediaModal(type, src) {
        // Сначала скрываем оба медиа элемента
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

    closeModal.addEventListener('click', function() {
        mediaModal.style.display = 'none';
        modalVideo.pause();
    });

    window.addEventListener('click', function(event) {
        if (event.target === mediaModal) {
            mediaModal.style.display = 'none';
            modalVideo.pause();
        }
    });

    // Инициализация приложения
    loadBackgroundImage();
    loadQuestions();
    clearQuestionEditor();
});