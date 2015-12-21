require("babel-register");


/**
 * npm install mocha -g
 * mocha server/tests/reddit-extract.test.js
 */


var extract = require('../libs/reddit/extract').default;
var expect = require('expect.js');

function debug(p) {
  console.log(p.title);
  return p;
}

describe(__filename, ()=> {
  require('./data/posts.json').forEach(function (p) {
    it(p, ()=> {
      p = extract(p);
      expect(p.title).to.be.a('string');
      debug(p);
    });
  });
  require('./data/posts2.json').forEach(function (p) {
    it(p, ()=> {
      p = extract(p);
      expect(p.title).to.be.a('string');
      debug(p);
    });
  });
});