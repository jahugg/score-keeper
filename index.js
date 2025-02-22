document.addEventListener('DOMContentLoaded', () => {

    const defaultPlayerCount = 2;
    const colorHues = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < defaultPlayerCount; i++) {
        addPlayer(`Player ${alphabet[i]}`, colorHues[i]);
    }

    // Request wake lock
    requestWakeLock();
});

function addPlayer(placeholderName, colorHue) {
    const player = document.createElement('player-component');
    player.setAttribute('data-color-hue', colorHue);
    player.setAttribute('data-placeholder-name', placeholderName);

    const playersEl = document.querySelector('.players');
    playersEl.appendChild(player);
}

async function requestWakeLock() {
    try {
        const wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake lock is active');

        wakeLock.addEventListener('release', () => {
            console.log('Wake lock was released');
        });
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}
