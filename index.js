'use strict';

var gutil = require('gulp-util'),
    through = require('through2'),
    util = require('util'),
    _ = require('lodash');

var pluginName = 'gulp-assemblyinfo';

var languageEngines = {
    'cs' : {
        attribute: function(attr, val){
            return util.format('[assembly: %s(%s)]', attr, _.isBoolean(val) ? val : util.format('"%s"', val));
        },
        attributeEmpty: function(attr){
            return util.format('[assembly: %s()]', attr);
        },
        using: function(ns){
            return util.format('using %s;', ns);
        }
    },
    'vb' : {
        attribute: function(attr, val){
            return util.format('<assembly: %s(%s)>', attr, _.isBoolean(val) ? (val ? "True" : "False") : util.format('"%s"', val));
        },
        attributeEmpty: function(attr){
            return util.format('<assembly: %s()>', attr);
        },
        using: function(ns) {
            return util.format('Imports %s', ns);
        }
    }
}

function writeAttributes(options, languageEngine) {
    var namespaces = _.uniq(['System.Reflection', 'System.Runtime.InteropServices'].concat(options.namespaces || []));

    var result = [];

    _.forEach(namespaces, function(n) {
        result.push(languageEngine.using(n));
    });

    result.push('');

    var items = {
        'AssemblyTitle' : options.title,
        'AssemblyDescription': options.description,
        'AssemblyCompany': options.companyName,
        'AssemblyProduct': options.productName,

        'AssemblyCopyright': options.copyright,
        'AssemblyTrademark': options.trademark,

        'ComVisible': options.comVisible,
        'Guid': options.comGuid,

        'AssemblyVersion': options.version,
        'AssemblyFileVersion': options.fileVersion
    };

    if (options.customAttributes)
        _.extend(items, options.customAttributes);

    _.forOwn(items, function(key, item) {
        if (!_.isNull(items[item]) && !_.isUndefined(items[item]) ) {
            if ( items[item] === 'empty')
                result.push(languageEngine.attributeEmpty(item));
            else
                result.push(languageEngine.attribute(item, items[item]));
        }
    });

    return result.join('\n');
}

module.exports = function(options) {
    return through.obj(function(file, enc, callback){
        if (!options.outputFile) {
            this.emit('error', new gutil.PluginError(pluginName, 'outputFile is required'));
            return callback();
        }

        var languageEngine = languageEngines[options.language || 'cs'];

        if (!languageEngine) {
            this.emit('error', new gutil.PluginError(pluginName, util.format('language "%s" is not recognised', options.language)));
            return callback();
        }

        var attributes = writeAttributes(options, languageEngine);

        var result = new gutil.File({
            path: options.outputFile,
            contents: new Buffer(attributes)
        })

        return callback(null, result);
    });
}