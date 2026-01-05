// 面试系统

class InterviewSystem {
    constructor(game) {
        this.game = game;
        this.currentInterview = null;
        this.currentRound = 0;
        this.roundResults = [];
        this.questionsAsked = [];
    }
    
    // 开始面试流程
    startInterview(type) {
        // 先进行简历筛选
        const passResume = this.resumeScreening();
        
        if (!passResume) {
            return {
                success: false,
                stage: 'resume',
                message: '😢 简历筛选未通过，继续努力吧！'
            };
        }
        
        // 随机选择一家公司
        const companies = COMPANIES[type];
        const company = this.selectCompany(companies);
        
        this.currentInterview = {
            type,
            company,
            rounds: this.generateInterviewRounds(company),
            currentRoundIndex: 0
        };
        
        this.currentRound = 0;
        this.roundResults = [];
        this.questionsAsked = [];
        
        return {
            success: true,
            stage: 'interview',
            company: company,
            message: `🎉 简历通过！获得 ${company.name} 的面试机会！`
        };
    }
    
    // 简历筛选
    resumeScreening() {
        const passRate = this.game.character.getResumePassRate();
        
        // 属性加成
        let bonus = 0;
        bonus += Math.min(0.1, this.game.character.project / 1000);
        bonus += Math.min(0.05, this.game.character.knowledge / 2000);
        
        const finalRate = Math.min(0.95, passRate + bonus);
        
        return Math.random() < finalRate;
    }
    
    // 选择公司（根据玩家属性和运气）
    selectCompany(companies) {
        // 根据玩家综合实力，倾向于匹配的公司
        const totalStats = this.game.character.project + 
                          this.game.character.knowledge + 
                          this.game.character.softskill;
        
        // 按难度排序
        const sortedCompanies = [...companies].sort((a, b) => b.difficulty - a.difficulty);
        
        // 根据实力选择合适档位的公司
        let targetIndex;
        if (totalStats > 500) {
            targetIndex = Math.floor(Math.random() * 3);  // 前3家
        } else if (totalStats > 300) {
            targetIndex = 2 + Math.floor(Math.random() * 4);  // 中间4家
        } else if (totalStats > 150) {
            targetIndex = 5 + Math.floor(Math.random() * 3);  // 后面3家
        } else {
            targetIndex = 7 + Math.floor(Math.random() * 3);  // 最后几家
        }
        
        targetIndex = Math.min(targetIndex, sortedCompanies.length - 1);
        
        return sortedCompanies[targetIndex];
    }
    
    // 生成面试轮次
    generateInterviewRounds(company) {
        const rounds = [];
        
        // 根据公司tier决定面试轮数
        let numRounds;
        switch(company.tier) {
            case 'T1': numRounds = 4; break;
            case 'T1.5': numRounds = 3; break;
            case 'T2': numRounds = 3; break;
            default: numRounds = 2;
        }
        
        // 技术面（1-2轮）
        const techRounds = Math.min(2, numRounds - 1);
        for (let i = 0; i < techRounds; i++) {
            rounds.push({
                type: 'technical',
                name: `技术面 ${i + 1}`,
                questionTypes: ['technical', 'project']
            });
        }
        
        // 项目面（如果是T1公司）
        if (company.tier === 'T1') {
            rounds.push({
                type: 'project',
                name: '项目深挖',
                questionTypes: ['project']
            });
        }
        
        // HR面
        rounds.push({
            type: 'hr',
            name: 'HR面',
            questionTypes: ['hr']
        });
        
        return rounds;
    }
    
    // 获取当前轮次
    getCurrentRound() {
        if (!this.currentInterview) return null;
        return this.currentInterview.rounds[this.currentInterview.currentRoundIndex];
    }
    
    // 获取当前轮次的问题
    getQuestion() {
        const round = this.getCurrentRound();
        if (!round) return null;
        
        // 从对应题库中随机选择一道未问过的题
        const questionType = round.questionTypes[Math.floor(Math.random() * round.questionTypes.length)];
        const questionPool = INTERVIEW_QUESTIONS[questionType];
        
        // 过滤掉已问过的题目
        const availableQuestions = questionPool.filter(q => 
            !this.questionsAsked.includes(q.question)
        );
        
        if (availableQuestions.length === 0) {
            // 如果都问过了，重新开始
            this.questionsAsked = [];
            return questionPool[Math.floor(Math.random() * questionPool.length)];
        }
        
        const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        this.questionsAsked.push(question.question);
        
        return {
            ...question,
            roundName: round.name,
            roundIndex: this.currentInterview.currentRoundIndex + 1,
            totalRounds: this.currentInterview.rounds.length
        };
    }
    
    // 回答问题
    answerQuestion(question, selectedOptionIndex) {
        const selectedOption = question.options[selectedOptionIndex];
        const isCorrect = selectedOption.correct;
        
        // 计算通过概率（基于属性）
        let passChance = 0.3;  // 基础通过率
        
        if (isCorrect) {
            passChance = 0.8;  // 答对大幅提升
            
            // 根据相关属性额外加成
            const statValue = this.game.character[question.statRequired] || 0;
            if (statValue >= question.threshold) {
                passChance += 0.15;
            }
            if (statValue >= question.threshold * 2) {
                passChance += 0.05;
            }
        } else {
            // 答错但属性高也有小概率救回来
            const statValue = this.game.character[question.statRequired] || 0;
            if (statValue >= question.threshold * 1.5) {
                passChance += 0.2;
            }
        }
        
        // 公司难度修正
        passChance -= (this.currentInterview.company.difficulty - 2) * 0.1;
        
        passChance = Math.max(0.1, Math.min(0.95, passChance));
        
        const passed = Math.random() < passChance;
        
        return {
            isCorrect,
            passed,
            selectedOption,
            passChance: Math.round(passChance * 100)
        };
    }
    
    // 处理轮次结果
    processRoundResult(passed) {
        this.roundResults.push(passed);
        
        if (!passed) {
            // 面试失败
            return {
                interviewEnded: true,
                success: false,
                message: `😢 ${this.getCurrentRound().name}未通过，面试结束`
            };
        }
        
        // 进入下一轮
        this.currentInterview.currentRoundIndex++;
        
        if (this.currentInterview.currentRoundIndex >= this.currentInterview.rounds.length) {
            // 所有轮次通过，面试成功
            return {
                interviewEnded: true,
                success: true,
                message: `🎉 恭喜！通过 ${this.currentInterview.company.name} 的所有面试！`
            };
        }
        
        return {
            interviewEnded: false,
            success: true,
            message: `✅ ${this.roundResults.length}/${this.currentInterview.rounds.length} 轮通过，进入下一轮`
        };
    }
    
    // 获取面试结果
    getInterviewResult() {
        if (!this.currentInterview) return null;
        
        const allPassed = this.roundResults.every(r => r);
        const company = this.currentInterview.company;
        
        if (allPassed && this.roundResults.length === this.currentInterview.rounds.length) {
            // 计算薪资（基于属性和运气）
            const salaryRange = company.salaryRange;
            const statBonus = (this.game.character.softskill / 500);  // 软技能影响薪资谈判
            const salary = salaryRange[0] + (salaryRange[1] - salaryRange[0]) * (0.3 + Math.random() * 0.4 + statBonus * 0.3);
            
            return {
                success: true,
                company: company,
                salary: Math.round(salary),
                type: this.currentInterview.type,
                projectBonus: company.projectBonus,
                resumeValue: company.resumeValue
            };
        }
        
        return {
            success: false,
            company: company,
            failedRound: this.roundResults.length,
            totalRounds: this.currentInterview.rounds.length
        };
    }
    
    // 结束当前面试
    endInterview() {
        const result = this.getInterviewResult();
        this.currentInterview = null;
        this.currentRound = 0;
        this.roundResults = [];
        return result;
    }
    
    // 是否正在面试中
    isInterviewing() {
        return this.currentInterview !== null;
    }
    
    // 获取面试进度信息
    getProgress() {
        if (!this.currentInterview) return null;
        
        return {
            company: this.currentInterview.company.name,
            currentRound: this.currentInterview.currentRoundIndex + 1,
            totalRounds: this.currentInterview.rounds.length,
            roundName: this.getCurrentRound()?.name,
            passedRounds: this.roundResults.filter(r => r).length
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