//////////// Tools ////////////
/**tools for Javascript
 * @version 2.12.9
 * for Node.js >= 16.x.x
 * @changes
 * - updated: JSDoc now uses @template
 * - deprecated: objectMap() (ops, it's not needed)
 * - added: objectMap() and remap()
 * - added padStart(), padEnd() and strJustify()
 */
"use strict";
const onJSRuntime = (typeof window === 'undefined'||typeof process !== 'undefined');
var _modules = {
   dgram: null,
   worker_threads: null,
   os: null,
   fs: null,
   /**3rd party Module*/
   mathjs: null,
};

/**
 * Created by Wiktor Stribiżew, Sep 9, 2021
 * Matching all 4590 emoji characters defined in the Emoji Keyboard/Display Test Data for UTR #51 (Version: 13.1).
 *
 * @from [stribizhev/Emojis](https://github.com/stribizhev/Emojis/tree/main)
 */
const EMOJI_MATCHER_TOKEN = "[#*0-9]\\uFE0F?\\u20E3|©\\uFE0F?|[®\\u203C\\u2049\\u2122\\u2139\\u2194-\\u2199\\u21A9\\u21AA]\\uFE0F?|[\\u231A\\u231B]|[\\u2328\\u23CF]\\uFE0F?|[\\u23E9-\\u23EC]|[\\u23ED-\\u23EF]\\uFE0F?|\\u23F0|[\\u23F1\\u23F2]\\uFE0F?|\\u23F3|[\\u23F8-\\u23FA\\u24C2\\u25AA\\u25AB\\u25B6\\u25C0\\u25FB\\u25FC]\\uFE0F?|[\\u25FD\\u25FE]|[\\u2600-\\u2604\\u260E\\u2611]\\uFE0F?|[\\u2614\\u2615]|\\u2618\\uFE0F?|\\u261D(?:\\uD83C[\\uDFFB-\\uDFFF]|\\uFE0F)?|[\\u2620\\u2622\\u2623\\u2626\\u262A\\u262E\\u262F\\u2638-\\u263A\\u2640\\u2642]\\uFE0F?|[\\u2648-\\u2653]|[\\u265F\\u2660\\u2663\\u2665\\u2666\\u2668\\u267B\\u267E]\\uFE0F?|\\u267F|\\u2692\\uFE0F?|\\u2693|[\\u2694-\\u2697\\u2699\\u269B\\u269C\\u26A0]\\uFE0F?|\\u26A1|\\u26A7\\uFE0F?|[\\u26AA\\u26AB]|[\\u26B0\\u26B1]\\uFE0F?|[\\u26BD\\u26BE\\u26C4\\u26C5]|\\u26C8\\uFE0F?|\\u26CE|[\\u26CF\\u26D1\\u26D3]\\uFE0F?|\\u26D4|\\u26E9\\uFE0F?|\\u26EA|[\\u26F0\\u26F1]\\uFE0F?|[\\u26F2\\u26F3]|\\u26F4\\uFE0F?|\\u26F5|[\\u26F7\\u26F8]\\uFE0F?|\\u26F9(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?|\\uFE0F(?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\u26FA\\u26FD]|\\u2702\\uFE0F?|\\u2705|[\\u2708\\u2709]\\uFE0F?|[\\u270A\\u270B](?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\u270C\\u270D](?:\\uD83C[\\uDFFB-\\uDFFF]|\\uFE0F)?|\\u270F\\uFE0F?|[\\u2712\\u2714\\u2716\\u271D\\u2721]\\uFE0F?|\\u2728|[\\u2733\\u2734\\u2744\\u2747]\\uFE0F?|[\\u274C\\u274E\\u2753-\\u2755\\u2757]|\\u2763\\uFE0F?|\\u2764(?:\\u200D(?:\\uD83D\\uDD25|\\uD83E\\uDE79)|\\uFE0F(?:\\u200D(?:\\uD83D\\uDD25|\\uD83E\\uDE79))?)?|[\\u2795-\\u2797]|\\u27A1\\uFE0F?|[\\u27B0\\u27BF]|[\\u2934\\u2935\\u2B05-\\u2B07]\\uFE0F?|[\\u2B1B\\u2B1C\\u2B50\\u2B55]|[\\u3030\\u303D\\u3297\\u3299]\\uFE0F?|\\uD83C(?:[\\uDC04\\uDCCF]|[\\uDD70\\uDD71\\uDD7E\\uDD7F]\\uFE0F?|[\\uDD8E\\uDD91-\\uDD9A]|\\uDDE6\\uD83C[\\uDDE8-\\uDDEC\\uDDEE\\uDDF1\\uDDF2\\uDDF4\\uDDF6-\\uDDFA\\uDDFC\\uDDFD\\uDDFF]|\\uDDE7\\uD83C[\\uDDE6\\uDDE7\\uDDE9-\\uDDEF\\uDDF1-\\uDDF4\\uDDF6-\\uDDF9\\uDDFB\\uDDFC\\uDDFE\\uDDFF]|\\uDDE8\\uD83C[\\uDDE6\\uDDE8\\uDDE9\\uDDEB-\\uDDEE\\uDDF0-\\uDDF5\\uDDF7\\uDDFA-\\uDDFF]|\\uDDE9\\uD83C[\\uDDEA\\uDDEC\\uDDEF\\uDDF0\\uDDF2\\uDDF4\\uDDFF]|\\uDDEA\\uD83C[\\uDDE6\\uDDE8\\uDDEA\\uDDEC\\uDDED\\uDDF7-\\uDDFA]|\\uDDEB\\uD83C[\\uDDEE-\\uDDF0\\uDDF2\\uDDF4\\uDDF7]|\\uDDEC\\uD83C[\\uDDE6\\uDDE7\\uDDE9-\\uDDEE\\uDDF1-\\uDDF3\\uDDF5-\\uDDFA\\uDDFC\\uDDFE]|\\uDDED\\uD83C[\\uDDF0\\uDDF2\\uDDF3\\uDDF7\\uDDF9\\uDDFA]|\\uDDEE\\uD83C[\\uDDE8-\\uDDEA\\uDDF1-\\uDDF4\\uDDF6-\\uDDF9]|\\uDDEF\\uD83C[\\uDDEA\\uDDF2\\uDDF4\\uDDF5]|\\uDDF0\\uD83C[\\uDDEA\\uDDEC-\\uDDEE\\uDDF2\\uDDF3\\uDDF5\\uDDF7\\uDDFC\\uDDFE\\uDDFF]|\\uDDF1\\uD83C[\\uDDE6-\\uDDE8\\uDDEE\\uDDF0\\uDDF7-\\uDDFB\\uDDFE]|\\uDDF2\\uD83C[\\uDDE6\\uDDE8-\\uDDED\\uDDF0-\\uDDFF]|\\uDDF3\\uD83C[\\uDDE6\\uDDE8\\uDDEA-\\uDDEC\\uDDEE\\uDDF1\\uDDF4\\uDDF5\\uDDF7\\uDDFA\\uDDFF]|\\uDDF4\\uD83C\\uDDF2|\\uDDF5\\uD83C[\\uDDE6\\uDDEA-\\uDDED\\uDDF0-\\uDDF3\\uDDF7-\\uDDF9\\uDDFC\\uDDFE]|\\uDDF6\\uD83C\\uDDE6|\\uDDF7\\uD83C[\\uDDEA\\uDDF4\\uDDF8\\uDDFA\\uDDFC]|\\uDDF8\\uD83C[\\uDDE6-\\uDDEA\\uDDEC-\\uDDF4\\uDDF7-\\uDDF9\\uDDFB\\uDDFD-\\uDDFF]|\\uDDF9\\uD83C[\\uDDE6\\uDDE8\\uDDE9\\uDDEB-\\uDDED\\uDDEF-\\uDDF4\\uDDF7\\uDDF9\\uDDFB\\uDDFC\\uDDFF]|\\uDDFA\\uD83C[\\uDDE6\\uDDEC\\uDDF2\\uDDF3\\uDDF8\\uDDFE\\uDDFF]|\\uDDFB\\uD83C[\\uDDE6\\uDDE8\\uDDEA\\uDDEC\\uDDEE\\uDDF3\\uDDFA]|\\uDDFC\\uD83C[\\uDDEB\\uDDF8]|\\uDDFD\\uD83C\\uDDF0|\\uDDFE\\uD83C[\\uDDEA\\uDDF9]|\\uDDFF\\uD83C[\\uDDE6\\uDDF2\\uDDFC]|\\uDE01|\\uDE02\\uFE0F?|[\\uDE1A\\uDE2F\\uDE32-\\uDE36]|\\uDE37\\uFE0F?|[\\uDE38-\\uDE3A\\uDE50\\uDE51\\uDF00-\\uDF20]|[\\uDF21\\uDF24-\\uDF2C]\\uFE0F?|[\\uDF2D-\\uDF35]|\\uDF36\\uFE0F?|[\\uDF37-\\uDF7C]|\\uDF7D\\uFE0F?|[\\uDF7E-\\uDF84]|\\uDF85(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDF86-\\uDF93]|[\\uDF96\\uDF97\\uDF99-\\uDF9B\\uDF9E\\uDF9F]\\uFE0F?|[\\uDFA0-\\uDFC1]|\\uDFC2(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDFC3\\uDFC4](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDFC5\\uDFC6]|\\uDFC7(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDFC8\\uDFC9]|\\uDFCA(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDFCB\\uDFCC](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?|\\uFE0F(?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDFCD\\uDFCE]\\uFE0F?|[\\uDFCF-\\uDFD3]|[\\uDFD4-\\uDFDF]\\uFE0F?|[\\uDFE0-\\uDFF0]|\\uDFF3(?:\\u200D(?:\\u26A7\\uFE0F?|\\uD83C\\uDF08)|\\uFE0F(?:\\u200D(?:\\u26A7\\uFE0F?|\\uD83C\\uDF08))?)?|\\uDFF4(?:\\u200D\\u2620\\uFE0F?|\\uDB40\\uDC67\\uDB40\\uDC62\\uDB40(?:\\uDC65\\uDB40\\uDC6E\\uDB40\\uDC67|\\uDC73\\uDB40\\uDC63\\uDB40\\uDC74|\\uDC77\\uDB40\\uDC6C\\uDB40\\uDC73)\\uDB40\\uDC7F)?|[\\uDFF5\\uDFF7]\\uFE0F?|[\\uDFF8-\\uDFFF])|\\uD83D(?:[\\uDC00-\\uDC07]|\\uDC08(?:\\u200D\\u2B1B)?|[\\uDC09-\\uDC14]|\\uDC15(?:\\u200D\\uD83E\\uDDBA)?|[\\uDC16-\\uDC3A]|\\uDC3B(?:\\u200D\\u2744\\uFE0F?)?|[\\uDC3C-\\uDC3E]|\\uDC3F\\uFE0F?|\\uDC40|\\uDC41(?:\\u200D\\uD83D\\uDDE8\\uFE0F?|\\uFE0F(?:\\u200D\\uD83D\\uDDE8\\uFE0F?)?)?|[\\uDC42\\uDC43](?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDC44\\uDC45]|[\\uDC46-\\uDC50](?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDC51-\\uDC65]|[\\uDC66\\uDC67](?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDC68(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:\\uDC8B\\u200D\\uD83D)?\\uDC68|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D(?:\\uDC66(?:\\u200D\\uD83D\\uDC66)?|\\uDC67(?:\\u200D\\uD83D[\\uDC66\\uDC67])?|[\\uDC68\\uDC69]\\u200D\\uD83D(?:\\uDC66(?:\\u200D\\uD83D\\uDC66)?|\\uDC67(?:\\u200D\\uD83D[\\uDC66\\uDC67])?)|[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92])|\\uD83E[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])|\\uD83C(?:\\uDFFB(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:\\uDC8B\\u200D\\uD83D)?\\uDC68\\uD83C[\\uDFFB-\\uDFFF]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D\\uDC68\\uD83C[\\uDFFC-\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFC(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:\\uDC8B\\u200D\\uD83D)?\\uDC68\\uD83C[\\uDFFB-\\uDFFF]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D\\uDC68\\uD83C[\\uDFFB\\uDFFD-\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFD(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:\\uDC8B\\u200D\\uD83D)?\\uDC68\\uD83C[\\uDFFB-\\uDFFF]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D\\uDC68\\uD83C[\\uDFFB\\uDFFC\\uDFFE\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFE(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:\\uDC8B\\u200D\\uD83D)?\\uDC68\\uD83C[\\uDFFB-\\uDFFF]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D\\uDC68\\uD83C[\\uDFFB-\\uDFFD\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFF(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:\\uDC8B\\u200D\\uD83D)?\\uDC68\\uD83C[\\uDFFB-\\uDFFF]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D\\uDC68\\uD83C[\\uDFFB-\\uDFFE]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?))?|\\uDC69(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:\\uDC8B\\u200D\\uD83D)?[\\uDC68\\uDC69]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D(?:\\uDC66(?:\\u200D\\uD83D\\uDC66)?|\\uDC67(?:\\u200D\\uD83D[\\uDC66\\uDC67])?|\\uDC69\\u200D\\uD83D(?:\\uDC66(?:\\u200D\\uD83D\\uDC66)?|\\uDC67(?:\\u200D\\uD83D[\\uDC66\\uDC67])?)|[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92])|\\uD83E[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])|\\uD83C(?:\\uDFFB(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF]|\\uDC8B\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF])|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFC-\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFC(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF]|\\uDC8B\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF])|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFB\\uDFFD-\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFD(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF]|\\uDC8B\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF])|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFB\\uDFFC\\uDFFE\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFE(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF]|\\uDC8B\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF])|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFD\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFF(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D\\uD83D(?:[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF]|\\uDC8B\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFF])|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83D[\\uDC68\\uDC69]\\uD83C[\\uDFFB-\\uDFFE]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?))?|\\uDC6A|[\\uDC6B-\\uDC6D](?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDC6E(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDC6F(?:\\u200D[\\u2640\\u2642]\\uFE0F?)?|[\\uDC70\\uDC71](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDC72(?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDC73(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDC74-\\uDC76](?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDC77(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDC78(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDC79-\\uDC7B]|\\uDC7C(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDC7D-\\uDC80]|[\\uDC81\\uDC82](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDC83(?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDC84|\\uDC85(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDC86\\uDC87](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDC88-\\uDC8E]|\\uDC8F(?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDC90|\\uDC91(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDC92-\\uDCA9]|\\uDCAA(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDCAB-\\uDCFC]|\\uDCFD\\uFE0F?|[\\uDCFF-\\uDD3D]|[\\uDD49\\uDD4A]\\uFE0F?|[\\uDD4B-\\uDD4E\\uDD50-\\uDD67]|[\\uDD6F\\uDD70\\uDD73]\\uFE0F?|\\uDD74(?:\\uD83C[\\uDFFB-\\uDFFF]|\\uFE0F)?|\\uDD75(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?|\\uFE0F(?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDD76-\\uDD79]\\uFE0F?|\\uDD7A(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDD87\\uDD8A-\\uDD8D]\\uFE0F?|\\uDD90(?:\\uD83C[\\uDFFB-\\uDFFF]|\\uFE0F)?|[\\uDD95\\uDD96](?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDDA4|[\\uDDA5\\uDDA8\\uDDB1\\uDDB2\\uDDBC\\uDDC2-\\uDDC4\\uDDD1-\\uDDD3\\uDDDC-\\uDDDE\\uDDE1\\uDDE3\\uDDE8\\uDDEF\\uDDF3\\uDDFA]\\uFE0F?|[\\uDDFB-\\uDE2D]|\\uDE2E(?:\\u200D\\uD83D\\uDCA8)?|[\\uDE2F-\\uDE34]|\\uDE35(?:\\u200D\\uD83D\\uDCAB)?|\\uDE36(?:\\u200D\\uD83C\\uDF2B\\uFE0F?)?|[\\uDE37-\\uDE44]|[\\uDE45-\\uDE47](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDE48-\\uDE4A]|\\uDE4B(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDE4C(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDE4D\\uDE4E](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDE4F(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDE80-\\uDEA2]|\\uDEA3(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDEA4-\\uDEB3]|[\\uDEB4-\\uDEB6](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDEB7-\\uDEBF]|\\uDEC0(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDEC1-\\uDEC5]|\\uDECB\\uFE0F?|\\uDECC(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDECD-\\uDECF]\\uFE0F?|[\\uDED0-\\uDED2\\uDED5-\\uDED7]|[\\uDEE0-\\uDEE5\\uDEE9]\\uFE0F?|[\\uDEEB\\uDEEC]|[\\uDEF0\\uDEF3]\\uFE0F?|[\\uDEF4-\\uDEFC\\uDFE0-\\uDFEB])|\\uD83E(?:\\uDD0C(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDD0D\\uDD0E]|\\uDD0F(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDD10-\\uDD17]|[\\uDD18-\\uDD1C](?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDD1D|[\\uDD1E\\uDD1F](?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDD20-\\uDD25]|\\uDD26(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDD27-\\uDD2F]|[\\uDD30-\\uDD34](?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDD35(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDD36(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDD37-\\uDD39](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDD3A|\\uDD3C(?:\\u200D[\\u2640\\u2642]\\uFE0F?)?|[\\uDD3D\\uDD3E](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDD3F-\\uDD45\\uDD47-\\uDD76]|\\uDD77(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDD78\\uDD7A-\\uDDB4]|[\\uDDB5\\uDDB6](?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDDB7|[\\uDDB8\\uDDB9](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDDBA|\\uDDBB(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDDBC-\\uDDCB]|[\\uDDCD-\\uDDCF](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDDD0|\\uDDD1(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF84\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83E\\uDDD1|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD]))|\\uD83C(?:\\uDFFB(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D(?:\\uD83D\\uDC8B\\u200D)?\\uD83E\\uDDD1\\uD83C[\\uDFFC-\\uDFFF]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF84\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83E\\uDDD1\\uD83C[\\uDFFB-\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFC(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D(?:\\uD83D\\uDC8B\\u200D)?\\uD83E\\uDDD1\\uD83C[\\uDFFB\\uDFFD-\\uDFFF]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF84\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83E\\uDDD1\\uD83C[\\uDFFB-\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFD(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D(?:\\uD83D\\uDC8B\\u200D)?\\uD83E\\uDDD1\\uD83C[\\uDFFB\\uDFFC\\uDFFE\\uDFFF]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF84\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83E\\uDDD1\\uD83C[\\uDFFB-\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFE(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D(?:\\uD83D\\uDC8B\\u200D)?\\uD83E\\uDDD1\\uD83C[\\uDFFB-\\uDFFD\\uDFFF]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF84\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83E\\uDDD1\\uD83C[\\uDFFB-\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?|\\uDFFF(?:\\u200D(?:[\\u2695\\u2696\\u2708]\\uFE0F?|\\u2764\\uFE0F?\\u200D(?:\\uD83D\\uDC8B\\u200D)?\\uD83E\\uDDD1\\uD83C[\\uDFFB-\\uDFFE]|\\uD83C[\\uDF3E\\uDF73\\uDF7C\\uDF84\\uDF93\\uDFA4\\uDFA8\\uDFEB\\uDFED]|\\uD83D[\\uDCBB\\uDCBC\\uDD27\\uDD2C\\uDE80\\uDE92]|\\uD83E(?:\\uDD1D\\u200D\\uD83E\\uDDD1\\uD83C[\\uDFFB-\\uDFFF]|[\\uDDAF-\\uDDB3\\uDDBC\\uDDBD])))?))?|[\\uDDD2\\uDDD3](?:\\uD83C[\\uDFFB-\\uDFFF])?|\\uDDD4(?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|\\uDDD5(?:\\uD83C[\\uDFFB-\\uDFFF])?|[\\uDDD6-\\uDDDD](?:\\u200D[\\u2640\\u2642]\\uFE0F?|\\uD83C[\\uDFFB-\\uDFFF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?)?|[\\uDDDE\\uDDDF](?:\\u200D[\\u2640\\u2642]\\uFE0F?)?|[\\uDDE0-\\uDDFF\\uDE70-\\uDE74\\uDE78-\\uDE7A\\uDE80-\\uDE86\\uDE90-\\uDEA8\\uDEB0-\\uDEB6\\uDEC0-\\uDEC2\\uDED0-\\uDED6])";



/**for `Tools.getMatchAllResult()`
 */
class MatchResult {
   /**the matched string
    * @type {string}
    */
   value;
   /**start index
    * @type {number}
    */
   start;
   /**end index
    * @type {number}
    */
   end;
   constructor(v, s, e){
      this.value = v;
      this.start = s;
      this.end = e;
   }
}


class TFIDFValues {
   TF;
   IDF;
   TF_IDF;
   constructor(TF){
      this.TF = TF;
   }
}


/**represents a Point in 1 - 3d space
 */
class Point {
   /**@type {number} */
   x;
   /**@type {number} */
   y;
   /**@type {number} */
   z;
   /**@type {number} */
   r;
   /**theta angle
    * @type {number} */
   t;

   /**unit of `t` **R**adians or **D**egrees
    * @type {'r'|'d'}
    */
   get unit(){
      return this.#_unit;
   }
   /**dimension that this Point is stored in
    * @type {number}
    */
   get dimension(){
      return this.#_d;
   }


   #_unit;
   #_d = 0;
   constructor(x, y, z = null){
      this.x = x;
      this.y = y;
      this.z = z;
      if(z) this.#_d = 3;
      else if(y) this.#_d = 2;
      else if(x) this.#_d = 1;
   }

   /**Convert from Cartesian to Polar coordinates where **Theta** (t) units is specified by `unit`
    * @param {'r'|'d'} [unit='r'] unit of `t` **R**adians or **D**egrees (default to Radians)
    */
   toPolarCoords(unit = 'r'){
      this.#_unit = unit;
      const { r, t } = Tools.MathKit.toPolarCoords(
         this.x, this.y, unit
      );
      this.r = r;
      this.t = t;
      return this;
   }

   /**Convert from Polar to Cartesian coordinates
    */
   toCartesianCoords(){
      if(!this.#_unit&&this.x){
         return this;
      }

      const { x, y } = Tools.MathKit.toCartesianCoords(
         this.r, this.t, this.#_unit
      );
      this.x = x;
      this.y = y;
      return this;
   }

   /**set unit of **Theta** (t) and convert its value to reflects the changes
    *
    * units is specified by `unit`
    * @param {'r'|'d'} [unit] unit of `t` **R**adians or **D**egrees (default to Radians)
    */
   setUnit(unit){
      if(!unit||(unit != 'd'&&unit != 'r')) throw new Error("unit must be 'r' or 'd', given: " + unit);
      if(this.#_unit == unit) return;

      if(unit == 'r'){
         this.#_unit = unit;
         this.t = Tools.MathKit.radians(this.t);
      }else{
         this.#_unit = unit;
         this.t = Tools.MathKit.degrees(this.t);
      }
   }
}


class Dopri {
   /**## Dormand-Prince method
    *
    * a type of Runge-Kutta method used for solving ordinary differential equations (ODEs).
    *
    * ## This Class is used by `MathKit.dopri()` function.
    *
    * ## use `Dopri.at()` to get the result of the integration.
    *
    * from: [npm-numeric](https://github.com/sloisel/numeric/tree/master)
    *
    * for more info on how the calculation is done, visit [Numerary](https://numerary.readthedocs.io/en/latest/dormand-prince-method.html).
    *
    * for more info on **Butcher tableau** and the method, visit [Dormand-Prince method Wiki](https://en.wikipedia.org/wiki/Dormand%E2%80%93Prince_method)
    *
    */
   constructor(x,y,f,ymid,iterations,msg,events) {
      this.x = x;
      this.y = y;
      this.f = f;
      this.ymid = ymid;
      this.iterations = iterations;
      this.events = events;
      this.message = msg;
   }

   _at(xi, j) {
      function sqr(x) { return x * x; }
      let x0, x1, xh, y0, y1, yh;
      let h;
      let p, q, w;
      x0 = this.x[j];
      x1 = this.x[j + 1];
      y0 = this.y[j];
      y1 = this.y[j + 1];
      h = x1 - x0;
      xh = x0 + 0.5 * h;
      yh = this.ymid[j];
      p = this.f[j] - (y0 * (1 / (x0 - xh) + 2 / (x0 - x1)));
      q = this.f[j + 1] - (y1 * (1 / (x1 - xh) + 2 / (x1 - x0)));
      w = [
         sqr(xi - x1) * (xi - xh) / sqr(x0 - x1) / (x0 - xh),
         sqr(xi - x0) * sqr(xi - x1) / sqr(x0 - xh) / sqr(x1 - xh),
         sqr(xi - x0) * (xi - xh) / sqr(x1 - x0) / (x1 - xh),
         (xi - x0) * sqr(xi - x1) * (xi - xh) / sqr(x0 - x1) / (x0 - xh),
         (xi - x1) * sqr(xi - x0) * (xi - xh) / sqr(x0 - x1) / (x1 - xh)
      ];

      return (((y0 * w[0] + yh * w[1]) + y1 * w[2]) + (p * w[3])) + (q * w[4]);
   }

   /**
    * @param {number|number[]} x
    */
   at(x) {
      let i, j, k;
      if (typeof x !== "number") {
         let n = x.length, ret = Array(n);
         for (i = n - 1; i !== -1; --i) {
            ret[i] = this.at(x[i]);
         }
         return ret;
      }

      let x0 = this.x;
      i = 0; j = x0.length - 1;
      while (j - i > 1) {
         k = Math.floor(0.5 * (i + j));
         if (x0[k] <= x) i = k;
         else j = k;
      }
      return this._at(x, i);
   }
}


class ParseArg_Arg {
   value;
   index;
   type;
   constructor(value, index = -1, type) {
      this.value = value;
      this.type = type;
      this.index = index;
   }

   valueOf() {
      return this.value;
   }

   toString() {
      return this.value.toString();
   }
}


function isWorkerTransferable(obj){
   return obj == null
      || typeof obj == 'number'
      || typeof obj == 'string'
      || typeof obj == 'boolean'
      || obj instanceof ArrayBuffer
      || obj instanceof MessagePort
      || obj instanceof ReadableStream
      || obj instanceof WritableStream
      || obj instanceof TransformStream
}



const Tools = {
   _modules,

   /**
   Check if [`argv`](https://nodejs.org/docs/latest/api/process.html#process_process_argv) has a specific flag.

   from npm package [has-flag](https://www.npmjs.com/package/has-flag)
   @param {string} flag
   @param {string[]} [argv=process?.argv] arguments Array
   @param flag - CLI flag to look for. The `--` prefix is optional.
   @param argv - CLI arguments. Default: `process.argv`.
   @returns Whether the flag exists.
   @example
   ```
   // $ ts-node foo.ts -f --unicorn --foo=bar -- --rainbow

   // foo.ts
   import { argvHasFlag } from 'Tools';

   argvHasFlag('unicorn');
   //=> true

   argvHasFlag('--unicorn');
   //=> true

   argvHasFlag('f');
   //=> true

   argvHasFlag('-f');
   //=> true

   argvHasFlag('foo=bar');
   //=> true

   argvHasFlag('foo');
   //=> false

   argvHasFlag('rainbow');
   //=> false
   ```
   */
   argvHasFlag(flag, argv = process?.argv) {
      if(!argv||!flag) return false;

      const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
      const position = argv.indexOf(prefix + flag);
      const terminatorPosition = argv.indexOf('--');
      return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
   },


   /**similar to `sleep()` but this won't block the synchronous thread
    * @param {number}milliseconds how long the sleep last in milliseconds
    */
   async asyncSleep(milliseconds){
      return new Promise((resolve, reject) => {
         if(!milliseconds||milliseconds < 0) resolve();

         const date = Date.now();
         const checkTime_inter = setInterval(checkTime, 1);

         function checkTime(){
            if(Date.now() - date >= milliseconds){
               clearInterval(checkTime_inter);
               resolve();
            }
         }
      });
   },



   /**format JSON string to make it more human-readable
    * ***Waring:* in the current version this function will remove any White-Space in the string which can cause MASSIVE INFORMATION LOSS!!**
    * @param {string}JsonString
    * @returns {string} the beautified JSON string
    */
   beautifyJson(JsonString){
      JsonString = JsonString.replace(/\s/, ""); //remove SPACE
      let _string = JsonString + "";
      let openBrackets = Tools.getMatchAllIndexes(JsonString.matchAll(/[{\[]/g))
         .sort((a, b) => a - b);
      let closeBrackets = Tools.getMatchAllIndexes(JsonString.matchAll(/[}\]]/g))
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
         let quoteIndex = Tools.getMatchAllIndexes(isolated.matchAll("\""))
            .filter(i => i != 0? isolated[i - 1] != "\\": true); //remove index of " that has \ as prefix
         if((quoteIndex.length % 2) != 0)
            throw new Error("cannot match Double-Quote correctly from string: \"" + isolated + '\"');

         let needNewLine = Tools.getMatchAllIndexes(isolated.matchAll(/[,]/g))
            .filter(i => {
               // remove commas that were inside any of ""
               for (let l = 0; l < quoteIndex.length; l += 2)
                  if (i > quoteIndex[l] && i < quoteIndex[l + 1]) return false;
               return true;
            });
         // const needSpace = Tools.getMatchAllIndexes(isolated.matchAll(/[:]/g))
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



   /**get type of the character at the given index
    * @param {number} index
    * @param {string} str
    */
   charTypeAt(index, str){
      const table = Tools.CONSTS.UNICODES_RANGE_TABLE;
      const code = str.charCodeAt(index);

      for(let i = table.length >> 1, opt = 0; i >= 0&&i < table.length; opt++){
         if(opt > (table.length >> 1) + 1) break;

         if(table[i].to instanceof Array){
            for(let j = 0; j < table[i].to.length; j++){
               if(code >= table[i].from[j]&&code <= table[i].to[j]){
                  return table[i].type;
               }
            }

            if(code > table[i].from[0]) i++;
            else i--;
         }else{
            if(code >= table[i].from&&code <= table[i].to){
               return table[i].type;
            }

            if(code > table[i].from) i++;
            else i--;
         }
      }
      return null;
   },



   CheckCache: class CheckCache {
      static #supportsColor;
      static #supportsHyperlink;
      static #forceColor;

      static get supportsColor(){
         if(this.#supportsColor === undefined)
            this.#supportsColor = Tools.supportsColor();

         return this.#supportsColor;
      }

      static get supportsHyperlink(){
         if(this.#supportsHyperlink === undefined)
            this.#supportsHyperlink = Tools.supportsHyperlink();

         return this.#supportsHyperlink;
      }

      static get forceColor(){
         if(this.#forceColor === undefined){
            const env = process.env;

            if (Tools.argvHasFlag('no-color') ||
               Tools.argvHasFlag('no-colors') ||
               Tools.argvHasFlag('color=false')) {
               this.#forceColor = false;
            } else if (Tools.argvHasFlag('color') ||
               Tools.argvHasFlag('colors') ||
               Tools.argvHasFlag('color=true') ||
               Tools.argvHasFlag('color=always')) {
               this.#forceColor = true;
            }

            if ('FORCE_COLOR' in env) {
               this.#forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
            }
         }

         return this.#forceColor;
      }
      static set forceColor(value){
         this.#forceColor = value;
      }
   },



   /**clean array
    * @template T
    * @param {T[]} arr array to clean
    * @param {T|T[]} itemToClean items to wipe off, optional(if None is provide,
    * will remove empty string, Array, Object),
    * can be array EX: ['0', '', 'g'] (those are Black-Listed items)
    * @returns new cleaned array
    */
   cleanArr(arr, itemToClean = null){
      if(itemToClean && itemToClean instanceof Array){
         return arr.filter(function (itemInArr) {
            return !itemToClean.includes(itemInArr);
         });
      }

      if(itemToClean){
         return arr.filter(function (itemInArr) {
            return itemInArr !== itemToClean;
         });
      }

      return arr.filter(itemInArr =>
         (itemInArr !== ''&&itemInArr !== '\r'&&!Tools.isEmptyArray(itemInArr)&&!Tools.isEmptyObject(itemInArr))
      );
   },


   /**
    * remove terminal controll code from the string (e.g. color, hyperlink)
    */
   cleanString(string){
      return string.normalize().replace(Tools.REGEXP.ANSICode, '');
   },




   CONSTS: Object.freeze({
      /**
       * # Unicode range table
       * ## Sources
       * - japanese: [localizingjapan](https://www.localizingjapan.com/blog/2012/01/20/regular-expressions-for-japanese-text/)
       */
      UNICODES_RANGE_TABLE: [
         Object.freeze({
            type: 'generic.en.upper',
            regex: /[\x41-\x5a]/g,
            from: 0x41,
            to: 0x5a
         }),
         Object.freeze({
            type: 'generic.en.lower',
            regex: /[\x61-\x7a]/g,
            from: 0x61,
            to: 0x7a
         }),
         Object.freeze({
            type: 'generic.jp.full',
            regex: /[\u2E80-\u2FD5\u3400-\u4DB5\u4E00-\u9FCB\uF900-\uFA6A\u3000-\u303f\u3041-\u3096\u30a0-\u30ff]/g,
            from: [0x2e80, 0x3400, 0x4e00, 0xf900, 0x3000, 0x3041, 0x30a0],
            to: [0x2fd5, 0x4db5, 0x9fcb, 0xfa6a, 0x303f, 0x3096, 0x30ff]
         }),
         Object.freeze({
            type: 'generic.cn.full',
            regex: /[\u4e00-\u9fff]/g,
            from: 0x4e00,
            to: 0x9fff
         }),
         Object.freeze({
            type: 'generic.jp.half',
            regex: /[\uff5f-\uff9f]/g,
            from: 0xff5f,
            to: 0xff9f
         }),
      ]
   }),



   Convert: {
      /**Convert Decimal Color Code to RGB
       *
       * useful for working with literal Hex Color
       * @example
       * const color = 0xc28cb7; // what's the RGB for this?
       * const RGBColor = decimalColorToRGB(color);
       * console.log(RGBColor);
       * // {r: 194, g:140, b: 183}
       * @param {number} decimal Decimal Color Code
       */
      decimalColorToRGB(decimal){
         return {
            r: (decimal >> 16) & 0xff,
            g: (decimal >> 8) & 0xff,
            b: decimal & 0xff
         }
      }
   },



   DataScienceKit: {
      /**calculate how many times each unique elements
       * appears in the given array
       * @template T
       * @param {T[]|string} arr
       * @returns {Map<T, number>} frequency of each unique elements
       */
      frequencyOf(arr){
         const uniqueElems = [...new Set(arr)];
         let fqMap = new Map(
            uniqueElems.map(v => [v, 0])
         );

         for(const eachElem of arr){
            uniqueElems.forEach((e, i, a) => {
               if(e == eachElem){
                  fqMap.set(e, fqMap.get(e) + 1);
               }
            });
         }

         return fqMap;
      },


      /**## **Longest Common Subsequence**
       *
       * return **Longest Common Subsequence** of two string or array
       * where each value can be compare with each other;
       * this is useful for determining how close those
       * Arrays/string are in terms of equality
       * @template T_valueA, T_valueB
       * @param {string|T_valueA[]} arrA
       * @param {string|T_valueB[]} arrB
       * @param {(a: T_valueA|string, b: T_valueB|string) => boolean} comparator function that return `true` when the given values is considered Equal
       * @returns {T_valueA[]} Longest Common Subsequence from the given arrays
       */
      LCS_of(arrA, arrB, comparator = (a, b) => a === b){
         if(!(arrA?.length&&arrB?.length)) return [];

         /**3d matrix:
          * row: representative of strA
          * col: representative of strB
          * depth: [value, arrowDirection]
          * arrowRotation: (1: up (row--), 2: left (col--), 3: up left (row--, col--))
          * @type {number[][][]}
          */
         let lcsMatrix = [];
         const matrixWidth = arrB.length;
         const matrixHeight = arrA.length;
         while(lcsMatrix.length < matrixHeight) lcsMatrix.push(
            new Array(matrixWidth)
         );

         // fill matrix
         for(let row = 0; row < lcsMatrix.length; row++){
            for(let col = 0; col < lcsMatrix[row].length; col++){
               if(comparator(arrA[row], arrB[col])){
                  const upLeft_v = getValue(row - 1, col - 1);
                  lcsMatrix[row][col] = [upLeft_v + 1, 3];
                  continue;
               }

               const left_v = getValue(row, col - 1);
               const up_v = getValue(row - 1, col);
               if(left_v > up_v)
                  lcsMatrix[row][col] = [left_v, 2];
               else lcsMatrix[row][col] = [up_v, 1];
            }
         }


         let lcs = [];
         lcsTraverse(matrixHeight - 1, matrixWidth - 1);
         return lcs;

         /**recursively traverse from the last position of the matrix
          * by following the direction pointed by Arrow
          */
         function lcsTraverse(row, col){
            if(row < 0||col < 0) return;

            // switch arrow direction
            switch(lcsMatrix[row][col][1]){
               case 1: // up
                  lcsTraverse(row - 1, col);
                  break;
               case 2: // left
                  lcsTraverse(row, col - 1);
                  break;
               case 3: // up left
                  lcs.unshift(arrA[row]);
                  lcsTraverse(row - 1, col - 1);
                  break;
            }
         }

         function getValue(row, col){
            if(row < 0||col < 0) return 0;
            else return lcsMatrix[row][col][0];
         }
      },


      /**## **Longest Common Subsequence** length
       *
       * return the **Longest Common Subsequence** length of two string or array
       * where each value can be compare with each other
       *
       * this is useful for determining how close those
       * Arrays/string are in terms of equality
       *
       * this is a bit faster than `LCS_of()` since it doesn't have to find
       * the LCS string itself
       *
       * @template T_valueA, T_valueB
       * @param {string|T_valueA[]} arrA
       * @param {string|T_valueB[]} arrB
       * @param {(a: T_valueA|string, b: T_valueB|string) => boolean} comparator function that return `true` when the given values
       * is considered Equal
       * @returns {number} length of the LCS string
       */
      LCSLength_of(arrA, arrB, comparator = (a, b) => a === b){
         if(!(arrA?.length&&arrB?.length)) return [];

         /**3d matrix:
          * row: representative of strA
          * col: representative of strB
          * depth: [value, arrowDirection]
          * arrowRotation: (1: up (row--), 2: left (col--), 3: up left (row--, col--))
          * @type {number[][][]}
          */
         let lcsMatrix = [];
         const matrixWidth = arrB.length;
         const matrixHeight = arrA.length;
         while(lcsMatrix.length < matrixHeight) lcsMatrix.push(
            new Array(matrixWidth)
         );

         // fill matrix
         for(let row = 0; row < lcsMatrix.length; row++){
            for(let col = 0; col < lcsMatrix[row].length; col++){
               if(comparator(arrA[row], arrB[col])){
                  const upLeft_v = getValue(row - 1, col - 1);
                  lcsMatrix[row][col] = [upLeft_v + 1, 3];
                  continue;
               }

               const left_v = getValue(row, col - 1);
               const up_v = getValue(row - 1, col);
               if(left_v > up_v)
                  lcsMatrix[row][col] = [left_v, 2];
               else lcsMatrix[row][col] = [up_v, 1];
            }
         }


         return lcsMatrix[matrixHeight - 1][matrixWidth - 1][0];

         function getValue(row, col){
            if(row < 0||col < 0) return 0;
            else return lcsMatrix[row][col][0];
         }
      },



      /**## **Term Frequency - Inverse Documents Frequency**
       *
       * returns **Term Frequency - Inverse Documents Frequency**
       * of every words in the the `documents`, where `documents`
       * is a 2d Array of words:
       * row: each document
       * col: each word;
       * useful for determining the importance for each words
       * across all documents
       * @param {string[][]} documents
       * 2d Array of words:
       * row: each document
       * col: each word;
       * @returns {Map<string, TFIDFValues>[]}
       * array contain TFIDFValues for every words in every Document
       */
      TFIDF_of(documents){
         const docCount = documents.length;
         /**
          * @type {Map<string, TFIDFValues>[]}
          */
         let tfidf_map = new Array(docCount);
         let idf = new Map();

         for(let row = 0; row < docCount; row++){
            const wordCount = documents[row].length;
            const fqMap = Tools.DataScienceKit.frequencyOf(documents[row]);
            tfidf_map[row] = new Map;

            for(let col = 0; col < wordCount; col++){
               if(!tfidf_map[row].has(documents[row][col])){
                  tfidf_map[row].set(
                     documents[row][col],
                     new TFIDFValues(
                        fqMap.get(documents[row][col]) / wordCount
                  ));
               }

               if(!idf.has(documents[row][col]))
                  idf.set(documents[row][col], 0);
            }
         }

         const allUniqueWords = [...idf.keys()];
         for(let i = 0; i < allUniqueWords.length; i++){
            for(const doc of documents){
               if(doc.includes(allUniqueWords[i]))
                  idf.set(allUniqueWords[i], idf.get(allUniqueWords[i]) + 1);
            }
         }


         for(const [word, appearsCount] of idf){
            idf.set(word, Math.log10(docCount / appearsCount));
         }


         for(const doc of tfidf_map){
            for(const [word, tfidf] of doc){
               tfidf.IDF = idf.get(word);
               tfidf.TF_IDF = tfidf.IDF * tfidf.TF;
            }
         }

         return tfidf_map;
      },



      /**extend existed TFIDFMaps
       * @param {Map<string, TFIDFValues>[]} TFIDFMaps
       * @param {string[][]} documents
       * 2d Array of words:
       *
       * row: each document
       *
       * col: each word
       * @returns {Map<string, TFIDFValues>[]}
       * array contain TFIDFValues for every words in every Document
       */
      TFIDF_extends(TFIDFMaps, documents){
         /**
          * @type {Map<string, TFIDFValues>[]}
         */
         let tfidf_maps = TFIDFMaps.concat(new Array(documents.length));
         let idf = new Map();
         const docCount = tfidf_maps.length;

         for(let row = 0; row < docCount; row++){
            let wordCount, fqMap;
            let newlyAdded = false;
            let addedRow = row - TFIDFMaps.length;

            if(!tfidf_maps[row]){
               newlyAdded = true;
               wordCount = documents[addedRow].length;
               fqMap = Tools.DataScienceKit.frequencyOf(documents[addedRow]);
               tfidf_maps[row] = new Map;
            }else{
               wordCount = tfidf_maps[row].size;
            }

            for(let col = 0; col < wordCount; col++){
               if(newlyAdded&&!tfidf_maps[row].has(documents[addedRow][col])){
                  tfidf_maps[row].set(
                     documents[addedRow][col],
                     new TFIDFValues(
                        fqMap.get(documents[addedRow][col]) / wordCount
                  ));

                  if(!idf.has(documents[addedRow][col]))
                     idf.set(documents[addedRow][col], 0);
                  continue;
               }

               const word = [...tfidf_maps[row].keys()][col];
               if(!idf.has(word))
                  idf.set(word, 0);
            }
         }


         const allUniqueWords = [...idf.keys()];
         for(let i = 0; i < allUniqueWords.length; i++){
            for(const map of tfidf_maps){
               if(map.has(allUniqueWords[i]))
                  idf.set(allUniqueWords[i], idf.get(allUniqueWords[i]) + 1);
            }
         }

         for(const [word, appearsCount] of idf){
            idf.set(word, Math.log10(docCount / appearsCount));
         }

         for(const doc of tfidf_maps){
            for(const [word, tfidf] of doc){
               // console.log(word, idf.get(word));
               tfidf.IDF = idf.get(word);
               tfidf.TF_IDF = tfidf.IDF * tfidf.TF;
            }
         }

         return tfidf_maps;
      },


      /**
       * @typedef {Object} WagnerResult
       * @property {number} distance **Levenshtein distance** of two string or array
       * @property {function(): {type: 'insert'|'delete'|'replace', index: number, value: any}[]} getOperations return an array of operations needed to transform A string to B
       */
      /**## **Wagner & Fischer Algorithm**
       *
       * calculate the **Levenshtein distance** of two string or array
       * telling how many operations needed to transform A string to B
       *
       * @template T_valueA, T_valueB
       * @param {string|T_valueA[]} arrA
       * @param {string|T_valueB[]} arrB
       * @param {(a: T_valueA|string, b: T_valueB|string) => boolean} comparator function that return `true` when the given values
       * is considered Equal
       * @returns {WagnerResult} result of the calculation
       */
      wagnerFischer_of(arrA, arrB, comparator = (a, b) => a === b){
         let matrix = [];
         let row, col;
         // fill the first row and column of the matrix
         for(row = 0; row <= arrA.length; row++) matrix[row] = [row];
         for(col = 0; col <= arrB.length; col++) matrix[0][col] = col;

         for(row = 1; row <= arrA.length; row++){
            for(col = 1; col <= arrB.length; col++){
               if(comparator(arrA[row-1], arrB[col-1])){
                  matrix[row][col] = matrix[row-1][col-1];
                  continue;
               }

               matrix[row][col] = Math.min(
                  matrix[row-1][col-1] + 1,
                  Math.min(
                     matrix[row][col-1] + 1,
                     matrix[row-1][col] + 1
                  )
               );
            }
         }

         return {
            distance: matrix[arrA.length][arrB.length],
            getOperations(){
               let row = matrix.length - 1;
               let col = matrix[0].length - 1;
               let operations = [];
               const s = new Tools.SafeTrue;

               while((row > 0 || col > 0)&&s.True){
                  const direction = getNextDirection(row, col, matrix);
                  switch(direction){
                     case 2: // up - delete
                        operations.push({
                           type: 'delete',
                           index: row - 1,
                           value: arrA[row - 1]
                        });
                        row--;
                        break;
                     case 0: // left - insert
                        operations.push({
                           type: 'insert',
                           index: row,
                           value: arrB[col - 1]
                        });
                        col--;
                        break;
                     case 1: // diagonal - substitute (replace)
                        if(matrix[row][col] !== matrix[row - 1][col - 1]){
                           operations.push({
                              type: 'replace',
                              index: row - 1,
                              value: arrB[col - 1]
                           });
                        }
                        row--;
                        col--;
                        break;
                  }
               }
               return operations;

               function getNextDirection(row, col, matrix){
                  let dir = [
                     matrix[row][col - 1], // left
                     matrix[row - 1][col - 1], // diagonal
                     matrix[row - 1][col], // up
                  ]

                  if(col <= 0) return 2;
                  if(row <= 0) return 0;

                  if(dir[0] == dir[1]){
                     if(dir[2] == dir[1])
                        return 1;
                     else return 0;
                  }

                  let min = dir[0];
                  let mIndex = 0;
                  for(let i = 1; i < dir.length; i++){
                     if(dir[i] < min){
                        min = dir[i];
                        mIndex = i;
                     }
                  }
                  return mIndex;
               }
            }
         };
      }
   },



   /**return digit in the given index as Number
    * (index can be negative)
    * @param {number}index digit index of the interest Number
    * @param {number}number Number to pick a digit from
    * @returns {number} digit at given index
    */
   digitAt(index, number){
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
    * @returns {number} digit at given range
    */
   digitAtRange(start, end, number){
      if(!number) return;

      // if start is negative or falsy when start != 0; start = undefined;
      start = (start < 0?undefined:start??undefined);
      end = (end < 0?undefined:end??undefined);

      const snum = (number+'').slice(start, end);
      return parseInt(snum.length?snum:'0');
   },



   Err: class Err extends Error {
      /**## an easier to customize Error object
       * @param {string|Error|unknown} message error message
       * @param {string} name error name
       * @param {number} code error code
       * @param {string} stack error stacktrace
       */
      constructor(message, name = null, code = null, stack = null){
         if(message instanceof Error){
            if(!name) name = message.name;
            if(!code) code = message.code;
            if(!stack) stack = message.stack;
            message = message.message;
         }

         super(message);
         if(name) this.name = name;
         if(code) this.code = code;
         if(stack) this.stack = stack;
      }

      /**## an easier to customize Error object
       * @param {string|Error|unknown} message error message
       * @param {string} name error name
       * @param {number} code error code
       * @param {string} stack error stacktrace
       */
      static from(message, name = null, code = null, stack = null){
         return new Tools.Err(message, name, code, stack);
      }
   },


   /**escape all Regular Expressions  control chars
    * @param {string} regexpStr
    */
   escapeRegExp(regexpStr){
      return regexpStr.replace(
         /[\[\]\{\}\.\*\$\^\|\-\?\+\,\:\\]/g, '\\$&'
      );
   },



   /**similar to `string.length` but return actual length displayed in terminal.
    * (size that will be displayed, not to be confused with the actual *length* of the string)
    * this is because some characters may take more than 1 character width
    * (e.g. emoji, full-width characters, etc.)
    * @param {string} string
    * @param {number} redundancyLv determine complexity of the algorithm (the higher, the better result but slower) (suports `-1`: none, `0`:  ANSI code, `1`: fullwidth chars, `2`: Emoji)
    */
   ex_length(string, redundancyLv = 0){
      if(typeof string !== 'string') throw new TypeError('argument must be a string');
      if(redundancyLv < 0) return string.length;

      /**## Redundancy Level 0 - ANSI Code
       */
      string = Tools.cleanString(string);
      const r0_length = string.length;
      if(redundancyLv < 1) return r0_length;

      /**## Redundancy Level 1 - Full-width Characters
       */
      let noFullWidth = string;
      for(const range of Tools.CONSTS.UNICODES_RANGE_TABLE){
         if(!range.type.endsWith('full')) continue;
         noFullWidth = noFullWidth.replace(range.regex, '');
      }
      const r1_length = r0_length + (r0_length - noFullWidth.length);
      if(redundancyLv < 2) return r1_length;

      /**## Redundancy Level 2 - Emoji and ZWJ
       */
      const emojis = string.match(Tools.REGEXP.EmojiEach) ?? [];
      const emojiUniLength = emojis.reduce((acc, cur) => acc + cur.length, 0);
      return emojis.length * 2 + (r1_length - emojiUniLength);
   },




   /**get an Array of matched index from `string.matchAll()`
    * @param {IterableIterator<RegExpMatchArray>}matchArr
    * @returns {number[]}
    */
   getMatchAllIndexes(matchArr){
      if(!matchArr) return [];

      let indexes = [];
      for(const match of matchArr){
         indexes.push(match.index);
      }
      return indexes;
   },



   /**get matched result from `string.matchAll()` as an Array
    * @param {IterableIterator<RegExpMatchArray>}matchArr
    * @returns {MatchResult[]}
    */
   getMatchAllResults(matchArr){
      if(!matchArr) return [];

      let res = [];
      for(const match of matchArr){
         res.push(new MatchResult(
            match[0], match.index, match.index + match[0].length
         ));
      }
      return res;
   },




   /**generate random int at a specified range;
    * use build-in function `Math.random()` to generate random numbers
    * @param {number}min
    * @param {number}max
    */
   getRandomInt(min, max) {
      return Math.round(Math.random() * (max - min) + min);
   },



   /**create Hyper link for terminal
    *
    * ### this works only with terminals that support hyper link
    * @param {string}text text to display
    * @param {string} url
    * @returns {string} hyper link string, if the terminal doesn't support hyper link, it will return the url
    */
   hyperLink(text, url){
      url = encodeURI(url);

      if(!Tools.CheckCache.supportsHyperlink) return url;
      return `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`;
   },



   /**Generate a unique id base on ID-pallet
    * @param {string[]|Set<string>|null}alreadyExistedIDs Array of IDs that already existed to not generate a duplicated
    * @param {string}pallet the structure of ID, the length of it would be the same for generated ID.
    *
    * **Control characters are:**
    * - `C` a random en Character (a-z, A-Z)
    * - `N` a random single Number
    * - `B` a random of BOTH Character and Number
    * @example
    * // to create a unique ID with 2 Numbers in the front followed by `-` and 3 Characters in the back
    * const oldIDs = ['aSer2234', '4467j', '39_mIq'];
    * const newUniqueID = IDGenerator(oldIDs, 'NN-CCC');
    */
   IDGenerator(alreadyExistedIDs = null, pallet = 'CCNNNN'){
      let foundDub = false;
      const st = new Tools.SafeTrue;

      while(st.True){
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
            if(alreadyExistedIDs instanceof Set) foundDub = alreadyExistedIDs.has(id);
            else foundDub = alreadyExistedIDs.includes(id);

            if(!foundDub) return id;
         }else return id;
      };
      return null;
   },

   /** find Word in the given string
    *  if that Word isn't surrounded with characters
    *  return True if Word is found, a bit less sensitive than `string.includes()`
    * @param {string}word Word to search
    * @param {string}targetString string to search for Word
    * @param caseSensitive
    * @returns boolean
    */
   includesWord(word, targetString, caseSensitive = false){
      if(!caseSensitive){
         targetString = targetString.toLowerCase();
         word = word.toLowerCase();
      }
      targetString = targetString
         .padStart(targetString.length + 1, ' ')
         .padEnd(targetString.length + 2, ' ');

      const matchedWordIndex = targetString.search(word);

      if(matchedWordIndex !== -1){
         const targetStrFirstHalf = targetString.substring(matchedWordIndex-1);
         const targetStrLastHalf = targetString.substring(matchedWordIndex + word.length);
         const isUnique = (
            (targetStrFirstHalf.search(Tools.REGEXP.Seperators) == 0)&&
            (targetStrLastHalf.search(Tools.REGEXP.Seperators) == 0)
         );

         if(isUnique) return true;
      }

      return false;
   },



   /**
    * ## Inter-process Communication
    * IPC which is capable of tranfering most standard Javascript Objects
    *
    * ### Important! this class may requires *`dgram`* or *`worker_threads`* (NodeJS module) that will be imported upon calling
    * @param {'nodeworker'|'udp4'|'udp6'} protocol **data transfer protocol** **`nodeworker`** using the build-in NodeJS `worker_threads` module, **`udp4`** or **`udp6`** using the build-in NodeJS `dgram` module
    * @param {number|Worker|parentPort} port port to listen on (if `protocol` is `nodeworker` this will be the `worker` or `parentPort` object)
    * if `protocol` is `nodeworker` this argument can be omitted and will create a connection to the main thread if has any.
    * @example
    * // using the dgram module
    * const ipc = new Tools.IPC('udp4', 30000);
    * ipc.on('mymsgchannel', (msg) => { // receive message from other end
    *   console.log(msg);
    * });
    * // send message to the other end
    * ipc.send('mymsgchannel', 'hello world!');
    *
    * // using the worker_threads module
    * // on the main thread
    * const { Worker } = require('worker_threads');
    * const worker = new Worker('./dostuff.js');
    * const ipc = new Tools.IPC('nodeworker', worker);
    * ipc.on('mymsgchannel', (msg) => {
    *   console.log(msg);
    * });
    *
    * const myWork = getWork();
    * ipc.send('mycmdchannel', myWork); // send work object to the worker
    *
    * // on the worker thread
    * const ipc = new Tools.IPC('nodeworker');
    * ipc.on('mycmdchannel', (work) => {
    *   doWork(work);
    * });
    *
    * function doWork(work){
    *   // do work
    *   ipc.send('mymsgchannel', 'work done!');
    * }
    */
   IPC: class {
      static Package = class Package {
         channel;
         content;
      }
      static Listener = class Listener {
         /**
          * @type {0|1} listener type
          * **0**: normal (`on()`)
          * **1**: single use (`once()`)
          */
         type;
         /**
          * @type {function(...any): void}
          */
         callback;
         constructor(t, c){
            this.type = t;
            this.callback = c;
         }
      }

      /**dgram Socket or Worker object
       */
      #socket
      /**
       * @typedef {object} Listener
       * @property {0|1} type - listener type
       * **0**: normal (`on()`)
       * **1**: single use (`once()`)
       * @property {function(...any): void} callback
       */
      /**message listeners for each channel
       * @type {Map<string, Listener[]>} pair **channel** - **callback function**
       */
      #listeners = new Map;
      #proto;
      #tagetAdd = 'localhost';
      /**the port this IPC is on or Worker object if using `nodeworker`
       * @type {number|Worker|@require('worker_threads').parentPort}
       */
      port;
      get protocol(){ return this.#proto; };

      // LINK: dn4kas
      /**## Inter-process Communication
       * IPC which is capable of tranfering most standard Javascript Objects
       *
       * ### Important! this class may requires *`dgram`* or *`worker_threads`* (NodeJS module) that will be imported upon calling
       * @param {'nodeworker'|'udp4'|'udp6'} protocol **data transfer protocol** **`nodeworker`** using the build-in NodeJS `worker_threads` module, **`udp4`** or **`udp6`** using the build-in NodeJS `dgram` module
       * @param {number|Worker|require('worker_threads').parentPort} port port to listen on (if `protocol` is `nodeworker` this will be the `worker` or `parentPort` object)
       * if `protocol` is `nodeworker` this argument can be omitted and will create a connection to the main thread if has any.
       * @example
       * // using the dgram module
       * const ipc = new Tools.IPC('udp4', 30000);
       * ipc.on('mymsgchannel', (msg) => { // receive message from other end
       *   console.log(msg);
       * });
       * // send message to the other end
       * ipc.send('mymsgchannel', 'hello world!');
       *
       * // using the worker_threads module
       * // on the main thread
       * const { Worker } = require('worker_threads');
       * const worker = new Worker('./dostuff.js');
       * const ipc = new Tools.IPC('nodeworker', worker);
       * ipc.on('mymsgchannel', (msg) => {
       *   console.log(msg);
       * });
       *
       * const myWork = getWork();
       * ipc.send('mycmdchannel', myWork); // send work object to the worker
       *
       * // on the worker thread
       * const ipc = new Tools.IPC('nodeworker');
       * ipc.on('mycmdchannel', (work) => {
       *   doWork(work);
       * });
       *
       * function doWork(work){
       *   // do work
       *   ipc.send('mymsgchannel', 'work done!');
       * }
       */
      constructor(protocol = 'udp4', port = null){
         if(!onJSRuntime) throw new Error('IPC is only available on JSRuntime, due to the use of Node modules');

         if(protocol != 'nodeworker'&&protocol != 'udp4'&&protocol != 'udp6')
            throw new Error(`protocol must be 'nodeworker', 'udp4' or 'udp6' instead given '${protocol}'`);

         this.#proto = protocol;
         if(!Tools._modules.dgram&&protocol != 'nodeworker'){
            throw new Error(`module 'dgram' not loaded use 'Tools._modules.dgram = require("dgram")' to load it`);
         }

         if(protocol == 'nodeworker'){
            if(!Tools._modules.worker_threads){
               throw new Error(`module 'worker_threads' not loaded use 'Tools._modules.worker_threads = require("worker_threads")' to load it`);
            }

            if(
               !(port instanceof Tools._modules.worker_threads.Worker)&&
               port !== Tools._modules.worker_threads.parentPort&&
               port != null
            ) throw new Error(`port must be a type of 'Worker' or a 'parentPort' instead given '${typeof port}'`);
            if(!port){
               if(Tools._modules.worker_threads.isMainThread)
                  throw new Error('when using `nodeworker` protocol, `port` must be provided if on the main thread');
               this.#socket = Tools._modules.worker_threads.parentPort;
               this.#init();
               return;
            }

            this.#socket = port;
            this.#init();
            return;
         }

         this.port = port;
         this.#socket = Tools._modules.dgram.createSocket(protocol);
         this.#init();
      }

      /**
       * @returns {Promise<number|undefined>} port number if `protocol` is `udp4` or `udp6`
       */
      async #init(){
         return new Promise(resolve => {
            this.#socket.on('message', this.#handleIncomePackage);

            if(this.protocol == 'nodeworker') resolve();

            this.#socket.bind(this.port, port => {
               resolve(this.port = port);
            });
         });
      }

      /**bind sender to a specific address
       *
       * this allows message to be sent across devices
       * @param {string} address IPv4 address separated by dots
       */
      bind(address){
         if(this.protocol == 'nodeworker') return;
         this.#tagetAdd = address;
      }


      close(){
         if(this.protocol == 'nodeworker') return;
         this.#socket.close();
      }

      /**send masssage to the other end
       *
       * @param {string} channel channel to send this message to
       * (if the receiver end didn't listen for this channel they won't see this masssage)
       * @param {...*} contents contents (massages) to send, can be any standard Javascript objects
       * @returns {Promise<void>}
       */
      async send(channel, ...contents){
         return new Promise((resolve, reject) => {
            if(!channel) throw new Error('channel must be provided');
            if(typeof channel != 'string')
               throw new Error(`channel must be a type of 'string' instead given '${typeof channel}'`);


            const _package = this.protocol == 'nodeworker'? {
               channel,
               contents: contents.map(c => {
                  if(isWorkerTransferable(c)) return c;
                  return '@JSON:' + JSON.stringify(c, Tools.JSONReplacer);
               })
            }: Buffer.from(
               JSON.stringify({
                  channel,
                  contents
               }, Tools.JSONReplacer)
            );

            // const _package = Buffer.from(
            //    JSON.stringify({
            //       channel,
            //       contents
            //    }, Tools.JSONReplacer)
            // );

            if(this.protocol == 'nodeworker'){
               this.#socket.postMessage(_package);
               resolve();
               return;
            }

            this.#socket.send(_package, this.port, this.#tagetAdd, (err, bytes) => {
               if(err) reject(err);
               resolve();
            });
         });
      }

      /**listen on the given channel for messages
       * @param {string} channel channel to send this message to
       * (if the receiver end didn't listen for this channel they won't see this masssage)
       * @param {function(...any): void} callback callback when the massage for this channel is received
       */
      on(channel, callback){
         let listener = this.#listeners.get(channel);
         if(!listener){
            this.#listeners.set(channel, [
               new Tools.IPC.Listener(0, callback)
            ]);
            return;
         }

         listener.push(
            new Tools.IPC.Listener(0, callback)
         );
      }

      /**listen on the given channel for messages
       *
       * **Note That**: this listener will only be called once
       * @param {string} channel channel to send this message to
       * (if the receiver end didn't listen for this channel they won't see this masssage)
       * @param {function(...any): void} callback callback when the massage for this channel is received
       */
      once(channel, callback){
         let listener = this.#listeners.get(channel);
         if(!listener){
            this.#listeners.set(channel, [
               new Tools.IPC.Listener(1, callback)
            ]);
            return;
         }

         listener.push(
            new Tools.IPC.Listener(1, callback)
         );
      }

      /**
       * Removes a listener from the IPC channel
       *
       * if given a channel name, it will remove all listeners on that channel
       * @param {string|function} listener - The listener to remove. Can be a channel name (string) or a callback function.
       * @throws {Error} If the listener is not a string or function.
       * @returns {boolean} `true` if the listener was removed, `false` if it was not removed.
       */
      remove(listener){
         if(typeof listener == 'string'){
            this.#listeners.delete(listener);
            return true;
         }

         if(typeof listener != 'function')
            throw new Error(`listener must be a type of 'string' or 'function' instead given '${typeof listener}'`);

         for(const [channel, lis_cb] of this.#listeners){
            const tartget_cb = lis_cb.find(lis => lis.callback == listener);
            if(!tartget_cb) continue;

            const filtered = lis_cb.filter(lis => lis.callback != listener);
            if(!filtered) {
               this.#listeners.delete(channel);
               return true;
            }
            this.#listeners.set(
               channel,
               lis_cb.filter(lis => lis.callback != tartget_cb)
            );
            return true;
         }

         return false;
      }

      /**A quick way to send a message and wait for a response
       * with built-in timeout
       * @param {string} channel channel to send this message to
       * @param {number|null} timeout timeout in milliseconds, if expired the promise will be rejected
       * @param {...*} contents contents (massages) to send, can be any standard Javascript objects
       * @returns {Promise<any>}
       * @throws `IPCAskTimeout`
       */
      async ask(channel, timeout, ...contents){
         return new Promise((resolve, reject) => {
            let transmitTimeout;
            if(timeout){
               transmitTimeout = setTimeout(() => {
                  reject(new Tools.Err(`Tools.IPC: ask timeout on channel: ${channel}`, 'IPCAskTimeout'));
               }, timeout);
            }

            this.once(channel, res => {
               if(timeout) clearTimeout(transmitTimeout);
               resolve(res);
            });

            this.send(channel, ...contents);
         });
      }

      /**listen on the given channel for messages
       *
       * **Similar to** `ipc.on(channel, callback)` but will respond with what `callback`
       * function returns to the same channel
       *
       * @param {string} channel channel to send this message to
       * (if the receiver end didn't listen for this channel they won't see this masssage)
       * @param {function(...any): any|function(...any): Promise<any>} callback callback when the massage for this channel is received
       */
      onAsk(channel, callback) {
         const handleAsk = async (...args) => {
            const res = await callback(...args);
            this.send(channel, res);
         }

         this.on(channel, handleAsk);
      }

      /**
       * @typedef {object} Package
       * @property {string} channel - the channel this message was sent on
       * @property {any[]} contents - the message contents
       */
      /**
       * @param {Buffer|Package} rawPackage
       * @returns {void}
       */
      #handleIncomePackage = (rawPackage) => {
         /**
          * @type {Package}
          */
         const _package = this.protocol == 'nodeworker'?
            {
               channel: rawPackage.channel,
               contents: rawPackage.contents.map(c => {
                  if(typeof c == 'string'&&c.startsWith('@JSON:'))
                     return JSON.parse(c.slice(6), Tools.JSONReviver);
                  return c;
               })
            }:
            JSON.parse(rawPackage.toString(), Tools.JSONReviver);

         let listener = this.#listeners.get(_package.channel);
         if(!listener) return;

         for(const lis of listener){
            lis.callback(..._package.contents);
            if(lis.type == 1) this.remove(lis.callback);
         }
      }
   },



   /**this function will return **true** if
    * string is only numbers [0-9.+-] and NO characters
    * @param {string}str
    */
   isNumber: (str) => {
      return /^[0-9]+$|^[0-9]+\\.[0-9]+$/.test(str);
   },


   /**return True if the given Object is an array with nothing inside
    */
   isEmptyArray: obj => (obj instanceof Array)&&!obj.length,


   /**return True if the given Object is a standard Object (`{}`) with no property
    */
   isEmptyObject: obj =>
      !(obj instanceof Array)&&(obj instanceof Object)&&!Tools.propertiesCount(obj),


   /**check if the given path contains is valid
    * (no invali chars)
    *
    * **Note That**: this checking is for path only and not filename
    * thus all type of slash is consider  valid
    */
   isValidFilePath(path){
      if(!path||!path?.length) return false;
      if(/[:?"<>|*]/g.test(path)) return false;
      return true;
   },


   /**a JSON Replacer for `JSON.stringify()`
    * that allow most standard Javascript Object to be parsed including **Map** and **Set**
    *
    * ### The JSON value must be *parsed* with `JSONReviver()` for this to work
    * @template T
    * @param {T} value
    * @param {string} key
    * @returns {T}
    * @example
    * const objWithNonParsable = {
    *    map: new Map([[2, 'two'], [3, 'three']]),
    *    set: new Set([1, 2, 3]),
    *    normalStuff: 'hello!'
    * };
    * const json = JSON.stringify(objWithNonParsable, JSONReplacer);
    * //    ^ string JSON Object
    * const parsedObj = JSON.parse(json, JSONReviver);
    * console.log(parsedObj);
    * // ^ log {
    * //    map: Map { 2 => 'two', 3 => 'three' },
    * //    set: Set { 1, 2, 3 },
    * //    normalStuff: 'hello!'
    * //  }
    */
   JSONReplacer(key, value) {
      switch(typeof value){
         case 'function':
            return {
               '@dataType': 'function',
               '@value': value.toString().replace(/\n* {2,}|\n/g, ''),
            }
         case 'bigint':
            return {
               '@dataType': 'BigInt',
               '@value': value.toString(),
            };
      }

      if(value instanceof Map){
         return {
            '@dataType': 'Map',
            '@value': Array.from(value.entries()),
         };
      }

      if(value instanceof Set){
         return {
            '@dataType': 'Set',
            '@value': Array.from(value.values()),
         };
      }

      return value;
   },


   /**a JSON Replacer for `JSON.parse()`
    * that allow most standard Javascript Object to be parsed including **Map** and **Set**
    *
    * ### The JSON value must be *stringified* with `JSONReplacer()` for this to work
    *
    * @template T
    * @param {T} value
    * @param {string} key
    * @returns {T}
    * @example
    * const objWithNonParsable = {
    *    map: new Map([[2, 'two'], [3, 'three']]),
    *    set: new Set([1, 2, 3]),
    *    normalStuff: 'hello!'
    * };
    * const json = JSON.stringify(objWithNonParsable, JSONReplacer);
    * //    ^ string JSON Object
    * const parsedObj = JSON.parse(json, JSONReviver);
    * console.log(parsedObj);
    * // ^ log {
    * //    map: Map { 2 => 'two', 3 => 'three' },
    * //    set: Set { 1, 2, 3 },
    * //    normalStuff: 'hello!'
    * //  }
    */
   JSONReviver(key, value) {
      if (!value||!value['@dataType']) return value;

      switch(value['@dataType']){
         case 'function':
            return new Function('return ' + value['@value'])();
         case 'BigInt':
            return BigInt(value['@value']);
         case 'Map':
            return new Map(value['@value']);
         case 'Set':
            return new Set(value['@value']);
      }

      return value;
   },


   /**clean file name by replace ALL invalid char with valid ones
    * @param rawName file name to clean
    * @param replaceChar char to replace, default to `_`
    * @returns cleaned name
    */
   fileNameCleaner(rawName, replaceChar = '_'){
      if(!rawName||typeof rawName != 'string')
         throw new Error('the given `rawName` isn\'t a string');
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

      return path.replace(/[:?"<>|*]/g, replaceStr);
   },



   /**reformat YouTube url in different variation
    * to a standard `https://www.youtube.com/watch?v=...`
    * @param {string}url
    */
   fixYTurl(url){
      url = url||undefined;
      if(!url) throw 'url can\'t be falsy!!';
      if(url.includes("youtu.be")){
         url = url.replace(
            "https://youtu.be/",
            "https://www.youtube.com/watch?v="
         );
      }

      if(url.includes("&list=")){ // remove playlist id
         url = url.split("&list=")[0];
      }

      if(url.includes("?si=")){ // remove si tag
         url = url.split("?si=")[0];
      }

      if(url.includes("https") == false){
         url = "https://www." + url;
      }
      return url;
   },







   /**return type of content judging only from file Extension
    * @param {string}fileExt
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
         fileExt == 'pbm'||
         fileExt == 'pgm'||
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
         fileExt == 'gif'||
         fileExt == 'webm'
      )

      if(images) return 'image';
      else if(text) return 'text';
      else if(binary) return 'binary';
      else if(media) return 'media';
      return null;
   },



   jsTime: {
      /**
       * compare two date and return the difference in human readable format
       * @param {Date} [nowDate=new Date()]
       * @param {Date} lastDate
       * @returns {string}
       */
      howLong(lastDate, nowDate = new Date()){
         let msDifference = nowDate.getTime() - lastDate.getTime();
         return Tools.jsTime.getTimeFromMS(msDifference).modern();
      },

      /**
       * @typedef {object} Time
       * @property {number} year
       * @property {number} month
       * @property {number} days
       * @property {number} hr
       * @property {number} min
       * @property {number} sec
       * @property {string} ms
       * @property {() => string} toString
       * @property {() => string} modern to modern time string
       */
      /**## Time from Millisecond
       *
       * calculate minute, hour, day etc. from millisecond
       * @param {number} ms millisecond
       * @returns {Time}
       */
      getTimeFromMS(ms){
         let year = 0, month = 0, days = 0, hr = 0, min = 0, sec = 0;
         const useDDMMYYYFormat = (ms > 262800200);
         while(ms >= 1000){
            ms -= 1000;
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

         if(useDDMMYYYFormat){
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


         if(useDDMMYYYFormat){
            return {
               year, month, days, hr, min, sec, ms,
               toString(){
                  return `${year}:${month}:${days}|${hr}:${min}:${sec}.${ms.toString().padStart(3, '0')}`;
               },
               modern(){
                  if(year + month + days + sec + min + hr == 0) return `${ms}ms`;
                  else if(year + month + days + min + hr == 0) return `${sec}.${ms}s`
                  else if(year + month + days + hr == 0) return `${min}min ${sec}s`
                  else if(year + month + days == 0) return `${hr}hr ${min}min`;
                  else if(year + month == 0) return `${days}days ${hr}hr`
                  else if(year == 0) return `${month}months ${days}days`
                  else return `${year}year ${month}months`
               }
            }
         }

         return {
            year, month, days, hr, min, sec, ms,
            toString() { return `${hr}:${min}:${sec}.${ms.toString().padStart(3, '0')}`; },
            modern(){
               if(sec + min + hr == 0) return `${ms}ms`;
               else if(min + hr == 0) return `${sec}.${ms}s`
               else if(hr == 0) return `${min}min ${sec}s`
               else return `${hr}hr ${min}min`
            }
         }
      }
   },


   // LINK: @ndwk2s description
   /**
    * @typedef {{[key: string]: TValue}} GenericObject
    * @template TValue
    */
   /**
    * ## remap
    *
    * similar to `Array.map()` but for Map and Object
    *
    * callback function should return an Object with `key` and `value` property
    * , undefined to delete the pair or **`null`** to keep the pair as is
    * @template TVal, TKey
    * @param {Map<TKey, TVal>|GenericObject<TVal>} obj object to map
    * @param {(key: TKey|string, value: TVal, obj: Map<TKey, TVal>|GenericObject<TVal>) => {key: any, value: any}|undefined|null} callback
    * Parameters:
    * - `key` - the key of the current element being processed in the object/map
    * - `value` - the value of the current element being processed in the object/map
    * - `obj` - the object/map that is being mapped
    * @returns {Map|GenericObject<any>}
    */
   remap(obj, callback){
      if(obj instanceof Map){
         const newMap = new Map;
         for(const [key, value] of obj){
            const modValue = callback(key, value, newMap);

            if(modValue === undefined) continue;
            if(modValue === null) newMap.set(key, value);

            if(modValue.key === undefined){
               newMap.set(key, modValue);
            }

            newMap.set(modValue.key, modValue.value);

            if(modValue.key !== key&&newMap.has(key)){
               newMap.delete(key);
            }
         }
         return newMap;
      }

      const newObj = {};
      for(const key in obj){
         const modValue = callback(key, obj[key], newObj);

         if(modValue === undefined) continue;
         if(modValue === null) newObj[key] = obj[key];

         if(modValue.key === undefined){
            newObj[key] = modValue;
         }

         newObj[modValue.key] = modValue.value;

         if(modValue.key !== key&&newObj[key] !== undefined){
            delete newObj[key];
         }
      }
      return newObj;
   },



   /**ToolsKit for doing complex math
    */
   MathKit: {
      /**clamp a value between min and max
       * @param {number} max
       * @param {number} min
       */
      clamp(value, min, max){
         return Math.min(Math.max(value, min), max);
      },

      /**convert radians to degrees
       * @param {number} rad
       */
      degrees(rad){
         return rad * 180 / Math.PI;
      },

      /**Calculates Distance Between Two Points
       * @param {Point} pointA
       * @param {Point} pointB
       */
      distanceFrom(pointA, pointB){
         const x = pointB.x - pointA.x;
         const y = pointB.y - pointA.y;
         const z = pointB.z - pointA.z;
         return Math.sqrt(
            x**2 + (isNaN(y)? 0: y**2) + (isNaN(z)? 0: z**2)
         );
      },

      /**## Dormand-Prince method
       *
       * a type of Runge-Kutta method used for solving ordinary differential equations (ODEs).
       *
       * @from [npm-numeric](https://github.com/sloisel/numeric/tree/master)
       *
       * for more info on how the calculation is done, visit [Numerary](https://numerary.readthedocs.io/en/latest/dormand-prince-method.html).
       *
       * for more info on **Butcher tableau** and the method, visit [Dormand-Prince method Wiki](https://en.wikipedia.org/wiki/Dormand%E2%80%93Prince_method)
       *
       * @param {number} x0 initial x value
       * @param {number} x1 final x value
       * @param {number} y0 initial y value
       * @param {function(number, number): number} f function to be integrated
       * @param {number} [tol=1e-6] tolerance
       * @param {number} [maxit=1000] maximum number of iterations
       * @param {function(number, number): number|undefined} [event] event function
       */
      dopri(x0, x1, y0, f, tol = 1e-6, maxit = 1000, event) {
         let xs = [x0], ys = [y0], k1 = [f(x0, y0)], k2, k3, k4, k5, k6, k7, ymid = [];

         // Butcher tableau
         const A2 = 1 / 5;
         const A3 = [3 / 40, 9 / 40];
         const A4 = [44 / 45, -56 / 15, 32 / 9];
         const A5 = [19372 / 6561, -25360 / 2187, 64448 / 6561, -212 / 729];
         const A6 = [9017 / 3168, -355 / 33, 46732 / 5247, 49 / 176, -5103 / 18656];
         const b = [35 / 384, 0, 500 / 1113, 125 / 192, -2187 / 6784, 11 / 84];
         const bm = [
            0.5 * 6025192743 / 30085553152,
            0,
            0.5 * 51252292925 / 65400821598,
            0.5 * -2691868925 / 45128329728,
            0.5 * 187940372067 / 1594534317056,
            0.5 * -1776094331 / 19743644256,
            0.5 * 11237099 / 235043384
         ];
         const c = [1 / 5, 3 / 10, 4 / 5, 8 / 9, 1, 1];
         const e = [-71 / 57600, 0, 71 / 16695, -71 / 1920, 17253 / 339200, -22 / 525, 1 / 40];


         let i = 0, er, j;
         let h = (x1 - x0) / 10;
         let it = 0;
         let y1, erinf;
         let e0, e1, ev;
         let ret = new Dopri(xs, ys, k1, ymid, -1, "");
         if (typeof event === "function") e0 = event(x0, y0);

         while (x0 < x1 && it < maxit) {
            ++it;
            if (x0 + h > x1) h = x1 - x0;

            k2 = f(
               x0 + c[0] * h,
               (y0 + (A2 * h * k1[i]))
            );
            k3 = f(
               x0 + c[1] * h,
               ((y0 + (A3[0]* h * k1[i])) + (A3[1] * h * k2))
            );
            k4 = f(
               x0 + c[2] * h,
               (((y0 + (A4[0] * h * k1[i])) + (A4[1] * h * k2)) + (A4[2] * h * k3))
            );
            k5 = f(
               x0 + c[3] * h,
               ((((y0 + (A5[0] * h * k1[i])) + (A5[1] * h * k2)) + (A5[2] * h * k3)) + (A5[3] * h * k4))
            );
            k6 = f(
               x0 + c[4] * h,
               (
                  y0 + (A6[0] * h * k1[i]) + (A6[1] * h * k2) +
                  (A6[2] * h * k3) + (A6[3] * h * k4) + (A6[4] * h * k5)
               )
            );
            y1 = (
               y0 + (k1[i] * h * b[0]) + (k3 * h * b[2]) + (k4 * h * b[3]) +
               (k5 * h * b[4]) + (k6 * h * b[5])
            );
            k7 = f(x0 + h, y1);
            er = (
               (k1[i] * h * e[0]) + (k3 * h * e[2]) + (k4 * h * e[3]) +
               (k5 * h * e[4]) + (k6 * h * e[5])) + (k7 * h * e[6]
            );

            erinf = Math.abs(er);

            if (erinf > tol) { // reject
               h = 0.2 * h * Math.pow(tol / erinf, 0.25);
               if (x0 + h === x0) {
                  ret.msg = "Step size became too small";
                  break;
               }
               continue;
            }
            ymid[i] = (
               y0 + (k1[i] * h * bm[0]) + (k3 * h * bm[2]) + (k4 * h * bm[3]) +
               (k5 * h * bm[4]) + (k6 * h * bm[5]) + (k7 * h * bm[6])
            );
            ++i;
            xs[i] = x0 + h;
            ys[i] = y1;
            k1[i] = k7;


            if (typeof event === "function") {
               let yi, xl = x0, xr = x0 + 0.5 * h, xi;
               e1 = event(xr, ymid[i - 1]);
               ev = e0 < 0 && 0 < e1;

               if(ev){
                  let en, ei;
                  let side = 0, sl = 1.0, sr = 1.0;
                  while (1) {
                     if (typeof e0 === "number") xi = (sr * e1 * xl - sl * e0 * xr) / (sr * e1 - sl * e0);
                     else {
                        xi = xr;
                        for (j = e0.length - 1; j !== -1; --j) {
                           if (e0[j] < 0 && e1[j] > 0) xi = Math.min(xi, (sr * e1[j] * xl - sl * e0[j] * xr) / (sr * e1[j] - sl * e0[j]));
                        }
                     }
                     if (xi <= xl || xi >= xr) break;
                     yi = ret._at(xi, i - 1);
                     ei = event(xi, yi);
                     en = e0 < 0 && 0 < ei;
                     if (en) {
                        xr = xi;
                        e1 = ei;
                        ev = en;
                        sr = 1.0;
                        if (side === -1) sl *= 0.5;
                        else sl = 1.0;
                        side = -1;
                     } else {
                        xl = xi;
                        e0 = ei;
                        sl = 1.0;
                        if (side === 1) sr *= 0.5;
                        else sr = 1.0;
                        side = 1;
                     }
                  }
                  y1 = ret._at(0.5 * (x0 + xi), i - 1);
                  ret.f[i] = f(xi, yi);
                  ret.x[i] = xi;
                  ret.y[i] = yi;
                  ret.ymid[i - 1] = y1;
                  ret.events = ev;
                  ret.iterations = it;
                  return ret;
               }


               xl = xr;
               xr = x0 + h;
               e0 = e1;
               e1 = event(xr, y1);
               ev = e0 < 0 && 0 < e1;
            }
            x0 += h;
            y0 = y1;
            e0 = e1;
            h = Math.min(0.8 * h * Math.pow(tol / erinf, 0.25), 4 * h);
         }
         ret.iterations = it;
         return ret;
      },


      /**## calculate parts of Area under the graph
       *
       * expression must contains only one Variable (X)
       *
       * ### Note: requires `mathjs`
       *
       * @param {string|any}expression
       * Math expression of **function of x** or a **mathjs** expression
       * @param {number|string}upper upper number
       * @param {number|string}lower lower number
       * @returns {number} intergration result (Area)
       *
       * @example
       * // enter expression directly as string
       * integral('x^2', 1, 0) // 0.3333333333333333
       *
       * // or use mathjs expression
       * const mjs = require('mathjs');
       * integral(mjs.compile('x^2'), 1, 0) // 0.3333333333333333
       */
      integral(expression, upper, lower){
         if(lower > upper) throw new Error(`lower bound must be less than upper bound`);
         if(lower == upper) return 0;

         if(!Tools._modules.mathjs){
            throw new Error(`module 'mathjs' not loaded use 'Tools._modules.mathjs = require("mathjs")' to load it`);
         }

         let _express;
         if(typeof(expression) == 'string')
            _express = Tools._modules.mathjs.compile(expression);
         else _express = expression;

         if(typeof(lower) == 'string') lower == Tools._modules.mathjs.evaluate(lower);
         if(typeof(upper) == 'string') upper == Tools._modules.mathjs.evaluate(upper);

         const f_x = x => _express.evaluate({x: x});
         return Tools.MathKit.dopri(lower, upper, 0, f_x).at(upper);
      },

      /**linear interpolation function:
       * this function will return any % of `Max` value
       * depends on `Percentage` if 0 will return `Min`, 1 return `Max`
       * and anything in between will return any value between `Min` and `Max`
       * @param {number}Min min value return `Min` when `Percentage` == 0
       * @param {number}Max max value return `Max` when `Percentage` == 1
       * @param {number}Percentage percentage of the `Max` value
       */
      lerp(Min, Max, Percentage){
         return Min + (Max - Min) * Percentage;
      },

      /**## Left Shift Unsigned with `0` or `(<<)`
       *
       * translate to `n << a`
       *
       * this is a workaround for the fact that Javascript bitwise operators
       * only work on signed 32bit number
       * @param {number} a shift amount
       * @param {number} n number to shift
       */
      Lsh_us(n, a){
         return n * (2 ** a);
      },


      /**## Bitwise NOT opreator for unsigned 16bit number
       *
       * this is a workaround for the fact that
       * Javascript bitwise operator only work on signed 32bit number
       *
       * @param {number} x
       */
      not_us16(x){ return x ^ 0xffff },

      /**## Bitwise NOT opreator for unsigned 32bit number
       *
       * this is a workaround for the fact that
       * Javascript bitwise operator only work on signed 32bit number
       *
       * @param {number} x
       */
      not_us32(x){ return x ^ 0xffffffff },

      /**## Bitwise NOT opreator for unsigned 8bit number
       *
       * this is a workaround for the fact that
       * Javascript bitwise operator only work on signed 32bit number
       *
       * @param {number} x
       */
      not_us8(x){ return x ^ 0xff },

      /**map number's range
       * @param {number} x number to map
       * @param {number} Xmin min number of x
       * @param {number} Xmax max number of x
       * @param {number} Tmax target max number
       * @param {number} Tmin target min number
       * @requires {number} mapped number
       */
      map(x, Xmin, Xmax, Tmin, Tmax){
         return (x - Xmin) / (Xmax - Xmin) * (Tmax - Tmin) + Tmin;
      },


      /**represents a Point in 1 - 3d space
       */
      Point,

      /**convert degrees to radians
       * @param {number} deg
       */
      radians(deg){
         return deg * Math.PI / 180;
      },



      /**## Right Shift Unsigned with `0` or `(>>)`
       *
       * translate to `n >> a`
       *
       * this is a workaround for the fact that Javascript bitwise operators
       * only work on signed 32bit number
       * @param {number} a shift amount
       * @param {number} n number to shift
       */
      Rsh_us(n, a){
         return Math.floor(n / (2 ** a));
      },

      /**## sum
       *
       * return the sum of all given numbers
       *
       * numbers can be 1-5D array or just numbers
       * @param {...number|number[]|number[][]|number[][][]|number[][][][]|number[][][][][]}Xs
       * @returns {number}
       */
      sum: (...Xs) => {
         Xs = Xs.flat(5);
         return Xs.reduce((a, b) => a + b, 0);
      },

      /**Convert from Cartesian to Polar coordinates where **Theta** (t) units is specified by `unit`
       * @param {number} x
       * @param {number} y
       * @param {'r'|'d'} [unit='r'] unit of `t` **R**adians or **D**egrees (default to Radians)
       */
      toPolarCoords(x, y, unit = 'r'){
         if(!unit||(unit != 'd'&&unit != 'r')) throw new Error("unit must be 'r' or 'd', given: " + unit);
         let t = Math.atan(y / x);
         if(y < 0&&x < 0) t += 360;
         else if(x < 0) t += 180;

         return {
            r: Math.sqrt(x ** 2 + y ** 2),
            t: unit == 'd'? t: Tools.MathKit.radians(t)
         }
      },

      /**# Convert from Polar (Spherical coordinate system) to Cartesian coordinates
       *
       * about Spherical coordinate system [see](https://en.wikipedia.org/wiki/Spherical_coordinate_system)
       * @param {number} r
       * @param {number} alpha the horizontal angle from the X axis (θ)
       * @param {number||null} polar the vertical angle from the Z axis (φ)
       * @param {'r'|'d'} [unit='r'] unit of `t` **R**adians or **D**egrees (default to Radians)
       */
      toCartesianCoords(r, alpha, polar = null, unit = 'r'){
         if(!unit||(unit != 'd'&&unit != 'r'))
            throw new Error("unit must be 'r' or 'd', given: " + unit);
         if(polar !== null&&typeof polar != 'number')
            throw new Error('polar must be a number');

         if(unit == 'd'){
            alpha = Tools.MathKit.radians(alpha);
            if(polar !== null) polar = Tools.MathKit.radians(polar);
         }

         if(polar === null){
            return {
               x: r * Math.cos(alpha),
               y: r * Math.sin(alpha)
            }
         }else{
            return {
               x: r * Math.sin(polar) * Math.cos(alpha),
               y: r * Math.sin(polar) * Math.sin(alpha),
               z: r * Math.cos(polar)
            }
         }
      },
   },



   /**similar to `Number.toFixed()` but will use minimal amount of Digits possible,
    *
    * in short: this will remove all trailing 0's.
    * @param {number} number
    * @param {number} maxFractDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
    */
   maxFraction(number, maxFractDigits){
      const snum = number.toString();
      if (!snum.includes('.')) return snum;

      return number.toFixed(maxFractDigits).replace(/\.?0+$/, '');
   },


   /**(**Node Console Color**) return the Node.js Console Text formats, use this format to change
    * how Console Text looks.
    * @param {'Reset'|'Bright'|'Dim'|'Italic'|'Blink'|'Invert'|'Hidden'|'Black'|'Red'|'Green'|'Yellow'|'Blue'|'Magenta'|'Cyan'|'White'|'BgBlack'|'BgRed'|'BgGreen'|'BgYellow'|'BgBlue'|'BgMagenta'|'BgCyan'|'BgWhite'|number}color
    * **true color (24Bit)**, **preset (8Bit) color** or **color format** of choice (if omit: 'Reset', invlid: 'white')
    * @example
    * format available: `Reset, Bright, Dim, Italic, Blink, Invert, Hidden`
    * fontcolor: `Black, Red, Green, Yellow, Blue, Magenta, Cyan, White`
    * background color: `BgBlack, BgRed, BgGreen, BgYellow, BgBlue, BgMagenta, BgCyan, BgWhite`
    *
    * @param {'bg'|'fg'} mode only use when **`color`** is number (true 24bit color)
    *
    * **'bg'** for specifying the color as **Background color**
    *
    * **'fg'** for specifying the color as **Foreground color**
    *
    * @param {boolean} [force8Bit=false] **'8bit'** force the use of **8Bit** color instead of **24Bit** color despite given true color
    *
    * @returns {string} the format code for changing node.js Console Text formats
    * @example //Usage...
    * const textToLog = 'I\'m Red boi!!!';
    *
    * //use Reset format to made sure only `textToLog` are effected
    * console.log(`${ncc('Red')}%s${ncc('Reset')}`, textToLog);
    * //Log red "I'm Red boi!!!" text on the Terminal
    *
    * console.log(`${ncc(0xef3820, 'fg')}%s${ncc('Reset')}`, textToLog);
    * //Log custom 24Bit red "I'm Red boi!!!" text on the Terminal
    */
   ncc(color = null, mode = null, force8Bit = null){
      if(color == null) return '\x1b[0m';// return 'reset'

      // using custom 24 bit color, see: https://en.wikipedia.org/wiki/ANSI_escape_code#24-bit
      if(typeof color == 'number'){
         const rgb = Tools.Convert.decimalColorToRGB(color);
         if(force8Bit === null) force8Bit = (Tools.CheckCache.supportsColor == 0);

         if(!force8Bit){
            // \x1b[<3|4>8;2;<r>;<g>;<b>m
            return `\x1b[${mode == 'bg'?'4':'3'}8;2;${rgb.r};${rgb.g};${rgb.b}m`;
         }

         color = (mode == 'bg'?'bg':'') + _8bitColorFromRGB(rbg);
      }

      color = color.toLocaleLowerCase();

      switch (color) {
         case 'black': return '\x1b[30m';
         case 'red': return '\x1b[31m';
         case 'green': return '\x1b[32m';
         case 'yellow': return '\x1b[33m';
         case 'blue': return '\x1b[34m';
         case 'magenta': return '\x1b[35m';
         case 'cyan': return '\x1b[36m';
         case 'white': return '\x1b[37m';

         case 'reset': return '\x1b[0m';
         case 'bright': return '\x1b[1m';
         case 'dim': return '\x1b[2m';
         case 'italic': return '\x1b[3m';
         case 'blink': return '\x1b[5m';
         case 'invert': return '\x1b[7m';
         case 'hidden': return '\x1b[8m';

         case 'bgblack': return '\x1b[40m';
         case 'bgred': return '\x1b[41m';
         case 'bggreen': return '\x1b[42m';
         case 'bgyellow': return '\x1b[43m';
         case 'bgblue': return '\x1b[44m';
         case 'bgmagenta': return '\x1b[45m';
         case 'bgcyan': return '\x1b[46m';
         case 'bgwhite': return '\x1b[47m';

         default: return '\x1b[37m'; // return white
      }

      function _8bitColorFromRGB(rgb){
         const r = rgb.r > 127;
         const g = rgb.g > 127;
         const b = rgb.b > 127;

         // switch how much color is being mixed in
         switch(r + g + b){
            case 3: return 'white';
            case 0: return 'black';
            case 2:
               if(!r) return 'cyan';
               else if(!g) return 'magenta';
               else if(!b) return 'yellow';
            case 1:
               if(r) return 'red';
               else if(g) return 'green';
               else if(b) return 'blue';
         }
      }
   },


   /**return the index of element in which its value is the closest
    * to the given number,
    * if the given Array is empty: return `null`
    * @param {number[]}arr Array of Numbers
    * @param {number}num the target Number
    */
   nearestNumber(arr, num){
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



   // LINK: @ndwk2s description
   /**
    * ## `Tools.objectMap()` is deprecated, use `Tools.remap()` instead
    *
    * > for backward compatibility, this function remains as an alias for `Tools.remap()`
    *
    * ### `Tools.remap()` description:
    * similar to `Array.map()` but for Map and Object
    *
    * callback function should return an Object with `key` and `value` property
    * or undefined to delete the key
    * @template TVal, TKey
    * @param {Map<TKey, TVal>|GenericObject<TVal>} obj object to map
    * @param {(key: TKey|string, value: TVal, obj: Map<TKey, TVal>|GenericObject<TVal>) => {key: any, value: any}|undefined|null} callback
    * Parameters:
    * - `key` - the key of the current element being processed in the object/map
    * - `value` - the value of the current element being processed in the object/map
    * - `obj` - the object/map that is being mapped
    * @returns {Map|GenericObject<any>}
    */
   objectMap(obj, callback){
      return Tools.remap(obj, callback);
   },




   /**Find the number of Properties in an Object
    * Object Property can refer as Items in an Object while each Item consist of pair of `Key: Value`
    * @param {object}object
    * @returns Number of Property inside
    */
   propertiesCount(object) {
      return Object.keys(object).length;
   },

   /**
    * like `String.padEnd` but escape all ANSI codes
    * @param {string} str
    * @param {number} targetLength
    * @param {string} [padString=' ']
    * @param {number} [redundancyLv=0] complexity of how string width (size that will be displayed, not to be confused with the actual *length* of the string) is calculated (suports `-1`: none, `0`:  ANSI code, `1`: fullwidth chars, `2`: Emoji)
    */
   padEnd(str, targetLength, padString = ' ', redundancyLv = 0){
      const actualLength = Tools.ex_length(str, redundancyLv);
      if(actualLength >= targetLength) return str;

      return str + padString.repeat(targetLength - actualLength);
   },

   /**
    * like `String.padStart` but escape all ANSI codes
    * @param {string} str
    * @param {number} targetLength
    * @param {string} [padString=' ']
    * @param {number} [redundancyLv=0] complexity of how string width (size that will be displayed, not to be confused with the actual *length* of the string) is calculated (suports `-1`: none, `0`:  ANSI code, `1`: fullwidth chars, `2`: Emoji)
    */
   padStart(str, targetLength, padString = ' ', redundancyLv = 0){
      const actualLength = Tools.ex_length(str, redundancyLv);
      if(actualLength >= targetLength) return str;

      return padString.repeat(targetLength - actualLength) + str;
   },

   /**
    * @typedef {Record<string, ParseArg_Arg> & { _unmatched: ParseArg_Arg[] }} ParseArgs
    * @property {ParseArg_Arg[]} _unmatched Unmatched Arguments
    */
   /**parse command line arguments
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
            type: 'int' // <- type can be 'int', 'let ', 'string', 'choice', 'flag'
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
      console.log(parseArgs(a, myParams));
      // Prints:
      // { _unmatched:
      //   [ Arg { value: 'myapp', index: 0, type: undefined },
      //      Arg { value: 'bla bla', index: 1, type: undefined } ],
      // name: Arg { value: 'Jim', index: 3, type: 'string' },
      // hasCar: Arg { value: true, index: 4, type: 'flag' },
      // age: Arg { value: 34, index: 6, type: 'int' },
      // gender: Arg { value: 'f', index: -1, type: 'choice' } }
    * @param {string[]} args commandline args
    * @param {Object} params Paramiter rules object
    * @param {boolean} caseSensitive
    * @returns {ParseArgs}
    */
   parseArgs(args, template, caseSensitive = false){
      let parsed = {
         _unmatched: []
      };
      let requiredList = new Set();
      for(const pName in template){
         if(template[pName]?.required)
            requiredList.add(pName);
      }

      for(let i = 0; i < args.length; i++){
         let matched = false;
         for(const pName in template){
            if(!template[pName]?.pattern)
               throw new Error('invalid template: Object structure missmatched. every entries requires `pattern` property');

            if (!isKeyMatched(args[i], template[pName].pattern)) continue;
            requiredList.delete(pName);

            // Value Checking and Parsing
            if (template[pName]?.isFlag||template[pName]?.type == 'flag') {
               matched = true;
               parsed[pName] = new ParseArg_Arg(true, i, 'flag');
               continue;
            }

            let nextArgNotAValue = false;
            if(i + 1 < args.length){
               for (const p in template) {
                  if (isKeyMatched(args[i + 1], template[p].pattern))
                     nextArgNotAValue = true;
               }
            }

            if (i + 1 >= args.length || nextArgNotAValue)
               throw new Error(`argument '${args[i]}' requires a Value`);
            try {
               switch (template[pName]?.type) {
                  case 'int':
                     if (
                        isNaN(parsed[pName] = new ParseArg_Arg(parseInt(args[++i]), i))
                     ) throw new Error('typemissmatched');
                     break;
                  case 'let ':
                     if (
                        isNaN(parsed[pName] = new ParseArg_Arg(parseFloat(args[++i]), i))
                     ) throw new Error('typemissmatched');
                     break;
                  case 'choice':
                     if (!template[pName]?.choices?.length)
                        throw new Error('invalid template: Object structure missmatched. entry of type \'choice\' requires `choices` property');

                     if (!isKeyMatched(args[++i], template[pName].choices) &&
                        template[pName]?.default == undefined
                     ) {
                        throw new Error(`invalid value for '${args[i - 1]}' argument, requires any of these Choices: ${template[pName].choices}`);
                     }

                     parsed[pName] = new ParseArg_Arg(args[i], i);
                     break;
                  default:
                     parsed[pName] = new ParseArg_Arg(args[++i], i);
                     break;
               }

               matched = true;
               parsed[pName].type = template[pName]?.type || 'string';
            } catch (err) {
               if (err.message == 'typemissmatched')
                  throw new Error(`argument '${args[i - 1]}' requires a Value of type '${template[pName]?.type}'`);
               throw err;
            }
         }

         if(!matched)
            parsed._unmatched.push(new ParseArg_Arg(args[i], i));
      }


      // check for required arguments
      if(requiredList.size > 0)
         throw new Error(`argument(s) '${[...requiredList]}' is required.`);

      // fill default value
      for(const pName in template){
         if(template[pName]?.isFlag||template[pName]?.type == 'flag'){
            if(!parsed[pName]) parsed[pName] = new ParseArg_Arg(false, -1, 'flag');
            continue;
         }

         if(!parsed[pName]){
            parsed[pName] = new ParseArg_Arg(
               template[pName]?.default?template[pName]?.default:null, -1, template[pName]?.type
            );
         }
      }

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
    * @param {string} stringBool boolean in string
    * @param {Boolean} strictMode if true will return null when stringBool is not 'true' | 'false' (default to false)
    * @returns Boolean data type
    */
   parseBool(stringBool, strictMode = false){
      stringBool = stringBool.toLowerCase();
      const boolRes = (stringBool == 'true'?true:false);

      if(!strictMode) return boolRes;
      if(!(stringBool == 'true'||stringBool == 'false')) return null;
      return boolRes;
   },




   /**parse configuration file in UTF-8 encoding to a Javascript Object
    * @param {string}ConfigString configuration file content
    * @param {function(any, string, any): any} [JSONReviver=null] JSON reviver function, to parse JSON Object in side the config file
    * @param {{ignoreGroups: boolean}} [options]
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
    * # you can put a generic datatypes
    * myText = "Hello!!!"
    *
    * # or adding a JSON Object
    * myObj = {
    *    "somekey": "somevalue",
    *    "nicearray": [1, 2, 3, 4, 5]
    * }
    *
    * # or adding a Goup similar to ini file
    * [myGroup1]
    * key1 = "value1"
    * key2 = "value2"
    */
   parseConfig(ConfigString, JSONReviver = null, options = {}){
      const { ignoreGroups = false } = options;

      let rows = Tools.cleanArr(ConfigString.trim().split('\n'), ['', '\s', '\r']);
      let configObj = {};
      let indexOfSBeforeQ = 0;
      let activeGroup = null;

      let json_str = '', jsonVar_key;
      let inJson = false;
      for(let rowIndex = 0; rowIndex < rows.length; rowIndex++){
         /**| row00
          * | row01
          * | row02
          * | row03
          */
         let eachRow = rows[rowIndex].trim();
         if(/^[#;]/.test(eachRow)) continue;

         if(eachRow.startsWith('[')){
            if(ignoreGroups) continue;

            {
               let success = false;

               for(let i = 1; i < eachRow.length; i++){
                  if(eachRow[i] == ']'&&eachRow[i - 1] != '\\'){
                     activeGroup = eachRow.slice(1, i);
                     if(!configObj[activeGroup]) configObj[activeGroup] = {};
                     success = true;
                     break;
                  }
               }

               if(!success){
                  throw new Error(`Tools.parseConfig(): invalid syntax, missing ']' at the end of the group. at \`${eachRow}\``);
               }else continue;
            }
         }

         // | pair00 = pair01
         /**@type {string[]} */
         let eachPair = Tools.cleanArr(eachRow.split('='));
         if(eachPair.length > 2)
            throw new Error(`Tools.parseConfig(): invalid syntax, '=' cannot occur more than one time.  at \`${eachRow}\``);
         else if(eachPair.length == 1&&!inJson){
            if(eachRow.includes('='))
               throw new Error(`Tools.parseConfig(): invalid syntax, expected expresion after '='.  at \`${eachRow}\``);
            else throw new Error(`Tools.parseConfig(): expected expresion.  at \`${eachRow}\``);
         }
         else if(!eachPair.length){
            throw new Error(`Tools.parseConfig(): unknown operator. \`${eachRow}\``);
         }




         // Parse JSON config
         if(inJson){
            if(jsonEnd(rowIndex, rows)){
               inJson = false;
               if(activeGroup)
                  configObj[activeGroup][jsonVar_key] = JSON.parse(json_str, JSONReviver);
               else
                  configObj[jsonVar_key] = JSON.parse(json_str, JSONReviver);
            }else{
               json_str += rows[rowIndex];
               continue;
            }
         }



         // Parse Normal config
         eachPair = [eachPair[0].trim(), eachPair[1].trim()];

         if(/^[\[\{]/.test(eachPair[1])){
            inJson = true;
            [jsonVar_key, json_str] = eachPair;
         }

         // check for invalid key
         if(eachPair[0].search(/[0-9]/) == 0)
            throw new Error(`Tools.parseConfig(): Key cannot starts with Numbers. at \`${eachRow}\``);

         {
            const invalidChar = eachPair[0].replace(/[a-z$_0-9.]/ig, '');
            if(invalidChar.length !== 0) throw new Error(`Tools.parseConfig(): these character(s) "${invalidChar}" can not be Parse. at \`${eachRow}\``);
         }


         // try to parse value
         const allQs = Tools.getMatchAllIndexes(eachPair[1].matchAll(/["']/g))
            .filter((v, i, _allQs) => {
               if(eachPair[1][v - 1] == '\\'){
                  eachPair[1] = eachPair[1].slice(0, v - 1) + eachPair[1].slice(v);

                  // offset all indexes after this one, bc we just removed a '\' char
                  for(let j = i + 1; j < _allQs.length; j++) _allQs[j]--;
                  return false;
               }
               return true;
         });
         const firstS = eachPair[1].search('#');
         const firstQ = allQs[0];
         let valueWrappedInQ = false;

         if(firstQ != undefined&&(firstS == -1||firstQ < firstS)){
            const secQ = allQs[1] == undefined? -1 :allQs[1];
            const trailing = eachPair[1].slice(secQ + 2).trim();

            if(trailing&&!/^[#;]/.test(trailing)){
               throw new Error(
                  `Tools.parseConfig(): invalid syntax, unexpected charactor(s).\nat \`${eachRow}\`\n` +
                  ''.padStart(secQ+10 + eachPair[0].length, ' ') + '^'
               );
            }

            if(secQ == -1){
               throw new Error(
                  `Tools.parseConfig(): invalid syntax, missing closing quote.\nat \`${eachRow}\`\n` +
                  ' '.padStart(firstQ+7 + eachPair[0].length, ' ') + '^'
               );
            }

            valueWrappedInQ = true;
            eachPair[1] = eachPair[1].slice(firstQ+1, secQ);

         }else if(firstS != -1){
            eachPair[1] = eachPair[1].substring(
               0, eachPair[1].indexOf('#', indexOfSBeforeQ)
            ).trim();

            if(!eachPair[1]) throw new Error(`Tools.parseConfig(): invalid syntax, expected expresion after '='.  at \`${eachRow}\``);
         }

         // if value isn't wrapped in quotes: tries to parse it
         if(activeGroup)
            configObj[activeGroup][eachPair[0]] = valueWrappedInQ? eachPair[1]: parseValue(eachPair[1]);
         else
            configObj[eachPair[0]] = valueWrappedInQ? eachPair[1]: parseValue(eachPair[1]);
      }

      return configObj;


      /**### A predicate function that check if the given row is the end of JSON config
       * @param {number} i
       * @param {string[]} rows
       * @returns {boolean} true if the given row is the end of JSON config
       */
      function jsonEnd(i, rows) {
         if(i == rows.length - 1) return true;
         const b_closeIndexes = Tools.getMatchAllIndexes(rows[i].matchAll(/[}]]/g));

         for(const eachIndex of b_closeIndexes){
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

      function parseValue(strValue){
         switch (strValue.toLowerCase()) {
            case 'true': return true;
            case 'false': return false;
            case 'null': return null;
            case '':
            case 'undefined': return undefined;
            default:
               if(!isNaN(strValue)) return Number(strValue);
               return strValue;
         }
      }
   },


   /**this function act as Passthrough (man in the Middle), it **return the given value**
    * and also pass that same value to the callback function
    * @example
    * // use case
    * let myNumber = pass(getNumber()); // print the return value of `getNumber()` and pass it to `mynumber`
    *
    * dostuff(pass(myNumber, doOtherStuff)); // pass `myNumber` to `dostuff()` and `doOtherStuff()`
    * @template T
    * @param {Function} callback
    * @param {T} value
    * @returns {T} the given value
    */
   pass(value, callback = null){
      if(callback) callback(value);
      else console?.log(value);
      return value;
   },

   /**a simple Progress tool that can be use to show the progress of a task
    * @param {number}total total amount opration
    * @param {string}template template of the progress message
    * @example
    * let inputFiles = fs.readdirSync(inputFolder, { withFileTypes: true });
      let progess = new Progress('Converting tiles to PBM... (%prog%/%total%) [%spd%fps]', inputFiles.length);
      for(let file of inputFiles){
         const input = path.join(inputFolder, file.name);
         const output = path.join(pbmFolder, file.name.replace(/\..+$/, '.pbm'));
         await execProms(`magick "${input}" "${output}"`);
         progess.update();
      }
    */
   Progress: class Progress {
      /**stdstream to write to or Terminal (from terminal.js)
       * @type {any}
       */
      stdout = process.stdout;
      progress = 0;
      spd = 0;
      lastCheck = null;
      printInterval;
      updateInterval;
      total;
      #tracker = 0;
      #firstPrint = true;
      #printFunction;

      constructor(printTemplate, total = null, printInterval = 500, updateInterval = 100){
         if(!printTemplate) throw new Error('printTemplate is required');

         this.total = total;
         this.printInterval = printInterval;
         this.updateInterval = updateInterval;
         this.setPrintTemplate(printTemplate);
         this.lastCheck = Date.now();
      }

      /**update and show the progress
       * @param {number}progress
       */
      update(progress = 1){
         if(!this.#printFunction) return;

         this.#tracker += progress;
         this.progress += progress;
         const lastCheckDelta = Date.now() - this.lastCheck;
         if (lastCheckDelta > this.updateInterval&&this.#tracker > 4){
            this.spd = (this.#tracker * this.updateInterval) / lastCheckDelta;
            this.#tracker = 0;
            this.lastCheck = Date.now();
         }
         if (this.lastPrint + this.printInterval > Date.now()) return;

         this.lastPrint = Date.now();
         if(!this.#firstPrint){
            this.stdout.clearLine();
            this.stdout.cursorTo(0);
         }else this.#firstPrint = false;

         if(!this.total){
            this.#printFunction();
            return;
         }

         this.#printFunction();
      }
      /**
       * set the progress 100% then reset it
       */
      done(){
         if(this.progress != this.total){
            if(!this.#firstPrint){
               this.stdout.clearLine();
               this.stdout.cursorTo(0);
            }
            this.progress = this.total;
            this.#printFunction();
         }

         this.stdout.write('\n');
         this.reset();
      }
      /**
       * reset the progress tracker
       */
      reset(){
         this.progress = 0;
         this.#tracker = 0;
         this.spd = 0;
         this.lastCheck = Date.now();
         this.#firstPrint = true;
      }

      setPrintTemplate(template){
         template = template.replace(/%total%/g, '${this.total}');
         template = template.replace(/%spd%/g, '${this.spd.toFixed(1)}');
         template = template.replace(/%prog%/g, '${this.progress}');

         this.#printFunction = Function(
            'this.stdout.write(' +
               '`' + template + '`' +
            ');'
         ).bind(this);
      }
   },



   /**### value snap function that tries to snap `X` to `originValue`
    *
    * **return** `originValue` if delta of `X` to `originValue` is smaller than
    * `maxOffset` otherwise return `X`
    *
    * @param {number}X
    * @param {number}originValue
    * @param {number}maxOffset
    * @returns snapped value
    */
   proximate(X, originValue, maxOffset){
      if(X < (originValue + maxOffset)&&X > (originValue - maxOffset)){
         return originValue;
      }else return X;
   },




   /**
    * pick a random item from an array
    * @template T
    * @param {T[]} arr
    * @returns {T}
    */
   randomPick(arr){
      if(arr.length <= 1) return arr[0];
      return arr[Math.floor(Math.random() * arr.length)];
   },




   /**
    * # redexOf (indexOf + RexExp + lastIndexOf)
    * ### " I have a `Reg(Exp)`, I have an `indexOf`... Ahhh `redexOf`"* ...any further explanation needed?
    *  redexOf is an indexOf but with `RegExp` supported
    *
    * spoiler alert: it also works as `String.lastIndexOf()` if given negative position
    * @param {string}string string to search from
    * @param {string|RegExp}searcher The Keyword, string or RegExp to search for
    * @param {number}position The index at which to begin searching the string object. If omitted, search starts at the beginning of the string. Also, if **Negative** value is use will search string from the back, similar to **`string.lastIndexOf()`** but position is **Negative Index**
    * @returns {number} position of the string that match the searcher, if none, `-1` would return
    */
   redexOf(string, searcher, position = 0){
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




   REGEXP: Object.freeze({
      /**match non-word chars similar to \W
       * but accept multiple languages
       */
      Seperators: /[-\s_・⧸/\\;:()\[\]、,.'＂"!^*＊=+「【】」（）]/g,
      /**similar to `Tools.REGEXP.Seperators` but it's more suitable for
       * text wrapping
       *
       * this will ignore any ANSI code
      */
      SoftWrapSeperators: /(?<!\x1b\[\d{1,3}(?:;\d{1,3})*|\x1b\]8;;[^\x07]+|\x1b|\x07)[\s,.\]})]/g,
      /**similar to `Tools.REGEXP.SoftWrapSeperators` but it's more sensitive
       *
       * this will ignore any ANSI code
      */
      HardWrapSeperators: /(?<!\x1b\[\d{1,3}(?:;\d{1,3})*|[\x1b\x07]\]8;*[^\x07]*|\x1b|\x07)[-\s_・⧸/\\;:()\[\]、,.'＂"!^*＊=+「【】」（）]/g,
      /**
       * test if the given string is a valid Email
       */
      ValidEmail: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      /**
       * match any ANSI code
       *
       * if hyperlinks are found, will only match beginning and the end of a hyperlink escape sequence,
       * along with the URL but kept the Label untouched.
       */
      ANSICode: /\x1b\[\d{1,3}(?:;\d{1,3})*m|\x1b\]8;;[^\x07]+\x07|(?<=\x07[\w\s]+)\x07\]8;;\x07/g,
      /**
       * ## match any single Emoji Unicode
       * Created by Wiktor Stribiżew, Sep 9, 2021
       * Matching all 4590 emoji characters defined in the Emoji Keyboard/Display Test Data for UTR #51 (Version: 13.1).
       *
       * @from [stribizhev/Emojis](https://github.com/stribizhev/Emojis/tree/main)
       */
      EmojiDetection: new RegExp(EMOJI_MATCHER_TOKEN),
      /**
       * ## match every single Emoji Unicode
       * Created by Wiktor Stribiżew, Sep 9, 2021
       * Matching all 4590 emoji characters defined in the Emoji Keyboard/Display Test Data for UTR #51 (Version: 13.1).
       *
       * @from [stribizhev/Emojis](https://github.com/stribizhev/Emojis/tree/main)
       */
      EmojiEach: new RegExp(EMOJI_MATCHER_TOKEN, 'g'),
      /**
       * ## match every group of Emoji Unicode
       * Created by Wiktor Stribiżew, Sep 9, 2021
       * Matching all 4590 emoji characters defined in the Emoji Keyboard/Display Test Data for UTR #51 (Version: 13.1).
       *
       * @from [stribizhev/Emojis](https://github.com/stribizhev/Emojis/tree/main)
       */
      EmojiEachGroup: new RegExp("(?:" + EMOJI_MATCHER_TOKEN + ")+", 'g'),

      IniGroups: /^[\t ]*\[(.+)\][\t ]*$/gm
   }),

   /**
    * resolve the Environment Variable in the given string
    *
    * default Environment Variable format to CMD (`%ENV_NAME%`)
    * @param {string} str
    * @param {RegExp} envRegex CMD Environment Variable format
    */
   resolveNodeEnv(str, envRegex = /%\w+%/g){
      return str.replace(envRegex, (env) => {
         const envName = env.slice(1, -1);
         if(process.env[envName] == undefined)
            return env;
         return process.env[envName];
      });
   },


   SafeTrue: class SafeTrue{
      #_i = 0;
      limit = 0;
      noWarning = false;

      /**use for infinity-loops to prevent the loop from
       * unintentionally run forever
       * @param {number}limit max loop iteration, default to 10*(10^9) (10 Billion)
       * @example
       * const st = new SafeTrue();
       * while(st.True){
       *    //do something
       * }
       */
      constructor(limit = 10e9, noWarning = false){
         this.limit = limit;
      }

      /**always return `true` if the amount of time this value gets read
       * doesn't exceed the limits
       * @returns {boolean}
       */
      get True(){
         if(this.#_i++ >= this.limit){
            if(!this.noWarning) process?.emitWarning('SafeTrue limit reached');
            return false;
         }
         return true;
      }
   },





   /**Search Array of string for the top best match from the search query (like Google search w/o Linked List search),
    * **this function will also ranked the best match result**
    * @param {string[]}stringArr an Array of string to search from
    * @param {string}query the Search query
    * @param {{
    *    maxResult?: number,
    *    TF_IDFMaps?: Map<string, TFIDFValues>[]|'builtin'
    * }}option
    * **`maxResult`**: define the max result from the Top search result,
    * **`TF_IDFMaps`**: TF_IDF Maps for every string in the `stringArr` or
    * string "builtin" to use builtin function to automatically determine the TF_IDF values
    * (**Note that:** calculating TF_IDF value can be **VERY resources INTENSIVE** it's best
    * to precalculate them outside)
    * @example
    * const fonts = ["Kristen ITC", "Juice ITC"..."Symbol", "Kristen ITC"];
    * const fontTFIDF = TFIDF_of(
    *    fonts.map(v => v.toLowerCase().split(/\s/g))
    * );
    *
    * const res = search(fonts, 'itc j', {
    *    maxResult: 3,
    *    TF_IDFMaps: fontTFIDF
    * });
    * @returns Array of Top result, ranging from the lowest Index as best match
    * to the highest as the worst match
    */
   search(stringArr, query, option = {}){
      const seperators = Tools.REGEXP.Seperators;
      let maxResult = option.maxResult;
      let TF_IDFMaps = option.TF_IDFMaps instanceof Array?[...option.TF_IDFMaps]:option.TF_IDFMaps;
      if(!maxResult){ // for backward compatibility with older versions
         if(typeof option == 'number') maxResult = option;
         else maxResult = Infinity;
      }


      query = query.trim().toLowerCase();
      if(query == '') return null;

      let strList = [...stringArr];
      strList.forEach((e, i, arr) => arr[i] = e.trim().toLowerCase());

      if(TF_IDFMaps === 'builtin'){
         TF_IDFMaps = Tools.DataScienceKit.TFIDF_of(
            strList.concat(query)
               .map(v => Tools.cleanArr(v.split(seperators)))
         );
      }


      class Match{
         constructor(str, score, matchIndex = -1, scores = null){
            this.score = score;
            this.string = str;
            this.matchIndex = matchIndex;
            this.scores = scores;
         }
      }
      let bestMatchs = [];

      for(let i = 0; i < strList.length; i++){
         const lowProf = strList[i].replace(seperators, '');

         if(strList[i] == query||lowProf == query)
            bestMatchs.unshift(new Match(stringArr[i], query.length << 2, i));


         let tfidf_s, word_s, includes_s, lcs_s;
         tfidf_s = word_s = includes_s = lcs_s = 0;
         for(const w of Tools.cleanArr(query.split(seperators))){
            let _wScore = 0;

            if(Tools.includesWord(w, strList[i], false)){
               if(TF_IDFMaps&&TF_IDFMaps[i]?.has(w)){
                  _wScore = w.length * (TF_IDFMaps[i].get(w).TF_IDF) * 2.9; // <- TF_IDF weight (2.9)
                  tfidf_s += _wScore;
               }else{
                  _wScore = w.length; // <- match word weight (1)
                  word_s += _wScore;
               }
            } else if(strList[i].includes(w)){
               _wScore = w.length * .3; // <- includes() weight (0.3)
               includes_s += _wScore;
            }

            const _lcs = Tools.DataScienceKit.LCSLength_of(w, strList[i]) * 0.4; // <- LCS weight (0.4)
            lcs_s += _lcs;
         }

         const totalScore = tfidf_s + word_s + includes_s + lcs_s;
         bestMatchs.push(new Match(null, totalScore, i, {
            tfidf_s, word_s, includes_s, lcs_s, TF_IDFMap: TF_IDFMaps?.[i]
         }));
      }


      // descending sort
      bestMatchs.sort((a, b) => b.score - a.score);
      for(let i = 0; i < maxResult; i++){
         if(!bestMatchs[i]) break;
         if(bestMatchs[i].string != null) continue;

         bestMatchs[i].string = stringArr[bestMatchs[i].matchIndex];
      }

      return bestMatchs.slice(0, maxResult);
   },



   /**pause the synchronous thread for the given duration
    * @param {number}milliseconds how long to pause in milliseconds
    */
   sleep(milliseconds) {
      if(!milliseconds||milliseconds < 0) return;
      const date = Date.now();

      while (Date.now() - date < milliseconds);
   },







   /**new type of *child_process* stdio "Mirror",
    * this combind 'inherit' and 'pipe' stdio type
    * to work as one,
    * allowing `'stdin'`, `'stdout'` and `'stderr'` to show
    * on parent Terminal while also pipe output and error to
    * `stdout` and `stderr`.
    *
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
   SpawnMirror: class SpawnMirror {
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
    * @param {number} length target string length
    * @param {'mid'|'start'|'end'} dropLocation 'mid', 'start' or 'end' determine location in which the string would
    * be dropped if the given str's length is smaller than `length`
    * @param {number} [redundancyLv=0] complexity of how string width (size that will be displayed, not to be confused with the actual *length* of the string) is calculated (suports `-1`: none, `0`:  ANSI code, `1`: fullwidth chars, `2`: Emoji)
    */
   strClamp(str, length, dropLocation = 'mid', redundancyLv = 0){
      const strLen = Tools.ex_length(str, redundancyLv);

      if(strLen <= length)
         return str.padEnd(length, ' ');

      // the length of str that won't be removed
      const leftoverAmu = strLen - (strLen - length) - 3;
      switch(dropLocation){
         default:
            if(onJSRuntime) process?.emitWarning(`'${dropLocation}' is not a valid location type.`);
            else throw new Error(`'${dropLocation}' is not a valid location type.`);
         case 'mid':
            const haft_loa = (leftoverAmu >> 1);
            return Tools.strSlice(str, 0, haft_loa, redundancyLv) +
               "..." +
               Tools.strSlice(str, strLen - haft_loa, undefined, redundancyLv);
         case 'end':
            return Tools.strSlice(str, 0, leftoverAmu, redundancyLv) + "...";
         case 'start':
            return "..." + Tools.strSlice(str, leftoverAmu, undefined, redundancyLv);
      }
   },

   /**
    * @typedef {object} StringifyConfigOptions
    * @property {string[]|undefined} ignoreList list of keys to ignore
    * @property {boolean|undefined} minify minify the JSON output
    * @property {((key: any, value: any) => {})|undefined} replacer JSON replacer
    * @property {'merge'|'replace'|undefined} mode write mode, 'merge' will merge the new config with the old one, 'replace' will replace the old config with the new one (default to 'merge')
    * @property {boolean|undefined} [useIniGroup=false] use ini groupping, use keys in the first level as groupName
    * @property {boolean|undefined} alwaysWrapStrInQuotes always wrap string in quotes even if it's not required (doesn't have space, special char, etc.)
    * @property {string|undefined} oldConfigStr the old config string to merge with (for mode 'merge' only)
    */
   /**
    * stringify configuration object to a config string which can be saved to a file later.
    *
    * this string can be parsed back to the original object using `Tools.parseConfig()`
    *
    * also support INI group, if `useIniGroup` is set to `true`, the first level of the object will be used as group name
    * @param {{[key:string]: any}} config
    * @param {StringifyConfigOptions} [options]
    */
   stringifyConfig(config, options = {}){
      const {
         ignoreList = [],
         minify = false,
         replacer,
         mode = 'merge',
         useIniGroup = false,
         alwaysWrapStrInQuotes = false,
         oldConfigStr = ''
      } = options;

      const st = new Tools.SafeTrue(10**5);
      let savedConfig = mode == 'merge'? oldConfigStr: '';

      for(const key in config){
         if(ignoreList.includes(key)) continue;

         if(!useIniGroup){
            write(key, config);
            continue;
         }

         if(key === ''||typeof config[key] !== 'object'){
            write(key, config, '');
            continue;
         }

         for(const subKey in config[key]){
            if(ignoreList.includes(subKey)) continue;
            write(subKey, config[key], key);
         }
      }

      return savedConfig;

      function write(key, valueObj, group){
         let strValue = '';
         if(typeof valueObj[key] == 'object')
            strValue = `${JSON.stringify(valueObj[key], replacer, minify?null:3)};\n`;
         else{
            if(typeof valueObj[key] == 'string'){
               if(alwaysWrapStrInQuotes||/\s|[\{\[\}\]]/.test(valueObj[key]))
                  strValue = `"${valueObj[key]}"`;
               else strValue = `${valueObj[key]}`;
            }
            else strValue = `${valueObj[key]}`;
         }

         let keyIndex = Tools.redexOf(savedConfig, new RegExp(`^[ \\t]*\\b${key}\\s*=`, 'm'));
         let existGroupIndex;
         if(group === ''){
            existGroupIndex = -3;

         }else existGroupIndex = useIniGroup? savedConfig.indexOf(`[${group}]`): null

         let cantFindGroup = existGroupIndex === -1;
         if(cantFindGroup){
            existGroupIndex = savedConfig.length + 2;
            savedConfig += `\n\n[${group}]\n`;
         }

         if(keyIndex == -1){
            if(useIniGroup){
               if(cantFindGroup){
                  savedConfig += `${key} = ${strValue}\n`;
               }else{
                  savedConfig = Tools.strSplice(savedConfig, existGroupIndex + group.length + 3, 0, `${key} = ${strValue}\n`);
               }

            }else savedConfig += `${key} = ${strValue}\n`;
            return;
         }

         let currentGroupIndex = null, currentGroup = null;
         if(useIniGroup){
            currentGroupIndex = Tools.redexOf(savedConfig.slice(0, keyIndex), Tools.REGEXP.IniGroups, -1);
            currentGroup = currentGroupIndex == existGroupIndex? group: savedConfig.slice(
               currentGroupIndex + 1,
               savedConfig.slice(currentGroupIndex, keyIndex).indexOf(']') + currentGroupIndex
            );
         }

         let valueStart = savedConfig.indexOf('=', keyIndex) + 1;
         let valueEnd = Tools.getMatchAllIndexes(
            savedConfig.slice(valueStart).matchAll(/(?<!\\)[#\n;]/g)
         )?.[0] ?? -1;

         if(valueEnd == -1) valueEnd = savedConfig.length;
         else valueEnd += valueStart;

         let valueEndWithComment = savedConfig[valueEnd] === '\n'
            ? valueEnd
            : savedConfig.indexOf('\n', valueEnd + 1);

         if(isJSONValue(valueStart, valueEnd)){ // value is JSON, find an actual JSON end
            valueEnd = findJSONEndIndex(valueStart);
         }

         if(currentGroup&&currentGroup !== group){ // the old pair is in a wrong group, let's move it
            const clipboard = savedConfig.slice(keyIndex, valueEndWithComment + 1);

            const removeCount = valueEndWithComment - keyIndex;
            const keyOffset = valueStart - keyIndex;
            const vEndOffset = valueEnd - keyIndex;
            // remove old pair
            // Note: removeCount + 1 to remove the '\n' at the end of the line
            savedConfig = Tools.strSplice(savedConfig, keyIndex, removeCount + 1, '');

            // recalibrate Indexs
            if(existGroupIndex > keyIndex) existGroupIndex -= removeCount;
            else existGroupIndex++;
            keyIndex = existGroupIndex + group.length + 2;
            valueStart = keyIndex + keyOffset;
            valueEnd = keyIndex + vEndOffset;

            // move key index to the correct group
            savedConfig = Tools.strSplice(savedConfig, keyIndex, 0, clipboard);
         }

         // console.log(keyIndex, valueStart, valueEnd, `'${savedConfig.slice(valueStart, valueEnd)}'`);
         savedConfig = Tools.strSplice(savedConfig, valueStart, valueEnd - valueStart, ' ' + strValue);
      }

      function findJSONEndIndex(valueStart){
         let indentLvl = 0, readHead = valueStart, inStringBlock = false;
         do {
            readHead++;

            if(inStringBlock){
               if(savedConfig[readHead] == '"'&&savedConfig[readHead - 1] != '\\')
                  inStringBlock = false;
               continue;
            }

            if(savedConfig[readHead] == '"'){
               inStringBlock = true;
               continue;
            }

            if(savedConfig[readHead] == '{'||savedConfig[readHead] == '[')
               indentLvl++;
            if(savedConfig[readHead] == '}'||savedConfig[readHead] == ']')
               indentLvl--;

         } while(indentLvl&&st.True);

         if(st.True == false)
            throw new Error('failed to write config\nReason: loop limit reached');

         return readHead + 1;
      }

      function isJSONValue(valueStart, valueEnd){
         return /^[\t ]*[\[\{]/.test(savedConfig.slice(valueStart, valueEnd));
      }
   },

   /**
    * @typedef {object} StrJustifyOptions
    * @property {string} [filler=' '] char to fill the `target`
    * @property {'left'|'right'|'center'|'spacebetween'} [align='center'] alignment of the string
    * @property {'hidden'|'visible'|'collapse'} [overflow='hidden'] overflow how to handle overflow, `'collapse'` will shorten the string to the target length while leaving `...`, the other two will work the same as CSS overflow
    * @property {'start'|'mid'|'end'} [collapseLocation='end'] location of the collapse string `[...]`
    * @property {number} [redundancyLv=0] complexity of how string width (size that will be displayed, not to be confused with the actual *length* of the string) is calculated (suports `-1`: none, `0`:  ANSI code, `1`: fullwidth chars, `2`: Emoji)
    */
   /**
    * justify the string to the given length, similar to `strClamp` but with more control
    * @param {string|string[]} str
    * @param {number} length target string length
    * @param {StrJustifyOptions} [options={}]
    */
   strJustify(str, length, options = {}){
      const {
         filler = ' ',
         align = 'center',
         overflow = 'hidden',
         collapseLocation = 'end',
         redundancyLv = 0
      } = options;
      const isArr = str instanceof Array;
      const joinedStr = isArr? str.join(''): str;
      const strLen = Tools.ex_length(joinedStr, redundancyLv); // exclude ANSI code length

      if(strLen > length){
         if(overflow == 'collapse')
            return Tools.strLimit(joinedStr, length, collapseLocation);
         if(overflow == 'hidden')
            return joinedStr.slice(0, length);
         return joinedStr;
      }

      switch(align){
         case 'spacebetween':
            if(isArr){
               const space = filler.repeat((length - strLen) / (str.length - 1));

               return str.reduce((acc, cur, i) => {
                  if(i == 0) return acc;
                  return acc + space + cur;
               }, str[0]);
            } // if not Array, fall through to default
         default:
         case 'center':
            return Tools.strSurround(joinedStr, filler, length);
         case 'right':
            return Tools.padStart(joinedStr, length, filler);
         case 'left':
            return Tools.padEnd(joinedStr, length, filler);
      }
   },


   /**limit string length, similar to strClamp but doesn't pad to the target length
    * @param {string} str
    * @param {number} limit max string length allowed
    * @param {'mid'|'start'|'end'} dropLocation 'mid', 'start' or 'end' determine location in which the string would
    * be dropped if the given str's length is smaller then `length`
    */
   strLimit(str, limit, dropLocation = 'mid'){
      const strLen = Tools.ex_length(str);

      if(strLen <= limit) return str;

      // the length of str that won't be removed
      const leftoverAmu = strLen - (strLen - limit) - 3;
      switch(dropLocation){
         default:
            if(onJSRuntime) process?.emitWarning(`'${dropLocation}' is not a valid location type.`);
            else throw new Error(`'${dropLocation}' is not a valid location type.`);
         case 'mid':
            const haft_loa = (leftoverAmu >> 1);
            return Tools.strSlice(str, 0, haft_loa) + "..." + Tools.strSlice(str, strLen - haft_loa + 1);
         case 'end':
            return Tools.strSlice(str, 0, leftoverAmu) + "...";
         case 'start':
            return "..." + Tools.strSlice(str, leftoverAmu);
      }
   },

   // TODO: make this work with redundancyLv > 1
   /**
    * slice string, similar to `String.slice()` but with string
    * @param {string} str string to slice
    * @param {number} start start index
    * @param {number} [end] end index
    * @param {number} [redundancyLv=0] complexity of how string width (size that will be displayed, not to be confused with the actual *length* of the string) is calculated (suports `-1`: none, `0`:  ANSI code, `1`: fullwidth chars, `2`: Emoji)
    */
   strSlice(str, start, end, redundancyLv = 0){
      let ANSIIndexs = [...str.matchAll(Tools.REGEXP.ANSICode)]
         .map(v => {
            return {start: v.index, end: v.index + v[0].length, length: v[0].length}
         });

      if(!end) end = Tools.ex_length(str, redundancyLv);

      // console.log(ANSIIndexs)

      let ANSICodeStartOffset = 0;
      let ANSICodeEndOffset = 0;
      for(let i = 0; i < ANSIIndexs.length; i++){
         if(ANSIIndexs[i].start - ANSICodeStartOffset < start){
            ANSICodeStartOffset += ANSIIndexs[i].length;
         }

         if(ANSIIndexs[i].start - ANSICodeEndOffset <= end){
            ANSICodeEndOffset += ANSIIndexs[i].length;
         }

         if(ANSIIndexs[i].start - ANSICodeEndOffset > end) break;
      }

      // console.log(ANSICodeStartOffset, ANSICodeEndOffset);

      return str.slice(start + ANSICodeStartOffset, end + ANSICodeEndOffset);
   },



   /**Splice but with string, **Note That: Unlike Array.splice() this method doesn't Overwrite
    * the original var**
    * @param {string}str
    * @param {number}index
    * @param {number}removeCount number of Chars to remove
    * @param {string|undefined|null}strToInsert
    */
   strSplice(str, index, removeCount, strToInsert = null){
      if(removeCount < 0) removeCount = 0;
      if(index < str.length * -1) index = 0; // prevent negative index out of bounds

      if(strToInsert){
         return str.slice(0, index) + strToInsert + (index < 0&&removeCount + index >= 0?'':str.slice(index + removeCount));
      }else return str.slice(0, index) + (index < 0&&removeCount + index >= 0?'':str.slice(index + removeCount));
   },



   /**surround the target string to the specified length using the given `filler` char
    * @param {string} filler char to fill the `target`
    * @param {number} length the final length
    * @param {string} target
    * @param {number} [redundancyLv=0] complexity of how string width (size that will be displayed, not to be confused with the actual *length* of the string) is calculated (suports `-1`: none, `0`:  ANSI code, `1`: fullwidth chars, `2`: Emoji)
    * @returns {string}
    */
   strSurround(target, filler, length, redundancyLv = 0){
      const targetLen = Tools.ex_length(target, redundancyLv);
      const padding = Math.ceil(length / 2 - targetLen / 2);

      return Tools.padEnd(' ', padding, filler, redundancyLv) +
         Tools.padEnd(target, length / 2 + targetLen / 2, filler, redundancyLv);
   },


   /**
    * @typedef {Object} strWrapOptions
    * @property {string|number} [indent=''] the string to put in front of each line
    *
    * if `number` is given, will put WhiteSpace with that length instead
    * @property {string|number} [firstIndent=''] the string to put in front of first line
    *
    * if `number` is given, will put WhiteSpace with that length instead
    * @property {'strict'|'softboundery'} [mode='softboundery'] wrap mode
    *
    * **Strict**: wrap the string to the given length,
    * while each line is equal or lessthan the given max length
    *
    * **SoftBoundary** (default): similar to **Strict** but with some tolerance
    * @property {number} [redundancyLv=0] complexity of how string width (size that will be displayed, not to be confused with the actual *length* of the string) is calculated (suports `-1`: none, `0`:  ANSI code, `1`: fullwidth chars, `2`: Emoji)
    */
   /**wrap string to the given max line length
    * @param {string} str string to wrap
    * @param {number} maxLineLength max length of each line, if mode is set to `'softboundery'`
    * each line can be longer than this value
    * @param {strWrapOptions} [options={}]
    */
   strWrap(str, maxLineLength, options = {}){
      if(!str) return '';

      const {
         indent = '',
         firstIndent = '',
         mode = 'softboundery',
         redundancyLv = 0
      } = options;

      let content = '';
      const SoftSep_reg = Tools.REGEXP.SoftWrapSeperators;
      const HardSep_reg = Tools.REGEXP.HardWrapSeperators;

      const innerBound = maxLineLength * 0.67;
      str = str.toString().split('\n');
      if(typeof firstIndent == 'number')
         firstIndent = ''.padEnd(firstIndent, ' ');
      if(typeof indent == 'number')
         indent = ''.padEnd(indent, ' ');

      if(firstIndent) content += firstIndent;
      for(let eachLine of str){
         while(Tools.ex_length(eachLine, redundancyLv) > maxLineLength){
            const indexesOfSep = Tools.getMatchAllIndexes(eachLine.matchAll(SoftSep_reg))
               .filter(v => v >= innerBound);
            let indexOfSep = indexesOfSep[0] ?? -1;

            if(indent){
               if(firstIndent == '') firstIndent = null;
               else content += indent;
            }

            if(mode == 'softboundery'){
               if(indexOfSep == -1){
                  const indexesOfHardSep = Tools.getMatchAllIndexes(eachLine.matchAll(HardSep_reg))
                     .filter(v => v >= innerBound);
                  indexOfSep = getSepIndex(indexesOfHardSep, 0) ?? maxLineLength;
               }else indexOfSep = getSepIndex(indexesOfSep, 0);

            }else indexOfSep = ((indexOfSep > maxLineLength)||(indexOfSep == -1)? maxLineLength: indexOfSep);
            indexOfSep++;

            content += eachLine.substring(0, indexOfSep).concat('\n');
            eachLine = eachLine.substring(indexOfSep);
         }

         if(indent){
            if(firstIndent == '') firstIndent = null;
            else content += indent;
         }
         content += eachLine.concat('\n');
      }
      return content;

      function getSepIndex(sepIndexes, index){
         if(!sepIndexes[index + 1]) return sepIndexes[index];
         if(sepIndexes[index + 1] - sepIndexes[index] > 1) return sepIndexes[index];

         return getSepIndex(sepIndexes, index + 1);
      }
   },

   /**check if the terminal/console supports color text
    *
    * from npm package: [supports-color](https://www.npmjs.com/package/supports-color)
    * @returns {number} 0: no color support, 1: 8bit color support, 2: 256 color support, 3: 16bit color support
    */
   supportsColor(stream = process?.stdout) {
      if (Tools.CheckCache.forceColor === false) {
         return 0;
      }

      if (Tools.argvHasFlag('color=16m') ||
         Tools.argvHasFlag('color=full') ||
         Tools.argvHasFlag('color=truecolor')) {
         return 3;
      }

      if (Tools.argvHasFlag('color=256')) {
         return 2;
      }

      if (stream && !stream.isTTY && Tools.CheckCache.forceColor !== true) {
         return 0;
      }

      const min = Tools.CheckCache.forceColor ? 1 : 0;

      if (process.platform === 'win32') {
         if(!Tools._modules.os) Tools._modules.os = require('os');
         // Node.js 7.5.0 is the first version of Node.js to include a patch to
         // libuv that enables 256 color output on Windows. Anything earlier and it
         // won't work. However, here we target Node.js 8 at minimum as it is an LTS
         // release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
         // release that supports 256 colors. Windows 10 build 14931 is the first release
         // that supports 16m/TrueColor.
         const osRelease = Tools._modules.os.release().split('.');
         if (
            Number(process.versions.node.split('.')[0]) >= 8 &&
            Number(osRelease[0]) >= 10 &&
            Number(osRelease[2]) >= 10586
         ) {
            return Number(osRelease[2]) >= 14931 ? 3 : 2;
         }

         return 1;
      }

      const { env } = process;

      if ('CI' in env) {
         if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
            return 1;
         }

         return min;
      }

      if ('TEAMCITY_VERSION' in env) {
         return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }

      if (env.COLORTERM === 'truecolor') {
         return 3;
      }

      if ('TERM_PROGRAM' in env) {
         const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

         switch (env.TERM_PROGRAM) {
            case 'iTerm.app':
               return version >= 3 ? 3 : 2;
            case 'Apple_Terminal':
               return 2;
            // No default
         }
      }

      if (/-256(color)?$/i.test(env.TERM)) {
         return 2;
      }

      if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
         return 1;
      }

      if ('COLORTERM' in env) {
         return 1;
      }

      if (env.TERM === 'dumb') {
         return min;
      }

      return min;
   },


   /**check if the terminal/console supports Hyperlink
    *
    * from npm package: [supports-hyperlinks](https://www.npmjs.com/package/supports-hyperlinks)
    */
   supportsHyperlink(stream = process?.stdout, test = false) {
      if(test) console.log(`Terminal Support Hyperlink Test: (result of last check is the test result)`);

      if(test) console.log(`1. has process.env: ${!!process.env}`);
      const { env } = process;
      if(!env) return false;

      if(test) console.log(
         `2. force hyperlink: ${!!env.FORCE_HYPERLINK&&!(env.FORCE_HYPERLINK.length > 0 && parseInt(env.FORCE_HYPERLINK, 10) === 0)}`
      );
      if ('FORCE_HYPERLINK' in env) {
         return !(env.FORCE_HYPERLINK.length > 0 && parseInt(env.FORCE_HYPERLINK, 10) === 0);
      }

      if(test) console.log(`3. hyperlink disable: ${(Tools.argvHasFlag('no-hyperlink') || Tools.argvHasFlag('no-hyperlinks') || Tools.argvHasFlag('hyperlink=false') || Tools.argvHasFlag('hyperlink=never'))}`);
      if (Tools.argvHasFlag('no-hyperlink') || Tools.argvHasFlag('no-hyperlinks') || Tools.argvHasFlag('hyperlink=false') || Tools.argvHasFlag('hyperlink=never')) {
         return false;
      }

      if(test) console.log(`4. has hyperlink enable: ${Tools.argvHasFlag('hyperlink=true') || Tools.argvHasFlag('hyperlink=always')}`);
      if (Tools.argvHasFlag('hyperlink=true') || Tools.argvHasFlag('hyperlink=always')) {
         return true;
      }

      if(test) console.log(`5. ran on Netlify: ${('NETLIFY' in env)}`);
      // Netlify does not run a TTY, it does not need `supportsColor` check
      if ('NETLIFY' in env) {
         return true;
      }

      if(test) console.log(`6. supports color: ${Tools.CheckCache.supportsColor > 0}`);
      if(Tools.CheckCache.supportsColor > 0){
         return true;
      }

      if(test) console.log(`7. in TTY stream: ${!(stream && !stream.isTTY)}`);
      if (stream && !stream.isTTY) {
         return false;
      }

      if(test) console.log(`8. platform is win32: ${process.platform === 'win32'}`);
      if (process.platform === 'win32') {
         return false;
      }

      if(test) console.log(`9. is CI: ${('CI' in env)}`);
      if ('CI' in env) {
         return false;
      }

      if(test) console.log(`10. no TEAMCITY_VERSION: ${!('TEAMCITY_VERSION' in env)}`);
      if ('TEAMCITY_VERSION' in env) {
         return false;
      }

      if(test) console.log(`11. valid TERM_PROGRAM: (multiple check)`);
      if ('TERM_PROGRAM' in env) {
         const version = parseVersion(env.TERM_PROGRAM_VERSION);

         switch (env.TERM_PROGRAM) {
            case 'iTerm.app':
               if (version.major === 3) {
                  return version.minor >= 1;
               }

               return version.major > 3;
            case 'WezTerm':
               return version.major >= 20200620;
            case 'vscode':
               return version.major > 1 || version.major === 1 && version.minor >= 72;
            // No default
         }
      }

      if(test) console.log(`11. valid VTE_VERSION: (multiple check)`);
      if ('VTE_VERSION' in env) {
         // 0.50.0 was supposed to support hyperlinks, but throws a segfault
         if (env.VTE_VERSION === '0.50.0') {
            return false;
         }

         const version = parseVersion(env.VTE_VERSION);
         return version.major > 0 || version.minor >= 50;
      }


      if(test) console.log(`12. Final: failed`);
      return false;


      function parseVersion(versionString) {
         if (/^\d{3,4}$/.test(versionString)) {
            // Env var doesn't always use dots. example: 4601 => 46.1.0
            const m = /(\d{1,2})(\d{2})/.exec(versionString);
            return {
               major: 0,
               minor: parseInt(m[1], 10),
               patch: parseInt(m[2], 10)
            };
         }

         const versions = (versionString || '').split('.').map(n => parseInt(n, 10));
         return {
            major: versions[0],
            minor: versions[1],
            patch: versions[2]
         };
      }
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
         return string.fromCharCode(
            brack.charCodeAt(0) + (brack[0] == '('? 1 :2)
         );
      }
   },


   Timer: class Timer {
      /**time remaining in the clock
       * @type {number}
       */
      time;
      /**this also control how often should timer do the checking
       * @type {'ms','s','m'}
       */
      resolution;
      isRunning = false;
      maxTime;
      #res;
      #interval;
      #lastCheck = 0;
      #onceEndCallback;
      #waitCallback;
      /**a very simple Countdown Timer
       *
       * **Note That**: the highest resolution this timer can do is 4ms
       * because the minimum delay `setInterval()` can do is 4ms
       *
       * however, this can varies
       * @param {number} time start time
       * @param {'ms','s','m'} resolution
       */
      constructor(time, resolution = 'ms'){
         this.maxTime = this.time = time;
         this.resolution = resolution;

         switch(resolution){
            case 'ms':
               this.#res = 1;
               break;
            case 's':
               this.#res = 1000;
               break;
            case 'm':
               this.#res = 1e3 * 60;
               break;
         }
      }

      /**start the timer
       *
       * once `Timer.time` reach 0 will automatically stop
       */
      start(){
         if(this.isRunning||this.time <= 0) return;
         this.isRunning = true;
         this.#lastCheck = Date.now();
         this.#interval = setInterval(
            this.#checkTime, this.#res == 1? 4: this.#res / 100
         );
         return this;
      }

      /**stop and reset the Timer
       */
      stop(){
         if(!this.isRunning) return;
         clearInterval(this.#interval);
         this.isRunning = false;
         return this.reset();
      }

      /**pause Timer
       */
      pause(){
         if(!this.isRunning) return;
         clearInterval(this.#interval);
         this.isRunning = false;
         return;
      }

      reset(){
         this.time = this.maxTime;
         return this;
      }

      /**wait for Timer to end (finish counting)
       * @returns {Promise<void>}
       */
      async wait(){
         if(!this.isRunning) return;

         return new Promise((resolve, reject) => {
            this.#waitCallback = () => {
               this.#waitCallback = null;
               resolve();
            }
         });
      }

      /**@callback OnceEndCallback
       * @returns {void}
       */
      /**call a callback function once Timer finish counting
       * @param {OnceEndCallback} callback
       */
      onceEnd(callback){
         this.#onceEndCallback = callback;
         return this;
      }

      #checkTime = () => {
         const now = Date.now();
         const delta = (now - this.#lastCheck) / this.#res;
         this.time -= delta;
         this.#lastCheck = now;
         if(this.time > 0) return;

         this.stop();
         this.time = 0;
         if(this.#onceEndCallback){
            this.#onceEndCallback();
            this.#onceEndCallback = null;
         }
         if(this.#waitCallback) this.#waitCallback();
      }
   },



   /**convert Numbers to Place numbers
    * @param {number}number
    */
   toPlace(number){
      switch(number){
         case 1: return '1st';
         case 2: return '2nd';
         case 3: return '3rd';
         default: return number + 'th';
      }
   },

   /**shorten the given number to keep it easy to the eyes
    * @param {number}number
    * @param {number}maxFractDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
    */
   toShortNum(number, maxFractDigits = 2){
      let s_times = 0; // how many times the number is shorten (by +-10^3)
      let absNum = Math.abs(number);
      const sign = Math.sign(number);
      const isNegPower = absNum > 0&&absNum < 1;
      number = shorten(absNum) * sign;

      switch(s_times){
         case 0:
            return Tools.maxFraction(number, maxFractDigits);
         case 1:
            return Tools.maxFraction(number, maxFractDigits) + 'k';
         case 2:
            return Tools.maxFraction(number, maxFractDigits) + 'M';
         case 3:
            return Tools.maxFraction(number, maxFractDigits) + 'G';
         case 4:
            return Tools.maxFraction(number, maxFractDigits) + 'T';
         case -1:
            return Tools.maxFraction(number, maxFractDigits) + 'm';
         case -2:
            return Tools.maxFraction(number, maxFractDigits) + 'μ';
         case -3:
            return Tools.maxFraction(number, maxFractDigits) + 'n';
         case -4:
            return Tools.maxFraction(number, maxFractDigits) + 'p';
         default:
            return Tools.maxFraction(number, maxFractDigits) +
               'e' + (isNegPower?'':'+') + (s_times * 3);
      }


      /**@param {number} n */
      function shorten(n){
         if(isNegPower){
            if(n >= 1) return n;
            s_times--;
            return shorten(n * 1e3);
         }

         if(n < 1e3) return n;
         s_times++;
         return shorten(n / 1e3);
      }
   },

   /**
    * @typedef {Object} WriteConfigOptions
    * @property {string[]|undefined} ignoreList list of keys to ignore
    * @property {boolean|undefined} minify minify the JSON output
    * @property {((key: any, value: any) => {})|undefined} replacer JSON replacer
    * @property {'merge'|'replace'|undefined} mode write mode, 'merge' will merge the new config with the old one, 'replace' will replace the old config with the new one (default to 'merge')
    * @property {boolean|undefined} [useIniGroup=false] use ini groupping, use keys in the first level as groupName
    * @property {boolean|undefined} alwaysWrapStrInQuotes always wrap string in quotes even if it's not required (doesn't have space, special char, etc.)
    */
   /**
    * asynchronously write configuration to the given path
    *
    * which an be parsed back to the original object using `Tools.parseConfig()`
    *
    * also support INI group, if `useIniGroup` is set to `true`, the first level of the object will be used as group name
    * @param {{[key:string]: any}} config
    * @param {string} path
    * @param {WriteConfigOptions} [options]
    */
   writeConfig(config, path, options = {}){
      if(!Tools._modules.fs) throw new Error('fs module is required for Tools.writeConfig()\nimport them with `Tools._modules.fs = require("fs")`');

      const {
         ignoreList = [],
         minify = false,
         replacer,
         mode = 'merge',
         useIniGroup = false,
         alwaysWrapStrInQuotes = false
      } = options;

      let savedConfig = '';
      if(Tools._modules.fs.existsSync(path)&&mode == 'merge')
         savedConfig = Tools._modules.fs.readFileSync(path, { encoding: 'utf-8' });

      savedConfig = Tools.stringifyConfig(config, {
         ignoreList,
         minify,
         replacer,
         mode,
         useIniGroup,
         alwaysWrapStrInQuotes,
         oldConfigStr: savedConfig
      });

      Tools._modules.fs.writeFileSync(path, savedConfig, { encoding: 'utf-8' });
   },
}



/////////////////////   extension   ///////////////////////
//"extension" function of Object `Number` that returns length of digits of Number
Number.prototype.length = function length(){
   return (this+'').replace(/[.e]/ig, '').length;
};


String.prototype.redexOf = Tools.redexOf;


if(typeof module !== 'undefined') module.exports = Tools;
if(typeof window !== 'undefined') window._tools = Tools;