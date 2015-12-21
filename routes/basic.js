import {Router} from 'express';
import Reddit from '../libs/reddit'

const route = Router();
const reddit = new Reddit();

route.get('/', (req, res) => res.render('index', {title: 'ayy lmao'}));

route.get('/fetch', (req, res)=> {
  reddit.fetch(Object.assign(req.query, {subreddit: 'buildapcsales'}))
    .then(posts => reddit.normalize(posts, {images: req.query.images}))
    .then(posts => res.json(posts))
    .catch(err => res.json(err));
});

export default route;