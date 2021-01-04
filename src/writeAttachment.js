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
    const from = parsedMessage.from.text.match(/@(.+?\..+)/);
    const sender = parsedMessage.from.text;
    pathToSave = `${pathToSave}${slash}${sanitize(from[1])}${slash}${sanitize(sender)}${slash}`;

    if (!fs.existsSync(pathToSave)) {
      fs.mkdirSync(pathToSave, { recursive: true });
    }
  }

  if (filenameAsSubject) {
    const ext = path.extname(filename);
    const from = parsedMessage.from.text.match(/@(.+?)\./);
    const subject = parsedMessage.subject ? parsedMessage.subject.replace(/\W+|\.+/g, '_') : '_';

    filename = `${from[1]}_${subject}_${i}${ext}`;
  }

  filename = sanitize(filename);
  if (parsedMessage.date) {
    const datePrefix = parsedMessage.date.toISOString()
      .substring(0, 'yyyy-mm-ddThh:mm:ss'.length)
      .replace(/[^0-9]+/g, '');

    filename = `${pathToSave}${datePrefix}_${filename}`;
    fs.writeFileSync(filename, file.content);
    fs.utimesSync(filename, parsedMessage.date, parsedMessage.date);
  } else {
    filename = `${pathToSave}${filename}`;

    fs.writeFileSync(filename, file.content);
  }
};
