# Delilah Reply Assistant V4.3 — in-place replacement of V4

This package is a **replacement for the existing V4 web app**, not an additional app. It uses the original V4 Node server, reference files, and encrypted-vault storage key. Its `render.yaml` keeps the service name `delilah-reply-assistant`.

## What's changed

- One-screen upload-first layout, with older buyer lists, advanced settings, and security tools accessible from **Menu**.
- Upload automatically calls screenshot analysis, identifies a high-confidence buyer, reopens/creates their buyer chat, and then generates exactly **two** replies. No Analyze or Generate tap is required for a clear screenshot with live AI available.
- Uncertain usernames and buyer switches still get visible protection. The app will not guess a cropped or ambiguous buyer name. If it cannot safely determine an identity, confirmation is needed before using memory.
- After replies, Delilah can choose **Copy**, **Regenerate**, natural-language **Update replies**, **Undo**, or **More styles**.
- Voice input uses the browser's `SpeechRecognition` / `webkitSpeechRecognition` if available. If not, typed instructions or Samsung keyboard dictation still work. Speech recognition and live generation have not been tested on an actual Samsung device.
- A natural-language revision uses the previous two replies plus current buyer context, with optional dictated wording from Delilah. The AI selects the style appropriately; temporary requests do not overwrite the saved manual personality.
- Each buyer's stored screenshot-derived conversation summaries are kept as *observations* in the same encrypted local vault and supplied only to that buyer's later generation. They are not verified biographical facts.
- Server access can remember a signed, HttpOnly, SameSite=Strict session for up to 30 days after successful passcode sign-in. The separate encrypted **buyer vault still requires unlocking** after refreshing; never store its passphrase in plaintext. This is a deliberate privacy tradeoff, not a complete password-free experience.

## Preserve existing data and URL

1. **Back up first**: in your current V4 app, unlock the encrypted vault and use its **Export encrypted backup** feature; store the backup safely. Keep its private passphrase.
2. Update the **existing private code repository and existing Render web service**, using these package files at the repository root, not a new service. The exact same HTTPS origin/browser should retain the `delilah-v3-encrypted-vault` localStorage record.
3. Keep the existing hosting environment secrets: `OPENAI_API_KEY`, `APP_PASSCODE`, and `OPENAI_MODEL`. Do not embed any keys in the public website.
4. After redeployment, hard-refresh the app on the same phone/browser, sign in once if necessary, unlock private memory, verify returning buyer profiles, and test screenshot -> two replies -> voice or typed revision -> copy.
5. Check **Import encrypted backup** if the app is accessed from a new device, browser, or domain. Backups are required because local encrypted memory does not automatically sync between devices.

This package does not perform a deployment. There is no direct FeetFinder integration, background monitoring, or automatic message sending. Only the screenshots Delilah intentionally uploads are analyzed.

## Tests and limitations

`npm test` covers mocked AI response handling, reference retrieval, buyer-vault encryption, routing rules, and presence of UI controls. These are not production phone tests. Real API calls require a valid server-side key and model. Keep the old deployment available until the replacement is verified.

The original V3.5 ChatGPT Project instruction workflow (mandatory Yes/No before responding to a screenshot in ChatGPT) is **not changed**. This V4.3 automatic-first approach applies only to the standalone app.
