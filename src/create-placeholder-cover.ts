import { stat, copyFile } from 'fs/promises';
import { join } from 'path';
import * as gm from 'gm';

async function screenshotResponse(id: number) {
  let response = await fetch('https://store.steampowered.com/api/appdetails?appids=' + id);
  let data = await response.json() as SteamAppDetailsResponse;

  return data[id].success ? data[id].data.screenshots[2].path_full : null;
}

const fontPacked = join(__dirname, "assets", "cover-font.ttf");
function createPlaceholderCover(app: SteamGame, gridDir: string) {
  return new Promise<boolean>(async resolve => {
    const font = gridDir + 'cover-font.ttf';
    if (!await stat(gridDir + 'cover-font.ttf').then(x => x.isFile()).catch(() => false)) await copyFile(fontPacked, font);
    const link = await screenshotResponse(app.appid) || 'https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/yRF5c-O/abstract-motion-background-blue-cyan-purple-4k-and-full-hd_nyw56exgg__F0000.png';
    try {
      const request = await fetch(link);
      const image = Buffer.from(await request.arrayBuffer());
      const gmi = gm(image).identify((err, data) => {
        if (err) {
          logProgressError(`Unable to find GraphicsMagick install to create a cover for ${app.name} (${err.message})`);
          logProgressError('Make sure to install it from the link above.');
        } else {
          let titleName = app.name;
          let lineLength = 0;
          let lineCount = 1;
          for (let i = 0; i < app.name.length; i++) {
            if (lineLength >= 8) {
              titleName = titleName.substring(0, i - 12) + titleName.substring(i - 12).replace(' ', '\n');
              lineLength -= 8;
              lineCount++;
            }
            lineLength++;
          }
          gmi
            .crop((data.size.height / 9) * 6, data.size.height, data.size.width / 2 - 80, 0)
            .resize(160, 240)
            .repage('+')
            .contrast(-2)
            .filter('Blackman')
            .modulate(80, 80)
            .stroke('rgba(255,255,255,0.5)', 1)
            .stroke('none')
            .region(150, Math.floor(40 * Math.sqrt(lineCount)), 5, 10)
            .gravity('Center')
            .font(font)
            .fontSize(Math.max(10, Math.ceil(90 / app.name.replace(' ', '').replace('i', '').length)))
            .fill('white')
            .drawText(0, 0, titleName)
            .write(gridDir + app.appid + 'p.' + data.format, err => { // Attempting to write as .png results in a cut off image when input is .jpeg
              if (err) {
                logProgressError(err.message);
                resolve(false);
              } else {
                logProgress('Created new cover for: ' + app.name);
                resolve(true);
              }
            });
        }
      });
    } catch (err) {
      logProgressError(`Unable to get Cover: ${app.name} (${err})`);
      resolve(false);
    }
  });
}
