# 🔧 Fix Docker Port Binding Error trên Windows

## ❌ Lỗi gặp phải

```
Error response from daemon: ports are not available: exposing port TCP 0.0.0.0:1883 -> 127.0.0.1:0: 
listen tcp 0.0.0.0:1883: bind: An attempt was made to access a socket in a way forbidden by its access permissions.
```

## 🔍 Nguyên nhân

Trên Windows, lỗi này thường do:

1. **Port đang bị chiếm** bởi process khác (Mosquitto, IIS, Skype, etc.)
2. **Windows Hyper-V reserve port ranges** - Windows tự động reserve một số port cho NAT
3. **Windows NAT dynamic port range** - Hệ thống reserve ports 1883, 8883, etc.

## ✅ Giải pháp

### Cách 1: Đổi port trong docker-compose.yml (ĐÃ ÁP DỤNG)

File `docker-compose.yml` đã được cập nhật:

```yaml
ports:
  - "11884:1883"  # Host:11884 -> Container:1883
  - "8884:8883"   # Host:8884 -> Container:8883
  - "3000:80"     # Host:3000 -> Container:80
```

**Port mapping mới:**
- MQTT TCP: `11884` (thay vì `1883`)
- MQTT WebSocket: `8884` (thay vì `8883`)
- Frontend: `3000` (thay vì `80`)
- REST API: `8080` (giữ nguyên)
- MongoDB: `27017` (giữ nguyên)

### Cách 2: Tìm và dừng process đang chiếm port

#### Kiểm tra port nào đang bị chiếm:

```powershell
# Kiểm tra port 1883
netstat -ano | findstr :1883

# Hoặc dùng PowerShell
Get-NetTCPConnection -LocalPort 1883
```

#### Nếu tìm thấy process:

```powershell
# Xem chi tiết process
tasklist /FI "PID eq <PID_TỪ_NETSTAT>"

# Dừng process (cẩn thận!)
taskkill /PID <PID> /F
```

### Cách 3: Reset Windows NAT port range (Nâng cao)

Nếu port bị Windows Hyper-V reserve:

```powershell
# Chạy PowerShell với quyền Administrator

# 1. Tắt Hyper-V tạm thời
dism /Online /Disable-Feature:Microsoft-Hyper-V

# 2. Reset reserved ports
net stop winnat
net start winnat

# 3. Bật lại Hyper-V (nếu cần)
dism /Online /Enable-Feature:Microsoft-Hyper-V /All
```

**Hoặc đơn giản hơn - chỉ reset winnat:**

```powershell
# Chạy PowerShell với quyền Administrator
net stop winnat
net start winnat
```

### Cách 4: Kiểm tra Windows reserved ports

```powershell
# Xem danh sách port bị reserve
netsh interface ipv4 show excludedportrange protocol=tcp

# Nếu thấy 1883 trong danh sách, dùng cách 1 hoặc 3
```

## 🚀 Chạy lại Docker

Sau khi áp dụng cách 1 (đổi port):

```bash
# Dừng containers cũ
docker-compose down

# Build lại với config mới
docker-compose build --no-cache

# Start lại
docker-compose up -d

# Kiểm tra status
docker-compose ps
```

## 📋 Truy cập services

Với port mapping mới:

| Service | URL |
|---------|-----|
| Frontend Dashboard | http://localhost:3000 |
| REST API | http://localhost:8080 |
| MQTT TCP | localhost:11884 |
| MQTT WebSocket | ws://localhost:8884/mqtt |
| MongoDB | localhost:27017 |

## 🔧 Cập nhật frontend config

Nếu bạn muốn frontend kết nối tới MQTT broker thật (không phải simulation), cập nhật:

**File: `src/services/MQTTService.ts`**

```typescript
connect(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Kết nối tới RESTHeart MQTT broker qua WebSocket
    const ws = new WebSocket('ws://localhost:8884/mqtt', 'mqtt');
    
    ws.onopen = () => {
      console.log('[MQTT] Connected to RESTHeart');
      this.connected = true;
      resolve();
    };
    
    ws.onerror = (error) => {
      console.error('[MQTT] WebSocket error:', error);
      // Fallback to simulation mode
      this.startSimulation();
      resolve();
    };
  });
}
```

## 🐛 Troubleshooting thêm

### Lỗi: "port is already allocated"

```bash
# Xem containers đang chạy
docker ps

# Dừng container chiếm port
docker stop <container_name>

# Hoặc dừng tất cả
docker stop $(docker ps -q)
```

### Lỗi: "Cannot connect to the Docker daemon"

```bash
# Khởi động lại Docker Desktop
# Hoặc chạy trong PowerShell:
Restart-Service com.docker.service
```

### Lỗi: "network market-network not found"

```bash
# Xóa networks cũ
docker network prune

# Tạo lại
docker-compose up -d
```

## 📊 So sánh port trước và sau

| Service | Port cũ | Port mới | Lý do |
|---------|---------|----------|-------|
| MQTT TCP | 1883 | 11884 | Tránh Windows reserved ports |
| MQTT WS | 8883 | 8884 | Tránh Windows reserved ports |
| Frontend | 80 | 3000 | Tránh conflict với IIS/Skype |
| REST API | 8080 | 8080 | Giữ nguyên |
| MongoDB | 27017 | 27017 | Giữ nguyên |

## 💡 Mẹo tránh conflict port trên Windows

1. **Tránh các port phổ biến:**
   - 80, 443 (IIS, Skype)
   - 1883, 8883 (Windows reserve cho MQTT)
   - 3306, 5432 (MySQL, PostgreSQL)

2. **Sử dụng port range cao:**
   - 8000-9000 cho development
   - 10000+ cho testing

3. **Kiểm tra trước khi dùng:**
   ```powershell
   netstat -ano | findstr :<PORT>
   ```

## 📚 Tài liệu tham khảo

- [Docker Port Mapping](https://docs.docker.com/config/containers/container-networking/)
- [Windows Hyper-V Port Conflicts](https://github.com/docker/for-win/issues/3171)
- [Windows NAT Troubleshooting](https://docs.microsoft.com/en-us/windows-server/networking/technologies/netsh/netsh-contexts)

---

**Nếu vẫn gặp vấn đề, thử:**
1. Restart Docker Desktop
2. Restart Windows
3. Chạy `net stop winnat && net start winnat` trong PowerShell (Admin)
4. Dùng port khác cao hơn (ví dụ: 2883, 9883)

**Happy Dockerizing! 🐳**
