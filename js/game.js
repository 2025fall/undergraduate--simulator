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
        this.forceHospitalSkip = false;
        this.hasDepressionDebuff = false;
        
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
        this.forceHospitalSkip = false;
        this.hasDepressionDebuff = false;

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

    applyQuarterEconomy(results) {
        const familyConfig = this.character.getFamilyConfig();
        const allowance = this.character.quarterlyAllowance || familyConfig?.quarterlyAllowance || 0;
        if (allowance > 0) {
            this.character.modifyMoney(allowance);
            results.push(`家庭补贴 +${allowance}元`);
        }
        this.character.modifyMoney(-CONFIG.QUARTERLY_EXPENSE);
        results.push(`基础生活消耗 -${CONFIG.QUARTERLY_EXPENSE}元`);

        if (familyConfig?.quarterlyGap) {
            this.character.modifyMoney(-familyConfig.quarterlyGap);
            results.push(`刚需缺口 -${familyConfig.quarterlyGap}元`);
        }
    }
    
    // v1.4 智商奇遇检查方法
    checkIQEvents() {
        const logs = [];
        const competitionCfg = CONFIG.IQ_EVENTS.competition;
        if (competitionCfg.triggerQuarters.includes(this.currentQuarter)) {
            if (this.character.iq >= competitionCfg.iqThreshold && Math.random() < 0.3) {
                this.character.modifyStat('project', competitionCfg.projectBonus, true);
                this.character.addResumeItem('🏆 ACM/数学建模获奖');
                logs.push(`🧠 ${competitionCfg.name} 项目能力 +${competitionCfg.projectBonus}`);
            }
        }
        return logs;
    }

    evaluateMentalState(trigger = 'general') {
        if (this.character.sanity > 0) {
            return null;
        }
        return this.handleMentalBreakdown(trigger);
    }

    handleMentalBreakdown(trigger = 'general') {
        this.mentalBreakdownCount++;

        this.character.modifyGPA(-0.1);
        this.character.modifyStat('project', -10, false);
        this.character.modifyStat('knowledge', -10, false);
        this.character.modifyStat('softskill', -10, false);

        if (!this.hasDepressionDebuff) {
            this.hasDepressionDebuff = true;
            this.character.maxSanity = Math.min(this.character.maxSanity, 80);
        }
        this.character.sanity = Math.max(10, Math.round(this.character.maxSanity * 0.5));

        this.forceHospitalSkip = true;

        const info = {
            type: 'mental_breakdown',
            count: this.mentalBreakdownCount,
            message: '💥 精神崩溃！被迫休学一个季度，全属性 -10，心态上限降至 80。'
        };

        if (this.mentalBreakdownCount >= 2) {
            info.type = 'overwork_death';
            info.message = '☠️ 连续崩溃两次，因过劳猝死，游戏结束。';
            this.isGameOver = true;
        }

        return info;
    }

    processHospitalRest(results) {
        if (!this.forceHospitalSkip) return null;
        this.forceHospitalSkip = false;

        const hospitalLogs = [
            `🏥 因精神崩溃住院休学，跳过 Q${this.currentQuarter} 的全部行动`
        ];

        this.currentQuarter++;
        this.character.restoreEnergy();

        const recoverySanity = Math.max(40, Math.round(this.character.maxSanity * 0.6));
        this.character.sanity = Math.min(this.character.maxSanity, recoverySanity);

        this.applyQuarterEconomy(hospitalLogs);

        results.push(...hospitalLogs);
        return this.checkEndConditions('hospital');
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
        
        // 经济结算
        this.applyQuarterEconomy(results);
        
        // v1.4 奖学金检查
        const scholarshipResult = this.checkScholarship();
        if (scholarshipResult.awarded) {
            results.push(`🎓 获得奖学金 +${scholarshipResult.amount}元`);
        }
        
        // v1.4 智商奇遇检查
        const iqLogs = this.checkIQEvents();
        iqLogs.forEach(msg => results.push(msg));
        
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
        const endCheck = this.checkEndConditions('quarter_end');
        if (endCheck && (endCheck.type === 'mental_breakdown' || endCheck.type === 'overwork_death')) {
            results.push(endCheck.message);
        }

        const hospitalCheck = this.processHospitalRest(results);
        if (hospitalCheck && (hospitalCheck.type === 'mental_breakdown' || hospitalCheck.type === 'overwork_death')) {
            results.push(hospitalCheck.message);
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
    
    // v1.4 跳过季度（实习等会直接进入下季度）
    skipQuarter(isInternship = false) {
        const results = [];
        this.character.restoreEnergy();
        results.push('精力已恢复');

        const sanityDecay = CONFIG.SANITY_DECAY;
        this.character.modifySanity(-sanityDecay);
        results.push(`心态自然衰减 -${sanityDecay}`);

        if (!this.hadEntertainmentThisQuarter) {
            const boredomPenalty = CONFIG.BOREDOM_PENALTY || 10;
            this.character.modifySanity(-boredomPenalty);
            results.push(`枯燥惩罚（无娱乐）心态 -${boredomPenalty}`);
        }
        this.hadEntertainmentThisQuarter = false;

        this.applyQuarterEconomy(results);

        const scholarshipResult = this.checkScholarship();
        if (scholarshipResult.awarded) {
            results.push(`🎓 获得奖学金 +${scholarshipResult.amount}元`);
        }

        const iqLogs = this.checkIQEvents();
        iqLogs.forEach(msg => results.push(msg));

        if (isInternship && this.internshipCompany) {
            const dailySalary = this.internshipCompany.dailySalary || this.internshipCompany.salary || 200;
            const quarterlyIncome = dailySalary * 22 * 3;
            this.character.modifyMoney(quarterlyIncome);
            results.push(`实习工资 +${quarterlyIncome}元`);

            const randomRoll = Math.random();
            if (randomRoll < 0.2) {
                this.character.modifyStat('softskill', 10);
                results.push('🌟 遇到好导师 软技能 +10');
                this.character.modifySanity(-20);
                results.push('导师关照 心态 -20（少扣10）');
            } else if (randomRoll < 0.3 && this.internshipCompany.tier !== 'T1' && this.internshipCompany.tier !== 'T1.5') {
                this.character.modifyMoney(-Math.floor(this.character.money / 2));
                results.push('💔 遭遇裁员！金钱减半');
                this.character.modifyGPA(-0.1);
                results.push('裁员打击 GPA -0.1');
                this.character.modifySanity(-40);
                results.push('裁员打击 心态 -40');
            } else if (randomRoll < 0.5) {
                const puaDamage = 10 + Math.floor(Math.random() * 10);
                this.character.modifySanity(-puaDamage);
                results.push(`实习遭遇PUA 心态 -${puaDamage}`);
            } else {
                this.character.modifySanity(-30);
                results.push('实习心态消耗 -30');
            }

            if (this.internshipCompany.projectBonus) {
                this.character.modifyStat('project', this.internshipCompany.projectBonus, true);
                results.push(`项目能力 +${this.internshipCompany.projectBonus}`);
            }

            if (this.character.commuteType === 'far' && !this.character.isRenting) {
                this.character.modifySanity(-CONFIG.GEOGRAPHY.far.sanityPenalty);
                results.push(`通勤折磨 心态 -${CONFIG.GEOGRAPHY.far.sanityPenalty}`);
            }
        } else {
            this.character.modifySanity(10);
            results.push('休闲恢复 心态 +10');
        }

        this.eventSystem.checkFamilySpecialEvent();
        this.eventSystem.checkRandomEvents();

        this.currentQuarter++;
        const endCheck = this.checkEndConditions('skip');

        if (isInternship) {
            this.hasInternshipOffer = false;
            this.isInternship = false;
            this.character.commuteType = null;
            this.character.setRenting(false, 0);
        }

        return { 
            results, 
            endCheck,
            isGameOver: this.isGameOver
        };
    }
    
    // 检查游戏结束条件
    checkEndConditions(trigger = 'general') {
        const mentalState = this.evaluateMentalState(trigger);
        if (mentalState) {
            return mentalState;
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
        const result = this.interviewSystem.startInterview(type, {
            forceTier1: this.hasT1FreePass
        });
        if (result?.usedFreePass) {
            this.hasT1FreePass = false;
        }
        return result;
    }
    
    // 获取面试问题
    getInterviewQuestion() {
        return this.interviewSystem.getQuestion();
    }
    
    // 回答面试问题
    answerInterviewQuestion(question, selection) {
        return this.interviewSystem.answerQuestion(question, selection);
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
        const results = this.eventSystem.processEventChoice(event, choiceIndex);
        const mentalState = this.evaluateMentalState('event');
        if (mentalState) {
            results.push(mentalState.message);
        }
        return results;
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
        this.forceHospitalSkip = false;
        this.hasDepressionDebuff = false;
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
