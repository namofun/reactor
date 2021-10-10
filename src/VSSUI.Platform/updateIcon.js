const fs = require("fs");
const toolVersion = 1;
const fabricFontFileNames = fs.readdirSync('src/Components/Icon/fonts');
const autoGeneratedHeader = '' +
'/*-------------------------------------------------------------------------------------------------*\\\n' +
'| <auto-generated tool="updateIcon.js" version="' + toolVersion + '">\n' +
'|   This code was generated by a tool.\n' +
'|   Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.\n' +
'| </auto-generated>\n' +
'\\*-------------------------------------------------------------------------------------------------*/\n' +
'\n';

function loadAzureDevOpsMDL2() {
    const fileName = 'node_modules/azure-devops-ui/Components/Icon/FabricIcons.scss';
    const content = fs.readFileSync(fileName, "utf-8");
    const regex = /\.ms-Icon\-\-[a-zA-Z0-9]+\:before/g;

    const value = [];
    let match;
    while (match = regex.exec(content)) {
        console.assert(match.length === 1);
        const iconName = match[0].replace('.ms-Icon--', '').replace(':before', '');
        if (!value.some(v => v === iconName)) {
            value.push(iconName);
        }
    }

    return value;
}

function loadFabricMDL2(index) {
    const fileName = index === -1 ? 'fabric-icons.json' : `fabric-icons-${index}.json`;
    const content = fs.readFileSync(`src/Components/Icon/data/${fileName}`, "utf-8");
    const fontJson = JSON.parse(content);

    const fontFileRegexStr = `^fabric\\-icons\\-${index === -1 ? '' : index + '\\-'}[0-9a-f]{8}\\.woff$`;
    const regex = new RegExp(fontFileRegexStr);
    const fontFiles = fabricFontFileNames.filter(fn => fn.match(regex));
    console.assert(fontFiles.length === 1);
    fontJson.fileName = fontFiles[0];
    return fontJson;
}

const adoMdl2 = loadAzureDevOpsMDL2();
const fabricMdl2 = [];
for (let i = -1; i <= fabricFontFileNames.length - 2; i++) {
    fabricMdl2.push(loadFabricMDL2(i));
}

let iconNamesTs = autoGeneratedHeader;
let iconNamesScss = autoGeneratedHeader;
const availableIconNames = [];

//-------------------------------------
// Font set FabricMDL2Slice0Assets
//-------------------------------------

iconNamesScss += '/*-----------------------------------*\\\n';
iconNamesScss += '|  Font set AzureDevOpsMDL2Assets\n';
iconNamesScss += '\\*-----------------------------------*/\n';
iconNamesScss += '.fabric-icon.ms-IconSet--AzureDevOpsMDL2Assets {\n';
iconNamesScss += '    font-family: "AzureDevOpsMDL2Assets";\n';
iconNamesScss += '}\n\n';
adoMdl2.forEach(icon => {
    availableIconNames.push([icon, 'AzureDevOpsMDL2Assets']);
});

fabricMdl2.forEach((element, index) => {    
    const icons = element.glyphs.filter(v => adoMdl2.indexOf(v.name) === -1);
    const set = 'FabricMDL2Slice' + index + 'Assets';
    iconNamesScss += '/*-----------------------------------*\\\n';
    iconNamesScss += '|  Font set ' + set + '\n';
    iconNamesScss += '\\*-----------------------------------*/\n';
    iconNamesScss += '\n';
    iconNamesScss += '@font-face {\n';
    iconNamesScss += '    font-family: "' + set +'";\n';
    iconNamesScss += '    src: url("./fonts/' + element.fileName + '") format("woff");\n';
    iconNamesScss += '}\n\n';
    iconNamesScss += '.fabric-icon.ms-IconSet--' + set + ' {\n';
    iconNamesScss += '    font-family: "' + set +'";\n';
    iconNamesScss += '}\n\n';
    icons.forEach(icon => {
        availableIconNames.push([icon.name, set]);
        iconNamesScss += '.ms-Icon--' + icon.name + ':before { content: "\\' + icon.unicode + '"; }\n';
    });
    iconNamesScss += '\n';
});

// Removed for this is not useful.
//iconNamesTs += 'export type IconNames =\n    \'';
//iconNamesTs += availableIconNames.map(i => i[0]).join('\'\n    | \'');
//iconNamesTs += '\'\n;\n\n'

iconNamesTs += 'export const IconNamesMap: { [key: string]: string; } = {\n';
availableIconNames.forEach(element => {
    iconNamesTs += '    \'' + element[0] + '\': \'' + element[1] + '\',\n';
});
iconNamesTs += '};\n\n';

iconNamesTs += 'export function getIconNameMap(iconName: string): string | undefined {\n';
iconNamesTs += '    if (iconName in IconNamesMap) {\n';
iconNamesTs += '        return IconNamesMap[iconName];\n';
iconNamesTs += '    } else {\n';
iconNamesTs += '        return undefined;\n';
iconNamesTs += '    }\n';
iconNamesTs += '}\n';

fs.writeFileSync('src/Components/Icon/IconNames.ts', iconNamesTs, 'utf-8');
fs.writeFileSync('src/Components/Icon/ExtendedIcon.css', iconNamesScss, 'utf-8');
