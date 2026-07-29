# VoiceAssistant server — Perplexity

Посредник между Android-приложением и Perplexity Sonar API. Ключ Perplexity хранится
только в `.env.local` на сервере и не встраивается в APK.

## Первичная настройка

1. Создайте ключ в Perplexity API Portal.
2. Запустите `setup-perplexity.cmd`.
3. Вставьте ключ в скрытое поле и нажмите Enter.

## Рабочее развёртывание

Основной экземпляр работает на собственном VPS с Ubuntu 24.04:

- публичный адрес приложения: `https://assistant.billpost.ru`;
- Node.js слушает только `127.0.0.1:8787`;
- Caddy завершает TLS и проксирует запросы на Node.js;
- телефон может пользоваться ИИ через мобильную сеть и вне дома;
- запрос к API приложения защищён `VOICEASSISTANT_TOKEN`.

Фрагмент Caddyfile:

```caddyfile
assistant.billpost.ru {
    encode zstd gzip
    reverse_proxy 127.0.0.1:8787
}
```

Ключ Perplexity и токен приложения задаются в окружении VPS. Их значения нельзя
добавлять в README, Vault или Git.

## Локальный запуск для разработки

Для локальной проверки подключите телефон по USB и дважды щёлкните
`Запустить VoiceAssistant.cmd`.

Или вручную:

```powershell
npm start
```

Для подключения телефона по USB:

```powershell
adb reverse tcp:8787 tcp:8787
```

После этого тестовая сборка, настроенная на `http://127.0.0.1:8787`, обращается
к локальному серверу через USB. Рабочая сборка версии 1.0.0 использует публичный
HTTPS-адрес VPS и не требует `adb reverse`.

Проверка:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/health
```

Модель по умолчанию — `sonar`. Её можно изменить переменной
`PERPLEXITY_MODEL` в `.env.local`.

## Связанные заметки

- [[Notes/Knowledge/VoiceAssistant — архитектура и эксплуатация]]
- [[AI/Sessions/Codex/2026-07-29 — VoiceAssistant от прототипа до версии 1.0.0]]
- [[Projects/VoiceAssistant/README|Android-приложение]]
