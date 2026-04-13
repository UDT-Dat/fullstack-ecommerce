const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes("http://localhost:5000")) {
        // Normal string quotes
        content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "import.meta.env.VITE_API_URL + '$1'");
        content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, 'import.meta.env.VITE_API_URL + "$1"');
        // Template literal quotes
        content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${import.meta.env.VITE_API_URL}$1`');
        
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'src'));
console.log('Replaced all API URLs successfully');
