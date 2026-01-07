// 事件系统

class EventSystem {
    constructor(game) {
        this.game = game;
        this.triggeredEvents = new Set();  // 已触发的一次性事件
        this.eventQueue = [];  // 待处理的事件队列
    }
    
    // 检查并触发随机事件
    checkRandomEvents() {
        const availableEvents = RANDOM_EVENTS.filter(event => {
            // 检查是否已触发过（一次性事件）
            if (event.isSpecial && this.triggeredEvents.has(event.id)) {
                return false;
            }
            
            // 检查触发条件
            if (event.condition && !event.condition(this.game)) {
                return false;
            }
            
            // 特殊事件（概率为0的）需要强制触发条件
            if (event.probability === 0 && !event.forceShow) {
                return false;
            }
            
            return true;
        });
        
        // 检查特殊强制事件
        const forceEvents = availableEvents.filter(e => e.forceShow && e.condition(this.game));
        if (forceEvents.length > 0) {
            this.eventQueue.push(...forceEvents);
            forceEvents.forEach(e => {
                if (e.isSpecial) this.triggeredEvents.add(e.id);
            });
            return true;
        }
        
        // 随机触发普通事件
        for (const event of availableEvents) {
            if (event.probability > 0 && Math.random() < event.probability) {
                this.eventQueue.push(event);
                if (event.isSpecial) {
                    this.triggeredEvents.add(event.id);
                }
                return true;  // 每月最多触发一个随机事件
            }
        }
        
        return false;
    }
    
    // 检查家庭特殊事件
    checkFamilySpecialEvent() {
        const familyConfig = this.game.character.getFamilyConfig();
        
        if (familyConfig.specialEvent) {
            const specialEvent = familyConfig.specialEvent;
            
            // 互联网世家的内推事件
            if (specialEvent.type === 'referral' && 
                this.game.currentQuarter === specialEvent.triggerQuarter &&
                !this.triggeredEvents.has('family_referral')) {
                
                if (Math.random() < specialEvent.chance) {
                    const referralEvent = RANDOM_EVENTS.find(e => e.id === 'family_referral');
                    if (referralEvent) {
                        this.eventQueue.push(referralEvent);
                        this.triggeredEvents.add('family_referral');
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // 获取下一个待处理事件
    getNextEvent() {
        return this.eventQueue.shift();
    }
    
    // 是否有待处理事件
    hasEvents() {
        return this.eventQueue.length > 0;
    }
    
    // 处理事件选择结果
    processEventChoice(event, choiceIndex) {
        const choice = event.choices[choiceIndex];
        const results = [];
        
        // 应用效果
        if (choice.effects) {
            for (const [stat, value] of Object.entries(choice.effects)) {
                const oldValue = this.game.character[stat];
                this.game.character.modifyStat(stat, value, false);  // 事件效果不应用IQ加成
                const newValue = this.game.character[stat];
                
                const statNames = {
                    gpa: 'GPA',
                    project: '项目能力',
                    knowledge: '八股分',
                    softskill: '软技能',
                    sanity: '心态',
                    energy: '精力'
                };
                
                const sign = value >= 0 ? '+' : '';
                if (stat === 'gpa') {
                    results.push(`${statNames[stat]} ${sign}${value.toFixed(2)}`);
                } else {
                    results.push(`${statNames[stat]} ${sign}${value}`);
                }
            }
        }
        
        // 添加简历亮点
        if (choice.resumeItem) {
            this.game.character.addResumeItem(choice.resumeItem);
            results.push(`📄 获得简历亮点：${choice.resumeItem}`);
        }
        
        // 特殊效果：获得实习offer
        if (choice.grantInternshipOffer) {
            this.game.hasInternshipOffer = true;
            this.game.internshipCompany = choice.internshipCompany || { name: '亲戚公司(内推)', tier: 'T1.5' };
            results.push('🎉 获得实习内推机会！');
        }
        
        // 特殊效果：设置结局
        if (choice.setEnding) {
            this.game.forcedEnding = choice.setEnding;
            results.push('🎓 已确定发展路线');
        }
        
        return results;
    }
    
    // 添加自定义事件到队列
    addEvent(event) {
        this.eventQueue.push(event);
    }
    
    // 创建自定义事件
    createCustomEvent(title, description, choices) {
        return {
            id: 'custom_' + Date.now(),
            title,
            description,
            choices
        };
    }
}

// 成就系统
class AchievementSystem {
    constructor(game) {
        this.game = game;
        this.unlockedAchievements = [];
        
        this.achievements = [
            {
                id: 'first_blood',
                name: '🎯 First Blood',
                description: '完成第一次行动',
                condition: () => this.game.totalActions >= 1
            },
            {
                id: 'gpa_king',
                name: '📚 学霸降临',
                description: 'GPA达到3.9以上',
                condition: () => this.game.character?.gpa >= 3.9
            },
            {
                id: 'project_master',
                name: '💻 项目大师',
                description: '项目能力达到300',
                condition: () => this.game.character?.project >= 300
            },
            {
                id: 'eight_part_essay',
                name: '📖 八股文圣体',
                description: '八股分达到300',
                condition: () => this.game.character?.knowledge >= 300
            },
            {
                id: 'social_butterfly',
                name: '🦋 社交达人',
                description: '软技能达到200',
                condition: () => this.game.character?.softskill >= 200
            },
            {
                id: 'resume_star',
                name: '⭐ 简历之星',
                description: '收集5个简历亮点',
                condition: () => this.game.character?.resumeItems.length >= 5
            },
            {
                id: 'offer_collector',
                name: '🎉 Offer收割机',
                description: '获得3个以上offer',
                condition: () => this.game.offers.length >= 3
            },
            {
                id: 'survivor',
                name: '💪 幸存者',
                description: '心态低于20后恢复到60以上',
                condition: () => this.game.hadLowSanity && this.game.character?.sanity >= 60
            },
            {
                id: 'speedrunner',
                name: '⚡ 速通玩家',
                description: '在第30个月前获得大厂offer',
                condition: () => this.game.currentMonth <= 30 && this.game.offers.some(o => o.tier === 'T1')
            },
            {
                id: 'all_rounder',
                name: '🌟 六边形战士',
                description: '所有属性均衡发展（项目、八股、软技能都达到150）',
                condition: () => {
                    const c = this.game.character;
                    return c && c.project >= 150 && c.knowledge >= 150 && c.softskill >= 150;
                }
            }
        ];
    }
    
    // 检查并解锁成就
    checkAchievements() {
        const newAchievements = [];
        
        for (const achievement of this.achievements) {
            if (!this.unlockedAchievements.includes(achievement.id)) {
                try {
                    if (achievement.condition()) {
                        this.unlockedAchievements.push(achievement.id);
                        newAchievements.push(achievement);
                    }
                } catch (e) {
                    // 条件检查失败，忽略
                }
            }
        }
        
        return newAchievements;
    }
    
    // 获取已解锁成就
    getUnlockedAchievements() {
        return this.achievements.filter(a => this.unlockedAchievements.includes(a.id));
    }
    
    // 获取成就进度
    getProgress() {
        return {
            unlocked: this.unlockedAchievements.length,
            total: this.achievements.length
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventSystem, AchievementSystem };
}
