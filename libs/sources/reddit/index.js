import querystring from 'querystring'
import request from 'request-promise'
import Source from './../source'
import extract from './extract'
import async from 'async'
import {EventEmitter2} from 'eventemitter2'
import _ from 'underscore'
import {objExec} from '../../utils'

const HOST = 'http://reddit.com/';

export default class Reddit extends Source {

  fetch(opts) {
    opts = Object.assign({
      subreddit: 'buildapcsales',
      after: '',
      time: 'all',
      sort: 'hot'
    }, opts);

    opts.format = '.json';
    opts.t = opts.t || opts.time; // for readability
    opts.subreddit = opts.subreddit ? `r/${opts.subreddit}` : '';
    opts = objExec(opts);

    const url = `${[HOST, opts.subreddit, opts.format].join('/')}?${querystring.stringify(opts)}`;
    return request({url, json: true})
      .then(res => res.data.children)
      .then(res => res.map(post=> post.data));
  }

  normalize(posts, opts) {
    opts = Object.assign({
      images: false
    }, opts);

    posts = JSON.parse(JSON.stringify(posts));
    return new Promise((resolve, reject) => {
      async.each(Array.isArray(posts) ? posts : [posts],
        (post, callback) => {
          post = Object.assign(post, extract(post.title));
          if (opts.images) {
            return this.fetchImages(post.title)
              .then(links => {
                links = !links.length ? [Source.DEFAULT_IMAGE] : links;
                post.images = links;
                post.image = links[0];
              }).then(()=> callback())
              .catch(err => callback());
          }
          return callback();
        }, () => resolve(posts));
    });
  }

  listen(opts, interval) {
    let history = [];
    const emitter = new EventEmitter2();

    function cancel() {
      clearInterval(cancel);
      cancel = "CANCELLED";
    }

    emitter.on('cancel', cancel);
    emitter.cancel = cancel;

    this.fetch(opts)
      .then(posts => {
        history = _.pluck(posts, 'id');

        setTimeout(() => {

          if (cancel) {
            return;
          }

          cancel = setInterval(() => {
            this.fetch(opts)
              .then(posts => {
                const n = _.pluck(posts, 'id');
                const t = _.indexBy(posts, 'id');
                const m = _.difference(n, history);

                history = _.uniq(_.union(history, n));

                m.forEach(id => emitter.emit('new-post', t[id]));
              }).catch(err => console.error(err.message));
          }, interval);
        }, 4000);
      });

    return emitter;
  }
}