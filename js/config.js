// 游戏配置数据

const CONFIG = {
    // 游戏基础设置
    TOTAL_MONTHS: 48,
    INITIAL_ENERGY: 100,
    INITIAL_SANITY: 80,
    MAX_SANITY: 100,
    LOW_SANITY_THRESHOLD: 20,
    
    // 阶段划分
    PHASES: {
        ACCUMULATE: { start: 1, end: 24, name: '积累期', icon: '📚' },
        INTERNSHIP: { start: 25, end: 36, name: '实习期', icon: '💼' },
        DECISION: { start: 37, end: 48, name: '抉择期', icon: '🎯' }
    },
    
    // 学校背景配置
    SCHOOLS: {
        'Top2': {
            name: 'Top2',
            displayName: '清北/Top2',
            iqRange: [85, 100],
            gpaRange: [3.6, 3.9],
            projectRange: [20, 50],
            knowledgeRange: [30, 60],
            softskillRange: [20, 40],
            resumePassRate: 0.95,
            description: '天之骄子，简历自带光环'
        },
        '985': {
            name: '985',
            displayName: '985高校',
            iqRange: [70, 90],
            gpaRange: [3.4, 3.7],
            projectRange: [10, 40],
            knowledgeRange: [20, 50],
            softskillRange: [15, 35],
            resumePassRate: 0.80,
            description: '名校出身，竞争力强'
        },
        '211': {
            name: '211',
            displayName: '211高校',
            iqRange: [55, 75],
            gpaRange: [3.3, 3.6],
            projectRange: [5, 30],
            knowledgeRange: [15, 40],
            softskillRange: [10, 30],
            resumePassRate: 0.60,
            description: '中坚力量，需要努力证明'
        },
        '双非': {
            name: '双非',
            displayName: '双非一本',
            iqRange: [40, 65],
            gpaRange: [3.2, 3.5],
            projectRange: [0, 20],
            knowledgeRange: [10, 30],
            softskillRange: [5, 25],
            resumePassRate: 0.40,
            description: '简历海投，努力改命'
        },
        '民办': {
            name: '民办',
            displayName: '民办/专升本',
            iqRange: [30, 55],
            gpaRange: [3.0, 3.4],
            projectRange: [0, 15],
            knowledgeRange: [5, 25],
            softskillRange: [0, 20],
            resumePassRate: 0.20,
            description: '困难模式，逆天改命'
        }
    },
    
    // 家庭背景配置
    FAMILIES: {
        '富二代': {
            name: '富二代',
            buff: '心态恢复速度 +50%',
            sanityRecoveryBonus: 0.5,
            energyBonus: 0,
            softskillBonus: 0,
            specialEvent: null,
            description: '家里有矿，心态稳定'
        },
        '中产家庭': {
            name: '中产家庭',
            buff: '初始软技能 +10',
            sanityRecoveryBonus: 0,
            energyBonus: 0,
            softskillBonus: 10,
            specialEvent: null,
            description: '见过世面，情商在线'
        },
        '互联网世家': {
            name: '互联网世家',
            buff: '大三30%概率触发内推',
            sanityRecoveryBonus: 0,
            energyBonus: 0,
            softskillBonus: 0,
            specialEvent: { type: 'referral', chance: 0.3, triggerMonth: 25 },
            description: '人脉资源，内推机会'
        },
        '工薪阶层': {
            name: '工薪阶层',
            buff: '精力上限 +20',
            sanityRecoveryBonus: 0,
            energyBonus: 20,
            softskillBonus: 0,
            specialEvent: null,
            description: '吃苦耐劳，更能肝'
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

// 行动配置
const ACTIONS = {
    // 基础行动（全阶段可用）
    study: {
        id: 'study',
        name: '📖 上课学习',
        description: '认真听课，完成作业',
        energyCost: 20,
        effects: {
            gpa: { base: 0.02, variance: 0.01 },
            knowledge: { base: 3, variance: 2 }
        },
        available: () => true
    },
    coding: {
        id: 'coding',
        name: '💻 写代码练习',
        description: '刷LeetCode或做小项目',
        energyCost: 25,
        effects: {
            project: { base: 8, variance: 4 },
            knowledge: { base: 2, variance: 2 }
        },
        available: () => true
    },
    readBooks: {
        id: 'readBooks',
        name: '📚 刷八股文',
        description: '背诵面试八股，应对技术面',
        energyCost: 25,
        effects: {
            knowledge: { base: 10, variance: 5 }
        },
        available: () => true
    },
    socializing: {
        id: 'socializing',
        name: '🗣️ 社交活动',
        description: '参加社团、聚会，锻炼软技能',
        energyCost: 20,
        effects: {
            softskill: { base: 8, variance: 4 },
            sanity: { base: 5, variance: 3 }
        },
        available: () => true
    },
    rest: {
        id: 'rest',
        name: '😴 休息放松',
        description: '打游戏、追剧、睡觉',
        energyCost: 15,
        effects: {
            sanity: { base: 15, variance: 5 }
        },
        available: () => true
    },
    project: {
        id: 'project',
        name: '🔧 做大项目',
        description: '参与实验室项目或比赛',
        energyCost: 30,
        effects: {
            project: { base: 15, variance: 8 },
            softskill: { base: 3, variance: 2 }
        },
        resumeChance: 0.2,
        resumeItems: ['🏆 项目/比赛经历', '📱 独立作品'],
        available: () => true
    },
    
    // 实习期行动（大三解锁）
    applyInternship: {
        id: 'applyInternship',
        name: '📝 投递实习',
        description: '海投简历，争取面试机会',
        energyCost: 25,
        effects: {},
        triggerInterview: true,
        interviewType: 'internship',
        available: (game) => game.currentMonth >= 25
    },
    goInternship: {
        id: 'goInternship',
        name: '🏢 去实习',
        description: '加入公司实习（跳过3个月）',
        energyCost: 0,
        effects: {
            project: { base: 40, variance: 20 },
            softskill: { base: 15, variance: 10 }
        },
        skipMonths: 3,
        requireOffer: 'internship',
        resumeItem: '💼 大厂实习经历',
        available: (game) => game.currentMonth >= 25 && game.hasInternshipOffer
    },
    
    // 抉择期行动（大四解锁）
    applyJob: {
        id: 'applyJob',
        name: '💼 秋招投递',
        description: '投递正式工作岗位',
        energyCost: 25,
        effects: {},
        triggerInterview: true,
        interviewType: 'fulltime',
        available: (game) => game.currentMonth >= 37
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
        available: (game) => game.currentMonth >= 37
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

// 公司配置
const COMPANIES = {
    internship: [
        { name: '字节跳动', tier: 'T1', difficulty: 3, salaryRange: [400, 600], projectBonus: 50, resumeValue: '💼 字节实习' },
        { name: '阿里巴巴', tier: 'T1', difficulty: 3, salaryRange: [350, 550], projectBonus: 45, resumeValue: '💼 阿里实习' },
        { name: '腾讯', tier: 'T1', difficulty: 3, salaryRange: [380, 580], projectBonus: 48, resumeValue: '💼 腾讯实习' },
        { name: '美团', tier: 'T1.5', difficulty: 2.5, salaryRange: [300, 450], projectBonus: 40, resumeValue: '💼 美团实习' },
        { name: '京东', tier: 'T1.5', difficulty: 2.5, salaryRange: [280, 420], projectBonus: 38, resumeValue: '?? 京东实习' },
        { name: '快手', tier: 'T1.5', difficulty: 2.5, salaryRange: [350, 500], projectBonus: 42, resumeValue: '💼 快手实习' },
        { name: '小红书', tier: 'T2', difficulty: 2, salaryRange: [320, 480], projectBonus: 35, resumeValue: '💼 小红书实习' },
        { name: '百度', tier: 'T2', difficulty: 2, salaryRange: [250, 380], projectBonus: 30, resumeValue: '💼 百度实习' },
        { name: '网易', tier: 'T2', difficulty: 2, salaryRange: [280, 400], projectBonus: 32, resumeValue: '💼 网易实习' },
        { name: '某创业公司', tier: 'T3', difficulty: 1.5, salaryRange: [200, 300], projectBonus: 25, resumeValue: '💼 创业公司实习' }
    ],
    fulltime: [
        { name: '字节跳动', tier: 'T1', difficulty: 3.5, salaryRange: [30, 50], projectBonus: 0, resumeValue: '🎉 字节Offer' },
        { name: '阿里巴巴', tier: 'T1', difficulty: 3.5, salaryRange: [28, 45], projectBonus: 0, resumeValue: '🎉 阿里Offer' },
        { name: '腾讯', tier: 'T1', difficulty: 3.5, salaryRange: [30, 48], projectBonus: 0, resumeValue: '🎉 腾讯Offer' },
        { name: '华为', tier: 'T1', difficulty: 3, salaryRange: [25, 40], projectBonus: 0, resumeValue: '🎉 华为Offer' },
        { name: '美团', tier: 'T1.5', difficulty: 3, salaryRange: [25, 38], projectBonus: 0, resumeValue: '🎉 美团Offer' },
        { name: '京东', tier: 'T1.5', difficulty: 2.8, salaryRange: [22, 35], projectBonus: 0, resumeValue: '🎉 京东Offer' },
        { name: '小米', tier: 'T2', difficulty: 2.5, salaryRange: [20, 32], projectBonus: 0, resumeValue: '🎉 小米Offer' },
        { name: '百度', tier: 'T2', difficulty: 2.5, salaryRange: [22, 35], projectBonus: 0, resumeValue: '?? 百度Offer' },
        { name: '某中厂', tier: 'T2', difficulty: 2, salaryRange: [18, 28], projectBonus: 0, resumeValue: '🎉 中厂Offer' },
        { name: '某小厂', tier: 'T3', difficulty: 1.5, salaryRange: [12, 20], projectBonus: 0, resumeValue: '🎉 小厂Offer' }
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
        condition: (game) => game.currentMonth >= 25,
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
        condition: (game) => game.currentMonth >= 25,
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
        condition: (game) => game.currentMonth >= 30,
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
        title: '?? 项目出Bug',
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
        condition: (game) => game.currentMonth >= 20,
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
        title: '?? 亲戚内推',
        description: '家里有亲戚在大厂工作，愿意帮你内推！',
        probability: 0,  // 由家庭背景触发
        condition: (game) => game.character.familyType === '互联网世家' && game.currentMonth >= 25,
        choices: [
            {
                text: '感谢亲戚，认真准备',
                effects: { sanity: 10 },
                grantInternshipOffer: true
            }
        ],
        isSpecial: true
    },
    {
        id: '保研机会',
        title: '🎓 保研资格',
        description: '由于成绩优异，你获得了保研资格！',
        probability: 0,  // 条件触发
        condition: (game) => game.character.gpa >= 3.8 && game.currentMonth === 36,
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

// 结局配置
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