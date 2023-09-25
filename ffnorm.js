/**FFnorm
 * Automatic Audio Normalization tool
 * powered by FFmpeg
 * for normalizing large batch of files
 *
 * FFmpeg Commands use:
 * - getting audio loundness
 * > `ffmpeg -hide_banner -i audio.wav -af ebur128=framelog=verbose -f null - 2>&1 | awk '/I:/{print $2}'`
 * - modifying audio Gains
 * > `ffmpeg -hide_banner -y -i input.wav -af "volume=GAINdB" ouput.wav`
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
   nearestNumber
} = require('./Tools');

const eventEmitter = new EventEmitter();
const ParamTemplate = {
   tagetLUFS: {
      pattern: ['-t', '--target'],
      default: -14.4,
      type: 'float'
   },
   LUFSMaxOffset: {
      pattern: ['-of', '--offset'],
      default: 1.3,
      type: 'float'
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
   }
}

const nodeArgs = process.argv.slice(2);
if(!nodeArgs.length||['-h', 'help', '--help'].includes(nodeArgs[0])){
   console.log(`${ncc('magenta')}Usage:
   ${ncc('bgWhite')+ncc('black')}  '-i', '--input'  ${ncc()}
   specify input file/folder

   ${ncc('bgWhite')+ncc('black')}  '-o', '--output'  ${ncc()}
   specify output file/folder
   (if none set will use the last command-line argument as output)

   ${ncc('bgWhite')+ncc('black')}  'norm', '--norm', '-n'  ${ncc()}
   Normalize mode - scan Audio loundness of file/folder contents
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
   How much Nomalization is apply in percentage, 1.0 is 100%
   lower this value to prevent over-shooting
   (default to 0.78)

   ${ncc('bgWhite')+ncc('black')}  '-st', '--scanthread'  ${ncc()}
   Max number of Threads for loudness scanning
   (default to 128 threads)

   ${ncc('bgWhite')+ncc('black')}  '-nt', '--normthread'  ${ncc()}
   Max number of Threads for audio normalization
   (default to 32 threads)
`);
   return;
}

const args = parseArgs(nodeArgs, ParamTemplate);
if(!args.output) args.output = nodeArgs.at(-1);

let lastPrint = (new Date).getTime() - 251;
const calculationSpd = {
   spd: null,
   tracker: 0,
   lastCheck: (new Date).getTime() - 1001
}
let operation = null;
let operatedCount = 0, scTotal, nrTotal;
let firstPrint = true, outputIsFile = false;

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
      console.log(`${ncc('yellow')}No Mode selected, default to ${ncc('magenta')}Nomalize${ncc()}`);
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
      operatedCount += batchCount;
      print(batchCount);
   });

   // filter only supported files
   const fileNames = (outputIsFile? [path.basename(args.input)]: fs.readdirSync(
      args.input,
      { encoding: 'utf-8' }
   ).filter(n => isSupportedFile(n)));
   scTotal = fileNames.length;

   const ln = await scanFilesLoundness(args.input, fileNames);

   console.log(`\n${ncc('green')}Scanning Compleated${ncc()}\n------------------------------------------------------------------------------------------------------------------------------------------\n${ncc('magenta')}No.\t `+`Name`.padEnd(100, ' ') + `Loundness\tDelta`);
   for(let i = 0; i < ln.length; i++){
      const delta = Math.abs(ln[i].loundness - args.tagetLUFS);
      let color;
      switch(nearestNumber([args.LUFSMaxOffset, args.LUFSMaxOffset + 3, args.LUFSMaxOffset + 6], delta)){
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
         `${ncc()}${i + 1}.\t` + `${ln[i].name}`.padEnd(100, ' ') + `${color}${ln[i].loundness}LUFS\t${(ln[i].loundness - args.tagetLUFS).toFixed(1)}LUFS`
      );
   }

   console.log(ncc());
}



async function normMode(){
   if(!outputIsFile){
      if(!args.output.endsWith('/')&&!args.output.endsWith('\\'))
         throw new Error('output folder must ends with \'/\' or \'\\\'');

      if(!fs.existsSync(args.output))
         fs.mkdirSync(args.output, { recursive: true });

   }


   eventEmitter.on('scanloop', batchCount => {
      operatedCount += batchCount;
      print(batchCount);
   });
   eventEmitter.on('norm', batchCount => {
      operatedCount += batchCount;
      print(batchCount);
   });

   // filter only supported files
   const fileNames = (outputIsFile? [path.basename(args.input)]: fs.readdirSync(
      args.input,
      { encoding: 'utf-8' }
   ).filter(n => isSupportedFile(n)));
   scTotal = fileNames.length;


   const ln = await scanFilesLoundness(args.input, fileNames, true);

   /**check for file with litle to no loudness
    * since just normalizing won't do much anyways
    * (threshold < -30LUFS)
    */
   let filesWithNosound = [];
   ln.map(value => {
      if(value.loundness < -30) {
         filesWithNosound.push(value);
         return value;
      }
      else return value.normalize = (args.tagetLUFS - value.loundness) * args.normRatio
   });

   nrTotal = ln.length;
   firstPrint = true;
   operatedCount = 0;
   calculationSpd.tracker = 0;
   await normalizeFiles(args.input, ln);

   console.log(
      `\n${ncc('green')}Normalization Compleated${ncc()}\n------------------------------------------\n${ncc()}Nomalized: ${ncc('cyan')+nrTotal+ncc()}\nSkiped: ${ncc('cyan')+(scTotal- nrTotal)+ncc()}\nTarget (LUFS): ${ncc('cyan')+(args.tagetLUFS)+ncc()}\nMax Offest (LUFS): ${ncc('cyan')+(args.LUFSMaxOffset)+ncc()}\nNormalization Ratio: ${ncc('cyan')+(args.normRatio)+ncc()}`
   );
}





/**scan a directory for media that exceeded the max loudness
 * and return necessary data to normalize them
 * @param {boolean} fillter whether to fillter only the one needs Normalization
 */
async function scanFilesLoundness(folder, fileNames, fillter = false){
   console.log(`Scanning...`);
   console.time('\nScaning took');
   operation = 'scan';
   let outOfBounds = [];
   for(let i = 0; i < fileNames.length;){
      let res = [];
      let proms = [];
      let y = 0;
      for( ; y < args.scanThread; y++){
         if(!(fileNames[i + y])) break;
         if(!outputIsFile)
            proms.push(getLoundness(folder  + '/' + fileNames[i + y]));
         else proms.push(getLoundness(folder));
         res.push({
            loundness:null,
            name: fileNames[i + y],
            normalize: null
         });
      }
      i += y;

      const loundnessRes = (await Promise.all(proms));
      res.map((v, i) => v.loundness = loundnessRes[i]);
      // eventEmitter.emit('scanloop', y);
      outOfBounds = outOfBounds.concat(res.filter(v => v.loundness));
   }

   console.timeEnd('\nScaning took');
   if(!fillter) return outOfBounds;

   return outOfBounds.filter(v =>
      proximate(v.loundness, args.tagetLUFS, args.LUFSMaxOffset) != args.tagetLUFS
   );
}



async function normalizeFiles(folder, filesObj){
   console.log(`Normalizing...`);
   operation = 'normalize';
   console.time('\nNormalization took');
   let proms = [];
   let norms = 0;
   for (let i = 0; i < filesObj.length; ) {
      let y = 0; norms = 0;
      for (; y < args.normThread; y++) {
         if (!(filesObj[i + y])) break;
         if (filesObj[i + y].normalize == null) continue;
         proms.push(
            applyGain(
               folder, args.output, filesObj[i + y].name, filesObj[i + y].normalize
            )
         );
         norms++;
      }
      i += y;

      await Promise.all(proms);
      // eventEmitter.emit('norm', norms);
   }
   console.timeEnd('\nNormalization took');
}


function getLoundness(filePath){
   return new Promise((resolve, reject) => {
      exec(`ffmpeg -hide_banner -i "${filePath}" -af ebur128=framelog=verbose -f null - 2>&1 | awk '/I:/{print $2}'`, (err, stdout, stderr) => {
         eventEmitter.emit('scanloop', 1);
         resolve(parseFloat(stdout));
      });
   });
}

function applyGain(inputFolder, outputFolder, fileName, dB){
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
            `ffmpeg -hide_banner -y -i "${inputFolder}" -movflags use_metadata_tags -map_metadata 0 ${useID3v2?'-id3v2_version 3':''} -af "volume=${dB.toFixed(3)}dB" -c:v copy "${outputFolder}"`,
            (err, stdout, stderr) => {
               if(err) console.error(err);
               eventEmitter.emit('norm', 1);
               resolve();
            }
         )
      }else{
         exec(
            `ffmpeg -hide_banner -y -i "${inputFolder}/${fileName}" -movflags use_metadata_tags -map_metadata 0 ${useID3v2?'-id3v2_version 3':''} -af "volume=${dB.toFixed(3)}dB" -c:v copy  "${outputFolder}/${fileName}"`,
            (err, stdout, stderr) => {
               if(err) console.error(err);
               eventEmitter.emit('norm', 1);
               resolve();
            }
         )
      }
   })
}


function print(batchCount){
   calculationSpd.tracker += batchCount
   const lastCheckDelta = (new Date).getTime() - calculationSpd.lastCheck;
   if (lastCheckDelta > 1000&&calculationSpd.tracker > 4){
      calculationSpd.spd = (calculationSpd.tracker * 1000) / lastCheckDelta;
      calculationSpd.tracker = 0;
      calculationSpd.lastCheck = (new Date).getTime();
   }
   if (lastPrint + 50 > (new Date).getTime()) return;

   lastPrint = (new Date).getTime();
   if(!firstPrint){
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
   }else firstPrint = false;


   switch(operation){
      case 'scan':
         process.stdout.write(
            `Files scaned: ${operatedCount}/${scTotal} files [SPD: ${!calculationSpd.spd?'-':calculationSpd.spd.toFixed(1)}f/s]`
         );
         break;
      case 'normalize':
         process.stdout.write(
            `Files normalized: ${operatedCount}/${nrTotal} files [SPD: ${!calculationSpd.spd?'-':calculationSpd.spd.toFixed(1)}f/s]`
         );
         break;
   }
}
