import http.client
import os
import sys
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server


class RelayTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.httpd = server.ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
        cls.port = cls.httpd.server_port
        cls.worker = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.worker.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.worker.join()

    def setUp(self):
        server.Handler.recent = {}

    def request(self, method='POST', path='/api/share-photo', body=b'\x89PNG\r\n\x1a\nphoto', **changes):
        headers = {'Origin': f'http://127.0.0.1:{self.port}', 'Content-Type': 'image/png', 'X-Photo-Consent': 'send-to-discord', **changes}
        connection = http.client.HTTPConnection('127.0.0.1', self.port, timeout=5)
        connection.request(method, path, body=body, headers=headers)
        response = connection.getresponse()
        result = response.status, response.read()
        connection.close()
        return result

    def test_no_webhook_returns_configuration_error(self):
        with patch.dict(os.environ, {'DISCORD_WEBHOOK_URL': ''}), patch.object(server, 'send_photo') as relay:
            self.assertEqual(self.request()[0], 503)
            relay.assert_not_called()

    def test_consent_origin_and_file_validation(self):
        with patch.object(server, 'webhook_url', return_value='configured'), patch.object(server, 'send_photo') as relay:
            self.assertEqual(self.request(**{'X-Photo-Consent': ''})[0], 403)
            self.assertEqual(self.request(Origin='https://other.example')[0], 403)
            self.assertEqual(self.request(body=b'not-a-real-png')[0], 400)
            relay.assert_not_called()

    def test_send_and_rate_limit(self):
        with patch.object(server, 'webhook_url', return_value='configured'), patch.object(server, 'send_photo') as relay:
            self.assertEqual(self.request()[0], 200)
            relay.assert_called_once_with(b'\x89PNG\r\n\x1a\nphoto')
            self.assertEqual(self.request()[0], 429)
            relay.assert_called_once()

    def test_upstream_failure_not_reported_as_success(self):
        with patch.object(server, 'webhook_url', return_value='configured'), patch.object(server, 'send_photo', side_effect=OSError('private upstream detail')):
            code, body = self.request()
            self.assertEqual(code, 502)
            self.assertNotIn(b'private', body)

    def test_private_files_not_served(self):
        for path in ['/server.py', '/.git/config', '/.env', '/tests/test_server.py']:
            self.assertEqual(self.request('GET', path, body=None)[0], 404)
        self.assertEqual(self.request('GET', '/', body=None)[0], 200)

    def test_relay_multipart_without_network(self):
        class Response:
            status = 200
            def __enter__(self): return self
            def __exit__(self, *args): return False
        with patch.object(server, 'webhook_url', return_value='https://discord.com/api/webhooks/123/test'), patch.object(server, 'build_opener') as opener:
            opener.return_value.open.return_value = Response()
            server.send_photo(b'photo bytes')
            request = opener.return_value.open.call_args.args[0]
            self.assertEqual(request.full_url, 'https://discord.com/api/webhooks/123/test?wait=true')
            self.assertIn(b'name="files[0]"', request.data)
            self.assertIn(b'photo bytes', request.data)
            self.assertIn(b'explicit visitor consent', request.data)


if __name__ == '__main__':
    unittest.main()
