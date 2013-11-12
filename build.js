#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var util = require('util');
var template = fs.readFileSync('./src/template.html', {encoding: 'utf8'});

const TAB = '    ';
const COMMENT = '/* Файл сгенерирован с помощью icon_generator */';
const FAVICON_SERVICE = 'http://favicon.yandex.net/favicon/';

    
function getFavicon(url) {
}    

function loadJSON(fileName) {
    return JSON.parse(fs.readFileSync(fileName));
}

function getCSSClass(prefix, id) {
    return prefix + '_id_' + id;
}

function buildCSSElement(cssPrefix, name, id, file) {
    var text = '\n';
    var base64 = '';
    var fileContent = '';
    text += '/* ' + name + ' */\n' + getCSSClass(cssPrefix, id) + '\n{\n' + TAB;
    
    if (file && fs.existsSync(file)) {
        var buf = fs.readFileSync(file);
        fileContent = buf.toString('base64');
        text += 'background-image: url(data:image/png;base64,' + fileContent + ');';
    }
    
    text += '\n}\n\n';
    
    return text;
}

function buildType(data) {
    var text = COMMENT + '\n\n';
    
    var base = loadJSON('./types/' + data.id + '.json');
    text += data.cssPrefix + '\n' + fs.readFileSync('./types/' + data.id + '.css') + '\n';
    
    base.forEach(function (el, i) {
        var image = './images/' + data.id + '/' + (data.fileNameFromName ? el.name : el.id) + '.png';
        var url = '';
        if (el.url) {
            url += ' <a href="' + el.url + '" target="_blank">' + el.url + '</a>'; 
        }
        text += buildCSSElement(data.cssPrefix, el.name, el.id, image);
        content.push('<li><i class="' + data.cssClass + ' ' + getCSSClass(data.cssClass, el.id) + '"></i> ' + el.name + ' (' + el.id + url + ')</li>');
    }, this);
    
    text += '\n\n' + COMMENT;
    
    fs.writeFileSync(data.fileName, text);
}

function onEnd() {
    var text = template
        .replace('\{content\}', content.join('\n'))
        .replace('\{link\}', link.join('\n'));
        
    fs.writeFileSync('./types.html', text);
}

var types = loadJSON('types.json');
types.sort(function (a, b) {
    if (a.title > b.title) {
        return 1;
    }
    
    return -1;
});

var link = [];
var content = [];

content.push('<ul id="menu">');
types.forEach(function (el, i) {
    content.push('<li><a href="#' + el.id + '">' + el.title + '</a></li>');
});

content.push('</ul><br /><br />');

types.forEach(function (el, i) {
    link.push('<link rel="stylesheet" type="text/css" href="' + el.fileName + '?rnd=' + (~~(Math.random * 1E10)) + '" />');
    
    content.push('<h1 id="' + el.id + '">' + el.description + '</h1>');
    content.push('<ul>');
    
    console.log((i + 1) + '/' + types.length + ' - ' + el.id);
    
    buildType(el);
    
    content.push('</ul><br /><br />');
    
    onEnd();
});