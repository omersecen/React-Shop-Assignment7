# Found & Good — Assignment 7

A small React shop for CMP309 Web Programming (Fall 2026), built with Vite, React Router, Context + useReducer, and Zustand. The catalogue comes from DummyJSON; there is no real authentication, checkout, or backend.

## Run locally

Use Node.js 22.12+ (or a supported newer LTS release).

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. To verify the implementation:

```sh
npm test
npm run build
npm run preview
```

The tests use Vitest and Testing Library as development tools; the application uses no UI library, Redux, or server-state library. `node_modules`, build output, and local environment files are excluded from Git.

## Demo sign-in

- Username: `230408037@st.biruni.edu.tr`
- Password: `demo123456`

These credentials are intentionally public and only demonstrate a roughly 500 ms asynchronous login. Authentication resets on reload; the cart and theme survive reloads on the same browser. Do not use a real password.

## File organization

```text
assignment7/
├── src/
│   ├── api/
│   │   ├── productsApi.js      # Fetch and HTTP status handling
│   │   └── authApi.js          # Fixed demo login pair
│   ├── hooks/
│   │   ├── useFetch.js         # Reducer-based independent request state
│   │   └── useLocalStorage.js  # Read and persist a preference
│   ├── context/
│   │   └── AuthContext.jsx     # AuthProvider, authReducer and useAuth
│   ├── store/
│   │   └── cartStore.js        # Immutable actions and external persistence
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── NavBar.jsx
│   │   ├── ProductCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Login.jsx
│   │   └── NotFound.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tests/shop.test.jsx
├── index.html
├── vite.config.js
├── package-lock.json
└── package.json
```

## Routes and behavior

| Route | Behavior |
| --- | --- |
| `/` | Home and category shortcuts |
| `/products` | All 100 requested products; title and category filters |
| `/products?category=beauty&q=mascara` | Shareable filtered catalogue |
| `/products/:id` | Product details, add to cart, back and next controls |
| `/cart` | Protected cart with quantities, removal, totals and clear |
| `/login` | Demo sign-in; restores the attempted destination |
| Any unmatched path | 404 inside the common layout |

`/products` and `:id` are nested routes. All pages share a navigation bar and footer through `Outlet`. An unknown product such as `/products/999999` is a readable API error on the detail page, rather than the router's 404.

## Reasoning questions

### 1. State choices

The signed-in user lives in Context with `useReducer` because navigation and protected routes need the same low-frequency session state; the frequently edited cart lives in Zustand so components can select only what they need. Filters live in URL query parameters so a shared link or reload recreates the same view, while the product list lives in each `useFetch` invocation because it is asynchronously loaded page data. The theme lives in `Layout` through `useLocalStorage` and is passed to the navigation bar; categories, filtered results, item counts and totals are derived instead of being stored separately.

### 2. Context versus store

Authentication changes only on login and logout, so a simple Context provider with explicit reducer actions is a good fit. Cart edits happen more often, and Zustand lets the badge subscribe to a primitive item count while a button selects only its action. Putting the cart in a single Context value could update every consumer whenever quantities change; putting authentication in Zustand could work, but would remove the required reducer/provider model without a useful advantage here.

### 3. Custom hooks

`useFetch` shares the loading/success/error reducer, request startup and cleanup logic between the catalogue and detail pages. It deliberately does not share their actual state, responses, or cache: each invocation has its own reducer and AbortController. The hook receives a stable API function and its primitive inputs, calls it with an AbortSignal, and ignores obsolete responses after cleanup.

### 4. Route parameters

The `id` returned by `useParams` is a string, even when the URL contains digits. The API URL accepts that string through `encodeURIComponent`, so fetching does not require converting it. The next-product button does use `Number(id) + 1`; without conversion, the string `"1"` plus `1` would produce `"11"`.

### 5. Protected routes

`ProtectedRoute` is a user-experience feature, not security: the entire check and the demo password are visible in the browser, and a visitor can modify client state. A secure application needs server-side credential verification, a securely managed session, and authorization on every protected API request. This shop intentionally has no sensitive data or real checkout.

### 6. Deep links

A plain static server may look for a physical `/products/3` file when that address is reloaded and return an HTTP 404 before React runs. BrowserRouter hosting needs an SPA fallback that serves `index.html` for application routes while still serving assets normally. The Vite development server supplies this fallback, after which React Router matches the URL in the browser.

## Self-study and official references

- [React Router: useSearchParams](https://reactrouter.com/api/hooks/useSearchParams): setting search parameters performs navigation. `ProductList` clones the previous `URLSearchParams` before setting or deleting one key, so changing category preserves `q` and unrelated parameters; reset removes only the two filter keys.
- [Zustand official README](https://github.com/pmndrs/zustand/blob/main/README.md): the hook created by `create` exposes `getState`, `setState` and `subscribe`, and components can select individual values. The store reads validated items before creation, and a subscription writes changed items outside React; totals and the badge are derived primitives, not newly allocated selector objects.
- [MDN: localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage): storage persists between visits, contains strings and may throw when unavailable. The hook and store guard reads, JSON parsing and writes; cart hydration validates each item's shape and rejects duplicate IDs rather than trusting stored JSON.
- [React: useEffect](https://react.dev/reference/react/useEffect) and [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController): effects clean up before changing inputs and on unmount. `useFetch` aborts each obsolete request and also uses an active flag so a late resolution cannot update the current result; the login page ignores a completion after it unmounts.
- Theme: `Layout` normalizes its stored preference to light or dark and applies a wrapper class. Plain CSS custom properties change backgrounds, surfaces, borders and text across the app; no component library is involved.
- [Vite guide](https://vite.dev/guide/): the project was created with the official React scaffold, uses its development server and builds static production assets with `vite build`.

## Implementation challenges

The main request-lifecycle challenge is that an older product request can resolve after navigating to a new ID. Cleanup aborts the request and marks that invocation inactive, so only the current invocation can dispatch its result; this also handles React StrictMode's development cleanup cycle. Another challenge is storage corruption: persisted state is treated as untrusted input, and an unavailable storage area does not prevent in-memory cart use.

Keeping filter state in the URL avoids a second state source that could disagree with a shared link. Query updates copy existing parameters, while categories and matches are computed directly from the loaded list during render. Cart subscriptions select primitives or stable references so an unrelated title change does not rerender the item-count subscriber.

## Verification

The automated suite covers API status errors and AbortSignals, fixed demo credentials, immutable cart actions and persistence, count selector rerenders, request cancellation and stale responses, corrupted theme storage, filtered deep links, changing route IDs, protected login/logout, theme persistence and unmatched routes. Product responses are mocked for deterministic tests; normal app use fetches the public DummyJSON API directly. Network or API outages are shown as errors rather than replaced by fabricated catalogue data.

Manual review checklist:

1. Open `/products?category=beauty&q=mascara`, reload, and verify both controls retain their values.
2. Add the same product twice; check the badge, sign in, and change quantity or remove it.
3. Reload; sign in again and verify the saved cart remains.
4. Toggle dark mode and reload; check the saved theme.
5. Visit `/products/999999` and an unmatched path to compare API and routing errors.
6. Check the layout at a narrow viewport and use Tab to navigate controls.

## Development history

Changes are recorded as separate feature commits. Commit dates use the actual system clock, with real waits between commits; timestamps are not rewritten. AI assistance was used for implementation, documentation and verification. Review the reasoning answers and understand the code before submission.
