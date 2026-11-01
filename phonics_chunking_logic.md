# 英文單字拼讀分塊邏輯規範（Phonics Chunking Logic Spec）

> 版本：v1.0  
> 日期：2026-10-31  
> 用途：供 AI 依據此規範，對英文單字進行教學用拼讀分塊，適用對象為台灣國小一～六年級學生。

---

## 一、核心原則

本規範的目標是讓孩子**用最少的記憶負擔，記住最多的單字**。
分塊的切法必須滿足以下三個條件：

1. **聲音可還原**：孩子把每個 chunk 的聲音拼起來，一定能還原正確發音。
2. **模組可複用**：chunk 盡量選用在其他單字也出現的「高頻聲音單位」，讓記憶產生網絡效應。
3. **意義可依附**：多音節字或合成字優先沿著「有意義的邊界」切，讓孩子同時學到字義邏輯。

---

## 二、分塊策略總覽

| 策略名稱 | 適用場景 | 優先順序 |
|----------|----------|----------|
| **Onset + Rime（首音 + 韻基）** | 單音節字 | ① 最優先 |
| **Compound（複合字拆詞）** | 由兩個獨立英文字組成的合成字 | ② |
| **Morpheme（詞素拆分）** | 有明確前綴（prefix）或後綴（suffix）的字 | ③ |
| **Syllable（音節拆分）** | 多音節字，無明顯詞素邊界 | ④ 最後手段 |

> **決策優先順序**：Onset-Rime → Compound → Morpheme → Syllable  
> 同一個字可能同時符合多個策略，依照優先順序取第一個能清楚表達的策略。

---

## 三、策略詳細規則

---

### 策略 ①：Onset + Rime（首音 + 韻基）

#### 適用條件
- 整個單字只有 **1 個音節**（即音標中只有 1 個母音核心）。
- 不是複合字也沒有前後綴（否則先走策略 ②③）。

#### 定義
- **Onset（首音）**：音節中，母音之前的所有輔音（可以是 0 個、1 個、或輔音叢）。
- **Rime（韻基）**：母音本身加上母音之後的所有輔音（這是記憶的核心單位）。

#### 切法規則

**規則 1：有 Onset 的字，切成「首音 | 韻基」兩塊。**

```
jump  → [j] + [ump]      /dʒ/ + /ʌmp/
cold  → [c] + [old]      /k/  + /oʊld/
cat   → [c] + [at]       /k/  + /æt/
child → [ch] + [ild]     /tʃ/ + /ɪld/
bay   → [b] + [ay]       /b/  + /eɪ/
cow   → [c] + [ow]       /k/  + /aʊ/
care  → [c] + [are]      /k/  + /er/
dove  → [d] + [ove]      /d/  + /ʌv/   ← magic-e，e 不發音但屬於 rime
```

**規則 2：以母音開頭的字（Onset 為空），整顆視為 rime，但可切為「首母音 | 尾輔音叢」。**

```
act   → [a] + [ct]       /æ/  + /kt/
add   → [a] + [dd]       /æ/  + /d/
ape   → [a] + [pe]       /eɪ/ + /p/    ← magic-e，pe 是 rime 尾
air   → [air]            /er/           ← 整顆是 r 控制母音組合，不再拆
```

> ⚠️ **air 不拆的理由**：`air` 是 r-controlled vowel team，整個三字母是一個母音音素 `/er/`，硬拆 `a + ir` 無法還原正確發音。凡是 r-controlled 組合（ar, er, ir, or, ur, air, ear, oor 等）一律視為**不可拆的單一韻基**。

**規則 3：Onset 是二合字母（Digraph）或輔音叢（Cluster）時，整個 Onset 視為一塊。**

```
child → [ch] + [ild]     ch 是 digraph，整體發 /tʃ/
ship  → [sh] + [ip]      sh 是 digraph，整體發 /ʃ/
block → [bl] + [ock]     bl 是 cluster，整體發 /bl/
strong → [str] + [ong]   str 是三輔音 cluster
```

**規則 4：Rime 中的 magic-e（CVCe 結構），e 屬於 rime 但標記為靜音。**

```
ape  → [a] + [pe]        rime = pe，e 讓 a 發長音 /eɪ/
dove → [d] + [ove]       rime = ove，e 讓 o 發 /ʌ/（例外，不是典型長音）
cake → [c] + [ake]       rime = ake，e 讓 a 發長音 /eɪ/
```

---

### 策略 ②：Compound（複合字拆詞）

#### 適用條件
- 單字是由**兩個或以上可獨立成詞的英文字**直接拼合而成。
- 拆開後每一塊本身都是一個有意義的英文單字。

#### 切法規則

沿著原始獨立字的邊界切，不跨字切割：

```
greenhouse  → [green] + [house]
carefree    → [care]  + [free]
applesauce  → [apple] + [sauce]
sunflower   → [sun]   + [flower]
rainbow     → [rain]  + [bow]
football    → [foot]  + [ball]
mailbox     → [mail]  + [box]
```

> **記憶錨點說明**：複合字的錨點是「兩個獨立詞的組合語義」。  
> 例：`greenhouse` = green（綠色）+ house（房子）→「綠色的房子，用來種植物」，語義直接推導拼字。

---

### 策略 ③：Morpheme（詞素拆分）

#### 適用條件
- 單字有明確可識別的**前綴（prefix）**或**後綴（suffix）**，且這些詞素在其他單字中也常出現。
- 去掉前綴或後綴之後，剩下的部分（字根）本身有獨立意義或至少是可識別的發音單位。

#### 常見前綴對照表

| 前綴 | 語義 | 範例 |
|------|------|------|
| `un-` | 否定、反轉 | unhappy, undo, untie |
| `mis-` | 錯誤地 | mistreat, mistake, misread |
| `re-` | 再次 | rewrite, redo, retell |
| `pre-` | 之前 | preview, preheat |
| `dis-` | 否定 | dislike, disagree |
| `over-` | 超過 | overeat, overlook |
| `sub-` | 在下 | subway, submarine |
| `inter-` | 之間 | interact, internet |
| `ab-` | 離開、偏離 | absent, abstract, absolute |
| `ex-` | 出、前任 | export, exit, explain |

#### 常見後綴對照表

| 後綴 | 語義 | 範例 |
|------|------|------|
| `-dom` | 領域、狀態 | kingdom, freedom, wisdom |
| `-ful` | 充滿 | careful, hopeful, harmful |
| `-less` | 缺乏 | careless, hopeless, homeless |
| `-ness` | 狀態、性質 | darkness, kindness, sadness |
| `-ment` | 行為結果 | movement, payment, treatment |
| `-tion/-sion` | 行為結果（名詞化） | action, nation, permission |
| `-ly` | 副詞化 | slowly, quickly, carefully |
| `-er/-or` | 人、物、比較級 | teacher, actor, bigger |
| `-able/-ible` | 可以…的 | readable, possible |
| `-ate` | 動詞化 | operate, create, educate |
| `-ize/-ise` | 動詞化 | realize, organize |
| `-al` | 形容詞化 | royal, natural, musical |

#### 切法規則

**規則 1：前綴 + 字根。**

```
mistreat  → [mis] + [treat]
misread   → [mis] + [read]
unhappy   → [un]  + [happy]
retell    → [re]  + [tell]
```

**規則 2：字根 + 後綴。**

```
kingdom   → [king]  + [dom]
freedom   → [free]  + [dom]
careful   → [care]  + [ful]
treatment → [treat] + [ment]
```

**規則 3：前綴 + 字根 + 後綴（三段式）。**

```
unkindness → [un] + [kind] + [ness]
disagreement → [dis] + [agree] + [ment]
```

**規則 4：`operate` 類：字根不是獨立英文字，但後綴仍切出。**

```
operate → [oper] + [ate]      oper 非獨立字，但 -ate 是動詞後綴
absolute → [ab] + [so] + [lute]  ← ab- 是前綴，但 solute 已沒有更小的有意義拆法，
                                     此時改走音節策略處理剩餘部分
```

> ⚠️ **何時停止拆詞素、改走音節**：  
> 若去掉前後綴後，剩下的字根本身無法給孩子建立有意義的記憶點（如 `-solute` 對小學生無意義），則字根部分改用音節策略繼續拆。

---

### 策略 ④：Syllable（音節拆分）

#### 適用條件
- 多音節字，且無法識別複合字結構或有效的詞素邊界。
- 或詞素拆分後字根部分仍需進一步拆解。

#### 音節切分的六大規則（英文音節劃分標準規則）

**規則 VCV：兩母音中間夾一個輔音 → 輔音歸後面那個音節。**
```
noble  → [no] + [ble]       n-o | b-l-e
color  → [co] + [lor]
open   → [o]  + [pen]
```

**規則 VCCV：兩母音中間夾兩個輔音 → 從中間切。**
```
magnet  → [mag] + [net]
proper  → [prop] + [er]
butter  → [but]  + [ter]
```

**規則 VCCCV：三個輔音連在一起 → 先判斷哪些輔音可以組成合法 onset，保留合法 onset 給後面。**
```
monster → [mon] + [ster]    st 可作 onset，所以歸後面
```

**規則 有後綴 -ble / -ple / -tle / -dle / -gle / -fle（子音 + le 結尾）：視為獨立末音節。**
```
noble   → [no]  + [ble]
apple   → [ap]  + [ple]
little  → [lit] + [tle]
```

**規則 R-controlled 母音不跨音節切：ar, er, ir, or, ur 視為同一個母音，不從中間切。**
```
fortune → [for] + [tune]    for 整塊是 r-controlled，不拆成 fo + r
proper  → [prop] + [er]     er 整塊是 r-controlled
```

**規則 Double Consonant（重複輔音）：中間切一個，兩邊各一個。**
```
bunny   → [bun] + [ny]      nn → 一個歸前、一個歸後
butter  → [but] + [ter]
```

---

## 四、特殊情況處理

### 4-1 靜音字母（Silent Letters）

靜音字母跟著它所屬的母音或字根走，不單獨成塊，但需在 `memoryNote` 中標記。

```
calf    → [c] + [alf]       l 不發音，標記：「l 是靜音」
knife   → [kn] + [ife]      k 不發音，標記：「k 是靜音」
gnome   → [gn] + [ome]      g 不發音
```

### 4-2 R-controlled 母音

以下組合永遠視為**不可拆的單一音素單位**：

| 組合 | 發音 | 範例 |
|------|------|------|
| `ar` | /ɑːr/ | barn, car, star |
| `er` | /ɜːr/ | her, proper |
| `ir` | /ɜːr/ | bird, girl |
| `or` | /ɔːr/ | for, corn, color |
| `ur` | /ɜːr/ | fur, turn |
| `air` | /er/  | air, pair, fair |
| `ear` | /ɪr/  | ear, hear, clear |
| `oor` | /ʊr/  | floor（注意 floor 另有讀法） |

### 4-3 Vowel Teams（雙字母母音）

以下組合永遠視為**不可拆的單一母音單位**：

| 組合 | 發音 | 範例 |
|------|------|------|
| `ai` | /eɪ/ | rain, tail |
| `ay` | /eɪ/ | day, bay, play |
| `ea` | /iː/ or /ɛ/ | eat, bread |
| `ee` | /iː/ | see, tree |
| `ie` | /iː/ or /aɪ/ | cookie, pie |
| `oa` | /oʊ/ | boat, coat |
| `oe` | /oʊ/ | toe, foe |
| `oo` | /uː/ or /ʊ/ | moon, book |
| `ou` | /aʊ/ or /oʊ/ | out, soup |
| `ow` | /aʊ/ or /oʊ/ | cow, snow |
| `oy` | /ɔɪ/ | boy, royal |
| `oi` | /ɔɪ/ | oil, coin |
| `au` | /ɔː/ | sauce, caught |
| `aw` | /ɔː/ | saw, jaw |
| `ew` | /juː/ or /uː/ | new, few |
| `ue` | /uː/ or /juː/ | blue, due |
| `ui` | /uː/ | fruit, suit |

### 4-4 Digraph（二合字母輔音）

以下輔音組合永遠不從中間拆：

| 組合 | 發音 | 範例 |
|------|------|------|
| `ch` | /tʃ/ | child, chair |
| `sh` | /ʃ/ | ship, shell |
| `th` | /θ/ or /ð/ | thin, this |
| `wh` | /w/ or /hw/ | when, white |
| `ph` | /f/ | phone, photo |
| `ck` | /k/ | duck, clock |
| `ng` | /ŋ/ | ring, sing |
| `qu` | /kw/ | queen, quick |
| `gh` | /f/ or silent | laugh, night |

### 4-5 Magic-E（CVCe 結構）

magic-e 的規則：字尾的 `e` 靜音，且讓前面的母音發**長音**（字母音）。
e 跟 rime 綁在一起，不單獨成塊。

```
cake  → [c] + [ake]     a 發長音 /eɪ/
vine  → [v] + [ine]     i 發長音 /aɪ/
rope  → [r] + [ope]     o 發長音 /oʊ/
tube  → [t] + [ube]     u 發長音 /juː/
```

例外：有些 CVCe 字母音不是典型長音（歷史遺留）：
```
dove  → /dʌv/    o 沒有發長音，屬於例外，需在 memoryNote 標記
love  → /lʌv/    同上
```

### 4-6 兩音節字的 Onset-Rime 遞歸

若一個兩音節字的每個音節都很短，可對每個音節各自套用 Onset-Rime：

```
bunny  → 音節1: [b] + [un]  |  音節2: [n] + [y]
candy  → 音節1: [c] + [an]  |  音節2: [d] + [y]
city   → 音節1: [c] + [it]  |  音節2: [y]
color  → 音節1: [c] + [ol]  |  音節2: [or]（r-controlled，整顆保留）
cookie → 音節1: [c] + [ook] |  音節2: [ie]（vowel team，整顆保留）
```

---

## 五、資料欄位規範

每個單字在 app 資料中以以下欄位描述：

```json
{
  "word": "jump",
  "chunkType": "onset-rime",
  "chunks": [
    {
      "text": "j",
      "sound": "dʒ",
      "role": "onset",
      "memoryNote": ""
    },
    {
      "text": "ump",
      "sound": "ʌmp",
      "role": "rime",
      "memoryNote": "ump word family：bump, dump, lump, pump, hump"
    }
  ],
  "memoryAnchor": {
    "type": "word-family",
    "anchor": "ump",
    "siblings": ["bump", "dump", "lump", "pump", "hump", "grump"],
    "anchorNote": "只要換掉開頭字母，整個 ump 家族都會拼了。讓孩子先記住 ump 這個聲音塊，然後練習換首音：b→bump、d→dump、gr→grump。"
  }
}
```

---

## 六、`memoryAnchor`（記憶錨點）欄位詳細規範

這是整份規範中最重要的欄位，目的是**明確告訴老師和孩子，要把這個字「掛」在哪個已知的記憶上**。

### 6-1 `type` 欄位的所有合法值

| type 值 | 說明 | 適用策略 |
|---------|------|----------|
| `word-family` | 這個 rime 有大量同韻家族字 | Onset-Rime |
| `silent-letter` | 有靜音字母需要特別記憶 | Onset-Rime / Syllable |
| `magic-e` | CVCe 結構，e 讓母音變長音 | Onset-Rime |
| `r-controlled` | r 控制母音，發音特殊 | Onset-Rime / Syllable |
| `vowel-team` | 雙字母母音，需整體記憶 | Onset-Rime / Syllable |
| `digraph` | 二合輔音字母，整體一個音 | Onset-Rime |
| `compound` | 兩個獨立字拼成的合成字 | Compound |
| `prefix` | 有前綴，帶有固定語義 | Morpheme |
| `suffix` | 有後綴，帶有固定語義 | Morpheme |
| `prefix+suffix` | 同時有前後綴 | Morpheme |
| `syllable-pattern` | 靠音節規律記憶，無特別錨點 | Syllable |
| `exception` | 不規則發音，需死記 | 所有 |

### 6-2 `anchorNote` 的撰寫標準

`anchorNote` 必須包含以下三個部分（依序填寫，缺一不可）：

1. **這個錨點的語義或語音邏輯是什麼**：告訴孩子「為什麼這樣切」。
2. **這個錨點能延伸到哪些其他單字**：給出 3～6 個「同錨點」的兄弟字。
3. **記憶建議/口訣**：用孩子能理解的語言，給一個簡短的記憶策略。

#### 範例 1：Onset-Rime，word-family 類型

```json
"memoryAnchor": {
  "type": "word-family",
  "anchor": "old",
  "siblings": ["bold", "fold", "gold", "hold", "mold", "sold", "told"],
  "anchorNote": "
    1. 邏輯：-old 是一個超高頻韻基，凡是有這個 rime 的字，母音都發 /oʊld/。
    2. 兄弟字：bold（大膽的）、fold（折疊）、gold（金子）、hold（抓住）、sold（賣掉了）。
    3. 記憶策略：先記住 OLD（老的）這個字，然後想像換帽子：c+old 就是冷、g+old 就是金子。
  "
}
```

#### 範例 2：Magic-E 類型

```json
"memoryAnchor": {
  "type": "magic-e",
  "anchor": "ape",
  "siblings": ["cape", "tape", "grape", "shape"],
  "anchorNote": "
    1. 邏輯：magic-e 規則 — 字尾的 e 不發音，但它的魔法讓前面的 a 從短音 /æ/ 變成長音 /eɪ/（就是字母 A 的名字）。
    2. 兄弟字：cape（披風）、tape（膠帶）、grape（葡萄）、shape（形狀）。
    3. 記憶策略：把字尾的 e 想成一個「沉默的魔法師」，它自己不出聲，但讓旁邊的母音大聲唸自己的名字。
  "
}
```

#### 範例 3：Compound 類型

```json
"memoryAnchor": {
  "type": "compound",
  "anchor": "green + house",
  "siblings": ["treehouse", "doghouse", "playhouse"],
  "anchorNote": "
    1. 邏輯：greenhouse = green（綠色）+ house（房子），是用玻璃蓋的、讓植物冬天住的溫室。
       拼字完全等於兩個已知單字相加，不需要背任何新的拼音規則。
    2. 兄弟字：treehouse（樹屋）= tree + house、doghouse（狗屋）= dog + house。
    3. 記憶策略：看到這個字，腦海先找「裡面藏了哪兩個字」，找到了，拼字自然對了。
  "
}
```

#### 範例 4：Prefix 類型

```json
"memoryAnchor": {
  "type": "prefix",
  "anchor": "mis-",
  "siblings": ["mistake", "misread", "mislead", "misplace", "misunderstand"],
  "anchorNote": "
    1. 邏輯：mis- 是一個前綴，語義是「錯誤地、不好地」。mistreat = mis + treat，
       treat 是對待/款待，mis+treat 就是「錯誤地對待某人 → 虐待」。
    2. 兄弟字：mistake（做錯）、misread（讀錯）、mislead（誤導）、misplace（放錯地方）。
    3. 記憶策略：看到 mis- 開頭，先問自己「後面這個字是什麼意思？」再加上「做錯了」就是整個字的意思。
       這樣背一個前綴，等於同時學會了一整族的字。
  "
}
```

#### 範例 5：Exception（不規則），需死記

```json
"memoryAnchor": {
  "type": "exception",
  "anchor": "seize",
  "siblings": ["either", "neither", "weird"],
  "anchorNote": "
    1. 邏輯：seize 的 ei 違反了 'i before e except after c' 這個常見規則，屬於例外字。
       ei 在這裡發 /iː/，跟 ee 一樣的音。
    2. 兄弟字：either、neither、weird — 這些都是 ei 發 /iː/ 的例外字族。
    3. 記憶策略：用句子鎖定拼字「She seized the weird creature.」
       把幾個例外字串成一句話一起背，效果比單字死記好。
  "
}
```

#### 範例 6：Suffix 類型（後綴）

```json
"memoryAnchor": {
  "type": "suffix",
  "anchor": "-dom",
  "siblings": ["freedom", "wisdom", "boredom", "kingdom"],
  "anchorNote": "
    1. 邏輯：-dom 是後綴，語義是「某種狀態/領域/範疇」。
       kingdom = king（國王）+ dom（領域）→「國王的領域 → 王國」。
    2. 兄弟字：freedom（自由的狀態）、wisdom（智慧的狀態）、boredom（無聊的狀態）。
    3. 記憶策略：看到 -dom 結尾，先認出前面的字根，再加上「某種狀態」的意思就能推出整字含義。
       知道 king，就知道 kingdom；知道 free，就知道 freedom。後綴是免費送的知識。
  "
}
```

#### 範例 7：R-controlled 母音

```json
"memoryAnchor": {
  "type": "r-controlled",
  "anchor": "ar",
  "siblings": ["car", "star", "barn", "farm", "park"],
  "anchorNote": "
    1. 邏輯：字母 r 會「控制」前面的母音，讓它不發原本的短音或長音，
       而是發一個喉嚨往後縮的 r 音。ar 整組固定發 /ɑːr/（類似台灣口音的「啊兒」）。
    2. 兄弟字：car（車）、star（星星）、barn（穀倉）、farm（農場）、park（公園）。
    3. 記憶策略：ar 整組是一個不可分割的聲音磚塊，看到 ar 就直接唸 /ɑːr/，
       不要分開唸 /æ/ + /r/，分開唸一定會唸錯。
  "
}
```

---

## 七、完整範例表

### 7-1 國小低年級字彙

| 單字 | chunkType | chunks | memoryAnchor.type | anchor | anchorNote 摘要 |
|------|-----------|--------|------------------|--------|----------------|
| act | onset-rime | [a] + [ct] | word-family | act | act, fact, pact, tract — 短母音 a + ct 結尾 |
| add | onset-rime | [a] + [dd] | syllable-pattern | — | 母音開頭，dd 是雙輔音尾，整字只有一個 d 的聲音 |
| air | onset-rime | [air] | r-controlled | air | 整組 air=/er/，兄弟：fair, pair, chair, stair |
| any | syllable | [an] + [y] | exception | — | any 的 a 發短音 /ɛ/（接近 e），是例外；y 結尾發 /i/ |
| ape | onset-rime | [a] + [pe] | magic-e | ape | 兄弟：cape, tape, grape, shape |
| away | syllable + onset-rime | [a] + [w]+[ay] | vowel-team | ay | ay 固定發 /eɪ/，兄弟：day, bay, play, stay |
| barn | onset-rime | [b] + [arn] | r-controlled | arn | arn=/ɑːrn/，兄弟：yarn, darn, farm（ar 控母音）|
| bay | onset-rime | [b] + [ay] | word-family | ay | 兄弟：day, say, may, play, stay, clay |
| bunny | syllable | [b]+[un] + [n]+[y] | word-family | un | un 韻基：bun, fun, run, sun, gun |
| cab | onset-rime | [c] + [ab] | word-family | ab | 兄弟：tab, dab, grab, jab, lab |
| calf | onset-rime | [c] + [alf] | silent-letter | l | l 不發音，整字發 /kæf/，需特別標記靜音 l |
| candy | syllable | [c]+[an] + [d]+[y] | word-family | an | an 韻基：can, man, fan, pan, ran |
| care | onset-rime | [c] + [are] | r-controlled | are | are=/er/，兄弟：bare, dare, fare, share, stare |
| child | onset-rime | [ch] + [ild] | digraph | ch | ch=/tʃ/，ild 韻基：wild, mild, build |
| city | syllable | [c]+[it] + [y] | exception | soft-c | c 在 i 前發軟音 /s/，兄弟：circle, cent, ceiling |
| cold | onset-rime | [c] + [old] | word-family | old | 兄弟：bold, fold, gold, hold, mold, sold, told |
| color | syllable | [c]+[ol] + [or] | r-controlled | or | or=/ɔːr/，兄弟：for, corn, born, torn |
| cookie | syllable | [c]+[ook] + [ie] | vowel-team | oo+ie | oo=/ʊ/（短 oo），ie 結尾=/i/，兄弟：book, cook, look |
| cow | onset-rime | [c] + [ow] | vowel-team | ow | ow 有兩音：/aʊ/（cow）或 /oʊ/（snow），需標哪個 |
| cub | onset-rime | [c] + [ub] | word-family | ub | 兄弟：hub, rub, sub, tub, club, grub |
| day | onset-rime | [d] + [ay] | word-family | ay | 兄弟：bay, may, pay, say, way, play, stay |
| dot | onset-rime | [d] + [ot] | word-family | ot | 兄弟：hot, lot, not, pot, rot, shot |
| dove | onset-rime | [d] + [ove] | exception | magic-e失效 | ove 應長音但發 /ʌv/，屬例外，兄弟：love, above |

### 7-2 國小六年級字彙

| 單字 | chunkType | chunks | memoryAnchor.type | anchor | anchorNote 摘要 |
|------|-----------|--------|------------------|--------|----------------|
| absolute | morpheme+syllable | [ab] + [so] + [lute] | prefix | ab- | ab- 表「偏離」，absolute = 完全偏離任何限制 → 絕對的 |
| applesauce | compound | [apple] + [sauce] | compound | apple+sauce | 蘋果泥醬，兩個已知字直接相加 |
| carefree | compound | [care] + [free] | compound | care+free | care（擔心）+ free（自由）= 無憂無慮 |
| course | onset-rime | [c] + [ourse] | r-controlled | our+se | our=/ɔːr/，ourse 整組=/ɔːrs/，兄弟：source, force |
| fortune | syllable | [for] + [tune] | r-controlled | or | for=/fɔːr/，tune=/tʃən/（弱化），記：for+tune = 好運 |
| greenhouse | compound | [green] + [house] | compound | green+house | 綠色的房子，植物的家 |
| kingdom | morpheme | [king] + [dom] | suffix | -dom | -dom 表領域，兄弟：freedom, wisdom, boredom |
| magnet | syllable | [mag] + [net] | syllable-pattern | VCCV | 兩母音夾兩輔音（gn），從中間切：mag-net |
| mistreat | morpheme | [mis] + [treat] | prefix | mis- | mis- 表錯誤，兄弟：mistake, misread, mislead |
| noble | syllable | [no] + [ble] | syllable-pattern | VCV | 一個輔音夾在兩母音間，輔音歸後（no-ble） |
| operate | morpheme | [oper] + [ate] | suffix | -ate | -ate 是動詞後綴，兄弟：create, locate, educate |
| pollute | syllable | [pol] + [lute] | syllable-pattern | VCCV | pol-lute，ll 從中切，lute=/luːt/ |
| proper | syllable | [prop] + [er] | r-controlled | er | er=/ɜːr/ 弱化音，兄弟：other, better, teacher |
| royal | syllable | [roy] + [al] | vowel-team | oy | oy=/ɔɪ/，兄弟：boy, joy, toy, loyal, royal |
| seize | onset-rime | [s] + [eize] | exception | ei=/iː/ | ei 例外發 /iː/，兄弟：either, neither, weird；口訣：weird seize |

---

## 八、給 AI 的操作指令（SOP）

當收到一個英文單字，要求進行拼讀分塊時，請依以下流程逐步執行：

```
步驟 1：判斷是否為複合字（Compound）
  - 問：這個字可以拆成兩個各自有意義的英文字嗎？
  - YES → 沿詞邊界切，chunkType = "compound"，跳到步驟 5。
  - NO → 進入步驟 2。

步驟 2：計算音節數
  - 數音標中的母音核心數量（=音節數）。
  - 音節數 = 1 → 進入步驟 3（Onset-Rime）。
  - 音節數 > 1 → 進入步驟 4（先查詞素，再查音節）。

步驟 3：Onset-Rime（單音節字）
  - 找出母音之前的所有輔音 → 這是 Onset。
  - 母音加上之後的所有輔音 → 這是 Rime。
  - 若 Onset 是 digraph 或 cluster → 整組作為一塊。
  - 若有 magic-e → e 歸 Rime，標記 type = "magic-e"。
  - 若有 r-controlled 母音 → 整組 r-controlled 歸 Rime，標記 type = "r-controlled"。
  - 跳到步驟 5。

步驟 4：多音節字的詞素判斷
  - 查前綴列表：有嗎？→ 切出前綴，chunkType = "morpheme"，標記 type = "prefix"。
  - 查後綴列表：有嗎？→ 切出後綴，chunkType = "morpheme"，標記 type = "suffix"。
  - 字根仍多音節？→ 對字根遞歸執行步驟 4。
  - 字根只剩一個音節？→ 對字根執行步驟 3（Onset-Rime）。
  - 完全無詞素 → chunkType = "syllable"，套用六大音節規則切分。

步驟 5：填寫 memoryAnchor
  - 判斷 type（見 6-1 的合法值列表）。
  - 找出 anchor（最核心的記憶單位，通常是 rime、複合字的兩個字、或前後綴）。
  - 找出 siblings（3～6 個共享同一 anchor 的其他單字）。
  - 撰寫 anchorNote（必須包含：①邏輯解釋、②兄弟字、③記憶策略，三段缺一不可）。

步驟 6：輸出 JSON 格式
  - 依第五節的欄位規範輸出完整 JSON。
```

---

## 九、邊界情況 & 常見誤判防範

| 情況 | 錯誤做法 | 正確做法 |
|------|---------|---------|
| `air` 切成 a + ir | ❌ 分開唸會發錯音 | ✅ 整組 air 是 r-controlled 母音，視為一塊 |
| `child` 的 ch 拆成 c + h | ❌ 分別唸 /k/ + /h/ | ✅ ch 是 digraph，整組發 /tʃ/ |
| `cold` 切成 co + ld | ❌ 按字面切，沒有利用 word family | ✅ c + old，利用 -old 高頻韻基 |
| `dove` 當成一般 magic-e | ⚠️ 學生會唸成 /doʊv/ | ✅ 標記為 exception，ove 發 /ʌv/ |
| `city` 的 c 當 /k/ | ❌ city 的 c 在 i 前發軟音 | ✅ 標記 soft-c，c=/s/ |
| `calf` 照字面唸出 l | ❌ l 發音 → /kælf/ | ✅ 標記 silent-l，正確發音 /kæf/ |
| `any` 的 a 當短音 /æ/ | ❌ any 的 a 發 /ɛ/ | ✅ 標記 exception |
| `cookie` 的 oo 當 /uː/ | ⚠️ cookie 的 oo 是短 /ʊ/ | ✅ 標記 short-oo，區分 moon（/uː/）vs book（/ʊ/）|
| `fortune` 的 tu 當 /tjuː/ | ⚠️ 正式美式音 tu 弱化為 /tʃə/ | ✅ 標記實際發音 /fɔːrtʃən/ |
| `absolute` 全走詞素 | ⚠️ ab- 是詞素但 -solute 對小學生無意義 | ✅ 切出 ab- 後，剩餘走音節：so+lute |

---

*本文件為 Spelling Bee 學習系統拼讀分塊規範，供 AI 產生單字資料時遵循。*
*如有新增規則或例外情況，請在此文件末尾補充並標記版本號與日期。*
