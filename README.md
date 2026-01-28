# 180 BPM Repeater

A simple web application that allows you to upload a short sound file and play it repeatedly at 180 beats per minute (BPM) until paused.

## Features

- Upload any audio file (MP3, WAV, OGG, etc.)
- Automatic playback at exactly 180 BPM
- Play/Pause controls
- Clean, modern interface
- Media Session API support for better mobile experience

## Usage

1. Open `index.html` in a web browser
2. Click "Choose Audio File" to select your audio file
3. Click the play button (▶) to start playback
4. The sound will repeat at 180 BPM indefinitely
5. Click the pause button (⏸) to stop

## How It Works

180 BPM means 180 beats per minute, which equals:
- 3 beats per second
- 1 beat every 0.333... seconds (approximately 333.33 milliseconds)

The application plays your audio file and automatically restarts it at this interval to maintain the 180 BPM tempo.

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Audio API
- File API
- ES6 JavaScript
- Media Session API (for enhanced mobile experience)

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling
- `script.js` - Application logic with Media Session API support
- `README.md` - This file

## Note on Background Playback

While the web version includes Media Session API support for better mobile experience, background playback when the screen is locked may not work reliably on all mobile browsers (especially iOS Safari). For guaranteed background playback, consider using a native app solution.
