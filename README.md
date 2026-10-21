# Little Lens

A camera booth with optional, explicit photo sharing to the site owner's Discord channel. Camera access never sends a photo. After capturing and reviewing a photo, the visitor must check the sharing consent box and click **Send photo to Discord**. Photos are relayed in memory; the app does not save them on the server. Discord and channel members may retain copies. Local deletion does not delete a sent Discord message.

## Run

Requires Python 3.12+; no packages to install:

```sh
python3 server.py --bind 127.0.0.1 --port 8000
```

Configure `DISCORD_WEBHOOK_URL` securely in the backend host's environment/secret settings using a newly rotated webhook URL. Never put it in browser JavaScript, Git, or a public configuration file. The server accepts only `https://discord.com/api/webhooks/<id>/<token>` URLs. Without it, local capture/download still work and sharing returns an explicit configuration error.

For deployment, run behind an HTTPS reverse proxy with request size/time limits and abuse protection. Keep the backend on a private interface; configure the proxy to preserve the public Host header so same-origin checks work. Allow outbound HTTPS to discord.com. Camera access requires HTTPS except on localhost. This minimal server is intended for small deployments; public hosting should add authentication or other access controls, durable rate limits, and normal operational monitoring. The app has an in-memory 30-second per-peer throttle; behind a reverse proxy peers may share that limit.

GitHub Pages serves static files only and cannot run `server.py` or hold the webhook securely. Deploy the site and backend together on a Python-capable host. Do not expose a cross-origin open relay.

The server serves only the HTML, CSS, and JavaScript files, limits photo uploads to 8 MiB, requires same-origin requests with an explicit consent header, keeps TLS verification on, and does not follow upstream redirects. These controls do not authenticate visitors; restrict public access as appropriate for the channel.

## Validation

Run backend tests with `python3 -m unittest discover -s tests -v` and check browser code with `node --check app.js`. Backend tests mock Discord; they do not transmit photos. Actual delivery requires a configured replacement webhook and a separate end-to-end check with an intentionally shared test photo.
