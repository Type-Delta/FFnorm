/**FFnorm
 * Automatic Audio Normalization tool
 * powered by FFmpeg
 * for normalizing large batch of files
 *
 * FFmpeg Commands use:
 * - getting audio loudness
 * > `ffmpeg -hide_banner -i audio.wav -af ebur128=framelog=verbose -f null - 2>&1 | awk "/I:/{print $2}""`
 * - modifying audio Gains
 * > `ffmpeg -hide_banner -y -i input.wav -movflags use_metadata_tags -map_metadata 0 -q:a (QSCALE) -af "volume=(GAIN)dB" -id3v2_version 3 -b:a (BITRATE) -c:v copy ouput.wav`
 * - gettting audio Bitrate
 * > `ffprobe -v error -select_streams a:0 -show_entries stream=bit_rate -of compact=p=0:nk=1 audio.wav`
 *
 *
 * @author TypeDelta
**/

const fs = require('fs');
const { exec } = require('child_process');
const path = require('node:path');
const EventEmitter = require('events');
const {
   proximate,
   fileTypeOf,
   parseArgs,
   ncc,
   nearestNumber,
   strClamp
} = require('./Tools');


const VERSION = '1.0.1a';
const eventEmitter = new EventEmitter();
const ParamTemplate = {
   tagetLUFS: {
      pattern: ['-t', '--target'],
      default: -14.4,
      type: 'float'
   },
   LUFSMaxOffset: {
      pattern: ['-of', '--offset'],
      default: 1.2,
      type: 'float'
   },
   ffmpeg_qscale: {
      pattern: ['-q', '--qscale', '-qscale'], // single dash for somone who came from FFmpeg
      default: 2,
      type: 'int'
   },
   mode_norm: {
      pattern: ['norm', '--norm', '-n'],
      isFlag: true
   },
   mode_scan: {
      pattern: ['scan', '--scan', '-s'],
      isFlag: true
   },
   scanThread: {
      pattern: ['-st', '--scanthread'],
      default: 128,
      type: 'int'
   },
   normThread: {
      pattern: ['-nt', '--normthread'],
      default: 32,
      type: 'int'
   },
   normRatio: {
      pattern: ['-r', '--ratio'],
      default: 0.78,
      type: 'float'
   },
   input: {
      pattern: ['-i', '--input'],
      required: true
   },
   output: {
      pattern: ['-o', '--output', '--out']
   },
   showVersion: {
      pattern: ['-v', '--version'],
      isFlag: true
   }
}


class MediaInfo {
   loudness = null;
   name = null;
   normalize = null;
   bitrate = null;

   constructor(name){
      this.name = name;
   }
};
const r_matchNum = new RegExp("[0-9]+\.[0-9]+|[0-9]+");
const defaultBitrate = 260e3;
const nodeArgs = process.argv.slice(2);
if(!nodeArgs.length||['-h', 'help', '--help'].includes(nodeArgs[0])){
   console.log(`${ncc('magenta')}Usage:
   ${ncc('bgWhite')+ncc('black')}  '-i', '--input'  ${ncc()}
   specify input file/folder

   ${ncc('bgWhite')+ncc('black')}  '-o', '--output'  ${ncc()}
   specify output file/folder
   (if none set will use the last command-line argument as output)

   ${ncc('bgWhite')+ncc('black')}  'norm', '--norm', '-n'  ${ncc()}
   Normalize mode - scan Audio loudness of file/folder contents
   and normalize them according to the Target loudness set by '-t' option.
   (this option requires Output path)

   ${ncc('bgWhite')+ncc('black')}  'scan', '--scan', '-s'  ${ncc()}
   Scan Audio loudness and report them on the terminal.

   ${ncc('bgWhite')+ncc('black')}  '-t', '--target'  ${ncc()}
   Target Loudness in LUFS
   (default to -14.4LUFS, YouTube standard loudness)

   ${ncc('bgWhite')+ncc('black')}  '-of', '--offset'  ${ncc()}
   Max offset fron Target loudness before normalization become active.
   (default to 1.3LUFS)

   ${ncc('bgWhite')+ncc('black')}  '-r', '--ratio'  ${ncc()}
   How much Normalization is apply in percentage, 1.0 is 100%
   lower this value to prevent over-shooting
   (default to 0.78)

   ${ncc('bgWhite')+ncc('black')}  '-st', '--scanthread'  ${ncc()}
   Max number of Threads for loudness scanning
   (default to 128 threads)

   ${ncc('bgWhite')+ncc('black')}  '-nt', '--normthread'  ${ncc()}
   Max number of Threads for audio normalization
   (default to 32 threads)

   ${ncc('bgWhite')+ncc('black')}  '-v', '--version'  ${ncc()}
   prints program version and exit.

   ${ncc('bgWhite')+ncc('black')}  '-h', '--help', 'help'  ${ncc()}
   display this message.
`);
   return;
}

if(ParamTemplate.showVersion.pattern.includes(nodeArgs[0])){
   console.log(
      `${ncc('magenta')+ncc('Bright')}FFnorm\n${ncc()}Version: ${VERSION}\n\nfor usages: \`ffnorm -h\``
   );
   return;
}

const args = parseArgs(nodeArgs, ParamTemplate);
if(!args.output) args.output = nodeArgs.at(-1);

let lastPrint = (new Date).getTime() - 251;
const stats = {
   spd: null,
   tracker: 0,
   operatedCount: 0,
   firstPrint: true,
   lastCheck: (new Date).getTime() - 1001,
   reset(){
      this.spd = null;
      this.tracker = this.operatedCount = 0;
      this.firstPrint = true;
   }
}
let operation = null;
let scTotal, nrTotal;
let outputIsFile = false;

/**a realy weak type checking but it
 * should be fine for this application?
 * @param {string}n */
const isSupportedFile = (n) => {
   return fileTypeOf(n) == 'media'
}








if(!fs.existsSync(args.input))
      throw new Error('input path doesn\'t exist. typed something wrong?');

if(args.mode_scan){
   if(args.mode_norm)
      console.log(`${ncc('yellow')}Both Mode are selected, automatically choose ${ncc('magenta')}Scan${ncc()}`);
   if(fileTypeOf(args.input) == 'media')
      outputIsFile = true;

   scanMode();
}else{
   if(!args.mode_norm)
      console.log(`${ncc('yellow')}No Mode selected, default to ${ncc('magenta')}Normalize${ncc()}`);
   if(!args.output)
      throw new Error('output file/folder is required for this mode!');
   if(path.normalize(args.input) == path.normalize(args.output))
      throw new Error('input folder can\'t be the same output!\nplease change output file/folder location.');
   if(fileTypeOf(args.output) == 'media'){
      if(fileTypeOf(args.input) != 'media')
         throw new Error('input path must be a File if output path is a File');
      outputIsFile = true;
   }

   normMode();
}












async function scanMode(){
   eventEmitter.on('scanloop', batchCount => {
      stats.operatedCount += batchCount;
      print(batchCount);
   });

   // filter only supported files
   const fileNames = (outputIsFile? [path.basename(args.input)]: fs.readdirSync(
      args.input,
      { encoding: 'utf-8' }
   ).filter(n => isSupportedFile(n)));
   scTotal = fileNames.length;

   let fileInfo = await scanFilesloudness(args.input, fileNames);

   nrTotal = fileInfo.length;
   stats.reset();
   fileInfo = await scanFilesBitrate(args.input, fileInfo);

   const nameDispSize = process.stdout.columns >> 1;
   console.log(
      `\n${ncc('green')}Scan Completed${ncc()}\n${''.padEnd(nameDispSize + 37, '-')}\n${ncc('magenta')}No.\t`+`Name`.padEnd(nameDispSize, ' ') + `loudness   Delta      Bitrate`
   );
   for(let i = 0; i < fileInfo.length; i++){
      const delta = fileInfo[i].loudness - args.tagetLUFS;
      let color;
      switch(
            nearestNumber(
               [args.LUFSMaxOffset, args.LUFSMaxOffset + 3, args.LUFSMaxOffset + 6], Math.abs(delta)
            )
         ){
         case 0:
            color = ncc('green');
            break;
         case 1:
            color = ncc('yellow');
            break;
         case 2:
            color = ncc('red');
            break;
      }
      console.log(
         `${ncc()}${i + 1}.\t` + strClamp(fileInfo[i].name, nameDispSize) + color + strClamp(`${fileInfo[i].loudness}LUFS`, 11, 'end') + strClamp(`${(delta).toFixed(1)}LUFS`, 11, 'end') +ncc('cyan')+ (fileInfo[i].bitrate??null?`${(fileInfo[i].bitrate / 1000).toFixed(0)}kbps`:`${ncc('red')}Unknown`)
      );
   }

   console.log(ncc());
}



async function normMode(){
   if(!outputIsFile){
      if(!args.output.endsWith('/')&&!args.output.endsWith('\\'))
         throw new Error('output folder must ends with \'/\' or \'\\\'');

      try{
         if(!fs.existsSync(args.output))
            fs.mkdirSync(args.output, { recursive: true });
      }catch(err){
         throw new Error(`Cannot create folder ${args.output}:\n${err}`);
      }
   }


   eventEmitter.on('scanloop', batchCount => {
      stats.operatedCount += batchCount;
      print(batchCount);
   });
   eventEmitter.on('norm', batchCount => {
      stats.operatedCount += batchCount;
      print(batchCount);
   });

   // filter only supported files
   const fileNames = (outputIsFile? [path.basename(args.input)]: fs.readdirSync(
      args.input,
      { encoding: 'utf-8' }
   ).filter(n => isSupportedFile(n)));
   scTotal = fileNames.length;


   let fileInfo = await scanFilesloudness(args.input, fileNames, true);

   nrTotal = fileInfo.length;
   if(args.ffmpeg_qscale == -1){
      stats.reset();
      fileInfo = await scanFilesBitrate(args.input, fileInfo);
   }

   stats.reset();
   await normalizeFiles(args.input, fileInfo);

   console.log(
      `\n${ncc('green')}Normalization Completed${ncc()}\n------------------------------------------\n${ncc()}Normalized: ${ncc('cyan')+nrTotal+ncc()}\nSkipped: ${ncc('cyan')+(scTotal- nrTotal)+ncc()}\nTarget (LUFS): ${ncc('cyan')+(args.tagetLUFS)+ncc()}\nMax Offest (LUFS): ${ncc('cyan')+(args.LUFSMaxOffset)+ncc()}\nNormalization Ratio: ${ncc('cyan')+(args.normRatio)+ncc()}`
   );
}





/**scan a directory for media that exceeded the max loudness
 * and return necessary data to normalize them
 * @param {boolean} fillter whether to fillter only the one needs Normalization
 */
async function scanFilesloudness(folder, fileNames, fillter = false){
   console.log(`Scanning...`);
   console.time('\nScanning took');
   operation = 'scan';
   let outOfBounds = [];
   for(let i = 0; i < fileNames.length;){
      let res = [];
      let proms = [];
      let y = 0;
      for( ; y < args.scanThread; y++){
         if(!(fileNames[i + y])) break;

         if(!outputIsFile)
            proms.push(getloudness(path.join(folder,  fileNames[i + y])));
         else proms.push(getloudness(folder));

         res.push(
            new MediaInfo(fileNames[i + y])
         );
      }
      i += y;

      const loudnessRes = await Promise.all(proms);
      res.map((v, i) => v.loudness = loudnessRes[i]);
      outOfBounds = outOfBounds.concat(res.filter(v => v.loudness));
   }

   console.timeEnd('\nScanning took');
   if(!fillter) return outOfBounds;

   return outOfBounds.filter(v =>
      proximate(v.loudness, args.tagetLUFS, args.LUFSMaxOffset) != args.tagetLUFS
   );
}



/**scan Bitrate info and insert them to every MediaInfo
 * @param {MediaInfo[]} fileObjArr
 * @param {string} folder folder path
 */
async function scanFilesBitrate(folder, fileObjArr){
   console.log(`Scanning Files Bitrate...`);
   console.time('\nBitrate Scanning took');
   operation = 'scan';

   let bitrateRes = [];
   for(let i = 0; i < fileObjArr.length;){
      let proms = [];
      let y = 0;
      for( ; y < args.scanThread; y++){
         if(!(fileObjArr[i + y])) break;

         if(!outputIsFile)
            proms.push(getAudioBitrate(path.join(folder, fileObjArr[i + y].name)));
         else proms.push(getAudioBitrate(folder));
      }
      i += y;
      const res = await Promise.all(proms);
      bitrateRes = bitrateRes.concat(res);
   }

   fileObjArr.map((v, i) => v.bitrate = bitrateRes[i]);
   console.timeEnd('\nBitrate Scanning took');
   return fileObjArr;
}




/**normalize files in MediaInfo array
 * @param {MediaInfo[]} fileObjArr
 * @param {string} folder folder path
 */
async function normalizeFiles(folder, fileObjArr){
   console.log(`Normalizing...`);
   operation = 'normalize';
   console.time('\nNormalization took');

   // calculate normalization data
   fileObjArr.map(value => {
      /**check for file with litle to no loudness
       * since just normalizing won't do much anyways
       * (threshold < -30LUFS)
       */
      if(value.loudness < -30) return value;
      return value.normalize = (args.tagetLUFS - value.loudness) * args.normRatio
   });

   let proms = [];
   let norms = 0;
   for (let i = 0; i < fileObjArr.length; ) {
      let y = 0; norms = 0;
      for (; y < args.normThread; y++) {
         if (!(fileObjArr[i + y])) break;
         if (fileObjArr[i + y].normalize == null) continue;
         proms.push(
            applyGain(
               folder,
               args.output,
               fileObjArr[i + y].name,
               fileObjArr[i + y].normalize,
               fileObjArr[i + y].bitrate? fileObjArr[i + y].bitrate: defaultBitrate,
               args.ffmpeg_qscale
            )
         );
         norms++;
      }
      i += y;

      await Promise.all(proms);
   }
   console.timeEnd('\nNormalization took');
}


function getAudioBitrate(filePath){
   return new Promise((resolve, reject) => {
      exec(`ffprobe -v error -select_streams a:0 -show_entries stream=bit_rate -of compact=p=0:nk=1 "${filePath}"`, (err, stdout, stderr) => {
         if(err||stderr) console.error(err, stderr);
         eventEmitter.emit('scanloop', 1);
         resolve(
            parseInt(r_matchNum.exec(stdout)?.[0])
         );
      });
   });
}



function getloudness(filePath){
   return new Promise((resolve, reject) => {
      exec(`ffmpeg -hide_banner -i "${filePath}" -af ebur128=framelog=verbose -f null - 2>&1 | awk "/I:/{print $2}"`, (err, stdout, stderr) => {
         if(err||stderr) console.error(err, stderr);
         eventEmitter.emit('scanloop', 1);
         resolve(parseFloat(stdout));
      });
   });
}

function applyGain(inputFolder, outputFolder, fileName, dB, bitrate, qscale = -1){
   return new Promise((resolve, reject) => {
      const ext = fileName.slice(fileName.lastIndexOf('.') + 1);
      const useID3v2 = (
         ext == 'aiff'||
         ext == 'aif'||
         ext == 'aifc'||
         ext == 'flac'||
         ext == 'mp3'||
         ext == 'mp4'||
         ext == 'mp4a'||
         ext == 'mov'||
         ext == 'wav'||
         ext == 'webm'
      );

      if(outputIsFile){
         exec(
            `ffmpeg -hide_banner -y -i "${inputFolder}" -movflags use_metadata_tags -map_metadata 0 ${useID3v2?'-id3v2_version 3':''} ${qscale==-1?'':'-q:a ' + qscale} -af "volume=${dB.toFixed(3)}dB" ${qscale==-1?'-b:a '+bitrate:''} -c:v copy "${outputFolder}"`,
            (err, stdout, stderr) => {
               if(err) console.error(err, stderr);
               eventEmitter.emit('norm', 1);
               resolve();
            }
         )
      }else{
         exec(
            `ffmpeg -hide_banner -y -i "${path.join(inputFolder, fileName)}" -movflags use_metadata_tags -map_metadata 0 ${useID3v2?'-id3v2_version 3':''} ${qscale==-1?'':'-q:a ' + qscale} -af "volume=${dB.toFixed(3)}dB" ${qscale==-1?'-b:a '+bitrate:''} -c:v copy  "${path.join(outputFolder, fileName)}"`,
            (err, stdout, stderr) => {
               if(err) console.error(err, stderr);
               eventEmitter.emit('norm', 1);
               resolve();
            }
         )
      }
   })
}


function print(batchCount){
   stats.tracker += batchCount
   const lastCheckDelta = (new Date).getTime() - stats.lastCheck;
   if (lastCheckDelta > 1000&&stats.tracker > 4){
      stats.spd = (stats.tracker * 1000) / lastCheckDelta;
      stats.tracker = 0;
      stats.lastCheck = (new Date).getTime();
   }
   if (lastPrint + 50 > (new Date).getTime()) return;

   lastPrint = (new Date).getTime();
   if(!stats.firstPrint){
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
   }else stats.firstPrint = false;


   switch(operation){
      case 'scan':
         process.stdout.write(
            `Files scanned: ${stats.operatedCount}/${scTotal} files [SPD: ${!stats.spd?'-':stats.spd.toFixed(1)}f/s]`
         );
         break;
      case 'normalize':
         process.stdout.write(
            `Files normalized: ${stats.operatedCount}/${nrTotal} files [SPD: ${!stats.spd?'-':stats.spd.toFixed(1)}f/s]`
         );
         break;
   }
}

