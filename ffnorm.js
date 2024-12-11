/**FFnorm
 * Automatic Audio Normalization tool
 * powered by FFmpeg
 * for normalizing large batch of files
 *
 * FFmpeg Commands use:
 * - getting audio loudness
 * > `ffmpeg -hide_banner -i audio.wav -af ebur128=framelog=verbose -f null - 2>&1 | awk "/I:/{print $2}""`
 * - getting audio bitrate
 * > `ffprobe -v error -select_streams a:0 -show_entries stream=bit_rate -of compact=p=0:nk=1  audio.wav"`
 * - modifying audio Gains
 * > `ffmpeg -hide_banner -y -i input.wav -movflags use_metadata_tags -map_metadata 0 -q:a (QSCALE) -af "volume=(GAIN)dB" -id3v2_version 3 -b:a (BITRATE) -c:v copy output.wav`
 *
 *
 * @author TypeDelta
**/

const fs = require('fs');
const { exec } = require('child_process');
const NodeID3 = require('node-id3').Promise;
const path = require('node:path');
const EventEmitter = require('events');
const {
   proximate,
   fileTypeOf,
   parseArgs,
   ncc,
   nearestNumber,
   strClamp,
   propertiesCount,
   sleep,
   SafeTrue
} = require('./Tools');


const VERSION = '1.0.5';
const eventEmitter = new EventEmitter();
const ParamTemplate = {
   targetLUFS: {
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
      default: 1,
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
      default: 64,
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
   outputFormat: {
      pattern: ['-f', '--format'],
   },
   input: {
      pattern: ['-i', '--input'],
   },
   output: {
      pattern: ['-o', '--output', '--out']
   },
   showVersion: {
      pattern: ['-v', '--version', 'version'],
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
   console.log(`${ncc('Bright')}FFnorm${ncc()}
automatic audio Normalization tool
powered by FFmpeg for normalizing large batch of files.\n
${ncc('magenta')}Usage:
   ${ncc('bgWhite')+ncc('black')}  '-i', '--input'  ${ncc()}
   specify input file/folder

   ${ncc('bgWhite')+ncc('black')}  '-o', '--output'  ${ncc()}
   specify Output file/folder
   (if none set will use the last command-line argument as output)

   ${ncc('bgWhite')+ncc('black')}  'norm', '--norm', '-n'  ${ncc()}
   Normalize mode - scan Audio loudness of file/folder contents
   and normalize them according to the Target loudness set by '-t' option.
   (this option requires Output path)

   ${ncc('bgWhite')+ncc('black')}  'scan', '--scan', '-s'  ${ncc()}
   Scan Audio loudness and report them on the terminal.

   ${ncc('bgWhite')+ncc('black')}  '-t', '--target'  ${ncc()}
   Target Loudness in LUFS
   (default to ${ParamTemplate.targetLUFS.default}LUFS, YouTube standard loudness)

   ${ncc('bgWhite')+ncc('black')}  '-q', '--qscale', '-qscale'  ${ncc()}
   FFmpeg quality scale, the lower the higher quality, 0 for lossless
   (default to ${ParamTemplate.ffmpeg_qscale.default})

   ${ncc('bgWhite')+ncc('black')}  '-of', '--offset'  ${ncc()}
   Max offset fron Target loudness before normalization become active.
   (default to ${ParamTemplate.LUFSMaxOffset.default}LUFS)

   ${ncc('bgWhite')+ncc('black')}  '-r', '--ratio'  ${ncc()}
   How much Normalization is apply in percentage, 1.0 is 100%
   lower this value to prevent over-shooting
   (default to ${ParamTemplate.normRatio.default})

   ${ncc('bgWhite')+ncc('black')}  '-f', '--format'  ${ncc()}
   wrapper for ffmpeg '-f' option.
   this option specify Output format of output files
   (default to whatever the input format is)
   (this option is omitted for scan mode)

   ${ncc('bgWhite')+ncc('black')}  '-st', '--scanthread'  ${ncc()}
   Max number of Threads for loudness scanning
   (default to ${ParamTemplate.scanThread.default} threads)

   ${ncc('bgWhite')+ncc('black')}  '-nt', '--normthread'  ${ncc()}
   Max number of Threads for audio normalization
   (default to ${ParamTemplate.normThread.default} threads)

   ${ncc('bgWhite')+ncc('black')}  '-v', '--version'  ${ncc()}
   prints program version and exit.

   ${ncc('bgWhite')+ncc('black')}  '-h', '--help', 'help'  ${ncc()}
   display this message and exit.
`);
   return;
}



const args = parseArgs(nodeArgs, ParamTemplate);
if(!args.output.value){
   args.output.value = nodeArgs.at(-1);
   args._unmatched.pop(); // remove the last argument (we know it's the output path)
}


if(args.showVersion.value){
   console.log(
      `${ncc('Bright')}FFnorm${ncc()}
automatic audio Normalization tool
powered by FFmpeg for normalizing large batch of files.
${ncc('Magenta')}Version: ${VERSION}${ncc()}
for usages: \`ffnorm -h\``
   );
   return;
}

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

/**a ready weak type checking but it
 * should be fine for this application?
 * @param {string}n */
const isSupportedFile = (n) => {
   return fileTypeOf(n) == 'media'
}





if(!args.input.value){
   // a shorthand for specifying input (scan mode only)
   // input can be specified without the '-i' option
   if(args.mode_scan.value&&args.output.value){
      args.input.value = args.output.value;

   }else{
      console.log(`${ncc('red')}Input file/folder is required!${ncc()}`);
      process.exit(1);
   }
}

if(!fs.existsSync(args.input.value)){
   console.log(`${ncc('red')}input path doesn\'t exist. typed something wrong?${ncc()}`);
   process.exit(1);
}


const inputStats = fs.statSync(args.input.value);


if(args.mode_scan.value){
   if(args.mode_norm.value)
      console.log(`${ncc('yellow')}Both Mode are selected, automatically choose ${ncc('magenta')}Scan${ncc()}`);

   if(args._unmatched.length){
      console.log(`${ncc('red')}Unknown argument: '${args._unmatched[0].value}' at index ${args._unmatched[0].index + ncc()}`);
      process.exit(1);
   }

   outputIsFile = isSupportedFile(args.input.value);
   scanMode();

}else{
   if(!args.mode_norm.value)
      console.log(`${ncc('yellow')}No Mode selected, default to ${ncc('magenta')}Normalize${ncc()}`);

   if(args._unmatched.length){
      console.log(`${ncc('red')}Unknown argument: '${args._unmatched[0].value}' at index ${args._unmatched[0].index + ncc()}`);
      process.exit(1);
   }

   if(!args.output.value){
      console.log(`${ncc('red')}Output file/folder is required for this mode!${ncc()}`);
      process.exit(1);
   }

   {
      /**@type {fs.Stats|null} */
      let outputStats = null;
      let outputDir;

      if(fs.existsSync(args.output.value)){
         outputStats = fs.statSync(args.output.value);
      }else{
         outputIsFile = isSupportedFile(args.output.value);
      }

      if(outputStats?.isFile() ?? outputIsFile){
         if(inputStats.isDirectory()){
            console.log(`${ncc('red')}input path must be a File if Output path is a File${ncc()}`);
            process.exit(1);
         }
         outputIsFile = true;
      }
      else { // output is a folder, may or may not exist
         outputDir = args.output.value;

         if(inputStats.isFile()){
            args.output.value = path.join(args.output.value, path.basename(args.input.value));
            outputIsFile = true;
         }
      }

      if(isPathEqual(args.input.value, args.output.value)){
         console.log(`${ncc('red')}input folder can\'t be the same Output!\nplease change output file/folder location.${ncc()}`);
         process.exit(1);
      }

      if(outputDir&&outputStats === null){ // output folder doesn't exist
         try{
            if(!fs.existsSync(outputDir))
               fs.mkdirSync(outputDir, { recursive: true });
         }catch(err){
            console.log(`${ncc('red')}Cannot create folder ${args.output}\n${ncc('dim')}${err}${ncc()}`);
            process.exit(1);
         }
      }
   }

   normMode();
}












async function scanMode(){
   eventEmitter.on('scanloop', batchCount => {
      stats.operatedCount += batchCount;
      print(batchCount);
   });

   // filter only supported files
   const fileNames = (inputStats.isFile()? [path.basename(args.input.value)]: fs.readdirSync(
      args.input.value,
      { encoding: 'utf-8' }
   ).filter(n => isSupportedFile(n)));
   scTotal = fileNames.length;

   let fileInfo = await scanFilesloudness(args.input.value, fileNames);

   nrTotal = fileInfo.length;
   stats.reset();
   fileInfo = await scanFilesBitrate(args.input.value, fileInfo);

   const nameDispSize = process.stdout.columns >> 1;
   console.log(
      `\n${ncc('green')}Scan Completed${ncc()}\n${''.padEnd(nameDispSize + 38, '-')}\n${ncc('magenta')}No.\t`+`Name`.padEnd(nameDispSize + 1, ' ') + `loudness   Delta      Bitrate`
   );
   for(let i = 0; i < fileInfo.length; i++){
      const delta = fileInfo[i].loudness - args.targetLUFS;
      let color;
      switch(
            nearestNumber(
               [args.LUFSMaxOffset, args.LUFSMaxOffset + 3, args.LUFSMaxOffset + 5], Math.abs(delta)
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
         `${ncc()}${i + 1}.\t` + strClamp(fileInfo[i].name, nameDispSize, 'mid', 2) + ' ' + color + strClamp(`${fileInfo[i].loudness}LUFS`, 11, 'end', -1) + strClamp(`${(delta).toFixed(1)}LUFS`, 11, 'end', -1) +ncc('cyan')+ (fileInfo[i].bitrate??null?`${(fileInfo[i].bitrate / 1000).toFixed(0)}kbps`:`${ncc('red')}Unknown`)
      );
   }

   console.log(ncc());
}



async function normMode(){
   eventEmitter.on('scanloop', batchCount => {
      stats.operatedCount += batchCount;
      print(batchCount);
   });
   eventEmitter.on('norm', batchCount => {
      stats.operatedCount += batchCount;
      print(batchCount);
   });

   // filter only supported files
   const fileNames = (inputStats.isFile()? [path.basename(args.input.value)]: fs.readdirSync(
      args.input.value,
      { encoding: 'utf-8' }
   ).filter(n => isSupportedFile(n)));
   scTotal = fileNames.length;


   let fileInfo = await scanFilesloudness(args.input.value, fileNames, true);

   nrTotal = fileInfo.length;
   if(args.ffmpeg_qscale == -1){
      stats.reset();
      fileInfo = await scanFilesBitrate(args.input.value, fileInfo);
   }

   stats.reset();
   await normalizeFiles(args.input.value, fileInfo);

   console.log(
      `\n${ncc('green')}Normalization Completed${ncc()}\n------------------------------------------\n${ncc()}Normalized: ${ncc('cyan')+nrTotal+ncc()}\nSkipped: ${ncc('cyan')+(scTotal- nrTotal)+ncc()}\nTarget: ${ncc('cyan')+(args.targetLUFS)+'LUFS'+ncc()}\nMax Offest: ${ncc('cyan')+'±'+args.LUFSMaxOffset+'LUFS'+ncc()}\nNormalization Ratio: ${ncc('cyan')+(args.normRatio)+ncc()}`
   );
}





/**scan a directory for media that exceeded the max loudness
 * and return necessary data to normalize them
 * @param {boolean} fillter whether to fillter only the ones need Normalization
 */
async function scanFilesloudness(folder, fileNames, fillter = false){
   console.log(`Scanning Loudness...`);
   console.time('\nScanning took');
   operation = 'scan';

   let proms = [];
   /**@type {MediaInfo[]} */
   let filesLoudness = new Array(fileNames.length);
   let activeThreads = 0;

   for(let i = 0; i < fileNames.length;){
      while(activeThreads < args.scanThread){
         if(!(fileNames[i])) break;

         if(inputStats.isDirectory())
            proms.push(getloudness(path.join(folder,  fileNames[i]), i));
         else proms.push(getloudness(folder, i));

         proms.at(-1).then(([loudness, name, index]) => {
            const info = new MediaInfo(name);
            info.loudness = loudness;
            filesLoudness[index] = info;
            activeThreads--;
         });
         i++;
         activeThreads++;
      }

      await waitThreads();
   }

   await Promise.all(proms);
   filesLoudness = filesLoudness.filter(v => v?.loudness);

   console.timeEnd('\nScanning took');
   if(!fillter) return filesLoudness;

   return filesLoudness.filter(v =>
      proximate(v.loudness, args.targetLUFS, args.LUFSMaxOffset) != args.targetLUFS
   );

   /**wait for active thread to clear up
    */
   async function waitThreads(){
      return new Promise((resolve, reject) => {
         const checkFinishedTheads = () => {
            eventEmitter.removeListener('scanloop', checkFinishedTheads);
            sleep(100);
            resolve();
         };

         eventEmitter.on('scanloop', checkFinishedTheads);
      });
   }
}



/**scan Bitrate info and insert them to every MediaInfo
 * @param {MediaInfo[]} fileObjArr
 * @param {string} folder folder path
 */
async function scanFilesBitrate(folder, fileObjArr){
   console.log(`Scanning Files Bitrate...`);
   console.time('Bitrate Scanning took');
   operation = 'scan';

   let bitrateRes = [];
   for(let i = 0; i < fileObjArr.length;){
      let proms = [];
      let y = 0;
      for( ; y < args.scanThread; y++){
         if(!(fileObjArr[i + y])) break;

         if(inputStats.isDirectory())
            proms.push(getAudioBitrate(path.join(folder, fileObjArr[i + y].name)));
         else proms.push(getAudioBitrate(folder));
      }
      i += y;
      const res = await Promise.all(proms);
      bitrateRes = bitrateRes.concat(res);
   }

   fileObjArr.map((v, i) => v.bitrate = bitrateRes[i]);
   console.timeEnd('Bitrate Scanning took');
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
      /**check for file with little to no loudness
       * since just normalizing won't do much anyways
       * (threshold < -50LUFS)
       */
      if(value.loudness < -50) return value;
      return value.normalize = (args.targetLUFS - value.loudness) * args.normRatio;
   });

   let proms = [];
   let activeThreads = 0;
   const st = new SafeTrue();

   for(let i = 0; i < fileObjArr.length; ){
      while(activeThreads < args.normThread&&st.True){
         if(!(fileObjArr[i])) break;
         if (fileObjArr[i].normalize == null){
            i++;
            continue;
         }

         proms.push(
            applyGain(
               folder,
               args.output.value,
               fileObjArr[i].name,
               fileObjArr[i].normalize,
               fileObjArr[i].bitrate? fileObjArr[i].bitrate: defaultBitrate,
               args.ffmpeg_qscale.value,
               args.outputFormat.value
            )
         );

         proms.at(-1).then(() => {
            activeThreads--;
         });
         i++;
         activeThreads++;
      }

      await waitThreads();
   }

   await Promise.all(proms);
   console.timeEnd('\nNormalization took');


   /**wait for active thread to clear up
    */
   async function waitThreads(){
      return new Promise((resolve, reject) => {
         const checkFinishedTheads = () => {
            eventEmitter.removeListener('norm', checkFinishedTheads);
            sleep(100);
            resolve();
         };

         eventEmitter.on('norm', checkFinishedTheads);
      });
   }
}


function getAudioBitrate(filePath){
   return new Promise((resolve, reject) => {
      exec(`ffprobe -v fatal -select_streams a:0 -show_entries stream=bit_rate -of compact=p=0:nk=1 "${filePath}"`, (err, stdout, stderr) => {
         if(err||stderr) console.error(err, stderr);
         eventEmitter.emit('scanloop', 1);
         resolve(
            parseInt(r_matchNum.exec(stdout)?.[0])
         );
      });
   });
}



function getloudness(filePath, i){
   return new Promise((resolve, reject) => {
      exec(`ffmpeg -hide_banner -i "${filePath}" -af ebur128=framelog=verbose -f null - 2>&1 | awk "/I:/{print $2}"`, (err, stdout, stderr) => {
         if(err||stderr) console.error(err, stderr);
         eventEmitter.emit('scanloop', 1);
         // resolve(parseFloat(stdout));
         resolve([parseFloat(stdout), filePath.split(/[/\\]/g).at(-1), i]);
      });
   });
}

/**
 * @returns {Promise<void>}
 */
function applyGain(inputFolder, outputFolder, fileName, dB, bitrate, qscale = -1, format = null){
   return new Promise(async (resolve, reject) => {
      const tags = await NodeID3.read(inputStats.isFile()? inputFolder:path.join(inputFolder, fileName));
      const useID3v2 = propertiesCount(tags) > 1;

      if(outputIsFile){
         const fileNameNoExt = path.basename(inputFolder, path.extname(fileName));
         const outputPath = format
            ? path.join(path.dirname(outputFolder), fileNameNoExt + '.' + format)
            : outputFolder;
         exec(
            `ffmpeg -hide_banner -y -i "${inputFolder}" -movflags use_metadata_tags -map_metadata 0 ${useID3v2?'-id3v2_version 3':''}${format? ' -f ' + format: ''}  ${qscale==-1?'':'-q:a ' + qscale} -af "volume=${dB.toFixed(3)}dB" ${qscale==-1?'-b:a '+bitrate:''} -c:v copy "${outputPath}"`,
            async (err, stdout, stderr) => {
               if(err) console.error(err, stderr);

               if(useID3v2&&!err) await restoreID3Tags();
               eventEmitter.emit('norm', 1);
               resolve();
            }
         );

      }else{
         const fileNameNoExt = fileName.slice(0, fileName.lastIndexOf('.'));
         const outputPath = path.join(outputFolder,
            format
               ? fileNameNoExt + '.' + format
               : fileName
         );
         exec(
            `ffmpeg -hide_banner -y -i "${path.join(inputFolder, fileName)}" -movflags use_metadata_tags -map_metadata 0 ${useID3v2?'-id3v2_version 3':''}${format? ' -f ' + format: ''} ${qscale==-1?'':'-q:a ' + qscale} -af "volume=${dB.toFixed(3)}dB" ${qscale==-1?'-b:a '+bitrate:''} -c:v copy  "${outputPath}"`,
            async (err, stdout, stderr) => {
               if(err) console.error(err, stderr);

               if(useID3v2&&!err) await restoreID3Tags();
               eventEmitter.emit('norm', 1);
               resolve();
            }
         );
      }


      async function restoreID3Tags(){
         let retCount = 0;
         let ret = false;
         do{
            try{
               await NodeID3.update(tags, outputFolder);
               ret = false;
            }catch(err){
               if(err.code == 'EBUSY'){ // the file is busy, wait for a second
                  ret = true;
                  sleep(1000);
               }
            }
         }while(ret&&++retCount < 3);
      }
   });
}


function print(batchCount){
   stats.tracker += batchCount
   const lastCheckDelta = (new Date).getTime() - stats.lastCheck;
   if (lastCheckDelta > 1000&&stats.tracker > 4){
      stats.spd = (stats.tracker * 1000) / lastCheckDelta;
      stats.tracker = 0;
      stats.lastCheck = (new Date).getTime();
   }
   if (lastPrint + 500 > (new Date).getTime()) return;

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




function isPathEqual(path1, path2){
   return path.normalize(path1) == path.normalize(path2);
}