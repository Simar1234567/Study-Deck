# Study Deck

Open `BIO201_Appendicular_Ready_To_Study.html` in a browser. It works offline and includes the original 48 muscle photographs. For a stable local browser origin, optionally run `python -m http.server 8000` from this folder. Keep using the same browser and origin to retain local progress.

## Partial credit and smart review

- **Perfect:** every available field currently correct, with no waiting period.
- **Well known:** at least 75% of all available fields currently correct.
- **Partially known:** some fields correct, below 75%.
- **Needs review:** no fields correct.
- **New** is a separate unstudied indicator.

Each field is scored separately. Name-only practice cannot earn credit for untested actions or attachments. Other fields retain their previous results. Review the answer side and use **Accept this field / Mark incorrect** to correct the local text matcher before saving; it cannot reliably recognize every anatomical paraphrase. Flip mode uses explicit self-ratings instead of claiming measured field results.

**Study whole deck** includes every card without a daily cap or due-date restrictions. It interleaves three previously studied cards with one new card. Weakness and past misses determine priority. Weak or missed cards get up to two retries after up to three other cards when available. **Weak cards only** selects Needs review and Partially known cards. Pause and resume retain the remaining queue.

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

## Study at your own pace

Version 1.4.0 removes review dates, the interval setting, and the 20-card cap. Legacy scheduling metadata remains in backups for compatibility but does not restrict study or affect priority. Existing saved sessions keep their original queues; start **Study whole deck** for a new complete session.

## Practice the same card after seeing its answer

After checking typed answers or revealing a flip card, choose **Practice this card**. This hides the answers and opens blank fields on the same card. Check your practice answers and choose **Practice again** to repeat, or **Return to original result** to continue the study session. Flip-card practice returns to its original answer side for self-rating.

These immediate drills do not alter the queue, category, attempt history, or review date. Your original result is retained and recorded only when you continue normally; practice does not change the original grade. If you correct the card's answer through Quick edit during practice, the original typed response is rechecked against the corrected answer when you return.

## Multiple lines on cards

All answer fields support multiple lines, including the main answer. On-card text areas grow as you type, and answer views preserve line breaks and blank lines. Enter adds a new line while typing; use **Check answers** or **Ctrl/⌘+Enter** to grade. After grading, Enter continues as before. Saved card text, backups, and imported cards retain their internal line breaks.

## Reset and resume progress

**Reset progress** is available on each deck tile and at the top of the deck page. After confirmation, it clears that deck’s categories, answer history, review dates, and saved study session. Cards, photos, edits, layouts, and the maximum review interval are retained. Other decks are unaffected. Export a backup first if you may want the old results back.

**Resume study** appears on the deck tile and deck page when an unfinished session is saved. Study position is saved automatically while typing and whenever the study view changes. Resume restores the current card, remaining queue (including shuffled order), scope, typed draft, answer-side feedback, and practice-retry state without recording another review. **Pause study** returns to the deck page and keeps that position. Starting a new session for the same deck replaces its previous saved session; finishing or resetting clears it.

Session snapshots use a small separate IndexedDB database plus a localStorage fallback, preserving the existing deck/progress storage keys. Resume points are also included in exports, with card IDs remapped on import. Use the same browser/profile and file location after app updates. This does not synchronize study positions across devices. Unsaved changes in the card editor are not restored—use **Save card** before leaving those edits.

## Preview cards from the deck overview

Click or tap a card row, photo, or name to view its photo, answers, note, source, and review status without starting a session or changing progress. Card names are keyboard-accessible buttons. Close the preview to return to the deck, or choose Edit card.

## FSRS (version 1.5.0)

The offline HTML embeds the MIT-licensed ts-fsrs 6.0.0 implementation, using its default FSRS model and weights, 90% target retention, and disabled interval fuzz. FSRS predicts retrievability to order studied cards; all cards remain available and whole-deck sessions have no cap. New cards remain interleaved. The optional weak-card filter and bounded in-session retries are app features around FSRS.

Self-ratings map Needs review → Again, Partially known → Hard, Well known → Good, Perfect → Easy. Typed reviews with any missed field map to Again; fully correct whole-card reviews map to Easy, and fully correct limited-scope reviews map to Good. The visible category still reflects field-level correctness. Practice drills do not record additional FSRS reviews.

Existing progress is retained. Cards without FSRS data start fresh in the scheduler on their next review, without inventing past review events. Stability, difficulty, and scheduling state persist with progress and backups. Internal FSRS dates are used for its model, not to restrict access or display deadlines. Saved queues retain their order; FSRS ordering applies when starting a new session. Default weights are not automatically optimized for an individual user.

## Independently graded answer parts (1.6.0)

Separate expected answers and your responses with semicolons or line breaks. Blank parts are ignored; commas remain within a part. Responses may be reordered, with one response matching at most one expected part. Colon labels must match (for example, `Long head: scapula`). Each field shows its correct-part count and individual overrides. Mastery scores count correct parts across the card, while FSRS remains card-based and treats any missed part as Again. Existing semicolons now delimit parts; edit punctuation where needed. Part grades and overrides survive pause/resume and backups.
