# Delilah personal app — hosting setup

This is a prepared Node app, not a deployed website. Keep this bundle private:
it contains Delilah's voice examples and the supplied third-party reference text.

## What is ready

- Screenshot analysis, private buyer routing, two AI replies and source audit.
- Seven personalities, Smart Select, per-buyer settings, screenshot confirmation.
- Encrypted local memory and editable private TXT/Markdown references.
- Hosting blueprint, automated checks, health endpoint, synthetic AI check.

## Account connections

Connect OpenAI Developers to configure API credentials through the supported
secure setup. Connect Render to deploy this Node app. Never paste API keys into
ChatGPT messages, HTML files, Git commits or buyer-facing settings. Set the key
in the hosting service's OPENAI_API_KEY secret.

The existing model setting is gpt-4.1-mini. Its documentation marks it deprecated;
confirm available model access and select a supported image-input/structured-output
model in OPENAI_MODEL before live use. A real API check is required; a configured
key does not prove working billing, model access, screenshot reading or reply quality.

## Deploy from a private repository

Place this folder's CONTENTS at the private repository root. The render.yaml
blueprint runs npm test then npm start. It starts on the free plan for initial
testing; choose paid hosting later if its behavior warrants the cost. This is a
proposal, not an already created service or subscription.

Render generates APP_PASSCODE. Retrieve it from your hosting environment and
enter it in the app's Server access passcode field. Use a different passphrase
for encrypted private memory. HOST is 0.0.0.0 for hosting; PORT is assigned by the
hosting service. /health only verifies the web process, not the AI provider.

## Check the hosted app

1. Open the HTTPS address in Chrome on her phone.
2. Enter its server passcode and tap Test AI connection. This makes one small
   billable request using synthetic text; it does not use private buyer messages.
3. Create/unlock private memory. Add a short personal voice reference.
4. Upload a cropped test screenshot. Confirm the buyer and answer Yes or No.
5. Generate two replies. Check the buyer, settings, reply tone, and source excerpts.
6. Export an encrypted backup. Verify import on a separate browser before relying
   on it. Keep both the backup and its private passphrase secure.

Memory is local to the exact browser and site address. A new device, browser,
custom domain or cleared browser data requires backup/import. A local HTML demo
and the hosted app do not automatically share memory.

## Local checks

Use Node 22 or later. npm test runs the reference/API mocks, real encryption tests
and simulated workflow checks. No dependencies need installing. npm start starts
the app; set environment variables in your shell (see README.txt), because
.env.example is documentation and .env is not loaded automatically.

## Verification limits

Automated checks passed with a mocked AI provider. No real API key, production
hosting, visual browser check, or physical-phone test has been completed yet.
