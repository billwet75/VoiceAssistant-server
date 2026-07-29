# Third-Party Notices

VoiceAssistant Server runs on
[Node.js](https://github.com/nodejs/node) 20 or newer and does not currently
declare third-party npm runtime dependencies. Node.js is a runtime prerequisite;
its executable and source code are not bundled in this repository.

The server uses only Node.js built-in modules for HTTP handling, environment
configuration, and outbound HTTPS requests.

The full text of the Apache License 2.0 is available in the
[`LICENSE`](LICENSE) file and at
<https://www.apache.org/licenses/LICENSE-2.0>.

## External services

| Service | How it is used | Data sent | Credentials |
|---|---|---|---|
| [Perplexity API](https://www.perplexity.ai/) | Generates answers for open-ended assistant questions | The user's question, the configured model name, and recent conversation messages retained in server memory | Each operator supplies their own `PERPLEXITY_API_KEY` |
| A user-operated reverse proxy such as Caddy or Nginx | Provides public HTTPS and forwards requests to the local Node.js listener | Normal HTTPS request metadata and the VoiceAssistant API payload | Configured and operated separately by the user |

Perplexity, Caddy, and Nginx are external projects or services. They are not
bundled with or redistributed by this repository, and their use is governed by
their own licenses, terms, and privacy policies.

## Data flow and operator responsibility

1. The Android client sends a question and optional conversation identifier to
   the server chosen by the user.
2. The server checks the operator-configured `VOICEASSISTANT_TOKEN`.
3. The server forwards the question and recent in-memory conversation context
   to the Perplexity API using the operator's own API key.
4. The generated answer is returned to the Android client.

Conversation history is stored only in the running server process by this
implementation and is lost when the process restarts. This project does not
provide a hosted server, shared domain, shared Perplexity account, or shared
credentials. Every operator is responsible for their own deployment, access
control, provider account, costs, logging, retention, and compliance
requirements.
