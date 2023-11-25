import * as fs from 'fs';
import * as path from 'path';
import * as _request from 'request';

const request = _request.defaults({ encoding: null });
const steamGridAPI = { Authorization: `Bearer ${process.env.GRIDAPI || ''}` };

let gridDir: string;
let STEAMAPIKEY: string;
let STEAMID: string;
let coverMode: string;
let delay = 500;
let progress: HTMLMeterElement;

function writeCovers() {
  if (setInputs()) return;
  fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAMAPIKEY}'&steamid=${STEAMID}'&include_appinfo=true&include_played_free_games=true`)
    .then(response => response.json() as Promise<SteamGetOwnedGamesResult>)
    .then(async data => {
      logProgress('Found ' + data.response.games.length + ' Games on this Steam Account.');
      progress.max = data.response.games.length;
      for (const app of data.response.games.slice(0, 10)) {
        try {
          await sleep(delay);
          await fetch(`https://www.steamgriddb.com/api/v2/grids/steam/${app.appid}?styles=white_logo&dimensions=600x900,342x482`, { headers: steamGridAPI })
            .then(grids => grids.json() as Promise<SGDBGridsResponse>)
            .then(grids => grids.data)
            .then(async grids => {
              if (grids === undefined) logProgressError("It appears that Steamgriddb API is down, so cover can't be fetched. Try running the app again later");
              else if (grids.length === 0 || coverMode === 'animated') {
                await getSteamGridAnimatedCover(app.name, app.appid) || createPlaceholderCover(app, gridDir);
              } else if (!(await getSteamGridStaticCover(app.name, app.appid, grids[0].url, grids[0].author.name))) {
                logProgressError('Error downloading cover from steamgriddb ' + app.name);
              }
            });
        } finally {
          ++progress.value
        }
      }
      logProgress('Finished processing');
      (document.getElementById('start-button') as HTMLButtonElement).disabled = false;
    })
    .catch(err => {
      logProgressError('Error accessing the Steam API');
      logProgressError('Make sure the API Key and SteamID64 are correct!');
      logProgressError('HTTP Error: ' + err);
      (document.getElementById('start-button') as HTMLButtonElement).disabled = false;
    });
}

function setInputs() {
  console.log(gridDir);
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
    var parent = gridDir.slice(0, -5);
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

function getSteamGridAnimatedCover(name: string, appid: number) {
  return new Promise<boolean>(resolve => {
    request(
      `https://github.com/T1lt3d/Steam-Grid-Cover-App/raw/master/cover-images/animated/${appid}p.png`,
      (err, res, image) => {
        if (!(res.statusCode === 404)) {
          fs.writeFileSync(gridDir + appid + 'p.png', image);
          logProgress(`Found Cover ${name} Credit to r/steamgrid community and u/Deytron for compilation`);
          resolve(true);
        } else resolve(false);
      }
    );
  });
}

function getSteamGridStaticCover(name: string, appid: number, url: string, author: string) {
  return new Promise<boolean>(resolve => {
    request(url, (err, res, image) => {
      if (!(res.statusCode === 404)) {
        fs.writeFileSync(gridDir + appid + 'p.png', image);
        logProgress(`Found Cover ${name}  from steamgriddb. Credit to ${author}`);
        resolve(true);
      } else resolve(false);
    });
  });
}

function sleep(time: number) {
  return new Promise<void>(resolve => setTimeout(resolve, time))
}
