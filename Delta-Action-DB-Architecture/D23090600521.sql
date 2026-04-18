CREATE DATABASE IF NOT EXISTS deltaforce_gamesys;
USE deltaforce_gamesys;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(50) NOT NULL,
    level INT DEFAULT 1,
    experience INT DEFAULT 0
);

-- 给 level 列添加索引
CREATE INDEX idx_level ON users(level);

-- 给 experience 列添加索引
CREATE INDEX idx_experience ON users(experience);

CREATE TABLE IF NOT EXISTS activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    act_name VARCHAR(50) NOT NULL,
    act_type VARCHAR(50) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_limited_time BOOLEAN DEFAULT FALSE,
    reward_description TEXT,
    completed_users INT DEFAULT 0,         -- 已完成活动的用户数量
    total_participants INT DEFAULT 0,      -- 活动总参与人数
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 记录创建时间
);

CREATE TABLE IF NOT EXISTS chracters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    character_name VARCHAR(100) NOT NULL,         -- 角色名称
    class_type VARCHAR(50) NOT NULL,              -- 兵种类型
    subordinate_to VARCHAR(100),                  -- 该角色所属兵种
    profession_equipment TEXT,                    -- 职业装备（JSON 格式或逗号分隔）
    special_equipment TEXT,                       -- 特殊装备（JSON 格式或逗号分隔）
    special_ability TEXT,                         -- 特殊技能
    FOREIGN KEY (subordinate_to) REFERENCES classes(class_type)  -- 外键关联兵种表
);



-- 兵种表
CREATE TABLE IF NOT EXISTS classes (
    class_type VARCHAR(50) PRIMARY KEY,    -- 兵种类型
    description TEXT                       -- 兵种描述
);

-- 武器表

CREATE TABLE weapons (
    weapon_id INT PRIMARY KEY AUTO_INCREMENT,  -- 武器唯一标识
    weapon_name VARCHAR(100) NOT NULL,         -- 武器名称
    weapon_type VARCHAR(50) NOT NULL,          -- 武器种类（如“步枪”，“冲锋枪”等）
    base_damage INT NOT NULL,                  -- 基础伤害
    advantage_range INT NOT NULL,              -- 优势射程（米）
    damage_decay_percentage DECIMAL(5, 2) NOT NULL, -- 衰减百分比
    rate_of_fire INT NOT NULL,                 -- 射速（每分钟）
    recoil_index DECIMAL(5, 2) NOT NULL,       -- 后坐力指数
    spread_5m DECIMAL(5, 2) NOT NULL,          -- 5米散布指数
    spread_15m DECIMAL(5, 2) NOT NULL,         -- 15米散布指数
    spread_30m DECIMAL(5, 2) NOT NULL          -- 30米散布指数
);

CREATE TABLE attachment_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT, -- 类型ID
    type_name VARCHAR(50) NOT NULL          -- 配件类型名称
);

CREATE TABLE attachments (
    attachment_id INT PRIMARY KEY AUTO_INCREMENT,  -- 配件ID
    type_id INT NOT NULL,                          -- 配件类型（外键关联 attachment_types）
    name VARCHAR(100) NOT NULL,                    -- 配件名称
    recoil_control DECIMAL(5, 2),                  -- 后坐力控制（%）
    horizontal_recoil_control DECIMAL(5, 2),       -- 水平后坐力控制（%）
    vertical_recoil_control DECIMAL(5, 2),         -- 垂直后坐力控制（%）
    ads_speed DECIMAL(5, 2),                       -- 开镜速度（%）
    hipfire_accuracy DECIMAL(5, 2),                -- 腰射准度（%）
    ergonomics DECIMAL(5, 2),                      -- 人机工效（%）
    scope_magnification DECIMAL(5, 2),             -- 准镜倍率，仅准镜有效
    FOREIGN KEY (type_id) REFERENCES attachment_types(type_id)
);


-- 触发器1：确保贴片和枪灯不能同时装备？？？？？？
DELIMITER $$

CREATE TRIGGER check_attachment_conflict_patch_light
BEFORE INSERT ON attachments
FOR EACH ROW
BEGIN
    IF (NEW.type_id = 4 AND EXISTS (SELECT 1 FROM attachments WHERE type_id = 3)) OR 
       (NEW.type_id = 3 AND EXISTS (SELECT 1 FROM attachments WHERE type_id = 4)) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '不能同时装备贴片和枪灯！';
    END IF;
END $$

DELIMITER ;
-- 触发器2：确保增高架和高倍率准镜不能同时装备？？？？？？
DELIMITER $$

CREATE TRIGGER check_attachment_conflict_scope_adapter
BEFORE INSERT ON attachments
FOR EACH ROW
BEGIN
    IF (NEW.type_id = 11 AND EXISTS (SELECT 1 FROM attachments WHERE type_id = 10)) OR 
       (NEW.type_id = 10 AND EXISTS (SELECT 1 FROM attachments WHERE type_id = 11)) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = '不能同时装备增高架和高倍率准镜！';
    END IF;
END $$

-- 删除触发器1：check_attachment_conflict_patch_light
DROP TRIGGER IF EXISTS check_attachment_conflict_patch_light;

-- 删除触发器2：check_attachment_conflict_scope_adapter
DROP TRIGGER IF EXISTS check_attachment_conflict_scope_adapter;





DELIMITER ;

CREATE TABLE equipment_types (
    type_id INT PRIMARY KEY AUTO_INCREMENT,  -- 类型ID
    type_name VARCHAR(50) NOT NULL          -- 装备类型名称（伤害装备、治疗装备、防护装备）
);

CREATE TABLE equipment_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,          -- 装备ID
    type_id INT NOT NULL,                            -- 装备类型（外键关联 equipment_types）
    name VARCHAR(100) NOT NULL,                      -- 装备名称
    damage DECIMAL(5, 2),                            -- 伤害（伤害装备用）
    armor_penetration DECIMAL(5, 2),                 -- 穿甲衰减（伤害装备用）
    healing_amount DECIMAL(5, 2),                    -- 治疗量（治疗装备用）
    healing_time DECIMAL(5, 2),                      -- 治疗时间（治疗装备用）
    duration DECIMAL(5, 2),                          -- 持续时间（治疗装备用）
    protection_limit DECIMAL(5, 2),                  -- 防护上限（防护装备用）
    protection_degradation DECIMAL(5, 2),            -- 防护衰减（防护装备用）
    FOREIGN KEY (type_id) REFERENCES equipment_types(type_id)
);
-- 触发器3：确保伤害装备只包含伤害和穿甲衰减
DELIMITER $$

CREATE TRIGGER check_damage_equipment
BEFORE INSERT ON equipment_items
FOR EACH ROW
BEGIN
    IF NEW.type_id = 1 THEN
        IF NEW.healing_amount IS NOT NULL OR NEW.healing_time IS NOT NULL OR NEW.duration IS NOT NULL OR NEW.protection_limit IS NOT NULL OR NEW.protection_degradation IS NOT NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '伤害装备只能包含伤害和穿甲衰减！';
        END IF;
    END IF;
END $$

DELIMITER ;
-- 触发器4：确保治疗装备只包含治疗量、治疗时间和持续时间
DELIMITER $$

CREATE TRIGGER check_healing_equipment
BEFORE INSERT ON equipment_items
FOR EACH ROW
BEGIN
    IF NEW.type_id = 2 THEN
        IF NEW.damage IS NOT NULL OR NEW.armor_penetration IS NOT NULL OR NEW.protection_limit IS NOT NULL OR NEW.protection_degradation IS NOT NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '治疗装备只能包含治疗量、治疗时间和持续时间！';
        END IF;
    END IF;
END $$

DELIMITER ;
-- 触发器5：确保防护装备只包含防护上限和防护衰减
DELIMITER $$

CREATE TRIGGER check_protection_equipment
BEFORE INSERT ON equipment_items
FOR EACH ROW
BEGIN
    IF NEW.type_id = 3 THEN
        IF NEW.damage IS NOT NULL OR NEW.armor_penetration IS NOT NULL OR NEW.healing_amount IS NOT NULL OR NEW.healing_time IS NOT NULL OR NEW.duration IS NOT NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '防护装备只能包含防护上限和防护衰减！';
        END IF;
    END IF;
END $$

DELIMITER ;



-- ！！！！！！！！！！！！！！


-- 任务表
CREATE TABLE missions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mission_name VARCHAR(50) NOT NULL,
    description TEXT,
    reward_description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL
);

CREATE TABLE player_missions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    mission_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (player_id) REFERENCES users(id),
    FOREIGN KEY (mission_id) REFERENCES missions(id)
);

-- 任务触发器6：确保玩家任务结束时间早于任务的结束时间
DELIMITER $$

CREATE TRIGGER before_update_completed
BEFORE UPDATE ON player_missions
FOR EACH ROW
BEGIN
    DECLARE mission_end_time DATETIME;

    -- 获取对应任务的结束时间
    SELECT end_time 
    INTO mission_end_time
    FROM missions
    WHERE id = NEW.mission_id;

    -- 验证条件：进度为100%，且玩家任务结束时间早于任务的结束时间
    IF NEW.completed = TRUE THEN
        IF NEW.progress < 100 OR NEW.end_time >= mission_end_time THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '任务无法标记为完成：进度未达到100%或任务结束时间不合法';
        END IF;
    END IF;
END $$

DELIMITER ;

-- 排行榜表？？？
CREATE TABLE raking_list (
    id INT PRIMARY KEY AUTO_INCREMENT,
    player_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    level INT NOT NULL,
    experience INT NOT NULL,
    FOREIGN KEY (level) REFERENCES users(level),
    FOREIGN KEY (experience) REFERENCES users(experience),
    FOREIGN KEY (player_id) REFERENCES users(id)
);
    
SHOW INDEX FROM users;


-- 触发器7：确保排行榜记录按分数、等级、经验值排序
DELIMITER $$

CREATE TRIGGER validate_ranking_order
BEFORE INSERT ON raking_list
FOR EACH ROW
BEGIN
    DECLARE next_score INT;
    DECLARE next_level INT;
    DECLARE next_experience INT;

    -- 获取当前插入记录的下一位记录的信息
    SELECT score, level, experience
    INTO next_score, next_level, next_experience
    FROM raking_list
    WHERE id = NEW.id + 1;

    -- 检查规则
    IF next_score IS NOT NULL THEN
        -- 检查分数
        IF NEW.score < next_score THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Score cannot be less than the next ID\'s score';
        END IF;

        -- 检查等级（当分数相同时）
        IF NEW.score = next_score AND NEW.level < next_level THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Level cannot be less than the next ID\'s level when scores are equal';
        END IF;

        -- 检查经验值（当分数和等级都相同时）
        IF NEW.score = next_score AND NEW.level = next_level AND NEW.experience < next_experience THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Experience cannot be less than the next ID\'s experience when score and level are equal';
        END IF;
    END IF;
END $$

DELIMITER ;


-- 交易信息表
CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,   -- 交易唯一标识
    buyer_id INT NOT NULL,                           -- 买家ID
    seller_id INT NOT NULL,                          -- 卖家ID
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 交易时间
    total_price DECIMAL(10, 2) NOT NULL,             -- 总价
    status ENUM('pending', 'completed', 'cancelled') NOT NULL, -- 交易状态（待处理、完成、取消）
    FOREIGN KEY (buyer_id) REFERENCES users(id),    -- 买家（关联用户表）
    FOREIGN KEY (seller_id) REFERENCES users(id)    -- 卖家（关联用户表）
);


DELIMITER $$

CREATE TRIGGER validate_transaction_item_price
BEFORE INSERT ON transaction_items
FOR EACH ROW
BEGIN
    -- 检查 total_price 是否等于 quantity × unit_price
    IF NEW.total_price != NEW.quantity * NEW.unit_price THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Total price must equal quantity multiplied by unit price';
    END IF;
END $$

DELIMITER ;




-- 玩家状态
CREATE TABLE player_status (
    player_id INT PRIMARY KEY,
    health INT DEFAULT 120,
    weight_bearing_capacity INT DEFAULT 120,
    main_weapon_id INT,
    sub_weapon_id INT,
    head_protection_id INT,
    body_protection_id INT,
    FOREIGN KEY (main_weapon_id) REFERENCES weapons(weapon_id),
    FOREIGN KEY (sub_weapon_id) REFERENCES weapons(weapon_id),
    FOREIGN KEY (head_protection_id) REFERENCES equipment_items(item_id),
    FOREIGN KEY (body_protection_id) REFERENCES equipment_items(item_id)
);

CREATE TABLE player_weapon(
    id INT PRIMARY KEY AUTO_INCREMENT,
    weapon_id INT NOT NULL,
    weapon_name VARCHAR(100) NOT NULL,
    weapon_type VARCHAR(50) NOT NULL,
    attechment_id INT,
    type_id INT NOT NULL,
    FOREIGN KEY (type_id) REFERENCES attachment_types(type_id),
    FOREIGN KEY (attechment_id) REFERENCES attachments(attachment_id),
    FOREIGN KEY (weapon_id) REFERENCES weapons(weapon_id)
);

DELIMITER $$

-- 触发器 8：确保贴片和枪灯不能同时装备
CREATE TRIGGER check_attachment_conflict_1
BEFORE INSERT ON player_weapon
FOR EACH ROW
BEGIN
    DECLARE attachment_type_1 VARCHAR(50);
    DECLARE attachment_type_2 VARCHAR(50);

    -- 获取新插入的配件类型
    SELECT t1.type_name INTO attachment_type_1
    FROM attachment_types t1
    JOIN attachments a1 ON a1.type_id = t1.type_id
    WHERE a1.attachment_id = NEW.attechment_id;

    -- 检查是否已经有枪灯装备
    IF attachment_type_1 = '贴片' THEN
        SELECT t2.type_name INTO attachment_type_2
        FROM attachment_types t2
        JOIN attachments a2 ON a2.type_id = t2.type_id
        WHERE a2.attachment_id = NEW.attechment_id;

        IF attachment_type_2 = '枪灯' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot equip both a patch and a flashlight at the same time';
        END IF;
    END IF;
END $$

-- 触发器 9：确保增高架和高倍率准镜不能同时装备
CREATE TRIGGER check_attachment_conflict_2
BEFORE INSERT ON player_weapon
FOR EACH ROW
BEGIN
    DECLARE attachment_type_1 VARCHAR(50);
    DECLARE attachment_type_2 VARCHAR(50);

    -- 获取新插入的配件类型
    SELECT t1.type_name INTO attachment_type_1
    FROM attachment_types t1
    JOIN attachments a1 ON a1.type_id = t1.type_id
    WHERE a1.attachment_id = NEW.attechment_id;

    -- 检查是否已经装备增高架
    IF attachment_type_1 = '增高架' THEN
        SELECT t2.type_name INTO attachment_type_2
        FROM attachment_types t2
        JOIN attachments a2 ON a2.type_id = t2.type_id
        WHERE a2.attachment_id = NEW.attechment_id;

        IF attachment_type_2 = '高倍率准镜' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot equip both a riser and a high-powered scope at the same time';
        END IF;
    END IF;
END $$

DELIMITER ;


-- 战斗信息表
CREATE TABLE combat_records (
    combat_id INT PRIMARY KEY AUTO_INCREMENT,       -- 战斗记录ID
    combat_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 战斗时间
    location_latitude DECIMAL(9, 6) NOT NULL,       -- 战斗地点经度
    location_longitude DECIMAL(9, 6) NOT NULL,      -- 战斗地点纬度
    hit_part VARCHAR(50),                           -- 击中部位（例如：头部、胸部等）
    winner_id INT NOT NULL,                         -- 击败的玩家ID（关联玩家状态）
    loser_id INT NOT NULL,                          -- 被击败的玩家ID（关联玩家状态）
    winner_main_weapon_id INT,                      -- 击败玩家的主武器ID（关联玩家武器）
    winner_sub_weapon_id INT,                       -- 击败玩家的副武器ID（关联玩家武器）
    loser_main_weapon_id INT,                       -- 被击败玩家的主武器ID（关联玩家武器）
    loser_sub_weapon_id INT,                        -- 被击败玩家的副武器ID（关联玩家武器）
    winner_head_protection_id INT,                  -- 击败玩家的头部防护装备ID（关联装备表）
    winner_body_protection_id INT,                  -- 击败玩家的身体防护装备ID（关联装备表）
    loser_head_protection_id INT,                   -- 被击败玩家的头部防护装备ID（关联装备表）
    loser_body_protection_id INT,                   -- 被击败玩家的身体防护装备ID（关联装备表）
    FOREIGN KEY (winner_id) REFERENCES player_status(player_id),   -- 外键：击败玩家
    FOREIGN KEY (loser_id) REFERENCES player_status(player_id),    -- 外键：被击败玩家
    FOREIGN KEY (winner_main_weapon_id) REFERENCES weapons(weapon_id), -- 外键：击败玩家主武器
    FOREIGN KEY (winner_sub_weapon_id) REFERENCES weapons(weapon_id),  -- 外键：击败玩家副武器
    FOREIGN KEY (loser_main_weapon_id) REFERENCES weapons(weapon_id),  -- 外键：被击败玩家主武器
    FOREIGN KEY (loser_sub_weapon_id) REFERENCES weapons(weapon_id),   -- 外键：被击败玩家副武器
    FOREIGN KEY (winner_head_protection_id) REFERENCES equipment_items(item_id), -- 外键：击败玩家头部防护装备
    FOREIGN KEY (winner_body_protection_id) REFERENCES equipment_items(item_id), -- 外键：击败玩家身体防护装备
    FOREIGN KEY (loser_head_protection_id) REFERENCES equipment_items(item_id),  -- 外键：被击败玩家头部防护装备
    FOREIGN KEY (loser_body_protection_id) REFERENCES equipment_items(item_id)  -- 外键：被击败玩家身体防护装备
);


####################################################################
#############################操作脚本################################
####################################################################

-- 用户数据
INSERT INTO users (username, password, email, phone, city, state, postal_code, date_of_birth, gender, ip_address, level, experience)
VALUES
('Alice', 'password123', 'alice@example.com', '1234567890', 'New York', 'NY', '10001', '1990-01-01', 'Female', '192.168.1.1', 1, 500),
('Bob', 'password456', 'bob@example.com', '2345678901', 'Los Angeles', 'CA', '90001', '1985-02-15', 'Male', '192.168.1.2', 2, 1500),
('Charlie', 'password789', 'charlie@example.com', '3456789012', 'Chicago', 'IL', '60601', '1992-03-20', 'Male', '192.168.1.3', 3, 2500),
('Daisy', 'pass1234', 'daisy@example.com', '4567890123', 'Houston', 'TX', '77001', '1995-04-25', 'Female', '192.168.1.4', 4, 4000),
('Ethan', 'pass5678', 'ethan@example.com', '5678901234', 'Phoenix', 'AZ', '85001', '1998-05-10', 'Male', '192.168.1.5', 5, 6000),
('Fiona', 'pass9012', 'fiona@example.com', '6789012345', 'Philadelphia', 'PA', '19019', '1988-06-18', 'Female', '192.168.1.6', 6, 8000),
('George', 'pass3456', 'george@example.com', '7890123456', 'San Antonio', 'TX', '78201', '1991-07-23', 'Male', '192.168.1.7', 7, 11000),
('Hannah', 'pass7890', 'hannah@example.com', '8901234567', 'San Diego', 'CA', '92101', '1993-08-30', 'Female', '192.168.1.8', 8, 14000),
('Ivy', 'mypassword1', 'ivy@example.com', '9012345678', 'Dallas', 'TX', '75201', '1994-09-05', 'Female', '192.168.1.9', 9, 18000),
('Jack', 'mypassword2', 'jack@example.com', '0123456789', 'Austin', 'TX', '73301', '1996-10-15', 'Male', '192.168.1.10', 10, 22000),
('Karen', 'mypassword3', 'karen@example.com', '1234509876', 'San Francisco', 'CA', '94101', '1997-11-20', 'Female', '192.168.1.11', 11, 27000);

-- 活动数据
INSERT INTO activities (act_name, act_type, start_time, end_time, is_limited_time, reward_description, completed_users, total_participants)
VALUES
('Operation Dawn', 'PvP', '2025-01-12 10:00:00', '2025-01-12 14:00:00', TRUE, 'Exclusive weapon skin for top 3 players', 150, 500),
('Supply Raid', 'PvE', '2025-01-13 18:00:00', '2025-01-14 18:00:00', FALSE, '500 coins and rare materials', 300, 700),
('Recon Mission', 'Co-op', '2025-01-15 20:00:00', '2025-01-16 00:00:00', TRUE, 'Unlock a rare sniper rifle attachment', 50, 120),
('Urban Warfare', 'PvP', '2025-01-16 15:00:00', '2025-01-16 18:00:00', TRUE, 'Unique character outfit for top 10 players', 200, 800),
('Dark Zone Expedition', 'PvPvE', '2025-01-17 12:00:00', '2025-01-18 12:00:00', FALSE, 'Valuable loot crates and experience boost', 400, 1200),
('Extraction Point Alpha', 'PvE', '2025-01-18 10:00:00', '2025-01-18 16:00:00', TRUE, 'Medical supplies and armor upgrades', 220, 600),
('Midnight Siege', 'PvP', '2025-01-19 22:00:00', '2025-01-20 02:00:00', TRUE, 'Special rewards for stealth kills', 90, 300),
('Scavenger Hunt', 'Exploration', '2025-01-20 08:00:00', '2025-01-20 20:00:00', FALSE, 'Legendary artifact and rare weapon blueprint', 350, 800),
('Frontline Defense', 'Co-op', '2025-01-21 14:00:00', '2025-01-22 14:00:00', FALSE, 'Defensive turret upgrade and ammo crates', 500, 1000),
('High-Risk Loot Run', 'PvPvE', '2025-01-22 16:00:00', '2025-01-22 22:00:00', TRUE, 'Rare high-value loot', 100, 250),
('Final Stand', 'PvP', '2025-01-23 18:00:00', '2025-01-23 23:00:00', TRUE, 'Special leaderboard rewards for top players', 180, 400);

-- 兵种
INSERT INTO classes (class_type, description) VALUES
    ('突击兵', '擅长近战，具备高机动性'),
    ('医疗兵', '能够为队友恢复生命值，具备治疗技能'),
    ('工程兵', '能够建造防御工事并修复队友设备'),
    ('侦察兵', '擅长远程侦察，具备隐身技能');

-- 角色
INSERT INTO chracters (character_name, class_type, subordinate_to, profession_equipment, special_equipment, special_ability) VALUES
    ('红狼', '突击兵', '突击兵', 'AK47, 防弹背心', '闪光弹, 燃烧瓶', '高速冲刺'),
    ('威龙', '突击兵', '突击兵', 'M4A1, 战术背包', '爆炸箭, 便携炮', '压制火力'),
    ('蜂伊', '医疗兵', '医疗兵', '急救包, 轻便防弹衣', '止血绷带, 缝合针', '快速治疗'),
    ('蛊', '医疗兵', '医疗兵', '治疗针, 医疗背包', '药物包, 伤口包扎', '毒素治疗'),
    ('乌鲁鲁', '工程兵', '工程兵', '冲锋枪, 工程工具包', '炸药, 地雷', '建筑专家'),
    ('缪萨', '工程兵', '工程兵', 'AK47, 修理工具', '修复包, 瞄准镜', '修理大师'),
    ('卢娜', '侦察兵', '侦察兵', '狙击步枪, 隐蔽服', '夜视仪, 激光指示器', '隐身'),
    ('麦晓薯', '侦察兵', '侦察兵', 'M82A1, 无线电设备', '热成像, 磁力雷', '远程侦察');



-- 武器

INSERT INTO weapons (weapon_name, weapon_type, base_damage, advantage_range, damage_decay_percentage, rate_of_fire, recoil_index, spread_5m, spread_15m, spread_30m)
VALUES
    ('AK47', '步枪', 35, 200, 0.5, 600, 3.2, 0.15, 0.25, 0.35),
    ('M16', '步枪', 30, 250, 0.4, 700, 2.8, 0.12, 0.22, 0.32),
    ('M4A1', '步枪', 30, 300, 0.3, 800, 2.5, 0.13, 0.21, 0.30),
    ('AK74M', '步枪', 32, 250, 0.45, 750, 2.9, 0.14, 0.23, 0.33),
    ('FAMAS F1', '步枪', 28, 230, 0.5, 850, 3.1, 0.16, 0.24, 0.34),
    ('G36', '步枪', 30, 270, 0.4, 750, 2.7, 0.14, 0.22, 0.31),
    ('Scar-L', '步枪', 33, 280, 0.4, 720, 2.6, 0.15, 0.23, 0.32),
    ('Tavor X95', '步枪', 29, 240, 0.45, 780, 2.8, 0.13, 0.21, 0.30),
    ('Steyr AUG', '步枪', 31, 260, 0.4, 710, 2.9, 0.14, 0.22, 0.31),
    ('QBZ-95', '步枪', 28, 220, 0.5, 800, 2.7, 0.16, 0.24, 0.34),
    ('F2000', '步枪', 30, 240, 0.4, 720, 3.0, 0.14, 0.21, 0.30),
    ('L85A2', '步枪', 32, 230, 0.45, 740, 2.8, 0.15, 0.23, 0.33),
    ('SIG SG 550', '步枪', 34, 300, 0.35, 690, 2.6, 0.13, 0.21, 0.31),
    ('M1A1', '步枪', 37, 320, 0.3, 650, 2.5, 0.12, 0.20, 0.30),
    ('G3A3', '步枪', 38, 350, 0.3, 650, 3.0, 0.14, 0.22, 0.32),
    ('M1 Garand', '步枪', 45, 400, 0.2, 500, 3.5, 0.08, 0.18, 0.28),
    ('M14', '步枪', 40, 380, 0.25, 600, 3.2, 0.10, 0.20, 0.30),
    ('M21', '步枪', 38, 340, 0.3, 650, 2.9, 0.12, 0.22, 0.32),
    ('FN SCAR-H', '步枪', 42, 350, 0.3, 670, 3.1, 0.13, 0.23, 0.33),
    ('K14', '步枪', 35, 300, 0.4, 720, 2.7, 0.14, 0.22, 0.32);
-- 冲锋枪数据
INSERT INTO weapons (weapon_name, weapon_type, base_damage, advantage_range, damage_decay_percentage, rate_of_fire, recoil_index, spread_5m, spread_15m, spread_30m)
VALUES
    ('MP5', '冲锋枪', 20, 50, 0.3, 900, 2.0, 0.18, 0.28, 0.38),
    ('Uzi', '冲锋枪', 18, 45, 0.35, 950, 2.5, 0.20, 0.30, 0.40),
    ('Thompson', '冲锋枪', 22, 40, 0.4, 700, 2.7, 0.19, 0.29, 0.39),
    ('MP7', '冲锋枪', 21, 60, 0.25, 950, 2.3, 0.17, 0.27, 0.37),
    ('P90', '冲锋枪', 23, 55, 0.3, 900, 2.1, 0.16, 0.26, 0.36),
    ('PP19 Bizon', '冲锋枪', 25, 50, 0.28, 800, 2.4, 0.18, 0.27, 0.37),
    ('Vector', '冲锋枪', 20, 45, 0.32, 1100, 2.6, 0.20, 0.30, 0.40),
    ('Sterling', '冲锋枪', 22, 50, 0.33, 850, 2.5, 0.17, 0.26, 0.36),
    ('MP9', '冲锋枪', 24, 55, 0.3, 1000, 2.2, 0.16, 0.25, 0.35),
    ('MAC-10', '冲锋枪', 18, 45, 0.35, 1200, 2.8, 0.19, 0.29, 0.39);
-- 手枪数据
INSERT INTO weapons (weapon_name, weapon_type, base_damage, advantage_range, damage_decay_percentage, rate_of_fire, recoil_index, spread_5m, spread_15m, spread_30m)
VALUES
    ('Desert Eagle', '手枪', 40, 50, 0.2, 300, 3.5, 0.12, 0.18, 0.28),
    ('Glock 17', '手枪', 25, 35, 0.25, 600, 2.0, 0.10, 0.20, 0.30),
    ('Colt 1911', '手枪', 35, 40, 0.2, 450, 3.0, 0.11, 0.17, 0.27),
    ('Beretta 92', '手枪', 30, 40, 0.25, 600, 2.5, 0.12, 0.18, 0.28),
    ('Walther P99', '手枪', 28, 35, 0.3, 550, 2.2, 0.10, 0.16, 0.26),
    ('CZ 75', '手枪', 33, 40, 0.25, 600, 2.4, 0.11, 0.17, 0.27),
    ('SIG P226', '手枪', 32, 40, 0.28, 580, 2.3, 0.10, 0.15, 0.25),
    ('FN Five-seven', '手枪', 27, 45, 0.23, 700, 2.6, 0.12, 0.18, 0.28),
    ('M1911', '手枪', 35, 45, 0.2, 450, 3.2, 0.13, 0.19, 0.29),
    ('Ruger SR1911', '手枪', 36, 50, 0.2, 500, 2.8, 0.12, 0.18, 0.28);
-- 霰弹枪数据
INSERT INTO weapons (weapon_name, weapon_type, base_damage, advantage_range, damage_decay_percentage, rate_of_fire, recoil_index, spread_5m, spread_15m, spread_30m)
VALUES
    ('M1014', '霰弹枪', 50, 10, 0.5, 300, 4.0, 0.25, 0.35, 0.45),
    ('Remington 870', '霰弹枪', 55, 12, 0.4, 280, 3.8, 0.20, 0.30, 0.40),
    ('Benelli M4', '霰弹枪', 52, 15, 0.45, 320, 3.9, 0.22, 0.32, 0.42),
    ('SPAS-12', '霰弹枪', 60, 13, 0.3, 280, 4.2, 0.23, 0.33, 0.43),
    ('Mossberg 500', '霰弹枪', 50, 14, 0.4, 300, 4.1, 0.21, 0.31, 0.41),
    ('Ithaca 37', '霰弹枪', 58, 16, 0.35, 280, 3.7, 0.20, 0.30, 0.40),
    ('Winchester 1897', '霰弹枪', 55, 14, 0.38, 250, 4.0, 0.22, 0.32, 0.42),
    ('Saiga 12', '霰弹枪', 54, 18, 0.42, 290, 3.8, 0.23, 0.33, 0.43),
    ('KSG', '霰弹枪', 51, 20, 0.45, 300, 3.9, 0.24, 0.34, 0.44);
-- 狙击枪数据
INSERT INTO weapons (weapon_name, weapon_type, base_damage, advantage_range, damage_decay_percentage, rate_of_fire, recoil_index, spread_5m, spread_15m, spread_30m)
VALUES
    ('AWM', '狙击枪', 95, 800, 0.15, 60, 5.0, 0.05, 0.10, 0.20),
    ('M82 Barrett', '狙击枪', 90, 850, 0.12, 50, 5.2, 0.06, 0.12, 0.22),
    ('Dragunov', '狙击枪', 85, 700, 0.18, 50, 4.8, 0.07, 0.14, 0.24),
    ('SVD', '狙击枪', 80, 750, 0.20, 60, 4.9, 0.08, 0.16, 0.26),
    ('CheyTac M200', '狙击枪', 95, 900, 0.1, 40, 5.5, 0.04, 0.08, 0.18),
    ('M24', '狙击枪', 85, 800, 0.15, 50, 5.1, 0.05, 0.10, 0.20),
    ('Tactical .338', '狙击枪', 90, 850, 0.14, 45, 5.3, 0.06, 0.11, 0.21),
    ('AWC', '狙击枪', 88, 800, 0.16, 55, 4.7, 0.05, 0.09, 0.19),
    ('L115A3', '狙击枪', 85, 820, 0.17, 45, 5.4, 0.06, 0.12, 0.22);

-- 机枪数据
INSERT INTO weapons (weapon_name, weapon_type, base_damage, advantage_range, damage_decay_percentage, rate_of_fire, recoil_index, spread_5m, spread_15m, spread_30m)
VALUES
    ('M249', '机枪', 40, 250, 0.3, 700, 3.9, 0.18, 0.28, 0.38),
    ('PKM', '机枪', 42, 300, 0.25, 650, 4.0, 0.19, 0.29, 0.39),
    ('RPD', '机枪', 44, 280, 0.28, 600, 3.8, 0.17, 0.27, 0.37),
    ('M60', '机枪', 45, 290, 0.27, 650, 4.1, 0.18, 0.28, 0.38),
    ('MG42', '机枪', 48, 320, 0.22, 900, 5.2, 0.20, 0.30, 0.40),
    ('F2000 LMG', '机枪', 46, 310, 0.24, 700, 4.0, 0.19, 0.29, 0.39),
    ('Negev', '机枪', 40, 280, 0.26, 750, 4.1, 0.17, 0.27, 0.37),
    ('M1919 Browning', '机枪', 47, 330, 0.21, 600, 4.3, 0.21, 0.31, 0.41),
    ('M2 Browning', '机枪', 50, 350, 0.2, 500, 5.0, 0.22, 0.32, 0.42);

-- 改装件
INSERT INTO attachment_types (type_name)
VALUES
    ('枪口'),        -- 1: 枪口
    ('握把'),        -- 2: 握把
    ('枪灯'),        -- 3: 枪灯
    ('贴片'),        -- 4: 贴片
    ('镭射'),        -- 5: 镭射
    ('弹匣'),        -- 6: 弹匣
    ('后握把'),      -- 7: 后握把
    ('枪托'),        -- 8: 枪托
    ('低倍率准镜'),  -- 9: 低倍率准镜
    ('高倍率准镜'),  -- 10: 高倍率准镜
    ('增高架');     -- 11: 增高架
    INSERT INTO attachments (type_id, name, recoil_control, horizontal_recoil_control, vertical_recoil_control, ads_speed, hipfire_accuracy, ergonomics, scope_magnification)
VALUES
    -- 枪口
    (1, '消焰器', 5.00, -10.00, -5.00, NULL, NULL, NULL, NULL),
    (1, '制退器', 10.00, -15.00, -10.00, -5.00, NULL, NULL, NULL),
    (1, '消声器', -5.00, -5.00, -2.00, NULL, 5.00, NULL, NULL),
    -- 握把
    (2, '垂直握把', 5.00, -5.00, 10.00, 3.00, 5.00, 10.00, NULL),
    -- 枪灯
    (3, '战术手电筒', NULL, NULL, NULL, NULL, 10.00, -5.00, NULL),
    -- 贴片
    (4, '握力增强贴片', NULL, NULL, NULL, NULL, 15.00, 5.00, NULL),
    -- 镭射
    (5, '激光指示器', NULL, NULL, NULL, NULL, 20.00, NULL, NULL),
    -- 弹匣
    (6, '高容量弹匣', NULL, NULL, NULL, -10.00, NULL, -5.00, NULL),
    -- 后握把
    (7, '后垂直握把', 4.00, -4.00, 8.00, 3.50, 5.50, 12.00, NULL),
    -- 枪托
    (8, '固定枪托', NULL, NULL, NULL, 10.00, 7.00, 8.00, NULL),
    -- 低倍率准镜
    (9, '红点瞄准镜', NULL, NULL, NULL, 15.00, 20.00, NULL, 1.00),
    -- 高倍率准镜
    (10, '6倍瞄准镜', NULL, NULL, NULL, 8.00, 15.00, NULL, 4.00),
    -- 增高架
    (11, '高度适配器', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- 装备类型
INSERT INTO equipment_types (type_name)
VALUES
    ('伤害装备'),   -- 1: 伤害装备
    ('治疗装备'),   -- 2: 治疗装备
    ('防护装备');  -- 3: 防护装备

-- 装备
INSERT INTO equipment_items (type_id, name, damage, armor_penetration, healing_amount, healing_time, duration, protection_limit, protection_degradation)
VALUES
    -- 爆炸物（伤害装备）
    (1, '手雷', 50.00, 20.00, NULL, NULL, NULL, NULL, NULL),
    (1, 'C4炸药', 100.00, 50.00, NULL, NULL, NULL, NULL, NULL),
    (1, '燃烧瓶', 30.00, 15.00, NULL, NULL, NULL, NULL, NULL),
    -- 子弹（伤害装备）
    (1, '1级子弹', 10.00, 5.00, NULL, NULL, NULL, NULL, NULL),
    (1, '2级子弹', 15.00, 7.00, NULL, NULL, NULL, NULL, NULL),
    (1, '3级子弹', 20.00, 10.00, NULL, NULL, NULL, NULL, NULL),
    (1, '4级子弹', 25.00, 12.00, NULL, NULL, NULL, NULL, NULL),
    (1, '5级子弹', 30.00, 15.00, NULL, NULL, NULL, NULL, NULL),
    (1, '6级子弹', 35.00, 18.00, NULL, NULL, NULL, NULL, NULL),
    -- 治疗针（治疗装备）
    (2, '小治疗针', NULL, NULL, 10.00, 5.00, 30.00, NULL, NULL),
    (2, '大治疗针', NULL, NULL, 25.00, 8.00, 45.00, NULL, NULL),
    -- 治疗包（治疗装备）
    (2, '小治疗包', NULL, NULL, 50.00, 10.00, 60.00, NULL, NULL),
    (2, '大治疗包', NULL, NULL, 100.00, 12.00, 90.00, NULL, NULL),
    -- 止痛药（治疗装备）
    (2, '小止痛药', NULL, NULL, 10.00, 5.00, 30.00, NULL, NULL),
    (2, '大止痛药', NULL, NULL, 25.00, 8.00, 60.00, NULL, NULL),
    -- 头盔（防护装备）
    (3, '1级头盔', NULL, NULL, NULL, NULL, NULL, 50.00, 10.00),
    (3, '2级头盔', NULL, NULL, NULL, NULL, NULL, 60.00, 12.00),
    (3, '3级头盔', NULL, NULL, NULL, NULL, NULL, 70.00, 15.00),
    (3, '4级头盔', NULL, NULL, NULL, NULL, NULL, 80.00, 18.00),
    (3, '5级头盔', NULL, NULL, NULL, NULL, NULL, 90.00, 20.00),
    (3, '6级头盔', NULL, NULL, NULL, NULL, NULL, 100.00, 25.00),
    -- 护甲（防护装备）
    (3, '1级护甲', NULL, NULL, NULL, NULL, NULL, 50.00, 10.00),
    (3, '2级护甲', NULL, NULL, NULL, NULL, NULL, 60.00, 12.00),
    (3, '3级护甲', NULL, NULL, NULL, NULL, NULL, 70.00, 15.00),
    (3, '4级护甲', NULL, NULL, NULL, NULL, NULL, 80.00, 18.00),
    (3, '5级护甲', NULL, NULL, NULL, NULL, NULL, 90.00, 20.00),
    (3, '6级护甲', NULL, NULL, NULL, NULL, NULL, 100.00, 25.00);


--任务
INSERT INTO missions (mission_name, description, reward_description, start_time, end_time)
VALUES
('Operation Blackout', 'Neutralize enemy communication arrays.', '1500 coins, rare weapon attachment', '2025-01-12 10:00:00', '2025-01-12 18:00:00'),
('Silent Strike', 'Infiltrate the enemy base and gather intel.', '2000 coins, stealth upgrade', '2025-01-13 14:00:00', '2025-01-13 20:00:00'),
('High Value Target', 'Locate and eliminate the enemy commander.', 'Unique sniper rifle', '2025-01-14 09:00:00', '2025-01-14 18:00:00'),
('Supply Line Cutoff', 'Destroy enemy supply convoys.', '500 coins, rare resources', '2025-01-15 12:00:00', '2025-01-15 16:00:00'),
('Hostage Rescue', 'Rescue civilians from enemy stronghold.', 'Medical supplies and 800 coins', '2025-01-16 08:00:00', '2025-01-16 18:00:00'),
('Defensive Perimeter', 'Hold the frontline against waves of enemies.', '1500 coins and defensive upgrades', '2025-01-17 10:00:00', '2025-01-17 14:00:00'),
('Recon in Force', 'Perform reconnaissance and report enemy movements.', 'Rare blueprint and 600 coins', '2025-01-18 11:00:00', '2025-01-18 17:00:00'),
('Sabotage Ops', 'Plant explosives in the enemy facility.', 'Explosive kit upgrade and 900 coins', '2025-01-19 13:00:00', '2025-01-19 20:00:00'),
('Overwatch', 'Provide sniper support for advancing troops.', 'Elite sniper scope and 1200 coins', '2025-01-20 10:00:00', '2025-01-20 16:00:00'),
('Deep Strike', 'Penetrate deep into enemy territory and disrupt operations.', 'Advanced combat gear and 1500 coins', '2025-01-21 12:00:00', '2025-01-21 18:00:00'),
('Final Stand', 'Lead the charge in a decisive battle.', 'Legendary weapon and 3000 coins', '2025-01-22 14:00:00', '2025-01-22 20:00:00');

-- 正常数据
INSERT INTO player_missions (player_id, mission_id, start_time, end_time, progress, completed)
VALUES
(1, 1, '2025-01-12 10:10:00', '2025-01-12 17:50:00', 100, TRUE),
(2, 2, '2025-01-13 14:10:00', '2025-01-13 19:50:00', 90, FALSE),
(3, 3, '2025-01-14 09:15:00', '2025-01-14 17:50:00', 100, TRUE),
(4, 4, '2025-01-15 12:20:00', '2025-01-15 15:30:00', 80, FALSE),
(5, 5, '2025-01-16 08:30:00', '2025-01-16 17:50:00', 100, TRUE),
(6, 6, '2025-01-17 10:10:00', '2025-01-17 13:50:00', 60, FALSE),
(7, 7, '2025-01-18 11:30:00', '2025-01-18 16:50:00', 100, TRUE),
(8, 8, '2025-01-19 13:40:00', '2025-01-19 19:50:00', 70, FALSE),
(9, 9, '2025-01-20 10:50:00', '2025-01-20 15:50:00', 100, TRUE);

-- 触发触发器数据：进度未达到100%却试图完成任务
INSERT INTO player_missions (player_id, mission_id, start_time, end_time, progress, completed)
VALUES
(10, 10, '2025-01-21 12:10:00', '2025-01-21 18:10:00', 80, TRUE);

-- 触发触发器数据：玩家任务结束时间晚于任务的结束时间
INSERT INTO player_missions (player_id, mission_id, start_time, end_time, progress, completed)
VALUES
(11, 11, '2025-01-22 14:10:00', '2025-01-22 20:30:00', 100, TRUE);


-- 排行榜

-- 检查是否存在这些值
SELECT * FROM users WHERE level IN (3, 4, 5, 6, 7, 8, 9, 10) AND experience IN (8500, 9000, 9500, 10000, 10500, 11000, 12000, 13000, 14000, 15000);
INSERT INTO raking_list (player_id, username, score, level, experience)
VALUES
(1, 'Alice', 500, 1, 500),
(2, 'Bob', 1500, 2, 1500),
(3, 'Charlie', 2500, 3, 2500),
(4, 'Daisy', 4000, 4, 4000),
(5, 'Ethan', 6000, 5, 6000),
(6, 'Fiona', 8000, 6, 8000),
(7, 'George', 11000, 7, 11000),
(8, 'Hannah', 14000, 8, 14000),
(9, 'Ivy', 18000, 9, 18000),
(10, 'Jack', 22000, 10, 22000),
(11, 'Karen', 27000, 11, 27000);

SELECT * FROM raking_list;
-- 验证触发器，插入一条分数小于前一条记录的无效记录
INSERT INTO raking_list (player_id, username, score, level, experience)
VALUES
(12, 'TestPlayer', 10000, 5, 6000);

-- 插入分数相同但等级低的记录，应被拦截
INSERT INTO raking_list (player_id, username, score, level, experience)
VALUES
(13, 'TestPlayer', 14000, 7, 11000);

--   交易系统
SELECT * FROM transactions;

-- 先插入 transactions 数据
INSERT INTO transactions (transaction_id, buyer_id, seller_id, total_price, status)
VALUES
(24, 1, 2, 0.00, 'pending'),
(25, 3, 4, 0.00, 'completed'),
(26, 5, 6, 0.00, 'pending'),
(27, 7, 8, 0.00, 'completed'),
(28, 9, 10, 0.00, 'pending'),
(29, 11, 1, 0.00, 'completed'),
(30, 2, 3, 0.00, 'pending'),
(31, 4, 5, 0.00, 'completed'),
(32, 6, 7, 0.00, 'pending'),
(33, 8, 9, 0.00, 'completed'),
(34, 10, 11, 0.00, 'pending'),
(35, 1, 10, 0.00, 'completed');

INSERT INTO player_status (player_id, health, weight_bearing_capacity, main_weapon_id, sub_weapon_id, head_protection_id, body_protection_id)
VALUES
(1, 120, 120, 1, 2, 1, 1),  -- 玩家1，主武器ID为1，副武器ID为2，头部防护ID为1，身体防护ID为1
(2, 110, 130, 3, 4, 2, 2),  -- 玩家2，主武器ID为3，副武器ID为4，头部防护ID为2，身体防护ID为2
(3, 100, 140, 5, 6, 3, 3),  -- 玩家3，主武器ID为5，副武器ID为6，头部防护ID为3，身体防护ID为3
(4, 90, 150, 7, 8, 4, 4),   -- 玩家4，主武器ID为7，副武器ID为8，头部防护ID为4，身体防护ID为4
(5, 80, 160, 9, 10, 5, 5),  -- 玩家5，主武器ID为9，副武器ID为10，头部防护ID为5，身体防护ID为5
(6, 70, 170, 11, 12, 6, 6), -- 玩家6，主武器ID为11，副武器ID为12，头部防护ID为6，身体防护ID为6
(7, 60, 180, 13, 14, 7, 7), -- 玩家7，主武器ID为13，副武器ID为14，头部防护ID为7，身体防护ID为7
(8, 50, 190, 15, 16, 8, 8), -- 玩家8，主武器ID为15，副武器ID为16，头部防护ID为8，身体防护ID为8
(9, 40, 200, 17, 18, 9, 9), -- 玩家9，主武器ID为17，副武器ID为18，头部防护ID为9，身体防护ID为9
(10, 30, 210, 19, 20, 10, 10); -- 玩家10，主武器ID为19，副武器ID为20，头部防护ID为10，身体防护ID为10

INSERT INTO player_weapon (weapon_id, weapon_name, weapon_type, attechment_id, type_id)
VALUES
(1, 'AK47', '步枪', 14, 1),  -- 武器ID为1，配件ID为1，配件类型ID为1
(2, 'M16', '步枪', 17, 2),   -- 武器ID为2，配件ID为2，配件类型ID为2
(3, 'M4A1', '步枪', 18, 3),  -- 武器ID为3，配件ID为3，配件类型ID为3
(4, 'AK74M', '步枪', 19, 4), -- 武器ID为4，配件ID为4，配件类型ID为4
(5, 'FAMAS F1', '步枪', 20, 5), -- 武器ID为5，配件ID为5，配件类型ID为5
(6, 'G36', '步枪', 21, 6),   -- 武器ID为6，配件ID为6，配件类型ID为6
(7, 'Scar-L', '步枪', 22, 7), -- 武器ID为7，配件ID为7，配件类型ID为7
(8, 'Tavor X95', '步枪', 23, 8), -- 武器ID为8，配件ID为8，配件类型ID为8
(9, 'Steyr AUG', '步枪', 24, 9), -- 武器ID为9，配件ID为9，配件类型ID为9
(10, 'QBZ-95', '步枪', 25, 10); -- 武器ID为10，配件ID为10，配件类型ID为10

INSERT INTO combat_records (
    combat_time, location_latitude, location_longitude, hit_part, winner_id, loser_id,
    winner_main_weapon_id, winner_sub_weapon_id, loser_main_weapon_id, loser_sub_weapon_id,
    winner_head_protection_id, winner_body_protection_id, loser_head_protection_id, loser_body_protection_id
)
VALUES
-- 战斗记录 1
('2025-01-12 10:15:00', 34.052235, -118.243683, '头部', 1, 2, 1, 2, 3, 4, 1, 1, 2, 2),
-- 战斗记录 2
('2025-01-13 14:20:00', 40.712776, -74.005974, '胸部', 3, 4, 5, 6, 7, 8, 3, 3, 4, 4),
-- 战斗记录 3
('2025-01-14 09:30:00', 51.507351, -0.127758, '腿部', 5, 6, 9, 10, 11, 12, 5, 5, 6, 6),
-- 战斗记录 4
('2025-01-15 12:45:00', 48.856613, 2.352222, '头部', 7, 8, 13, 14, 15, 16, 7, 7, 8, 8),
-- 战斗记录 5
('2025-01-16 08:50:00', 35.689487, 139.691711, '胸部', 9, 10, 17, 18, 19, 20, 9, 9, 10, 10),
-- 战斗记录 6
('2025-01-17 10:55:00', 55.755825, 37.617298, '腿部', 2, 3, 3, 4, 5, 6, 2, 2, 3, 3),
-- 战斗记录 7
('2025-01-18 11:05:00', 37.774929, -122.419418, '头部', 4, 5, 7, 8, 9, 10, 4, 4, 5, 5),
-- 战斗记录 8
('2025-01-19 13:10:00', 52.520008, 13.404954, '胸部', 6, 7, 11, 12, 13, 14, 6, 6, 7, 7),
-- 战斗记录 9
('2025-01-20 10:20:00', 41.902782, 12.496366, '腿部', 8, 9, 15, 16, 17, 18, 8, 8, 9, 9),
-- 战斗记录 10
('2025-01-21 12:25:00', -33.868820, 151.209290, '头部', 10, 1, 19, 20, 1, 2, 10, 10, 1, 1);


##########查询############
-- 1. 查询每个玩家的用户名、等级、经验值以及他们装备的主武器名称
SELECT u.username, u.level, u.experience, w.weapon_name AS main_weapon
FROM users u
JOIN player_status ps ON u.id = ps.player_id
JOIN weapons w ON ps.main_weapon_id = w.weapon_id;

-- 2. 查询每个活动的名称、参与人数以及完成人数
SELECT act_name, total_participants, completed_users
FROM activities;

-- 3. 查询每个玩家的任务完成情况（任务名称、进度、是否完成）
SELECT u.username, m.mission_name, pm.progress, pm.completed
FROM player_missions pm
JOIN users u ON pm.player_id = u.id
JOIN missions m ON pm.mission_id = m.id;

-- 4. 查询每个玩家的总分数、等级和经验值，并按分数降序排列
SELECT username, score, level, experience
FROM raking_list
ORDER BY score DESC;

-- 5. 查询每个玩家的战斗记录数量
SELECT u.username, COUNT(cr.combat_id) AS combat_count
FROM combat_records cr
JOIN users u ON cr.winner_id = u.id
GROUP BY u.username;

-- 6. 查询每个玩家的平均战斗胜利次数（使用子查询）
SELECT u.username, 
       (SELECT COUNT(*) 
        FROM combat_records cr 
        WHERE cr.winner_id = u.id) AS win_count
FROM users u;

-- 7. 查询每个玩家的最高分数和对应的等级
SELECT username, MAX(score) AS max_score, level
FROM raking_list
GROUP BY username, level;

-- 8. 查询每个玩家的装备情况（主武器、副武器、头部防护、身体防护）
SELECT u.username, 
       w1.weapon_name AS main_weapon, 
       w2.weapon_name AS sub_weapon, 
       eh.name AS head_protection, 
       eb.name AS body_protection
FROM player_status ps
JOIN users u ON ps.player_id = u.id
JOIN weapons w1 ON ps.main_weapon_id = w1.weapon_id
JOIN weapons w2 ON ps.sub_weapon_id = w2.weapon_id
JOIN equipment_items eh ON ps.head_protection_id = eh.item_id
JOIN equipment_items eb ON ps.body_protection_id = eb.item_id;

-- 9. 查询每个玩家的任务完成率（已完成任务数 / 总任务数）
SELECT u.username, 
       COUNT(pm.mission_id) AS total_missions,
       SUM(CASE WHEN pm.completed = TRUE THEN 1 ELSE 0 END) AS completed_missions,
       (SUM(CASE WHEN pm.completed = TRUE THEN 1 ELSE 0 END) / COUNT(pm.mission_id)) * 100 AS completion_rate
FROM player_missions pm
JOIN users u ON pm.player_id = u.id
GROUP BY u.username;

-- 10. 查询每个玩家的战斗胜利率（胜利次数 / 总次数）
SELECT u.username, 
       (SELECT COUNT(*) 
        FROM combat_records cr 
        WHERE cr.winner_id = u.id) AS win_count,
       (SELECT COUNT(*) 
        FROM combat_records cr 
        WHERE cr.loser_id = u.id) AS lose_count
FROM users u;
# 多表联接查询：查询 1、3、5、8 使用了多表联接（JOIN），将多个表的数据关联起来。
# 子查询：查询 6、10 使用了子查询，嵌套查询结果。
# 分组统计：查询 5、7、9 使用了 GROUP BY 和聚合函数（如 COUNT、MAX），对数据进行分组统计。

##########索引##########
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_act_name ON activities(act_name);
CREATE INDEX idx_character_name ON chracters(character_name);
CREATE INDEX idx_class_description ON classes(description(100));

CREATE INDEX idx_weapon_type ON weapons(weapon_type);
CREATE INDEX idx_attachment_name ON attachments(name);
CREATE INDEX idx_equipment_name ON equipment_items(name);
CREATE INDEX idx_mission_name ON missions(mission_name);
CREATE INDEX idx_player_mission_progress ON player_missions(progress);
CREATE INDEX idx_combat_time ON combat_records(combat_time);

EXPLAIN SELECT * FROM users WHERE username = 'Alice';

######直方图#######
ANALYZE TABLE users UPDATE HISTOGRAM ON level WITH 10 BUCKETS;
EXPLAIN SELECT COUNT(*) FROM users WHERE level = 5;
   -- level 列表示玩家的等级，可能分布不均匀（例如，低等级玩家较多，高等级玩家较少）。

--    创建直方图可以帮助优化器更好地估计不同等级玩家的分布情况，从而优化查询计划。
--type: ALL：表示全表扫描，性能较差。

--rows: 11：扫描了 11 行数据。

--filtered: 10.00：优化器估计只有 10% 的数据满足条件
#  type: ref：表示使用了索引，性能显著提升。
#  rows: 1：只扫描了 1 行数据。

 # filtered: 100.00：优化器准确估计了满足条件的数据比例。




#######储存函数#########

-- 1. 函数：计算玩家的战斗力，根据玩家的主武器基础伤害和副武器基础伤害，计算玩家的战斗力。
DELIMITER $$

CREATE FUNCTION CalculateCombatPower(player_id INT) 
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE main_weapon_damage INT;
    DECLARE sub_weapon_damage INT;
    DECLARE combat_power INT;

    -- 获取主武器基础伤害
    SELECT base_damage INTO main_weapon_damage
    FROM weapons
    WHERE weapon_id = (SELECT main_weapon_id FROM player_status WHERE player_id = player_id);

    -- 获取副武器基础伤害
    SELECT base_damage INTO sub_weapon_damage
    FROM weapons
    WHERE weapon_id = (SELECT sub_weapon_id FROM player_status WHERE player_id = player_id);

    -- 计算战斗力
    SET combat_power = main_weapon_damage + sub_weapon_damage;

    RETURN combat_power;
END $$

DELIMITER ;

-- 查询玩家 1 的战斗力
SELECT CalculateCombatPower(1) AS combat_power;

-- 2. 函数：检查玩家是否完成所有任务
DELIMITER $$

CREATE FUNCTION CheckAllMissionsCompleted(player_id INT) 
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total_missions INT;
    DECLARE completed_missions INT;

    -- 获取总任务数
    SELECT COUNT(*) INTO total_missions
    FROM player_missions
    WHERE player_id = player_id;

    -- 获取已完成任务数
    SELECT COUNT(*) INTO completed_missions
    FROM player_missions
    WHERE player_id = player_id AND completed = TRUE;

    -- 判断是否完成所有任务
    IF total_missions = completed_missions THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END $$

DELIMITER ;

-- 检查玩家 1 是否完成所有任务
SELECT CheckAllMissionsCompleted(1) AS all_missions_completed;

-- 3. 函数：获取玩家的平均战斗胜利次数
DELIMITER $$

CREATE FUNCTION GetAverageWins(player_id INT) 
RETURNS DECIMAL(5, 2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE total_wins INT;
    DECLARE total_combats INT;
    DECLARE average_wins DECIMAL(5, 2);

    -- 获取总胜利次数
    SELECT COUNT(*) INTO total_wins
    FROM combat_records
    WHERE winner_id = player_id;

    -- 获取总战斗次数
    SELECT COUNT(*) INTO total_combats
    FROM combat_records
    WHERE winner_id = player_id OR loser_id = player_id;

    -- 计算平均胜利次数
    IF total_combats > 0 THEN
        SET average_wins = total_wins / total_combats;
    ELSE
        SET average_wins = 0;
    END IF;

    RETURN average_wins;
END $$

DELIMITER ;

-- 查询玩家 1 的平均战斗胜利次数
SELECT GetAverageWins(1) AS average_wins;

-- 4. 函数：获取玩家的最高分数
DELIMITER $$

CREATE FUNCTION GetMaxScore(player_id INT) 
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE max_score INT;

    -- 获取最高分数
    SELECT MAX(score) INTO max_score
    FROM raking_list
    WHERE player_id = player_id;

    RETURN max_score;
END $$

DELIMITER ;
-- 查询玩家 1 的最高分数
SELECT GetMaxScore(1) AS max_score;

-- 5. 函数：检查玩家是否装备了特定类型的武器
DELIMITER $$

CREATE FUNCTION CheckWeaponTypeEquipped(player_id INT, weapon_type VARCHAR(50)) 
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE weapon_count INT;

    -- 检查玩家是否装备了特定类型的武器
    SELECT COUNT(*) INTO weapon_count
    FROM player_weapon pw
    JOIN weapons w ON pw.weapon_id = w.weapon_id
    WHERE pw.weapon_id IN (
        SELECT main_weapon_id FROM player_status WHERE player_id = player_id
        UNION
        SELECT sub_weapon_id FROM player_status WHERE player_id = player_id
    ) AND w.weapon_type = weapon_type;

    IF weapon_count > 0 THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END $$

DELIMITER ;

-- 检查玩家 1 是否装备了步枪
SELECT CheckWeaponTypeEquipped(1, '步枪') AS is_rifle_equipped;


########储存过程#########
-- 1. 存储过程：更新玩家的经验值：根据玩家完成任务的经验奖励，更新玩家的经验值。
DELIMITER $$

CREATE PROCEDURE UpdatePlayerExperience(IN player_id INT, IN experience_reward INT)
BEGIN
    -- 更新玩家的经验值
    UPDATE users
    SET experience = experience + experience_reward
    WHERE id = player_id;
END $$

DELIMITER ;
-- 更新玩家 1 的经验值，增加 500 点
CALL UpdatePlayerExperience(1, 500);

-- 查询玩家 1 的当前经验值
SELECT experience FROM users WHERE id = 1;

-- 2. 存储过程：重置玩家的任务进度：将某个玩家的所有任务进度重置为 0，并将完成状态设置为 FALSE
DELIMITER $$

CREATE PROCEDURE ResetPlayerMissions(IN player_id INT)
BEGIN
    -- 重置玩家的任务进度
    UPDATE player_missions
    SET progress = 0, completed = FALSE
    WHERE player_id = player_id;
END $$

DELIMITER ;
-- 重置玩家 1 的任务进度
CALL ResetPlayerMissions(1);

-- 查询玩家 1 的任务进度
SELECT * FROM player_missions WHERE player_id = 1;

-- 3. 存储过程：删除玩家的战斗记录：删除某个玩家的所有战斗记录
DELIMITER $$

CREATE PROCEDURE DeletePlayerCombatRecords(IN player_id INT)
BEGIN
    -- 删除玩家的战斗记录
    DELETE FROM combat_records
    WHERE winner_id = player_id OR loser_id = player_id;
END $$

DELIMITER ;

-- 删除玩家 1 的所有战斗记录
CALL DeletePlayerCombatRecords(1);

-- 查询玩家 1 的战斗记录
SELECT * FROM combat_records WHERE winner_id = 1 OR loser_id = 1;

-- 4. 存储过程：统计每个玩家的任务完成情况：统计每个玩家的总任务数、已完成任务数和任务完成率
DELIMITER $$

CREATE PROCEDURE GetPlayerMissionStats()
BEGIN
    -- 统计每个玩家的任务完成情况
    SELECT u.username,
           COUNT(pm.mission_id) AS total_missions,
           SUM(CASE WHEN pm.completed = TRUE THEN 1 ELSE 0 END) AS completed_missions,
           (SUM(CASE WHEN pm.completed = TRUE THEN 1 ELSE 0 END) / COUNT(pm.mission_id)) * 100 AS completion_rate
    FROM player_missions pm
    JOIN users u ON pm.player_id = u.id
    GROUP BY u.username;
END $$

DELIMITER ;

-- 查询所有玩家的任务完成情况
CALL GetPlayerMissionStats();

-- 5. 存储过程：为玩家分配新任务：为某个玩家分配一个新任务，并设置任务的开始时间和结束时间。
DELIMITER $$

CREATE PROCEDURE AssignNewMission(IN player_id INT, IN mission_id INT, IN start_time DATETIME, IN end_time DATETIME)
BEGIN
    -- 为玩家分配新任务
    INSERT INTO player_missions (player_id, mission_id, start_time, end_time, progress, completed)
    VALUES (player_id, mission_id, start_time, end_time, 0, FALSE);
END $$

DELIMITER ;

-- 为玩家 1 分配任务 1，开始时间为当前时间，结束时间为 1 小时后
CALL AssignNewMission(1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR));

-- 查询玩家 1 的任务分配情况
SELECT * FROM player_missions WHERE player_id = 1;



########已经设置的触发器外的集合########3
-- 1. users 表 在插入新用户之前，检查用户名是否已存在。如果用户名已存在，则阻止插入并抛出错误。
DELIMITER $$

CREATE TRIGGER before_insert_users
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE user_count INT;

    -- 检查用户名是否已存在
    SELECT COUNT(*) INTO user_count
    FROM users
    WHERE username = NEW.username;

    -- 如果用户名已存在，抛出错误
    IF user_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Username already exists';
    END IF;
END $$

DELIMITER ;

-- 2. activities 表:在插入新活动之前，检查活动名称是否已存在。如果活动名称已存在，则阻止插入并抛出错误
DELIMITER $$

CREATE TRIGGER before_insert_activities
BEFORE INSERT ON activities
FOR EACH ROW
BEGIN
    DECLARE activity_count INT;

    -- 检查活动名称是否已存在
    SELECT COUNT(*) INTO activity_count
    FROM activities
    WHERE act_name = NEW.act_name;

    -- 如果活动名称已存在，抛出错误
    IF activity_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Activity name already exists';
    END IF;
END $$

DELIMITER ;

-- 3. chracters 表:在插入新角色之前，检查角色名称是否已存在。如果角色名称已存在，则阻止插入并抛出错误。
DELIMITER $$

CREATE TRIGGER before_insert_characters
BEFORE INSERT ON chracters
FOR EACH ROW
BEGIN
    DECLARE character_count INT;

    -- 检查角色名称是否已存在
    SELECT COUNT(*) INTO character_count
    FROM chracters
    WHERE character_name = NEW.character_name;

    -- 如果角色名称已存在，抛出错误
    IF character_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Character name already exists';
    END IF;
END $$

DELIMITER ;

-- 4. classes 表:在插入新兵种之前，检查兵种类型是否已存在。如果兵种类型已存在，则阻止插入并抛出错误
DELIMITER $$

CREATE TRIGGER before_insert_classes
BEFORE INSERT ON classes
FOR EACH ROW
BEGIN
    DECLARE class_count INT;

    -- 检查兵种类型是否已存在
    SELECT COUNT(*) INTO class_count
    FROM classes
    WHERE class_type = NEW.class_type;

    -- 如果兵种类型已存在，抛出错误
    IF class_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Class type already exists';
    END IF;
END $$

DELIMITER ;

-- 5. missions 表:在插入新任务之前，检查任务名称是否已存在。如果任务名称已存在，则阻止插入并抛出错误。
DELIMITER $$

CREATE TRIGGER before_insert_missions
BEFORE INSERT ON missions
FOR EACH ROW
BEGIN
    DECLARE mission_count INT;

    -- 检查任务名称是否已存在
    SELECT COUNT(*) INTO mission_count
    FROM missions
    WHERE mission_name = NEW.mission_name;

    -- 如果任务名称已存在，抛出错误
    IF mission_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Mission name already exists';
    END IF;
END $$

DELIMITER ;

########  ##  ###  ###3####
########  视图  #########
######### #####  #####3#

-- 1 player_weapon_details 显示每个玩家的武器详细信息，包括主武器、副武器及其配件。
CREATE VIEW player_weapon_details AS
SELECT 
    u.username,
    w1.weapon_name AS main_weapon,
    w2.weapon_name AS sub_weapon,
    a1.name AS main_weapon_attachment,
    a2.name AS sub_weapon_attachment
FROM player_status ps
JOIN users u ON ps.player_id = u.id
JOIN weapons w1 ON ps.main_weapon_id = w1.weapon_id
JOIN weapons w2 ON ps.sub_weapon_id = w2.weapon_id
LEFT JOIN attachments a1 ON ps.main_weapon_id = a1.attachment_id
LEFT JOIN attachments a2 ON ps.sub_weapon_id = a2.attachment_id;

SELECT * FROM player_weapon_details;

-- 2 player_mission_progress 显示每个玩家的任务进度，包括任务名称、进度百分比和完成状态。
CREATE VIEW player_mission_progress AS
SELECT 
    u.username,
    m.mission_name,
    pm.progress,
    pm.completed
FROM player_missions pm
JOIN users u ON pm.player_id = u.id
JOIN missions m ON pm.mission_id = m.id;
SELECT * FROM player_mission_progress;

-- 3 combat_summary 显示每个玩家的战斗总结，包括胜利次数、失败次数和胜率。
CREATE VIEW combat_summary AS
SELECT 
    u.username,
    COUNT(CASE WHEN cr.winner_id = u.id THEN 1 END) AS win_count,
    COUNT(CASE WHEN cr.loser_id = u.id THEN 1 END) AS lose_count,
    ROUND(COUNT(CASE WHEN cr.winner_id = u.id THEN 1 END) / COUNT(*) * 100, 2) AS win_rate
FROM combat_records cr
JOIN users u ON cr.winner_id = u.id OR cr.loser_id = u.id
GROUP BY u.username;
SELECT * FROM combat_summary;

-- 4 activity_participation 显示每个活动的参与情况，包括活动名称、总参与人数和完成人数。
CREATE VIEW activity_participation AS
SELECT 
    act_name,
    total_participants,
    completed_users
FROM activities;
SELECT * FROM activity_participation;

--- 5 player_equipment_summary 显示每个玩家的装备总结，包括主武器、副武器、头部防护和身体防护。
CREATE VIEW player_equipment_summary AS
SELECT 
    u.username,
    w1.weapon_name AS main_weapon,
    w2.weapon_name AS sub_weapon,
    eh.name AS head_protection,
    eb.name AS body_protection
FROM player_status ps
JOIN users u ON ps.player_id = u.id
JOIN weapons w1 ON ps.main_weapon_id = w1.weapon_id
JOIN weapons w2 ON ps.sub_weapon_id = w2.weapon_id
JOIN equipment_items eh ON ps.head_protection_id = eh.item_id
JOIN equipment_items eb ON ps.body_protection_id = eb.item_id;
SELECT * FROM player_equipment_summary;

