#!/usr/bin/env node
var fs = require('fs');
var fse = require("fs-extra");
var Parser = require('markdown-parser');
const path = require("path");
const commandLineArgs = require('command-line-args')



const optionDefinitions = [
    { name: 'src', alias: 's', type: String},
    { name: 'dst', alias: 'd', type: String }
  ];


const options = commandLineArgs(optionDefinitions);

if (options.src == null || options.dst ==null) {
    console.log("Usage: mdcp --src $src.md --dst $dstdir");
    process.exit(1);
}


var srcFileName = options.src;
var dstDirName = options.dst;


if (! fs.lstatSync(srcFileName).isFile() || ! srcFileName.endsWith('.md')) {
    console.log("--src MUST be a markdown file");
    process.exit(2);
}

if (! fs.lstatSync(dstDirName).isDirectory()) {
    console.log("--dst MUST be a directory");
    process.exit(3);
}

// process.cwd() vs. __basename
if (! path.isAbsolute(srcFileName)) {
    srcFileName = path.join(process.cwd(), srcFileName);
}

if (! path.isAbsolute(dstDirName)) {
    dstDirName = path.join(process.cwd(), dstDirName);
}


var srcDirName = path.dirname(srcFileName);

var content = fs.readFileSync(srcFileName, 'utf8');

var parser = new Parser();
parser.parse(content, function(err, md) {

    let idx = 0;
    for (idx in md.references) {
        if (md.references[idx].image == true) {
            fse.copy(path.join(srcDirName, md.references[idx].href),
                path.join(dstDirName, md.references[idx].href),
                function(err) {
                    if (err != undefined) {
                        console.log(err);
                    }
            })
            console.log('cp ' + md.references[idx].href + ' to ' + dstDirName );
        }

    } // end for

    var dstFileName = path.join(dstDirName, srcFileName.substr(srcDirName.length));
    fse.copy(srcFileName, dstFileName);
    console.log('cp ' + options.src + ' to ' + dstDirName );

});


process.on('unhandledRejection', error => {
    // do nothing
});
