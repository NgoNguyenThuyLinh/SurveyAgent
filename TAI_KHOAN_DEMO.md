# 🔐 TÀI KHOẢN DEMO - NCKH SURVEY SYSTEM

**Ngày cập nhật:** 6 Tháng 11, 2025  
**Trạng thái:** Sau khi xóa vai trò Teacher/Student

---

## 📋 **DANH SÁCH TÀI KHOẢN**

Hệ thống hiện có **3 vai trò**: Admin, Creator, User

---

### 1️⃣ **ADMIN - Quản trị viên**

| Thông tin | Chi tiết |
|-----------|----------|
| 🆔 **Username** | `admin` hoặc `admin_demo` |
| 📧 **Email** | `admin@demo.com` |
| 🔑 **Password** | `test123` (test routes) hoặc `Demo@1234` (seed script) |
| 👤 **Tên đầy đủ** | Admin User |
| 🎭 **Vai trò** | `admin` |

**Quyền hạn:**
- ✅ Toàn quyền quản trị hệ thống
- ✅ Quản lý người dùng (CRUD users)
- ✅ Tạo và quản lý khảo sát
- ✅ Tạo và quản lý template
- ✅ Xem phân tích và báo cáo
- ✅ Truy cập tất cả các tính năng

**Menu hiển thị:**
- Dashboard
- Surveys (Browse, Create)
- Analytics
- **Manage Users** (chỉ admin)
- Settings

---

### 2️⃣ **CREATOR - Người tạo khảo sát**

| Thông tin | Chi tiết |
|-----------|----------|
| 🆔 **Username** | `creator1` hoặc `creator_demo` |
| 📧 **Email** | `creator@demo.com` |
| 🔑 **Password** | `test123` (test routes) hoặc `Demo@1234` (seed script) |
| 👤 **Tên đầy đủ** | Creator User |
| 🎭 **Vai trò** | `creator` |

**Quyền hạn:**
- ✅ Tạo khảo sát mới
- ✅ Quản lý khảo sát của mình
- ✅ Tạo và sử dụng template
- ✅ Xem phân tích dữ liệu khảo sát
- ✅ Tạo collectors (liên kết khảo sát)
- ❌ Không thể quản lý người dùng khác

**Menu hiển thị:**
- Dashboard
- Surveys (Browse, Create)
- Analytics
- Settings

**Trước đây:** Vai trò này tương đương với "Teacher" đã bị xóa

---

### 3️⃣ **USER - Người dùng/Người trả lời**

| Thông tin | Chi tiết |
|-----------|----------|
| 🆔 **Username** | `user1` hoặc `user_demo` |
| 📧 **Email** | `user@demo.com` hoặc `user1-5@example.com` |
| 🔑 **Password** | `test123` (test routes) hoặc `Demo@1234` (seed script) |
| 👤 **Tên đầy đủ** | Regular User / User One |
| 🎭 **Vai trò** | `user` |

**Quyền hạn:**
- ✅ Trả lời khảo sát (thông qua collector links)
- ✅ Xem danh sách khảo sát được giao
- ✅ Xem lịch sử phản hồi của mình
- ❌ Không thể tạo khảo sát
- ❌ Không thể xem phân tích

**Menu hiển thị:**
- Dashboard
- My Surveys (danh sách khảo sát)
- Settings

**Trước đây:** Vai trò này tương đương với "Student" đã bị xóa

---

## 🚀 **CÁCH TẠO TÀI KHOẢN DEMO**

### **Phương án 1: Sử dụng Test Routes** (Nhanh nhất)

```bash
# Từ thư mục gốc
curl -X POST http://localhost:5000/api/test/create-accounts
```

**Hoặc mở trình duyệt:**
```
http://localhost:5000/api/test/create-accounts
```

**Kết quả:**
```json
{
  "success": true,
  "message": "Test accounts created/updated successfully!",
  "testCredentials": {
    "accounts": [
      { "username": "admin", "password": "test123", "role": "admin" },
      { "username": "creator1", "password": "test123", "role": "creator" },
      { "username": "user1", "password": "test123", "role": "user" }
    ]
  }
}
```

---

### **Phương án 2: Chạy Seed Script** (Đầy đủ dữ liệu demo)

```bash
# Từ thư mục Backend
cd Backend
node scripts/seed-demo-data.js
```

**Tài khoản được tạo:**
- ✅ 3 users (admin_demo, creator_demo, user_demo)
- ✅ 3 survey templates
- ✅ Sample questions
- ✅ Demo surveys
- ✅ Test responses

**Password:** `Demo@1234` (tất cả tài khoản)

---

### **Phương án 3: Docker Init** (Từ Docker)

```bash
# Khởi động Docker với init.sql
cd Docker
docker-compose up -d

# Tài khoản sẽ tự động được tạo:
# - creator1 (creator@example.com) - role: creator
# - user1-5 (user1-5@example.com) - role: user
```

**Password:** Xem trong `Docker/init.sql` (bcrypt hash)

---

## 🔄 **THAY ĐỔI TỪ PHIÊN BẢN CŨ**

### ❌ **Đã Xóa**
| Vai trò cũ | Trạng thái |
|------------|-----------|
| `teacher` | ❌ **ĐÃ XÓA** → Chuyển thành `creator` |
| `student` | ❌ **ĐÃ XÓA** → Chuyển thành `user` |

### ✅ **Vai trò mới**
| Vai trò | Mô tả |
|---------|-------|
| `admin` | Giữ nguyên - Quản trị viên |
| `creator` | **MỚI** - Thay thế "teacher" |
| `user` | **MỚI** - Thay thế "student" |

### 📝 **Migration Guide**
Nếu bạn có tài khoản cũ trong database:
- Tài khoản `role='teacher'` → Cần update thành `role='creator'`
- Tài khoản `role='student'` → Cần update thành `role='user'`

**SQL Update:**
```sql
UPDATE users SET role = 'creator' WHERE role = 'teacher';
UPDATE users SET role = 'user' WHERE role = 'student';
```

---

## 🧪 **KIỂM TRA TÀI KHOẢN**

### **Test Login API**

```bash
# Login với Admin
curl -X POST http://localhost:5000/api/modules/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Demo@1234"
  }'

# Login với Creator
curl -X POST http://localhost:5000/api/modules/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@demo.com",
    "password": "Demo@1234"
  }'

# Login với User
curl -X POST http://localhost:5000/api/modules/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@demo.com",
    "password": "Demo@1234"
  }'
```

**Response mẫu:**
```json
{
  "error": false,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin_demo",
      "email": "admin@demo.com",
      "role": "admin",
      "full_name": "Admin User"
    }
  }
}
```

---

## 📱 **ĐĂNG NHẬP QUA FRONTEND**

### **URL Login:**
```
http://localhost:3000/login
```

### **Thông tin đăng nhập:**

**Option 1: Test accounts**
- Email: `admin@demo.com` | Password: `Demo@1234`
- Email: `creator@demo.com` | Password: `Demo@1234`
- Email: `user@demo.com` | Password: `Demo@1234`

**Option 2: Simple test**
- Username: `admin` | Password: `test123`
- Username: `creator1` | Password: `test123`
- Username: `user1` | Password: `test123`

---

## ⚙️ **CẤU HÌNH MẶC ĐỊNH**

### **Backend Environment**
```env
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
BCRYPT_ROUNDS=10
```

### **User Model** (Database)
```javascript
role: ENUM('admin', 'creator', 'user')
default: 'user'
```

---

## 🔒 **BẢO MẬT**

### ⚠️ **CẢNH BÁO PRODUCTION**

**Các tài khoản demo này CHỈ dùng cho môi trường development/testing!**

**Trước khi deploy production:**
1. ❌ **XÓA** tất cả test accounts
2. ❌ **XÓA** hoặc disable test routes (`/api/test/*`)
3. ✅ Thay đổi tất cả passwords mặc định
4. ✅ Sử dụng JWT secrets mạnh
5. ✅ Enable rate limiting
6. ✅ Kích hoạt HTTPS

---

## 📞 **HỖ TRỢ**

### **Nếu không login được:**

1. **Kiểm tra Backend running:**
   ```bash
   curl http://localhost:5000/api/modules/health
   ```

2. **Kiểm tra database connection:**
   ```bash
   # Vào MySQL
   mysql -u root -p
   USE NCKH;
   SELECT username, email, role FROM users;
   ```

3. **Reset password:**
   ```bash
   # Chạy lại test accounts
   curl -X POST http://localhost:5000/api/test/create-accounts
   ```

4. **Xem logs:**
   ```bash
   cd Backend
   npm start
   # Xem console output
   ```

---

## 📚 **TÀI LIỆU LIÊN QUAN**

- `QUICK_START.md` - Hướng dẫn khởi động nhanh
- `Backend/scripts/seed-demo-data.js` - Script tạo dữ liệu demo
- `Backend/src/routes/test.routes.js` - Test routes
- `__purge_backups__/CHANGELOG.md` - Chi tiết thay đổi vai trò

---

**Cập nhật cuối:** 6/11/2025  
**Phiên bản:** 2.0 (Sau khi xóa Teacher/Student)  
**Trạng thái:** ✅ Sẵn sàng sử dụng
