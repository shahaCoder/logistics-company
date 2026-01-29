# 🔧 Исправление синтаксической ошибки в Caddyfile

## Проблема

Ошибка: `syntax error: unexpected token '}}', expecting '}', at /etc/caddy/Caddyfile:37`

Это означает, что есть лишняя закрывающая скобка или неправильный синтаксис.

## Правильная конфигурация для glco.us

Вот правильный синтаксис для Caddy v2:

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
    reverse_proxy 127.0.0.1:3000
    
    # API для бота (reverse proxy)
    handle_path /api/bot/* {
        reverse_proxy 127.0.0.1:4010/api {
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
        }
        
        header Access-Control-Allow-Origin "https://glco.us"
        header Access-Control-Allow-Methods "GET, POST, OPTIONS"
        header Access-Control-Allow-Headers "X-API-Key, Content-Type"
    }
}
```

## Альтернативный вариант (если handle_path не работает)

```caddy
glco.us, www.glco.us {
    # Reverse proxy для Next.js
    reverse_proxy 127.0.0.1:3000
    
    # API для бота
    handle /api/bot/* {
        uri strip_prefix /api/bot
        reverse_proxy 127.0.0.1:4010/api {
            header_up Host {host}
            header_up X-Real-IP {remote}
            header_up X-Forwarded-For {remote}
            header_up X-Forwarded-Proto {scheme}
        }
        
        header Access-Control-Allow-Origin "https://glco.us"
        header Access-Control-Allow-Methods "GET, POST, OPTIONS"
        header Access-Control-Allow-Headers "X-API-Key, Content-Type"
    }
}
```

## Самый простой вариант (рекомендуется)

```caddy
glco.us, www.glco.us {
    # Reverse proxy для Next.js
    reverse_proxy 127.0.0.1:3000
    
    # API для бота - просто проксируем на webhook.glco.us
    handle /api/bot/* {
        reverse_proxy webhook.glco.us {
            header_up Host webhook.glco.us
        }
        
        header Access-Control-Allow-Origin "https://glco.us"
        header Access-Control-Allow-Methods "GET, POST, OPTIONS"
        header Access-Control-Allow-Headers "X-API-Key, Content-Type"
    }
}
```

## Инструкция по исправлению

1. Откройте Caddyfile:
```bash
sudo nano /etc/caddy/Caddyfile
```

2. Найдите строку 37 и проверьте синтаксис. Убедитесь, что:
   - Все открывающие скобки `{` имеют закрывающие `}`
   - Нет лишних закрывающих скобок `}}`
   - Правильные отступы

3. Замените блок для `glco.us` на один из вариантов выше

4. Проверьте конфигурацию:
```bash
sudo caddy validate --config /etc/caddy/Caddyfile
```

5. Если проверка прошла успешно, перезагрузите:
```bash
sudo systemctl reload caddy
```

## Проверка текущего файла

Посмотрите, что находится на строке 37:
```bash
sudo sed -n '30,40p' /etc/caddy/Caddyfile
```

Это поможет увидеть проблемную область.
