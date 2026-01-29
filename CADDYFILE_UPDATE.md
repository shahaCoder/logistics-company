# 🔧 Обновление Caddyfile для Oil Change API

## Текущая конфигурация

Ваш текущий Caddyfile:
```caddy
espybot.xyz, www.espybot.xyz {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}
api.glco.us {
    reverse_proxy 127.0.0.1:4000
}

webhook.glco.us {
    reverse_proxy 127.0.0.1:4010
 log {
    output file /var/log/caddy/webhook-access.log
    format json
  }
}
```

## Обновленная конфигурация

Добавьте блок для `glco.us` с маршрутом для API бота:

```caddy
espybot.xyz, www.espybot.xyz {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}

api.glco.us {
    reverse_proxy 127.0.0.1:4000
}

webhook.glco.us {
    reverse_proxy 127.0.0.1:4010
    log {
        output file /var/log/caddy/webhook-access.log
        format json
    }
}

glco.us, www.glco.us {
    # Reverse proxy для Next.js (основной сайт)
    reverse_proxy 127.0.0.1:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
        header_up X-Forwarded-For {remote}
        header_up X-Forwarded-Proto {scheme}
    }
    
    # API для бота (reverse proxy)
    handle /api/bot/* {
        # Переписываем путь: /api/bot/* -> /api/*
        rewrite * /api{path}?{query}
        
        reverse_proxy 127.0.0.1:4010 {
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
        }
        
        # CORS headers
        header {
            Access-Control-Allow-Origin "https://glco.us"
            Access-Control-Allow-Methods "GET, POST, OPTIONS"
            Access-Control-Allow-Headers "X-API-Key, Content-Type"
        }
    }
    
    # Обработка OPTIONS preflight
    @options {
        method OPTIONS
        path /api/bot/*
    }
    handle @options {
        respond 204
    }
}
```

## Альтернативный вариант (проще)

Если rewrite не работает, используйте прямой путь:

```caddy
glco.us, www.glco.us {
    # Reverse proxy для Next.js
    reverse_proxy 127.0.0.1:3000
    
    # API для бота
    handle_path /api/bot/* {
        reverse_proxy 127.0.0.1:4010/api {
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

## Инструкция по применению

1. Откройте Caddyfile:
```bash
sudo nano /etc/caddy/Caddyfile
```

2. Добавьте блок для `glco.us` (как показано выше)

3. Проверьте конфигурацию:
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

4. Перезагрузите Caddy:
```bash
sudo systemctl reload caddy
```

5. Проверьте статус:
```bash
sudo systemctl status caddy
```

6. Проверьте логи:
```bash
sudo journalctl -u caddy -n 50
```

## Проверка работы

После настройки проверьте:

```bash
# Проверьте доступность API
curl -X GET "https://glco.us/api/bot/oil-change/list" \
  -H "X-API-Key: your-api-key"
```

## Альтернатива: Использовать существующий webhook.glco.us

Если не хотите добавлять маршрут на glco.us, можно использовать существующий домен:

Измените переменную окружения в Next.js:
```bash
NEXT_PUBLIC_BOT_API_BASE=https://webhook.glco.us/api
```

Но это менее удобно, так как API будет на другом поддомене.
