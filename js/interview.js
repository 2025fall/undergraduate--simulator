
// 面试系统

class InterviewSystem {
    constructor(game) {
        this.game = game;
        this.currentInterview = null;
        this.currentRound = 0;
        this.questionsAsked = [];
        this.currentPressure = 0;
        this.pressureLimit = 100;
    }

    startInterview(type, options = {}) {
        const passResume = this.resumeScreening(options.forceTier1);
        if (!passResume) {
            return {
                success: false,
                stage: 'resume',
                message: '😢 简历筛选未通过，继续努力吧！'
            };
        }

        const companies = COMPANIES[type];
        const company = this.selectCompany(companies, options.forceTier1);

        this.currentInterview = {
            type,
            company,
            roundSequence: this.createRoundSequence(company),
            usedFreePass: !!options.forceTier1,
            suitPenalty,
            completed: false,
            passed: false
        };

        this.currentRound = 0;
        this.questionsAsked = [];
        this.currentPressure = Math.max(0, 20 - this.game.character.getInterviewPressureBonus());
        this.pressureLimit = 100 + Math.max(0, (this.game.character.maxSanity - CONFIG.MAX_SANITY) / 2);
        const suitPenalty = type === 'fulltime' &&
            company.tier === 'T1' &&
            !this.game.character.hasInterviewSuit;
        if (suitPenalty) {
            this.pressureLimit = Math.max(60, this.pressureLimit - 20);
        }

        return {
            success: true,
            stage: 'interview',
            company,
            pressure: this.getPressureState(),
            usedFreePass: !!options.forceTier1,
            message: `🎉 简历通过！获得 ${company.name} 的面试机会！`
        };
    }

    resumeScreening(forcePass = false) {
        if (forcePass) return true;
        const passRate = this.game.character.getResumePassRate();

        let bonus = 0;
        bonus += Math.min(0.1, this.game.character.project / 1000);
        bonus += Math.min(0.05, this.game.character.knowledge / 2000);

        const finalRate = Math.min(0.95, passRate + bonus);
        return Math.random() < finalRate;
    }

    selectCompany(companies, forceTier1 = false) {
        let pool = [...companies];
        if (forceTier1) {
            const t1 = pool.filter(c => c.tier === 'T1');
            if (t1.length > 0) {
                pool = t1;
            }
        }

        const totalStats = this.game.character.project +
                           this.game.character.knowledge +
                           this.game.character.softskill;

        const sorted = pool.sort((a, b) => b.difficulty - a.difficulty);
        let targetIndex;
        if (totalStats > 500) {
            targetIndex = Math.floor(Math.random() * Math.min(3, sorted.length));
        } else if (totalStats > 300) {
            targetIndex = Math.min(sorted.length - 1, 2 + Math.floor(Math.random() * 3));
        } else if (totalStats > 150) {
            targetIndex = Math.min(sorted.length - 1, 5 + Math.floor(Math.random() * 2));
        } else {
            targetIndex = sorted.length - 1;
        }

        const company = sorted[targetIndex];
        const jobTypes = company.jobTypes || ['backend', 'frontend'];
        const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
        const geography = this.generateGeography();
        const geoConfig = CONFIG.GEOGRAPHY[geography];
        const rentCostQuarter = this.rollRentCost(geoConfig?.rentRange);

        return {
            ...company,
            jobType,
            geography,
            rentCostQuarter
        };
    }

    rollRentCost(range) {
        if (!Array.isArray(range) || range.length < 2) return 0;
        const [minCost, maxCost] = range;
        return Math.floor(minCost + Math.random() * (maxCost - minCost));
    }

    generateGeography() {
        const rand = Math.random();
        let cumProb = 0;
        for (const [key, config] of Object.entries(CONFIG.GEOGRAPHY)) {
            cumProb += config.probability;
            if (rand < cumProb) {
                return key;
            }
        }
        return 'near';
    }

    createRoundSequence(company) {
        const rounds = [];
        const focusPool = company.tier === 'T1' ? ['project', 'technical', 'project'] : ['technical', 'project'];
        for (let i = 0; i < 2; i++) {
            rounds.push(focusPool[Math.floor(Math.random() * focusPool.length)]);
        }
        rounds.push('hr');
        return rounds;
    }

    getPressureState() {
        return {
            value: Math.min(this.pressureLimit, Math.max(0, Math.round(this.currentPressure))),
            limit: this.pressureLimit,
            percent: Math.min(100, Math.round((this.currentPressure / this.pressureLimit) * 100))
        };
    }

    getQuestion() {
        if (!this.currentInterview) return null;
        const sequence = this.currentInterview.roundSequence;
        if (this.currentRound >= sequence.length) return null;

        const questionType = sequence[this.currentRound];
        const pool = INTERVIEW_QUESTIONS[questionType];
        let available = pool.filter(q => !this.questionsAsked.includes(q.question));
        if (available.length === 0) {
            this.questionsAsked = [];
            available = pool;
        }

        const question = available[Math.floor(Math.random() * available.length)];
        this.questionsAsked.push(question.question);

        const tagKey = INTERVIEW_TAG_MAP[questionType];
        const tag = INTERVIEW_TAGS[tagKey];

        return {
            id: question.question,
            question: question.question,
            difficulty: question.difficulty,
            statRequired: question.statRequired,
            tagKey,
            tag,
            roundIndex: this.currentRound + 1,
            totalRounds: sequence.length
        };
    }

    answerQuestion(question, strategyId) {
        if (!this.currentInterview) return null;
        const strategy = INTERVIEW_STRATEGIES[strategyId];
        if (!strategy) {
            return { success: false, interviewEnded: false, message: '未知策略' };
        }

        let successChance = strategy.baseSuccess;
        const statValue = this.game.character[strategy.stat] || 0;
        successChance += Math.min(0.25, statValue / (strategy.statScale * 4));

        if (strategy.counterTag === question.tagKey) {
            successChance += 0.15;
        } else {
            successChance -= strategy.mismatchPenalty;
        }

        successChance -= (question.difficulty - 1) * 0.03;
        successChance -= (this.currentInterview.company.difficulty - 2) * 0.05;
        successChance = Math.max(0.15, Math.min(0.95, successChance));

        const success = Math.random() < successChance;
        const difficultyImpact = (question.difficulty - 1) * 5;
        const pressureDelta = success
            ? strategy.successPressure - difficultyImpact
            : strategy.failPressure + difficultyImpact;

        this.currentPressure = Math.max(0, this.currentPressure + pressureDelta);
        const pressureBreak = this.currentPressure >= this.pressureLimit;

        this.currentRound++;
        const finished = pressureBreak || this.currentRound >= this.currentInterview.roundSequence.length;
        const passed = finished && !pressureBreak;

        if (finished) {
            this.currentInterview.completed = true;
            this.currentInterview.passed = passed;
        }

        return {
            strategy,
            success,
            successChance: Math.round(successChance * 100),
            pressureChange: pressureDelta,
            pressure: this.getPressureState(),
            interviewEnded: finished,
            pressureBreak,
            passed,
            company: this.currentInterview.company
        };
    }

    endInterview() {
        if (!this.currentInterview) return null;
        const result = this.getInterviewResult();
        this.currentInterview = null;
        this.currentRound = 0;
        this.questionsAsked = [];
        this.currentPressure = 0;
        this.pressureLimit = 100;
        return result;
    }

    cancelInterview() {
        this.currentInterview = null;
        this.currentRound = 0;
        this.questionsAsked = [];
        this.currentPressure = 0;
        this.pressureLimit = 100;
    }

    getInterviewResult() {
        if (!this.currentInterview) return null;
        const company = this.currentInterview.company;

        if (this.currentInterview.passed) {
            const salary = this.calculateSalary(company);
            return {
                success: true,
                company,
                salary: salary.finalSalary,
                dailySalary: salary.dailySalary,
                type: this.currentInterview.type,
                projectBonus: company.projectBonus,
                resumeValue: company.resumeValue,
                jobType: company.jobType,
                geography: company.geography,
                canNegotiate: salary.canNegotiate
            };
        }

        return {
            success: false,
            company
        };
    }

    calculateSalary(company) {
        const salaryRange = company.salaryRange;
        const isInternship = this.currentInterview.type === 'internship';

        let baseSalary = salaryRange[0] + Math.random() * (salaryRange[1] - salaryRange[0]);
        const jobType = company.jobType || 'backend';
        const jobConfig = CONFIG.JOB_TYPES[jobType];
        if (jobConfig) {
            baseSalary *= jobConfig.salaryModifier;
        }

        const softskill = this.game.character.softskill;
        let canNegotiate = softskill >= 80;
        let negotiationBonus = 0;

        if (canNegotiate) {
            const negotiateSuccess = Math.random() < (softskill / 200);
            if (negotiateSuccess) {
                negotiationBonus = 0.1 + Math.random() * 0.1;
            }
        }

        const finalSalary = baseSalary * (1 + negotiationBonus);

        if (isInternship) {
            return {
                dailySalary: Math.round(finalSalary),
                finalSalary: Math.round(finalSalary),
                canNegotiate,
                negotiationBonus: Math.round(negotiationBonus * 100)
            };
        } else {
            return {
                dailySalary: 0,
                finalSalary: Math.round(finalSalary),
                canNegotiate,
                negotiationBonus: Math.round(negotiationBonus * 100)
            };
        }
    }

    getProgress() {
        if (!this.currentInterview) return null;
        return {
            company: this.currentInterview.company.name,
            currentRound: this.currentRound,
            totalRounds: this.currentInterview.roundSequence.length,
            pressure: this.getPressureState()
        };
    }
}

// 考研系统
class GraduateExamSystem {
    constructor(game) {
        this.game = game;
        this.prepareScore = 0;  // 备考分数
        this.examTaken = false;
    }
    
    // 增加备考分数
    addPrepareScore(amount) {
        this.prepareScore += amount;
    }
    
    // 进行考研考试（在第48个月自动触发）
    takeExam() {
        if (this.examTaken) return null;
        this.examTaken = true;
        
        // 计算通过概率
        // 基于：备考分数 + 知识点 + GPA + 智商
        let passChance = 0.1;  // 基础10%
        
        // 备考分数贡献（主要因素）
        passChance += Math.min(0.4, this.prepareScore / 500);
        
        // 知识点贡献
        passChance += Math.min(0.2, this.game.character.knowledge / 1000);
        
        // GPA贡献
        passChance += Math.min(0.15, (this.game.character.gpa - 3.0) * 0.15);
        
        // 智商贡献
        passChance += Math.min(0.1, (this.game.character.iq - 50) / 500);
        
        // 学校背景修正
        const schoolConfig = this.game.character.getSchoolConfig();
        if (schoolConfig.name === 'Top2') passChance += 0.15;
        else if (schoolConfig.name === '985') passChance += 0.1;
        else if (schoolConfig.name === '211') passChance += 0.05;
        
        passChance = Math.max(0.05, Math.min(0.9, passChance));
        
        const passed = Math.random() < passChance;
        
        return {
            passed,
            passChance: Math.round(passChance * 100),
            prepareScore: this.prepareScore
        };
    }
    
    // 获取备考状态
    getStatus() {
        return {
            prepareScore: this.prepareScore,
            estimatedChance: Math.min(90, Math.round(
                10 + 
                this.prepareScore / 500 * 40 + 
                this.game.character.knowledge / 1000 * 20 +
                (this.game.character.gpa - 3.0) * 15
            ))
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InterviewSystem, GraduateExamSystem };
}
