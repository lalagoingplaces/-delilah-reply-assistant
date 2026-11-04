DELILAH REPLY ASSISTANT V4 — BUYER CHAT ROUTING
===============================================

WHAT'S NEW
- Upload a FeetFinder screenshot and (with live AI configured) it automatically
  reads the buyer's visible username. Clear/high-confidence names create or
  reopen that person's private chat, titled "Username FF".
- A buyer change triggers a visible alert; no sharing of one buyer's context
  with another. Unclear names are NOT routed automatically.
- Searchable buyer chat list. Active selection and selected style are visibly
  highlighted. Existing V3 encrypted buyer backups are supported.
- The full personality, length, energy, directness, conversation goal, direction,
  flirting intensity and emoji controls stay visible with each screenshot.
- Two suggested responses, no automatic sending to FeetFinder.

EASIEST PREVIEW
Open Delilah_Reply_Assistant_V4.html or index.html in a browser.
The preview has no screenshot recognition or live AI by itself.
It offers demo (fixed, non-personalized) sample replies using pasted text.

LIVE AI SETUP (computer/server)
1. Install Node.js 20 or later.
2. Open a terminal in this folder.
3. Set an OpenAI API key in your server environment (NEVER in HTML):
   macOS/Linux:
     export OPENAI_API_KEY='your-private-api-key'
     export APP_PASSCODE='a-strong-unique-secret-at-least-12-characters'
     node server.mjs
   Windows PowerShell:
     $env:OPENAI_API_KEY='your-private-api-key'
     $env:APP_PASSCODE='a-strong-unique-secret-at-least-12-characters'
     node server.mjs
4. Open http://127.0.0.1:8787 on the same computer.
5. Unlock or create private buyer memory with a SEPARATE 10+ character
   passphrase. Fill in the server passcode (only if enabled).
6. Upload a screenshot. If AI reads the buyer's header confidently, the buyer
   chat is created/reopened automatically. Review the entire menu, then Generate.

IPHONE SETUP
You cannot run Node.js from an ordinary local HTML file in iPhone Safari.
Host this folder on a trusted HTTPS web server with Node.js and your API key
configured server-side. Set HOST=0.0.0.0 and a strong APP_PASSCODE, place it
behind HTTPS and appropriate access protections. Then open the HTTPS URL in
Safari -> Share -> Add to Home Screen. A public raw HTTP server is unsafe.

The app cannot read FeetFinder directly or create ChatGPT conversations.
She chooses screenshots from Photos or pastes them; only uploads are analyzed.

PRIVACY
Buyer events and notes are encrypted with your private passphrase and stored
in this browser's local storage. Screenshots are in short-lived browser memory,
not stored in the vault. When using live AI, the screenshot, buyer message and
selected buyer history are transmitted to OpenAI for processing. The backend
has NO chat database. If your browser storage is erased, histories are lost
unless you exported a backup. Protect passphrases and encrypted backups.

A distinct encrypted vault is kept per browser / site origin. Opening an HTML
file and later opening a hosted site may not share local storage. To migrate,
use Export encrypted backup and Import encrypted backup in Privacy controls.

TESTED
See TEST_RESULTS.txt generated alongside these files for actual local tests.
Live requests to OpenAI require your key and were NOT executed in this session.

REFERENCE INTEGRATION — NOVEMBER 4, 2026
========================================
This revision adds server-side retrieval to V4. The subsequent personal-build
update below also updates the style workflow. No live deployment was performed.

New files: references.mjs, references.json, voice.txt, test-references.mjs.
Run: node --test test-references.mjs && node test-vault.mjs
Start: node server.mjs (same private server setup described above).

Every live generation now sends the authentic voice reference plus up to TWO
matching source passages. Retrieval uses word overlap against the current
message and visible excerpt, not unrelated buyer histories. Pages and source
SHA-256 hashes identify the exact indexed version; hashes identify source PDF
bytes, not an assertion that all source pages influenced a reply.

All 16 uploaded PDFs are indexed (543 passages). This first revision enables
automatic retrieval from the six communication, humor and confidence sources:
03, 04, 05, 07, 08, 14. The other ten PDFs remain indexed but are deliberately
excluded from automatic chat retrieval; the app does not claim to use them.
Source text comes from PDF text extraction and may contain website/navigation
noise. This is lightweight lexical search, not semantic/vector search.
The six original personal-message images are represented through the verified
authentic voice guide, not OCR-reindexed as separate source documents. Other
uploaded photos are not indexed. Project uploads do not sync into this app;
references.json and voice.txt are versioned snapshots shipped with this bundle.

After generation, expand "References supplied for these replies" to see titles,
pages, matching reasons, exact supplied text, hashes, and AI-reported usage.
"Supplied" proves the passage was placed in that API request. "AI reports using
this" is model self-report and does not prove causal influence or quality.
Unknown model-reported IDs are rejected. Demo replies never claim retrieval.

GET /api/references lists source metadata and automatic-retrieval eligibility.
It requires the configured server passcode. Source files are not served as
public static files. The reference audit stays in the current page and clears
with results; no buyer messages are added to the shared reference index.

Validation: mocked live-provider payload and audit checks; bounded retrieval,
voice baseline, provenance, hallucinated-source rejection, buyer mismatch;
existing real encrypted-vault test. Browser visual testing could not run because
the Chromium download was unavailable. Real OpenAI output,
real-key calls, hosted HTTPS, and a physical phone have NOT been tested.

PERSONAL BUILD UPDATE — NOVEMBER 4, 2026
=======================================
- Seven two-column personalities: Flirty, Naughty, Spicy, Playful, Sweet,
  Confident, Natural. Old Bossy settings migrate to Confident; Custom to Natural.
- Smart Select is on by default. Its selected reply tone is shown with results;
  the saved manual personality remains unchanged. Extra instructions and
  natural/clean/mild/strong language controls are in collapsed Advanced settings.
- Every screenshot, including repeats, requires Yes/No. Yes requires confirmation
  after changes; No restores that screenshot's initial settings. Buyer detection
  restores that buyer's settings, or defaults for a new buyer. Confirmed settings
  are saved to that buyer's encrypted vault when generating. Existing V4 buyers
  without saved settings start with defaults; ChatGPT preferences do not sync.
- My private references supports add/edit/delete/enable/disable and TXT/Markdown
  import. Unlock encrypted memory first. PDF and image imports are NOT supported
  by this editor yet. Save text extracted from those documents manually.
- Up to 20 references, 12,000 characters each. Up to four enabled voice/offerings
  entries can be supplied each time, capped to their first 3,000/2,500 characters.
  Guidance entries compete with existing sources for up to two matching passages.
  The audit shows exactly what was supplied and identifies private reference titles.
- Private references and per-buyer settings are included in encrypted backups,
  remain local to this browser, and are sent to AI only for requested generation.
  Disabled references are not supplied. The backend does not save or globally
  index personal references. This is still a single-user app, not a multi-account
  customer service. Delilah's built-in voice remains the baseline for this build.
- Generation is blocked at the server for declared screenshot requests without
  confirmation. Stale generation results are discarded when buyer/screenshot
  changes. This UI gate is not an authentication or anti-abuse mechanism.

Checks: node --test test-references.mjs; node test-vault.mjs;
node test-workflow.mjs. The workflow test uses a simulated DOM and is not visual
browser testing. Live API, physical phone and hosted deployment remain untested.

DEVICE SIGN-IN
Enter the server access code and choose Remember this device to stay signed in for up to 30 days. The server sets a signed HttpOnly, SameSite cookie (Secure on public hosting); the access code is not saved in browser storage. Sign out clears the cookie. Changing APP_PASSCODE invalidates all device sessions. Private-memory encryption still has its own passphrase. Clearing browser data or using private browsing can require signing in again.
