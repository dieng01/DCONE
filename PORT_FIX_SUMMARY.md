# ✅ ĐÃ FIX: Docker Port Conflict trên Windows

## 🎯 Vấn đề

```
Error: ports are not available: exposing port TCP 0.0.0.0:1883
bind: An attempt was made to access a socket in a way forbidden by its access permissions
```

## 🔧 Giải pháp đã áp dụng

### 1. Đổi port trong docker-compose.yml

**Port cũ → Port mới:**
- MQTT TCP: `1883` → `1884`
- MQTT WebSocket: `8883` → `8884`
- Frontend: `80` → `3000`
- REST API: `8080` (giữ nguyên)
- MongoDB: `27017` (giữ nguyên)

### 2. File đã cập nhật

- ✅ `docker-compose.yml` - Đổi port mapping
- ✅ `nginx.conf` - Cấu hình proxy
- ✅ `fix-docker-windows.bat` - Script tự động fix

## 🚀 Chạy lại Docker

### Cách 1: Dùng script tự động (Windows)

```cmd
fix-docker-windows.bat
```

### Cách 2: Thủ công

```bash
# Dừng containers cũ
docker-compose down

# Build lại
docker-compose build --no-cache

# Start lại
docker-compose up -d

# Kiểm tra
docker-compose ps
```

## 📋 Truy cập services

| Service | URL |
|---------|-----|
| **Frontend Dashboard** | http://localhost:3000 |
| REST API | http://localhost:8080 |
| MQTT TCP | localhost:1884 |
| MQTT WebSocket | ws://localhost:8884/mqtt |
| MongoDB | localhost:27017 |

## 🐛 Nếu vẫn lỗi

### Lỗi: Port vẫn bị chiếm

```powershell
# Kiểm tra port nào đang dùng
netstat -ano | findstr :1884
netstat -ano | findstr :8884
netstat -ano | findstr :3000

# Nếu có process, dừng nó
taskkill /PID <PID> /F
```

### Lỗi: Windows Hyper-V reserve ports

```powershell
# Chạy PowerShell với quyền Administrator
net stop winnat
net start winnat
```

### Lỗi: Port 3000 bị chiếm (thường do Skype)

Đổi sang port khác trong `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "3001:80"  # Đổi 3000 -> 3001
```

## 💡 Mẹo

1. **Tránh các port phổ biến trên Windows:**
   - 80, 443 (IIS, Skype)
   - 1883, 8883 (Windows reserve)
   - 3306, 5432 (MySQL, PostgreSQL)

2. **Sử dụng port cao:**
   - 8000-9000 cho development
   - 10000+ cho testing

3. **Kiểm tra trước:**
   ```cmd
   netstat -ano | findstr :<PORT>
   ```

## 📚 Tài liệu chi tiết

Xem file `FIX_PORT_CONFLICT.md` để biết thêm chi tiết.

---

**Mở browser: http://localhost:3000** 🎉
