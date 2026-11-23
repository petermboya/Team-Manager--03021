# Team Manager

Team Manager is a web app that helps a football team keep all of its player data in one place. Four kinds of people use it, and each one only sees and edits what their job needs: the **Admin** keeps player bio data, the **Medical team** tracks injuries and match fitness, the **Assistant coach** logs match stats and gets an automatic match rating, and the **Head coach** sees everything and picks the starting 11 and substitutes.

It is built with React, Tailwind CSS, Firebase Authentication and a REST API (json-server), and it is covered by automated tests.

## Live demo and deploy

| | |
|---|---|
| **Live demo** | [https://petermboya.github.io/Team-Manager-/](https://petermboya.github.io/Team-Manager-/) |
| **Deploy / redeploy (GitHub Pages)** | [Open the "Run workflow" page](https://github.com/petermboya/Team-manager-/actions/workflows/deploy.yml) and click **Run workflow** |
| **Deploy your own copy (Netlify)** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/petermboya/Team-Manager-) |

On the live demo you can click one of the **demo accounts** on the login page to try every role (see [Demo accounts](#demo-accounts)). The live demo runs in **demo mode**: because GitHub Pages cannot run a server, the data is saved in your own browser, and the app starts with 18 sample players. Setup steps for each button are in [Deployment](#deployment).

## Contents

- [What the app does](#what-the-app-does)
- [Roles and permissions](#roles-and-permissions)
- [Demo accounts](#demo-accounts)
- [Match rating](#match-rating)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Running the tests](#running-the-tests)
- [REST API](#rest-api)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Limitations and next steps](#limitations-and-next-steps)

## What the app does

- **Login with Firebase:** email and password, or Google. On the login page you also choose your role (Admin, Medical team, Head coach or Assistant coach). The app checks it against the role saved for your account, so signing in as the wrong role is rejected.
- **Role-based pages:** after login, the menu only shows the pages your role may use. Other roles' pages are never shown.
- **Player bio data (Admin):** add, edit and delete players with name, shirt number, date of birth (the age is worked out for you), height, weight, position, nationality and preferred foot. Two players cannot share a shirt number.
- **Injury tracking (Medical team):** set each player to **Match fit**, **Injured** or **Recovering**, with the injury name, the date injured and the expected return date. The app works out how many days the player has been out and how many days are left. Everyone sees the same status.
- **Match performance (Assistant coach):** create a match (Match 1, Match 2 and so on, with opponent and date), then log each player's stats. The stats form covers minutes, goals, assists, passing, shooting, possession, defending and duels. Pairs such as accurate passes are entered as made and attempted, and the percentage is worked out for you, for example `28/30 (93%)`.
- **Match rating and form:** every player gets a rating from 0 to 10 (1 decimal) for each match. Their **form** is the average of all their match ratings.
- **Squad overview (Head coach, view only):** a table of every player with fitness and form, and a detail view with the full bio, injury timeline, match history and every stat for any match.
- **Squad picker (Head coach):** choose a starting 11 and up to 7 substitutes. Players who are not match fit can be chosen but are flagged. The squad is saved.
- **Data is saved:** everything is stored through a REST API, so it is still there after you refresh the page.

## Roles and permissions

| Role | Can see | Can change |
|---|---|---|
| **Admin** | Players and their bio data | Add, edit and delete players |
| **Medical team** | Every player's fitness status and injury details | Status, injury name, dates |
| **Assistant coach** | Matches, player stats, ratings and form | Create and delete matches, log, edit and delete player stats |
| **Head coach** | Everything about every player (view only) | Only the starting 11 and substitutes |

Deleting a player also deletes that player's injury and match records.

## Demo accounts

The login page has a **Demo accounts** box. One click signs you in as that role. The first time you use a demo account, the app creates it in Firebase for you.

| Role | Email | Password |
|---|---|---|
| Admin | admin@team.com | admin123 |
| Medical team | medical@team.com | medical123 |
| Head coach | coach@team.com | coach123 |
| Assistant coach | assistant@team.com | assistant123 |

> **Demo accounts are for learning and demos only.** Anyone who reads this README knows the passwords. Before using real player data, delete `src/demoAccounts.js` and the demo box in `src/pages/Login.jsx`.

You can also create your own account: click **Create an account**, pick a role, and sign up. That account is then locked to the role you chose.

## Match rating

Every player starts a match on **6.0**. Each stat then adds to or subtracts from the rating. The result is kept between 0 and 10 and rounded to 1 decimal.

| Adds | Amount |
|---|---|
| Goal | +1.0 |
| Assist | +0.7 |
| Big chance created | +0.3 |
| Chance created | +0.15 |
| Shot on target | +0.1 |
| Successful dribble | +0.1 |
| Tackle, interception or block | +0.1 each |
| Clearance or defensive contribution | +0.05 each |
| Pass into the final third | +0.03 each (max +0.3) |
| Line-breaking pass | +0.05 each (max +0.3) |
| Recovery | +0.03 each (max +0.3) |
| Was fouled | +0.05 |
| Pass accuracy (only with 10 or more passes) | (accuracy % − 75) × 0.02 |
| Duels | +0.04 for every duel won beyond the ones lost (ground and aerial together) |

| Takes away | Amount |
|---|---|
| Big chance missed | −0.4 |
| Dispossessed | −0.1 |
| Dribbled past | −0.1 |
| Foul committed | −0.1 |
| Shot off target | −0.05 |
| Blocked shot | −0.03 |

Shot accuracy is shots on target out of all shots (on target, off target and blocked). The formula lives in `src/rating.js`, so it is easy to adjust.

## Tech stack

| Part | Used for |
|---|---|
| **React** (JavaScript, JSX) | Pages and reusable components |
| **Tailwind CSS** | Styling, in blue, white and grey |
| **Vite** | Dev server and build tool |
| **Firebase Authentication** | Email/password and Google sign-in |
| **json-server** | The REST API. Data is stored in `db.json` |
| **Vitest + Testing Library** | Automated tests and coverage (minimum 70%, currently around 80%) |
| **GitHub Actions + GitHub Pages** | Tests on every push, then deploy |

## Project structure

```
team-manager/
├── .github/workflows/deploy.yml   # runs tests, builds and deploys to GitHub Page
├── db.example.json                # empty database template (copy to db.json)
├── .env.example                   # Firebase settings template (copy to .env)
├── vite.config.js                 # Vite, Tailwind and test settings
└── src/
    ├── App.jsx                    # shows Login or Dashboard
    ├── AuthContext.jsx            # login, sign-up, demo login, logout, role check
    ├── firebase.js                # Firebase setup
    ├── api.js                     # GET / POST / PATCH / DELETE helpers
    ├── localApi.js, demoData.js   # browser-storage API used in demo mode
    ├── permissions.js, roles.js   # which role sees which pages
    ├── rating.js, statFields.js   # match rating, form and the list of stats
    ├── utils.js, statuses.js      # age, dates, injury timeline, status list
    ├── pages/                     # Login, Dashboard, Players, Fitness,
    │                              # Performance, Overview, Squad
    └── components/                # tables, forms and detail views
```

Every file has a matching `.test.js` or `.test.jsx` next to it.

## Getting started

### 1. What you need

- [Node.js](https://nodejs.org) 20 or newer (the LTS version)
- A free [Firebase](https://console.firebase.google.com) account

### 2. Install

```bash
git clone https://github.com/petermboya/Team-Manager-.git
cd Team-Manager-
npm install
cp db.example.json db.json
```

`db.json` is where json-server saves your data. It is not committed to Git, because it contains your accounts.

### 3. Set up Firebase

1. In the Firebase console, click **Add project** and name it `team-manager`.
2. Click the web icon `</>` and register an app. Do not tick "Firebase Hosting".
3. Open **Build → Authentication → Get started**. Enable **Email/Password** and **Google**. For Google, choose a support email.
4. Open **Project settings → Your apps** and copy the four values from the config block.
5. Copy `.env.example` to a new file called `.env` and paste the values in, with no quotes or spaces:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run it

```bash
npm start
```

This starts two things at once: the REST API at `http://localhost:3001` and the app at `http://localhost:5173`. Open the app, click a demo account and try it out. If you change `.env`, stop the app with `Ctrl+C` and start it again.

| Command | What it does |
|---|---|
| `npm start` | Runs the API and the app together |
| `npm run dev` | Runs only the app |
| `npm run api` | Runs only the API |
| `npm test` | Runs all tests once |
| `npm run coverage` | Runs the tests and shows test coverage (fails under 70%) |
| `npm run build` | Builds the app into the `dist` folder |

## Running the tests

```bash
npm test
npm run coverage
```

The tests cover the login logic, every page and component, the rating formula, the date calculations and the API helpers. The Firebase and API calls are replaced with fakes in the tests, so no internet or Firebase account is needed to run them.

## REST API

json-server turns `db.json` into a REST API. The app uses these collections: `players`, `injuries`, `matches`, `performances`, `squads` and `users`.

| Method | Used for | Example |
|---|---|---|
| `GET` | Read data | `GET /players` |
| `POST` | Add new data | `POST /matches` |
| `PATCH` | Edit existing data | `PATCH /injuries/3` |
| `DELETE` | Remove data | `DELETE /players/2?_dependent=injuries&_dependent=performances` |

`_dependent` also deletes linked records, for example a player's injuries and stats. You can try the API in the browser at `http://localhost:3001/players`.

How the data is linked:

- `injuries` has one record per player, with `playerId`, `status`, `injuryName`, `dateInjured` and `expectedReturn`.
- `performances` has one record per player per match, with `playerId`, `matchId`, every stat and the `rating`.
- `squads` has one record with the `starting` and `subs` lists of player ids.
- `users` holds each account's saved role, with the Firebase user id as its `id`.

## Deployment

The app is a static website, so GitHub Pages can host it. A GitHub Actions workflow (`.github/workflows/deploy.yml`) runs the tests and deploys on every push to `main`. If a test fails or coverage drops below 70%, nothing is deployed.

### One-time setup for GitHub Pages

1. Create a GitHub repository named `team-manager` and push this project to it (the `main` branch).
2. In the repository, open **Settings → Pages**, and under **Build and deployment** set **Source** to **GitHub Actions**.
3. Open **Settings → Secrets and variables → Actions → New repository secret** and add four secrets, with the same values as in your `.env`:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`
4. In the Firebase console, open **Authentication → Settings → Authorized domains**, click **Add domain**, and add `petermboya.github.io`. Without this, Google sign-in fails on the live site.
5. Open the **Actions** tab, choose **Test and deploy to GitHub Pages**, and click **Run workflow** (or just push a commit). When it turns green, the site is live at `https://petermboya.github.io/Team-Manager-/`.
6. Replace `YOUR-USERNAME` at the top of this README with your GitHub username.

If you named the repository something else, the workflow adjusts by itself, but update the links in this README to match.

### Demo mode

GitHub Pages cannot run json-server, so the deployed app runs in **demo mode** whenever no API address is set. It then keeps its data in the browser (`localStorage`) and starts with 18 sample players. This means:

- Each visitor has their own private copy of the data. Nothing is shared between visitors.
- Firebase accounts are real, but roles and data are saved per browser.
- Clearing the browser data resets the demo.

When you run the app locally with `npm start`, it uses json-server and shares data as normal.

### Using a real shared API (optional)

To make all users share the same data online, host json-server somewhere that runs Node.js (for example Render or Railway), then in the repository open **Settings → Secrets and variables → Actions → Variables** and add a variable called `VITE_API_URL` with the API address. Run the workflow again and demo mode switches off. A hosted json-server has no login protection of its own, so do not put real personal data on it.

### Deploy your own copy on Netlify

Click the **Deploy to Netlify** button at the top, connect your GitHub account, and add the same four `VITE_FIREBASE_...` values as environment variables when asked. Then add the Netlify site's domain to the Firebase **Authorized domains**, as in step 4 above. The Netlify copy also runs in demo mode.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm error ... package.json` not found | You are in the wrong folder. Run `cd` into the folder that contains `package.json`. |
| "Request failed. Is `npm start` running?" | The API is not running or `db.json` is missing a collection. Run `npm start`, and make sure `db.json` has all six collections (copy `db.example.json` if unsure). |
| `GET /matches 404` in the terminal | `db.json` has no `"matches": []` section. Add it. |
| Firebase `auth/invalid-api-key` | `.env` is missing or has wrong values. Check it and restart `npm start`. |
| Google sign-in fails on the live site | Add `YOUR-USERNAME.github.io` to the Firebase **Authorized domains**. |
| Blank page on GitHub Pages | Check that **Settings → Pages → Source** is **GitHub Actions** and that the workflow finished green. |
| The deploy workflow fails at the test step | Run `npm run coverage` locally and fix the failing test or the coverage first. |
| "This account is registered as X, not Y" | You picked a different role than the one saved for this account. Choose the original role. |

## Limitations and next steps

- **Roles are chosen at sign-up.** Anyone can create an account with any role once. A real system needs an Admin page where the Admin assigns roles.
- **json-server has no security.** The API accepts any request, and the role checks only happen in the app. A real launch needs a proper backend or Firebase security rules that check roles.
- **Demo accounts are public.** Remove them before using real data.
- **Firebase keys are visible in the built site.** That is normal for Firebase web apps, and why the Authorized domains list matters.
- Ideas for later: assign roles from an Admin page, a squad per match, charts of ratings over time, and photos for players.

Built as a learning project with React, Tailwind CSS and Firebase.

![Test and deploy](https://github.com/petermboya/Team-Manager-/actions/workflows/deploy.yml/badge.svg)

Author: Peter Mboya
Instituition: Moringa School
