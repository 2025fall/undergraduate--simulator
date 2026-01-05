// 游戏核心逻辑

class Game {
    constructor() {
        this.character = null;
        this.currentQuarter = 1;  // v1.4 改为季度
        this.totalActions = 0;
        
        // 系统
        this.actionSystem = null;
        this.eventSystem = null;
        this.interviewSystem = null;
        this.graduateSystem = null;
        this.achievementSystem = null;
        
        // 状态
        this.hasInternshipOffer = false;
        this.internshipCompany = null;
        this.offers = [];  // 已获得的offer
        this.forcedEnding = null;  // 强制结局（如保研）
        this.hadLowSanity = false;  // 曾经低心态（用于成就）
        this.isGameOver = false;
        this.isInternship = false;  // v1.3 是否正在实习
        this.hadEntertainmentThisQuarter = false;  // v1.4 本季度是否有娱乐消费
        
        // v1.4 新增状态变量
        this.mentalBreakdownCount = 0;  // 精神崩溃次数
        this.civilServiceCount = 0;     // 公考准备次数
        this.hasT1FreePass = false;     // 是否有T1免笔试券
        
        // 候选角色
        this.candidates = [];
    }
    
    // 初始化游戏
    init() {
        this.candidates = CharacterGenerator.generateCandidates(5);
        return this.candidates;
    }
    
    // 选择角色并开始游戏
    selectCharacter(index) {
        this.character = this.candidates[index];
        
        // 初始化各系统
        this.actionSystem = new ActionSystem(this);
        this.eventSystem = new EventSystem(this);
        this.interviewSystem = new InterviewSystem(this);
        this.graduateSystem = new GraduateExamSystem(this);
        this.achievementSystem = new AchievementSystem(this);
        
        // 重置游戏状态
        this.currentQuarter = 1;  // v1.4 改为季度
        this.totalActions = 0;
        this.hasInternshipOffer = false;
        this.internshipCompany = null;
        this.offers = [];
        this.forcedEnding = null;
        this.hadLowSanity = false;
        this.isGameOver = false;
        this.mentalBreakdownCount = 0;  // v1.4
        this.civilServiceCount = 0;     // v1.4
        this.hasT1FreePass = false;     // v1.4
        
        return this.character;
    }
    
    // 获取可用行动
    getAvailableActions() {
        return this.actionSystem.getAvailableActions();
    }
    
    // 执行行动
    executeAction(actionId) {
        const result = this.actionSystem.executeAction(actionId);
        
        // 检查心态状态
        if (this.character.sanity < CONFIG.LOW_SANITY_THRESHOLD) {
            this.hadLowSanity = true;
        }
        
        // 检查成就
        this.achievementSystem.checkAchievements();
        
        return result;
    }
    
    // v1.4 奖学金检查方法
    checkScholarship() {
        const checkQuarters = CONFIG.SCHOLARSHIP.checkQuarters;
        if (checkQuarters.includes(this.currentQuarter)) {
            // 计算年度GPA（过去4个季度的表现）
            if (this.character.gpa >= CONFIG.SCHOLARSHIP.gpaThreshold) {
                this.character.modifyMoney(CONFIG.SCHOLARSHIP.amount);
                return { awarded: true, amount: CONFIG.SCHOLARSHIP.amount };
            }
        }
        return { awarded: false };
    }
    
    // v1.4 智商奇遇检查方法
    checkIQEvents() {
        const events = [];
        // 竞赛奇遇（大二）
        if (CONFIG.IQ_EVENTS.competition.triggerQuarters.includes(this.currentQuarter)) {
            if (this.character.iq >= CONFIG.IQ_EVENTS.competition.iqThreshold && Math.random() < 0.3) {
                events.push({ type: 'competition', ...CONFIG.IQ_EVENTS.competition });
            }
        }
        return events;
    }
    
    // v1.4 结束当季度（原endMonth）
    endQuarter() {
        const results = [];
        
        // 恢复精力
        this.character.restoreEnergy();
        results.push('精力已恢复');
        
        // v1.4 心态统一衰减30/季度
        const sanityDecay = 30;
        this.character.modifySanity(-sanityDecay);
        results.push(`心态自然衰减 -${sanityDecay}`);
        
        // v1.4 枯燥惩罚（当季度无娱乐消费）
        if (!this.hadEntertainmentThisQuarter) {
            const boredomPenalty = CONFIG.BOREDOM_PENALTY || 10;
            this.character.modifySanity(-boredomPenalty);
            results.push(`枯燥惩罚（无娱乐）心态 -${boredomPenalty}`);
        }
        this.hadEntertainmentThisQuarter = false;
        
        // v1.4 基础消耗2400元/季度
        const baseExpense = 2400;
        this.character.modifyMoney(-baseExpense);
        results.push(`基础生活消耗 -${baseExpense}元`);
        
        // v1.4 奖学金检查
        const scholarshipResult = this.checkScholarship();
        if (scholarshipResult.awarded) {
            results.push(`🎓 获得奖学金 +${scholarshipResult.amount}元`);
        }
        
        // v1.4 智商奇遇检查
        const iqEvents = this.checkIQEvents();
        if (iqEvents.length > 0) {
            iqEvents.forEach(event => {
                this.eventSystem.addEvent({
                    id: `iq_event_${event.type}`,
                    title: `🧠 ${event.type === 'competition' ? '竞赛机会' : '智商奇遇'}`,
                    description: '你的高智商引起了注意，有一个特殊机会向你招手...',
                    choices: [
                        { text: '参加竞赛', effects: { knowledge: 20, sanity: -10 } },
                        { text: '专注学业', effects: {} }
                    ]
                });
                results.push(`💡 触发智商奇遇：${event.type}`);
            });
        }
        
        // v1.3 通勤惩罚（如果正在实习且远距离通勤）
        if (this.isInternship && this.character.commuteType === 'far' && !this.character.isRenting) {
            this.character.modifySanity(-CONFIG.GEOGRAPHY.far.sanityPenalty);
            results.push(`通勤折磨 心态 -${CONFIG.GEOGRAPHY.far.sanityPenalty}`);
        }
        
        // 检查是否需要触发借钱事件
        if (this.character.money < 0) {
            this.eventSystem.addEvent({
                id: 'borrow_money',
                title: '💸 向家里要钱',
                description: '你的钱花光了，不得不向家里开口要钱。这让你感到很羞耻...',
                choices: [
                    {
                        text: '硬着头皮开口',
                        effects: { sanity: -20, money: 3000 }
                    },
                    {
                        text: '开启省吃俭用模式',
                        effects: { sanity: -10 }
                    }
                ]
            });
        }
        
        // 检查随机事件
        this.eventSystem.checkFamilySpecialEvent();
        this.eventSystem.checkRandomEvents();
        
        // 推进时间
        this.currentQuarter++;
        
        // 检查游戏结束条件
        const endCheck = this.checkEndConditions();
        if (endCheck) {
            results.push(endCheck);
        }
        
        // 检查成就
        const newAchievements = this.achievementSystem.checkAchievements();
        
        return {
            results,
            hasEvent: this.eventSystem.hasEvents(),
            newAchievements,
            isGameOver: this.isGameOver
        };
    }
    
    // v1.4 跳过季度（实习消耗1个季度）
    skipQuarter(isInternship = false) {
        const results = [];
        
        this.currentQuarter++;
        this.character.restoreEnergy();
        
        if (isInternship && this.internshipCompany) {
            // v1.4 实习期间的经济结算（1季度 = 3个月）
            // 获取实习工资（日薪 * 22个工作日 * 3个月）
            const dailySalary = this.internshipCompany.salary || 200;
            const quarterlyIncome = dailySalary * 22 * 3;
            this.character.modifyMoney(quarterlyIncome);
            results.push(`实习工资 +${quarterlyIncome}元`);
            
            // 扣除生活开销（季度）
            const expense = 2400;  // 基础消耗2400元/季度
            this.character.modifyMoney(-expense);
            results.push(`生活消耗 -${expense}元`);
            
            // v1.4 实习随机事件
            const randomRoll = Math.random();
            
            // 20%概率遇到好导师
            if (randomRoll < 0.2) {
                this.character.modifySoftskill(10);
                results.push(`🌟 遇到好导师 软技能 +10`);
                // 好导师情况下心态少扣10
                this.character.modifySanity(-20);  // 原本扣30，少扣10
                results.push(`导师关照 心态 -20（少扣10）`);
            }
            // 10%概率裁员（仅T2/T3）
            else if (randomRoll < 0.3 && this.internshipCompany.tier !== 'T1' && this.internshipCompany.tier !== 'T1.5') {
                const currentMoney = this.character.money;
                this.character.modifyMoney(-Math.floor(currentMoney / 2));
                results.push(`💔 遭遇裁员！金钱减半`);
                // GPA惩罚减半（原本可能扣0.2，现在扣0.1）
                this.character.modifyGPA(-0.1);
                results.push(`裁员打击 GPA -0.1`);
                this.character.modifySanity(-40);
                results.push(`裁员打击 心态 -40`);
            }
            // v1.3 实习期间可能触发PUA事件
            else if (randomRoll < 0.5) {
                const puaDamage = 10 + Math.floor(Math.random() * 10);
                this.character.modifySanity(-puaDamage);
                results.push(`实习遭遇PUA 心态 -${puaDamage}`);
            } else {
                // 正常实习心态变化
                this.character.modifySanity(-30);  // 季度心态衰减
                results.push(`实习心态消耗 -30`);
            }
            
            // 通勤惩罚
            if (this.character.commuteType === 'far' && !this.character.isRenting) {
                this.character.modifySanity(-CONFIG.GEOGRAPHY.far.sanityPenalty);
                results.push(`通勤折磨 心态 -${CONFIG.GEOGRAPHY.far.sanityPenalty}`);
            }
        } else {
            // 非实习的跳过（如豪华旅游）
            this.character.modifySanity(10);
            results.push(`休闲恢复 心态 +10`);
        }
        
        // 清除实习状态
        if (isInternship) {
            this.hasInternshipOffer = false;
            this.isInternship = false;
            this.character.commuteType = null;
            this.character.setRenting(false, 0);
        }
        
        return { results, endCheck: this.checkEndConditions() };
    }
    
    // 检查游戏结束条件
    checkEndConditions() {
        // 心态归零（精神崩溃）
        if (this.character.sanity <= 0) {
            this.mentalBreakdownCount++;  // v1.4 记录崩溃次数
            
            // v1.4 过劳死结局（崩溃次数>=2）
            if (this.mentalBreakdownCount >= 2) {
                this.isGameOver = true;
                return { type: 'overwork_death' };
            }
            
            // 首次崩溃，恢复一些心态继续
            this.character.sanity = 20;
            return { type: 'mental_breakdown_warning', count: this.mentalBreakdownCount };
        }
        
        // GPA过低
        if (this.character.gpa < 2.0) {
            this.isGameOver = true;
            return { type: 'dropout' };
        }
        
        // 时间结束
        if (this.currentQuarter > CONFIG.TOTAL_QUARTERS) {
            this.isGameOver = true;
            return { type: 'graduation' };
        }
        
        return null;
    }
    
    // 开始面试
    startInterview(type) {
        return this.interviewSystem.startInterview(type);
    }
    
    // 获取面试问题
    getInterviewQuestion() {
        return this.interviewSystem.getQuestion();
    }
    
    // 回答面试问题
    answerInterviewQuestion(question, optionIndex) {
        return this.interviewSystem.answerQuestion(question, optionIndex);
    }
    
    // 处理面试轮次结果
    processInterviewRound(passed) {
        return this.interviewSystem.processRoundResult(passed);
    }
    
    // 结束面试
    endInterview() {
        const result = this.interviewSystem.endInterview();
        
        if (result && result.success) {
            // 记录offer
            this.offers.push(result);
            
            // 添加简历亮点
            if (result.resumeValue) {
                this.character.addResumeItem(result.resumeValue);
            }
            
            // 如果是实习offer，设置状态
            if (result.type === 'internship') {
                this.hasInternshipOffer = true;
                this.internshipCompany = result.company;
            }
        } else if (result) {
            // 面试失败，扣心态
            this.character.modifySanity(-10);
        }
        
        return result;
    }
    
    // 获取下一个事件
    getNextEvent() {
        return this.eventSystem.getNextEvent();
    }
    
    // 处理事件选择
    processEventChoice(event, choiceIndex) {
        return this.eventSystem.processEventChoice(event, choiceIndex);
    }
    
    // 计算最终结局
    calculateEnding() {
        // 强制结局
        if (this.forcedEnding) {
            return ENDINGS[this.forcedEnding];
        }
        
        // v1.4 过劳死结局（崩溃次数>=2）
        if (this.mentalBreakdownCount >= 2) {
            return ENDINGS['overwork_death'];
        }
        
        // 心态崩溃
        if (this.character.sanity <= 0) {
            return ENDINGS['mental_breakdown'];
        }
        
        // GPA过低
        if (this.character.gpa < 2.0) {
            return ENDINGS['dropout'];
        }
        
        // v1.4 KOL结局判定（软技能>=80且有一定粉丝基础）
        if (this.character.softskill >= 80 && this.character.socialMedia && this.character.socialMedia >= 10000) {
            return ENDINGS['kol'];
        }
        
        // v1.4 公务员结局判定（公考准备次数>=3）
        if (this.civilServiceCount >= 3) {
            // 根据知识水平判定是否上岸
            if (this.character.knowledge >= 60) {
                return ENDINGS['civil_service_success'];
            } else {
                return ENDINGS['civil_service_fail'];
            }
        }
        
        // 检查是否选择了考研路线
        if (this.graduateSystem.prepareScore > 100) {
            const examResult = this.graduateSystem.takeExam();
            if (examResult && examResult.passed) {
                return ENDINGS['postgraduate_success'];
            }
        }
        
        // 根据offer情况决定结局
        if (this.offers.length > 0) {
            // 找到最好的正式offer
            const fullTimeOffers = this.offers.filter(o => o.type === 'fulltime');
            
            if (fullTimeOffers.length > 0) {
                const bestOffer = fullTimeOffers.reduce((best, curr) => {
                    const tierRank = { 'T1': 3, 'T1.5': 2, 'T2': 1, 'T3': 0 };
                    return tierRank[curr.company.tier] > tierRank[best.company.tier] ? curr : best;
                });
                
                if (bestOffer.company.tier === 'T1') {
                    return {
                        ...ENDINGS['offer_t1'],
                        extra: `<p>🎉 最佳Offer：${bestOffer.company.name}，年薪 ${bestOffer.salary}w</p>`
                    };
                } else if (bestOffer.company.tier === 'T1.5' || bestOffer.company.tier === 'T2') {
                    return {
                        ...ENDINGS['offer_t2'],
                        extra: `<p>💼 入职：${bestOffer.company.name}，年薪 ${bestOffer.salary}w</p>`
                    };
                } else {
                    return {
                        ...ENDINGS['offer_t3'],
                        extra: `<p>🌱 入职：${bestOffer.company.name}，年薪 ${bestOffer.salary}w</p>`
                    };
                }
            }
        }
        
        // v1.4 Gap Year结局（没有offer但有钱且心态还行）
        if (this.character.money >= 10000 && this.character.sanity >= 50) {
            return ENDINGS['gap_year'];
        }
        
        // 没有offer
        return ENDINGS['graduate_unemployed'];
    }
    
    // 获取结局数据
    getEndingData() {
        const ending = this.calculateEnding();
        
        return {
            ...ending,
            stats: {
                gpa: this.character.gpa.toFixed(2),
                project: this.character.project,
                knowledge: this.character.knowledge,
                softskill: this.character.softskill,
                resumeCount: this.character.resumeItems.length,
                totalActions: this.totalActions
            },
            offers: this.offers,
            achievements: this.achievementSystem.getUnlockedAchievements()
        };
    }
    
    // 获取当前阶段
    getCurrentPhase() {
        if (this.currentQuarter <= 8) {  // v1.4 大一大二（8个季度）
            return 'ACCUMULATE';
        } else if (this.currentQuarter <= 12) {  // v1.4 大三（4个季度）
            return 'INTERNSHIP';
        } else {
            return 'DECISION';  // v1.4 大四
        }
    }
    
    // 获取游戏状态摘要
    getGameState() {
        return {
            quarter: this.currentQuarter,  // v1.4 改为季度
            phase: this.getCurrentPhase(),
            character: this.character.getSummary(),
            hasInternshipOffer: this.hasInternshipOffer,
            offersCount: this.offers.length,
            isGameOver: this.isGameOver,
            mentalBreakdownCount: this.mentalBreakdownCount,  // v1.4
            civilServiceCount: this.civilServiceCount,        // v1.4
            hasT1FreePass: this.hasT1FreePass                 // v1.4
        };
    }
    
    // 重置游戏
    reset() {
        this.character = null;
        this.currentQuarter = 1;  // v1.4 改为季度
        this.totalActions = 0;
        this.hasInternshipOffer = false;
        this.internshipCompany = null;
        this.offers = [];
        this.forcedEnding = null;
        this.hadLowSanity = false;
        this.isGameOver = false;
        this.isInternship = false;
        this.hadEntertainmentThisQuarter = false;  // v1.4
        this.mentalBreakdownCount = 0;  // v1.4
        this.civilServiceCount = 0;     // v1.4
        this.hasT1FreePass = false;     // v1.4
        this.candidates = [];
    }
    
    // v1.3 开始实习
    startInternship(company, geography) {
        this.isInternship = true;
        this.internshipCompany = company;
        this.character.commuteType = geography;
        
        // 处理地理位置
        const geoConfig = CONFIG.GEOGRAPHY[geography];
        if (geography === 'remote') {
            // 异地必须租房
            const rentCost = Array.isArray(geoConfig.rentCost) 
                ? geoConfig.rentCost[0] + Math.random() * (geoConfig.rentCost[1] - geoConfig.rentCost[0])
                : geoConfig.rentCost;
            this.character.setRenting(true, Math.floor(rentCost));
        }
        
        return geoConfig;
    }
    
    // v1.3 选择租房（远距离通勤时可选）
    chooseToRent() {
        if (this.character.commuteType === 'far') {
            const rentCost = CONFIG.GEOGRAPHY.far.rentOption;
            this.character.setRenting(true, rentCost);
            return rentCost;
        }
        return 0;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
}