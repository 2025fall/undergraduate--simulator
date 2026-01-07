// UI控制器

class UIController {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            characterSelect: document.getElementById('character-select-screen'),
            game: document.getElementById('game-screen'),
            ending: document.getElementById('ending-screen')
        };
        
        this.modals = {
            event: document.getElementById('event-modal'),
            interview: document.getElementById('interview-modal'),
            settlement: document.getElementById('settlement-modal')
        };
        
        this.elements = {
            // 状态栏
            currentYear: document.getElementById('current-year'),
            currentMonth: document.getElementById('current-month'),
            monthCount: document.getElementById('month-count'),
            phaseInfo: document.getElementById('phase-info'),
            
            // 角色信息
            charSchool: document.getElementById('char-school'),
            charFamily: document.getElementById('char-family'),
            
            // 资源
            energyBar: document.getElementById('energy-bar'),
            energyText: document.getElementById('energy-text'),
            sanityBar: document.getElementById('sanity-bar'),
            sanityText: document.getElementById('sanity-text'),
            moneyText: document.getElementById('money-text'),
            
            // 属性
            statGpa: document.getElementById('stat-gpa'),
            statProject: document.getElementById('stat-project'),
            statKnowledge: document.getElementById('stat-knowledge'),
            statSoftskill: document.getElementById('stat-softskill'),
            
            // 简历
            resumeList: document.getElementById('resume-list'),
            
            // 行动
            actionButtons: document.getElementById('action-buttons'),
            endMonthBtn: document.getElementById('end-month-btn'),
            
            // 日志
            gameLog: document.getElementById('game-log'),
            
            // 提示
            phaseTips: document.getElementById('phase-tips'),
            achievements: document.getElementById('achievements'),
            
            // 角色选择
            characterCards: document.getElementById('character-cards'),
            
            // 事件弹窗
            eventTitle: document.getElementById('event-title'),
            eventDescription: document.getElementById('event-description'),
            eventChoices: document.getElementById('event-choices'),
            
            // 面试弹窗
            interviewTitle: document.getElementById('interview-title'),
            interviewRound: document.getElementById('interview-round'),
            interviewCompany: document.getElementById('interview-company'),
            interviewQuestion: document.getElementById('interview-question'),
            interviewOptions: document.getElementById('interview-options'),
            interviewResult: document.getElementById('interview-result'),
            interviewPressureBar: document.getElementById('interview-pressure-bar'),
            interviewPressureText: document.getElementById('interview-pressure-text'),
            interviewTag: document.getElementById('interview-tag'),
            settlementOptions: document.getElementById('settlement-options'),
            
            // 结局
            endingTitle: document.getElementById('ending-title'),
            endingContent: document.getElementById('ending-content'),
            finalStats: document.getElementById('final-stats')
        };
    }
    
    // 切换屏幕
    showScreen(screenName) {
        for (const [name, screen] of Object.entries(this.screens)) {
            if (name === screenName) {
                screen.classList.add('active');
            } else {
                screen.classList.remove('active');
            }
        }
    }
    
    // 显示模态框
    showModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.add('active');
        }
    }
    
    // 隐藏模态框
    hideModal(modalName) {
        if (this.modals[modalName]) {
            this.modals[modalName].classList.remove('active');
        }
    }
    
    // 隐藏所有模态框
    hideAllModals() {
        for (const modal of Object.values(this.modals)) {
            modal.classList.remove('active');
        }
    }
    
    // 渲染角色选择卡片
    renderCharacterCards(characters, onSelect) {
        this.elements.characterCards.innerHTML = '';
        
        characters.forEach((char, index) => {
            const card = document.createElement('div');
            card.className = 'character-card';
            const schoolConfig = CONFIG.SCHOOLS[char.schoolType];
            const realSchool = char.schoolName || schoolConfig.displayName;
            const schoolLabel = `${realSchool} (${schoolConfig.displayName})`;
            card.innerHTML = `
                <div class="card-header">
                    <span class="school-badge school-${char.schoolType}">${schoolLabel}</span>
                    <span class="family-tag">👨‍👩‍👧 ${char.familyType}</span>
                </div>
                <div class="card-stats">
                    <div class="card-stat">
                        <span class="label">📖 GPA</span>
                        <span class="value">${char.gpa.toFixed(2)}</span>
                    </div>
                    <div class="card-stat">
                        <span class="label">💻 项目</span>
                        <span class="value">${char.project}</span>
                    </div>
                    <div class="card-stat">
                        <span class="label">📚 八股</span>
                        <span class="value">${char.knowledge}</span>
                    </div>
                    <div class="card-stat">
                        <span class="label">🗣️ 软技能</span>
                        <span class="value">${char.softskill}</span>
                    </div>
                </div>
                <div class="card-buff">
                    ✨ ${CONFIG.FAMILIES[char.familyType].buff}
                </div>
                <button class="btn btn-primary select-btn">选择TA</button>
            `;
            
            card.querySelector('.select-btn').addEventListener('click', () => {
                onSelect(index);
            });
            
            this.elements.characterCards.appendChild(card);
        });
    }
    
    // 更新时间显示（季度制）
    updateTime(quarter) {
        // Q1-Q4=大一，Q5-Q8=大二，Q9-Q12=大三，Q13-Q16=大四
        const year = Math.ceil(quarter / 4);
        const quarterInYear = ((quarter - 1) % 4) + 1;
        
        const yearNames = ['大一', '大二', '大三', '大四'];
        this.elements.currentYear.textContent = yearNames[year - 1] || '大四';
        this.elements.currentMonth.textContent = `Q${quarterInYear}`;
        this.elements.monthCount.textContent = `(${quarter}/16)`;
        
        // 更新阶段（季度制）
        // Q1-8: 积累期, Q9-12: 实习期, Q13-16: 抉择期
        let phase;
        if (quarter <= 8) {
            phase = CONFIG.PHASES.ACCUMULATE;
        } else if (quarter <= 12) {
            phase = CONFIG.PHASES.INTERNSHIP;
        } else {
            phase = CONFIG.PHASES.DECISION;
        }
        
        this.elements.phaseInfo.textContent = `${phase.icon} ${phase.name}`;
        
        // 更新阶段提示
        this.updatePhaseTips(quarter);
    }
    
    // 更新阶段提示（季度制）
    updatePhaseTips(quarter) {
        let tips;
        // Q1-8: 积累期, Q9-12: 实习期, Q13-16: 抉择期
        if (quarter <= 8) {
            tips = CONFIG.PHASE_TIPS.ACCUMULATE;
        } else if (quarter <= 12) {
            tips = CONFIG.PHASE_TIPS.INTERNSHIP;
        } else {
            tips = CONFIG.PHASE_TIPS.DECISION;
        }
        
        this.elements.phaseTips.innerHTML = '<ul>' + 
            tips.map(tip => `<li>${tip}</li>`).join('') + 
            '</ul>';
    }
    
    // 更新角色信息
    updateCharacterInfo(character) {
        const school = CONFIG.SCHOOLS[character.schoolType];
        const family = CONFIG.FAMILIES[character.familyType];
        
        const schoolLabel = character.schoolName ? `${character.schoolName} (${school.displayName})` : school.displayName;
        this.elements.charSchool.textContent = schoolLabel;
        this.elements.charSchool.className = `value school-${character.schoolType}`;
        this.elements.charFamily.textContent = character.familyType;
    }
    
    // 更新资源显示
    updateResources(character) {
        // 精力
        const energyPercent = (character.energy / character.maxEnergy) * 100;
        this.elements.energyBar.style.width = energyPercent + '%';
        this.elements.energyText.textContent = `${character.energy}/${character.maxEnergy}`;
        
        // 心态
        const sanityPercent = (character.sanity / character.maxSanity) * 100;
        this.elements.sanityBar.style.width = sanityPercent + '%';
        this.elements.sanityText.textContent = `${character.sanity}/${character.maxSanity}`;
        
        // 低心态警告
        if (character.sanity < CONFIG.LOW_SANITY_THRESHOLD) {
            this.elements.sanityBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        } else {
            this.elements.sanityBar.style.background = 'linear-gradient(90deg, var(--sanity-color), #ec4899)';
        }
        
        // v1.3 金钱显示
        if (this.elements.moneyText) {
            this.elements.moneyText.textContent = `${character.money.toLocaleString()}元`;
            const moneyEl = this.elements.moneyText;
            moneyEl.classList.toggle('money-warning', character.money < 0);
            moneyEl.classList.toggle('money-critical', character.money >= 0 && character.money < 1000);
        }
    }
    
    // 更新属性显示
    updateStats(character) {
        this.elements.statGpa.textContent = character.gpa.toFixed(2);
        this.elements.statProject.textContent = character.project;
        this.elements.statKnowledge.textContent = character.knowledge;
        this.elements.statSoftskill.textContent = character.softskill;
        
        // GPA颜色
        if (character.gpa >= 3.8) {
            this.elements.statGpa.style.color = '#fbbf24';
        } else if (character.gpa >= 3.5) {
            this.elements.statGpa.style.color = '#4ade80';
        } else if (character.gpa >= 3.0) {
            this.elements.statGpa.style.color = '#60a5fa';
        } else {
            this.elements.statGpa.style.color = '#ef4444';
        }
    }
    
    // 更新简历列表
    updateResume(character) {
        if (character.resumeItems.length === 0) {
            this.elements.resumeList.innerHTML = '<li class="empty-hint">暂无亮点，快去积累吧！</li>';
        } else {
            this.elements.resumeList.innerHTML = character.resumeItems
                .map(item => `<li>${item}</li>`)
                .join('');
        }
    }
    
    // 渲染行动按钮
    renderActions(actions, onAction) {
        this.elements.actionButtons.innerHTML = '';
        
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.disabled = !action.available;
            
            // v1.3 显示金钱消耗
            let costText = '';
            if (action.energyCost > 0) {
                costText += `⚡${action.energyCost}`;
            }
            if (action.moneyCost > 0) {
                costText += costText ? ` 💰${action.moneyCost}` : `💰${action.moneyCost}`;
            }
            if (!costText) {
                costText = '免费';
            }
            
            btn.innerHTML = `
                <span class="action-name">${action.name}</span>
                <span class="action-cost">${costText} ${action.reason ? `| ${action.reason}` : ''}</span>
            `;
            
            if (action.available) {
                btn.addEventListener('click', () => onAction(action.id));
            }
            
            this.elements.actionButtons.appendChild(btn);
        });
    }
    
    // 添加日志
    addLog(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        entry.innerHTML = `<span class="log-time">[${timeStr}]</span> ${message}`;
        
        this.elements.gameLog.insertBefore(entry, this.elements.gameLog.firstChild);
        
        // 限制日志数量
        while (this.elements.gameLog.children.length > 50) {
            this.elements.gameLog.removeChild(this.elements.gameLog.lastChild);
        }
    }
    
    // 清空日志
    clearLog() {
        this.elements.gameLog.innerHTML = '';
    }
    
    // 显示事件弹窗
    showEvent(event, onChoice) {
        this.elements.eventTitle.textContent = event.title;
        this.elements.eventDescription.textContent = event.description;
        
        this.elements.eventChoices.innerHTML = '';
        event.choices.forEach((choice, index) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.addEventListener('click', () => {
                this.hideModal('event');
                onChoice(index);
            });
            this.elements.eventChoices.appendChild(btn);
        });
        
        this.showModal('event');
    }

    // 显示季度结算面板
    showSettlementOptions(options, onSelect) {
        if (!this.elements.settlementOptions) return;
        this.elements.settlementOptions.innerHTML = '';

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'settlement-option' + (option.available ? '' : ' disabled');
            const costLabel = option.moneyCost ? `💰 ${option.moneyCost}` : '免费';
            const reason = option.available ? '' : `<span class="reason">(${option.reason || '条件不足'})</span>`;
            btn.innerHTML = `
                <div class="option-header">
                    <span>${option.name}</span>
                    <span class="option-cost">${costLabel}</span>
                </div>
                <div class="option-desc">${option.description} ${reason}</div>
            `;
            btn.addEventListener('click', () => {
                if (!option.available) return;
                this.hideModal('settlement');
                onSelect(option.id);
            });
            this.elements.settlementOptions.appendChild(btn);
        });

        this.showModal('settlement');
    }
    
    updateInterviewPressure(pressure) {
        if (!pressure || !this.elements.interviewPressureBar) return;
        const percent = Math.min(100, Math.round((pressure.value / pressure.limit) * 100));
        this.elements.interviewPressureBar.style.width = `${percent}%`;
        this.elements.interviewPressureBar.classList.toggle('danger', percent >= 80);
        this.elements.interviewPressureText.textContent = `${pressure.value}/${pressure.limit}`;
    }

    // 显示面试问题
    showInterviewQuestion(question, progress, onAnswer) {
        if (!question) return;
        this.elements.interviewRound.textContent = `第${question.roundIndex}/${question.totalRounds}轮`;
        this.elements.interviewQuestion.textContent = question.question;
        this.elements.interviewResult.classList.remove('show');
        this.elements.interviewTag.textContent = `${question.tag.icon} ${question.tag.label}`;
        this.updateInterviewPressure(progress?.pressure);
        
        this.elements.interviewOptions.innerHTML = '';
        Object.values(INTERVIEW_STRATEGIES).forEach(strategy => {
            const btn = document.createElement('button');
            btn.className = 'interview-option strategy-option';
            btn.innerHTML = `
                <span class="strategy-name">${strategy.name}</span>
                <span class="strategy-desc">${strategy.description}</span>
            `;
            btn.addEventListener('click', () => {
                this.elements.interviewOptions.querySelectorAll('.interview-option').forEach(b => {
                    b.disabled = true;
                    b.classList.remove('selected');
                });
                btn.classList.add('selected');
                onAnswer(strategy.id);
            });
            this.elements.interviewOptions.appendChild(btn);
        });
        
        this.showModal('interview');
    }
    
    // 显示面试轮次结果
    showInterviewRoundResult(result, onContinue) {
        this.updateInterviewPressure(result.pressure);
        const statusClass = result.success ? 'pass' : 'fail';
        this.elements.interviewResult.className = `interview-result show ${statusClass}`;

        const pressureInfo = `${result.pressure.value}/${result.pressure.limit}`;
        const delta = result.pressureChange > 0 ? `+${result.pressureChange}` : result.pressureChange;
        const summary = result.success ? '✅ 策略奏效，压力下降' : (result.pressureBreak ? '💥 压力爆表！' : '⚠️ 压力飙升');

        if (result.interviewEnded) {
            const btnClass = result.passed ? 'btn-success' : 'btn-secondary';
            const btnText = result.passed ? '查看结果' : '继续加油';
            this.elements.interviewResult.innerHTML = `
                <p>${summary}</p>
                <p>压力变化 ${delta} | 当前 ${pressureInfo}</p>
                <button class="btn ${btnClass}" id="interview-continue">${btnText}</button>
            `;
        } else {
            this.elements.interviewResult.innerHTML = `
                <p>${summary}</p>
                <p>压力变化 ${delta} | 当前 ${pressureInfo}</p>
                <button class="btn btn-primary" id="interview-continue">下一轮</button>
            `;
        }

        document.getElementById('interview-continue').addEventListener('click', () => {
            onContinue(result);
        });
    }
    
    // 更新面试公司信息
    updateInterviewCompany(companyName) {
        this.elements.interviewCompany.textContent = companyName;
    }
    
    // 更新成就显示
    updateAchievements(achievements) {
        if (achievements.length === 0) {
            this.elements.achievements.innerHTML = '<div class="empty-hint">暂无成就</div>';
        } else {
            this.elements.achievements.innerHTML = achievements
                .map(a => `
                    <div class="achievement-item">
                        <span class="icon">🏆</span>
                        <span class="name">${a.name}</span>
                    </div>
                `)
                .join('');
        }
    }
    
    // 显示结局
    showEnding(endingData) {
        this.elements.endingTitle.textContent = endingData.title;
        
        this.elements.endingContent.innerHTML = `
            <div class="ending-type">${endingData.icon} ${endingData.title}</div>
            <p class="ending-story">${endingData.description}</p>
            ${endingData.extra || ''}
        `;
        
        this.elements.finalStats.innerHTML = `
            <div class="final-stat-item">
                <span class="label">最终GPA</span>
                <span class="value">${endingData.stats.gpa}</span>
            </div>
            <div class="final-stat-item">
                <span class="label">项目能力</span>
                <span class="value">${endingData.stats.project}</span>
            </div>
            <div class="final-stat-item">
                <span class="label">八股分</span>
                <span class="value">${endingData.stats.knowledge}</span>
            </div>
            <div class="final-stat-item">
                <span class="label">软技能</span>
                <span class="value">${endingData.stats.softskill}</span>
            </div>
            <div class="final-stat-item">
                <span class="label">简历亮点</span>
                <span class="value">${endingData.stats.resumeCount}个</span>
            </div>
            <div class="final-stat-item">
                <span class="label">总行动数</span>
                <span class="value">${endingData.stats.totalActions}次</span>
            </div>
        `;
        
        this.showScreen('ending');
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        this.addLog(message, type);
    }
    
    // 更新全部UI
    updateAll(game) {
        this.updateTime(game.currentQuarter);
        this.updateCharacterInfo(game.character);
        this.updateResources(game.character);
        this.updateStats(game.character);
        this.updateResume(game.character);
        this.updateAchievements(game.achievementSystem.getUnlockedAchievements());
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UIController };
}
