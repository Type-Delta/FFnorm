# FFnorm

automatic audio Normalization tool
powered by **FFmpeg**
for normalizing large batch of files.


## Installations

Required dependencies are **FFmpeg**, **FFprobe** (shiped with FFmpeg), **AWK** and **Node.js** (if using [Executables](https://github.com/Type-Delta/FFnorm/releases), Node.js is **unnecessary**).

didn't have them?

Download [FFmpeg](https://ffmpeg.org/download.html) or [Node.js](https://nodejs.org/en/download)

for **AWK** see [installation guide](https://bobbyhadz.com/blog/install-awk-on-windows)

## Usage
you can either run the [Executable](https://github.com/Type-Delta/FFnorm/releases) directly:
```
ffnorm norm -i "path/to/input/folder" "path/to/output/folder"
```

or run the source code var **Node.js**:
```
node ffnorm.js norm -i "path/to/input/folder" "path/to/output/folder"
```

#### Scan files Loudness
input path can be File or Folder
```
ffnorm scan -i "path/to/input/folder"
```
you can also specifiy **Target** loudness as guideline
```
ffnorm scan -i "path/to/input/folder" --target -9
```
**FFnorm** will mark how far-off each file's loudness from **Target**
![Output Image](img/promt01.png)

#### Normalize Files
lets start by normalizing a single Video file,
we defined **Max Offset** to `2LUFS` meaning if this file is only `2LUFS` away
from default **Target loudness** (-14.4LUFS) it would be skipped.
```
ffnorm norm -i ./test/video.mp4 -of 2 ./test/norm_vid.mp4
```

for multiple files we can specify Folder path instead of File,
**FFnorm** will look for [supported files](#supported-files-extentions) in the given folder and normalize them
```
ffnorm norm -i ./test -of 2 ./test/norm/
```


## Options


| Option | Descriptions | Type | Default | Note |
|---|---|---|---|---|
| `'-i'`, `'--input'` | specify input file/folder| string | None | this option is **required** |
| `'-o'`,`'--output'` | specify output file/folder| string | None | (if none set will use the last command-line argument as output) |
|`'norm'`, `'--norm'`, `'-n'`| Normalize mode - scan Audio loudness of file/folder contents and normalize them according to the Target loudness set by '-t' option.| (No Value needed for this option) | None |  (this option **requires Output file/folder**) |
| `'scan'`,`'--scan'`, `'-s'` | Scan Audio loudness and report them on the terminal. | (No Value needed for this option)| None |
| `'-t'`, `'--target'` | Target Loudness in LUFS | float | `-14.4` (LUFS) (*YouTube* standard loudness) | |
| `'-of'`, `'--offset'`| Max offset fron Target loudness before normalization become active. | float | `1.3` (LUFS) | |
|`'-r`', `'--ratio'` | How much Normalization is apply in percentage, 1.0 is 100% lower this value to prevent over-shooting | float | `0.78` (78%) | |
|`'-st'`,`'--scanthread'`| Max number of Threads for loudness scanning | int | `128` (threads) | |
|`'-nt'`, `'--normthread'`| Max number of Threads for audio normalization | int |`32` (threads)| |

## Supported Files Extentions
> - aiff
> - aif
> - aifc
> - flac
> - mp3
> - mp4
> - mp4a
> - m4a
> - mkv
> - mov
> - wav
> - webm

---------------

#### FFmpeg Commands use:
- getting audio loudness
> `ffmpeg -hide_banner -i audio.wav -af ebur128=framelog=verbose -f null - 2>&1 | awk "/I:/{print $2}"`
- getting audio bitrate
> `ffprobe -v error -select_streams a:0 -show_entries stream=bit_rate -of compact=p=0:nk=1  audio.wav"`
- modifying audio Gains
> `ffmpeg -hide_banner -y -i input.wav -movflags use_metadata_tags -map_metadata 0 -af "volume=(GAIN)dB" -id3v2_version 3 -b:a (BITRATE) -c:v copy ouput.wav`
