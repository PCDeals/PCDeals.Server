import {Router} from 'express';
import Hook from 'github-webhook-handler'
import fs from 'fs'
import githubKeys from '../keys/github.json'
import events from 'github-webhook-handler/events'
import shell from 'shelljs'

const handler = Hook();
const route = Router();
const gitLog = 'git log --pretty=format:\'{%n  "commit": "%H",%n  "abbreviated_commit": "%h",%n  "tree": "%T",%n  "abbreviated_tree": "%t",%n  "parent": "%P",%n  "abbreviated_parent": "%p",%n  "refs": "%D",%n  "encoding": "%e",%n  "subject": "%s",%n  "sanitized_subject_line": "%f",%n  "body": "%b",%n  "commit_notes": "%N",%n  "verification_flag": "%G?",%n  "signer": "%GS",%n  "signer_key": "%GK",%n  "author": {%n    "name": "%aN",%n    "email": "%aE",%n    "date": "%aD"%n  },%n  "commiter": {%n    "name": "%cN",%n    "email": "%cE",%n    "date": "%cD"%n  }%n},\'';

// all available events
// https://developer.github.com/webhooks/#events

function exec(a) {
  return shell.exec(a, {silent: false}).output;
}

function handle(e) {
  return new Promise((resolve, reject) => {
    let file = `${__dirname}/../.githook@${e}`;
    if (!fs.statSync(file)) {
      return reject(`${file} not found`);
    }
    resolve({output: exec(`. ${file}`).split('\n')});
  });
}

handler.on('error', err=> console.error('Error:', err.message));

route.get('/', (req, res) => {
  let log = exec(gitLog);
  try {
    log = `[${log.slice(0, -1)}]`; // remove trailing commas
    res.json(JSON.parse(log));
  } catch (e) {
    console.log(e);
    res.send(log);
  }
});

route.get('/trigger/:event', (req, res) => {
  handle(req.params.event)
    .then(output => res.send(output))
    .catch(err => res.send(err))
});

Object.keys(events).forEach(e=> handler.on(e, e => handle(e.event)));

route.post('/', handler);

export default route