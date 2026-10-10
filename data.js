const feedbacks = {
    correct: [
      { text: "「我要成為海賊王！」", char: "魯夫", anime: "海賊王", img: "🏴‍☠️" },
      { text: "「你是我的夥伴！」", char: "魯夫", anime: "海賊王", img: "🤝" },
      { text: "「真相永遠只有一個！」", char: "柯南", anime: "名偵探柯南", img: "🔍" },
      { text: "「哈哈哈哈！不愧是名偵探毛利小五郎！」", char: "毛利小五郎", anime: "名偵探柯南", img: "🤣" },
      { text: "「全集中！」", char: "炭治郎", anime: "鬼滅之刃", img: "⚔️" },
      { text: "「好吃！好吃！好吃！」", char: "煉獄杏壽郎", anime: "鬼滅之刃", img: "🔥" },
      { text: "「我要在第一線，看見世界改變的瞬間。」", char: "潔世一", anime: "藍色監獄", img: "⚽" }
    ],
    incorrect: [
      { text: "「背後的傷痕是劍士的恥辱。」", char: "索隆", anime: "海賊王", img: "🗡️" },
      { text: "「啊咧咧～好奇怪喔～」", char: "柯南", anime: "名偵探柯南", img: "❓" },
      { text: "「不准哭！不要絕望！那種事現在做什麼都沒用！」", char: "炭治郎", anime: "鬼滅之刃", img: "💧" },
      { text: "「豬突猛進！豬突猛進！」", char: "嘴平伊之助", anime: "鬼滅之刃", img: "🐗" },
      { text: "「太天真了。」", char: "糸師凜", anime: "藍色監獄", img: "🧊" },
      { text: "「閉嘴，放馬過來，廢物。」", char: "潔世一", anime: "藍色監獄", img: "🔥" }
    ]
  };
  
  const levels = [
    {
      level: 1,
      theme: "海賊王 (One Piece)",
      story: "Luffy wants an absolute fortune. He sails his ship on a new course to a noble kingdom. He is a carefree pirate who loves applesauce. On the island, he finds a secret greenhouse and a big magnet. He says a true pirate will never mistreat his friends.",
      storyTranslation: "魯夫想要一筆絕對的財富。他駕駛著船沿著新航線前往一個高貴的王國。他是個熱愛蘋果醬、無憂無慮的海賊。在島上，他發現了一間秘密溫室和一塊大磁鐵。他說真正的海賊絕對不會苛待他的朋友。",
      words: [
        { id: 1, word: "absolute", segments: ["ab", "so", "lute"], meaning: "絕對的", mnemonic: "諧音「阿伯說路特」，阿伯說這條路特別安全，絕對沒問題！", emoji: "💯" },
        { id: 2, word: "applesauce", segments: ["ap", "ple", "sauce"], meaning: "蘋果醬", mnemonic: "諧音「阿婆說吃」，阿婆說吃蘋果醬對身體好！", emoji: "🍎" },
        { id: 3, word: "carefree", segments: ["care", "free"], meaning: "無憂無慮的", mnemonic: "諧音「客運免費」，搭客運免費，真是無憂無慮！", emoji: "😌" },
        { id: 4, word: "course", segments: ["course"], meaning: "課程 / 航線", mnemonic: "諧音「摳死」，這堂課程很貴，讓我心痛到摳死！", emoji: "🛤️" },
        { id: 5, word: "fortune", segments: ["for", "tune"], meaning: "財富 / 運氣", mnemonic: "諧音「佛村」，來到佛村拜拜就會發大財！", emoji: "💰" },
        { id: 6, word: "greenhouse", segments: ["green", "house"], meaning: "溫室", mnemonic: "綠色 (green) 的房子 (house)，用來種花草的溫室。", emoji: "🪴" },
        { id: 7, word: "kingdom", segments: ["king", "dom"], meaning: "王國", mnemonic: "國王 (king) 統治的地方 (dom) 就是王國。", emoji: "👑" },
        { id: 8, word: "magnet", segments: ["mag", "net"], meaning: "磁鐵", mnemonic: "諧音「買個網」，買個網子來裝磁鐵！", emoji: "🧲" },
        { id: 9, word: "mistreat", segments: ["mis", "treat"], meaning: "苛待 / 虐待", mnemonic: "錯誤的 (mis) 對待 (treat) 別人就是苛待。", emoji: "😢" },
        { id: 10, word: "noble", segments: ["no", "ble"], meaning: "高貴的", mnemonic: "諧音「弄破」，高貴的花瓶弄破了很可惜！", emoji: "💎" }
      ]
    },
    {
      level: 2,
      theme: "名偵探柯南 (Detective Conan)",
      story: "Conan must operate a machine in a snowstorm. He walks with a proper style. He sees a thief try to seize a royal diamond. He will not let the thief pollute the town. The thief tries to tease Conan twice, but Conan does not wander away.",
      storyTranslation: "柯南必須在暴風雪中操作一台機器。他以適當的風格走著。他看到一個小偷試圖抓住一顆皇家鑽石。他不會讓小偷污染這個城鎮。小偷試圖取笑柯南兩次，但柯南並沒有徘徊離開。",
      words: [
        { id: 11, word: "operate", segments: ["op", "er", "ate"], meaning: "操作", mnemonic: "諧音「阿婆累了」，阿婆操作機器操作到累了。", emoji: "⚙️" },
        { id: 12, word: "pollute", segments: ["pol", "lute"], meaning: "污染", mnemonic: "諧音「破路特」，這條破路特別容易造成空氣污染。", emoji: "🏭" },
        { id: 13, word: "proper", segments: ["prop", "er"], meaning: "適當的", mnemonic: "諧音「撲肉排」，適當的溫度才能撲上肉排煎。", emoji: "✅" },
        { id: 14, word: "royal", segments: ["roy", "al"], meaning: "皇家的", mnemonic: "諧音「肉油」，皇家的人吃的肉都很油很高級。", emoji: "🏰" },
        { id: 15, word: "seize", segments: ["seize"], meaning: "抓住", mnemonic: "諧音「戲子」，戲子抓住了觀眾的心。", emoji: "✊" },
        { id: 16, word: "snowstorm", segments: ["snow", "storm"], meaning: "暴風雪", mnemonic: "雪 (snow) 加上風暴 (storm) 就是暴風雪。", emoji: "🌨️" },
        { id: 17, word: "style", segments: ["style"], meaning: "風格", mnemonic: "諧音「死呆鵝」，這隻死呆鵝穿衣服很有自己的風格。", emoji: "🕶️" },
        { id: 18, word: "tease", segments: ["tease"], meaning: "取笑 / 逗弄", mnemonic: "諧音「踢死」，你再取笑我，我就把你踢死！", emoji: "😜" },
        { id: 19, word: "twice", segments: ["twice"], meaning: "兩次", mnemonic: "諧音「兔蛙死」，兔子和青蛙死了兩次？這太可怕了！", emoji: "✌️" },
        { id: 20, word: "wander", segments: ["wan", "der"], meaning: "漫遊 / 徘徊", mnemonic: "諧音「玩得」，在這裡漫遊真的玩得好開心。", emoji: "🚶" }
      ]
    },
    {
      level: 3,
      theme: "鬼滅之刃 (Demon Slayer)",
      story: "Tanjiro finds an actual demon near a fountain. He must not go astray, otherwise he will lose. He sees a clump of dirt and a shiny crystal. A recent friend, who is a sailor, says he would prefer to fight. They catch a demon who tries to shoplift.",
      storyTranslation: "炭治郎在噴泉附近發現了一個真正的鬼。他絕不能誤入歧途，否則他會輸。他看到一叢泥土和一顆閃亮的冰晶。一位最近認識的水手朋友說他寧願戰鬥。他們抓住了一個試圖順手牽羊的鬼。",
      words: [
        { id: 21, word: "actual", segments: ["ac", "tu", "al"], meaning: "實際的 / 真正的", mnemonic: "諧音「愛去喔」，你實際上有愛去喔？", emoji: "🎯" },
        { id: 22, word: "astray", segments: ["a", "stray"], meaning: "迷路的 / 誤入歧途的", mnemonic: "一隻 (a) 流浪狗 (stray) 迷路了。", emoji: "🐕" },
        { id: 23, word: "clump", segments: ["clump"], meaning: "叢 / 塊", mnemonic: "諧音「克隆撲」，克隆人撲向那一叢草。", emoji: "🌿" },
        { id: 24, word: "crystal", segments: ["crys", "tal"], meaning: "水晶", mnemonic: "諧音「克里斯透」，克里斯的皮膚像水晶一樣透亮。", emoji: "💎" },
        { id: 25, word: "fountain", segments: ["foun", "tain"], meaning: "噴泉", mnemonic: "諧音「放天」，水柱放到天上去的噴泉。", emoji: "⛲" },
        { id: 26, word: "otherwise", segments: ["oth", "er", "wise"], meaning: "否則", mnemonic: "其他 (other) 的聰明 (wise) 方法，否則就糟了。", emoji: "⚠️" },
        { id: 27, word: "prefer", segments: ["pre", "fer"], meaning: "寧願 / 更喜歡", mnemonic: "諧音「撲理髮」，我寧願撲向理髮院剪頭髮。", emoji: "❤️" },
        { id: 28, word: "recent", segments: ["re", "cent"], meaning: "最近的", mnemonic: "諧音「日神」，最近日神天天出現，天氣真好。", emoji: "📅" },
        { id: 29, word: "sailor", segments: ["sail", "or"], meaning: "水手", mnemonic: "航行 (sail) 的人 (or) 就是水手。", emoji: "⚓" },
        { id: 30, word: "shoplift", segments: ["shop", "lift"], meaning: "在商店順手牽羊", mnemonic: "在商店 (shop) 舉起 (lift) 東西偷走。", emoji: "🛍️" }
      ]
    },
    {
      level: 4,
      theme: "藍色監獄 (Blue Lock)",
      story: "Isagi is a handsome player. He wants liberty on the field. He will observe the game to find its meaning. He hears a rumble and sees a yellow oriole. He will provide a good pass. He will not misuse the ball like a servant carrying powder.",
      storyTranslation: "潔世一是一位英俊的球員。他想要在球場上的自由。他會觀察比賽以尋找其意義。他聽到隆隆聲並看到一隻黃鸝鳥。他會提供一個好傳球。他不會像個搬運火藥的僕人一樣濫用球。",
      words: [
        { id: 31, word: "handsome", segments: ["hand", "some"], meaning: "英俊的", mnemonic: "手 (hand) 加上一些 (some)，擁有這些手的男人很英俊。", emoji: "😎" },
        { id: 32, word: "liberty", segments: ["lib", "er", "ty"], meaning: "自由", mnemonic: "諧音「李伯踢」，李伯踢球非常自由不受限。", emoji: "🗽" },
        { id: 33, word: "meaning", segments: ["mean", "ing"], meaning: "意義", mnemonic: "意思 (mean) 加上 ing，就是意義。", emoji: "🤔" },
        { id: 34, word: "misuse", segments: ["mis", "use"], meaning: "濫用 / 誤用", mnemonic: "錯誤的 (mis) 使用 (use) 就是濫用。", emoji: "🚫" },
        { id: 35, word: "observe", segments: ["ob", "serve"], meaning: "觀察", mnemonic: "諧音「阿伯射伏」，阿伯在草叢射伏，仔細觀察獵物。", emoji: "👀" },
        { id: 36, word: "oriole", segments: ["o", "ri", "ole"], meaning: "黃鸝鳥", mnemonic: "諧音「喔哩喔」，黃鸝鳥叫聲喔哩喔哩的。", emoji: "🐤" },
        { id: 37, word: "powder", segments: ["pow", "der"], meaning: "粉末", mnemonic: "諧音「跑的」，跑的時候揚起了很多粉末沙塵。", emoji: "💨" },
        { id: 38, word: "provide", segments: ["pro", "vide"], meaning: "提供", mnemonic: "諧音「撲肉排的」，提供撲滿肉排的便當。", emoji: "🤲" },
        { id: 39, word: "rumble", segments: ["rum", "ble"], meaning: "隆隆聲", mnemonic: "諧音「讓伯」，讓伯伯開這台發出隆隆聲的戰車。", emoji: "🔊" },
        { id: 40, word: "servant", segments: ["ser", "vant"], meaning: "僕人", mnemonic: "諧音「蛇煩他」，僕人打掃時有蛇煩他。", emoji: "🧹" }
      ]
    },
    {
      level: 5,
      theme: "海賊王 (One Piece)",
      story: "Zoro sees a boat sputter on the surface of the water. He walks to an old temple full of cobweb. He finds an awful enemy but stays gentle like an egret. He wants to adopt a new sword. He fights for the union of his friends, not for wealth.",
      storyTranslation: "索隆看到一艘船在水面上劈啪作響。他走向一座滿是蜘蛛網的古老寺廟。他遇到一個可怕的敵人，但他像白鷺一樣保持溫和。他想要領養（獲得）一把新劍。他為朋友們的聯合而戰，而不是為了財富。",
      words: [
        { id: 41, word: "sputter", segments: ["sput", "ter"], meaning: "劈啪作響", mnemonic: "諧音「死吧特」，機器死吧特地發出劈啪作響的聲音。", emoji: "💥" },
        { id: 42, word: "surface", segments: ["sur", "face"], meaning: "表面", mnemonic: "在...之上 (sur) 的臉 (face)，就是表面。", emoji: "🌊" },
        { id: 43, word: "temple", segments: ["tem", "ple"], meaning: "寺廟", mnemonic: "諧音「天婆」，天上的老婆婆住在寺廟裡。", emoji: "⛩️" },
        { id: 44, word: "union", segments: ["u", "nion"], meaning: "聯合 / 聯盟", mnemonic: "諧音「由你恩」，由你恩准我們組成聯盟。", emoji: "🤝" },
        { id: 45, word: "wealth", segments: ["wealth"], meaning: "財富", mnemonic: "諧音「威爾斯」，威爾斯親王擁有巨大的財富。", emoji: "💰" },
        { id: 46, word: "adopt", segments: ["a", "dopt"], meaning: "領養 / 採用", mnemonic: "諧音「阿達普」，阿達普叔叔領養了一隻狗。", emoji: "🐶" },
        { id: 47, word: "awful", segments: ["aw", "ful"], meaning: "可怕的 / 糟糕的", mnemonic: "諧音「喔否」，喔否！這真是太糟糕了！", emoji: "😱" },
        { id: 48, word: "cobweb", segments: ["cob", "web"], meaning: "蜘蛛網", mnemonic: "蜘蛛 (cob) 織的網 (web)。", emoji: "🕸️" },
        { id: 49, word: "egret", segments: ["e", "gret"], meaning: "白鷺", mnemonic: "諧音「一哥特」，一哥特別喜歡看白鷺鷥。", emoji: "🦤" },
        { id: 50, word: "gentle", segments: ["gen", "tle"], meaning: "溫和的", mnemonic: "諧音「建投」，建投大哥其實個性很溫和。", emoji: "🌸" }
      ]
    },
    {
      level: 6,
      theme: "名偵探柯南 (Detective Conan)",
      story: "Conan will limit the time to find the metal. He sees a moral thief take the hollow sweat shirt. The thief has a steady run. It does occur to Conan that the thief will run whenever he can. It is usual for Conan to catch him.",
      storyTranslation: "柯南將限制尋找金屬的時間。他看到一個有道德的小偷拿走了中空的排汗衫。小偷有著穩定的跑步步伐。柯南突然想到，小偷無論何時都會盡可能地跑。柯南抓住他是很平常的事。",
      words: [
        { id: 51, word: "hollow", segments: ["hol", "low"], meaning: "中空的", mnemonic: "諧音「哈囉」，對著中空的洞穴喊哈囉會有回音。", emoji: "🕳️" },
        { id: 52, word: "limit", segments: ["lim", "it"], meaning: "限制", mnemonic: "諧音「李密特」，李密特被限制不能出門。", emoji: "🛑" },
        { id: 53, word: "metal", segments: ["met", "al"], meaning: "金屬", mnemonic: "諧音「美頭」，美麗的頭盔是用金屬做的。", emoji: "🛡️" },
        { id: 54, word: "moral", segments: ["mo", "ral"], meaning: "道德的", mnemonic: "諧音「摸肉」，隨便摸肉是不道德的行為。", emoji: "😇" },
        { id: 55, word: "occur", segments: ["oc", "cur"], meaning: "發生 / 突然想到", mnemonic: "諧音「阿克」，阿克突然想到事情發生了。", emoji: "💡" },
        { id: 56, word: "steady", segments: ["stead", "y"], meaning: "穩定的", mnemonic: "諧音「死爹地」，雖然死爹地很難過，但情緒要保持穩定。", emoji: "⚖️" },
        { id: 57, word: "sweat", segments: ["sweat"], meaning: "汗水", mnemonic: "諧音「死威特」，死威特流了滿身汗水。", emoji: "💦" },
        { id: 58, word: "thief", segments: ["thief"], meaning: "小偷", mnemonic: "諧音「媳婦」，媳婦抓到了一個小偷。", emoji: "🦹" },
        { id: 59, word: "usual", segments: ["u", "su", "al"], meaning: "平常的", mnemonic: "諧音「有酒喔」，有酒喔，這就是我平常的快樂。", emoji: "日常" },
        { id: 60, word: "whenever", segments: ["when", "ev", "er"], meaning: "無論何時", mnemonic: "何時 (when) 加上 ever，就是無論何時。", emoji: "🕒" }
      ]
    },
    {
      level: 7,
      theme: "鬼滅之刃 (Demon Slayer)",
      story: "Inosuke runs farther to a location at midnight. He runs with straight motion to catch a bloodhound. He smells a bad odor. He wants glory and is honest. Is there anything amiss? No!",
      storyTranslation: "伊之助在午夜跑到更遠的一個地點。他以直線運動奔跑去抓一隻尋血獵犬。他聞到一股難聞的氣味。他想要榮耀並且很誠實。有什麼不對勁的嗎？沒有！",
      words: [
        { id: 61, word: "amiss", segments: ["a", "miss"], meaning: "不對勁的", mnemonic: "一個 (a) 錯失 (miss)，一定有哪裡不對勁。", emoji: "🤨" },
        { id: 62, word: "bloodhound", segments: ["blood", "hound"], meaning: "尋血獵犬", mnemonic: "血 (blood) 加上獵犬 (hound)。", emoji: "🐕‍🦺" },
        { id: 63, word: "concern", segments: ["con", "cern"], meaning: "關心 / 擔憂", mnemonic: "諧音「看神」，大家看神明，都很關心國泰民安。", emoji: "😟" },
        { id: 64, word: "farther", segments: ["far", "ther"], meaning: "更遠地", mnemonic: "遠的 (far) 加上 ther，就是更遠地。", emoji: "🔭" },
        { id: 65, word: "glory", segments: ["glo", "ry"], meaning: "榮耀", mnemonic: "諧音「哥蘿莉」，哥哥保護蘿莉，獲得榮耀。", emoji: "🏆" },
        { id: 66, word: "honest", segments: ["hon", "est"], meaning: "誠實的", mnemonic: "諧音「阿尼斯特」，阿尼斯特是個誠實的好孩子。", emoji: "👼" },
        { id: 67, word: "location", segments: ["lo", "ca", "tion"], meaning: "地點", mnemonic: "諧音「漏K神」，漏掉K神的地點在哪裡？", emoji: "📍" },
        { id: 68, word: "midnight", segments: ["mid", "night"], meaning: "午夜", mnemonic: "中間 (mid) 的夜晚 (night)。", emoji: "🕛" },
        { id: 69, word: "motion", segments: ["mo", "tion"], meaning: "運動 / 動作", mnemonic: "諧音「摸神」，摸神明的動作很輕柔。", emoji: "🏃" },
        { id: 70, word: "odor", segments: ["o", "dor"], meaning: "氣味", mnemonic: "諧音「嘔的」，聞到嘔吐的氣味。", emoji: "👃" }
      ]
    },
    {
      level: 8,
      theme: "藍色監獄 (Blue Lock)",
      story: "Reo wants to prevent a tangle. He will reduce his pause and run straight to score. He moves his thigh. He hits the ball like a silkworm weaving silk, flying like vapor. He will not scatter the team and will not get a wound.",
      storyTranslation: "玲王想要防止糾纏。他會減少暫停並直線奔跑去得分。他移動他的大腿。他像春蠶吐絲一樣擊球，像蒸氣一樣飛翔。他不會讓隊伍分散，也不會受傷。",
      words: [
        { id: 71, word: "pause", segments: ["pause"], meaning: "暫停", mnemonic: "諧音「跑死」，跑死了，快點暫停休息。", emoji: "⏸️" },
        { id: 72, word: "prevent", segments: ["pre", "vent"], meaning: "預防 / 防止", mnemonic: "諧音「撲理糞」，撲向清理糞便，防止臭味。", emoji: "🛡️" },
        { id: 73, word: "reduce", segments: ["re", "duce"], meaning: "減少", mnemonic: "諧音「里丟死」，把垃圾往外丟，減少家裡垃圾。", emoji: "📉" },
        { id: 74, word: "scatter", segments: ["scat", "ter"], meaning: "分散 / 散開", mnemonic: "諧音「死蓋特」，死蓋特把大家分散開來了。", emoji: "🎆" },
        { id: 75, word: "silkworm", segments: ["silk", "worm"], meaning: "蠶", mnemonic: "絲綢 (silk) 蟲 (worm) 就是蠶寶寶。", emoji: "🐛" },
        { id: 76, word: "straight", segments: ["straight"], meaning: "直的", mnemonic: "諧音「死墜特」，直直地死命墜落。", emoji: "📏" },
        { id: 77, word: "tangle", segments: ["tan", "gle"], meaning: "糾纏", mnemonic: "諧音「探戈」，跳探戈的時候腳糾纏在一起。", emoji: "🧶" },
        { id: 78, word: "thigh", segments: ["thigh"], meaning: "大腿", mnemonic: "諧音「塞」，褲子太緊，大腿塞不進去。", emoji: "🦵" },
        { id: 79, word: "vapor", segments: ["va", "por"], meaning: "蒸氣", mnemonic: "諧音「飛婆」，會飛的婆婆變成蒸氣消失了。", emoji: "💨" },
        { id: 80, word: "wound", segments: ["wound"], meaning: "傷口", mnemonic: "諧音「問的」，不要問別人的傷口會痛嗎。", emoji: "🩹" }
      ]
    },
    {
      level: 9,
      theme: "海賊王 (One Piece)",
      story: "Sanji wants to capture a mink. He will conduct a tour. He makes a perfume with a good scent. He is a godfather to his friends. He will not let a murder happen. A private person joined him. He keeps his pants loose for oneself.",
      storyTranslation: "香吉士想要捕獲一隻水貂。他將進行一場巡遊。他製作了一款帶有香味的香水。他是朋友們的教父。他不會讓謀殺發生。一個私密的人加入了他們。為了他自己，他讓褲子保持寬鬆。",
      words: [
        { id: 81, word: "anew", segments: ["a", "new"], meaning: "重新", mnemonic: "一個 (a) 新的 (new) 開始就是重新。", emoji: "🔄" },
        { id: 82, word: "capture", segments: ["cap", "ture"], meaning: "捕捉", mnemonic: "諧音「蓋破車」，用蓋破車的帆布捕捉獵物。", emoji: "🕸️" },
        { id: 83, word: "conduct", segments: ["con", "duct"], meaning: "進行 / 指揮", mnemonic: "諧音「康達特」，康達特指揮了一場音樂會。", emoji: "🎼" },
        { id: 84, word: "fiber", segments: ["fi", "ber"], meaning: "纖維", mnemonic: "諧音「肥伯」，肥伯吃了好多富含纖維的地瓜。", emoji: "🌾" },
        { id: 85, word: "godfather", segments: ["god", "fa", "ther"], meaning: "教父", mnemonic: "神 (god) 一樣的父親 (father)。", emoji: "🎩" },
        { id: 86, word: "joined", segments: ["joined"], meaning: "加入", mnemonic: "諧音「九音」，他加入了九音合唱團。", emoji: "➕" },
        { id: 87, word: "loose", segments: ["loose"], meaning: "鬆的", mnemonic: "諧音「魯蛇」，魯蛇穿著鬆鬆垮垮的衣服。", emoji: "👖" },
        { id: 88, word: "mink", segments: ["mink"], meaning: "水貂", mnemonic: "諧音「明克」，明克買了一件水貂皮草。", emoji: "🦦" },
        { id: 89, word: "murder", segments: ["mur", "der"], meaning: "謀殺", mnemonic: "諧音「馬的」，馬的！發生謀殺案了！", emoji: "🔪" },
        { id: 90, word: "oneself", segments: ["one", "self"], meaning: "自己", mnemonic: "一個人 (one) 自己 (self)。", emoji: "👤" }
      ]
    },
    {
      level: 10,
      theme: "鬼滅之刃 (Demon Slayer)",
      story: "Tengen wants his team to skyrocket in power. He gives a regular task. They climb a sturdy zigzag wall. They carry a volume of weapons. They use a private scent to find the enemy anew.",
      storyTranslation: "音柱宇髓天元想要他的隊伍力量猛漲。他給了一個常規的任務。他們爬上一堵堅固的之字形牆。他們攜帶了大量的武器。他們重新使用私密的氣味來尋找敵人。",
      words: [
        { id: 91, word: "perfume", segments: ["per", "fume"], meaning: "香水", mnemonic: "諧音「潑糞」，千萬別把香水噴得像潑糞一樣濃！", emoji: "🧴" },
        { id: 92, word: "private", segments: ["pri", "vate"], meaning: "私人的", mnemonic: "諧音「普來維特」，普來維特上等兵有私人的秘密。", emoji: "🔒" },
        { id: 93, word: "regular", segments: ["reg", "u", "lar"], meaning: "規律的 / 常規的", mnemonic: "諧音「雷古拉」，雷古拉怪獸會規律地出現。", emoji: "📅" },
        { id: 94, word: "scent", segments: ["scent"], meaning: "氣味 / 香味", mnemonic: "諧音「仙特」，神仙特別香的氣味。", emoji: "👃" },
        { id: 95, word: "skyrocket", segments: ["sky", "rock", "et"], meaning: "飛漲 / 猛升", mnemonic: "像天空 (sky) 中的火箭 (rocket) 一樣一飛衝天。", emoji: "🚀" },
        { id: 96, word: "sturdy", segments: ["stur", "dy"], meaning: "堅固的", mnemonic: "諧音「死特弟」，特弟雖然死了但意志很堅固。", emoji: "🧱" },
        { id: 97, word: "task", segments: ["task"], meaning: "任務", mnemonic: "諧音「踏死克」，任務是踏死克隆人。", emoji: "📋" },
        { id: 98, word: "tour", segments: ["tour"], meaning: "旅遊", mnemonic: "諧音「兔兒」，帶著兔兒去旅遊。", emoji: "🧳" },
        { id: 99, word: "volume", segments: ["vol", "ume"], meaning: "音量 / 體積", mnemonic: "諧音「哇林」，哇！林子裡的音量好大！", emoji: "🔊" },
        { id: 100, word: "zigzag", segments: ["zig", "zag"], meaning: "之字形", mnemonic: "諧音「機個扎格」，機車扎進了之字形的巷子。", emoji: "⚡" }
      ]
    }
  ];
