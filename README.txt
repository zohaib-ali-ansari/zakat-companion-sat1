Zakat Companion — feature/ai-guidance (rebuilt, JavaScript, matches team structure)
Prepared by: Faryal

THIS IS A COMPLETE PROJECT FOLDER, not just a few files.
Base structure copied from Zohaib's feature/core-ui-dashboard (App.js,
navigation, theme, language context) + my two screens added in.

WHAT TO DO

1. Delete your old project folder completely (the TypeScript/Expo Router one).
2. Extract this zip — this whole folder becomes your new project.
3. Open a terminal inside this folder and run:
     npm install
4. Run:
     npx expo start
5. On the Home screen, use the bottom nav to check "Assistant" tab.
6. Open the menu/settings icon (top right) → "Zakat Guidance" to check the
   guidance list + search + topic detail screens.

WHAT'S MINE (my actual work)
  src/screens/AssistantScreen.js       → AI Assistant chat screen
  src/screens/ZakatGuidanceScreen.js   → Zakat Guidance list + detail screen

EVERYTHING ELSE in this zip (App.js, LoginScreen, DashboardScreen, theme,
language context, etc.) belongs to Zohaib/the team's shared base — it's
included only so the project actually runs. Do not treat those as your
work when committing — only stage/commit the two files above as "yours"
plus any App.js line changes needed to wire them in.

GIT NOTE
When you push this to feature/ai-guidance, coordinate with Zohaib first —
this base will need to be kept in sync with his branch as he updates it,
since you're both sharing App.js, theme/, context/, components/.
