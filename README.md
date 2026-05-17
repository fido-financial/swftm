# SWFTM

Static SWFTM site for GitHub Pages. It creates Fido Escape Plan intents directly through the Fido API, then redirects users to Fido signup/login.

GitHub Pages requires this repository to be public unless the organization plan supports Pages for private repositories.

## Local

```sh
npm run dev
```

For GitHub Pages production, update `config.js` if the Fido API domain changes. The current production endpoint is the Fido production App API router:

```txt
https://fidofinancial.ai/escape-plan
```

For local testing against a non-production Fido API, override the browser config in the console:

```js
localStorage.setItem("SWFTM_ESCAPE_PLAN_API_URL", "https://d2mhoq8tw0jw4q.cloudfront.net/escape-plan")
```

The SWFTM page does not call an LLM directly. It saves intake data, redirects the user to Fido signup/login, and Fido generates the PDF after the authenticated user creates or selects their business.
