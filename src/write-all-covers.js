const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const request = require('request').defaults({ encoding: null });
const SGDB = require('steamgriddb');

const steamGridAPI = { Authorization: 'Bearer XXXXXXXXXXXXXXXXX' };

var gridDir;
var STEAMAPIKEY;
var STEAMID;
var coverMode;

fetch(
  'https://www.steamgriddb.com/api/v2/grids/steam/400?styles=white_logo&dimensions=600x900&342x482',
  {
    headers: steamGridAPI
  }
).then(res => console.log(res.json()));

function writeCovers() {
  if (downloadFont()) return;
  if (setInputs()) return;
  fetch(
    'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=' +
      STEAMAPIKEY +
      '&steamid=' +
      STEAMID +
      '&include_appinfo=true&include_played_free_games=true'
  )
    .then(response => response.json())
    .then(data => {
      console.info('Found ', data.response.games.length, ' Games on this Steam Account.');
      const delay = 500;
      var pause = 0;
      data.response.games.forEach(app => {
        setTimeout(() => {
          fetch(
            'https://www.steamgriddb.com/api/v2/grids/steam/' +
              app.appid +
              '?styles=white_logo&dimensions=600x900,342x482',
            { headers: steamGridAPI }
          )
            .then(grids => grids.json())
            .then(grids => grids.data)
            .then(grids => {
              console.log(grids);
              if (grids.length === 0 || coverMode === 'animated') {
                request(
                  'https://github.com/T1lt3d/Steam-Grid-Cover-App/raw/master/cover-images/animated/' +
                    app.appid +
                    'p.png',
                  (err, res, image) => {
                    if (!(res.statusCode === 404)) {
                      fs.writeFileSync(gridDir + app.appid + 'p.png', image);
                      logProgress(
                        'Found Cover ' +
                          app.name +
                          ' Credit to r/steamgrid community and u/Deytron for compilation'
                      );
                    } else {
                      request(
                        'https://github.com/T1lt3d/Steam-Grid-Cover-Finder/raw/master/cover-images/kennett-ny/' +
                          app.appid +
                          'p.png',
                        (err, res, image) => {
                          if (!(res.statusCode === 404)) {
                            fs.writeFileSync(gridDir + app.appid + 'p.png', image);
                            logProgress(
                              'Found Cover ' +
                                app.name +
                                ' Credit to r/steamgrid community and u/kennett-ny'
                            );
                          } else {
                            request(
                              'https://raw.githubusercontent.com/babgozd/camporter96-custom/master/grid/' +
                                app.appid +
                                'p.png',
                              (err, res, image) => {
                                if (!(res.statusCode === 404)) {
                                  logProgress(
                                    'Found Cover ' + app.name + '. Credit to u/camporter'
                                  );
                                  fs.writeFileSync(gridDir + app.appid + 'p.png', image);
                                } else {
                                  createPlaceholderCover(app);
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                request(grids[0].url, (err, res, image) => {
                  if (!(res.statusCode === 404)) {
                    fs.writeFileSync(gridDir + app.appid + 'p.png', image);
                    logProgress(
                      'Found Cover ' +
                        app.name +
                        ' from steamgriddb. Credit to ' +
                        grids[0].author.name
                    );
                  } else {
                    logProgressError('Error downloading cover from steamgriddb ' + app.name);
                  }
                });
              }
            });
        }, pause);
        pause += delay;
      });
    })
    .catch(err => {
      logProgressError('Error accessing the Steam API');
      logProgressError('Make sure the API Key and SteamID64 are correct!');
      logProgressError('HTTP Error: ' + err);
      document.getElementById('start-button').disabled = false;
    });
}

function setInputs() {
  console.log(gridDir);
  var gridDirInput = (
    document.getElementById('grid-dir').value.replace(/\\/g, '\\') + '\\config\\grid\\'
  ).trim();
  var STEAMIDInput = document.getElementById('steam-ID').value.trim();
  var STEAMAPIInput = document.getElementById('steam-APIKEY').value.trim();
  var error = false;
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
    logProgressError('That userdata directory does not exist. Make sure the path is correct.');
    error = true;
  }
  coverMode =
    document.getElementById('cover-mode').value === 'animated' ? 'animated' : 'white-logo';
  if (!error) document.getElementById('start-button').disabled = true;
  return error;
}

function downloadFont() {
  var error = false;
  request(
    'https://github.com/T1lt3d/Steam-Grid-Cover-Finder/blob/master/assets/cover-font.ttf?raw=true',
    (err, res, font) => {
      if (err) {
        logProgressError('Failed to download font for covers');
        error = true;
      } else {
        logProgress('Downloaded font successfully');
        fs.writeFileSync(gridDir + 'cover-font.ttf', font);
      }
    }
  );
  return error;
}
