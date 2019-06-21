# cpmd



## User Guide



copy markdown file to the destination directory **with its attached images** on local file paths.

- Usage: 

``` bash
$ cpmd --src README.md --dst backup/
```

- **Install**: 

``` bash
$ npm install cpmd -g
```

- Example:

``` bash
$ tree .
.
├── README.md
└── assets
    ├── image-20190611122622142.png
    └── image-20190611123013641.png

1 directory, 3 files

$ cpmd -s README.md --dst ~/tmp/
cp assets/image-20190611122622142.png to ~/tmp/
cp assets/image-20190611123013641.png to ~/tmp/
cp README.md to ~/tmp/

$ ls ~/tmp/
README.md assets
$ ls ~/tmp/assets
image-20190611122622142.png image-20190611123013641.png
```



## Developer Guide



### local install

- ``package.json`` introduction

``` json

{
  "name": "cpmd",
  "version": "0.1.0", // version number, default is 1.0.0
  "description": "copy markdown file to the destination directory with its attached images on local file paths",
  "main": "cpmd.js",   // entry point of the application, default is 'Index.js'
  "dependencies": { // auto added on 'npm install $module_name --save' executed
    "command-line-args": "^5.1.1",
    "commander": "^2.20.0",
    "fs-extra": "^8.0.1",
    "markdown-parser": "0.0.8"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/downgoon/cpmd.git"
  },
  "bin": {  // cmd line name for 'npm install . -g'
    "cpmd": "cpmd.js" // cmd line name -> js reference
  },
  "devDependencies": {},
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "downgoon@qq.com",
  "license": "MIT"
}

```



> the ``bin`` section is required for local installation in which the command like ``npm install . -g`` will be executed.



- **directive head line**: ``#!/usr/bin/env node``

 Add the following directive, which is also required, at the first line of "cpmd.js" file whose content is just like this:

``` javascript
#!/usr/bin/env node

var fs = require('fs');
var fse = require("fs-extra");
var Parser = require('markdown-parser');
const path = require("path");

```

- **locally install**

``` bash
$ npm install . -g
/usr/local/bin/cpmd -> /usr/local/lib/node_modules/cpmd/cpmd.js
+ cpmd@0.1.0
updated 1 package in 0.161s
$ which cpmd
/usr/local/bin/cpmd
$ ll /usr/local/bin/ | grep cpmd
cpmd -> ../lib/node_modules/cpmd/cpmd.js
```



- **cmd line testing**

``` bash
$ cpmd
Usage: mdcp --src $src.md --dst $dstdir
```



### remote install



- **publish firstly**:  publish the application to the official site [www.npmjs.com]([https://www.npmjs.com](https://www.npmjs.com/))

``` bash

$ npm login   # please signup an account firstly 
Username: downgoon
Password:  # input your password hear
Email: (this IS public) downgoon@qq.com
Logged in as downgoon on https://registry.npmjs.org/.


$ npm publish   # publish to registry.npmjs.org

npm publish
npm notice
npm notice 📦  cpmd@0.1.0
npm notice === Tarball Contents ===
npm notice 686B  package.json
npm notice 2.0kB cpmd.js
npm notice 2.9kB README.md
npm notice === Tarball Details ===
npm notice name:          cpmd
npm notice version:       0.1.0
npm notice package size:  2.1 kB
npm notice unpacked size: 5.6 kB
npm notice shasum:        7cc7dc6378216e3bb4ad6fc15d4a2511f18aecf7
npm notice integrity:     sha512-Lki/LCZBB7sp8[...]OCYpIyhyDtB+A==
npm notice total files:   3
npm notice
+ cpmd@0.1.0

$ npm view cpmd  # view the published detail info

cpmd@0.1.0 | MIT | deps: 4 | versions: 1
copy markdown file to the destination directory with its attached images on local file paths
https://github.com/downgoon/cpmd#readme

bin: cpmd

dist
.tarball: https://registry.npmjs.org/cpmd/-/cpmd-0.1.0.tgz
.shasum: 7cc7dc6378216e3bb4ad6fc15d4a2511f18aecf7
.integrity: sha512-Lki/LCZBB7sp8aOt8wTHtJ8sgMmEt25WgRXM4iQmytNSEbBF0dkL9+aomsvgIrGuCXtkyR2GJOCYpIyhyDtB+A==
.unpackedSize: 5.6 kB

dependencies:
command-line-args: ^5.1.1 commander: ^2.20.0        fs-extra: ^8.0.1          markdown-parser: 0.0.8

maintainers:
- downgoon <downgoon@qq.com>

dist-tags:
latest: 0.1.0

published 39 seconds ago by downgoon <downgoon@qq.com>
```



- **remotely install**: download from 'registry.npmjs.org' and install 

``` bash
$ npm install cpmd -g
/usr/local/bin/cpmd -> /usr/local/lib/node_modules/cpmd/cpmd.js
+ cpmd@0.1.0
updated 12 packages in 3.2s

```

