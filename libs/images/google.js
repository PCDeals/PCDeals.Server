/**
 * Created by Brent on 11/18/15.
 */
import request from 'request'
import async from 'async'
import cheerio from 'cheerio'

export default function (opts) {
  return new Promise((resolve, reject)=> {

    var q = escape(opts.q);
    var params = '';

    delete opts.q;

    opts.tbs = opts.tbs || 'isz:l';
    opts.tbm = opts.tbm || 'isch';

    for (var a in opts) {
      params += a + '=' + encodeURIComponent(opts[a]) + '&';
    }

    request({
      url: 'https://www.google.com/search?' + params + '&q=' + q,
      method: 'get',
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36',
        'accept-encoding': 'gzip, deflate, sdch',
        'accept-language': 'en-US,en;q=0.8,de;q=0.6',
        'cache-control': 'max-age=0',
        'dnt': 1,
        'referer': 'https://www.google.com/search?q=' + escape(q) + '&tbs=isz:l&tbm=isch'  // MUST change every 50 or so requests
      },
      gzip: true
    }, function (err, res, body) {
      if (err) return callback(err, []);

      var links = [];

      try {
        //links = body.match(/imgres\?imgurl=(.*?)\&amp;imgrefurl=/gm)
        links = body.match(/"ou":"(.*?)"/gm)
          .map(function (imgurl) {
            //imgurl = imgurl.replace('imgres\?imgurl=', '').replace('&amp;imgrefurl=', '');
            imgurl = imgurl.replace('"ou":', '').replace('"', '').replace('"', '');
            return decodeURIComponent(decodeURIComponent(imgurl));
          });
      } catch (e) {
        return reject(e);
      }

      resolve(links);
    });
  });
};