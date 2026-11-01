// ============================================================================
// Spelling Bee 終極特訓 (app.js)
// Phase 1: 5段字級縮放 + 4人學習帳號隔離 (Rex / Test 1~3) + Firebase 雲端讀寫分離同步
// ============================================================================

const STORAGE_PREFIX = 'g6_spelling_';
const ACTIVE_USER_KEY = 'g6_spelling_active_user';
const LEGACY_MIGRATED_KEY = 'g6_spelling_legacy_migrated_v1';
const FONT_SCALE_KEY = 'g6_spelling_font_scale';
const ANIME_VOICE_KEY = 'g6_spelling_anime_voice';
const CLOUD_SYNC_URL_KEY = 'g6_spelling_firebase_db_url';
const DEFAULT_FIREBASE_DB_URL = 'https://math-review-6-default-rtdb.asia-southeast1.firebasedatabase.app';

const USERS = [
    { id: 'rex',   name: 'Rex',    role: '正式學員', icon: '🦖', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)', isTest: false },
    { id: 'test1', name: 'Test 1', role: '測試帳號', icon: '🧪', color: '#0d9488', bg: 'rgba(13, 148, 136, 0.2)', isTest: true },
    { id: 'test2', name: 'Test 2', role: '測試帳號', icon: '🔬', color: '#d97706', bg: 'rgba(217, 119, 6, 0.2)', isTest: true },
    { id: 'test3', name: 'Test 3', role: '測試帳號', icon: '🛠️', color: '#e11d48', bg: 'rgba(225, 29, 72, 0.2)', isTest: true }
];

const FONT_SCALES = {
    1: { scale: 1.00, maxW: '600px' },
    2: { scale: 1.12, maxW: '680px' },
    3: { scale: 1.25, maxW: '780px' },
    4: { scale: 1.40, maxW: '880px' },
    5: { scale: 1.55, maxW: '980px' }
};

// App State
let currentUser = localStorage.getItem(ACTIVE_USER_KEY) || 'rex';
let fontScaleLevel = parseInt(localStorage.getItem(FONT_SCALE_KEY) || '1', 10);
let animeVoiceEnabled = JSON.parse(localStorage.getItem(ANIME_VOICE_KEY) || 'false'); // 預設 false (不唸卡通台詞)
let cloudDbUrl = localStorage.getItem(CLOUD_SYNC_URL_KEY) || DEFAULT_FIREBASE_DB_URL;

let currentLevelIndex = 0;
let quizWords = [];
let quizCurrentIndex = 0;
let quizMode = 'paper'; // 'typing' or 'paper' (預設紙筆)
let isMistakeQuiz = false;
let isHeatmapQuiz = false;
let quizDrawerOpen = false;
let heatmapSortMode = 'id'; // 'id' (題號順序) | 'net' (錯-對排序) | 'err' (僅看答錯數)
let peekWordsEnabled = false;
let quizQuestionStartTime = Date.now();
let userProgress = {};

// Story Reading State
let storySpeedMode = 'normal'; // normal or slow
let storyPlayId = 0;

// Colors for segments
const segmentColors = ['#38bdf8', '#f43f5e', '#22c55e', '#facc15', '#a855f7'];

// ================= 1. 字體大小 5 段控制 =================
function setFontScale(level, showMsg = false) {
    const lv = FONT_SCALES[level] ? level : 1;
    fontScaleLevel = lv;
    localStorage.setItem(FONT_SCALE_KEY, String(lv));

    const cfg = FONT_SCALES[lv];
    document.documentElement.style.setProperty('--font-scale', String(cfg.scale));
    document.documentElement.style.setProperty('--container-max-w', cfg.maxW);

    document.querySelectorAll('.fs-btn').forEach(btn => {
        const bLv = parseInt(btn.getAttribute('data-fs-level'), 10);
        btn.classList.toggle('active', bLv === lv);
    });

    if (showMsg) {
        showToast(`🔠 字體大小已切換為：第 ${lv} 級 (${Math.round(cfg.scale * 100)}%)`);
    }
}

// ================= 2. 帳號隔離、舊資料遷移與 Firebase 雲端同步 =================
function getUserKey(key, uid = currentUser) {
    return `${STORAGE_PREFIX}u_${uid}_${key}`;
}

function getCurrentUserObj() {
    return USERS.find(u => u.id === currentUser) || USERS[0];
}

function getAllWordsFlat() {
    const list = [];
    levels.forEach((lvl, lIdx) => {
        lvl.words.forEach(w => {
            list.push({ ...w, levelIndex: lIdx, levelNum: lvl.level, theme: lvl.theme });
        });
    });
    return list;
}

function normalizeProgressMap(rawMap) {
    const clean = {};
    if (!rawMap || typeof rawMap !== 'object') return clean;
    for (let key in rawMap) {
        const k = key.toLowerCase();
        if (typeof rawMap[key] === 'boolean') {
            clean[k] = { correct: rawMap[key] ? 1 : 0, incorrect: 0 };
        } else if (rawMap[key] && typeof rawMap[key] === 'object') {
            clean[k] = {
                correct: Number(rawMap[key].correct) || 0,
                incorrect: Number(rawMap[key].incorrect) || 0
            };
        }
    }
    return clean;
}

function migrateLegacyDataToRex() {
    if (localStorage.getItem(LEGACY_MIGRATED_KEY)) return;
    try {
        const legacyRaw = localStorage.getItem('spellingProgress');
        if (legacyRaw && !localStorage.getItem(getUserKey('progress', 'rex'))) {
            const parsed = normalizeProgressMap(JSON.parse(legacyRaw));
            localStorage.setItem(getUserKey('progress', 'rex'), JSON.stringify(parsed));
        }
        localStorage.setItem(LEGACY_MIGRATED_KEY, '1');
    } catch (e) {
        console.warn('Legacy migration warning:', e);
    }
}

function loadUserProgress(uid = currentUser) {
    try {
        const raw = localStorage.getItem(getUserKey('progress', uid));
        return raw ? normalizeProgressMap(JSON.parse(raw)) : {};
    } catch (e) {
        return {};
    }
}

function saveUserProgress(prog = userProgress, uid = currentUser) {
    const normalized = normalizeProgressMap(prog);
    localStorage.setItem(getUserKey('progress', uid), JSON.stringify(normalized));
    if (uid === currentUser) {
        userProgress = normalized;
    }
}

function mergeProgressMaps(localMap = {}, remoteMap = {}) {
    const merged = { ...normalizeProgressMap(localMap) };
    const rem = normalizeProgressMap(remoteMap);
    for (const [wordKey, rStats] of Object.entries(rem)) {
        const lStats = merged[wordKey] || { correct: 0, incorrect: 0 };
        merged[wordKey] = {
            correct: Math.max(lStats.correct || 0, rStats.correct || 0),
            incorrect: Math.max(lStats.incorrect || 0, rStats.incorrect || 0)
        };
    }
    return merged;
}

function buildCloudPayload(uid = currentUser) {
    const prog = loadUserProgress(uid);
    const allWords = getAllWordsFlat();
    const correctCounts = {};
    const errorCounts = {};
    const errorBook = [];
    const masteredIds = [];

    allWords.forEach(w => {
        const st = prog[w.word.toLowerCase()] || { correct: 0, incorrect: 0 };
        if (st.correct > 0) {
            correctCounts[w.id] = st.correct;
            masteredIds.push(w.id);
        }
        if (st.incorrect > 0) {
            errorCounts[w.id] = st.incorrect;
            if (st.incorrect > st.correct) {
                errorBook.push(w.id);
            }
        }
    });

    return {
        updatedAt: new Date().toISOString(),
        progress: prog,
        correctCounts,
        errorCounts,
        errorBook,
        masteredIds
    };
}

function setCloudStatusUI(status, text) {
    const dot = document.getElementById('cloud-status-dot');
    const txt = document.getElementById('cloud-status-text');
    if (dot) {
        dot.className = 'cloud-dot ' + (status || '');
    }
    if (txt && text) {
        txt.innerText = text;
    }
}

let cloudTimer = null;
function scheduleCloudPush() {
    if (!cloudDbUrl) return;
    setCloudStatusUI('syncing', '同步中');
    if (cloudTimer) clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => pushToCloud(currentUser), 800);
}

async function pushToCloud(uid = currentUser) {
    if (!cloudDbUrl) return;
    const base = cloudDbUrl.replace(/\/+$/, '');
    const payload = buildCloudPayload(uid);
    try {
        setCloudStatusUI('syncing', '上傳中');
        const res = await fetch(`${base}/g6_spelling_users/${uid}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setCloudStatusUI('synced', '已同步');
    } catch (e) {
        setCloudStatusUI('error', '離線');
    }
}

async function syncFromCloud(uid = currentUser, notify = false) {
    if (!cloudDbUrl) {
        setCloudStatusUI('', '本機');
        return;
    }
    const base = cloudDbUrl.replace(/\/+$/, '');
    try {
        setCloudStatusUI('syncing', '同步中');
        const res = await fetch(`${base}/g6_spelling_users/${uid}.json`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        if (data && typeof data === 'object') {
            let remoteProg = data.progress || {};
            // 若遠端也有依題號存的 correctCounts / errorCounts，一併對齊合併
            if (data.correctCounts || data.errorCounts) {
                const allWords = getAllWordsFlat();
                allWords.forEach(w => {
                    const key = w.word.toLowerCase();
                    const c = Number((data.correctCounts || {})[w.id]) || 0;
                    const ic = Number((data.errorCounts || {})[w.id]) || 0;
                    if (c > 0 || ic > 0) {
                        const cur = remoteProg[key] || { correct: 0, incorrect: 0 };
                        remoteProg[key] = {
                            correct: Math.max(cur.correct || 0, c),
                            incorrect: Math.max(cur.incorrect || 0, ic)
                        };
                    }
                });
            }

            const merged = mergeProgressMaps(loadUserProgress(uid), remoteProg);
            saveUserProgress(merged, uid);

            // 將合併後最新狀態回推雲端確保雙向一致
            await pushToCloud(uid);
            refreshCurrentScreenUI();
            if (notify) showToast(`✅ 已從雲端同步【${getCurrentUserObj().name}】最新累積紀錄！`);
        } else {
            await pushToCloud(uid);
            if (notify) showToast(`☁️ 已將【${getCurrentUserObj().name}】本機進度備份至雲端！`);
        }
    } catch (e) {
        setCloudStatusUI('error', '離線');
        if (notify) showToast('⚠️ 雲端連線失敗，目前使用本機儲存');
    }
}

// 做法 B：自給自足 AI 診斷日誌 (寫入 /g6_spelling_logs/{uid}/{timestamp}_{wordId}.json)
async function pushSlimLogToCloud(wordObj, isCorrect, mode, userInput = '', durationSec = 1) {
    if (!wordObj) return;
    const wKey = wordObj.word.toLowerCase();
    const st = userProgress[wKey] || { correct: 0, incorrect: 0 };
    const nowStr = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });

    const entry = {
        t: nowStr,
        id: wordObj.id,
        word: wordObj.word,
        meaning: wordObj.meaning,
        mode: mode, // 'paper' | 'typing'
        ans: userInput || (isCorrect ? '紙筆答對' : '紙筆答錯'),
        res: isCorrect ? 'ok' : 'bad',
        okCnt: st.correct,
        errCnt: st.incorrect,
        sec: durationSec
    };

    // 1. 本地保存最近 200 筆日誌
    try {
        const raw = localStorage.getItem(getUserKey('recent_logs', currentUser)) || '[]';
        const arr = JSON.parse(raw);
        arr.unshift(entry);
        if (arr.length > 200) arr.length = 200;
        localStorage.setItem(getUserKey('recent_logs', currentUser), JSON.stringify(arr));
    } catch (e) {}

    // 2. 背景直推 Firebase /g6_spelling_logs/{uid}
    if (!cloudDbUrl) return;
    const base = cloudDbUrl.replace(/\/+$/, '');
    const logKey = `${Date.now()}_W${String(wordObj.id).padStart(3, '0')}`;
    try {
        await fetch(`${base}/g6_spelling_logs/${currentUser}/${logKey}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
    } catch (e) {}
}

function getUserStatsSummary(uid) {
    const prog = loadUserProgress(uid);
    const allWords = getAllWordsFlat();
    let mastered = 0;
    let errWords = 0;
    let totalAnswered = 0;

    allWords.forEach(w => {
        const st = prog[w.word.toLowerCase()];
        if (st) {
            if (st.correct > 0) mastered++;
            if (st.incorrect > 0) errWords++;
            totalAnswered += (st.correct || 0) + (st.incorrect || 0);
        }
    });

    const pct = allWords.length > 0 ? Math.round((mastered / allWords.length) * 100) : 0;
    return { mastered, total: allWords.length, pct, errWords, totalAnswered };
}

function switchUser(uid) {
    if (!USERS.some(u => u.id === uid)) return;
    currentUser = uid;
    localStorage.setItem(ACTIVE_USER_KEY, uid);
    userProgress = loadUserProgress(uid);

    updateTopbarUserUI();
    renderUserSwitcherBar();
    refreshCurrentScreenUI();
    syncFromCloud(uid, false);

    const u = getCurrentUserObj();
    showToast(`👤 已切換為：${u.icon} ${u.name} (${u.role})`);
}

function resetTestUser(uid) {
    const uObj = USERS.find(x => x.id === uid);
    if (!uObj || !uObj.isTest) {
        showToast('🔒 正式學員 Rex 資料受保護，禁止清空！');
        return;
    }

    localStorage.removeItem(getUserKey('progress', uid));
    localStorage.removeItem(getUserKey('recent_logs', uid));
    if (uid === currentUser) {
        userProgress = {};
    }

    if (cloudDbUrl) {
        const base = cloudDbUrl.replace(/\/+$/, '');
        fetch(`${base}/g6_spelling_users/${uid}.json`, { method: 'DELETE' }).catch(() => {});
        fetch(`${base}/g6_spelling_logs/${uid}.json`, { method: 'DELETE' }).catch(() => {});
    }

    updateTopbarUserUI();
    renderUserSwitcherBar();
    refreshCurrentScreenUI();
    showToast(`🧹 已徹底清空測試帳號【${uObj.name}】的所有紀錄！`);
}

function updateTopbarUserUI() {
    const cur = getCurrentUserObj();
    const btn = document.getElementById('btn-nav-user');
    const iconEl = document.getElementById('nav-user-icon');
    const nameEl = document.getElementById('nav-user-name');
    if (iconEl) iconEl.textContent = cur.icon;
    if (nameEl) nameEl.textContent = cur.name;
    if (btn) {
        btn.style.borderColor = cur.color;
        btn.style.background = cur.bg;
    }
}

function renderUserSwitcherBar() {
    const bar = document.getElementById('home-user-bar');
    if (!bar) return;
    const curUser = getCurrentUserObj();
    bar.style.setProperty('--active-user-color', curUser.color);

    const pillsHtml = USERS.map(u => {
        const active = u.id === currentUser;
        const st = getUserStatsSummary(u.id);
        return `
            <button type="button" class="user-pill-btn ${active ? 'active' : ''}" onclick="switchUser('${u.id}')" style="--u-color: ${u.color};">
                <span>${u.icon} ${u.name}</span>
                ${st.errWords > 0 ? `<b class="u-err-dot" title="曾答錯單字數：${st.errWords}">${st.errWords}</b>` : ''}
            </button>
        `;
    }).join('');

    bar.innerHTML = `
        <div class="user-bar-left">
            <span class="user-bar-label">👤 學習人員：</span>
            <div class="user-pills-row">${pillsHtml}</div>
        </div>
        <div class="user-bar-right">
            ${curUser.isTest ? `
                <span class="test-mode-tag">🧪 測試隔離中（不影響 Rex）</span>
                <button type="button" class="btn-sm-ghost btn-clear-cur-test" onclick="confirmResetTestUser('${curUser.id}')">🧹 清空 ${curUser.name}</button>
            ` : `
                <span class="rex-mode-tag">🦖 Rex 正式紀錄（保護中）</span>
            `}
            <button type="button" class="btn-sm-ghost" onclick="openUserModal()">⚙️ 帳號與雲端</button>
        </div>
    `;
}

function confirmResetTestUser(uid) {
    const uObj = USERS.find(x => x.id === uid);
    if (!uObj || !uObj.isTest) return;
    if (confirm(`確定要清空測試帳號【${uObj.name}】在本機與 Firebase 雲端的所有作答紀錄嗎？`)) {
        resetTestUser(uid);
    }
}

function openUserModal() {
    let modal = document.getElementById('user-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'user-modal';
        modal.className = 'user-modal-backdrop';
        document.body.appendChild(modal);
    }

    const renderContent = () => {
        const cardsHtml = USERS.map(u => {
            const isCur = u.id === currentUser;
            const st = getUserStatsSummary(u.id);
            return `
                <div class="user-profile-card ${isCur ? 'active' : ''}" style="--u-color: ${u.color}; --u-bg: ${u.bg};">
                    <div class="u-card-left" data-pick-user="${u.id}">
                        <span class="u-avatar">${u.icon}</span>
                        <div class="u-info">
                            <div class="u-name-row">
                                <b>${u.name}</b>
                                <span class="u-role-tag" style="background: ${u.bg}; color: #fff; border: 1px solid ${u.color};">${u.role}</span>
                                ${isCur ? `<span class="u-cur-badge">✔ 使用中</span>` : ''}
                            </div>
                            <div class="u-stats-row">
                                <span>已掌握 <b>${st.mastered}/${st.total}</b> (${st.pct}%)</span>
                                <span>·</span>
                                <span class="${st.errWords > 0 ? 'err-txt' : ''}">錯題字 <b>${st.errWords}</b></span>
                                <span>·</span>
                                <span>累計作答 <b>${st.totalAnswered}</b> 次</span>
                            </div>
                        </div>
                    </div>
                    <div class="u-card-actions">
                        ${!isCur ? `<button type="button" class="btn-sm-ghost" style="border-color:${u.color};" data-pick-user="${u.id}">切換</button>` : ''}
                        ${u.isTest ? `
                            <button type="button" class="btn-sm-ghost btn-clear-cur-test" data-reset-user="${u.id}">🧹 清空</button>
                        ` : `
                            <span class="u-protect-tag">🔒 保護中</span>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="user-modal-panel" role="dialog" aria-label="切換學習帳號與雲端設定">
                <div class="user-modal-head">
                    <div>
                        <h3>👥 切換使用人員與 Firebase 雲端同步</h3>
                        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                            測試帳號（Test 1 ~ 3）與正式學員 Rex 的對錯紀錄完全獨立隔離，測試完可隨時一鍵清空。
                        </p>
                    </div>
                    <button type="button" class="btn-close-modal" id="user-modal-close">✕</button>
                </div>

                <div class="user-cards-list">${cardsHtml}</div>

                <div class="cloud-sync-box">
                    <div class="cloud-sync-head">
                        <span>☁️ 跨裝置雲端同步（Firebase Realtime DB）</span>
                        <span class="cloud-badge ${cloudDbUrl ? 'on' : ''}">${cloudDbUrl ? '🟢 已掛載 /g6_spelling_users' : '⚪ 本機儲存'}</span>
                    </div>
                    <div class="cloud-input-row">
                        <input type="url" id="input-cloud-url" placeholder="https://math-review-6-default-rtdb.asia-southeast1.firebasedatabase.app" value="${cloudDbUrl || ''}">
                        <button type="button" class="btn-sm-ghost" style="background: var(--primary); color: #0f172a; border: none;" id="btn-save-cloud">儲存並同步</button>
                    </div>
                    <div class="cloud-sync-hint">
                        統計路徑：<code>/g6_spelling_users/${currentUser}.json</code><br>
                        日誌路徑：<code>/g6_spelling_logs/${currentUser}/</code>（每次答題自動寫入 Log）
                    </div>
                </div>
            </div>
        `;

        document.getElementById('user-modal-close').onclick = () => { modal.style.display = 'none'; };
        modal.querySelectorAll('[data-pick-user]').forEach(el => {
            el.onclick = () => {
                switchUser(el.getAttribute('data-pick-user'));
                modal.style.display = 'none';
            };
        });
        modal.querySelectorAll('[data-reset-user]').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const uid = btn.getAttribute('data-reset-user');
                const uObj = USERS.find(x => x.id === uid);
                if (uObj && confirm(`確定要清空測試帳號【${uObj.name}】的所有錯題與練習進度嗎？`)) {
                    resetTestUser(uid);
                    renderContent();
                }
            };
        });

        const saveBtn = document.getElementById('btn-save-cloud');
        if (saveBtn) {
            saveBtn.onclick = async () => {
                const val = (document.getElementById('input-cloud-url')?.value || '').trim();
                cloudDbUrl = val;
                localStorage.setItem(CLOUD_SYNC_URL_KEY, val);
                if (val) {
                    saveBtn.disabled = true;
                    saveBtn.textContent = '同步中...';
                    await syncFromCloud(currentUser, true);
                }
                renderContent();
            };
        }
    };

    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    renderContent();
    modal.style.display = 'flex';
}

let toastTimer = null;
function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function refreshCurrentScreenUI() {
    renderLevels();
    updateOverallProgress();
    renderUserSwitcherBar();
    renderHomeHeatmap();
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
        if (activeScreen.id === 'study-screen') startStudy();
        else if (activeScreen.id === 'mistake-screen') openMistakeBank();
    }
}

// ================= 3. 首頁 1~100 單字答題累積熱力表 =================
function getWordHeatClass(okCnt, errCnt) {
    if (okCnt === 0 && errCnt === 0) return 'heat-none';
    const netErr = errCnt - okCnt;
    if (netErr <= 0) return 'heat-ok';
    if (netErr === 1) return 'heat-warn-1';
    if (netErr === 2) return 'heat-warn-2';
    if (netErr === 3) return 'heat-warn-3';
    return 'heat-bad-heavy';
}

function sortWordList(rawList, sortMode = heatmapSortMode) {
    const list = [...rawList];
    if (sortMode === 'net') {
        // 依 (答錯 - 答對) 由大到小排，同分時答錯次數多者優先，再同分依題號
        list.sort((a, b) => {
            const stA = userProgress[a.word.toLowerCase()] || { correct: 0, incorrect: 0 };
            const stB = userProgress[b.word.toLowerCase()] || { correct: 0, incorrect: 0 };
            const netA = (stA.incorrect || 0) - (stA.correct || 0);
            const netB = (stB.incorrect || 0) - (stB.correct || 0);
            if (netB !== netA) return netB - netA;
            if ((stB.incorrect || 0) !== (stA.incorrect || 0)) return (stB.incorrect || 0) - (stA.incorrect || 0);
            return a.id - b.id;
        });
    } else if (sortMode === 'err') {
        // 僅看答錯數量由大到小排，同分時答對少者優先，再同分依題號
        list.sort((a, b) => {
            const stA = userProgress[a.word.toLowerCase()] || { correct: 0, incorrect: 0 };
            const stB = userProgress[b.word.toLowerCase()] || { correct: 0, incorrect: 0 };
            if ((stB.incorrect || 0) !== (stA.incorrect || 0)) return (stB.incorrect || 0) - (stA.incorrect || 0);
            if ((stA.correct || 0) !== (stB.correct || 0)) return (stA.correct || 0) - (stB.correct || 0);
            return a.id - b.id;
        });
    } else {
        // 預設依題號 1~100
        list.sort((a, b) => a.id - b.id);
    }
    return list;
}

function getSortedAllWords(sortMode = heatmapSortMode) {
    return sortWordList(getAllWordsFlat(), sortMode);
}

function setHeatmapSort(mode, fromQuizDrawer = false) {
    heatmapSortMode = mode;
    document.querySelectorAll('[data-hm-sort]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-hm-sort') === mode);
    });
    renderHomeHeatmap();

    if (fromQuizDrawer && quizWords.length > 0) {
        const curWordId = quizWords[quizCurrentIndex] ? quizWords[quizCurrentIndex].id : null;
        quizWords = sortWordList(quizWords, mode);
        if (curWordId !== null) {
            const newIdx = quizWords.findIndex(w => w.id === curWordId);
            if (newIdx !== -1) quizCurrentIndex = newIdx;
        }
        updateQuizNavStatus();
        renderQuizDrawerGrid();
        showToast(mode === 'net' ? '⚖️ 已依「錯−對」重新排序測驗清單' : mode === 'err' ? '🔥 已依「總答錯數」重新排序測驗清單' : '🔢 已依「題號順序」重新排序測驗清單');
    }
}

function togglePeekWords() {
    peekWordsEnabled = !peekWordsEnabled;
    ['home-heatmap-grid', 'quiz-drawer-grid'].forEach(id => {
        const grid = document.getElementById(id);
        if (grid) grid.classList.toggle('show-word-mode', peekWordsEnabled);
    });

    ['btn-home-peek-word', 'btn-quiz-peek-word'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.toggle('active', peekWordsEnabled);
            btn.innerText = peekWordsEnabled ? '🙈 隱藏單字' : '👀 偷看單字';
        }
    });
}

function renderHomeHeatmap() {
    const grid = document.getElementById('home-heatmap-grid');
    if (!grid) return;

    grid.classList.toggle('show-word-mode', peekWordsEnabled);
    const sortedWords = getSortedAllWords(heatmapSortMode);

    grid.innerHTML = sortedWords.map(w => {
        const st = userProgress[w.word.toLowerCase()] || { correct: 0, incorrect: 0 };
        const okCnt = st.correct || 0;
        const errCnt = st.incorrect || 0;
        const netErr = errCnt - okCnt;
        const heatCls = getWordHeatClass(okCnt, errCnt);

        return `
            <button type="button" class="drawer-q-btn ${heatCls}" onclick="startHeatmapWordQuiz(${w.id})" title="#${w.id} ${w.word} (${w.meaning})｜答對 ${okCnt} 次 · 答錯 ${errCnt} 次 (錯−對 = ${netErr})">
                ${okCnt > 0 ? `<span class="q-badge-ok">${okCnt}</span>` : ''}
                ${errCnt > 0 ? `<span class="q-badge-bad">${errCnt}</span>` : ''}
                <span class="q-num-center">${w.id}</span>
                <span class="q-word-peek">
                    <span class="peek-en">${w.word}</span>
                    <span class="peek-zh">${w.meaning}</span>
                </span>
            </button>
        `;
    }).join('');
}

function startHeatmapWordQuiz(wordId) {
    const sortedList = getSortedAllWords(heatmapSortMode);
    const targetIdx = sortedList.findIndex(w => w.id === wordId);
    if (targetIdx === -1) return;

    isHeatmapQuiz = true;
    isMistakeQuiz = false;
    quizMode = 'paper'; // 點題號預設進入「紙筆模式」
    quizWords = sortedList;
    quizCurrentIndex = targetIdx;
    setupQuizUI();
}

// ================= INITIALIZATION & NAVIGATION =================
function init() {
    migrateLegacyDataToRex();
    setFontScale(fontScaleLevel, false);
    userProgress = loadUserProgress(currentUser);
    updateTopbarUserUI();
    updateAnimeVoiceButtonsUI();
    renderUserSwitcherBar();
    renderHomeHeatmap();
    renderLevels();
    updateOverallProgress();
    syncFromCloud(currentUser, false);
}

function saveProgress() {
    saveUserProgress(userProgress, currentUser);
    updateOverallProgress();
    renderUserSwitcherBar();
    renderHomeHeatmap();
    renderQuizDrawerGrid();
    scheduleCloudPush();
}

function showScreen(screenId) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function goHome() {
    renderUserSwitcherBar();
    renderHomeHeatmap();
    renderLevels();
    updateOverallProgress();
    showScreen('home-screen');
}

// Progress & Levels
function renderLevels() {
    const grid = document.getElementById('level-grid');
    if (!grid) return;
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
    
    const bar = document.getElementById('overall-progress');
    const txt = document.getElementById('progress-text');
    if (bar) bar.style.width = pct + '%';
    if (txt) txt.innerText = `已掌握 ${totalMastered} / ${totalWords} 單字`;
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
    
    const wordList = level.words.map(w => w.word);
    const wordsRegex = new RegExp(`\\b(${wordList.join('|')})\\b`, 'gi');
    
    let html = '';
    sentences.forEach((s, i) => {
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
    
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
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
                <div class="study-actual">#${word.id} · ${word.word}</div>
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
        list.innerHTML = `<p style="text-align:center; color: white; font-size: calc(20px * var(--font-scale)); margin-top: 50px;">太棒了！目前沒有錯題紀錄喔！🎉</p>`;
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
    isHeatmapQuiz = false;
    quizMode = mode;
    quizWords = allMistakes.sort(() => Math.random() - 0.5);
    quizCurrentIndex = 0;
    
    setupQuizUI();
}

// ================= QUIZ MODE =================
function startQuiz(mode) {
    isMistakeQuiz = false;
    isHeatmapQuiz = false;
    quizMode = mode;
    quizWords = [...levels[currentLevelIndex].words].sort(() => Math.random() - 0.5);
    quizCurrentIndex = 0;
    setupQuizUI();
}

function setupQuizUI() {
    applyQuizModeUI();
    updateAnimeVoiceButtonsUI();
    toggleQuizDrawer(false);
    showScreen('quiz-screen');
    loadQuizWord();
}

function applyQuizModeUI() {
    const typingArea = document.getElementById('quiz-typing-area');
    const paperArea = document.getElementById('quiz-paper-area');
    const modeBtn = document.getElementById('btn-quiz-mode-toggle');

    if (quizMode === 'typing') {
        if (typingArea) typingArea.style.display = 'flex';
        if (paperArea) paperArea.style.display = 'none';
        if (modeBtn) modeBtn.innerText = '⌨️ 打字模式';
    } else {
        if (typingArea) typingArea.style.display = 'none';
        if (paperArea) paperArea.style.display = 'block';
        if (modeBtn) modeBtn.innerText = '📝 紙筆模式';
    }
}

function toggleQuizMode() {
    quizMode = quizMode === 'paper' ? 'typing' : 'paper';
    applyQuizModeUI();
    if (quizMode === 'typing') {
        const input = document.getElementById('quiz-input');
        if (input) {
            input.value = '';
            input.focus();
        }
    } else {
        const box = document.getElementById('paper-answer-box');
        if (box) box.style.display = 'none';
    }
    showToast(quizMode === 'paper' ? '📝 已切換為：紙筆測驗模式' : '⌨️ 已切換為：打字測驗模式');
}

function toggleAnimeVoice() {
    animeVoiceEnabled = !animeVoiceEnabled;
    localStorage.setItem(ANIME_VOICE_KEY, JSON.stringify(animeVoiceEnabled));
    if (!animeVoiceEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    updateAnimeVoiceButtonsUI();
    showToast(animeVoiceEnabled ? '🔊 已開啟動漫台詞朗讀' : '🔇 已關閉動漫台詞朗讀 (預設靜音)');
}

function updateAnimeVoiceButtonsUI() {
    ['btn-quiz-anime-voice', 'btn-feedback-anime-voice'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.classList.toggle('on', animeVoiceEnabled);
        btn.classList.toggle('off', !animeVoiceEnabled);
        btn.innerText = animeVoiceEnabled ? '🔊 朗讀台詞' : '🔇 台詞靜音';
    });
}

function toggleQuizDrawer(forceState) {
    quizDrawerOpen = typeof forceState === 'boolean' ? forceState : !quizDrawerOpen;
    const panel = document.getElementById('quiz-drawer-panel');
    const trigger = document.getElementById('btn-quiz-drawer-toggle');
    const caret = document.getElementById('quiz-drawer-caret');

    if (panel) panel.style.display = quizDrawerOpen ? 'block' : 'none';
    if (trigger) trigger.classList.toggle('open', quizDrawerOpen);
    if (caret) caret.innerText = quizDrawerOpen ? '▴' : '▾';

    if (quizDrawerOpen) {
        renderQuizDrawerGrid();
    }
}

function renderQuizDrawerGrid() {
    const grid = document.getElementById('quiz-drawer-grid');
    if (!grid || !quizWords.length) return;

    grid.classList.toggle('show-word-mode', peekWordsEnabled);
    grid.innerHTML = quizWords.map((w, i) => {
        const st = userProgress[w.word.toLowerCase()] || { correct: 0, incorrect: 0 };
        const okCnt = st.correct || 0;
        const errCnt = st.incorrect || 0;
        const netErr = errCnt - okCnt;
        const heatCls = getWordHeatClass(okCnt, errCnt);
        const curCls = i === quizCurrentIndex ? 'current' : '';

        return `
            <button type="button" class="drawer-q-btn ${heatCls} ${curCls}" onclick="jumpToQuizWord(${i})" title="#${w.id} ${w.word} (${w.meaning})｜答對 ${okCnt} 次 · 答錯 ${errCnt} 次 (錯−對 = ${netErr})">
                ${okCnt > 0 ? `<span class="q-badge-ok">${okCnt}</span>` : ''}
                ${errCnt > 0 ? `<span class="q-badge-bad">${errCnt}</span>` : ''}
                <span class="q-num-center">${w.id}</span>
                <span class="q-word-peek">
                    <span class="peek-en">${w.word}</span>
                    <span class="peek-zh">${w.meaning}</span>
                </span>
            </button>
        `;
    }).join('');
}

function updateQuizNavStatus() {
    const curWord = quizWords[quizCurrentIndex];
    const counterEl = document.getElementById('quiz-counter');
    if (counterEl) {
        counterEl.innerText = `${quizCurrentIndex + 1} / ${quizWords.length}`;
    }

    const wordTagEl = document.getElementById('quiz-word-id-badge');
    if (wordTagEl && curWord) {
        const st = userProgress[curWord.word.toLowerCase()] || { correct: 0, incorrect: 0 };
        wordTagEl.innerText = `單字題號 #${curWord.id}  (✔️${st.correct} · ❌${st.incorrect})`;
    }

    const prevBtn = document.getElementById('btn-quiz-prev');
    const nextBtn = document.getElementById('btn-quiz-next');
    if (prevBtn) prevBtn.disabled = quizCurrentIndex <= 0;
    if (nextBtn) nextBtn.disabled = quizCurrentIndex >= quizWords.length - 1;
}

function prevQuizWord() {
    if (quizCurrentIndex > 0) {
        quizCurrentIndex--;
        loadQuizWord();
    }
}

function nextQuizWord() {
    if (quizCurrentIndex < quizWords.length - 1) {
        quizCurrentIndex++;
        loadQuizWord();
    }
}

function jumpToQuizWord(idx) {
    if (idx < 0 || idx >= quizWords.length) return;
    quizCurrentIndex = idx;
    loadQuizWord();
}

function loadQuizWord() {
    quizQuestionStartTime = Date.now();
    updateQuizNavStatus();
    renderQuizDrawerGrid();
    
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

function recordAnswer(wordObj, isCorrect, userInput = '') {
    const w = wordObj.word.toLowerCase();
    if (!userProgress[w]) userProgress[w] = { correct: 0, incorrect: 0 };
    if (isCorrect) {
        userProgress[w].correct++;
    } else {
        userProgress[w].incorrect++;
    }
    const durationSec = Math.max(1, Math.round((Date.now() - quizQuestionStartTime) / 1000));
    saveProgress();
    updateQuizNavStatus();
    pushSlimLogToCloud(wordObj, isCorrect, quizMode, userInput, durationSec);
}

function checkQuizTyping() {
    const input = document.getElementById('quiz-input');
    const userText = input.value.trim().toLowerCase();
    const currentWordObj = quizWords[quizCurrentIndex];
    const correctWord = currentWordObj.word.toLowerCase();
    
    if (userText === '') return;

    if (userText === correctWord) {
        recordAnswer(currentWordObj, true, userText);
        showFeedback(true, correctWord);
    } else {
        recordAnswer(currentWordObj, false, userText);
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
    const currentWordObj = quizWords[quizCurrentIndex];
    const correctWord = currentWordObj.word.toLowerCase();
    recordAnswer(currentWordObj, isCorrect, isCorrect ? '紙筆寫對' : '紙筆寫錯');
    showFeedback(isCorrect, correctWord);
}

// ================= 4. 回饋系統與 Spelling Bee 逐字拼讀語音 (單字 ➔ a-p-p-l-e ➔ 單字) =================
let spellingPlayId = 0;
let spellingTimer = null;

function cancelAllSpeech() {
    spellingPlayId++;
    if (spellingTimer) {
        clearTimeout(spellingTimer);
        spellingTimer = null;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    clearSpellingHighlights();
}

function clearSpellingHighlights() {
    document.querySelectorAll('.spell-letter-box').forEach(el => {
        el.classList.remove('active-letter', 'active-word');
    });
}

function setAllLettersWordHighlight(on) {
    document.querySelectorAll('.spell-letter-box').forEach(el => {
        el.classList.remove('active-letter');
        el.classList.toggle('active-word', on);
    });
}

function setSingleLetterHighlight(index) {
    document.querySelectorAll('.spell-letter-box').forEach((el, idx) => {
        el.classList.remove('active-word');
        el.classList.toggle('active-letter', idx === index);
    });
}

function renderFeedbackLetterRow(wordText) {
    const row = document.getElementById('feedback-letters-row');
    if (!row) return;
    const chars = String(wordText || '').split('');
    row.innerHTML = chars.map((ch, idx) => {
        const dash = idx < chars.length - 1 ? `<span class="spell-dash">-</span>` : '';
        return `<span class="spell-letter-box" id="spell-letter-${idx}">${ch.toLowerCase()}</span>${dash}`;
    }).join('');
}

function getLetterUtteranceText(ch) {
    const lower = String(ch).toLowerCase();
    // 避免單字母 'a' 被英文語音引擎當作不定冠詞唸成 /ə/，使用 'A.' 強制唸字母名 /eɪ/
    if (lower === 'a') return 'A.';
    return lower;
}

function speakSpellingSequence(wordText, onComplete = null) {
    if (!window.speechSynthesis) {
        if (onComplete) onComplete();
        return;
    }
    cancelAllSpeech();
    const myId = ++spellingPlayId;
    const letters = String(wordText || '').split('');

    // 步驟 1：先完整唸出單字 (如 apple)
    setAllLettersWordHighlight(true);
    const uFirst = new SpeechSynthesisUtterance(wordText);
    uFirst.lang = 'en-US';
    uFirst.rate = 0.85;

    uFirst.onend = () => {
        if (myId !== spellingPlayId) return;
        clearSpellingHighlights();
        spellingTimer = setTimeout(() => {
            speakLetterStep(0);
        }, 260);
    };
    uFirst.onerror = () => {
        if (myId !== spellingPlayId) return;
        clearSpellingHighlights();
    };

    // 步驟 2：逐一唸出每個字母 (a - p - p - l - e)，畫面同步高亮該字母
    function speakLetterStep(idx) {
        if (myId !== spellingPlayId) return;
        if (idx >= letters.length) {
            // 步驟 3：停頓後再完整唸一次單字 (如 apple)
            clearSpellingHighlights();
            spellingTimer = setTimeout(() => {
                if (myId !== spellingPlayId) return;
                setAllLettersWordHighlight(true);
                const uLast = new SpeechSynthesisUtterance(wordText);
                uLast.lang = 'en-US';
                uLast.rate = 0.85;
                uLast.onend = () => {
                    if (myId !== spellingPlayId) return;
                    clearSpellingHighlights();
                    if (onComplete) {
                        spellingTimer = setTimeout(() => {
                            if (myId === spellingPlayId) onComplete();
                        }, 250);
                    }
                };
                uLast.onerror = () => {
                    clearSpellingHighlights();
                };
                window.speechSynthesis.speak(uLast);
            }, 280);
            return;
        }

        setSingleLetterHighlight(idx);
        const uChar = new SpeechSynthesisUtterance(getLetterUtteranceText(letters[idx]));
        uChar.lang = 'en-US';
        uChar.rate = 0.9;
        uChar.onend = () => {
            if (myId !== spellingPlayId) return;
            spellingTimer = setTimeout(() => {
                speakLetterStep(idx + 1);
            }, 130);
        };
        uChar.onerror = () => {
            if (myId !== spellingPlayId) return;
            speakLetterStep(idx + 1);
        };
        window.speechSynthesis.speak(uChar);
    }

    window.speechSynthesis.speak(uFirst);
}

function replayCurrentSpelling() {
    const curWordObj = quizWords[quizCurrentIndex];
    if (!curWordObj) return;
    speakSpellingSequence(curWordObj.word, null);
}

// Feedback System (無論答對或答錯皆顯示單字卡，按下一題才前進)
function showFeedback(isCorrect, correctWord) {
    const overlay = document.getElementById('feedback-overlay');
    const card = document.getElementById('feedback-card');
    const correctWordObj = quizWords[quizCurrentIndex];
    
    overlay.classList.add('active');
    card.className = `feedback-card ${isCorrect ? 'correct' : 'incorrect'}`;
    
    if (isCorrect) triggerConfetti();
    
    const pool = isCorrect ? feedbacks.correct : feedbacks.incorrect;
    const fb = pool[Math.floor(Math.random() * pool.length)];
    
    document.getElementById('feedback-icon').innerText = fb.img;
    document.getElementById('feedback-title').innerText = isCorrect ? '🎉 答對了！' : '❌ 答錯了，跟著唸一次！';
    document.getElementById('feedback-title').style.color = isCorrect ? 'var(--success)' : 'var(--danger)';
    
    document.getElementById('feedback-text').innerText = fb.text;
    document.getElementById('feedback-char').innerText = `— ${fb.char} (${fb.anime})`;
    updateAnimeVoiceButtonsUI();

    // 渲染逐字母拼讀列與完整單字記憶卡（答對與答錯一律顯示）
    if (correctWordObj) {
        renderFeedbackLetterRow(correctWordObj.word);
        const hintBox = document.getElementById('correct-word-hint');
        if (hintBox) hintBox.style.display = 'block';
        document.getElementById('feedback-study-card-container').innerHTML = generateStudyCardHTML(correctWordObj);
    }

    // 語音邏輯：
    // 1. 答錯時：必定執行「完整單字 ➔ a-p-p-l-e 逐字母拼讀 ➔ 完整單字」，若開啟台詞朗讀則於拼讀後唸台詞
    // 2. 答對時：若關閉台詞朗讀，自動唸一次英文單字加深印象；若開啟台詞朗讀，先唸英文單字再唸動漫台詞
    if (!isCorrect && correctWordObj) {
        speakSpellingSequence(correctWordObj.word, () => {
            if (animeVoiceEnabled) {
                speakAnimeQuote(fb.text);
            }
        });
    } else if (correctWordObj) {
        cancelAllSpeech();
        const myId = ++spellingPlayId;
        setAllLettersWordHighlight(true);
        const uWord = new SpeechSynthesisUtterance(correctWordObj.word);
        uWord.lang = 'en-US';
        uWord.rate = 0.85;
        uWord.onend = () => {
            if (myId !== spellingPlayId) return;
            clearSpellingHighlights();
            if (animeVoiceEnabled) {
                spellingTimer = setTimeout(() => {
                    if (myId === spellingPlayId && animeVoiceEnabled) speakAnimeQuote(fb.text);
                }, 220);
            }
        };
        uWord.onerror = () => clearSpellingHighlights();
        if (window.speechSynthesis) window.speechSynthesis.speak(uWord);
    }

    setTimeout(() => document.getElementById('feedback-next-btn').focus(), 100);
}

function nextQuiz() {
    cancelAllSpeech();
    document.getElementById('feedback-overlay').classList.remove('active');
    quizCurrentIndex++;
    
    if (quizCurrentIndex < quizWords.length) {
        loadQuizWord();
    } else {
        setTimeout(() => {
            alert(`恭喜！你完成了測驗！`);
            if (isMistakeQuiz) {
                openMistakeBank();
            } else if (isHeatmapQuiz) {
                goHome();
            } else {
                showLevel(currentLevelIndex);
            }
        }, 300);
    }
}

function abortQuiz() {
    cancelAllSpeech();
    if (isMistakeQuiz) openMistakeBank();
    else if (isHeatmapQuiz) goHome();
    else showLevel(currentLevelIndex);
}

// ================= UTILS =================
function speakWord(text) {
    if (!window.speechSynthesis) return;
    cancelAllSpeech();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = storySpeedMode === 'normal' ? 0.85 : 0.5;
    window.speechSynthesis.speak(u);
}

function speakAnimeQuote(text) {
    if (!window.speechSynthesis || !animeVoiceEnabled) return;
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
