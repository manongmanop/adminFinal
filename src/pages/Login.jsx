import React, { useState, useEffect } from "react";
import { Input, Button, Badge } from "../components/ui.jsx";
import { 
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle,
  Dumbbell,
  Activity,
  Crown,
  Loader2,
  ArrowRight,
  Mail,
  Phone,
  Globe
} from "lucide-react";
import "../css/Login.css";

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  // Demo credentials
//   const demoCredentials = {
//     username: "admin",
//     password: "admin123"
//   };

  useEffect(() => {
    let interval;
    if (isLocked && lockTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimeRemaining]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้");
      return false;
    }
    if (!formData.password) {
      setError("กรุณากรอกรหัสผ่าน");
      return false;
    }
    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`บัญชีถูกล็อค กรุณารอ ${Math.floor(lockTimeRemaining / 60)}:${String(lockTimeRemaining % 60).padStart(2, '0')} นาที`);
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check credentials
      if (formData.username === demoCredentials.username && 
          formData.password === demoCredentials.password) {
        setSuccess("เข้าสู่ระบบสำเร็จ! กำลังเข้าสู่แดชบอร์ด...");
        setLoginAttempts(0);
        
        // Simulate redirect
        setTimeout(() => {
          alert("เข้าสู่ระบบสำเร็จ! (Demo)");
        }, 1500);
      } else {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockTimeRemaining(300); // 5 minutes
          setError("ความพยายามเข้าสู่ระบบเกินกำหนด บัญชีถูกล็อคชั่วคราว 5 นาที");
        } else {
          setError(`ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (เหลือ ${5 - newAttempts} ครั้ง)`);
        }
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว (Demo)");
  };

  const formatLockTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div className="login-container">
      {/* Background */}
      <div className="login-background">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>

      {/* Main Content */}
      <div className="login-content">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="logo-icon">
                <Dumbbell size={40} />
              </div>
              <div className="logo-text">
                <h1>Fitness Pro</h1>
                <p>Admin Dashboard</p>
              </div>
            </div>
            
            <div className="brand-description">
              <h2>ระบบจัดการโปรแกรมฟิตเนส</h2>
              <p>เข้าสู่แดshboard เพื่อจัดการโปรแกรม ผู้ใช้งาน และข้อมูลสถิติทั้งหมด</p>
            </div>

            <div className="brand-features">
              <div className="feature-item">
                <Activity size={20} />
                <span>จัดการโปรแกรมออกกำลังกาย</span>
              </div>
              <div className="feature-item">
                <User size={20} />
                <span>ติดตามผู้ใช้งาน</span>
              </div>
              <div className="feature-item">
                <Crown size={20} />
                <span>วิเคราะห์ข้อมูลและรายงาน</span>
              </div>
            </div>

            <div className="brand-stats">
              <div className="stat">
                <div className="stat-number">2,450+</div>
                <div className="stat-label">ผู้ใช้งาน</div>
              </div>
              <div className="stat">
                <div className="stat-number">150+</div>
                <div className="stat-label">โปรแกรม</div>
              </div>
              <div className="stat">
                <div className="stat-number">98%</div>
                <div className="stat-label">ความพึงพอใจ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            {/* Header */}
            <div className="form-header">
              <div className="form-icon">
                <Shield size={24} />
              </div>
              <h3>เข้าสู่ระบบ Admin</h3>
              <p>กรุณาเข้าสู่ระบบเพื่อเข้าถึงแดชบอร์ดผู้ดูแล</p>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <div className="demo-header">
                <Badge variant="warning" size="sm">Demo</Badge>
                <span>ข้อมูลทดสอบ</span>
              </div>
              <div className="demo-info">
                <div className="demo-item">
                  <User size={14} />
                  <span>Username: <code>admin</code></span>
                </div>
                <div className="demo-item">
                  <Lock size={14} />
                  <span>Password: <code>admin123</code></span>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {/* Username Field */}
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  ชื่อผู้ใช้
                </label>
                <div className="input-wrapper">
                  <Input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="กรอกชื่อผู้ใช้"
                    className="form-input"
                    disabled={isLoading || isLocked}
                  />
                  <div className="input-icon">
                    <User size={18} />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <Lock size={16} />
                  รหัสผ่าน
                </label>
                <div className="input-wrapper">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="กรอกรหัสผ่าน"
                    className="form-input password-input"
                    disabled={isLoading || isLocked}
                  />
                  <div className="input-icon">
                    <Lock size={18} />
                  </div>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isLocked}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading || isLocked}
                  />
                  <span className="checkbox-text">จำการเข้าสู่ระบบ</span>
                </label>
                <button
                  type="button"
                  className="forgot-password"
                  onClick={handleForgotPassword}
                  disabled={isLoading || isLocked}
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="message error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="message success-message">
                  <CheckCircle size={16} />
                  <span>{success}</span>
                </div>
              )}

              {/* Lock Timer */}
              {isLocked && (
                <div className="lock-message">
                  <Lock size={16} />
                  <span>บัญชีถูกล็อค เหลือเวลา: {formatLockTime(lockTimeRemaining)}</span>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading || isLocked}
                className="login-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="loading-spinner" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    เข้าสู่ระบบ
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>

              {/* Login Attempts */}
              {loginAttempts > 0 && !isLocked && (
                <div className="attempts-warning">
                  <AlertCircle size={14} />
                  <span>ความพยายาม: {loginAttempts}/5</span>
                </div>
              )}
            </form>

            {/* Footer */}
            <div className="form-footer">
              <div className="security-note">
                <Shield size={14} />
                <span>การเชื่อมต่อของคุณได้รับการรักษาความปลอดภัยด้วย SSL</span>
              </div>
              <div className="support-links">
                <a href="#" className="support-link">
                  <Mail size={14} />
                  <span>ติดต่อสนับสนุน</span>
                </a>
                <a href="#" className="support-link">
                  <Phone size={14} />
                  <span>โทร 02-xxx-xxxx</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}