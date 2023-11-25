import { writeFileSync } from 'fs';
declare const request: typeof import('request');

async function screenshotResponse(id: number) {
  let response = await fetch('https://store.steampowered.com/api/appdetails?appids=' + id);
  let data = await response.json();

  if (data && data[id].data) return data[id].data.screenshots[2].path_full;
}

function createPlaceholderCover(app: SteamGame, gridDir: string) {
  return new Promise<boolean>(async resolve => {
    //logProgressError('Creating Placeholder Cover: ', app.name);
    const link = await screenshotResponse(app.appid) || 'https://d2v9y0dukr6mq2.cloudfront.net/video/thumbnail/yRF5c-O/abstract-motion-background-blue-cyan-purple-4k-and-full-hd_nyw56exgg__F0000.png';
    request(link, async (err: unknown, res: unknown, image: unknown) => {
      if (err) logProgressError('Unable to get Cover: ' + app.name);
      else {
        const gm = await import('gm');
        writeFileSync(gridDir + app.appid + 'p.png', image);
        gm(gridDir + app.appid + 'p.png').identify((err, data) => {
          if (err) {
            logProgressError('Unable to find GraphicsMagick install to create a cover for ' + app.name);
            logProgressError('Make sure to install it from the link above.');
            console.log(err);
          } else {
            var titleName = app.name;
            var lineLength = 0;
            var lineCount = 1;
            for (let i = 0; i < app.name.length; i++) {
              if (lineLength >= 8) {
                titleName =
                  titleName.substring(0, i - 12) + titleName.substring(i - 12).replace(' ', '\n');
                lineLength = lineLength - 8;
                lineCount++;
              }
              lineLength++;
            }
            gm(gridDir + app.appid + 'p.png')
              .crop((data.size.height / 9) * 6, data.size.height, data.size.width / 2 - 80, 0)
              .resize(160, 240)
              .contrast(-2)
              .filter('Blackman')
              .modulate(80, 80)
              .stroke('rgba(255,255,255,0.5)', 1)
              .stroke('none')
              .region(150, 40 * Math.sqrt(lineCount), 5, 10)
              .gravity('Center')
              .font(gridDir + 'cover-font.ttf', 12)
              .fontSize(
                90 / app.name.replace(' ', '').replace('i', '').length > 10
                  ? 90 / app.name.replace(' ', '').replace('i', '').length
                  : 10
              )
              .fill('white')
              .drawText(0, 0, titleName)
              .write(gridDir + app.appid + 'p.png', err => {
                if (err) logProgressError(err.message);
              });
          }
          if (err) {
            logProgressError('Error writing to the grid folder');
          }
        });
        logProgress('Created new cover for: ' + app.name);
        resolve(!!err);
      }
    })
  });
}
