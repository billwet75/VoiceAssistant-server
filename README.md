# VoiceAssistant Server

**English** | [Русский](README.ru.md)

A small Node.js API proxy for
[VoiceAssistant](https://github.com/billwet75/VoiceAssistant). It keeps the
external AI provider key outside the Android APK and exposes a narrow endpoint
for assistant questions.

## Requirements

- Node.js 20 or newer;
- a Perplexity API key;
- a separate application access token;
- HTTPS through Caddy, Nginx, or another reverse proxy for production use.

## Configuration

Copy `.env.example` to `.env.local` and provide local values:

```dotenv
PERPLEXITY_API_KEY=replace-with-your-provider-key
PERPLEXITY_MODEL=sonar
VOICEASSISTANT_TOKEN=replace-with-a-separate-app-token
HOST=127.0.0.1
PORT=8787
```

Never commit `.env.local`. It is excluded by `.gitignore`.

On Windows, `setup-perplexity.cmd` can be used to enter the Perplexity key
without displaying it in the terminal.

## Run locally

```powershell
npm start
```

Check the service:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/health
```

For USB-connected Android development:

```powershell
adb reverse tcp:8787 tcp:8787
```

## API

### `GET /health`

Returns service health information without contacting the AI provider.

### `POST /api/ask`

Requires the configured application token and accepts a JSON question from the
Android client. The server forwards the request to the configured Perplexity
model and returns the answer.

Keep this endpoint behind HTTPS in production. Bind Node.js to
`127.0.0.1:8787` and let the reverse proxy handle public TLS traffic.

Example Caddy configuration:

```caddyfile
assistant.example.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:8787
}
```

## Security

- Keep `PERPLEXITY_API_KEY` and `VOICEASSISTANT_TOKEN` out of Git and logs.
- Use a long, random application token unrelated to the provider key.
- Rotate both credentials if either one may have been exposed.
- Do not expose the Node.js listener directly to the public internet.
- Apply request limits and monitoring appropriate for your deployment.

## Validation

Check the JavaScript syntax with:

```powershell
npm run check
```

## License

Licensed under the [Apache License 2.0](LICENSE).
See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for external services and
runtime components.
