# VoiceAssistant server — Perplexity

[![Лицензия](https://img.shields.io/github/license/billwet75/VoiceAssistant-server)](LICENSE)
[![Релиз](https://img.shields.io/github/v/release/billwet75/VoiceAssistant-server)](https://github.com/billwet75/VoiceAssistant-server/releases)
[![Звёзды](https://img.shields.io/github/stars/billwet75/VoiceAssistant-server)](https://github.com/billwet75/VoiceAssistant-server/stargazers)
[![Форки](https://img.shields.io/github/forks/billwet75/VoiceAssistant-server)](https://github.com/billwet75/VoiceAssistant-server/forks)
[![Участники](https://img.shields.io/github/contributors/billwet75/VoiceAssistant-server)](https://github.com/billwet75/VoiceAssistant-server/graphs/contributors)

Посредник между Android-приложением и Perplexity Sonar API. Ключ Perplexity хранится
только в `.env.local` на сервере и не встраивается в APK.

## Первичная настройка

1. Создайте ключ в Perplexity API Portal.
2. Запустите `setup-perplexity.cmd`.
3. Вставьте ключ в скрытое поле и нажмите Enter.

## Рабочее развёртывание

Для доступа через интернет разверните сервер на собственном VPS и используйте
собственный домен:

- Node.js должен слушать только `127.0.0.1:8787`;
- Caddy, Nginx или другой reverse proxy завершает TLS и проксирует запросы;
- DNS-запись вашего домена должна указывать на VPS;
- запрос к API приложения защищается отдельным `VOICEASSISTANT_TOKEN`;
- в Android-приложении указывается ваш HTTPS-адрес.

Фрагмент Caddyfile:

```caddyfile
assistant.example.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:8787
}
```

Замените `assistant.example.com` на свой домен. Ключ Perplexity и токен
приложения задаются в окружении VPS. Их значения нельзя добавлять в README или
Git.

В `local.properties` Android-проекта задайте собственный адрес и тот же токен:

```properties
VOICEASSISTANT_SERVER_URL=https://assistant.example.com/api/ask
VOICEASSISTANT_TOKEN=replace-with-your-own-random-token
```

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
к локальному серверу через USB. Для работы без USB задайте собственный публичный
HTTPS-адрес в `VOICEASSISTANT_SERVER_URL`.

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
