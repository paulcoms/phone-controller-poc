# Phone Pointer POC v4 — patient microphone + server transcription

## Setup

Requires Node 18+ and an OpenAI API key.

```bash
npm install
export OPENAI_API_KEY="your-key-here"
npm start
```

Open on laptop:

    http://localhost:3000/world.html

For iPhone, use your HTTPS ngrok URL as before:

    https://YOUR-NGROK-HOST/controller.html

The OpenAI key stays on the Node server; it is never sent to the phone/browser.

## Patient voice demo

1. Enable Motion on the phone.
2. Point at the patient and press TRIGGER.
3. Hold HOLD TO TALK and speak.
4. Release the button.
5. The phone uploads the recorded audio to `/transcribe`.
6. Node sends it to OpenAI `gpt-4o-mini-transcribe`.
7. The transcript is sent over the existing WebSocket and displayed prominently on the PC.
8. A deliberately scripted patient response appears after a short delay.

The patient does **not** understand the question in this POC. The goal is only to prove phone microphone -> speech-to-text -> PC simulation.
