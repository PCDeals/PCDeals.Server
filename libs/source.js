import google from './images/google'
import fs from 'fs'
import Cache from '../libs/cache'

const imageCache = new Cache('images').get();

function all() {
  var args = Array.prototype.slice.call(arguments);
  var word = args.shift().toLowerCase();
  for (var i = 0; i < args.length; i++) {
    if (word.indexOf(args[i]) < 0) {
      return false;
    }
  }

  return true;
}

function resolveQuery(query) {
  query = query || "";
  if (all(query, "samsung", "ssd")) {
    query += " cnet";
  } else if (all(query, "gtx", "geforce")) {
    query += " wallpaper";
  } else if (all(query, "intel", /(i5|i7)/)) {
    query += " wallpaper";
  }

  return query;
}

export default class Source {

  /**
   * @return {string}
   */
  static get DEFAULT_IMAGE() {
    return 'https://steamcommunity-a.akamaihd.net/public/images/sharedfiles/steam_workshop_default_image.png';
  }

  fetchImages(q, opts) {
    opts = Object.assign ({
      tbs: 'ift:jpg,isz:m'
    }, opts);

    var arg = Object.assign(opts, {q: resolveQuery(q)});
    var key = JSON.stringify(arg);

    console.info(`${q} (${imageCache[key] ? 'cache' : 'cold'})`);

    if (imageCache[key]) {
      return new Promise((resolve, reject) => resolve(imageCache[key]));
    }

    return google(arg)
      .then(a => {
        imageCache[key] = a;
        return a;
      });
  }

  fetch(opts) {
    throw Error('Not implemented');
  }

  normalize(data) {
    throw Error('Not implemented');
  }

  listen(opts) {
    throw Error('Not implemented');
  }
}