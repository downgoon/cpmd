#!/usr/bin/env node
var fs = require('fs');
var fse = require("fs-extra");
var Parser = require('markdown-parser');
const path = require("path");
const glob = require("glob");
const options = require('commander');

options.version('0.2.0')
  .option('-s, --src <src>', 'src markdown files (supporting wildcard characters)')
  .option('-d, --dst <dst>', 'dst directory')
  .option('-m, --move', 'move flag, default value is false', function(v, p) {}, false)
  .parse(process.argv);
 
if (options.src == undefined || options.dst == undefined) {
    console.log("copy/move markdown files supporting wildcard characters to the destination directory **with its/their attached images** on local file paths");
    console.log("Usage(Long Term): cpmd --src <$src.md> --dst <$dstdir> [--move]");
    console.log("Usage(Short Term): cpmd -s <$src.md> -d <$dstdir> [-m]");
    process.exit(1);
}

var srcFileWildcard = options.src;
var dstDirName = options.dst;
var rmFlag = false;

if (options.move != undefined) {
    rmFlag = true;
}

console.log('src file wildcard: ' + srcFileWildcard);

glob(srcFileWildcard, function (error, srcFileNames) {
    console.log('src file list: ' + srcFileNames);
    let idx = 0;
    for (idx in srcFileNames) {
        copyOneFile(srcFileNames[idx], dstDirName, rmFlag);
    }
})

function copyOneFile(srcFileName, dstDirName, rmFlag) {

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
                let srcFinal = path.join(srcDirName, md.references[idx].href);
                let dstFinal = path.join(dstDirName, md.references[idx].href);
                
                if (rmFlag) {
                    fse.move(srcFinal, dstFinal,
                        function(err) {
                            if (err != undefined) {
                                console.log(err);
                        }
                    });
                    console.log('mv ' + md.references[idx].href + ' to ' + dstDirName );

                } else {
                    fse.copy(srcFinal, dstFinal,
                        function(err) {
                            if (err != undefined) {
                                console.log(err);
                        }
                    });
                    console.log('cp ' + md.references[idx].href + ' to ' + dstDirName );
                }
                
            }
    
        } // end for
    
        var dstFileName = path.join(dstDirName, srcFileName.substr(srcDirName.length));
        if (rmFlag) {
            fse.move(srcFileName, dstFileName);
            console.log('mv ' + options.src + ' to ' + dstDirName );
        } else {
            fse.copy(srcFileName, dstFileName);
            console.log('cp ' + options.src + ' to ' + dstDirName );
        }
    
    });
    
}

process.on('unhandledRejection', error => {
    // do nothing
});
