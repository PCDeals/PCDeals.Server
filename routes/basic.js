import {Router} from 'express';
import Reddit from '../libs/sources/reddit'

const route = Router();
const reddit = new Reddit();

route.get('/', (req, res) => res.render('index', {title: 'ayy lmao'}));

route.get('/fetch', (req, res)=> {
  reddit.fetch(Object.assign(req.query, {subreddit: 'buildapcsales'}))
    .then(posts => {
      console.log(posts);
      return reddit.normalize(posts.data, {images: req.query.images})
        .then(pd => Object.assign(posts, {data: pd}))
    })
    .then(posts => res.json(posts))
    .catch(err => res.json(err));
});

export default route;