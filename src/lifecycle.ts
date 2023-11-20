import { env } from 'process';
function afterRender() {
    (document.getElementById('steam-APIKEY') as HTMLInputElement).value = env.STEAMAPI || '';
    (document.getElementById('steam-ID') as HTMLInputElement).value = env.STEAMID || '';
    (document.getElementById('grid-dir') as HTMLInputElement).value = env.GRIDDIR || '';
    logProgress('Hit start when ready!');
}
