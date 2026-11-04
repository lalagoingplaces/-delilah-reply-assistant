# Delilah Android Companion — initial test build

Native Android prototype for an explicitly approved screen-sharing session. No accessibility service, automatic sending, microphone recording, or continuous AI uploads. Tap Read this chat to send one captured image to the existing authenticated API, review/correct the buyer and style, then generate and copy two suggestions. The image is kept in memory only. Stop and Android's sharing controls end the session.

Sign in using the personal app's username and password. Only the session cookie is stored in app-private preferences; passwords and API keys are not embedded. App backups are disabled. This prototype uses its own session and does not synchronize the web app's locally stored buyer profiles or settings.

## Build

Use Android Studio or JDK 17, Android SDK 35 and Gradle 8.11.1:

    gradle :app:assembleDebug :app:lintDebug

A GitHub Actions build is included; its APK is a development build, not a Play Store release. Android permissions must be approved on the phone. Start assistant only when ready to share; select the browser/app containing FeetFinder in Android's chooser. If selecting Chrome, other Chrome tabs could also become visible to capture: stop sharing before changing to unrelated content.

## Required device verification

This has not yet been validated on the Samsung S26 Ultra or with FeetFinder. Confirm capture is not blocked, rotation/app resizing works, the panel stays reachable with the keyboard, Stop/lock-screen ends capture, and screen contents are readable. Black or protected screens must be handled without bypassing protection. The panel may need scrolling/layout refinement on small displays. AI calls consume the existing API balance.
