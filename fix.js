const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, '/', file));
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles('./src/app/api');
files.filter(f => f.endsWith('route.js')).forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (!content.includes('force-dynamic')) {
    fs.writeFileSync(f, "export const dynamic = 'force-dynamic';\n" + content);
    console.log('Fixed ' + f);
  }
});
