#!/usr/bin/env node
var fs = require('fs');
var fse = require("fs-extra");
var Parser = require('markdown-parser');
const path = require("path");
const glob = require("glob");
const options = require('commander');

options.version('0.3.0')
  .option('-s, --src <src>', 'src markdown files (supporting wildcard characters)')
  .option('-d, --dst <dst>', 'dst directory')
  .option('-m, --move', 'move flag, default value is false', function(v, p) {}, false)
  .option('-x, --hexo', 'hexo-style flag, default value is false', function(v, p) {}, false)
  .parse(process.argv);
 
if (options.src == undefined || options.dst == undefined) {
    console.log("copy or move markdown files (supporting wildcard characters) to the destination directory with their attached images usually located on sub dir named 'assets' or 'images'.");
    console.log("Usage(Long Term): cpmd --src <$src.md> --dst <$dstdir> [--move]");
    console.log("Usage(Short Term): cpmd -s <$src.md> -d <$dstdir> [-m]");
    console.log("Multi Copy Example: cpmd -s 'RE*.md' -d backup/ ");
    process.exit(1);
}

var srcFileWildcard = options.src;
var dstDirName = options.dst;
var rmFlag = false;
var hexoFlag = false;

if (options.move != undefined) {
    rmFlag = true;
}

if (options.hexo != undefined) {
    hexoFlag = true;
}

console.log('src file wildcard: ' + srcFileWildcard);

// wildcard supporting for multi markdown coping
glob(srcFileWildcard, function (error, srcFileNames) {
    // matched markdown files against wildcard pattern
    console.log('src file list: ' + srcFileNames);
    let idx = 0;
    for (idx in srcFileNames) {
        // multi-copy one by one
        copyOneFile(srcFileNames[idx], dstDirName, rmFlag);
    }
})

function copyOneFile(mdSrcFileName, dstDirName, rmFlag) {
    // mdSrcFileNameOrigin: markdown relative file path, e.g. 'hello.md'
    let mdSrcFileNameOrigin = mdSrcFileName;

    if (! fs.lstatSync(mdSrcFileName).isFile() || ! mdSrcFileName.endsWith('.md')) {
        console.log("--src MUST be a markdown file");
        process.exit(2);
    }
    
    if (! fs.lstatSync(dstDirName).isDirectory()) {
        console.log("--dst MUST be a directory");
        process.exit(3);
    }
    
    // mdSrcFileName: markdown absolute file path, e.g. '/Users/downgoon/Document/hello.md'
    // process.cwd() vs. __basename
    if (! path.isAbsolute(mdSrcFileName)) {
        mdSrcFileName = path.join(process.cwd(), mdSrcFileName);
    }
    
    // dstDirName: absolute dest path, e.g. '/Users/downgoon/Backup/'
    if (! path.isAbsolute(dstDirName)) {
        dstDirName = path.join(process.cwd(), dstDirName);
    }
    
    // srcDirName: markdown absolute dir path, e.g. '/Users/downgoon/Document/'
    var srcDirName = path.dirname(mdSrcFileName);

    // mdSrcNoExt: markdown file name without extension, e.g. 'hello'
    var mdSrcNoExt = path.parse(mdSrcFileName).name;
    
    // img references to be changed
    // e.g { 'assets/world.png': 'hello/world.png', 'asset/abcd.png': 'hello/abcd.png' }
    var imgRefChanged = {};

    var mdSrcFileContent = fs.readFileSync(mdSrcFileName, 'utf8');
    var parser = new Parser();
    parser.parse(mdSrcFileContent, function(err, md) {
    
        let idx = 0;
        for (idx in md.references) {
            if (md.references[idx].image == true) {
                // md.references[idx].href: image referencing path, e.g. 'assets/world.png'  or 'http://s3.amazon.com/world.png'
                if (md.references[idx].href.startsWith("https?:\/\/")) {
                    continue; // skip remote http image
                }

                // imgSrcFinal: image absolute src path, e.g. '/Users/downgoon/Document/assets/world.png'
                // imgDstFinal: image absolute dst path, e.g. '/Users/downgoon/Backup/assets/world.png'
                let imgSrcFinal = path.join(srcDirName, md.references[idx].href);
                let imgDstFinal = path.join(dstDirName, md.references[idx].href);
                if (hexoFlag) {
                    // e.g. extract 'world.png'
                    var imgBaseName = path.parse(md.references[idx].href).base;
                    // e.g. '/Users/downgoon/Backup/hello/world.png'
                    imgDstFinal = path.join(dstDirName, mdSrcNoExt, imgBaseName);
                    // console.log('imgRefChanged: ' + md.references[idx].href + ' : ' + path.join(mdSrcNoExt, imgBaseName));
                    imgRefChanged[md.references[idx].href] = path.join(mdSrcNoExt, imgBaseName);
                }
                
                if (rmFlag) {
                    fse.move(imgSrcFinal, imgDstFinal,
                        function(err) {
                            if (err != undefined) {
                                console.log(err);
                        }
                    });
                    console.log('mv ' + md.references[idx].href + ' to ' + imgDstFinal );

                } else {
                    fse.copy(imgSrcFinal, imgDstFinal,
                        function(err) {
                            if (err != undefined) {
                                console.log(err);
                        }
                    });
                    console.log('cp ' + md.references[idx].href + ' to ' + imgDstFinal );
                }
                
            }
    
        } // end for

        
        let rewriteFlag = hexoFlag && Object.keys(imgRefChanged).length > 0;
        var dstFileName = path.join(dstDirName, mdSrcFileName.substr(srcDirName.length));


        // copy or move src markdown file
        if (! rewriteFlag) {
            if (rmFlag) {
                fse.move(mdSrcFileName, dstFileName);
                console.log('mv ' + mdSrcFileNameOrigin + ' to ' + dstDirName );
            } else {
                fse.copy(mdSrcFileName, dstFileName);
                console.log('cp ' + mdSrcFileNameOrigin + ' to ' + dstDirName );
            }
        }
        
        // replace image references and write into another new file
        if (rewriteFlag) {
            // key (searchValue) --> value (replaceValue)
            for (var key in imgRefChanged) {
                console.log('replace: ' + key + ' => ' + imgRefChanged[key]);
                mdSrcFileContent = mdSrcFileContent.replace(key, imgRefChanged[key])
            }
            fse.writeFileSync(dstFileName, mdSrcFileContent);
            console.log('rewrite file: ' + dstFileName);
            if (rmFlag) {
                fse.removeSync(mdSrcFileName);
            }
        }

    });
    
}

process.on('unhandledRejection', error => {
    // do nothing
    console.log('error: ' + error);
});
