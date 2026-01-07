// 游戏配置数据

const CONFIG = {
    // 游戏基础设置 v1.4 季度制
    TOTAL_QUARTERS: 16,
    INITIAL_ENERGY: 100,
    INITIAL_SANITY: 80,
    MAX_SANITY: 100,
    LOW_SANITY_THRESHOLD: 20,
    
    // v1.4 心态自然衰减（统一30/季度）
    SANITY_DECAY: 30,
    
    // v1.4 基础生活开销（每季度）
    QUARTERLY_EXPENSE: 2400,
    // v1.4 枯燥惩罚（当季度无娱乐消费）
    BOREDOM_PENALTY: 20,
    
    // v1.4 奖学金配置
    SCHOLARSHIP: {
        checkQuarters: [4, 8, 12],  // Q4/Q8/Q12检查
        gpaThreshold: 3.8,
        amount: 8000
    },
    
    // v1.4 智商奇遇配置
    IQ_EVENTS: {
        competition: {
            triggerQuarters: [5, 6, 7, 8],  // 大二
            iqThreshold: 80,
            projectBonus: 100,
            name: 'ACM/数学建模获奖'
        },
        mentorReferral: {
            triggerChance: 0.05,  // 包装项目时5%概率
            iqThreshold: 85,
            reward: 'T1免笔试面试券'
        }
    },
    
    // v1.3 地理标签配置（数值调整）
    GEOGRAPHY: {
        'near': {
            name: '同城-近距离',
            icon: '🏠',
            probability: 0.4,
            energyPenalty: 0,
            sanityPenalty: 0,
            rentCost: 0,
            description: '通勤方便，无额外开销'
        },
        'far': {
            name: '同城-远距离',
            icon: '🚌',
            probability: 0.3,
            energyPenalty: 20,   // 精力上限-20
            sanityPenalty: 10,   // 心态-10/月
            rentCost: 0,
            rentOption: 2000,
            description: '通勤折磨，精力-20，心态-10/月'
        },
        'remote': {
            name: '异地',
            icon: '✈️',
            probability: 0.3,
            energyPenalty: 0,
            sanityPenalty: 0,
            rentCost: [1500, 3500],  // 调整为1500-3500
            description: '必须租房(1500-3500元/月)'
        }
    },
    
    // v1.3 岗位类型配置
    JOB_TYPES: {
        'core_dev': { name: '核心研发', salaryModifier: 1.2 },
        'algorithm': { name: '算法岗', salaryModifier: 1.2 },
        'frontend': { name: '前端开发', salaryModifier: 1.0 },
        'backend': { name: '后端开发', salaryModifier: 1.05 },
        'test': { name: '测试开发', salaryModifier: 0.95 },
        'operation': { name: '运营', salaryModifier: 0.9 },
        'product': { name: '产品', salaryModifier: 0.95 }
    },
    
    // v1.4 阶段划分（季度制）
    PHASES: {
        ACCUMULATE: { start: 1, end: 8, name: '大一大二', icon: '📚' },
        INTERNSHIP: { start: 9, end: 12, name: '大三', icon: '💼' },
        DECISION: { start: 13, end: 16, name: '大四', icon: '🎯' }
    },
    
    // 学校背景配置（实名化 + 隐藏特性）
    SCHOOLS: {
        'Top2': {
            name: 'Top2',
            displayName: '清北/Top2',
            iqRange: [90, 100],
            gpaRange: [3.7, 3.95],
            projectRange: [25, 55],
            knowledgeRange: [35, 65],
            softskillRange: [25, 45],
            resumePassRate: 0.95,
            iqMultiplier: 1.5,
            pressureBonus: 10,
            hiddenTrait: '天才光环：经验获取1.5x',
            representatives: ['清华大学', '北京大学']
        },
        '985': {
            name: '985',
            displayName: '985高校',
            iqRange: [75, 90],
            gpaRange: [3.5, 3.8],
            projectRange: [15, 45],
            knowledgeRange: [25, 55],
            softskillRange: [18, 38],
            resumePassRate: 0.85,
            iqMultiplier: 1.2,
            pressureBonus: 5,
            hiddenTrait: '名校背书：面试初始压力降低',
            representatives: ['复旦大学', '上海交通大学', '浙江大学', '南京大学', '中国科学技术大学', '哈尔滨工业大学', '西安交通大学', '北京航空航天大学', '同济大学', '中山大学']
        },
        '211': {
            name: '211',
            displayName: '211高校',
            iqRange: [55, 75],
            gpaRange: [3.3, 3.6],
            projectRange: [8, 30],
            knowledgeRange: [15, 45],
            softskillRange: [12, 32],
            resumePassRate: 0.65,
            iqMultiplier: 1.0,
            pressureBonus: 0,
            hiddenTrait: '稳扎稳打：无额外加成',
            representatives: ['北京邮电大学', '西安电子科技大学', '华东师范大学', '暨南大学', '武汉理工大学', '苏州大学', '中央财经大学', '北京交通大学']
        },
        '双非': {
            name: '双非',
            displayName: '双非一本',
            iqRange: [40, 65],
            gpaRange: [3.2, 3.5],
            projectRange: [0, 22],
            knowledgeRange: [10, 32],
            softskillRange: [5, 25],
            resumePassRate: 0.45,
            iqMultiplier: 0.95,
            pressureBonus: 0,
            hiddenTrait: '凡人剧本：需要付出更多努力',
            representatives: ['深圳大学', '杭州电子科技大学', '重庆邮电大学', '广州工业大学', '燕山大学', '某省理工大学']
        },
        '民办': {
            name: '民办',
            displayName: '民办/专升本',
            iqRange: [30, 55],
            gpaRange: [3.0, 3.4],
            projectRange: [0, 15],
            knowledgeRange: [5, 25],
            softskillRange: [0, 20],
            resumePassRate: 0.25,
            iqMultiplier: 0.9,
            pressureBonus: -5,
            hiddenTrait: '地狱模式：简历极易被挂',
            representatives: ['三亚学院', '某大学城市学院', '某职业技术大学']
        }
    },
    
    // 家庭背景配置
    FAMILIES: {
        '富二代': {
            name: '富二代',
            buff: '初始5万 / 季补2.4万',
            sanityRecoveryBonus: 0.5,
            energyBonus: 0,
            softskillBonus: 0,
            initialMoney: 50000,
            quarterlyAllowance: 24000,
            luxuryAccess: true,
            specialEvent: null,
            description: '钞能力：心态修复更快，可解锁奢靡生活'
        },
        '中产家庭': {
            name: '中产家庭',
            buff: '初始5000 / 季补7500',
            sanityRecoveryBonus: 0,
            energyBonus: 0,
            softskillBonus: 20,
            initialMoney: 5000,
            quarterlyAllowance: 7500,
            luxuryAccess: false,
            specialEvent: null,
            description: '素质教育：初始软技能+20'
        },
        '互联网世家': {
            name: '互联网世家',
            buff: '初始1万 / 季补9000 / 内推机会',
            sanityRecoveryBonus: 0,
            energyBonus: 0,
            softskillBonus: 0,
            initialMoney: 10000,
            quarterlyAllowance: 9000,
            luxuryAccess: false,
            specialEvent: { type: 'referral', chance: 0.3, triggerQuarter: 9 },
            description: '人脉：大三有机会拿到T1内推'
        },
        '工薪阶层': {
            name: '工薪阶层',
            buff: '初始1000 / 季补3600',
            sanityRecoveryBonus: 0,
            energyBonus: 20,
            softskillBonus: 0,
            initialMoney: 1000,
            quarterlyAllowance: 3600,
            luxuryAccess: false,
            quarterlyGap: 1200,
            specialEvent: null,
            description: '早当家：精力上限120，但每季度有1200缺口'
        }
    },
    
    // 阶段提示
    PHASE_TIPS: {
        ACCUMULATE: [
            '📖 专注提升GPA，为保研打基础',
            '💻 学习编程基础，积累项目经验',
            '📚 开始接触八股文，打好基础',
            '🎯 这个阶段无法投简历，好好积累'
        ],
        INTERNSHIP: [
            '💼 可以开始投递实习简历了！',
            '🏢 争取大厂实习，为简历镀金',
            '⚠️ 实习会跳过3个月时间',
            '📊 项目能力和八股分很重要'
        ],
        DECISION: [
            '🎯 秋招冲刺或考研上岸，二选一',
            '📝 可以开始图书馆考研复习',
            '💼 全力投递，争取拿到offer',
            '⚠️ 心态很重要，保持状态！'
        ]
    }
};

// v1.4 行动配置（季度制）
const ACTIONS = {
    // 基础行动（全阶段可用）
    study: {
        id: 'study',
        name: '📖 专注学业',
        description: '认真听课完成作业，GPA+0.2，心态-5',
        energyCost: 30,
        effects: {
            gpa: { base: 0.2, variance: 0.02 },
            sanity: { base: -5, variance: 1 }
        },
        available: () => true
    },
    running: {
        id: 'running',
        name: '🏃 操场跑步',
        description: '操场拉练回血，穷学生必备',
        energyCost: 20,
        effects: {
            sanity: { base: 15, variance: 3 }
        },
        available: () => true
    },
    clubActivity: {
        id: 'clubActivity',
        name: '🎭 社团活动',
        description: '社团/聚餐，软技能+8，心态+20（-200元）',
        energyCost: 30,
        moneyCost: 200,
        effects: {
            sanity: { base: 20, variance: 4 },
            softskill: { base: 8, variance: 2 }
        },
        available: (game) => game.character.money >= 200
    },
    coding: {
        id: 'coding',
        name: '💻 包装项目',
        description: '包装履历换项目，牺牲成绩和心态',
        energyCost: 50,
        effects: {
            project: { base: 25, variance: 5 },
            gpa: { base: -0.3, variance: 0.05 },
            sanity: { base: -15, variance: 3 }
        },
        available: () => true
    },
    readBooks: {
        id: 'readBooks',
        name: '📚 闭关刷题',
        description: '枯燥八股+15，心态-10',
        energyCost: 30,
        effects: {
            knowledge: { base: 15, variance: 4 },
            sanity: { base: -10, variance: 2 }
        },
        available: () => true
    },
    workStudy: {
        id: 'workStudy',
        name: '🧾 勤工俭学',
        description: '校园打工填补缺口，软技能+2，金钱+1200',
        energyCost: 30,
        moneyGain: 1200,
        effects: {
            softskill: { base: 2, variance: 1 },
            sanity: { base: -10, variance: 2 }
        },
        available: () => true
    },
    hardWork: {
        id: 'hardWork',
        name: '💪 疯狂打工',
        description: '拼命赚钱，金钱+3000，GPA-0.4，心态-40',
        energyCost: 50,
        effects: {
            gpa: { base: -0.4, variance: 0 },
            sanity: { base: -40, variance: 5 }
        },
        moneyGain: 3000,
        available: () => true
    },
    civilService: {
        id: 'civilService',
        name: '📋 公考备考',
        description: '大四备考公考，公考积累+15，心态-10（Q13解锁）',
        energyCost: 30,
        effects: {
            civilServiceRate: { base: 15, variance: 0 },
            sanity: { base: -10, variance: 2 }
        },
        available: (game) => game.currentQuarter >= 13
    },
    sleepSettle: {
        id: 'sleepSettle',
        name: '😴 【结算】宿舍摆烂',
        description: '进入下季度，精力回满，心态+10',
        energyCost: 0,
        moneyCost: 0,
        effects: {
            sanity: { base: 10, variance: 2 }
        },
        restoreEnergy: true,
        endQuarter: true,
        isEntertainment: false,
        available: () => true
    },
    gatheringSettle: {
        id: 'gatheringSettle',
        name: '🍲 【结算】聚餐娱乐',
        description: '花200元和朋友聚餐，心态+40',
        energyCost: 0,
        moneyCost: 200,
        effects: {
            sanity: { base: 40, variance: 4 }
        },
        restoreEnergy: true,
        endQuarter: true,
        isEntertainment: true,
        available: (game) => game.character.money >= 200
    },
    travelSettle: {
        id: 'travelSettle',
        name: '🎒 【结算】特种兵旅游',
        description: '1500元特种兵旅行，心态+80',
        energyCost: 0,
        moneyCost: 1500,
        effects: {
            sanity: { base: 80, variance: 6 }
        },
        restoreEnergy: true,
        endQuarter: true,
        isEntertainment: true,
        available: (game) => game.character.money >= 1500
    },
    luxurySettle: {
        id: 'luxurySettle',
        name: '💎 【结算】奢靡生活',
        description: '5000元豪华消费，心态回满（富二代限定）',
        energyCost: 0,
        moneyCost: 5000,
        fillSanity: true,
        restoreEnergy: true,
        endQuarter: true,
        isEntertainment: true,
        available: (game) => {
            const family = game.character.getFamilyConfig?.();
            return game.character.money >= 5000 && family?.luxuryAccess;
        }
    },
    project: {
        id: 'project',
        name: '🔧 做大项目',
        description: '参与实验室项目或比赛',
        energyCost: 30,
        effects: {
            project: { base: 15, variance: 8 },
            softskill: { base: 3, variance: 2 },
            gpa: { base: -0.1, variance: 0 }
        },
        resumeChance: 0.2,
        resumeItems: ['🏆 项目/比赛经历', '📱 独立作品'],
        available: () => true
    },
    
    // 实习期行动（大三Q9解锁）
    applyInternship: {
        id: 'applyInternship',
        name: '📝 投递实习',
        description: '海投简历，争取面试机会',
        energyCost: 25,
        effects: {},
        triggerInterview: true,
        interviewType: 'internship',
        available: (game) => game.currentQuarter >= 9
    },
    goInternship: {
        id: 'goInternship',
        name: '🏢 去实习',
        description: '加入公司实习（跳过1季度）',
        energyCost: 0,
        effects: {
            project: { base: 40, variance: 20 },
            softskill: { base: 15, variance: 10 }
        },
        skipQuarters: 1,
        requireOffer: 'internship',
        resumeItem: '💼 大厂实习经历',
        available: (game) => game.currentQuarter >= 9 && game.hasInternshipOffer
    },
    
    // 抉择期行动（大四Q13解锁）
    applyJob: {
        id: 'applyJob',
        name: '💼 秋招投递',
        description: '投递正式工作岗位',
        energyCost: 25,
        effects: {},
        triggerInterview: true,
        interviewType: 'fulltime',
        available: (game) => game.currentQuarter >= 13
    },
    prepareGraduate: {
        id: 'prepareGraduate',
        name: '📚 图书馆考研',
        description: '全力备战考研',
        energyCost: 30,
        effects: {
            knowledge: { base: 15, variance: 8 },
            gpa: { base: 0.01, variance: 0.005 }
        },
        sanityDrain: 5,
        available: (game) => game.currentQuarter >= 13
    }
};

// 面试标签与策略
const INTERVIEW_TAGS = {
    fundamentals: { label: '底层原理', icon: '🧠' },
    practical: { label: '高并发/实战', icon: '⚔️' },
    stress: { label: '抗压测试', icon: '🧘' }
};

const INTERVIEW_TAG_MAP = {
    technical: 'fundamentals',
    project: 'practical',
    hr: 'stress'
};

const INTERVIEW_STRATEGIES = {
    shield: {
        id: 'shield',
        name: '🛡️ 八股盾牌',
        description: '用八股硬刚底层原理，稳扎稳打',
        stat: 'knowledge',
        counterTag: 'fundamentals',
        baseSuccess: 0.6,
        statScale: 120,
        successPressure: -30,
        failPressure: 18,
        mismatchPenalty: 0.15
    },
    strike: {
        id: 'strike',
        name: '⚔️ 项目重击',
        description: '用实战经历强攻，风险高收益也高',
        stat: 'project',
        counterTag: 'practical',
        baseSuccess: 0.5,
        statScale: 150,
        successPressure: -40,
        failPressure: 25,
        mismatchPenalty: 0.2
    },
    talk: {
        id: 'talk',
        name: '🤝 舔狗话术',
        description: '情绪价值拉满，适合HR/抗压场景',
        stat: 'softskill',
        counterTag: 'stress',
        baseSuccess: 0.55,
        statScale: 100,
        successPressure: -20,
        failPressure: 28,
        mismatchPenalty: 0.1
    }
};

// 面试题库
const INTERVIEW_QUESTIONS = {
    // 技术面试题（考察八股分）
    technical: [
        {
            question: '请解释一下什么是闭包(Closure)？',
            options: [
                { text: '一种数据结构', correct: false },
                { text: '函数和其词法环境的组合，能访问外部作用域变量', correct: true },
                { text: '一种设计模式', correct: false },
                { text: '我不太清楚...', correct: false }
            ],
            difficulty: 1,
            statRequired: 'knowledge',
            threshold: 50
        },
        {
            question: 'HTTP和HTTPS的区别是什么？',
            options: [
                { text: 'HTTPS更快', correct: false },
                { text: 'HTTPS通过SSL/TLS加密传输，更安全', correct: true },
                { text: '没有区别，只是写法不同', correct: false },
                { text: 'HTTP是新版本', correct: false }
            ],
            difficulty: 1,
            statRequired: 'knowledge',
            threshold: 40
        },
        {
            question: '请解释一下数据库索引的原理？',
            options: [
                { text: '索引就是把所有数据复制一份', correct: false },
                { text: '通过B+树等数据结构加速查询，空间换时间', correct: true },
                { text: '索引会让查询变慢', correct: false },
                { text: '每个表只能有一个索引', correct: false }
            ],
            difficulty: 2,
            statRequired: 'knowledge',
            threshold: 100
        },
        {
            question: 'TCP三次握手的过程是？',
            options: [
                { text: 'SYN -> ACK -> FIN', correct: false },
                { text: 'SYN -> SYN+ACK -> ACK', correct: true },
                { text: '直接发送数据就行', correct: false },
                { text: '这个我背过但忘了...', correct: false }
            ],
            difficulty: 1,
            statRequired: 'knowledge',
            threshold: 60
        },
        {
            question: '什么是死锁？如何避免？',
            options: [
                { text: '程序卡死了，重启电脑', correct: false },
                { text: '多个进程互相等待对方资源，可通过资源排序、超时等机制避免', correct: true },
                { text: '死锁是好事，说明程序很安全', correct: false },
                { text: '只用单线程就不会死锁', correct: false }
            ],
            difficulty: 2,
            statRequired: 'knowledge',
            threshold: 120
        },
        {
            question: 'Redis为什么这么快？',
            options: [
                { text: '因为它是红色的(Red)', correct: false },
                { text: '基于内存、单线程避免锁、IO多路复用、高效数据结构', correct: true },
                { text: '因为服务器配置高', correct: false },
                { text: 'Redis其实不快', correct: false }
            ],
            difficulty: 2,
            statRequired: 'knowledge',
            threshold: 150
        },
        {
            question: '请解释CAP理论？',
            options: [
                { text: '帽子理论，戴帽子的人更聪明', correct: false },
                { text: '分布式系统中一致性、可用性、分区容错性三者最多只能同时满足两个', correct: true },
                { text: 'CPU、APU、GPU三种处理器', correct: false },
                { text: '这是经济学理论', correct: false }
            ],
            difficulty: 3,
            statRequired: 'knowledge',
            threshold: 200
        },
        {
            question: 'JVM垃圾回收机制了解吗？',
            options: [
                { text: '就是删除没用的文件', correct: false },
                { text: '通过可达性分析标记存活对象，使用各种GC算法回收内存', correct: true },
                { text: 'Java不需要垃圾回收', correct: false },
                { text: '手动调用System.gc()就行', correct: false }
            ],
            difficulty: 2,
            statRequired: 'knowledge',
            threshold: 180
        }
    ],
    
    // 项目面试题（考察项目能力）
    project: [
        {
            question: '介绍一下你做过的最有挑战的项目？',
            options: [
                { text: '我做过一个计算器...', correct: false },
                { text: '详细描述项目背景、技术选型、遇到的挑战和解决方案', correct: true },
                { text: '我主要是看别人做的', correct: false },
                { text: '我没做过项目', correct: false }
            ],
            difficulty: 1,
            statRequired: 'project',
            threshold: 50
        },
        {
            question: '你的项目中如何处理高并发问题？',
            options: [
                { text: '加机器就行了', correct: false },
                { text: '缓存、消息队列、负载均衡、数据库优化等多管齐下', correct: true },
                { text: '我们项目没有高并发', correct: false },
                { text: '不处理，让它崩', correct: false }
            ],
            difficulty: 2,
            statRequired: 'project',
            threshold: 150
        },
        {
            question: '项目中遇到过什么难题？怎么解决的？',
            options: [
                { text: '没遇到过难题，都很简单', correct: false },
                { text: '描述具体问题、排查思路、解决方案和收获', correct: true },
                { text: '遇到难题就百度', correct: false },
                { text: '让同事帮忙解决的', correct: false }
            ],
            difficulty: 1,
            statRequired: 'project',
            threshold: 80
        },
        {
            question: '你在项目中是什么角色？具体负责什么？',
            options: [
                { text: '我就是打杂的', correct: false },
                { text: '清晰说明职责、贡献、与团队的协作方式', correct: true },
                { text: '我是项目经理，不写代码', correct: false },
                { text: '我负责开会', correct: false }
            ],
            difficulty: 1,
            statRequired: 'project',
            threshold: 60
        },
        {
            question: '如何设计一个秒杀系统？',
            options: [
                { text: '直接写个循环扣库存', correct: false },
                { text: '限流削峰、缓存预热、异步处理、分布式锁等', correct: true },
                { text: '用Excel表格管理', correct: false },
                { text: '这个没学过...', correct: false }
            ],
            difficulty: 3,
            statRequired: 'project',
            threshold: 250
        }
    ],
    
    // HR面试题（考察软技能）
    hr: [
        {
            question: '你的职业规划是什么？',
            options: [
                { text: '先干几年就跳槽', correct: false },
                { text: '短期深耕技术，长期希望成为技术专家/管理者', correct: true },
                { text: '没想过，走一步看一步', correct: false },
                { text: '我想当老板', correct: false }
            ],
            difficulty: 1,
            statRequired: 'softskill',
            threshold: 30
        },
        {
            question: '为什么选择我们公司？',
            options: [
                { text: '因为你们给的钱多', correct: false },
                { text: '认同公司文化、看好业务方向、有成长空间', correct: true },
                { text: '随便投的，都行', correct: false },
                { text: '别的公司没要我', correct: false }
            ],
            difficulty: 1,
            statRequired: 'softskill',
            threshold: 40
        },
        {
            question: '你的期望薪资是多少？',
            options: [
                { text: '给多少都行', correct: false },
                { text: '根据市场行情和个人能力，期望XX-XX，但更看重成长机会', correct: true },
                { text: '越多越好，至少50k', correct: false },
                { text: '你们一般给多少？', correct: false }
            ],
            difficulty: 2,
            statRequired: 'softskill',
            threshold: 80
        },
        {
            question: '你最大的缺点是什么？',
            options: [
                { text: '我没有缺点', correct: false },
                { text: '我有时过于追求完美/专注细节，正在学习更好地平衡', correct: true },
                { text: '我太优秀了，同事都嫉妒我', correct: false },
                { text: '我比较懒，不爱加班', correct: false }
            ],
            difficulty: 1,
            statRequired: 'softskill',
            threshold: 50
        },
        {
            question: '能接受加班吗？',
            options: [
                { text: '坚决不加班', correct: false },
                { text: '项目需要时可以配合，但也注重效率和工作生活平衡', correct: true },
                { text: '996福报，007更好', correct: false },
                { text: '加班有加班费吗？', correct: false }
            ],
            difficulty: 1,
            statRequired: 'softskill',
            threshold: 60
        },
        {
            question: '和同事发生冲突怎么办？',
            options: [
                { text: '打一架', correct: false },
                { text: '理性沟通，换位思考，必要时寻求上级协调', correct: true },
                { text: '忍着不说', correct: false },
                { text: '直接离职', correct: false }
            ],
            difficulty: 2,
            statRequired: 'softskill',
            threshold: 100
        }
    ]
};
// 公司配置 (v1.3 日薪体系重构)
// T1大厂: 300-600元/天(含房补), T2中厂: 150-250元/天, T3小厂: 80-120元/天
const COMPANIES = {
    internship: [
        { name: '字节跳动', tier: 'T1', difficulty: 3, salaryRange: [400, 600], projectBonus: 50, resumeValue: '💼 字节实习', jobTypes: ['algorithm', 'backend', 'frontend'] },
        { name: '阿里巴巴', tier: 'T1', difficulty: 3, salaryRange: [350, 550], projectBonus: 45, resumeValue: '💼 阿里实习', jobTypes: ['backend', 'algorithm', 'product'] },
        { name: '腾讯', tier: 'T1', difficulty: 3, salaryRange: [380, 580], projectBonus: 48, resumeValue: '💼 腾讯实习', jobTypes: ['backend', 'frontend', 'core_dev'] },
        { name: '美团', tier: 'T1', difficulty: 2.8, salaryRange: [320, 480], projectBonus: 40, resumeValue: '💼 美团实习', jobTypes: ['backend', 'frontend', 'test'] },
        { name: '快手', tier: 'T1', difficulty: 2.8, salaryRange: [350, 500], projectBonus: 42, resumeValue: '💼 快手实习', jobTypes: ['algorithm', 'backend', 'frontend'] },
        { name: '小红书', tier: 'T2', difficulty: 2.2, salaryRange: [180, 250], projectBonus: 35, resumeValue: '💼 小红书实习', jobTypes: ['frontend', 'backend', 'operation'] },
        { name: '百度', tier: 'T2', difficulty: 2, salaryRange: [150, 220], projectBonus: 30, resumeValue: '💼 百度实习', jobTypes: ['backend', 'algorithm', 'test'] },
        { name: '网易', tier: 'T2', difficulty: 2, salaryRange: [160, 230], projectBonus: 32, resumeValue: '💼 网易实习', jobTypes: ['backend', 'frontend', 'product'] },
        { name: '某B轮公司', tier: 'T2', difficulty: 1.8, salaryRange: [150, 200], projectBonus: 28, resumeValue: '?? 独角兽实习', jobTypes: ['frontend', 'backend', 'operation'] },
        { name: '某创业公司', tier: 'T3', difficulty: 1.5, salaryRange: [80, 120], projectBonus: 20, resumeValue: '💼 创业公司实习', jobTypes: ['frontend', 'backend', 'test'] },
        { name: '某外包公司', tier: 'T3', difficulty: 1.2, salaryRange: [80, 100], projectBonus: 15, resumeValue: '?? 外包实习', jobTypes: ['test', 'operation', 'backend'] }
    ],
    fulltime: [
        { name: '字节跳动', tier: 'T1', difficulty: 3.5, salaryRange: [35, 55], projectBonus: 0, resumeValue: '🎉 字节Offer', jobTypes: ['algorithm', 'backend', 'frontend'] },
        { name: '阿里巴巴', tier: 'T1', difficulty: 3.5, salaryRange: [32, 50], projectBonus: 0, resumeValue: '🎉 阿里Offer', jobTypes: ['backend', 'algorithm', 'product'] },
        { name: '腾讯', tier: 'T1', difficulty: 3.5, salaryRange: [35, 52], projectBonus: 0, resumeValue: '🎉 腾讯Offer', jobTypes: ['backend', 'frontend', 'core_dev'] },
        { name: '华为', tier: 'T1', difficulty: 3, salaryRange: [28, 42], projectBonus: 0, resumeValue: '🎉 华为Offer', jobTypes: ['core_dev', 'backend', 'test'] },
        { name: '美团', tier: 'T1', difficulty: 3, salaryRange: [28, 40], projectBonus: 0, resumeValue: '🎉 美团Offer', jobTypes: ['backend', 'frontend', 'test'] },
        { name: '京东', tier: 'T2', difficulty: 2.5, salaryRange: [22, 32], projectBonus: 0, resumeValue: '🎉 京东Offer', jobTypes: ['backend', 'test', 'operation'] },
        { name: '小米', tier: 'T2', difficulty: 2.5, salaryRange: [20, 30], projectBonus: 0, resumeValue: '🎉 小米Offer', jobTypes: ['frontend', 'backend', 'product'] },
        { name: '百度', tier: 'T2', difficulty: 2.3, salaryRange: [22, 32], projectBonus: 0, resumeValue: '🎉 百度Offer', jobTypes: ['backend', 'algorithm', 'test'] },
        { name: '某中厂', tier: 'T2', difficulty: 2, salaryRange: [18, 26], projectBonus: 0, resumeValue: '🎉 中厂Offer', jobTypes: ['frontend', 'backend', 'test'] },
        { name: '某小厂', tier: 'T3', difficulty: 1.5, salaryRange: [12, 18], projectBonus: 0, resumeValue: '🎉 小厂Offer', jobTypes: ['frontend', 'backend', 'operation'] }
    ]
};

// 随机事件配置
const RANDOM_EVENTS = [
    // 正面事件
    {
        id: 'competition_win',
        title: '🏆 比赛获奖',
        description: '你参加的编程比赛获得了奖项！',
        probability: 0.08,
        condition: (game) => game.character.project >= 50,
        choices: [
            {
                text: '太棒了！继续努力',
                effects: { project: 20, softskill: 10, sanity: 10 },
                resumeItem: '🏆 编程比赛获奖'
            }
        ]
    },
    {
        id: 'scholarship',
        title: '?? 获得奖学金',
        description: '由于优异的成绩，你获得了奖学金！',
        probability: 0.1,
        condition: (game) => game.character.gpa >= 3.7,
        choices: [
            {
                text: '开心收下',
                effects: { sanity: 15, softskill: 5 },
                resumeItem: '🎓 奖学金获得者'
            }
        ]
    },
    {
        id: 'mentor_guidance',
        title: '👨‍🏫 大佬指点',
        description: '一位学长/业界大佬给了你宝贵的建议！',
        probability: 0.1,
        condition: () => true,
        choices: [
            {
                text: '虚心学习',
                effects: { knowledge: 15, project: 10 }
            }
        ]
    },
    {
        id: 'lucky_interview',
        title: '🍀 面试运气好',
        description: '上次面试的题目你刚好准备过！',
        probability: 0.05,
        condition: (game) => game.currentQuarter >= 9,
        choices: [
            {
                text: '运气也是实力',
                effects: { sanity: 10, knowledge: 5 }
            }
        ]
    },
    
    // 负面事件
    {
        id: 'exam_fail',
        title: '📉 挂科危机',
        description: '这门课的期末考试成绩不太理想...',
        probability: 0.1,
        condition: (game) => game.character.gpa < 3.5,
        choices: [
            {
                text: '努力补救',
                effects: { gpa: -0.1, sanity: -10 }
            },
            {
                text: '下学期再说',
                effects: { gpa: -0.15, sanity: -5 }
            }
        ]
    },
    {
        id: 'rejection_mail',
        title: '📧 拒信连击',
        description: '连续收到好几封拒信，心态有点崩...',
        probability: 0.15,
        condition: (game) => game.currentQuarter >= 9,
        choices: [
            {
                text: '调整心态，继续投',
                effects: { sanity: -15 }
            },
            {
                text: '休息一下再说',
                effects: { sanity: -5, energy: -20 }
            }
        ]
    },
    {
        id: 'peer_pressure',
        title: '😰 同辈压力',
        description: '看到同学都拿到大厂offer了，好焦虑...',
        probability: 0.12,
        condition: (game) => game.currentQuarter >= 11,
        choices: [
            {
                text: '化压力为动力',
                effects: { sanity: -10, knowledge: 5 }
            },
            {
                text: '焦虑到失眠',
                effects: { sanity: -20 }
            }
        ]
    },
    {
        id: 'project_bug',
        title: '🐞 项目出Bug',
        description: '你负责的模块出了严重bug，被老师/mentor批评了',
        probability: 0.1,
        condition: (game) => game.character.project >= 30,
        choices: [
            {
                text: '认真修复，吸取教训',
                effects: { project: 5, sanity: -10 }
            },
            {
                text: '甩锅给队友',
                effects: { softskill: -10, sanity: -5 }
            }
        ]
    },
    {
        id: 'health_issue',
        title: '🤒 身体不适',
        description: '熬夜太多，身体出了点问题...',
        probability: 0.08,
        condition: (game) => game.character.sanity < 50,
        choices: [
            {
                text: '去医院检查，好好休息',
                effects: { sanity: 10, energy: -30 }
            },
            {
                text: '硬撑着继续',
                effects: { sanity: -15 }
            }
        ]
    },
    {
        id: 'imposter_syndrome',
        title: '😔 冒名顶替综合征',
        description: '感觉自己什么都不会，配不上现在的一切...',
        probability: 0.1,
        condition: (game) => game.currentQuarter >= 7,
        choices: [
            {
                text: '和朋友聊聊，调整心态',
                effects: { sanity: -5, softskill: 5 }
            },
            {
                text: '独自消化',
                effects: { sanity: -15 }
            }
        ]
    },
    
    // 特殊事件
    {
        id: 'family_referral',
        title: '🤝 亲戚内推',
        description: '家里有亲戚在大厂工作，愿意帮你内推！',
        probability: 0,  // 由家庭背景触发
        condition: (game) => game.character.familyType === '互联网世家' && game.currentQuarter >= 9,
        choices: [
            {
                text: '感谢亲戚，认真准备',
                effects: { sanity: 10 },
                grantInternshipOffer: true,
                internshipCompany: {
                    name: '字节亲戚事业群',
                    tier: 'T1',
                    dailySalary: 500,
                    difficulty: 3,
                    resumeValue: '🏢 T1 内推',
                    projectBonus: 50,
                    jobTypes: ['core_dev', 'backend'],
                    geography: 'near'
                }
            }
        ],
        isSpecial: true
    },
    {
        id: '保研机会',
        title: '🎓 保研资格',
        description: '由于成绩优异，你获得了保研资格！',
        probability: 0,  // 条件触发
        condition: (game) => game.character.gpa >= 3.8 && game.currentQuarter === 12,
        choices: [
            {
                text: '接受保研，继续深造',
                effects: { sanity: 20 },
                setEnding: 'postgraduate'
            },
            {
                text: '放弃保研，选择工作',
                effects: { sanity: 5 }
            }
        ],
        isSpecial: true,
        forceShow: true
    }
];

// v1.4 结局配置（新增多元化结局）
const ENDINGS = {
    // 工作结局
    'offer_t1': {
        title: '🎉 大厂Offer收割机',
        icon: '🏆',
        description: '恭喜你！成功拿到顶级大厂的offer，成为众人羡慕的对象。四年的努力没有白费，你用实力证明了自己。',
        requirement: '拿到T1大厂正式offer'
    },
    'offer_t2': {
        title: '💼 稳稳的幸福',
        icon: '😊',
        description: '虽然没进最顶级的公司，但你找到了一份不错的工作。工作生活平衡，也挺好的。',
        requirement: '拿到T2及以下公司offer'
    },
    'offer_t3': {
        title: '🌱 星星之火',
        icon: '🔥',
        description: '进了一家小公司/创业公司，虽然平台小了点，但机会也许更多。一切才刚开始！',
        requirement: '拿到小厂/创业公司offer'
    },
    
    // 考研结局
    'postgraduate_success': {
        title: '📚 学术新星',
        icon: '🎓',
        description: '考研成功上岸！继续在学术道路上探索，也许下一个图灵奖得主就是你。',
        requirement: '考研成功'
    },
    'postgraduate': {
        title: '🎓 保研上岸',
        icon: '📖',
        description: '凭借优异的成绩获得保研资格，直升研究生。学霸的人生就是这么朴实无华。',
        requirement: '获得保研资格'
    },
    
    // v1.4 新增多元化结局
    'kol': {
        title: '📱 网红KOL',
        icon: '🌟',
        description: '凭借出色的软技能和资金积累，你成为了一名成功的网红博主，粉丝百万！',
        requirement: '软技能>800且金钱>50000',
        condition: (game) => game.character.softskill > 800 && game.character.money > 50000
    },
    'civil_servant': {
        title: '🏛️ 上岸公务员',
        icon: '📋',
        description: '经过多次努力，你终于成功考上公务员，捧起了铁饭碗。稳定就是幸福！',
        requirement: '公考次数>=3且通过',
        condition: (game) => game.civilServiceAttempts >= 3 && game.civilServicePassed
    },
    'gap_year': {
        title: '🌍 Gap Year',
        icon: '✈️',
        description: '虽然没有offer也没考研，但你心态超好！决定给自己一年时间去看看世界，人生不只有工作。',
        requirement: '无offer无考研但心态>90',
        condition: (game) => !game.hasOffer && !game.postgraduateSuccess && game.character.sanity > 90
    },
    'overwork_death': {
        title: '💀 过劳猝死',
        icon: '☠️',
        description: '过度的压力和连续的崩溃摧毁了你的身体。记住：没有什么比健康更重要。',
        requirement: '崩溃次数>=2',
        condition: (game) => game.breakdownCount >= 2
    },
    
    // 失败结局
    'graduate_unemployed': {
        title: '😢 毕业即失业',
        icon: '📦',
        description: '四年时间转瞬即逝，却没能找到心仪的工作。但人生还长，机会还有，调整心态重新出发吧。',
        requirement: '未能获得任何offer'
    },
    'dropout': {
        title: '📉 延毕/退学',
        icon: '💔',
        description: 'GPA太低，面临延毕甚至退学的风险。大学生活以一种意想不到的方式结束了...',
        requirement: 'GPA低于2.0'
    },
    'mental_breakdown': {
        title: '🏥 身心俱疲',
        icon: '😵',
        description: '过度的压力和焦虑压垮了你。记住，身心健康永远是第一位的。',
        requirement: '心态归零'
    }
};
