# 🔐 TÀI KHOẢN TEST - NCKH SURVEY SYSTEM

**Ngày cập nhật:** 7 Tháng 11, 2025  
**Trạng thái:** ✅ PASSWORDS FIXED

---

## 📋 **TÀI KHOẢN ĐĂNG NHẬP**

Tất cả các tài khoản sử dụng mật khẩu: **`test123`**

---

### 1️⃣ **ADMIN**

| Thông tin | Chi tiết |
|-----------|----------|
| 🆔 **Username** | `admin` |
| 📧 **Email** | `admin@example.com` |
| 🔑 **Password** | `test123` |
| 🎭 **Vai trò** | `admin` |

✅ **Đã kiểm tra:** Login thành công

---

### 2️⃣ **CREATOR**

| Thông tin | Chi tiết |
|-----------|----------|
| 🆔 **Username** | `creator1` |
| 📧 **Email** | `creator@example.com` |
| 🔑 **Password** | `test123` |
| 🎭 **Vai trò** | `creator` |

✅ **Đã kiểm tra:** Login thành công

---

### 3️⃣ **USERS**

| Username | Email | Password | Vai trò |
|----------|-------|----------|---------|
| `user1` | `user1@example.com` | `test123` | `user` |
| `user2` | `user2@example.com` | `test123` | `user` |
| `user3` | `user3@example.com` | `test123` | `user` |

---

## 🔧 **CÁCH SỬA LỖI**

Vấn đề đã được khắc phục bằng cách:

1. **Nguyên nhân:** Passwords trong database là placeholder hashes không hợp lệ
2. **Giải pháp:** Tạo script để hash passwords đúng cách với bcrypt
3. **File script:** `Backend/scripts/fix-passwords-direct.js`

### Nếu cần chạy lại:

```bash
cd Backend
node scripts/fix-passwords-direct.js
```

---

## 🧪 **KIỂM TRA LOGIN**

### Sử dụng PowerShell:

```powershell
$body = @{username='admin'; password='test123'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/modules/auth/login' -Method POST -Body $body -ContentType 'application/json'
```

### Sử dụng test-login.html:

Mở file `test-login.html` trong trình duyệt và thử đăng nhập.

---

**✨ Trạng thái:** Tất cả tài khoản đã được sửa và hoạt động bình thường!
