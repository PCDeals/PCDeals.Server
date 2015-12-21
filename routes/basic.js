import {Router} from 'express';
import Reddit from '../libs/reddit'
import Cache from '../libs/cache'

const route = Router();
const reddit = new Reddit();
const redditCache = new Cache('reddit');

route.get('/', (req, res) => res.render('index', {title: 'ayy lmao'}));

route.get('/fetch', (req, res)=> {
  const query = Object.assign(req.query, {subreddit: 'buildapcsales'});
  const key = JSON.stringify(query);

  if (redditCache.has(key)) {
    return res.json(redditCache.get(key));
  }

  reddit.fetch(query)
    .then(posts => reddit.normalize(posts, {images: req.query.images}))
    .then(redditCache.setter(key))
    .then(posts => res.json(posts))
    .catch(err => res.json(err));
});

export default route;