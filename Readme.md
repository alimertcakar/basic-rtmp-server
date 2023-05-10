# Basic WebSocket to RTMP Nodejs Server

This is a simple node.js server that accepts a camera stream from WebSocket, then forwards it to a RTMP server with FFMPEG.
This is intended for _debugging_ and testing _purposes_ only.

localcert and localkey are made up, only to be used on localhost.
You still need to use a reverse proxy like ngrok, because browsers wont start a secure websocket connection to localhost.

## Usage

- Replace `<RTML URL HERE>` with your target url
- `node index.js` or `nodemon index.js`
  \*Reverse proxy for enabling localhost wss in your browser `ngrok http https://localhost:6000 `
