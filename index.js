#!/usr/bin/env node
/* eslint-disable no-plusplus */

const meow = require('meow');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

const mboxParser = require('./src/mboxParser');

const helpMessage = `${chalk.bold('mbox-attachment-extract')}

${chalk.underline.green('Usage:')}
  $ mbox-attachment-extract ${chalk.italic.greenBright('<<path-to-mbox-file>>')} ${chalk.italic.cyanBright('<<path-to-extracted-files>>')} ${chalk.gray('Defaults to "./"')}

${chalk.underline.green('Options:')}
${chalk.gray('--pattern, -p')} Regex to filter attachments. Default: ''
${chalk.gray('--directoryPerDomain, -d')} Create a directory for each mail domain. Example: amazon.de/
${chalk.gray('--filenameAsSubject, -s')} Create the attachment with the subject as the filename. Example: fromdomain_subject.zip
${chalk.gray('--help')} Prints this help text
${chalk.gray('--version')} Prints the current version

${chalk.underline.green('Example:')}
  mbox-attachment-extract  ${chalk.italic.greenBright('./inbox.mbox')} ${chalk.italic.cyanBright('./files/')}
  mbox-attachment-extract  ${chalk.italic.greenBright('./inbox.mbox')} ${chalk.italic.cyanBright('./files/')} -s
  mbox-attachment-extract  ${chalk.italic.greenBright('../sent.mbox')} ${chalk.italic.cyanBright('./pdf/')} -p ${chalk.gray('\\.pdf$')}
`;

const cli = meow(helpMessage, {
  hardRejection: true,
  flags: {
    pattern: {
      type: 'string',
      alias: 'p',
    },
    directoryPerDomain: {
      type: 'boolean',
      alias: 'd',
    },
    filenameAsSubject: {
      type: 'boolean',
      alias: 's',
    },
  },
});

const { input: [mboxPath, attachmentPath = './'], flags: { pattern, directoryPerDomain, filenameAsSubject } } = cli;

if (directoryPerDomain) console.error('DOMAIN');
if (filenameAsSubject) console.error('FILENAME');

if (!mboxPath) {
  console.error(`${chalk.bold.redBright('Error: The path to the mbox file cannot be empty!')} `);
  console.log(helpMessage);
  process.exit(1);
}

mboxParser(mboxPath, attachmentPath, pattern, filenameAsSubject, directoryPerDomain);
updateNotifier({ pkg }).notify();
