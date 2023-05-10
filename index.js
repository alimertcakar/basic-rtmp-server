const fs = require("fs");
const { WebSocketServer } = require("ws");
const child_process = require("child_process");

const https = require("https");

const server = https.createServer({
  cert: fs.readFileSync("localcert.cert"),
  key: fs.readFileSync("localkey.key"),
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  console.log("On connection");
  ws.send("Server hello");
  const rtmpUrl = "<RTML URL HERE>";

  const codecs = ["-vcodec", "libx264", "-acodec", "libmp3lame"];
  const videoPrms = [
    "-preset",
    "veryfast",
    // frame rate
    "-r",
    "30",
    "-g",
    // group of picture (frame rate * 2)
    "60",
    // video bitrate
    "-b:v",
    "2500k",
  ];
  const audioPrms = [
    // audio bitrate
    "-b:a",
    "64k",
    // audio samplerate
    "-ar",
    "44100",
    // audio channels
    "-ac",
    "2",
  ];

  const ffmpeg = child_process.spawn("ffmpeg", [
    "-i",
    "-",
    "pipe:0",
    // used for audio sync
    "-use_wallclock_as_timestamps",
    "1",
    "-async",
    "1",
    ...codecs,
    ...videoPrms,
    ...audioPrms,
    "-threads",
    "0", // use all threads
    // buffer size
    "-bufsize",
    "512",
    // format
    "-f",
    "flv",
    rtmpUrl,
  ]);

  ffmpeg.on("close", (code, signal) => {
    console.log(
      "FFmpeg child process DIED!, code " + code + ", signal " + signal
    );
    ws.terminate();
  });

  ffmpeg.stdin.on("error", (e) => {
    console.log("FFmpeg STDIN Error", e);
  });

  ffmpeg.stderr.on("data", (data) => {
    console.log("FFmpeg STDERR:", data.toString());
  });

  ws.on("message", (msg) => {
    if (Buffer.isBuffer(msg)) {
      console.log("[StreamData]:" + msg?.slice?.(0, 5));
      ffmpeg.stdin.write(msg);
    } else {
      console.log("Message received:", msg);
    }
  });

  ws.on("close", (e) => {
    console.log("Socket closed");
    ffmpeg.kill("SIGINT");
  });
});

server.listen(6000, () => {
  console.log("Server started listening on port 6000");
});
