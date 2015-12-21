require("babel-register");

/**
 * npm install mocha -g
 * mocha server/tests/reddit-fetch.test.js
 */

var expect = require('expect.js');
var Reddit = require('../libs/reddit').default;
var reddit = new Reddit();

function debug(posts) {
  console.log('Downloaded: ' + posts.length);
  return posts;
}

describe(__filename, ()=> {
  it("should fetch a bunch of posts from buildapcsales", ()=> {
    reddit.fetch({subreddit: 'buildapcsales', time: 'all', sort: 'hot'})
      .then(posts => reddit.normalize(posts, {images: true}))
      .then(debug)
      .then(posts => expect(posts).to.not.be.empty());
  });

  it("should fetch a bunch of posts from home", ()=> {
    reddit.fetch({time: 'all', sort: 'hot'})
      .then(posts => reddit.normalize(posts, {images: true}))
      .then(debug)
      .then(posts => expect(posts).to.not.be.empty());
  });
});