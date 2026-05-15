# SWFTM

Static SWFTM site for GitHub Pages. It creates Fido Escape Plan intents directly through the Fido API, then redirects users to Fido signup/login.

## Local

```sh
npm run dev
```

For GitHub Pages production, update `config.js` if the Fido API domain changes. The default expected production endpoint is:

```txt
https://api.fidofinancial.ai/escape-plan
```

For local testing against a non-production Fido API, override the browser config in the console:

```js
localStorage.setItem("SWFTM_ESCAPE_PLAN_API_URL", "https://d2mhoq8tw0jw4q.cloudfront.net/escape-plan")
```

The SWFTM page does not call an LLM directly. It saves intake data, redirects the user to Fido signup/login, and Fido generates the PDF after the authenticated user creates or selects their business.
