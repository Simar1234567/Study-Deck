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

Initial intervals are 10 minutes / 1 day / 3 days / 7 days from Needs review through Perfect. Spaced successes grow intervals up to 180 days; any missed field limits the next interval to at most one day. Weak or missed cards get up to two retries after up to three other cards. If no other cards remain, or retries are exhausted, they become due within 10 minutes. Immediate repetitions cannot multiply intervals or earn spaced mastery. **Practice all** permits early review; **Due reviews only** excludes new and future-due cards.

Existing Known/Review progress displays as Well known/Needs review without inventing historical field scores. No storage keys or original card IDs change. JSON export/import retains field results and schedules. Export a backup before switching devices or replacing an offline copy: GitHub and this HTML do not synchronize browser progress.

## Validation

Run `node --test tests/smart-review.test.cjs` for deterministic scheduling tests without additional packages. Browser smoke checks should cover typed answers and Enter submission, partial credit, field overrides, answer-side flipping, repeated cards, self-rating, reload persistence, deck deletion, backup/import, and narrow-screen layouts.

## Shuffle

Use **Shuffle remaining** during typed or flip practice to randomize upcoming cards. The current card, unsaved answers, grades, and saved schedules stay intact. The button becomes available when at least two cards remain after the current card. Shuffling replaces the current queue priority order; starting a new Smart review session restores automatic prioritization.
