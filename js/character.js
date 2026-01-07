// 角色系统

class Character {
    constructor(data) {
        // 基础信息
        this.schoolType = data.schoolType;
        this.schoolName = data.schoolName || CONFIG.SCHOOLS[this.schoolType]?.displayName;
        this.familyType = data.familyType;
        
        // 显性属性
        this.gpa = data.gpa;
        this.project = data.project;
        this.knowledge = data.knowledge;
        this.softskill = data.softskill;
        
        // 隐藏属性
        this.iq = data.iq;  // 学习能力/智商，影响经验获取倍率
        
        // 资源属性
        this.maxEnergy = CONFIG.INITIAL_ENERGY + (CONFIG.FAMILIES[this.familyType]?.energyBonus || 0);
        this.energy = this.maxEnergy;
        this.sanity = CONFIG.INITIAL_SANITY;
        this.maxSanity = CONFIG.MAX_SANITY;
        
        // 简历亮点
        this.resumeItems = [];
        
        // Buff效果
        this.sanityRecoveryBonus = CONFIG.FAMILIES[this.familyType]?.sanityRecoveryBonus || 0;
        this.quarterlyAllowance = CONFIG.FAMILIES[this.familyType]?.quarterlyAllowance || 0;
        this.quarterlyGap = CONFIG.FAMILIES[this.familyType]?.quarterlyGap || 0;
        
        // v1.3 经济系统
        this.money = CONFIG.FAMILIES[this.familyType]?.initialMoney || 5000;
        this.monthlyAllowance = CONFIG.FAMILIES[this.familyType]?.monthlyAllowance || 0;
        this.isOnBudget = false;  // 省吃俭用模式
        this.rentCost = 0;  // 当前租房费用
        this.isRenting = false;  // 是否在租房
        
        // v1.3 实习状态
        this.currentInternship = null;  // 当前实习信息
        this.commuteType = null;  // 通勤类型: near/far/remote
        
        // 应用家庭背景初始加成
        if (CONFIG.FAMILIES[this.familyType]?.softskillBonus) {
            this.softskill += CONFIG.FAMILIES[this.familyType].softskillBonus;
        }
    }
    
    // 获取学校配置
    getSchoolConfig() {
        return CONFIG.SCHOOLS[this.schoolType];
    }
    
    // 获取家庭配置
    getFamilyConfig() {
        return CONFIG.FAMILIES[this.familyType];
    }
    
    // 获取经验倍率（基于IQ）
    getExpMultiplier() {
        // IQ范围30-100，倍率0.8-1.5
        const base = 0.8 + (this.iq - 30) / 100 * 0.7;
        const schoolMultiplier = CONFIG.SCHOOLS[this.schoolType]?.iqMultiplier || 1;
        return base * schoolMultiplier;
    }

    getInterviewPressureBonus() {
        return CONFIG.SCHOOLS[this.schoolType]?.pressureBonus || 0;
    }
    
    // 获取简历通过率
    getResumePassRate() {
        const baseRate = this.getSchoolConfig().resumePassRate;
        // 根据简历亮点数量增加通过率
        const resumeBonus = this.resumeItems.length * 0.05;
        return Math.min(0.98, baseRate + resumeBonus);
    }
    
    // 消耗精力
    consumeEnergy(amount) {
        this.energy = Math.max(0, this.energy - amount);
        return this.energy;
    }
    
    // 恢复精力（每月开始时）
    restoreEnergy() {
        this.energy = this.maxEnergy;
    }
    
    // 修改心态
    modifySanity(amount) {
        // 应用心态恢复加成（仅正向）
        if (amount > 0) {
            amount = Math.floor(amount * (1 + this.sanityRecoveryBonus));
        }
        this.sanity = Math.max(0, Math.min(this.maxSanity, this.sanity + amount));
        return this.sanity;
    }
    
    // 修改GPA
    modifyGPA(amount) {
        // GPA范围0-4.0
        this.gpa = Math.max(0, Math.min(4.0, this.gpa + amount));
        return this.gpa;
    }
    
    // 修改属性（应用IQ加成）
    modifyStat(stat, amount, applyIQBonus = true) {
        if (applyIQBonus && amount > 0) {
            amount = Math.floor(amount * this.getExpMultiplier());
        }
        
        switch(stat) {
            case 'gpa':
                return this.modifyGPA(amount);
            case 'project':
                this.project = Math.max(0, Math.min(999, this.project + amount));
                return this.project;
            case 'knowledge':
                this.knowledge = Math.max(0, Math.min(999, this.knowledge + amount));
                return this.knowledge;
            case 'softskill':
                this.softskill = Math.max(0, Math.min(999, this.softskill + amount));
                return this.softskill;
            case 'sanity':
                return this.modifySanity(amount);
            case 'energy':
                this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy + amount));
                return this.energy;
            case 'money':
                return this.modifyMoney(amount);
        }
    }
    
    // v1.3 修改金钱
    modifyMoney(amount) {
        this.money += amount;
        // 检查是否需要进入省吃俭用模式
        if (this.money < 0) {
            this.isOnBudget = true;
        }
        return this.money;
    }
    
    // v1.3 设置租房状态
    setRenting(isRenting, rentCost = 0) {
        this.isRenting = isRenting;
        this.rentCost = rentCost;
    }
    
    // v1.3 设置通勤类型
    setCommuteType(type) {
        this.commuteType = type;
    }
    
    // v1.3 获取每月总开销
    getMonthlyExpense() {
        let expense = CONFIG.MONTHLY_EXPENSE;  // 基础生活开销
        if (this.isRenting) {
            expense += this.rentCost;
        }
        if (this.isOnBudget) {
            expense = Math.floor(expense * 0.5);  // 省吃俭用减半
        }
        return expense;
    }
    
    // v1.3 处理每月经济结算
    processMonthlyFinance() {
        const results = [];
        
        // 收入：生活费
        this.money += this.monthlyAllowance;
        results.push(`收到生活费 +${this.monthlyAllowance}元`);
        
        // 支出：生活开销
        const expense = this.getMonthlyExpense();
        this.money -= expense;
        results.push(`生活开销 -${expense}元`);
        
        // 检查破产
        if (this.money < -5000) {
            results.push('⚠️ 严重缺钱，触发向家里要钱事件');
            return { results, triggerBorrowEvent: true };
        }
        
        // 省吃俭用的心态惩罚
        if (this.isOnBudget) {
            this.modifySanity(-10);
            results.push('省吃俭用中，心态 -10');
        }
        
        return { results, triggerBorrowEvent: false };
    }
    
    // v1.3 检查是否破产
    isBankrupt() {
        return this.money < -5000;
    }
    
    // 添加简历亮点
    addResumeItem(item) {
        if (!this.resumeItems.includes(item)) {
            this.resumeItems.push(item);
            return true;
        }
        return false;
    }
    
    // 检查是否精力耗尽
    isExhausted() {
        return this.energy <= 0;
    }
    
    // 检查心态是否过低
    isLowSanity() {
        return this.sanity < CONFIG.LOW_SANITY_THRESHOLD;
    }
    
    // 检查是否可以进行高难度行动
    canDoHardAction() {
        return this.sanity >= CONFIG.LOW_SANITY_THRESHOLD;
    }
    
    // 获取角色摘要信息
    getSummary() {
        return {
            school: CONFIG.SCHOOLS[this.schoolType].displayName,
            schoolName: this.schoolName,
            family: this.familyType,
            gpa: this.gpa.toFixed(2),
            project: this.project,
            knowledge: this.knowledge,
            softskill: this.softskill,
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            sanity: this.sanity,
            money: this.money,
            isOnBudget: this.isOnBudget,
            resumeItems: this.resumeItems
        };
    }
}

// 角色生成器
class CharacterGenerator {
    // 生成随机数（范围内）
    static randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // 生成随机小数（范围内）
    static randomFloatInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // 随机选择数组元素
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // 生成单个随机角色
    static generateCharacter() {
        // 随机选择学校和家庭背景
        const schoolTypes = Object.keys(CONFIG.SCHOOLS);
        const familyTypes = Object.keys(CONFIG.FAMILIES);
        
        const schoolWeights = {
            'Top2': 0.05,
            '985': 0.15,
            '211': 0.30,
            '双非': 0.40,
            '民办': 0.10
        };
        const familyWeights = {
            '富二代': 0.05,
            '互联网世家': 0.10,
            '中产家庭': 0.35,
            '工薪阶层': 0.50
        };
        
        const schoolType = this.weightedRandomChoice(schoolTypes, schoolWeights);
        const familyType = this.weightedRandomChoice(familyTypes, familyWeights);
        
        const schoolConfig = CONFIG.SCHOOLS[schoolType];
        const familyConfig = CONFIG.FAMILIES[familyType];
        
        // 生成属性
        const gpa = this.randomFloatInRange(schoolConfig.gpaRange[0], schoolConfig.gpaRange[1]);
        const project = this.randomInRange(schoolConfig.projectRange[0], schoolConfig.projectRange[1]);
        const knowledge = this.randomInRange(schoolConfig.knowledgeRange[0], schoolConfig.knowledgeRange[1]);
        const softskill = this.randomInRange(schoolConfig.softskillRange[0], schoolConfig.softskillRange[1]);
        
        // 生成隐藏IQ（基于学校）
        const iq = this.randomInRange(schoolConfig.iqRange[0], schoolConfig.iqRange[1]);
        
        const schoolName = this.randomChoice(schoolConfig.representatives || [schoolConfig.displayName]);
        
        return new Character({
            schoolType,
            schoolName,
            familyType,
            gpa: Math.round(gpa * 100) / 100,
            project,
            knowledge,
            softskill,
            iq
        });
    }
    
    // 加权随机选择
    static weightedRandomChoice(items, weights) {
        const totalWeight = items.reduce((sum, item) => sum + (weights[item] || 1), 0);
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= weights[item] || 1;
            if (random <= 0) {
                return item;
            }
        }
        
        return items[items.length - 1];
    }
    
    // 生成多个候选角色
    static generateCandidates(count = 5) {
        const candidates = [];
        const usedCombos = new Set();
        
        while (candidates.length < count) {
            const character = this.generateCharacter();
            const combo = `${character.schoolType}-${character.familyType}`;
            
            // 避免完全相同的学校+家庭组合
            if (!usedCombos.has(combo)) {
                usedCombos.add(combo);
                candidates.push(character);
            }
        }
        
        return candidates;
    }
}

// 导出（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Character, CharacterGenerator };
}
