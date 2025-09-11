# Stage 1: Sử dụng một base image Python chính thức và nhẹ
# python:3.9-slim là một lựa chọn tốt vì nó nhỏ gọn nhưng vẫn đầy đủ tính năng.
FROM python:3.9-slim

# Đặt biến môi trường để Python không tạo file .pyc và chạy ở chế độ unbuffered
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Thiết lập thư mục làm việc bên trong container
WORKDIR /code

# Sao chép file requirements.txt VÀO TRƯỚC
# Đây là một bước tối ưu quan trọng. Docker build theo từng lớp (layer).
# Bằng cách copy và cài đặt dependencies trước, Docker sẽ cache lại lớp này.
# Nếu sau này bạn chỉ thay đổi code mà không thay đổi thư viện, quá trình build lại sẽ nhanh hơn rất nhiều.
COPY ./requirements.txt /code/requirements.txt

# Cài đặt các thư viện cần thiết
# --no-cache-dir giúp giảm kích thước image cuối cùng
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Sao chép TOÀN BỘ code của dự án (bao gồm main.py và thư mục app) vào container
COPY . /code/

# Mở port 7860 để cho phép kết nối từ bên ngoài vào container
# Đây là port chuẩn của Hugging Face Spaces.
EXPOSE 7860

# Lệnh để chạy ứng dụng của bạn khi container khởi động
# --host 0.0.0.0 là BẮT BUỘC để ứng dụng có thể được truy cập từ bên ngoài container.
# main:app nghĩa là: trong file "main.py", tìm và chạy đối tượng tên là "app".
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]