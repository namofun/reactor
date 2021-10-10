const child_process = require("child_process");
const shell = require("shelljs");
const copy = require("recursive-copy");
const fs = require("fs");
const cwd = process.cwd();
const UglifyES = require('uglify-es');
const copyExt = ['.js', '.d.ts', '.scss', '.css'];

console.log('--- Cleaning output ./bin');
console.log('>>> rm -rf ./bin');
shell.rm('-rf', './bin');
console.log('--- done');
console.log('');

console.log('--- Compiling typescript files');
console.log('>>> tsc -p ./tsconfig.json');
child_process.execSync('tsc -p ./tsconfig.json', { stdio: [0, 1, 2], shell: true, cwd });
console.log('--- done');
console.log('');

// node-sass --quiet --output bin src

console.log('--- Copying useful files');
console.log('>>> recursive-copy *' + copyExt.join(', *'));
copy("./src", "./bin", { filter: f => copyExt.some(ext => f.endsWith(ext)) });
console.log('--- done');
console.log('');

console.log('--- Produce minified js');
shell.find('bin').filter(s =>
    s !== 'bin'
    && s.startsWith('bin/')
    && s.endsWith('.js')
    && !s.endsWith('.min.js')
).forEach(fileName => {
    const mangledName = fileName.substr(0, fileName.length - 2) + 'min.js';
    const originalCode = fs.readFileSync(fileName, 'utf-8');
    const mangledCode = UglifyES.minify(originalCode, { mangle: true, compress: true }).code;
    fs.writeFileSync(mangledName, mangledCode, 'utf-8');
    console.log('>>> ' + fileName.substr(4) + ' -> ' + originalCode.length + 'B, ratio ' + (Math.round(10000*mangledCode.length/originalCode.length)/100) + '%')
});
console.log('--- done');
console.log('');

console.log('--- Enlisting publish files');
const publishFiles = shell.find('bin').filter(s => s !== 'bin').map(s => {
    if (s.startsWith('bin/')) {
        return s.substr(4);
    } else {
        throw "Unknwon file " + s;
    }
});
const packageJson = JSON.parse(fs.readFileSync('./package.json', "utf8"));
packageJson.files = publishFiles;
delete packageJson.private;
fs.writeFileSync('./bin/package.json', JSON.stringify(packageJson, null, 2));
console.log('--- done');
console.log('');
