const el = id => document.getElementById(id);
let stream = null;
let photoURL = null;
let photoBlob = null;
let sending = false;
let requestVersion = 0;
function status(message) { el('status').textContent = message; }
function stopCamera() {
  requestVersion++;
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null;
  el('video').srcObject = null;
  ['video', 'live', 'capture', 'stop'].forEach(id => el(id).hidden = true);
  el('enable').hidden = Boolean(photoURL);
  el('placeholder').hidden = Boolean(photoURL);
}
function deletePhoto() {
  if (photoURL) URL.revokeObjectURL(photoURL);
  photoURL = null;
  photoBlob = null;
  el('sharing').hidden = true;
  el('consent').checked = false;
  el('send').disabled = true;
  el('consent').disabled = false;
  el('shareStatus').textContent = 'Optional. Nothing is sent automatically.';
  el('photo').removeAttribute('src');
  el('download').removeAttribute('href');
  ['photo', 'download', 'retake', 'clear'].forEach(id => el(id).hidden = true);
  el('placeholder').hidden = false;
  el('enable').hidden = false;
}
el('enable').onclick = async () => {
  const version = ++requestVersion;
  el('enable').disabled = true;
  status('Waiting for your camera permission…');
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('UNAVAILABLE');
    const requested = await navigator.mediaDevices.getUserMedia({video: {facingMode:'user'}, audio:false});
    if (version !== requestVersion) { requested.getTracks().forEach(track => track.stop()); return; }
    stream = requested;
    el('video').srcObject = stream;
    el('video').hidden = false;
    await el('video').play();
    if (version !== requestVersion) return;
    ['placeholder', 'enable'].forEach(id => el(id).hidden = true);
    ['live', 'capture', 'stop'].forEach(id => el(id).hidden = false);
    status('Camera is on. Select Take photo when you’re ready.');
  } catch (error) {
    if (version !== requestVersion) return;
    stopCamera();
    const messages = {NotAllowedError:'Camera permission was declined. You can enable it in your browser settings and try again.',NotFoundError:'No camera found. Connect a camera and try again.',NotReadableError:'Your camera is busy or unavailable. Close other camera apps and try again.'};
    status(messages[error.name] || 'Camera unavailable. Use HTTPS or localhost and a browser with camera support.');
  } finally { el('enable').disabled = false; }
};
el('capture').onclick = () => {
  const video = el('video');
  if (!stream || !video.videoWidth) { status('The camera is warming up. Try again in a moment.'); return; }
  const canvas = el('canvas');
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.translate(canvas.width,0); context.scale(-1,1);
  context.drawImage(video,0,0);
  el('capture').disabled = true;
  canvas.toBlob(blob => {
    el('capture').disabled = false;
    if (!blob) { status('Photo could not be created. Please try again.'); return; }
    photoBlob = blob;
    photoURL = URL.createObjectURL(blob);
    el('sharing').hidden = false;
    el('photo').src = photoURL; el('download').href = photoURL;
    stopCamera();
    ['photo','download','retake','clear'].forEach(id => el(id).hidden = false);
    status('Photo captured. Camera is off. Download your photo or delete it.');
    canvas.width = canvas.height = 0;
  },'image/png');
};
el('stop').onclick = () => { stopCamera(); status('Camera is off. Nothing is being recorded.'); };
el('clear').onclick = () => { deletePhoto(); status('Photo deleted from this page. Camera is off.'); };
el('retake').onclick = () => { deletePhoto(); el('enable').click(); };
window.addEventListener('pagehide', () => { stopCamera(); deletePhoto(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && stream) { stopCamera(); status('Camera paused because you left this tab. Enable it to continue.'); } });

el('consent').onchange = () => { el('send').disabled = !el('consent').checked || sending || !photoBlob; };
el('send').onclick = async () => {
  if (!photoBlob || !el('consent').checked || sending) return;
  sending = true;
  ['send', 'consent', 'retake', 'clear'].forEach(id => el(id).disabled = true);
  el('shareStatus').textContent = 'Sending this photo to Discord…';
  try {
    const response = await fetch('api/share-photo', {
      method: 'POST', headers: {'Content-Type': 'image/png', 'X-Photo-Consent': 'send-to-discord'}, body: photoBlob
    });
    if (!response.ok) {
      if (response.status === 503 || response.status === 404 || response.status === 501) throw new Error('Sharing is not configured on this server. You can still download your photo.');
      if (response.status === 413) throw new Error('This photo is too large to send. You can download it instead.');
      if (response.status === 429) throw new Error('Please wait before trying to share again.');
      throw new Error('Discord did not confirm delivery. Please check the channel before retrying to avoid duplicate photos.');
    }
    el('shareStatus').textContent = 'Sent to the site owner’s Discord channel. Deleting the photo here will not remove it from Discord.';
    el('consent').disabled = true;
  } catch (error) {
    el('shareStatus').textContent = error.message === 'Failed to fetch' ? 'Delivery could not be confirmed. Check the channel before retrying.' : error.message;
    el('consent').disabled = false;
  } finally {
    sending = false;
    ['retake', 'clear'].forEach(id => el(id).disabled = false);
    el('send').disabled = el('consent').disabled || !el('consent').checked;
  }
};
