// 行动系统

class ActionSystem {
    constructor(game) {
        this.game = game;
    }
    
    // 获取当前可用的行动
    getAvailableActions() {
        const actions = [];
        
        for (const [id, action] of Object.entries(ACTIONS)) {
            const available = action.available(this.game);
            const canAffordEnergy = this.game.character.energy >= action.energyCost;
            // v1.3 金钱检查
            const canAffordMoney = !action.moneyCost || this.game.character.money >= action.moneyCost;
            const sanityOK = !action.sanityDrain || this.game.character.canDoHardAction();
            
            // 特殊条件检查
            let specialCondition = true;
            if (action.requireOffer === 'internship' && !this.game.hasInternshipOffer) {
                specialCondition = false;
            }
            
            actions.push({
                ...action,
                available: available && canAffordEnergy && canAffordMoney && sanityOK && specialCondition,
                reason: this.getUnavailableReason(action, available, canAffordEnergy, canAffordMoney, sanityOK, specialCondition)
            });
        }
        
        return actions;
    }
    
    // 获取不可用原因
    getUnavailableReason(action, available, canAffordEnergy, canAffordMoney, sanityOK, specialCondition) {
        if (!available) {
            if (action.id === 'applyInternship' || action.id === 'goInternship') {
                return '大三才能解锁';
            }
            if (action.id === 'applyJob' || action.id === 'prepareGraduate') {
                return '大四才能解锁';
            }
            if (action.id === 'entertainment' || action.id === 'luxuryTrip') {
                return '金钱不足';
            }
            return '条件不满足';
        }
        if (!canAffordEnergy) {
            return '精力不足';
        }
        if (!canAffordMoney) {
            return '金钱不足';
        }
        if (!sanityOK) {
            return '心态过低';
        }
        if (!specialCondition) {
            if (action.requireOffer === 'internship') {
                return '需要先获得实习offer';
            }
        }
        return null;
    }
    
    // 执行行动
    executeAction(actionId) {
        const action = ACTIONS[actionId];
        if (!action) {
            return { success: false, message: '未知行动' };
        }
        
        // 检查是否可执行
        const availableActions = this.getAvailableActions();
        const actionInfo = availableActions.find(a => a.id === actionId);
        
        if (!actionInfo || !actionInfo.available) {
            return { 
                success: false, 
                message: actionInfo?.reason || '无法执行此行动'
            };
        }
        
        const results = [];
        
        // 消耗精力
        if (action.energyCost > 0) {
            this.game.character.consumeEnergy(action.energyCost);
            results.push(`消耗精力 ${action.energyCost}`);
        }
        
        // v1.3 消耗金钱
        if (action.moneyCost > 0) {
            this.game.character.modifyMoney(-action.moneyCost);
            results.push(`消耗金钱 ${action.moneyCost}元`);
        }
        
        // v1.3 兼职打工获取金钱
        if (action.moneyGain > 0) {
            this.game.character.modifyMoney(action.moneyGain);
            results.push(`获得金钱 +${action.moneyGain}元`);
        }
        
        // v1.3 恢复精力（休息类行动）
        if (action.restoreEnergy) {
            this.game.character.restoreEnergy();
            results.push(`精力已恢复`);
        }
        
        // v1.3 标记娱乐消费
        if (action.isEntertainment) {
            this.game.hadEntertainmentThisQuarter = true;
        }
        
        // 应用心态消耗
        if (action.sanityDrain) {
            this.game.character.modifySanity(-action.sanityDrain);
            results.push(`心态 -${action.sanityDrain}`);
        }
        
        // 应用属性效果
        if (action.effects) {
            const effectResults = this.applyEffects(action.effects);
            results.push(...effectResults);
        }
        
        // 检查简历亮点获取
        if (action.resumeChance && Math.random() < action.resumeChance) {
            const resumeItem = action.resumeItems[Math.floor(Math.random() * action.resumeItems.length)];
            if (this.game.character.addResumeItem(resumeItem)) {
                results.push(`📄 获得简历亮点：${resumeItem}`);
            }
        }
        
        // 特殊行动处理
        let specialResult = null;
        
        // 触发面试
        if (action.triggerInterview) {
            specialResult = {
                type: 'interview',
                interviewType: action.interviewType
            };
        }
        
        // 去实习（跳过时间）
        if (action.skipMonths) {
            specialResult = {
                type: 'internship',
                skipMonths: action.skipMonths,
                company: this.game.internshipCompany
            };
            
            // 添加实习简历
            if (action.resumeItem) {
                this.game.character.addResumeItem(this.game.internshipCompany?.resumeValue || action.resumeItem);
            }
            
            // 应用实习效果
            if (this.game.internshipCompany?.projectBonus) {
                this.game.character.modifyStat('project', this.game.internshipCompany.projectBonus, true);
                results.push(`项目能力 +${this.game.internshipCompany.projectBonus}`);
            }
        }
        
        // 考研备考
        if (action.id === 'prepareGraduate') {
            const preparePoints = 15 + Math.floor(Math.random() * 10);
            this.game.graduateSystem.addPrepareScore(preparePoints);
            results.push(`📚 考研备考 +${preparePoints}`);
        }
        
        // v1.3 结算行动触发结束季度
        if (action.endQuarter) {
            specialResult = {
                type: 'endQuarter',
                isEntertainment: action.isEntertainment || false
            };
        }
        
        // 增加行动计数
        this.game.totalActions++;
        
        return {
            success: true,
            action: action,
            results: results,
            special: specialResult
        };
    }
    
    // 应用效果
    applyEffects(effects) {
        const results = [];
        const character = this.game.character;
        
        for (const [stat, config] of Object.entries(effects)) {
            // 计算基础值 + 随机波动
            let value = config.base;
            if (config.variance) {
                value += (Math.random() - 0.5) * 2 * config.variance;
            }
            
            // GPA特殊处理
            if (stat === 'gpa') {
                value = Math.round(value * 100) / 100;
                const oldValue = character.gpa;
                character.modifyStat(stat, value, false);  // GPA不应用IQ加成
                const change = (character.gpa - oldValue).toFixed(2);
                results.push(`GPA ${change >= 0 ? '+' : ''}${change}`);
            } else {
                value = Math.round(value);
                const oldValue = character[stat];
                const applyIQ = stat !== 'sanity' && stat !== 'energy';
                character.modifyStat(stat, value, applyIQ);
                const actualChange = Math.round(character[stat] - oldValue);
                
                const statNames = {
                    project: '项目能力',
                    knowledge: '八股分',
                    softskill: '软技能',
                    sanity: '心态',
                    energy: '精力'
                };
                
                if (actualChange !== 0) {
                    results.push(`${statNames[stat]} ${actualChange >= 0 ? '+' : ''}${actualChange}`);
                }
            }
        }
        
        return results;
    }
    
    // 获取行动描述
    getActionDescription(actionId) {
        const action = ACTIONS[actionId];
        if (!action) return '';
        
        let desc = action.description + '\n\n';
        desc += `消耗精力：${action.energyCost}\n`;
        
        if (action.effects) {
            desc += '效果：\n';
            for (const [stat, config] of Object.entries(action.effects)) {
                const statNames = {
                    gpa: 'GPA',
                    project: '项目能力',
                    knowledge: '八股分',
                    softskill: '软技能',
                    sanity: '心态'
                };
                desc += `  ${statNames[stat]}: +${config.base}(±${config.variance || 0})\n`;
            }
        }
        
        return desc;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ActionSystem };
}