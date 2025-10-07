import React, { useState, useEffect } from "react";
import { Card, Input, Button, Badge } from "../components/ui.jsx";
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Database,
    Palette,
    Globe,
    Smartphone,
    Save,
    RotateCcw,
    CheckCircle,
    AlertCircle,
    Moon,
    Sun,
    Volume2,
    VolumeX,
    Mail,
    Key,
    HardDrive,
    Wifi,
    Monitor,
    Languages,
    Clock,
    MapPin,
    Camera,
    Lock,
    Eye,
    EyeOff
} from "lucide-react";
import "../css/Settings.css";

const initialSettings = {
    // General Settings
    siteName: "Fitness Pro",
    siteDescription: "ระบบจัดการโปรแกรมฟิตเนส",
    language: "th",
    timezone: "Asia/Bangkok",
    dateFormat: "DD/MM/YYYY",

    // API Settings
    apiBaseUrl: "https://api.fitnesspro.com",
    apiKey: "••••••••••••••••",
    uploadLimit: 50,
    requestTimeout: 30,

    // User Preferences
    theme: "dark",
    notifications: true,
    soundEnabled: true,
    emailNotifications: true,
    pushNotifications: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,

    // Display Settings
    itemsPerPage: 10,
    showAvatars: true,
    compactMode: false,
    animationsEnabled: true,

    username: "admin",
    email: "admin@fitnesspro.com"
};

export default function Settings() {
    const [activeTab, setActiveTab] = useState("general");
    const [settings, setSettings] = useState(initialSettings);

    const [hasChanges, setHasChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // null, 'saving', 'success', 'error'
    const [showApiKey, setShowApiKey] = useState(false);

    const tabs = [
        { id: "general", label: "ทั่วไป", icon: <SettingsIcon size={18} /> },
        { id: "account", label: "บัญชี", icon: <User size={18} /> },
        { id: "notifications", label: "การแจ้งเตือน", icon: <Bell size={18} /> },
        { id: "security", label: "ความปลอดภัย", icon: <Shield size={18} /> },
        { id: "api", label: "API & ข้อมูล", icon: <Database size={18} /> },
        { id: "appearance", label: "รูปลักษณ์", icon: <Palette size={18} /> }
    ];

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSaveStatus('success');
        setHasChanges(false);

    };

    const handleReset = () => {
        setSettings(initialSettings); // 3. ตั้งค่ากลับเป็นค่าเริ่มต้น
        setHasChanges(false);
        setSaveStatus(null);
    };

    useEffect(() => {
        let timer;
        if (saveStatus === 'success') {
            timer = setTimeout(() => {
                setSaveStatus(null);
            }, 3000);
        }

        // cleanup function จะทำงานเมื่อ component ถูก unmount
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [saveStatus]);



    const renderGeneralSettings = () => (
        <div className="settings-section">
            <div className="section-header">
                <h2 className="section-title">การตั้งค่าทั่วไป</h2>
                <p className="section-description">จัดการการตั้งค่าพื้นฐานของระบบ</p>
            </div>

            <div className="settings-grid">
                <div className="setting-item">
                    <label className="setting-label">ชื่อเว็บไซต์</label>
                    <Input
                        value={settings.siteName}
                        onChange={(e) => handleSettingChange('siteName', e.target.value)}
                        placeholder="ชื่อเว็บไซต์"
                    />
                </div>

                <div className="setting-item">
                    <label className="setting-label">คำอธิบาย</label>
                    <Input
                        value={settings.siteDescription}
                        onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                        placeholder="คำอธิบายเว็บไซต์"
                    />
                </div>

                <div className="setting-item">
                    <label className="setting-label">
                        <Languages size={16} />
                        ภาษา
                    </label>
                    <select
                        className="settings-select"
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                    >
                        <option value="th">ไทย</option>
                        <option value="en">English</option>
                    </select>
                </div>

                <div className="setting-item">
                    <label className="setting-label">
                        <Clock size={16} />
                        เขตเวลา
                    </label>
                    <select
                        className="settings-select"
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                    >
                        <option value="Asia/Bangkok">เอเชีย/กรุงเทพ</option>
                        <option value="UTC">UTC</option>
                    </select>
                </div>

                <div className="setting-item setting-item-full">
                    <label className="setting-label">รูปแบบวันที่</label>
                    <div className="radio-group">
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="dateFormat"
                                value="DD/MM/YYYY"
                                checked={settings.dateFormat === "DD/MM/YYYY"}
                                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                            />
                            <span>31/12/2024</span>
                        </label>
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="dateFormat"
                                value="MM/DD/YYYY"
                                checked={settings.dateFormat === "MM/DD/YYYY"}
                                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                            />
                            <span>12/31/2024</span>
                        </label>
                        <label className="radio-item">
                            <input
                                type="radio"
                                name="dateFormat"
                                value="YYYY-MM-DD"
                                checked={settings.dateFormat === "YYYY-MM-DD"}
                                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                            />
                            <span>2024-12-31</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAccountSettings = () => (
        <div className="settings-section">
            <div className="section-header">
                <h2 className="section-title">การตั้งค่าบัญชี</h2>
                <p className="section-description">จัดการข้อมูลส่วนตัวและบัญชีผู้ใช้</p>
            </div>

            <div className="account-profile">
                <div className="profile-avatar">
                    <div className="avatar-circle">
                        <User size={24} />
                    </div>
                    <Button variant="outline" size="sm" className="avatar-button">
                        <Camera size={14} />
                        เปลี่ยนรูป
                    </Button>
                </div>
                <div className="profile-info">
                    <h3 className="profile-name">Admin User</h3>
                    <p className="profile-email">admin@fitnesspro.com</p>
                    <Badge variant="success" size="sm">ผู้ดูแลระบบ</Badge>
                </div>
            </div>

            <div className="settings-grid">
                <div className="setting-item">
                    <label className="setting-label">ชื่อผู้ใช้</label>
                    <Input
                        value={settings.username}
                        onChange={(e) => handleSettingChange('username', e.target.value)}
                        placeholder="ชื่อผู้ใช้"
                    />
                </div>

                <div className="setting-item">
                    <label className="setting-label">อีเมล</label>
                    <Input
                        value={settings.email}
                        onChange={(e) => handleSettingChange('email', e.target.value)}
                        placeholder="อีเมล"
                    />
                </div>

                <div className="setting-item setting-item-full">
                    <label className="setting-label">เปลี่ยนรหัสผ่าน</label>
                    <div className="password-fields">
                        <Input type="password" placeholder="รหัสผ่านปัจจุบัน" />
                        <Input type="password" placeholder="รหัสผ่านใหม่" />
                        <Input type="password" placeholder="ยืนยันรหัสผ่านใหม่" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="settings-section">
            <div className="section-header">
                <h2 className="section-title">การแจ้งเตือน</h2>
                <p className="section-description">จัดการการแจ้งเตือนและการสื่อสาร</p>
            </div>

            <div className="notification-groups">
                <div className="notification-group">
                    <div className="group-header">
                        <h3 className="group-title">การแจ้งเตือนทั่วไป</h3>
                    </div>
                    <div className="notification-items">
                        <div className="notification-item">
                            <div className="notification-info">
                                <Bell size={16} />
                                <div>
                                    <div className="notification-title">การแจ้งเตือนในระบบ</div>
                                    <div className="notification-description">แสดงการแจ้งเตือนภายในระบบ</div>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications}
                                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-info">
                                <Volume2 size={16} />
                                <div>
                                    <div className="notification-title">เสียงแจ้งเตือน</div>
                                    <div className="notification-description">เล่นเสียงเมื่อมีการแจ้งเตือน</div>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.soundEnabled}
                                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="notification-group">
                    <div className="group-header">
                        <h3 className="group-title">การแจ้งเตือนภายนอก</h3>
                    </div>
                    <div className="notification-items">
                        <div className="notification-item">
                            <div className="notification-info">
                                <Mail size={16} />
                                <div>
                                    <div className="notification-title">อีเมล</div>
                                    <div className="notification-description">ส่งการแจ้งเตือนทางอีเมล</div>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>

                        <div className="notification-item">
                            <div className="notification-info">
                                <Smartphone size={16} />
                                <div>
                                    <div className="notification-title">Push Notifications</div>
                                    <div className="notification-description">แจ้งเตือนผ่านเบราว์เซอร์</div>
                                </div>
                            </div>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={settings.pushNotifications}
                                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="settings-section">
            <div className="section-header">
                <h2 className="section-title">ความปลอดภัย</h2>
                <p className="section-description">จัดการการรักษาความปลอดภัยและการเข้าถึง</p>
            </div>

            <div className="security-status">
                <div className="security-score">
                    <div className="score-circle">
                        <div className="score-number">85</div>
                        <div className="score-label">คะแนน</div>
                    </div>
                </div>
                <div className="security-info">
                    <h3>ระดับความปลอดภัย: <span className="security-level good">ดี</span></h3>
                    <p>บัญชีของคุณมีความปลอดภัยในระดับดี</p>
                    <div className="security-recommendations">
                        <div className="recommendation">
                            <CheckCircle size={14} className="check-icon" />
                            รหัสผ่านแข็งแกร่ง
                        </div>
                        <div className="recommendation pending">
                            <AlertCircle size={14} className="warning-icon" />
                            ควรเปิดใช้ Two-Factor Authentication
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-grid">
                <div className="setting-item">
                    <label className="setting-label">
                        <Lock size={16} />
                        Two-Factor Authentication
                    </label>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={settings.twoFactorAuth}
                            onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <label className="setting-label">Session Timeout (นาที)</label>
                    <Input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                        min="5"
                        max="1440"
                    />
                </div>

                <div className="setting-item">
                    <label className="setting-label">รหัสผ่านหมดอายุ (วัน)</label>
                    <Input
                        type="number"
                        value={settings.passwordExpiry}
                        onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                        min="30"
                        max="365"
                    />
                </div>

                <div className="setting-item">
                    <label className="setting-label">ความพยายามเข้าสู่ระบบ</label>
                    <Input
                        type="number"
                        value={settings.loginAttempts}
                        onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                        min="3"
                        max="10"
                    />
                </div>
            </div>
        </div>
    );

    const renderApiSettings = () => (
        <div className="settings-section">
            <div className="section-header">
                <h2 className="section-title">API และข้อมูล</h2>
                <p className="section-description">จัดการการเชื่อมต่อ API และการจัดเก็บข้อมูล</p>
            </div>

            <div className="api-status">
                <div className="status-indicator">
                    <div className="status-dot status-online"></div>
                    <span>API เชื่อมต่อแล้ว</span>
                </div>
                <div className="api-stats">
                    <div className="api-stat">
                        <div className="stat-value">1,234</div>
                        <div className="stat-label">Requests วันนี้</div>
                    </div>
                    <div className="api-stat">
                        <div className="stat-value">99.9%</div>
                        <div className="stat-label">Uptime</div>
                    </div>
                </div>
            </div>

            <div className="settings-grid">
                <div className="setting-item">
                    <label className="setting-label">
                        <Globe size={16} />
                        API Base URL
                    </label>
                    <Input
                        value={settings.apiBaseUrl}
                        onChange={(e) => handleSettingChange('apiBaseUrl', e.target.value)}
                        placeholder="https://api.example.com"
                    />
                </div>

                <div className="setting-item">
                    <label className="setting-label">
                        <Key size={16} />
                        API Key
                    </label>
                    <div className="input-with-button">
                        <Input
                            type={showApiKey ? "text" : "password"}
                            value={settings.apiKey}
                            onChange={(e) => handleSettingChange('apiKey', e.target.value)}
                            placeholder="API Key"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="input-button"
                        >
                            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                    </div>
                </div>

                <div className="setting-item">
                    <label className="setting-label">
                        <HardDrive size={16} />
                        Upload Limit (MB)
                    </label>
                    <Input
                        type="number"
                        value={settings.uploadLimit}
                        onChange={(e) => handleSettingChange('uploadLimit', parseInt(e.target.value))}
                        min="1"
                        max="1000"
                    />
                </div>

                <div className="setting-item">
                    <label className="setting-label">Request Timeout (วินาที)</label>
                    <Input
                        type="number"
                        value={settings.requestTimeout}
                        onChange={(e) => handleSettingChange('requestTimeout', parseInt(e.target.value))}
                        min="5"
                        max="300"
                    />
                </div>
            </div>
        </div>
    );

    const renderAppearanceSettings = () => (
        <div className="settings-section">
            <div className="section-header">
                <h2 className="section-title">รูปลักษณ์</h2>
                <p className="section-description">ปรับแต่งรูปลักษณ์และการแสดงผล</p>
            </div>

            <div className="theme-selector">
                <div className="theme-options">
                    <div
                        className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                        onClick={() => handleSettingChange('theme', 'light')}
                    >
                        <div className="theme-preview theme-light">
                            <Sun size={20} />
                        </div>
                        <span>โหมดสว่าง</span>
                    </div>
                    <div
                        className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                        onClick={() => handleSettingChange('theme', 'dark')}
                    >
                        <div className="theme-preview theme-dark">
                            <Moon size={20} />
                        </div>
                        <span>โหมดมืด</span>
                    </div>
                    <div
                        className={`theme-option ${settings.theme === 'auto' ? 'active' : ''}`}
                        onClick={() => handleSettingChange('theme', 'auto')}
                    >
                        <div className="theme-preview theme-auto">
                            <Monitor size={20} />
                        </div>
                        <span>ตามระบบ</span>
                    </div>
                </div>
            </div>

            <div className="settings-grid">
                <div className="setting-item">
                    <label className="setting-label">รายการต่อหน้า</label>
                    <select
                        className="settings-select"
                        value={settings.itemsPerPage}
                        onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                <div className="setting-item">
                    <label className="setting-label">แสดงรูปโปรไฟล์</label>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={settings.showAvatars}
                            onChange={(e) => handleSettingChange('showAvatars', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <label className="setting-label">โหมดกะทัดรัด</label>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={settings.compactMode}
                            onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="setting-item">
                    <label className="setting-label">เปิดใช้ภาพเคลื่อนไหว</label>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={settings.animationsEnabled}
                            onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "general": return renderGeneralSettings();
            case "account": return renderAccountSettings();
            case "notifications": return renderNotificationSettings();
            case "security": return renderSecuritySettings();
            case "api": return renderApiSettings();
            case "appearance": return renderAppearanceSettings();
            default: return renderGeneralSettings();
        }
    };

    return (
        <div className="settings-container">
            {/* Header */}
            <div className="settings-header">
                <div className="header-content">
                    <div className="header-icon">
                        <SettingsIcon size={32} />
                    </div>
                    <div className="header-text">
                        <h1 className="page-title">การตั้งค่า</h1>
                        <p className="page-subtitle">
                            จัดการและปรับแต่งการตั้งค่าระบบตามความต้องการ
                        </p>
                    </div>
                </div>
                <div className="header-status">
                    {saveStatus === 'success' && (
                        <div className="status-badge status-success">
                            <CheckCircle size={16} />
                            บันทึกแล้ว
                        </div>
                    )}
                    {saveStatus === 'saving' && (
                        <div className="status-badge status-loading">
                            <div className="loading-spinner"></div>
                            กำลังบันทึก...
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="settings-content">
                {/* Sidebar */}
                <div className="settings-sidebar">
                    <nav className="settings-nav">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="settings-main">
                    <Card className="settings-card">
                        {renderTabContent()}
                    </Card>
                </div>
            </div>

            {/* Sticky Footer */}
            {hasChanges && (
                <div className="settings-footer">
                    <div className="footer-content">
                        <div className="changes-indicator">
                            <AlertCircle size={16} />
                            <span>คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</span>
                        </div>
                        <div className="footer-actions">
                            <Button
                                variant="outline"
                                onClick={handleReset}
                                disabled={saveStatus === 'saving'}
                            >
                                <RotateCcw size={16} />
                                รีเซ็ต
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saveStatus === 'saving'}
                                className="save-button"
                            >
                                {saveStatus === 'saving' ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        บันทึกการตั้งค่า
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}