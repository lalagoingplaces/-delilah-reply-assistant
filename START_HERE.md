# Start here — Delilah Reply Assistant V4.3

This is the **in-place upgrade of the V4 app**. Do not create a second deployment if you want the same URL. Read `UPGRADE_V4_3.md` first, especially the encrypted-backup instructions.

**Daily use:** Open the app -> Add screenshot -> review two generated replies -> Copy. Once results appear, say/type what to change in the voice and text box, or use the optional style chips. The full buyer and reference controls are in **Menu**.

**Live AI:** Set `OPENAI_API_KEY` in the existing secure hosting environment. Set `APP_PASSCODE` (12+ chars) for public hosting. Set `OPENAI_MODEL` to a supported model you have verified for image input and structured JSON responses. The included model value is a legacy starting value, not a live-verified choice. Open the HTTPS site and use Menu -> Server access -> Sign in & remember this browser. Test real screenshots before relying on results.

**Private buyer memory:** Unlock the encrypted buyer vault through Menu. It stays encrypted on this browser, using the original V4 storage key. It cannot be restored without the passphrase or a usable backup. The app does not claim to remember buyers across different browsers or domains.

**Voice:** Tap Speak where supported; otherwise use Samsung keyboard dictation into the voice-input field. Speak conversationally, e.g. “I like number two but make it more playful and shorter,” or “Here's exactly what I want to say...” Then tap Update replies. The speech transcript is visible so Delilah can correct errors.

**No live deployment has been performed from this package.** Build checks and simulated API tests are local only. Phone microphone and real buyer screenshots need acceptance testing.
