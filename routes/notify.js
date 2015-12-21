import {Router} from 'express';
import Pusher from 'pusher-client'
import _ from 'underscore';
import sio from '../message/sio'
import Reddit from '../libs/sources/reddit'
import * as pusherKeys from '../keys/pusher.json'
import * as sample from './sample.json'
import * as gcm from '../message/gcm'

const route = Router();
const reddit = new Reddit();
const pusher = new Pusher(pusherKeys.appKey);

function emit(event, ...args) {
  // gcm.emit(event, ...args);
  sio.emit(event, ...args);
}

function send(promise) {
  promise
    .then(post => {
      if (!post.title) {
        return console.error("No title in post");
      }

      console.log(post.title.yellow);

      emit('new-listing', {data: post});
      emit('debug-listing', post.title);
      emit('notification-test', post.title);
      emit('notification-listing', {data: post});
    });
}

pusher
  .subscribe('askreddit')
  .bind('new-listing', post => {
    post.title = _.sample(sample);

    send(reddit.normalize(post))
  });

reddit
  .listen({subreddit: 'buildapcsales', sort: 'new', r: Math.random}, 5000)
  .on('new-post', post => send(reddit.normalize(post, {images: true})));

route.post('/registerToken', (req, res) => {
  gcm.register(req.body.registrationToken, error => res.status(error ? 404 : 200)).json({error});
});

route.post('/deregisterToken', (req, res) => {
  gcm.deregister(req.body.registrationToken);
  res.send(200);
});

export default route