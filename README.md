# Jeremiah Davis for Student Council President

Campaign site for Jeremiah Davis, Belmont Preparatory High School, Class of 2027.
*Make the alarm worth it.*

## What's in here

| File | What it is |
| --- | --- |
| `docs/config.js` | **All the content.** Bio, platform, events, Q&A, cabinet, links, feature switches. This is the file you'll edit most. |
| `docs/index.html` | The site's design and code. You rarely need to touch this. |
| `docs/` | Put photos and videos here too (e.g. `docs/jeremiah.jpg`), then write `photo: "jeremiah.jpg"` in config.js. |
| `database.rules.json` | Security rules for the live poll, supporter counter and idea wall. |
| `firebase.json`, `.firebaserc` | Tell Firebase what to publish and which project to use. |

## Editing

- **On GitHub:** open `docs/config.js`, click the pencil icon, edit, then **Commit changes**.
- Keep the quotes, commas and brackets exactly as they are. If the site goes blank after an edit, a missing comma or quote is almost always why.
- Anything left empty (`""` or `[]`) hides itself or shows a "coming soon" message.

## Previewing (GitHub Pages)

One-time setup: repo **Settings → Pages → Build and deployment**. Pick **Deploy from a branch**, set the branch to `main` and the folder to `/docs`, then click **Save**.
Your preview link will be `https://YOUR-USERNAME.github.io/REPO-NAME/`. It updates about a minute after each commit.

## Publishing to Firebase (when it's final)

On your Mac, in the repo folder (pull the latest changes first if you edited on GitHub):

```
firebase deploy --only hosting
```

The live site is `https://jermiah-for-president-dbe87.web.app`.

## Turning on the live features (poll, supporter counter, idea wall)

These stay hidden until you do this once:

1. **Firebase console → Build → Realtime Database → Create database.** Pick the US location and start in **locked mode**.
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable.** This lets people vote without an account, one vote per device.
3. **Project settings (gear icon) → Your apps → Web (`</>`).** Register an app, then copy the values from `firebaseConfig` into the `firebase:` section at the bottom of `docs/config.js`. Also copy the database URL shown at the top of the Realtime Database page into `databaseURL`.
4. If you use the GitHub Pages preview, add `YOUR-USERNAME.github.io` under **Authentication → Settings → Authorized domains**.
5. Upload the security rules:
   ```
   firebase deploy --only database
   ```

### Approving ideas for the wall

New ideas are hidden until you approve them. In the Firebase console go to **Realtime Database → ideas**, open an idea, and change `approved` from `false` to `true`. To reject one, delete it.

### Good to know

- Poll votes are saved by the platform point's position (1st, 2nd, 3rd...). If you reorder or remove platform points after voting starts, the results will shift. Add new points at the end instead.
- The supporter number stays hidden until it reaches `supportersMinToShow` (10 by default).
- Anyone determined enough can vote again from a new browser. It's a campaign poll, not an election.
- Any feature can be turned off in `features:` in config.js (set it to `false`).
