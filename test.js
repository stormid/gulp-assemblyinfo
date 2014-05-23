'use strict';

var es = require('event-stream'),
    file = require('vinyl'),
    assemblyinfo = require('./index'),
    _ = require('lodash');

describe('gulp-assemblyinfo', function() {
    describe('outputFile', function() {
        describe('when no output file is set', function() {
            var asm;
            beforeEach(function() {
                asm = assemblyinfo({});
            });

            it('should throw an exception', function(cb) {
                var error;
                asm.on('error', function(err) {
                    expect(err.message).toEqual('outputFile is required');
                    cb();
                });
                asm.write();
            })
        });

        describe('when the outputFile is set', function() {
            var asm;
            beforeEach(function() {
                asm = assemblyinfo({
                    outputFile: 'info.cs'
                });
            });

            it('should set the file name', function(cb) {
                var error;
                asm.on('data', function(file) {
                    expect(file.path).toEqual('info.cs');
                    cb();
                });
                asm.write();
            })
        })
    });

    describe('when an unknown language is set', function() {
        var asm;
        beforeEach(function() {
            asm = assemblyinfo({
                outputFile: 'info.cs',
                language: 'foo'
            });
        });

        it('should throw an exception', function(cb) {
            var error;
            asm.on('error', function(err) {
                expect(err.message).toEqual('language "foo" is not recognised');
                cb();
            });
            asm.write();
        })
    });

    describe('namespaces', function() {
        var asm, lines;
        describe('c#', function() {
            describe('when calling with no additional namespaces', function() {
                beforeEach(function(cb) {
                    asm = assemblyinfo({
                        outputFile: 'info.cs'
                    });

                    asm.once('data', function(file){
                        lines = file.contents.toString().split('\n');
                    });
                    asm.write();
                    cb();
                });

                it('should write default namespaces', function() {
                    expect(lines[0]).toEqual('using System.Reflection;');
                    expect(lines[1]).toEqual('using System.Runtime.InteropServices;');
                })
            });

            describe('when calling with additional namespaces', function(){
                beforeEach(function(cb) {
                    asm = assemblyinfo({
                        outputFile: 'info.cs',
                        namespaces: ['test', 'test2', 'test']
                    });

                    asm.once('data', function(file){
                        lines = _.where(file.contents.toString().split('\n'), function(x) {return x;});
                    });
                    asm.write();
                    cb();
                });

                it('should filter duplicates', function() {
                    expect(lines.length).toEqual(4);
                });

                it('should add additional namespaces', function(){
                    expect(lines[2]).toEqual('using test;');
                    expect(lines[3]).toEqual('using test2;');
                })
            });
        });

        describe('vb.net', function() {
            describe('when calling with no additional namespaces', function() {
                beforeEach(function(cb) {
                    asm = assemblyinfo({
                        outputFile: 'info.cs',
                        language: 'vb'
                    });

                    asm.once('data', function(file){
                        lines = file.contents.toString().split('\n');
                    });
                    asm.write();
                    cb();
                });

                it('should write default namespaces', function() {
                    expect(lines[0]).toEqual('Imports System.Reflection');
                    expect(lines[1]).toEqual('Imports System.Runtime.InteropServices');
                })
            });

            describe('when calling with additional namespaces', function(){
                beforeEach(function(cb) {
                    asm = assemblyinfo({
                        outputFile: 'info.cs',
                        language: 'vb',
                        namespaces: ['test', 'test2', 'test']
                    });

                    asm.once('data', function(file){
                        lines = _.where(file.contents.toString().split('\n'), function(x) {return x;});
                    });
                    asm.write();
                    cb();
                });

                it('should filter duplicates', function() {
                    expect(lines.length).toEqual(4);
                });

                it('should add additional namespaces', function(){
                    expect(lines[2]).toEqual('Imports test');
                    expect(lines[3]).toEqual('Imports test2');
                })
            });
        })
    });

    describe('options', function() {
        var asm, lines;
        describe('c#', function() {
            describe('when all options are set', function() {
                beforeEach(function(cb) {
                    asm = assemblyinfo({
                        outputFile: 'info.cs',

                        title: 'title',
                        description: 'description',
                        companyName: 'companyName',
                        productName: 'productName',
                        copyright: 'copyright',
                        trademark: 'trademark',
                        comVisible: true,
                        comGuid: "comGuid",
                        version: "version",
                        fileVersion: "fileVersion",
                        customAttributes: {
                            'test': 'empty',
                            'test2': "value"
                        }
                    });

                    asm.once('data', function(file){
                        lines = _.where(file.contents.toString().split('\n'), function(x) {return x;});
                    });
                    asm.write();
                    cb();
                });

                it('should set AssemblyTitle', function() {
                    assertLine('[assembly: AssemblyTitle("title")]');
                });

                it('should set AssemblyDescription', function() {
                    assertLine('[assembly: AssemblyDescription("description")]');
                });

                it('should set AssemblyCompany', function() {
                    assertLine('[assembly: AssemblyCompany("companyName")]');
                });

                it('should set AssemblyProduct', function() {
                    assertLine('[assembly: AssemblyProduct("productName")]');
                });

                it('should set AssemblyCopyright', function() {
                    assertLine('[assembly: AssemblyCopyright("copyright")]');
                });

                it('should set AssemblyTrademark', function() {
                    assertLine('[assembly: AssemblyTrademark("trademark")]');
                });

                it('should set ComVisible', function() {
                    assertLine('[assembly: ComVisible(true)]');
                });

                it('should set Guid', function() {
                    assertLine('[assembly: Guid("comGuid")]');
                });

                it('should set AssemblyVersion', function() {
                    assertLine('[assembly: AssemblyVersion("version")]');
                });

                it('should set AssemblyFileVersion', function() {
                    assertLine('[assembly: AssemblyFileVersion("fileVersion")]');
                });

                it('should set customAttributes', function() {
                    assertLine('[assembly: test()]');
                    assertLine('[assembly: test2("value")]');
                });

                function assertLine( expected){
                    expect(_.where(lines, function(l) {return l === expected}).length === 1).toEqual(true);
                }
            });
        });

        describe('vb.net', function() {
            describe('when all options are set', function() {
                beforeEach(function(cb) {
                    asm = assemblyinfo({
                        outputFile: 'info.cs',
                        language: 'vb',

                        title: 'title',
                        description: 'description',
                        companyName: 'companyName',
                        productName: 'productName',
                        copyright: 'copyright',
                        trademark: 'trademark',
                        comVisible: true,
                        comGuid: "comGuid",
                        version: "version",
                        fileVersion: "fileVersion",
                        customAttributes: {
                            'test': 'empty',
                            'test2': "value",
                            'test3': true,
                            'test4': false
                        }
                    });

                    asm.once('data', function(file){
                        lines = _.where(file.contents.toString().split('\n'), function(x) {return x;});
                        console.log(lines);
                    });
                    asm.write();
                    cb();
                });

                it('should set AssemblyTitle', function() {
                    assertLine('<assembly: AssemblyTitle("title")>');
                });

                it('should set AssemblyDescription', function() {
                    assertLine('<assembly: AssemblyDescription("description")>');
                });

                it('should set AssemblyCompany', function() {
                    assertLine('<assembly: AssemblyCompany("companyName")>');
                });

                it('should set AssemblyProduct', function() {
                    assertLine('<assembly: AssemblyProduct("productName")>');
                });

                it('should set AssemblyCopyright', function() {
                    assertLine('<assembly: AssemblyCopyright("copyright")>');
                });

                it('should set AssemblyTrademark', function() {
                    assertLine('<assembly: AssemblyTrademark("trademark")>');
                });

                it('should set ComVisible', function() {
                    assertLine('<assembly: ComVisible(True)>');
                });

                it('should set Guid', function() {
                    assertLine('<assembly: Guid("comGuid")>');
                });

                it('should set AssemblyVersion', function() {
                    assertLine('<assembly: AssemblyVersion("version")>');
                });

                it('should set AssemblyFileVersion', function() {
                    assertLine('<assembly: AssemblyFileVersion("fileVersion")>');
                });

                it('should set customAttributes', function() {
                    assertLine('<assembly: test()>');
                    assertLine('<assembly: test2("value")>');
                });

                it('should set boolean properly', function() {
                    assertLine('<assembly: test3(True)>');
                    assertLine('<assembly: test4(False)>');
                });

                function assertLine( expected){
                    expect(_.where(lines, function(l) {return l === expected}).length === 1).toEqual(true, expected);
                }
            });
        });
    });
});