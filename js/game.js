// 游戏核心逻辑

class Game {
    constructor() {
        this.character = null;
        this.currentMonth = 1;
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
        this.currentMonth = 1;
        this.totalActions = 0;
        this.hasInternshipOffer = false;
        this.internshipCompany = null;
        this.offers = [];
        this.forcedEnding = null;
        this.hadLowSanity = false;
        this.isGameOver = false;
        
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
    
    // 结束当月
    endMonth() {
        const results = [];
        
        // 恢复精力
        this.character.restoreEnergy();
        results.push('精力已恢复');
        
        // v1.3 心态自然衰减（按阶段）
        const phase = this.getCurrentPhase();
        const sanityDecay = CONFIG.SANITY_DECAY[phase] || 2;
        this.character.modifySanity(-sanityDecay);
        results.push(`心态自然衰减 -${sanityDecay}`);
        
        // v1.3 经济结算
        const financeResult = this.character.processMonthlyFinance();
        results.push(...financeResult.results);
        
        // v1.3 通勤惩罚（如果正在实习且远距离通勤）
        if (this.isInternship && this.character.commuteType === 'far' && !this.character.isRenting) {
            this.character.modifySanity(-CONFIG.GEOGRAPHY.far.sanityPenalty);
            results.push(`通勤折磨 心态 -${CONFIG.GEOGRAPHY.far.sanityPenalty}`);
        }
        
        // 检查是否需要触发借钱事件
        if (financeResult.triggerBorrowEvent) {
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
        this.currentMonth++;
        
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
    
    // 跳过多个月（实习）
    skipMonths(months, isInternship = false) {
        const results = [];
        
        for (let i = 0; i < months; i++) {
            this.currentMonth++;
            this.character.restoreEnergy();
            
            if (isInternship && this.internshipCompany) {
                // v1.3 实习期间的经济结算
                // 获取实习工资（日薪 * 22个工作日）
                const dailySalary = this.internshipCompany.salary || 200;
                const monthlyIncome = dailySalary * 22;
                this.character.modifyMoney(monthlyIncome);
                results.push(`实习工资 +${monthlyIncome}元`);
                
                // 扣除生活开销
                const expense = this.character.getMonthlyExpense();
                this.character.modifyMoney(-expense);
                
                // v1.3 实习期间可能触发PUA事件
                if (Math.random() < 0.2) {
                    const puaDamage = 10 + Math.floor(Math.random() * 10);
                    this.character.modifySanity(-puaDamage);
                    results.push(`实习遭遇PUA 心态 -${puaDamage}`);
                } else {
                    // 正常实习心态变化
                    this.character.modifySanity(3);
                }
                
                // 通勤惩罚
                if (this.character.commuteType === 'far' && !this.character.isRenting) {
                    this.character.modifySanity(-CONFIG.GEOGRAPHY.far.sanityPenalty);
                }
            } else {
                // 非实习的跳过（如豪华旅游）
                this.character.modifySanity(3);
            }
            
            if (this.currentMonth >= CONFIG.TOTAL_MONTHS) {
                break;
            }
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
        // 心态归零
        if (this.character.sanity <= 0) {
            this.isGameOver = true;
            return { type: 'mental_breakdown' };
        }
        
        // GPA过低
        if (this.character.gpa < 2.0) {
            this.isGameOver = true;
            return { type: 'dropout' };
        }
        
        // 时间结束
        if (this.currentMonth > CONFIG.TOTAL_MONTHS) {
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
        
        // 心态崩溃
        if (this.character.sanity <= 0) {
            return ENDINGS['mental_breakdown'];
        }
        
        // GPA过低
        if (this.character.gpa < 2.0) {
            return ENDINGS['dropout'];
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
        if (this.currentMonth <= 24) {
            return 'ACCUMULATE';
        } else if (this.currentMonth <= 36) {
            return 'INTERNSHIP';
        } else {
            return 'DECISION';
        }
    }
    
    // 获取游戏状态摘要
    getGameState() {
        return {
            month: this.currentMonth,
            phase: this.getCurrentPhase(),
            character: this.character.getSummary(),
            hasInternshipOffer: this.hasInternshipOffer,
            offersCount: this.offers.length,
            isGameOver: this.isGameOver
        };
    }
    
    // 重置游戏
    reset() {
        this.character = null;
        this.currentMonth = 1;
        this.totalActions = 0;
        this.hasInternshipOffer = false;
        this.internshipCompany = null;
        this.offers = [];
        this.forcedEnding = null;
        this.hadLowSanity = false;
        this.isGameOver = false;
        this.isInternship = false;
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