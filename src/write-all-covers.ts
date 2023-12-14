import * as fs from 'fs';
import * as path from 'path';

const steamGridAPI = { Authorization: `Bearer ${process.env.GRIDAPI || ''}` };

let gridDir: string;
let STEAMAPIKEY: string;
let STEAMID: string;
let coverMode: string;
let delay = 500;
let progress: HTMLMeterElement;

async function writeCovers() {
  if (setInputs()) return;
  try {
    const response = await getSteamOwnedGames();

    logProgress('Found ' + response.games.length + ' Games on this Steam Account.');
    progress.max = response.games.length;
    const isAnimated = coverMode === 'animated';
    for (const app of response.games) {
      try {
        await sleep(delay);
        const grids = await listSteamGridCoversForSteamApp(app.appid, isAnimated);
        // Fall back from animated to static, but not the other way around
        const grid = grids[0] ?? (isAnimated ? (await listSteamGridCoversForSteamApp(app.appid, false))?.[0] : undefined);
        const result = grid && await getSteamGridCover(app.name, app.appid, grid.url, grid.author.name);
        if (!result) {
          logProgressError(`Error downloading cover from steamgriddb ${app.name}, creating placeholder`);
          await createPlaceholderCover(app, gridDir);
        }
      } catch (err) {
        logProgressError(`Failed to download cover for ${app.name}: ${err}`);
      } finally {
        ++progress.value;
      }
    }
    logProgress('Finished processing');
  } catch (err) {
    logProgressError('Error accessing the Steam API');
    logProgressError('Make sure the API Key and SteamID64 are correct!');
    logProgressError('HTTP Error: ' + err);
  } finally {
    (document.getElementById('start-button') as HTMLButtonElement).disabled = false;
  }
}

function getSteamOwnedGames() {
  return fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAMAPIKEY}&steamid=${STEAMID}&include_appinfo=true&include_played_free_games=true`)
    .then(response => response.json() as Promise<SteamGetOwnedGamesResult>)
    .then(data => data.response)
}

function setInputs() {
  const gridDirInput = path.join((document.getElementById('grid-dir') as HTMLInputElement).value.replace(/\\/g, '\\'), 'config', 'grid', '/');
  const STEAMIDInput = (document.getElementById('steam-ID') as HTMLInputElement).value.trim();
  const STEAMAPIInput = (document.getElementById('steam-APIKEY') as HTMLInputElement).value.trim();
  let error = false;
  if (gridDirInput != '') gridDir = gridDirInput;
  else {
    logProgressError('No input for userdata folder path');
    error = true;
  }
  if (STEAMIDInput != '') STEAMID = STEAMIDInput;
  else {
    logProgressError('No input for SteamID64');
    error = true;
  }
  if (STEAMAPIInput != '') STEAMAPIKEY = STEAMAPIInput;
  else {
    logProgressError('No input for Steam API key');
    error = true;
  }
  if (!fs.existsSync(gridDir)) {
    // Check if user directory exists, but doesn't contain the 'grid' directory
    const parent = gridDir.slice(0, -5);
    if (fs.existsSync(parent)) {
      try {
        fs.mkdirSync(gridDir);
        logProgress('Specified userdata directory missing grid subdirectory - created.');
      } catch (e) {
        logProgressError(
          'Specified userdata directory missing grid subdirectory - failed to create.'
        );
        error = true;
      }
    } else {
      logProgressError('That userdata directory does not exist. Make sure the path is correct.');
      error = true;
    }
  }
  coverMode = (document.getElementById('cover-mode') as HTMLInputElement).value === 'animated' ? 'animated' : 'white-logo';
  delay = (document.getElementById('delay') as HTMLInputElement).valueAsNumber;
  progress = document.getElementById('progress-bar') as HTMLMeterElement;
  if (!error) (document.getElementById('start-button') as HTMLButtonElement).disabled = true;
  return error;
}

async function listSteamGridCoversForSteamApp(id: number, animated: boolean) {
  const url = `https://www.steamgriddb.com/api/v2/grids/steam/${id}?styles=white_logo&dimensions=600x900,342x482`;
  return fetch(animated ? url + '&types=animated' : url, { headers: steamGridAPI })
    .then(grids => grids.json() as Promise<SGDBGridsResponse>)
    .then(grids => grids.data)
}

async function getSteamGridCover(name: string, appid: number, url: string, author: string) {
  const request = await fetch(url);
  if (request.status !== 404 && request.body) {
    // Using streams fails with a type error
    fs.writeFileSync(gridDir + appid + 'p.png', Buffer.from(await request.arrayBuffer()));
    logProgress(`Found Cover ${name}  from steamgriddb. Credit to ${author}`);
    return true;
  } else {
    return false;
  }
}

function sleep(time: number) {
  return new Promise<void>(resolve => setTimeout(resolve, time))
}
