document.addEventListener('DOMContentLoaded', () => {

    const defaultPlayerCount = 2;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < defaultPlayerCount; i++) {
        addPlayer(`Player ${alphabet[i]}`);
    }

    // Request wake lock to prevent screen sleeping
    requestWakeLock();
});

function addPlayer(placeholderName) {
    const player = document.createElement('player-component');
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
