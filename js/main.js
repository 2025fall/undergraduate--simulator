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
        }
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
                if (interviewResult.type === 'internship') {
                    this.ui.addLog(`💼 可以去实习了！日薪 ${interviewResult.salary}元`, 'info');
                } else {
                    this.ui.addLog(`💰 年薪 ${interviewResult.salary}w`, 'info');
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
        this.ui.addLog(`🏢 开始在 ${special.company.name} 实习...`, 'info');
        
        const endResult = this.game.skipMonths(special.skipMonths);
        
        this.ui.addLog(`✅ 实习结束！获得了宝贵的工作经验`, 'success');
        
        // 更新UI
        this.ui.updateAll(this.game);
        this.renderActions();
        
        // 检查游戏是否结束
        if (endResult) {
            this.handleGameEnd(endResult);
        }
    }
    
    // 结束本月
    endMonth() {
        const result = this.game.endMonth();
        
        this.ui.addLog(`📅 第${this.game.currentMonth}月开始`, 'info');
        
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