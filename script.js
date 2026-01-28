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

// Handle file selection
audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = file.name;
        const url = URL.createObjectURL(file);
        audioPlayer.src = url;
        playPauseBtn.disabled = false;
        status.textContent = 'File loaded. Click play to start.';
        
        // Clean up previous URL if exists
        audioPlayer.addEventListener('loadeddata', () => {
            if (audioPlayer.src && audioPlayer.src.startsWith('blob:')) {
                // URL will be cleaned up when audio is loaded
            }
        });
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
    
    // Update metadata when file is loaded
    audioFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && 'mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: file.name,
                artist: '180 BPM Repeater'
            });
        }
    });
}

// Keep audio playing in background (works on some mobile browsers)
audioPlayer.setAttribute('playsinline', 'true');
audioPlayer.setAttribute('webkit-playsinline', 'true');

// Clean up blob URLs when page unloads
window.addEventListener('beforeunload', () => {
    if (audioPlayer.src && audioPlayer.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioPlayer.src);
    }
});
