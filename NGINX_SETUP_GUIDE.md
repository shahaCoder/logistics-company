# 🔧 Настройка Nginx для Oil Change API

## Проблема: Nginx не запущен

Если вы видите ошибку `nginx.service is not active, cannot reload`, значит Nginx не запущен.

## Решение:

### 1. Запустите Nginx:

```bash
sudo systemctl start nginx
```

### 2. Проверьте статус:

```bash
sudo systemctl status nginx
```

### 3. Включите автозапуск (чтобы Nginx запускался при перезагрузке сервера):

```bash
sudo systemctl enable nginx
```

### 4. Проверьте конфигурацию:

```bash
sudo nginx -t
```

### 5. Перезагрузите Nginx:

```bash
sudo systemctl reload nginx
# или
sudo systemctl restart nginx
```

## Настройка конфигурации для reverse proxy

### Шаг 1: Найдите конфигурационный файл

Обычно это один из файлов:
- `/etc/nginx/sites-available/glco.us`
- `/etc/nginx/sites-available/default`
- `/etc/nginx/conf.d/glco.us.conf`

### Шаг 2: Добавьте location блок

Добавьте следующий блок в секцию `server`:

```nginx
location /api/bot/ {
    # Если бот на том же сервере:
    proxy_pass http://localhost:4010/api/;
    
    # ИЛИ если бот на отдельном сервере:
    # proxy_pass http://pti-bot-server-ip:4010/api/;
    
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://glco.us' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'X-API-Key, Content-Type' always;
    
    # Handle OPTIONS preflight
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

### Шаг 3: Пример полной конфигурации

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name glco.us www.glco.us;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name glco.us www.glco.us;
    
    # SSL certificates (настройте свои)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Root directory для Next.js
    root /var/www/logistics;
    index index.html;
    
    # Основной location для Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API для бота (reverse proxy)
    location /api/bot/ {
        proxy_pass http://localhost:4010/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://glco.us' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'X-API-Key, Content-Type' always;
        
        # Handle OPTIONS preflight
        if ($request_method = 'OPTIONS') {
            return 204;
        }
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

## Проверка работы

После настройки проверьте:

```bash
# 1. Проверьте конфигурацию
sudo nginx -t

# 2. Перезагрузите Nginx
sudo systemctl reload nginx

# 3. Проверьте, что бот доступен через Nginx
curl -X GET "https://glco.us/api/bot/oil-change/list" \
  -H "X-API-Key: your-api-key"
```

## Troubleshooting

### Nginx не запускается

```bash
# Проверьте логи
sudo journalctl -u nginx -n 50

# Проверьте, не занят ли порт 80/443
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### 502 Bad Gateway

- Убедитесь, что бот запущен: `pm2 list` или `pm2 logs pti-bot`
- Проверьте, что бот слушает на порту 4010: `netstat -tulpn | grep 4010`
- Проверьте firewall: `sudo ufw status`

### CORS ошибки

- Убедитесь, что заголовки CORS добавлены в конфигурацию
- Проверьте, что `ADMIN_PANEL_URL` в .env бота указывает на `https://glco.us`

## Важные моменты

1. **Если бот на том же сервере**: используйте `http://localhost:4010/api/`
2. **Если бот на отдельном сервере**: используйте `http://pti-bot-server-ip:4010/api/`
3. **После изменений**: всегда проверяйте конфигурацию перед перезагрузкой: `sudo nginx -t`
4. **Безопасность**: убедитесь, что API key хранится в переменных окружения, не в коде
