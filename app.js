// App State
let currentLevelIndex = 0;
let quizWords = [];
let quizCurrentIndex = 0;
let quizMode = 'typing'; // 'typing' or 'paper'
let isMistakeQuiz = false;
let userProgress = JSON.parse(localStorage.getItem('spellingProgress')) || {};

// Migration: Update boolean values to new object format { correct: X, incorrect: Y }
for (let key in userProgress) {
    if (typeof userProgress[key] === 'boolean') {
        userProgress[key] = { correct: userProgress[key] ? 1 : 0, incorrect: 0 };
    }
}

// Story Reading State
let storySpeedMode = 'normal'; // normal or slow
let storyPlayId = 0;

// Colors for segments
const segmentColors = ['#38bdf8', '#f43f5e', '#22c55e', '#facc15', '#a855f7'];

function init() {
    renderLevels();
    updateOverallProgress();
}

function saveProgress() {
    localStorage.setItem('spellingProgress', JSON.stringify(userProgress));
    updateOverallProgress();
}

// Navigation
function showScreen(screenId) {
    window.speechSynthesis.cancel();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function goHome() {
    renderLevels();
    updateOverallProgress();
    showScreen('home-screen');
}

// Progress & Levels
function renderLevels() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = '';
    levels.forEach((level, index) => {
        const masteredCount = getMasteredCountForLevel(index);
        const total = level.words.length;
        let displayTheme = level.theme.split(' ')[0];
        
        grid.innerHTML += `
            <div class="level-card" onclick="showLevel(${index})">
                <span class="theme-tag">${displayTheme}</span>
                <h3>Level ${level.level}</h3>
                <span class="mastery">${masteredCount} / ${total}</span>
            </div>
        `;
    });
}

function getMasteredCountForLevel(levelIdx) {
    return levels[levelIdx].words.filter(w => {
        let stats = userProgress[w.word.toLowerCase()];
        return stats && stats.correct > 0;
    }).length;
}

function updateOverallProgress() {
    let totalMastered = 0;
    levels.forEach(level => {
        level.words.forEach(w => {
            let stats = userProgress[w.word.toLowerCase()];
            if (stats && stats.correct > 0) totalMastered++;
        });
    });

    let totalWords = levels.reduce((acc, lvl) => acc + lvl.words.length, 0);
    let pct = totalWords === 0 ? 0 : (totalMastered / totalWords) * 100;
    
    document.getElementById('overall-progress').style.width = pct + '%';
    document.getElementById('progress-text').innerText = `已掌握 ${totalMastered} / ${totalWords} 單字`;
}

function showLevel(index) {
    currentLevelIndex = index;
    const level = levels[index];
    document.getElementById('level-title').innerText = `Level ${level.level} - ${level.theme.split(' ')[0]}`;
    
    renderStory(level);
    showScreen('level-screen');
}

// ================= STORY & AUDIO =================
function renderStory(level) {
    const rawStory = level.story;
    const sentences = rawStory.match(/[^.!?]+[.!?]+/g) || [rawStory];
    
    // 一次性比對所有單字，避免迴圈逐次替換時改到已被插入的 HTML 屬性（如 style="color..."）
    const wordList = level.words.map(w => w.word);
    const wordsRegex = new RegExp(`\\b(${wordList.join('|')})\\b`, 'gi');
    
    let html = '';
    sentences.forEach((s, i) => {
        // 利用正則群組 $1 保留原本單字的大小寫
        let sHtml = s.replace(wordsRegex, `<strong style="color: var(--primary);">$1</strong>`);
        
        let safeText = s.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        html += `<span class="story-sentence" id="sentence-${i}" onclick="playSentence(${i}, '${safeText}')">${sHtml}</span> `;
    });
    
    document.getElementById('story-box').innerHTML = `
        <div class="story-en">${html}</div>
        <div class="story-zh">${level.storyTranslation}</div>
    `;
}

function toggleStorySpeed() {
    storySpeedMode = storySpeedMode === 'normal' ? 'slow' : 'normal';
    document.getElementById('btn-story-speed').innerText = storySpeedMode === 'normal' ? '速度：正常' : '速度：緩慢';
    
    if (window.speechSynthesis.speaking) {
        playFullStory();
    }
}

function playFullStory() {
    window.speechSynthesis.cancel();
    storyPlayId++;
    const level = levels[currentLevelIndex];
    const sentences = level.story.match(/[^.!?]+[.!?]+/g) || [level.story];
    playSequence(sentences, 0, storyPlayId);
}

function playSequence(sentences, index, currentPlayId) {
    if (index >= sentences.length || currentPlayId !== storyPlayId) {
        document.querySelectorAll('.story-sentence').forEach(el => el.classList.remove('active'));
        return;
    }
    
    document.querySelectorAll('.story-sentence').forEach(el => el.classList.remove('active'));
    const el = document.getElementById(`sentence-${index}`);
    if (el) el.classList.add('active');
    
    let text = sentences[index];
    let u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = storySpeedMode === 'normal' ? 0.85 : 0.5;
    
    u.onend = () => { playSequence(sentences, index + 1, currentPlayId); };
    u.onerror = () => { document.querySelectorAll('.story-sentence').forEach(el => el.classList.remove('active')); };
    
    window.speechSynthesis.speak(u);
}

function playSentence(index, text) {
    window.speechSynthesis.cancel();
    storyPlayId++;
    
    document.querySelectorAll('.story-sentence').forEach(el => el.classList.remove('active'));
    const el = document.getElementById(`sentence-${index}`);
    if (el) el.classList.add('active');
    
    let u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = storySpeedMode === 'normal' ? 0.85 : 0.5;
    u.onend = () => { if (el) el.classList.remove('active'); };
    window.speechSynthesis.speak(u);
}

// ================= STUDY MODE =================
function generateStudyCardHTML(word) {
    const stats = userProgress[word.word.toLowerCase()] || { correct: 0, incorrect: 0 };
    let segHtml = word.segments.map((s, i) => {
        let color = segmentColors[i % segmentColors.length];
        return `<span style="color: ${color}">${s}</span>`;
    }).join(' - ');

    return `
    <div class="study-card">
        <div class="study-card-top">
            <div class="study-emoji">${word.emoji}</div>
            <div class="study-word-info">
                <div class="study-segments">${segHtml}</div>
                <div class="study-actual">${word.word}</div>
                <div class="word-stats">
                    <span class="stat-correct">✔️ 答對: ${stats.correct} 次</span>
                    <span class="stat-incorrect">❌ 答錯: ${stats.incorrect} 次</span>
                </div>
            </div>
            <button class="study-audio-btn" onclick="speakWord('${word.word}')">🔊</button>
        </div>
        <div class="study-bottom">
            <div class="study-meaning">${word.meaning}</div>
            <div class="study-mnemonic">💡 ${word.mnemonic}</div>
        </div>
    </div>
    `;
}

function startStudy() {
    const list = document.getElementById('study-list');
    document.getElementById('study-level-num').innerText = levels[currentLevelIndex].level;
    
    // Sort words by incorrect count (highest first)
    let sortedWords = [...levels[currentLevelIndex].words].sort((a, b) => {
        const statsA = userProgress[a.word.toLowerCase()] || { incorrect: 0 };
        const statsB = userProgress[b.word.toLowerCase()] || { incorrect: 0 };
        return statsB.incorrect - statsA.incorrect;
    });

    list.innerHTML = sortedWords.map(w => generateStudyCardHTML(w)).join('');
    showScreen('study-screen');
}

// ================= MISTAKE BANK =================
function openMistakeBank() {
    let allMistakes = [];
    levels.forEach(level => {
        level.words.forEach(w => {
            const stats = userProgress[w.word.toLowerCase()];
            if (stats && stats.incorrect > 0) {
                allMistakes.push(w);
            }
        });
    });
    
    allMistakes.sort((a, b) => {
        const statsA = userProgress[a.word.toLowerCase()];
        const statsB = userProgress[b.word.toLowerCase()];
        return statsB.incorrect - statsA.incorrect;
    });

    const list = document.getElementById('mistake-list');
    if (allMistakes.length === 0) {
        list.innerHTML = `<p style="text-align:center; color: white; font-size: 20px; margin-top: 50px;">太棒了！目前沒有錯題紀錄喔！🎉</p>`;
    } else {
        list.innerHTML = allMistakes.map(w => generateStudyCardHTML(w)).join('');
    }
    
    showScreen('mistake-screen');
}

function startMistakeQuiz(mode) {
    let allMistakes = [];
    levels.forEach(level => {
        level.words.forEach(w => {
            const stats = userProgress[w.word.toLowerCase()];
            if (stats && stats.incorrect > 0) {
                allMistakes.push(w);
            }
        });
    });
    
    if (allMistakes.length === 0) {
        alert('目前沒有錯題可以測驗喔！');
        return;
    }
    
    isMistakeQuiz = true;
    quizMode = mode;
    quizWords = allMistakes.sort(() => Math.random() - 0.5); // Shuffle
    quizCurrentIndex = 0;
    
    setupQuizUI();
}

// ================= QUIZ MODE =================
function startQuiz(mode) {
    isMistakeQuiz = false;
    quizMode = mode;
    quizWords = [...levels[currentLevelIndex].words].sort(() => Math.random() - 0.5);
    quizCurrentIndex = 0;
    setupQuizUI();
}

function setupQuizUI() {
    if (quizMode === 'typing') {
        document.getElementById('quiz-typing-area').style.display = 'flex';
        document.getElementById('quiz-paper-area').style.display = 'none';
    } else {
        document.getElementById('quiz-typing-area').style.display = 'none';
        document.getElementById('quiz-paper-area').style.display = 'block';
    }
    showScreen('quiz-screen');
    loadQuizWord();
}

function loadQuizWord() {
    document.getElementById('quiz-counter').innerText = `${quizCurrentIndex + 1} / ${quizWords.length}`;
    
    if (quizMode === 'typing') {
        const input = document.getElementById('quiz-input');
        input.value = '';
        input.focus();
    } else {
        document.getElementById('paper-answer-box').style.display = 'none';
    }
    
    setTimeout(() => { playQuizAudio(); }, 300);
}

function playQuizAudio() { speakWord(quizWords[quizCurrentIndex].word); }
function handleQuizKey(e) { if (e.key === 'Enter') checkQuizTyping(); }

function recordAnswer(wordText, isCorrect) {
    const w = wordText.toLowerCase();
    if (!userProgress[w]) userProgress[w] = { correct: 0, incorrect: 0 };
    if (isCorrect) {
        userProgress[w].correct++;
    } else {
        userProgress[w].incorrect++;
    }
    saveProgress();
}

function checkQuizTyping() {
    const input = document.getElementById('quiz-input');
    const userText = input.value.trim().toLowerCase();
    const correctWord = quizWords[quizCurrentIndex].word.toLowerCase();
    
    if (userText === '') return;

    if (userText === correctWord) {
        recordAnswer(correctWord, true);
        showFeedback(true, correctWord);
    } else {
        recordAnswer(correctWord, false);
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
        showFeedback(false, correctWord);
    }
}

// Paper Mode Logic
function showPaperAnswer() {
    const correctWordObj = quizWords[quizCurrentIndex];
    document.getElementById('paper-study-card-container').innerHTML = generateStudyCardHTML(correctWordObj);
    document.getElementById('paper-answer-box').style.display = 'block';
}

function submitPaperQuiz(isCorrect) {
    const correctWord = quizWords[quizCurrentIndex].word.toLowerCase();
    recordAnswer(correctWord, isCorrect);
    showFeedback(isCorrect, correctWord);
}

// Feedback System
function showFeedback(isCorrect, correctWord) {
    const overlay = document.getElementById('feedback-overlay');
    const card = document.getElementById('feedback-card');
    
    overlay.classList.add('active');
    card.className = `feedback-card ${isCorrect ? 'correct' : 'incorrect'}`;
    
    if (isCorrect) triggerConfetti();
    
    const pool = isCorrect ? feedbacks.correct : feedbacks.incorrect;
    const fb = pool[Math.floor(Math.random() * pool.length)];
    
    document.getElementById('feedback-icon').innerText = fb.img;
    document.getElementById('feedback-title').innerText = isCorrect ? '🎉 答對了！' : '❌ 再接再厲！';
    document.getElementById('feedback-title').style.color = isCorrect ? 'var(--success)' : 'var(--danger)';
    
    document.getElementById('feedback-text').innerText = fb.text;
    document.getElementById('feedback-char').innerText = `— ${fb.char} (${fb.anime})`;
    
    const hintBox = document.getElementById('correct-word-hint');
    if (!isCorrect) {
        hintBox.style.display = 'block';
        const correctWordObj = quizWords[quizCurrentIndex];
        // Render updated card with new incorrect stats
        document.getElementById('feedback-study-card-container').innerHTML = generateStudyCardHTML(correctWordObj);
    } else {
        hintBox.style.display = 'none';
    }
    
    speakAnimeQuote(fb.text);
    setTimeout(() => document.getElementById('feedback-next-btn').focus(), 100);
}

function nextQuiz() {
    document.getElementById('feedback-overlay').classList.remove('active');
    quizCurrentIndex++;
    
    if (quizCurrentIndex < quizWords.length) {
        loadQuizWord();
    } else {
        setTimeout(() => {
            alert(`恭喜！你完成了測驗！`);
            if (isMistakeQuiz) {
                openMistakeBank();
            } else {
                showLevel(currentLevelIndex);
            }
        }, 300);
    }
}

function abortQuiz() {
    if (isMistakeQuiz) openMistakeBank();
    else showLevel(currentLevelIndex);
}

// ================= UTILS =================
function speakWord(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = storySpeedMode === 'normal' ? 0.85 : 0.5;
    window.speechSynthesis.speak(u);
}

function speakAnimeQuote(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-TW';
    u.rate = 1.1;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
}

function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#38bdf8', '#facc15', '#22c55e', '#f43f5e'] });
    }
}

if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
}

init();
