// 180 BPM = 180 beats per minute = 3 beats per second
// Interval = 60 seconds / 180 beats = 0.333... seconds = 1000/3 milliseconds
const BPM = 180;
const INTERVAL_MS = (60 / BPM) * 1000; // Approximately 333.33 ms

const audioFileInput = document.getElementById('audioFile');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const fileName = document.getElementById('fileName');
const status = document.getElementById('status');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');

let isPlaying = false;
let repeatInterval = null;
let currentObjectUrl = null;

const DEFAULT_AUDIO_URL = 'assets/kick.wav';
const DEFAULT_AUDIO_NAME = 'kick.wav';

function setAudioSource({ url, name, isBlob }) {
    // Stop any playback when switching sources
    if (isPlaying) pause();

    // Revoke the previous blob URL (if any)
    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
    }

    audioPlayer.src = url;
    fileName.textContent = name;
    playPauseBtn.disabled = false;
    status.textContent = 'File loaded. Click play to start.';

    if (isBlob) currentObjectUrl = url;

    // Update Media Session metadata (if supported)
    if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: name,
            artist: 'TempoMaxxer'
        });
    }
}

// Load default kick on startup
setAudioSource({ url: DEFAULT_AUDIO_URL, name: DEFAULT_AUDIO_NAME, isBlob: false });

// If the default file fails to load (e.g. wrong path), show a helpful status
audioPlayer.addEventListener('error', () => {
    // If user selected a file manually, don't override their status.
    if (fileName.textContent === DEFAULT_AUDIO_NAME) {
        playPauseBtn.disabled = true;
        status.textContent = `Couldn't load default audio at ${DEFAULT_AUDIO_URL}. Please choose a file.`;
        fileName.textContent = 'No file selected';
        audioPlayer.src = '';
    }
});

// Handle file selection
audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        setAudioSource({ url, name: file.name, isBlob: true });
    }
});

// Handle play/pause
playPauseBtn.addEventListener('click', () => {
    if (!audioPlayer.src) {
        status.textContent = 'Please select an audio file first.';
        return;
    }

    if (isPlaying) {
        pause();
    } else {
        play();
    }
});

function play() {
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'inline';
    status.textContent = 'Playing at 180 BPM...';
    
    // Update Media Session playback state
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
    }
    
    // Play immediately
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(err => {
        console.error('Error playing audio:', err);
        status.textContent = 'Error playing audio.';
        pause();
    });
    
    // Set up interval to repeat
    repeatInterval = setInterval(() => {
        if (isPlaying) {
            audioPlayer.currentTime = 0;
            audioPlayer.play().catch(err => {
                console.error('Error playing audio:', err);
            });
        }
    }, INTERVAL_MS);
}

function pause() {
    isPlaying = false;
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
    status.textContent = 'Paused';
    
    // Update Media Session playback state
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
    
    if (repeatInterval) {
        clearInterval(repeatInterval);
        repeatInterval = null;
    }
    
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}

// Clean up when audio ends (shouldn't happen due to interval, but just in case)
audioPlayer.addEventListener('ended', () => {
    // The interval will handle replaying, so we don't need to do anything here
});

// Media Session API for better background playback support
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => {
        if (!isPlaying && audioPlayer.src) {
            play();
        }
    });
    
    navigator.mediaSession.setActionHandler('pause', () => {
        if (isPlaying) {
            pause();
        }
    });
}

// Keep audio playing in background (works on some mobile browsers)
audioPlayer.setAttribute('playsinline', 'true');
audioPlayer.setAttribute('webkit-playsinline', 'true');

// Clean up blob URLs when page unloads
window.addEventListener('beforeunload', () => {
    if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
});
