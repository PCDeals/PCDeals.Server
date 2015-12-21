import gcm from 'node-gcm'
import _ from 'underscore'
import * as gcmKeys from '../keys/gcm.json'

const sender = new gcm.Sender(gcmKeys.serverKey);
let tokens = [];

export function register(token, cb) {
  if (token) {
    tokens.push(token);
    tokens = _.uniq(tokens);
    return cb(0);
  }

  cb("Invalid token");
}


export function deregister(token, cb) {
  if (token) {
    tokens = _.without(tokens, _.findWhere(tokens, token));
    return cb(0);
  }

  cb("Invalid token");
}


export function emit(event, ...messages) {
  var gms = new gcm.Message();
  for (let msg of messages) {
    gms.addData(msg);
  }

  // FIXME how does gcm now which event you are sending on?
  sender.send(gms, {registrationTokens: tokens}, (err, res)=> {
    if (err) return console.error(err);
    console.info(res);
  });
}

export default sender;

