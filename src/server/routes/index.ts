
/*
Load `*.js` under current directory as properties
i.e., `home.js` will become `exports['home']` or `exports.home`
*/

// walks through the directory structure and exports all .js files
// as routes matching directory structure

import fs = require('fs');
import path = require('path');

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

export function walk (dir, subDirName?, refObj?) {
    var list = fs.readdirSync(dir);
    var objToExport = undefined;
    
    for (var i = 0, l = list.length; i < l; i++) {
        var fName = list[i];
        if (!endsWith(fName, '.ts') && !endsWith(fName, '.map') && !endsWith(fName, '.sh')) {
            var file = path.resolve(dir, list[i]);
            var routeName = path.basename(file, '.js');
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                if (!refObj) {
                    if (!objToExport) objToExport = {};
                    walk(file, routeName, objToExport);
                    exports[routeName] = objToExport;
                } else {
                    refObj[routeName] = {};
                    walk(file, routeName, refObj[routeName]);
                }
            } else {
                if (!subDirName) {
                    if (routeName != 'index')
                        exports[routeName] = require(file)[routeName];
                } else if (refObj) {
                    refObj[routeName] = require(file)[routeName];
                }
            }
        }
    }
};