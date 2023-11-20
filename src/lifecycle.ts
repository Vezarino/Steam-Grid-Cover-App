function afterRender() {
    logProgress('Hit start when ready!');
    /** @type HTMLInputElement */(document.getElementById('steam-APIKEY')).value = process.env.STEAMAPI || '';
    /** @type HTMLInputElement */(document.getElementById('steam-ID')).value = process.env.STEAMID || '';
    /** @type HTMLInputElement */(document.getElementById('grid-dir')).value = process.env.GRIDDIR || '';
}
