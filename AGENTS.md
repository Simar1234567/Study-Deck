# Study Deck maintenance

The user wants every requested feature and fix in BOTH the desktop and iPad editions.

- Edit `BIO201_Appendicular_Ready_To_Study.html` as the shared app source.
- Preserve the iPad-specific rules in `styles/ipad.css`. `index.html` is generated; do not edit it independently.
- Run `node scripts/prepare-update.cjs <new-version>` to regenerate the iPad edition and both update manifests. Every published app change must increase the version.
- Validate with `node --test tests/smart-review.test.cjs` and `node scripts/prepare-update.cjs --check`. Check relevant browser flows at desktop and iPad touch viewport sizes.
- For authorized publication, keep both `main` and `ipad-compatible` branches current, preserving any new remote work. Never force-push to reconcile them.
- Preserve card data, storage keys, and existing progress. Export/import must retain review settings and schedules.
- The iPad updater must fetch `index.html` and `ipad-update-manifest.json` from `ipad-compatible`; desktop uses the named HTML and `update-manifest.json` on `main`. iPad Safari uses the download fallback, since it cannot overwrite arbitrary local HTML files.
