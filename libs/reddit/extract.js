import cheerio from 'cheerio'

function regexLastIndexOf(str, regex, startpos) {
  regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
  if (typeof(startpos) == "undefined") {
    startpos = str.length;
  } else if (startpos < 0) {
    startpos = 0;
  }
  var stringToWorkWith = str.substring(0, startpos + 1);
  var lastIndexOf = -1;
  var nextStop = 0;
  var result;
  while ((result = regex.exec(stringToWorkWith)) != null) {
    lastIndexOf = result.index;
    regex.lastIndex = ++nextStop;
  }
  return lastIndexOf;
}

function getCategory(s) {
  s = s.trim();
  s = s.replace(/\s{2,}/g, '');

  var category = s.match(/^\[(.*)\](\s?[^\s]{3,})+/); // assuming minimum word size is 3 i.e. gtx

  if (category) {
    category = category[1];
  } else {
    return;
  }

  category = category.replace(/["'()\[\]]/g, ' ');
  category = category.replace(/\s{2,}/g, ' ')
  category = category.trim();
  category = category.toLowerCase();

  if (category === 'meta' || category === 'reminder') {
    return;
  }

  category = category.toUpperCase();

  return category;
}

function getInnerTokens(s) {

  var tokens = [];
  var match = s.match(/\(([^)]+)\)/);

  while (match) {
    var part = match[0].substring(1, match[0].length - 1);
    tokens.push(part);
    s = s.replace(match[0], '');
    match = s.match(/\(([^)]+)\)/);
  }

  return tokens;
}

function getOverflow(s, tokens) {
  return tokens.join(" ");
}

function getTitle(s, nostrip) {

  s = s.trim();
  s = s.replace(/\s/g, ' ');
  s = s.replace(/\s{2,}/g, ' ');
  s = s.replace(/\[{2,}/g, '['); // [[]]
  s = s.replace(/\]{2,}/g, ']');
  s = s.replace(/"(.*)"/g, ''); // "
  s = s.replace(/'(.*)'/g, ''); // '
  s = s.replace(/'(.*)'/g, ''); // `
  s = s.replace(/(\[(.*?)\]\s?)+(\s?)/g, ''); // []*
  s = s.replace(/(\(.*\))+(\s?)/, ''); // ()
  s = s.replace(/\s\+\s/g, ' & '); // x + x + x => x & x & x

  if (!nostrip) {
    var i = regexLastIndexOf(s, /-\s?([\$\£\€\@]|free|(\d+(,\d{3})*\.?[0-9]?[0-9]?)[\$\£\€\@])/i); // - $0, - Free, - 0$

    if (i > -1) {
      s = s.substring(0, i);
    }

    s = s.replace(/([\$\£\€\@]\s?\d+(,\d{3})*\.?[0-9]?[0-9]?)[\+\-]?/, '');
    s = s.replace(/\s{2,}/g, ' ');
    s = s.trim();
  }

  return s;
}

function getPrice(s, tokens) {

  var PRICE_MATCH_REGEX = /([\$\£\€\@]\s?\d+(,\d{3})*\.?[0-9]?[0-9]?|free|(\d+(,\d{3})*\.?[0-9]?[0-9]?)\s?[\$\£\€\@])/;

  s = getTitle(s, true);

  var price = s.match(PRICE_MATCH_REGEX);

  if (price) {
    price = price[0];
    price = price.trim();
  }

  if (!price) {
    for (var i = 0; i < tokens.length; i += 1) {
      price = tokens[i].match(PRICE_MATCH_REGEX);
      if (price) {
        price = price[0];
        break;
      }
    }
  }

  if (price) {
    price = price.replace(/\s/g, '');

    var CURRENCIES = ["$", "£", "€", "@"];
    var DEFAULT_CURRENCY = "$";

    for (var i = 0; i < CURRENCIES.length; i++) {
      if (price.indexOf(CURRENCIES[i]) > -1) {
        price = price.replace(new RegExp("\\" + CURRENCIES[i], "g"), "");
        price = price.replace(/,/g, '');

        if (!isNaN(price)) {
          if (Number(price) <= 0) {
            price = "free";
            break;
          } else {
            price = Number(price).toFixed(2);
          }
        }

        price = CURRENCIES[i] + price;
        break;
      }
    }

    price = price.replace(/,/g, '');

    // replace @ signs with DEFAULT_CURRENCY
    if (price.indexOf("@") === 0) {
      price = DEFAULT_CURRENCY + price.substring(1);
    }

    price = price.trim();
    price = price.toUpperCase();
  }

  return price;
}

export default function extract(s) {

  s = cheerio.load("<body><p>" + s + "</body></p>")("body p").text();

  var tokens = getInnerTokens(s);
  var title = getTitle(s);
  var category = getCategory(s);
  var overflow = getOverflow(s, tokens);
  var price = getPrice(s, tokens);

  return {
    title,
    price,
    category,
    info_text: overflow
  };
}
