# 🔧 Настройка Caddy для Oil Change API

## Ситуация

На сервере уже работает **Caddy** (веб-сервер), который занимает порт 80. Вместо установки Nginx, настроим Caddy для проксирования API бота.

## Решение: Настроить Caddy

### Шаг 1: Найдите конфигурационный файл Caddy

Caddy использует Caddyfile. Обычно он находится в одном из мест:

```bash
# Вариант 1: Глобальный Caddyfile
/etc/caddy/Caddyfile

# Вариант 2: Сайт-специфичный файл
/etc/caddy/sites/glco.us

# Вариант 3: Если используется systemd
# Проверьте конфигурацию сервиса
sudo systemctl status caddy
sudo cat /etc/systemd/system/caddy.service
```

### Шаг 2: Откройте Caddyfile

```bash
sudo nano /etc/caddy/Caddyfile
# или
sudo nano /etc/caddy/sites/glco.us
```

### Шаг 3: Добавьте конфигурацию для API бота

Добавьте следующий блок в ваш Caddyfile (внутри блока для `glco.us`):

```caddy
glco.us {
    # ... существующая конфигурация для основного сайта ...
    
    # Reverse proxy для Next.js (если еще не настроено)
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    
    # API для бота (reverse proxy)
    handle /api/bot/* {
        reverse_proxy localhost:4010 {
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
            
            # Переписываем путь (убираем /api/bot, оставляем /api/)
            rewrite /api/bot /api
        }
        
        # CORS headers
        header {
            Access-Control-Allow-Origin "https://glco.us"
            Access-Control-Allow-Methods "GET, POST, OPTIONS"
            Access-Control-Allow-Headers "X-API-Key, Content-Type"
        }
    }
    
    # Обработка OPTIONS preflight
    handle_options {
        respond 204
    }
}
```

### Альтернативный вариант (если rewrite не работает):

```caddy
glco.us {
    # ... существующая конфигурация ...
    
    # API для бота
    handle_path /api/bot/* {
        uri strip_prefix /api/bot
        reverse_proxy localhost:4010 {
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
        }
        
        header {
            Access-Control-Allow-Origin "https://glco.us"
            Access-Control-Allow-Methods "GET, POST, OPTIONS"
            Access-Control-Allow-Headers "X-API-Key, Content-Type"
        }
    }
}
```

### Шаг 4: Проверьте конфигурацию Caddy

```bash
# Проверьте синтаксис
sudo caddy validate --config /etc/caddy/Caddyfile

# Или если используется другой путь
sudo caddy validate --config /etc/caddy/sites/glco.us
```

### Шаг 5: Перезагрузите Caddy

```bash
# Перезагрузите Caddy
sudo systemctl reload caddy

# Или перезапустите
sudo systemctl restart caddy

# Проверьте статус
sudo systemctl status caddy
```

## Пример полной конфигурации Caddyfile

```caddy
glco.us {
    # SSL автоматически управляется Caddy
    
    # Reverse proxy для Next.js
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    
    # API для бота
    handle /api/bot/* {
        # Переписываем путь
        rewrite * /api{path}?{query}
        
        reverse_proxy localhost:4010 {
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
        }
        
        header {
            Access-Control-Allow-Origin "https://glco.us"
            Access-Control-Allow-Methods "GET, POST, OPTIONS"
            Access-Control-Allow-Headers "X-API-Key, Content-Type"
        }
    }
    
    # Обработка OPTIONS
    @options {
        method OPTIONS
        path /api/bot/*
    }
    handle @options {
        respond 204
    }
}
```

## Проверка работы

После настройки проверьте:

```bash
# 1. Проверьте статус Caddy
sudo systemctl status caddy

# 2. Проверьте логи Caddy
sudo journalctl -u caddy -n 50

# 3. Проверьте доступность API
curl -X GET "https://glco.us/api/bot/oil-change/list" \
  -H "X-API-Key: your-api-key"
```

## Troubleshooting

### Если rewrite не работает правильно:

Попробуйте использовать `handle_path`:

```caddy
handle_path /api/bot/* {
    reverse_proxy localhost:4010/api {
        header_up Host {host}
    }
}
```

### Если CORS не работает:

Убедитесь, что заголовки добавлены правильно:

```caddy
header {
    Access-Control-Allow-Origin "https://glco.us"
    Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Access-Control-Allow-Headers "X-API-Key, Content-Type"
    Access-Control-Max-Age "3600"
}
```

### Проверка текущей конфигурации Caddy:

```bash
# Посмотрите текущий Caddyfile
sudo cat /etc/caddy/Caddyfile

# Или если используется JSON конфигурация
sudo cat /etc/caddy/caddy.json
```

## Важные моменты

1. **Caddy автоматически управляет SSL** - не нужно настраивать сертификаты вручную
2. **Если бот на отдельном сервере**: замените `localhost:4010` на `pti-bot-server-ip:4010`
3. **После изменений**: всегда проверяйте конфигурацию перед перезагрузкой
4. **Логи**: проверяйте логи Caddy при проблемах: `sudo journalctl -u caddy -f`
