"""Static camera site and opt-in Discord relay. Python 3.12+, no dependencies."""
import argparse
import json
import os
from pathlib import Path
import re
import secrets
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

ROOT = Path(__file__).resolve().parent
MAX_PHOTO = 8 * 1024 * 1024
PUBLIC = {'/': ('index.html', 'text/html; charset=utf-8'), '/index.html': ('index.html', 'text/html; charset=utf-8'), '/styles.css': ('styles.css', 'text/css; charset=utf-8'), '/app.js': ('app.js', 'text/javascript; charset=utf-8')}

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def webhook_url():
    url = os.environ.get('DISCORD_WEBHOOK_URL', '')
    if not re.fullmatch(r'https://discord\.com/api/webhooks/[0-9]+/[A-Za-z0-9_-]+', url):
        return None
    return url


def send_photo(photo):
    boundary = 'LittleLens' + secrets.token_hex(16)
    metadata = json.dumps({'content': 'Photo shared with explicit visitor consent.', 'allowed_mentions': {'parse': []}}).encode()
    body = (f'--{boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\nContent-Type: application/json\r\n\r\n'.encode() + metadata +
            f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="files[0]"; filename="photo.png"\r\nContent-Type: image/png\r\n\r\n'.encode() + photo + f'\r\n--{boundary}--\r\n'.encode())
    request = Request(webhook_url() + '?wait=true', data=body, headers={'Content-Type': f'multipart/form-data; boundary={boundary}', 'User-Agent': 'LittleLens/1.0'}, method='POST')
    # Retain normal proxy configuration and TLS verification. Never follow redirects with photos.
    with build_opener(NoRedirect()).open(request, timeout=20) as response:
        if response.status != 200:
            raise OSError('Unconfirmed delivery')


class Handler(BaseHTTPRequestHandler):
    recent = {}
    rate_lock = threading.Lock()

    def reply(self, code, payload):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Connection', 'close')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        target = PUBLIC.get(urlsplit(self.path).path)
        if not target:
            self.reply(404, {'error': 'Not found'})
            return
        filename, mime = target
        body = (ROOT / filename).read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Permissions-Policy', 'camera=(self), microphone=()')
        self.send_header('Content-Security-Policy', "default-src 'self'; img-src 'self' blob:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != '/api/share-photo':
            self.reply(404, {'error': 'Not found'})
            return
        origin = urlsplit(self.headers.get('Origin', ''))
        if (self.headers.get('X-Photo-Consent') != 'send-to-discord' or
                origin.scheme not in ('http', 'https') or origin.netloc != self.headers.get('Host') or
                self.headers.get('Sec-Fetch-Site') not in (None, 'same-origin') or
                self.headers.get('Content-Type') != 'image/png'):
            self.reply(403, {'error': 'Same-origin consent required'})
            return
        if not webhook_url():
            self.reply(503, {'error': 'Sharing not configured'})
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
        except ValueError:
            length = 0
        if not 8 < length <= MAX_PHOTO:
            self.reply(413, {'error': 'Invalid photo size'})
            return
        now = time.monotonic()
        with self.rate_lock:
            self.recent = {ip: at for ip, at in self.recent.items() if now - at < 30}
            type(self).recent = self.recent
            if self.client_address[0] in self.recent:
                self.reply(429, {'error': 'Please wait'})
                return
            self.recent[self.client_address[0]] = now
        self.connection.settimeout(15)
        try:
            photo = self.rfile.read(length)
            if len(photo) != length or not photo.startswith(b'\x89PNG\r\n\x1a\n'):
                self.reply(400, {'error': 'Expected PNG photo'})
                return
            send_photo(photo)
        except HTTPError as error:
            self.reply(429 if error.code == 429 else 502, {'error': 'Delivery not confirmed'})
            return
        except (URLError, OSError, TimeoutError):
            self.reply(502, {'error': 'Delivery not confirmed'})
            return
        self.reply(200, {'sent': True})

    def log_message(self, format, *args):
        # Do not log request bodies, webhook URLs, or upstream exception text.
        pass


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--bind', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    print(f'Little Lens starting on port {args.port}. Sharing configured: {bool(webhook_url())}', flush=True)
    ThreadingHTTPServer((args.bind, args.port), Handler).serve_forever()
