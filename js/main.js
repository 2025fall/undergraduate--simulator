// 主入口 - 游戏控制器

class GameController {
    constructor() {
        this.game = new Game();
        this.ui = new UIController();
        
        this.bindEvents();
    }
    
    // 绑定事件
    bindEvents() {
        // 开始游戏按钮
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 结束本月按钮
        this.ui.elements.endMonthBtn.addEventListener('click', () => {
            this.endMonth();
        });
    }
    
    // 开始游戏
    startGame() {
        // 生成候选角色
        const candidates = this.game.init();
        
        // 显示角色选择界面
        this.ui.showScreen('characterSelect');
        this.ui.renderCharacterCards(candidates, (index) => {
            this.selectCharacter(index);
        });
    }
    
    // 选择角色
    selectCharacter(index) {
        const character = this.game.selectCharacter(index);
        
        // 切换到游戏界面
        this.ui.showScreen('game');
        this.ui.clearLog();
        
        // 更新UI
        this.ui.updateAll(this.game);
        this.renderActions();
        
        // 添加开始日志
        const school = CONFIG.SCHOOLS[character.schoolType];
        const family = CONFIG.FAMILIES[character.familyType];
        
        this.ui.addLog(`🎓 欢迎来到大学！你是一名${school.displayName}的新生`, 'success');
        this.ui.addLog(`👨‍👩‍👧 家庭背景：${character.familyType} - ${family.buff}`, 'info');
        this.ui.addLog(`📊 初始属性：GPA ${character.gpa.toFixed(2)} | 项目 ${character.project} | 八股 ${character.knowledge} | 软技能 ${character.softskill}`, 'info');
        this.ui.addLog(`💰 初始资金：${character.money.toLocaleString()}元 | 每月生活费：${character.monthlyAllowance}元`, 'info');
        this.ui.addLog('💪 开始你的大学生涯吧！', 'info');
    }
    
    // 渲染行动按钮
    renderActions() {
        const actions = this.game.getAvailableActions();
        this.ui.renderActions(actions, (actionId) => {
            this.executeAction(actionId);
        });
    }
    
    // 执行行动
    executeAction(actionId) {
        const result = this.game.executeAction(actionId);
        
        if (!result.success) {
            this.ui.addLog(`❌ ${result.message}`, 'danger');
            return;
        }
        
        // 记录行动结果
        this.ui.addLog(`✅ ${result.action.name}`, 'success');
        result.results.forEach(r => {
            this.ui.addLog(`   ${r}`, 'info');
        });
        
        // 更新UI
        this.ui.updateResources(this.game.character);
        this.ui.updateStats(this.game.character);
        this.ui.updateResume(this.game.character);
        this.ui.updateAchievements(this.game.achievementSystem.getUnlockedAchievements());
        
        // 处理特殊行动
        if (result.special) {
            this.handleSpecialAction(result.special);
            return;
        }
        
        // 检查精力是否耗尽
        if (this.game.character.isExhausted()) {
            this.ui.addLog('⚠️ 精力耗尽，本月行动结束', 'warning');
        }
        
        // 更新行动按钮
        this.renderActions();
    }
    
    // 处理特殊行动
    handleSpecialAction(special) {
        switch (special.type) {
            case 'interview':
                this.startInterview(special.interviewType);
                break;
            case 'internship':
                this.goInternship(special);
                break;
            case 'endMonth':
                // v1.3 结算行动触发结束月份
                this.endMonthWithAction(special.isEntertainment);
                break;
        }
    }
    
    // v1.3 结算行动结束月份
    endMonthWithAction(isEntertainment) {
        // 标记娱乐消费
        if (isEntertainment) {
            this.game.hadEntertainmentThisMonth = true;
        }
        
        // 执行正常的结束月份流程
        this.endMonth();
    }
    
    // 开始面试
    startInterview(type) {
        const result = this.game.startInterview(type);
        
        if (!result.success) {
            this.ui.addLog(result.message, 'danger');
            this.game.character.modifySanity(-5);  // 简历被拒也扣心态
            this.ui.updateResources(this.game.character);
            this.renderActions();
            return;
        }
        
        this.ui.addLog(result.message, 'success');
        this.ui.updateInterviewCompany(result.company.name);
        
        // 显示第一个问题
        this.showNextInterviewQuestion();
    }
    
    // 显示下一个面试问题
    showNextInterviewQuestion() {
        const question = this.game.getInterviewQuestion();
        const progress = this.game.interviewSystem.getProgress();
        
        this.ui.showInterviewQuestion(question, progress, (optionIndex) => {
            this.answerInterviewQuestion(question, optionIndex);
        });
    }
    
    // 回答面试问题
    answerInterviewQuestion(question, optionIndex) {
        const answerResult = this.game.answerInterviewQuestion(question, optionIndex);
        
        // 处理轮次结果
        const roundResult = this.game.processInterviewRound(answerResult.passed);
        
        // 显示结果
        setTimeout(() => {
            this.ui.showInterviewRoundResult(roundResult, (result) => {
                this.handleInterviewRoundEnd(result);
            });
        }, 500);
    }
    
    // 处理面试轮次结束
    handleInterviewRoundEnd(result) {
        if (result.interviewEnded) {
            // 面试结束
            const interviewResult = this.game.endInterview();
            this.ui.hideModal('interview');
            
            if (interviewResult.success) {
                this.ui.addLog(`🎉 获得 ${interviewResult.company.name} 的Offer！`, 'success');
                
                // v1.3 显示岗位和地理信息
                const jobConfig = CONFIG.JOB_TYPES[interviewResult.jobType];
                const geoConfig = CONFIG.GEOGRAPHY[interviewResult.geography];
                
                if (interviewResult.type === 'internship') {
                    this.ui.addLog(`💼 岗位：${jobConfig?.name || '研发'} | 日薪 ${interviewResult.salary}元`, 'info');
                    this.ui.addLog(`📍 ${geoConfig.icon} ${geoConfig.name} - ${geoConfig.description}`, 'info');
                    
                    // v1.3 提示地理影响
                    if (interviewResult.geography === 'far') {
                        this.ui.addLog(`⚠️ 远距离通勤会扣心态，可选择租房(${CONFIG.GEOGRAPHY.far.rentOption}元/月)`, 'warning');
                    } else if (interviewResult.geography === 'remote') {
                        this.ui.addLog(`⚠️ 异地实习需要租房，每月额外开销2000-4000元`, 'warning');
                    }
                } else {
                    this.ui.addLog(`💰 岗位：${jobConfig?.name || '研发'} | 年薪 ${interviewResult.salary}w`, 'info');
                }
            } else {
                this.ui.addLog(`😢 ${interviewResult.company.name} 面试未通过`, 'danger');
            }
            
            // 更新UI
            this.ui.updateResources(this.game.character);
            this.ui.updateResume(this.game.character);
            this.renderActions();
        } else {
            // 进入下一轮
            this.showNextInterviewQuestion();
        }
    }
    
    // 去实习
    goInternship(special) {
        const company = special.company;
        
        // v1.3 设置实习状态（包括地理信息）
        const geography = company.geography || 'near';
        const geoConfig = this.game.startInternship(company, geography);
        
        this.ui.addLog(`🏢 开始在 ${company.name} 实习...`, 'info');
        this.ui.addLog(`📍 ${geoConfig.icon} ${geoConfig.name}`, 'info');
        
        // v1.3 如果是异地，显示租房费用
        if (geography === 'remote') {
            this.ui.addLog(`🏠 已租房，每月租金 ${this.game.character.rentCost}元`, 'warning');
        }
        
        const result = this.game.skipMonths(special.skipMonths, true);
        
        // 显示实习期间的结算
        result.results.forEach(r => {
            this.ui.addLog(`   ${r}`, 'info');
        });
        
        // v1.3 实习GPA惩罚（3个月不上课，期末大概率挂科）
        const gpaPenalty = -0.8;
        this.game.character.modifyGPA(gpaPenalty);
        this.ui.addLog(`📉 实习期间缺课，GPA ${gpaPenalty}`, 'warning');
        
        this.ui.addLog(`✅ 实习结束！获得了宝贵的工作经验`, 'success');
        
        // 更新UI
        this.ui.updateAll(this.game);
        this.renderActions();
        
        // 检查游戏是否结束
        if (result.endCheck) {
            this.handleGameEnd(result.endCheck);
        }
    }
    
    // 结束本月
    endMonth() {
        const result = this.game.endMonth();
        
        this.ui.addLog(`📅 第${this.game.currentMonth}月开始`, 'info');
        
        // v1.3 显示经济结算信息
        result.results.forEach(r => {
            if (r.includes('生活费') || r.includes('开销') || r.includes('工资')) {
                this.ui.addLog(`💰 ${r}`, 'info');
            } else if (r.includes('心态')) {
                this.ui.addLog(`🧠 ${r}`, 'warning');
            }
        });
        
        // 检查新成就
        if (result.newAchievements && result.newAchievements.length > 0) {
            result.newAchievements.forEach(a => {
                this.ui.addLog(`🏆 解锁成就：${a.name}`, 'success');
            });
        }
        
        // 更新UI
        this.ui.updateAll(this.game);
        this.renderActions();
        
        // 处理事件
        if (result.hasEvent) {
            this.processEvents();
            return;
        }
        
        // 检查游戏结束
        if (result.isGameOver) {
            this.handleGameEnd();
        }
    }
    
    // 处理事件队列
    processEvents() {
        const event = this.game.getNextEvent();
        
        if (!event) {
            // 没有更多事件，检查游戏结束
            if (this.game.isGameOver) {
                this.handleGameEnd();
            }
            return;
        }
        
        this.ui.addLog(`📢 触发事件：${event.title}`, 'event');
        
        this.ui.showEvent(event, (choiceIndex) => {
            const results = this.game.processEventChoice(event, choiceIndex);
            
            // 显示选择结果
            results.forEach(r => {
                this.ui.addLog(`   ${r}`, 'info');
            });
            
            // 更新UI
            this.ui.updateResources(this.game.character);
            this.ui.updateStats(this.game.character);
            this.ui.updateResume(this.game.character);
            
            // 继续处理剩余事件
            setTimeout(() => {
                this.processEvents();
            }, 300);
        });
    }
    
    // 处理游戏结束
    handleGameEnd(endResult) {
        this.game.isGameOver = true;
        
        // 如果是毕业，可能需要处理考研
        if (this.game.graduateSystem.prepareScore > 100) {
            const examResult = this.game.graduateSystem.takeExam();
            if (examResult) {
                if (examResult.passed) {
                    this.ui.addLog(`🎓 考研成功！通过率：${examResult.passChance}%`, 'success');
                } else {
                    this.ui.addLog(`😢 考研失败...通过率：${examResult.passChance}%`, 'danger');
                }
            }
        }
        
        // 获取结局数据
        const endingData = this.game.getEndingData();
        
        // 显示结局界面
        setTimeout(() => {
            this.ui.showEnding(endingData);
        }, 1000);
    }
    
    // 重新开始
    restartGame() {
        this.game.reset();
        this.ui.hideAllModals();
        this.startGame();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});