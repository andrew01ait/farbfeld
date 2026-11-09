# Local QR libraries

All runtime files are served locally. No CDN, dynamic fetch, worker, or network dependency is used by these libraries.

- `qrcode.js`: **qrcode-generator 2.0.4**, Kazuhiko Arase, MIT. This is the unmodified upstream `dist/qrcode.mjs`, renamed. The previously prepared generator is byte-identical. `qrcode-LICENSE.txt` contains the MIT license. Source: https://github.com/kazuhikoarase/qrcode-generator
- `jsqr.js`: **jsQR 1.4.0**, Apache-2.0. The upstream `dist/jsQR.js` UMD bundle is unchanged between a small ES-module adapter prefix and suffix. `jsqr-LICENSE.txt` contains the Apache license. Source: https://github.com/cozmo/jsQR
- `PROVENANCE.json` records exact npm tarball URLs, SHA-512 integrity and file SHA-256 hashes. Both tarballs were checked against the npm registry integrity before extracting.

Usage:

```js
import qrcode from './vendor/qrcode.js';
import jsQR from './vendor/jsqr.js';
const qr = qrcode(0, 'M'); // automatic QR version
qr.addData(asciiHandshakeText);
qr.make();
// Render the matrix with qr.getModuleCount() and qr.isDark(row, column),
// preserving a white quiet zone of at least four modules.
const svg = qr.createSvgTag({cellSize: 4, margin: 16, scalable: true});
const result = jsQR(rgbaPixels, width, height, {inversionAttempts: 'dontInvert'});
if (result) console.log(result.data);
```

The generator's default byte converter is byte-oriented. Farbfeld handshakes should therefore use ASCII framing/base64; do not feed unencoded Unicode names directly into this generator.
