//////////// Tools ////////////
/**tools for Javascript
 * @version 2.9.7
 */
"use strict";




const Tools = {
   /**format JSON string to make it more human-readable
    * ***Waring:* in the current version this function will remove any White-Space in the string which can cause MASSIVE INFORMATION LOSS!!**
    * @param {string}JsonString
    * @returns {string} the beautified JSON string
    */
   beautifyJson(JsonString){
      JsonString = JsonString.replace(/\s/, ""); //remove SPACE
      // console.log(JsonString);
      let _string = JsonString + "";
      let openBrackets = Tools.getMatchAllIndexs(JsonString.matchAll(/[{\[]/g))
         .sort((a, b) => a - b);
      let closeBrackets = Tools.getMatchAllIndexs(JsonString.matchAll(/[}\]]/g))
         .sort((a, b) => a - b);



      for(let layer = 0, addedLength = 0, reading = 0; reading < JsonString.length; ){
         let nearestOpen = openBrackets[findNearestBrack(openBrackets, reading)];
         let nearestClose = closeBrackets[findNearestBrack(closeBrackets, reading)];
         nearestOpen = nearestOpen == undefined? Infinity: nearestOpen;
         // console.log(nearestClose, nearestOpen);
         if(nearestOpen < nearestClose){
            layer++;
            reading = nearestOpen + 1;
         }
         else{
            layer--;
            reading = nearestClose + 1;
         }

         const nextNearestO = openBrackets[findNearestBrack(openBrackets, reading)];
         const nextNearestC = closeBrackets[findNearestBrack(closeBrackets, reading)];
         // console.log(nextNearestO);
         // console.log(nextNearestC);
         const nextNearest = nextNearestO < nextNearestC? nextNearestO: nextNearestC;
         const indent = "".padEnd(layer, "\t");


         if(isOpenBrack(_string[reading+addedLength-1])){
            _string = Tools.strSplice(_string, reading + addedLength, 0, '\n');
         }else{
            _string = Tools.strSplice(_string, reading + addedLength - 1, 0, '\n');
            _string = Tools.strSplice(_string, reading + addedLength, 0, indent);
            addedLength += indent.length;
         }
         addedLength++;
         // console.log(`S > "${_string}"`);

         //add \n
         // console.log(reading, nextNearest);
         let isolated = JsonString.substring(reading, nextNearest);
         let quoteIndex = Tools.getMatchAllIndexs(isolated.matchAll("\""))
            .filter(i => i != 0? isolated[i - 1] != "\\": true); //remove index of " that has \ as prefix
         if((quoteIndex.length % 2) != 0)
            throw new Error("cannot match Double-Quote correctly from String: \"" + isolated + '\"');

         let needNewLine = Tools.getMatchAllIndexs(isolated.matchAll(/[,]/g))
            .filter(i => {
               // remove commas that were inside any of ""
               for (let l = 0; l < quoteIndex.length; l += 2)
                  if (i > quoteIndex[l] && i < quoteIndex[l + 1]) return false;
               return true;
            });
         // const needSpace = Tools.getMatchAllIndexs(isolated.matchAll(/[:]/g))
         //    .filter(i => {
         //       // remove commas that were inside any of ""
         //       for (let l = 0; l < quoteIndex.length; l += 2)
         //          if (i > quoteIndex[l] && i < quoteIndex[l + 1]) return false;
         //       return true;
         //    });


         for(let i = 0; i < needNewLine.length + 1; i++){
            const writeIndex = i == 0? reading + addedLength: needNewLine[i - 1] + addedLength + reading + 1;

            if(isOpenBrack( _string[writeIndex - 1]) == null){
               _string = Tools.strSplice(_string, writeIndex, 0, indent);
               addedLength += indent.length;
            }


            if(!_string[(needNewLine[i]) + addedLength + reading]) break; // end of content...
            // add \n for each elements
            _string = Tools.strSplice(_string, (needNewLine[i] + 1) + addedLength + reading, 0, '\n');
            addedLength++;
         }
      }

      return _string;


      // Local Functions
      function isOpenBrack(str){
         const open = new RegExp(/[\{\[]/);
         const close = new RegExp(/[}\]]/);
         if(open.test(str)) return 1;
         if(close.test(str)) return 0;
         return null;
      }

      function findNearestBrack(brackets, reading) {
         let shortestGap = Infinity;
         let nearestIndex;
         for (let i = 0, n = brackets[i]; i < brackets.length; n = brackets[++i]) {
            const gap = n - reading;
            if (!gap) return i;
            if (gap < 0) continue;
            if (gap < shortestGap) {
               shortestGap = gap;
               nearestIndex = i;
            }
         }
         return nearestIndex;
      }
   },



   bucketSort: function(NumArr, bucketCount){
      const max = Math.max(...NumArr);
      const min = Math.min(...NumArr);
      const buckRange = (max - min) / bucketCount;


      //create empty Array the size of `bucketCount` for containing all buckets
      let buckContainer = [];
      while(buckContainer.length < bucketCount) buckContainer.push([]);


      //fill each bucket with numbers in `NumArr` in with accending order bucket
      for(let i = 0; i < NumArr.length; i++){
         let buckIndex = (Math.ceil((NumArr[i] - min) / buckRange) || 1) - 1;
         buckContainer[buckIndex].push(NumArr[i]);
      }

      NumArr = [];
      //sort each bucket
      for(let i = 0; i < buckContainer.length; i++){
         buckContainer[i].sort((a, b) => a - b);
         NumArr  = NumArr.concat(buckContainer[i]);
      }
   },




   /**clean array
    * @param {any[]} Arr array to clean
    * @param {any|any[]} itemToClean items to wipe off, optional(if None is provide,
    * will remove empty String, Array, Object),
    * can be array EX: ['0', '', 'g'] (those are Black-Listed items)
    * @returns new cleaned array
    */
   cleanArr: function(Arr, itemToClean = null){
      let _arr;

      if(itemToClean && itemToClean instanceof Array){
         itemToClean.forEach(item => {
            _arr = Arr.filter(function (itemInArr) {
               return itemInArr !== item;
            });
         })

      } else if(itemToClean){
         _arr = Arr.filter(function (itemInArr) {
            return itemInArr !== itemToClean;
         });

      } else{
         _arr = Arr.filter(itemInArr =>
            (itemInArr !== ''&&!this.isEmptyArray(itemInArr)&&!this.isEmptyObject(itemInArr))
         );
      }
      return _arr;
   },



   cleanString(string){
      return string.replace(/\[[0-9]+m/g, '');
   },




   /**return digit in the given index as Number
    * (index can be negative)
    * @param {number}index digit index of the interest Number
    * @param {number}number Number to pick a digit from
    * @returns [Number] digit at given index
    */
   digitAt: function(index, number){
      try {
         return parseInt((number+'').at(index));
      } catch (error) {
         return 0;
      }
   },



   /**return digits in the given range as Number
    * @param {number}start digit start range of the interest Number
    * @param {number}start digit end range of the interest Number
    * @param {number}number Number to pick a digit from
    * @returns [Number] digit at given range
    */
   digitAtRange: function(start, end, number){
      if(!number) return;

      // if start is negative or falsy when start != 0; start = undefined;
      start = (start < 0?undefined:start??undefined);
      end = (end < 0?undefined:end??undefined);

      const snum = (number+'').slice(start, end);
      const r = parseInt(snum.length?snum:'0');
      //console.log(`dar: ${snum}, ${start}, ${end}, ${number}, RE: ${r}`);
      return r;
   },



   /**just like `.length` but exclude some special control char
    * given the more accurate results
    */
   ex_length(string){
      if(!string) return 0;
      return string.replace(/\[[0-9]+m/g, '').length;
   },




   /**get Array if index matched by `String.matchAll()`
    * @param {IterableIterator<RegExpMatchArray>}matchArr
    * @returns {number[]}
    */
   getMatchAllIndexs(matchArr){
      if(!matchArr) return [];

      let indexs = [];
      const st = new Tools.SafeTrue; //try to code like NASA
      while(st.True){
         let value = matchArr.next().value;
         if(value == undefined) break;
         indexs.push(value["index"]);
      }
      return indexs;
   },




   /**generate random int at a specified range;
    * use build-in function `Math.random()` to generate random numbers
    * @param {number}min
    * @param {number}max
    */
   getRandomInt: function(min, max) {
      return Math.round(Math.random() * (max - min) + min);
   },



   /**Generate a unique id base on ID-pallet
    * @param {Array}alreadyExistedIDs Array of IDs that already existed to not generate a duplicated
    * @param {String}pallet the structure of ID, the length of it would be the same for generated ID.
    * @example Control characters are:
    *    `C` a random en Character (a-z, A-Z)
    *    `N` a random single Number
    *    `B` a random of BOTH Character and Number
    *
    * // to create a unique ID with 2 Numbers in the front followed by `-` and 3 Characters in the back
    * const oldIDs = ['aSer2234', '4467j', '39_mIq'];
    * const newUniqueID = IDGenerator(oldIDs, 'NN-CCC');
    */
   IDGenerator: function(alreadyExistedIDs = undefined, pallet = 'CCNNNN'){
      let foundDub = false;

      while(true){
         let id = '';
         for(let i = 0; pallet.length > id.length; i++){
            switch (pallet[i]) {
               case 'C':
                  id += String.fromCharCode(
                     Tools.getRandomInt(97, 122) - (32 * Tools.getRandomInt(0, 1))
                  );
               continue;

               case 'N':
                  id += Tools.getRandomInt(0, 9).toString();
               continue;

               case 'B':
                  if(Tools.getRandomInt(0, 1)){
                     id += String.fromCharCode(
                        Tools.getRandomInt(97, 122) - (32 * Tools.getRandomInt(0, 1))
                     );
                  }else id += Tools.getRandomInt(0, 9).toString();
               continue;

               default:
                  id += pallet[i];
               break;
            }
         }


         if(alreadyExistedIDs){
            for(const existedID of alreadyExistedIDs){
               if(existedID == id){
                  foundDub = true;
                  break;
               }
            }

            if(!foundDub) return id;
         }else return id;
      };
   },

   /** find Word in the given string
    *  if that Word isn't surrounded with en character
    *  return True if Word is found, a bit less sensitive than `string.includes()`
    * @param {String}word Word to search
    * @param {String}targetString string to search for Word
    * @param caseSensitive
    * @returns boolean
    */
   includesWord: function(word, targetString, caseSensitive = false){
      if(!caseSensitive){
         targetString = targetString.toLowerCase();
         word = word.toLowerCase();
      }
      targetString = targetString
         .padStart(targetString.length + 1, ' ')
         .padEnd(targetString.length + 2, ' ');

      const matchedWordIndex = targetString.search(word);

      if(matchedWordIndex !== -1){
         const targetStrFirstHalf = targetString.substring(matchedWordIndex-1)
         const targetStrLastHalf = targetString.substring(matchedWordIndex + word.length);
         const isUnique = (
            !(targetStrFirstHalf.search(/[a-z]/i) == 0)&&
            !(targetStrLastHalf.search(/[a-z]/i) == 0)
         );

         if(isUnique) return true;
      }

      return false;
   },



   /**this function will return **true** if
    * string is only numbers [0-9.+-] and NO characters
    * @param {string}str
    */
   isNumber: (str) => {
      return ((new RegExp("^[0-9]+$|^[0-9]+\\.[0-9]+$")).test(str));
   },


   /**return True if the given Object is an array with nothing inside
    */
   isEmptyArray: obj => (obj instanceof Array)&&!obj.length,


   /**return True if the given Object is a standard Object (`{}`) with no property
    */
   isEmptyObject: obj =>
      !(obj instanceof Array)&&(obj instanceof Object)&&!this.propertiesCount(obj),




   /**clean file name by replace ALL invalid char with valid ones
    * @param rawName file name to clean
    * @param replaceChar char to replace, default to `_`
    * @returns cleaned name
    */
   fileNameCleaner: function(rawName, replaceChar = '_'){
      if(!rawName||typeof rawName != 'string')
         throw new Error('the given `rawName` isn\'t a String');
      return rawName.trim()
         .replace(/[\|/\*\\<>"\?\:]/g, replaceChar);
   },




   /**replace any invalid chars in the path
    * @param {string}path FileSystem path to fix
    * @param {string}replaceStr string to replace
    */
   fixFilePath(path, replaceStr = '_'){
      if(!path||!path?.length)
         throw 'path is either falsy or empty!';

      const badChars = new RegExp('[:?"<>|*]', 'g');
      if(badChars.test(path))
         return path.replace(badChars, replaceStr);

      return path;
   },



   /**reformat YouTube url in different variation
    * to a standard `https://www.youtube.com/watch?v=...`
    * @param {string}url
    */
   fixYTurl(url){
      url = url||undefined;
      if(!url) throw 'url can\'t be falsy!!'
      if(url.includes("youtu.be")){
         url = url.replace(
            "https://youtu.be/",
            "https://www.youtube.com/watch?v="
         );
      }

      if(url.includes("&list=")){
         let newUrl = url.split("&list=");
         url = newUrl[0];
      }

      if(url.includes("https") == false){
         url = "https://www." + url;
      }
      return url;
   },







   /**return type of content judging only from file Extension
    * @param {String}fileExt
    * @returns `'image'|'text'|'binary'|'media'|null`
    */
   fileTypeOf(fileName){
      const fileExt = fileName.slice(fileName.lastIndexOf('.') + 1)
         .toLowerCase();
      const images = (
         fileExt == 'jpg'||
         fileExt == 'png'||
         fileExt == 'svg'||
         fileExt == 'jfif'||
         fileExt == 'jpeg'
      );
      const text = (
         fileExt == 'txt'||fileExt == 'bat'||
         fileExt == 'text'||fileExt == 'md'||
         fileExt == 'json'||fileExt == 'step'||
         fileExt == 'js'||fileExt == 'cs'||
         fileExt == 'cpp'||fileExt == 'gitignore'||
         fileExt == 'java'||
         fileExt == 'py'||
         fileExt == 'config'||
         fileExt == 'cfg'||
         fileExt == 'ts'||
         fileExt == 'env'
      );
      const binary = (
         fileExt == 'exe'||
         fileExt == 'vpk'||
         fileExt == 'qc'||
         fileExt == 'smd'||
         fileExt == 'vmt'||
         fileExt == 'vtf'||
         fileExt == 'zip'||
         fileExt == '7z'||
         fileExt == 'bin'||
         fileExt == 'ipynb'||
         fileExt == 'pyc'||
         fileExt == 'jar'
      );
      const media = (
         fileExt == 'aiff'||
         fileExt == 'aif'||
         fileExt == 'aifc'||
         fileExt == 'flac'||
         fileExt == 'mp3'||
         fileExt == 'mp4'||
         fileExt == 'mp4a'||
         fileExt == 'm4a'||
         fileExt == 'mkv'||
         fileExt == 'mov'||
         fileExt == 'wav'||
         fileExt == 'webm'
      )

      if(images) return 'image';
      else if(text) return 'text';
      else if(binary) return 'binary';
      else if(media) return 'media';
      return null;
   },






   jsTime: {
      howLong: function(lastDate, nowDate = new Date()){
         let msDifference = nowDate.getTime() - lastDate.getTime();
         return this.getTimeFromMS(msDifference).modern();
      },
      getTimeFromMS: function(milliseconds){
         let year = 0, month = 0, days = 0, hr = 0, min = 0, sec = 0;
         const useDDMMYYYformat = (milliseconds > 262800200);
         while(milliseconds >= 1000){
            milliseconds -= 1000;
            sec++;
         }
         while(sec >= 60){
            sec -= 60;
            min++;
         }
         while(min >= 60){
            min -= 60;
            hr++;
         }

         if(useDDMMYYYformat){
            while(hr >= 24){
               hr -= 24;
               days++;
            }
            while(days >= 30.4167){
               days -= 30.4167;
               month++;
            }
            days = Math.round(days);
            while(month >= 12){
               month -= 12;
               year++;
            }

         }


         milliseconds = milliseconds.toString();
         while(milliseconds.length < 3&&milliseconds !== '00'){
            milliseconds = '0' + milliseconds;
         }


         if(useDDMMYYYformat){
            return {
               full: `${year}:${month}:${days}|${hr}:${min}:${sec}.${milliseconds}`,
               modern: function(){
                  if(year + month + days + sec + min + hr == 0){
                     return `${milliseconds}ms`;
                  }else if(year + month + days + min + hr == 0){
                     return `${sec}.${milliseconds}s`
                  }else if(year + month + days + hr == 0){
                     return `${min}min ${sec}s`
                  }else if(year + month + days == 0){
                     return `${hr}hr ${min}min`;
                  }else if(year + month == 0){
                     return `${days}days ${hr}hr`
                  }else if(year == 0){
                     return `${month}months ${days}days`
                  }else return `${year}year ${month}months`
               }
            }

         }else{
            return {
               full: `${hr}:${min}:${sec}.${milliseconds}`,
               modern: function(){
                  if(sec + min + hr == 0){
                     return `${milliseconds}ms`;
                  }else if(min + hr == 0){
                     return `${sec}.${milliseconds}s`
                  }else if(hr == 0){
                     return `${min}min ${sec}s`
                  }else return `${hr}hr ${min}min`
               }
            }
         }

      }
   },






   /**linear interpolation function:
    * this function will return any % of `Max` value
    * depends on `Percentage` if 0 will return `Min`, 1 return `Max`
    * and anything in between will return any value between `Min` and `Max`
    * @param {Number}Min min value return `Min` when `Percentage` == 0
    * @param {Number}Max max value return `Max` when `Percentage` == 1
    * @param {Number}Percentage percentage of the `Max` value
    *
    */
   lerp: function(Min, Max, Percentage){
      return Min + (Max - Min) * Percentage;
   },







   /**(**Node Console Color**) return the Node.js Console Text formats, use this formmat to change
    * how Console Text looks.
    * @param {String}Color color or format of choice (if omit: 'Reset', invlid: 'white')
    * @example
    * format available: `Reset, Bright, Dim, Italic, Blink, Invert, Hidden`
    * fontcolor: `Black, Red, Green, Yellow, Blue, Magenta, Cyan, White`
    * background color: `BgBlack, BgRed, BgGreen, BgYellow, BgBlue, BgMagenta, BgCyan, BgWhite`
    *
    * @returns {String} the format code for changing node.js Console Text formats
    * @example //Usage...
    * const fmRed = ncc('Red');
    * const resetFm = ncc('Reset');
    * const textToLog = 'I\'m Red boi!!!';
    *
    * //use Reset format to made sure only `textToLog` are effected
    * console.log(`${fmRed}%s${resetFm}`, textToLog);
    *
    * //Log red "I'm Red boi!!!" text on the Terminal
    */
   ncc: function(Color){
      if(!Color) return '\x1b[0m';//return 'reset'
      Color = Color.toLocaleLowerCase();

      switch (Color) {
         case 'black':
            return '\x1b[30m';
         break;

         case 'red':
            return '\x1b[31m';
         break;

         case 'green':
            return '\x1b[32m';
         break;

         case 'yellow':
            return '\x1b[33m';
         break;

         case 'blue':
            return '\x1b[34m';
         break;

         case 'magenta':
            return '\x1b[35m';
         break;

         case 'cyan':
            return '\x1b[36m';
         break;

         case 'white':
            return '\x1b[37m';
         break;




         case 'reset':
            return '\x1b[0m';
         break;

         case 'bright':
            return '\x1b[1m';
         break;

         case 'dim':
            return '\x1b[2m';
         break;

         case 'italic':
            return '\x1b[3m';
         break;

         case 'blink':
            return '\x1b[5m';
         break;

         case 'invert':
            return '\x1b[7m';
         break;

         case 'hidden':
            return '\x1b[8m';
         break;




         case 'bgblack':
            return '\x1b[40m';
         break;

         case 'bgred':
            return '\x1b[41m';
         break;

         case 'bggreen':
            return '\x1b[42m';
         break;

         case 'bgyellow':
            return '\x1b[43m';
         break;

         case 'bgblue':
            return '\x1b[44m';
         break;

         case 'bgmagenta':
            return '\x1b[45m';
         break;

         case 'bgcyan':
            return '\x1b[46m';
         break;

         case 'bgwhite':
            return '\x1b[47m';
         break;


         default:
            // return this.ncc('White');
            return '\x1b[37m';
         break;
      }
   },





   /**return the index of element in which its value is the closest
    * to the given number,
    * if the given Array is empty: return `null`
    * @param {Number[]}arr Array of Numbers
    * @param {Number}num the target Number
    */
   nearestNumber: function(arr, num){
      let shortestGap = Infinity;
      let nearestIndex = null;
      for(let i = 0, n = arr[i]; i < arr.length; ){
         const gap = Math.abs(num - n);
         if(!gap) return i;
         if(gap < shortestGap){
            shortestGap = gap;
            nearestIndex = i;
         }
         n = arr[++i]
      }

      return nearestIndex;
   },







   /**Find the number of Properties in an Object
    * Object Property can refer as Items in an Object while each Item consist of pair of `Key: Value`
    * @param {Object}object
    * @returns Number of Property inside
    */
   propertiesCount: function(object) {
      let count = 0;

      for(let property in object) {
         if(object.hasOwnProperty(property)) ++count;
      }

      return count;
   },

   /**Commandline argument parser
    * @example
    * let myParams = {
         name: {
            pattern: ['--name', '-n'], // <- required
            default: 'Timmy',
            type: 'string', // <- default to 'string' unless `isFlag` is true
            isFlag: false,
            required: true // <- force user to include this argument (default to false)
         },
         age: {
            pattern: ['--age'],
            type: 'int'
         },
         hasCar: {
            pattern: ['--hascar', '--car'],
            isFlag: true // <- required (only for Flags that doesn't need any Value)
         },
         gender: {
            pattern: ['-g'],
            type: 'choice', // <- force user to choose one of the choice if `default` is undefined
            choices: ['f', 'm'], // <- required for type 'choice'
            default: 'f'
         }
      }

      let a = ['myapp', 'bla bla', '-n', 'Jim', '--hascar', '--age', '34'];
      console.log(parseArgs(a, myParams)); // returns {name: 'Jim', age: 34, hasCar: true, gender: 'f'}
    * @param {string[]} args Node.js commandline args
    * @param {Object} params Paramiter rules object
    * @param {boolean} caseSensitive
    */
   parseArgs(args, template, caseSensitive = false){
      let parsed = {};
      let requiredList = new Set();
      for(const pName in template){
         if(template[pName]?.isFlag){
            parsed[pName] = false;
            continue;
         }
         if(template[pName]?.required)
            requiredList.add(pName);
         parsed[pName] = (template[pName]?.default?template[pName]?.default:null);
      }

      for(let i = 0; i < args.length; i++){
         for(const pName in template){
            if(!template[pName]?.pattern)
               throw new Error('invalid template: Object structure missmatched. every entries requires `pattern` property');

            if (!isKeyMatched(args[i], template[pName].pattern)) continue;
            requiredList.delete(pName);

            // Value Checking and Parsing
            if (template[pName]?.isFlag) {
               parsed[pName] = true;
               continue;
            }

            let nextArgNotAValue = false;
            for (const p in template) {
               if (isKeyMatched(args[i + 1], template[p].pattern))
                  nextArgNotAValue = true;
            }

            if (i + 1 == args.length || nextArgNotAValue)
               throw new Error(`argument '${args[i]}' requires a Value`);
            try {
               switch (template[pName]?.type) {
                  case 'int':
                     if (isNaN(parsed[pName] = parseInt(args[++i]))) throw new Error('typemissmatched');
                     break;
                  case 'float':
                     if (isNaN(parsed[pName] = parseFloat(args[++i]))) throw new Error('typemissmatched');
                     break;
                  case 'bool':
                     if ((parsed[pName] = parseBool(args[++i], true)) == null) throw new Error('typemissmatched');
                     break;
                  case 'choice':
                     if (!template[pName]?.choices ?.length)
                        throw new Error('invalid template: Object structure missmatched. entry of type \'choice\' requires `choices` property');

                     if (!isKeyMatched(args[++i], template[pName].choices) &&
                        template[pName]?.default == undefined
                     ) {
                        throw new Error(`invalid value for '${args[i - 1]}' argument, requires any of these Choices: ${template[pName].choices}`);
                     }

                     parsed[pName] = args[i];
                     break;
                  default:
                     parsed[pName] = args[++i];
                     break;
               }
            } catch (err) {
               if (err.message == 'typemissmatched')
                  throw new Error(`argument '${args[i - 1]}' requires a Value of type '${template[pName]?.type}'`);
               throw err;
            }
         }
      }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if(requiredList.size > 0)
         throw new Error(`argument(s) '${[...requiredList]}' is required.`);

      return parsed;

      /**
       * @param {string} value
       * @param {string[]} keys
       */
      function isKeyMatched(value, keys){
         for(const k of keys){
            if(!caseSensitive){
               if(value.toLowerCase() == k.toLowerCase()) return true;
               continue;
            }

            if(value == k) return true;
         }
         return false;
      }
   },



   /**
    * parse boolean in string to Boolean data type
    * @param {String} stringBool boolean in string
    * @param {Boolean} strictMode if true will return null when stringBool is not 'true' | 'false' (default to false)
    * @returns Boolean data type
    */
   parseBool: function(stringBool, strictMode = false){
      const boolRes = (stringBool == 'true'?true:false);

      if(!strictMode) return boolRes;
      if(!(stringBool == 'true'||stringBool == 'false')) return null;
      return boolRes;
   },





   /**parse configuration file in UTF-8 encoding to a Javascript Object
    * @param {String}ConfigString configuration file content
    * @returns {Object} configuration in Javascript Object
    * @example //in main file
    * const fs = require('fs');
    *
    * const CONFIG = parseConfig(
    *    fs.readFileSync('./MyConfig.customextension', { encoding:'utf8', flag:'r' })
    * );
    *
    * const myConfigText = CONFIG.myText;
    * console.log(myConfigText); // Hello!!!
    *
    *
    * //in MyConfig.customextension file
    * # this is a comment :)
    *
    * #here are my text
    * myText = "Hello!!!"
    */
   parseConfig(ConfigString){
      var rows = Tools.cleanArr(ConfigString.trim().split('\n'), ['', '\s', '\r']);
      var configObj = new Map();
      const st = new Tools.SafeTrue();
      let indexOfSbeforQ = 0;

      let json_str = '', jsonVar_key;
      let inJson = false;
      for(let rowIndex = 0; rowIndex < rows.length; rowIndex++){
         /**| row00
          * | row01
          * | row02
          * | row03
          */
         let eachRow = rows[rowIndex].trim();
         if(eachRow.startsWith('#')) continue;

         // | pair00 = pair01
         let eachPair = Tools.cleanArr(eachRow.split('='));
         if(eachPair.length > 2)
            throw new Error(`Tools.parseConfig(): invalid syntax, '=' cannot occur more than one time.  at \`${eachRow}\``);
         else if(eachPair.length == 1&&!inJson){
            if(eachRow.includes('='))
               throw new Error(`Tools.parseConfig(): invalid syntax, expected expresion after '='.  at \`${eachRow}\``);
            else throw new Error(`Tools.parseConfig(): expected expresion.  at \`${eachRow}\``);
         }
         else if(!eachPair.length)
            throw new Error(`Tools.parseConfig(): unknown operator. \`${eachRow}\``);




         // Parse JSON config
         if(inJson){
            if(jsonEnd(rowIndex, rows)){
               inJson = false;
               configObj.set(jsonVar_key, JSON.parse(json_str));
            }else{
               json_str += rows[rowIndex];
               continue;
            }
         }



         // Parse Normal config
         eachPair = [eachPair[0].trim(), eachPair[1].trim()];

         if(eachPair[1].startsWith('{')||eachPair[1].startsWith('[')){
            inJson = true;
            [jsonVar_key, json_str] = eachPair;
         }

         if(eachPair[0].search(/[0-9]/) == 0)
            throw new Error(`Tools.parseConfig(): Key cannot starts with Numbers. at \`${eachRow}\``);

         {
            const invalidChar = eachPair[0].replace(/[a-z$_0-9]/ig, '');
            if(invalidChar.length !== 0) throw new Error(`Tools.parseConfig(): these character(s) "${invalidChar}" can not be Parse. at \`${eachRow}\``);
         }


         if(eachPair[1].match('"')?.length > 0){
            let firstQ = eachPair[1].search('"');
            const secQ = eachPair[1].indexOf('"', firstQ+1);

            let firstS = eachPair[1].search('#');
            if(firstS != -1){
               //let indexOfSbeforQ;
               while(st.True){
                  let secS = eachPair[1].indexOf('#', firstS + 1);
                  if(secS == -1&&firstS > secQ){
                     indexOfSbeforQ = firstS;
                     break;
                  }

                  firstS = secS;
               }
            }
         }

         if(eachPair[1].includes('#')){
            eachPair[1] = eachPair[1].substring(0, eachPair[1].indexOf('#', indexOfSbeforQ)).trim();
         }
         if(eachPair[1].startsWith('"')&&eachPair[1].endsWith('"')){
            eachPair[1] = eachPair[1].slice(1, -1);
         }

         configObj.set(eachPair[0], eachPair[1]);
      }

      configObj = Object.fromEntries(configObj);

      return configObj;



      function jsonEnd(i, rows) {
         if(i == rows.length - 1) return true;
         const b_closeIndexs = Tools.getMatchAllIndexs(rows[i].matchAll(/[}]]/g));

         for(const eachIndex of b_closeIndexs){
            const testBrack = rows[i].includes('}')? '}' :(rows[i].includes(']')? ']': false);

            if(
               testBrack&&
               !Tools.surroundedBy('"', rows[i].lastIndexOf(testBrack), rows[i])&&
               !rows[i].slice(eachIndex).trim().startsWith(',')
            ) return true;
         }

         return (
            rows[i].includes('=') &&
            !Tools.surroundedBy('"', rows[i].lastIndexOf('='), rows[i])
         );
      };
   },




   /**a value snap function that tries to snap `X` to `originValue`;
    * **return** `originValue` if delta of `X` to `originValue` is smaller than
    * `maxOffset` otherwise return `X`
    *
    * @param {number}X
    * @param {number}originValue
    * @param {number}maxOffset
    * @returns snapped value
    */
   proximate: function(X, originValue, maxOffset){
      if(X < (originValue + maxOffset)&&X > (originValue - maxOffset)){
         return originValue;
      }else return X;
   },




   /**
    * *" I have a `Reg(Exp)`, I have an `indexOf`... Ahhh `redexOf`"* ...any further explanation needed?
    *  redexOf is an indexOf but with `RegExp` supported
    * @param {String}string string to search from (can be omitted if use as extension)
    * @param {String|RegExp}searcher The Keyword, string or RegExp to search for
    * @param {Number}position The index at which to begin searching the String object. If omitted, search starts at the beginning of the string. Also, if **Negative** value is use will search string from the back, similar to **`string.lastIndexOf()`** but position is **Negative Index**
    * @returns {Number} position of the string that match the searcher, if none, `-1` would return
    */
   redexOf: function(string, searcher, position = 0){
      const thisNotStr = typeof(this) !== "string";

      if(!string&&thisNotStr) return -1;
      if(!thisNotStr) string = this;
      if(!string.length) return -1;
      if(!(searcher instanceof RegExp)){
         if(position >= 0) return string.indexOf(searcher, position);
         else return string.lastIndexOf(searcher, string.length + position);
      }


      let foundIndex, searchStr;
      if(position >= 0){
         foundIndex = -1;
         do {
            searchStr = string.substring(++foundIndex);
            const searchIndex = searchStr.search(searcher);
            if (searchIndex == -1) return -1;
            foundIndex = searchIndex + foundIndex;
         } while (foundIndex < position);

      }else{
         foundIndex = -1;
         do {
            searchStr = string.substring(++foundIndex);
            const searchIndex = searchStr.search(searcher);
            if (searchIndex == -1) return foundIndex - 1;
            foundIndex = searchIndex + foundIndex;
         } while (foundIndex < string.length + (position));
      }


      return foundIndex;
   },






   /**use for infinity-loops to prevent the loop from
    * unintentionally run forever
    * @param {Number}limit max loop iteration, default to 10*(10^9) (10 Billion)
    * @example
    * const st = new SafeTrue();
    * while(st.True){
    *    //do something
    * }
    */
   SafeTrue: class SafeTrue{
      #_i = 0;
      #_limit = 0;

      constructor(limit = 10e9){
         this.#_limit = limit;
      }

      /**always return `true` if the amount of time this value gets read
       * doesn't exceed the limits
       * @returns {boolean}
       */
      get True(){
         if(!(this.#_i++ < this.#_limit)){
            process?.emitWarning('SafeTrue limit reached');
            return false;
         }
         return true;
      }
   },





   /**Search Arrays of string for the top best match from the search query (like Google search w/o Linked List search),
    * **this function will also ranked the best match result**
    * @param {string[]}stringArr an Array of string to search from
    * @param {string}query the Search query
    * @param {number}maxResult define the max result from the Top search result
    * @returns Array of Top result, ranging from the lowest Index as best match
    * to the highest as the worst match
    */
   search: function(stringArr, query, maxResult){ //bestmatchs
      query = query.trim().toLowerCase();
      if(query == '') return null;
      let strList = [...stringArr];
      strList.forEach((e, i, arr) => arr[i] = e.trim().toLowerCase());


      class Match{
         constructor(str, score, matchIndex = -1){
            this.score = score;
            this.string = str;
            this.matchIndex = matchIndex;
         }
      }
      const seperator = new RegExp(/[ -_・⧸/\\;:()\[\],.'"!^*=+「【】」]/g);
      let bestMatchs = [];
      const LPquery = query.replace(seperator, '');
      let qCharSet = new Set(LPquery); //remove duplicates
      const qFreq = frequencyOf(LPquery, [...qCharSet]);
      qCharSet = [...qCharSet]; //convert back to arr


      for(let i = 0; i < strList.length; i++){
         const lowProf = strList[i].replace(seperator, '');
         // const sWords = strList[i].split(seperator);
         let LPSet = new Set(lowProf);
         const LPFreq = frequencyOf(lowProf, [...LPSet]);
         LPSet = [...LPSet];

         if(strList[i] == query||lowProf == query){
            bestMatchs.unshift(new Match(strList[i], query.length * 3, i));
            continue;
         }


         let score = 0;

         for(let i = 0; i < LPquery.length; i++){
            if(lowProf[i] == LPquery[i]) {
               score += .7;
            }
         }

         // for(const w of sWords){
         //    if(Tools.includesWord(w, LPquery))
         //       score += 1;
         // }

         for(let i = 0; i < qCharSet.length; i++){
            for(let j = 0; j < LPSet.length; j++){
               if(qCharSet[i] != LPSet[j]) continue;

               if(qFreq[i] > LPFreq[j])
                  //score += LPFreq[j] - (LPFreq[j] * f(qFreq[i] - LPFreq[j]))
                  score += qFreq[i] - (qFreq[i] - LPFreq[j]);
               else
                  score += LPFreq[j] - (LPFreq[j] - qFreq[i]);
            }
         }


         bestMatchs.push(new Match(null, score, i));
      }

      // descending sort
      bestMatchs.sort((a, b) => b.score - a.score);
      for(let i = 0; i < maxResult; i++){
         if(!bestMatchs[i]) break;
         if(bestMatchs[i].string != null) continue;

         bestMatchs[i].string = stringArr[bestMatchs[i].matchIndex];
      }

      return bestMatchs.slice(0, maxResult);



      function frequencyOf(str, charPellet){
         let fq = [];
         while(fq.length < charPellet.length) fq.push(0);

         for(let ch of str){
            charPellet.forEach((e, i, a) => {
               if(e == ch) fq[i]++;
            });
         }

         return fq;
      }
   },







   /**pause the synchronous thread for the given duration
    * @param {Number}milliseconds how long to pause in milliseconds
    */
   sleep: function(milliseconds) {
      if(!milliseconds) return;
      const date = Date.now();
      let currentDate = null;
      do {
         currentDate = Date.now();
      } while (currentDate - date < milliseconds);
   },







   /**new type of *child_process* stdio "Mirror",
    * this combind 'inherit' and 'pipe' stdio type
    * to work as one.
    * allowing `'stdin'`, `'stdout'` and `'stder'` to show
    * on parent Terminal while also pipe output and error to
    * `stdout` and `stderr`.
    * ***Note:*** please note that this is not a full replacement for 'inherit'
    * the child process can and will detect if stdout is a pity and change output based on it
    * the terminal context is lost & ansi information (coloring) etc will be lost
    * @example
    * const child = spawn('ls', ['-al'], {
    *   stdio: SpawnMirror.STDIO_MIRROR
    * });
    *
    * SpawnMirror.createMirror(child);
    *
    * child.stdout.on('data', dat => {
    *    console.log(dat.toString());
    * });
    *
    */
   SpawnMirror: class {
      /**setting for `'stdio'` property in `SpawnOptionsWithoutStdio`
       * this setting is **required** for `createMirror()` to work.
       * @example
       * const child = spawn('ls', ['-al'], {
            stdio: SpawnMirror.STDIO_MIRROR
         });
       */
      static STDIO_MIRROR = ['inherit', 'pipe', 'pipe'];

      /**create mirror for `'stdioout'` and `'stderr'`
       * to work as both `'inherit'` and `'pipe'` *child_process* stdio type
       * @example
       * const child = spawn('ls', ['-al'], {
       *   stdio: SpawnMirror.STDIO_MIRROR
       * });
       *
       * SpawnMirror.createMirror(child);
       *
       * child.stdout.on('data', dat => {
       *    console.log(dat.toString());
       * });
       *
       */
      static createMirror(child){

         child?.stdout?.pipe(process.stdout);
         child?.stderr?.pipe(process.stderr);
      }
   },


   /**clamp string's length to the given length
    * @param {string} str
    * @param {number} length
    * @param {string} dropLocation 'mid', 'start' or 'end' determine location in which the string would
    * be dropped if the given str's length is smaller then `length`
    */
   strClamp(str, length, dropLocation = 'mid'){
      if(str.length < length)
         return str.padEnd(length, ' ');

      // the length of str that won't be removed
      const leftoverAmu = str.length - (str.length - length) - 3;
      switch(dropLocation){
         case 'mid':
            const haft_loa = (leftoverAmu >> 1);
            return str.slice(0, haft_loa) + "..." + str.slice(str.length - haft_loa);
         case 'end':
            return str.slice(0, leftoverAmu) + "...";
         case 'start':
            return "..." + str.slice(leftoverAmu);
      }
   },



   /**Splice but with String, **Note That: Unlike Array.splice() this method doesn't Overwrite
    * the original var**
    * @param {string}str
    * @param {number}index
    * @param {number}removeCount number of Chars to remove
    * @param {string}strToInseart
    */
   strSplice(str, index, removeCount, strToInseart = null){
      let str2 = [...str];
      if(strToInseart)
         str2.splice(index, removeCount, ...strToInseart);
      else str2.splice(index, removeCount);
      return str2.join('');
   },




   /**check if the given index of string `str` is surrounded by `surroundStr`
    * @param {string}surroundStr
    * @param {number}index
    * @param {string}str
    * @returns {boolean} whether the given index is surrounded by `surroundStr`
    */
   surroundedBy(surroundStr, index, str){
      if(index < 0) return false;

      let sr_left = -Infinity, sr_right = Infinity;
      const usingBracket = (
         surroundStr == '{'||
         surroundStr == '['||
         surroundStr == '('||
         surroundStr == '<'
      );

      for(let p = index; p > 0; p -= 2){
         const left = str.lastIndexOf(surroundStr, p);

         if(left == -1) break;
         else sr_left = left;
         if(str[sr_left - 1] == '\\') sr_left = -Infinity;
      }

      for(let p = 0; p < str.length; p += 2){
         const right = str.indexOf(usingBracket? closeBracket(surroundStr) :surroundStr, p);

         if(right == -1) break;
         else sr_right = right;
         if(str[sr_right - 1] == '\\') sr_right = Infinity;
      }


      if(sr_left == -Infinity||sr_right == Infinity) return false;
      return sr_left < index && sr_right > index;

      /**return the closing version of a given Bracket
       */
      function closeBracket(brack){
         return String.fromCharCode(
            brack.charCodeAt(0) + (brack[0] == '('? 1 :2)
         );
      }
   },



   /**convert Numbers to Place numbers
    * @param {Number}num
    */
   toPlace(num){
      switch(num){
         case 1: return '1st';
         case 2: return '2nd';
         case 3: return '3rd';
         default: return num + 'th';
      }
   },





}



if (typeof window === 'undefined') module.exports = Tools; //for Node.js
else window.to = Tools; //for MDN



// module.exports = {
//    cleanArr,
//    getRandomInt,
//    includesWord,
//    IDGenerator,
//    fileNameCleaner,
//    fixYTurl,
//    numberOfProperty,
//    ncc,
//    jsTime,
//    parseBool,
//    parseConfig
// };