# SMILE Restaurant Management System

Hệ thống quản lý nhà hàng SMILE được xây dựng với React TypeScript frontend và Python FastAPI backend.

## 🏗️ Kiến trúc hệ thống

### Frontend (React TypeScript)
- **Framework**: React 18 với TypeScript
- **Routing**: React Router DOM
- **Styling**: CSS modules và styled-components
- **State Management**: React hooks (useState, useEffect)
- **API Client**: Axios

### Backend (Python FastAPI)
- **Framework**: FastAPI
- **Database**: MySQL với SQLAlchemy ORM
- **Caching**: Redis
- **API Documentation**: Swagger UI (tự động)
- **Validation**: Pydantic

## 📁 Cấu trúc dự án

```
Smile_ver5-9/
├── frontend/                 # React TypeScript Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript types
│   │   ├── services/       # API services
│   │   └── data/           # Static data
│   ├── package.json
│   └── tsconfig.json
├── backend/                 # Python FastAPI Backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API routes
│   │   ├── config.py       # Configuration
│   │   └── database.py     # Database setup
│   ├── main.py             # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
└── README.md
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 16+ và npm
- Python 3.8+
- Supabase account (thay thế MySQL)
- Redis Server (tùy chọn)

### 1. Cài đặt Backend

```bash
cd backend

# Kích hoạt môi trường Anaconda
conda activate backend_env

# Cài đặt dependencies
pip install -r requirements.txt
```

### 2. Cấu hình Supabase Database

**⚠️ Lưu ý quan trọng: Dự án đã chuyển từ MySQL sang Supabase (PostgreSQL)**

Xem hướng dẫn chi tiết trong file: [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

Tóm tắt nhanh:
1. Tạo project tại [supabase.com](https://supabase.com)
2. Chạy SQL schema từ file `backend/supabase_schema.sql`
3. Cập nhật file `.env` trong thư mục backend:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-public-key

# Database Configuration
DB_HOST=db.your-project-id.supabase.co
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_NAME=postgres
DB_PORT=5432
```

### 3. Chạy Backend

```bash
cd backend
conda activate backend_env
python main.py
```

Backend sẽ chạy tại: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### 4. Cài đặt Frontend

```bash
cd frontend
conda activate frontend_env
npm install
```

### 5. Cấu hình Frontend

File `.env` đã được tạo trong thư mục frontend:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 6. Chạy Frontend

```bash
cd frontend
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## 🎯 Tính năng chính

### 1. Quản lý bàn (16 bàn)
- 14 bàn thường (bàn 1-14)
- Bàn Shopee (bàn 15)
- Bàn Giao đi (bàn 16)
- Hiển thị trạng thái bàn (có order/trống)

### 2. Đặt món
- Tìm kiếm món ăn theo tên hoặc mã
- Autocomplete suggestions
- Thêm/sửa/xóa món trong order
- Quản lý số lượng

### 3. Thanh toán
- Tính toán tổng tiền
- Nhập phí ship và giảm giá
- In hóa đơn
- Lưu vào báo cáo

### 4. Báo cáo
- Xem lịch sử các đơn hàng
- Xuất báo cáo Excel
- Thống kê doanh thu

### 5. Cache (Redis)
- Cache dữ liệu orders để tăng performance
- Đồng bộ dữ liệu giữa MySQL và Redis

## 🔧 API Endpoints

### Orders
- `GET /api/orders` - Lấy tất cả orders
- `POST /api/orders` - Tạo order mới
- `DELETE /api/orders` - Xóa tất cả orders
- `GET /api/orders/table/{table_id}` - Lấy orders theo bàn

### Reports
- `GET /api/reports` - Lấy tất cả báo cáo
- `POST /api/reports` - Tạo báo cáo mới
- `DELETE /api/reports` - Xóa tất cả báo cáo

### Redis
- `GET /api/redis/check` - Kiểm tra kích thước Redis DB
- `GET /api/redis/data` - Lấy dữ liệu từ Redis
- `POST /api/redis/data` - Lưu dữ liệu vào Redis

## 🗄️ Database Schema (Supabase/PostgreSQL)

### Table: order_list
```sql
CREATE TABLE order_list (
    id SERIAL PRIMARY KEY,
    table_id INTEGER NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    dish_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table: report
```sql
CREATE TABLE report (
    id SERIAL PRIMARY KEY,
    table_id INTEGER NOT NULL,
    date VARCHAR(50) NOT NULL,
    hour VARCHAR(50) NOT NULL,
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    ship_fee DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Development

### Adding new dishes
Cập nhật danh sách món ăn trong `frontend/src/data/dishes.ts`

### Adding new features
1. Backend: Tạo model, schema, và router mới
2. Frontend: Tạo components và services tương ứng
3. Cập nhật types trong TypeScript

## 📝 TODO

- [ ] Implement authentication
- [ ] Add Excel export functionality
- [ ] Add print bill feature
- [ ] Implement payment modal
- [ ] Add order history
- [ ] Mobile responsive design
- [ ] Add tests

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo issue trong repository này.
