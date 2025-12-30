# LLM Survey System Backend

Hệ thống khảo sát sử dụng Large Language Models (LLM) để tạo khảo sát và phân tích phản hồi của sinh viên.

## Giới thiệu

Backend này phục vụ cho dự án nghiên cứu khoa học "Ứng dụng Mô hình Ngôn ngữ Lớn (LLM) để Tạo Khảo Sát và Phân Tích Phản Hồi của Sinh Viên". Hệ thống cung cấp các API cho phép:

- Quản lý người dùng (sinh viên, giảng viên, quản trị viên)
- Tạo và quản lý mẫu khảo sát
- Tạo khảo sát từ các mẫu có sẵn
- Thu thập phản hồi từ sinh viên
- Sử dụng LLM để tạo mẫu khảo sát mới và phân tích phản hồi

## Cài đặt

### Yêu cầu

- Node.js v16+
- MySQL 8.0+
- OpenAI API key (nếu sử dụng chức năng LLM)

### Bước 1: Cài đặt Docker và chạy database

```bash
cd Docker
docker-compose up -d
```

Điều này sẽ tạo:
- MySQL server trên cổng 3306
- PHPMyAdmin trên cổng 8080 (truy cập qua http://localhost:8080)

### Bước 2: Cài đặt các dependencies

```bash
cd Backend
npm install
```

### Bước 3: Cấu hình môi trường

Tạo file `.env` từ file `.env.example` và cập nhật các giá trị tương ứng:

```bash
cp .env.example .env
```

Cập nhật các thông tin sau trong file `.env`:
- Thông tin kết nối database
- JWT secret key
- OpenAI API key

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy trên cổng 3000 (mặc định).

## Cấu trúc dự án

```
/src
  /config        # Cấu hình (database, app, etc.)
  /controllers   # Xử lý logic nghiệp vụ
  /middleware    # Middleware (auth, logging, etc.)
  /models        # Định nghĩa model dữ liệu
  /routes        # Định nghĩa API routes
  /services      # Các service (LLM, email, etc.)
  /utils         # Tiện ích
  index.js       # Entry point
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/change-password` - Đổi mật khẩu

### Users

- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/:id` - Lấy thông tin một người dùng
- `PUT /api/users/:id` - Cập nhật thông tin người dùng
- `DELETE /api/users/:id` - Xóa một người dùng
- `GET /api/users/role/teachers` - Lấy danh sách giáo viên
- `GET /api/users/role/students` - Lấy danh sách sinh viên

### Survey Templates

- `POST /api/templates` - Tạo mẫu khảo sát mới
- `GET /api/templates` - Lấy danh sách mẫu khảo sát
- `GET /api/templates/:id` - Lấy thông tin một mẫu khảo sát
- `PUT /api/templates/:id` - Cập nhật mẫu khảo sát
- `DELETE /api/templates/:id` - Xóa mẫu khảo sát
- `GET /api/templates/question-types` - Lấy danh sách loại câu hỏi

### Surveys

- `POST /api/surveys` - Tạo khảo sát mới
- `GET /api/surveys` - Lấy danh sách khảo sát
- `GET /api/surveys/:id` - Lấy thông tin một khảo sát
- `PUT /api/surveys/:id` - Cập nhật khảo sát
- `DELETE /api/surveys/:id` - Xóa khảo sát
- `PATCH /api/surveys/:id/status` - Cập nhật trạng thái khảo sát

### Survey Responses

- `POST /api/responses` - Gửi phản hồi khảo sát
- `GET /api/responses/survey/:survey_id` - Lấy danh sách phản hồi cho một khảo sát
- `GET /api/responses/:response_id` - Lấy chi tiết một phản hồi
- `GET /api/responses/summary/:survey_id` - Lấy tổng hợp phản hồi cho một khảo sát

### LLM Integration

- `POST /api/llm/generate-survey` - Tạo khảo sát từ LLM
- `POST /api/llm/analyze-responses` - Phân tích phản hồi khảo sát
- `GET /api/llm/prompts` - Lấy danh sách LLM prompts
- `POST /api/llm/prompts` - Tạo LLM prompt mới
- `GET /api/llm/analysis/:survey_id` - Lấy kết quả phân tích cho một khảo sát

## Phân quyền

Hệ thống có 3 role chính:

1. **admin** - Quản trị viên, có toàn quyền trên hệ thống
2. **teacher** - Giảng viên, có thể tạo và quản lý khảo sát, xem phản hồi
3. **student** - Sinh viên, có thể trả lời khảo sát và xem phản hồi của mình

## Luồng làm việc cơ bản

1. **Tạo mẫu khảo sát**:
   - Giảng viên/Admin tạo mẫu khảo sát thủ công
   - Hoặc sử dụng LLM để tạo mẫu khảo sát

2. **Tạo khảo sát**:
   - Từ mẫu có sẵn, tạo khảo sát với thời gian và đối tượng cụ thể

3. **Thu thập phản hồi**:
   - Sinh viên đăng nhập và trả lời khảo sát

4. **Phân tích phản hồi**:
   - Giảng viên/Admin xem tổng hợp phản hồi
   - Sử dụng LLM để phân tích sâu hơn về phản hồi

## Liên hệ

Dự án được phát triển bởi nhóm sinh viên K28 CMU TPM:
- Phạm Thục Anh – MSSV: 28201103447
- Ngô Nguyễn Thùy Linh – MSSV: 28201139984
- Nguyễn Minh Quân – MSSV: 28214605702
- Phạm Anh Tuấn – MSSV: 28211102415
- Trần Việt Anh – MSSV: 28211144354

Giảng viên hướng dẫn: Thầy Trần Kim Sanh
