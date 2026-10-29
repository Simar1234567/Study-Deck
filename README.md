# Study Deck

Open `BIO201_Appendicular_Ready_To_Study.html` in a browser. It works offline and includes the original 48 muscle photographs. For a stable local browser origin, optionally run `python -m http.server 8000` from this folder. Keep using the same browser and origin to retain local progress.

## Partial credit and smart review

- **Perfect:** every available field correct, with at least two successful recalls per field separated by a day since its last miss.
- **Well known:** at least 75% of all available fields currently correct.
- **Partially known:** some fields correct, below 75%.
- **Needs review:** no fields correct.
- **New** is a separate unstudied indicator.

Each field is scored separately. Name-only practice cannot earn credit for untested actions or attachments. Other fields retain their previous results. Review the answer side and use **Accept this field / Mark incorrect** to correct the local text matcher before saving; it cannot reliably recognize every anatomical paraphrase. Flip mode uses explicit self-ratings instead of claiming measured field results.

The offline scheduler uses SM-2-inspired intervals, not Anki's FSRS model or a claim of identical scheduling. Smart sessions contain up to 20 cards, interleaving three due reviews with one new card when both are available. Weakness, relative overdue time, and past misses determine review priority.

Initial intervals are 10 minutes / 1 day / 3 days / 7 days from Needs review through Perfect. Spaced successes grow intervals up to your per-deck maximum (30 days by default); any missed field limits the next interval to at most one day. Weak or missed cards get up to two retries after up to three other cards. If no other cards remain, or retries are exhausted, they become due within 10 minutes. Immediate repetitions cannot multiply intervals or earn spaced mastery. **Practice all** permits early review; **Due reviews only** excludes new and future-due cards.

Existing Known/Review progress displays as Well known/Needs review without inventing historical field scores. No storage keys or original card IDs change. JSON export/import retains field results and schedules. Export a backup before switching devices or replacing an offline copy: GitHub and this HTML do not synchronize browser progress.

## Validation

Run `node --test tests/smart-review.test.cjs` for deterministic scheduling tests without additional packages. Browser smoke checks should cover typed answers and Enter submission, partial credit, field overrides, answer-side flipping, repeated cards, self-rating, reload persistence, deck deletion, backup/import, and narrow-screen layouts.

## Shuffle

Use **Shuffle remaining** during typed or flip practice to randomize upcoming cards. The current card, unsaved answers, grades, and saved schedules stay intact. The button becomes available when at least two cards remain after the current card. Shuffling replaces the current queue priority order; starting a new Smart review session restores automatic prioritization.

## Updates from inside the app

Use **Check for updates** to check the matching edition over HTTPS: desktop checks `main`; iPad checks `ipad-compatible`. The app verifies the downloaded version, byte count, app identity, and SHA-256 hash before offering installation. There is no background network access or automatic installation. An offline/error/cancelled check leaves the app untouched.

Chrome/Edge on desktop may offer **Select file & install update**. Select the existing local Study Deck HTML and grant permission to edit it. The browser stages the replacement and commits it on completion. Then reopen the selected file. Browsers without the File System Access API offer **Download updated HTML**; replace the old copy manually, using the same folder and filename. Browser security prevents silently writing arbitrary files. This updates a local copy, not GitHub or an installed app on another device.

Export your decks before updating. Updates retain the browser storage keys and do not clear study data, but browser storage remains specific to a browser/origin and is not a substitute for a backup. Source-code edits in the selected HTML will be replaced by the GitHub version. Keep the same local filename/location; browsers vary in how they retain storage for local files.

### Publishing later updates

After editing the HTML, run `node scripts/prepare-update.cjs 1.2.0` (choose a strictly higher version each release). This updates the shared source version, generates the iPad `index.html` with its Safari/touch styles, and generates both edition-specific manifests. Commit all generated files together and publish to both `main` and `ipad-compatible`, preserving any new remote changes. Run `node scripts/prepare-update.cjs --check` to verify they match. GitHub CDN propagation may briefly cause verification errors; retry later rather than bypassing verification. Never publish a changed HTML under the same version if installed users should receive it.

## Quick editing while studying

After checking typed answers or revealing a flip card, use **⋯ → Edit card**. Study-time editing happens directly on the card: tap the text to change it, move answer fields with ↑ / ↓, adjust the photo width or stack it above the answers, and change/remove the photo. Use **Save card** or **Cancel** at the top. The normal deck-manager editor remains available outside study sessions.

Saving keeps you on the same study card, updates the answer view, and rechecks changed answers against your typed response. Enter adds a line while editing; Escape cancels. Card content and layout are saved with browser-local decks and exported backups. Editing does not reset past review history. The dropdown closes when the mouse/pen leaves it, focus leaves it, or you tap outside; touch users can open it by tapping the three dots.

## Desktop and iPad editions

All requested features are maintained in both editions. Desktop opens `BIO201_Appendicular_Ready_To_Study.html`; iPad opens `index.html` from the `ipad-compatible` branch. Both include deck deletion, partial-credit categories, smart review, shuffle, quick editing, backup/import, and update checks. The iPad edition keeps the existing Safari layout and touch-target fixes. Safari cannot directly overwrite a local HTML; its update flow downloads the new iPad edition for manual replacement.

`BIO201_Appendicular_Ready_To_Study.html` is the shared source; `styles/ipad.css` contains the preserved iPad overrides. The release script regenerates `index.html`, so app logic cannot silently diverge. The two editions keep the same storage keys, but progress remains browser/origin-local; it does not synchronize between devices.

## Custom review interval

Open a deck → **Edit deck** → **Maximum days between reviews**. Choose a whole number from 1 to 365; the default is now 30 instead of 180. This is a maximum gap between reviews, not the number of days needed to learn a deck. Typed reviews and flip-card ratings both respect it. Weak cards may return much sooner.

Reducing the limit shortens existing due dates relative to their last review; cards past that limit become due immediately. Increasing it never postpones an already-scheduled review. Categories and answer history are retained. Settings are saved per deck and included in backups/imports.

## Practice the same card after seeing its answer

After checking typed answers or revealing a flip card, choose **Practice this card**. This hides the answers and opens blank fields on the same card. Check your practice answers and choose **Practice again** to repeat, or **Return to original result** to continue the study session. Flip-card practice returns to its original answer side for self-rating.

These immediate drills do not alter the queue, category, attempt history, or review date. Your original result is retained and recorded only when you continue normally; practice does not turn a missed review into an earned spaced success. If you correct the card's answer through Quick edit during practice, the original typed response is rechecked against the corrected answer when you return.
