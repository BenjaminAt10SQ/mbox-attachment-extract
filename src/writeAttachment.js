const path = require('path');
const fs = require('fs');
const sanitize = require('sanitize-filename');

module.exports = (parsedMessage, attachmentPath,
  filenameAsSubject, directoryPerDomain) => (file, i) => {
  let { filename } = file;
  const isWin = process.platform === 'win32';
  const slash = isWin ? '\\' : '/';
  let pathToSave = attachmentPath.match(/[/\\]$/) ? attachmentPath : `${attachmentPath}${slash}`;

  if (directoryPerDomain) {
    const from = parsedMessage.from.text.match(/@(.+?)\./);
    pathToSave = `${pathToSave}${slash}${sanitize(from[1])}${slash}`;

    if (!fs.existsSync(pathToSave)) {
      fs.mkdirSync(pathToSave);
    }
  }

  if (filenameAsSubject) {
    const ext = path.extname(filename);
    const from = parsedMessage.from.text.match(/@(.+?)\./);
    const subject = parsedMessage.subject ? parsedMessage.subject.replace(/\W+|\.+/g, '_') : '_';

    filename = `${from[1]}_${subject}_${i}${ext}`;
  }

  filename = sanitize(filename);
  filename = `${pathToSave}${filename}`;

  fs.writeFileSync(filename, file.content);

  if (parsedMessage.date) {
    fs.utimesSync(filename, parsedMessage.date, parsedMessage.date);
  }
};
