(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/**
 * Copyright (c) 2017 Eugene Ford (stmechanus@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var WHITESPACE = ' '.charCodeAt(0);
var SINGLE_QUOTE = '\"'.charCodeAt(0);
var DOUBLE_QUOTE = '\''.charCodeAt(0);
var SLASH = '\\'.charCodeAt(0);
var HASH = '#'.charCodeAt(0);
var OPEN_PARENTHESES = '('.charCodeAt(0);
var CLOSE_PARENTHESES = ')'.charCodeAt(0);
var ASTERISK = '*'.charCodeAt(0);
var PLUS_SIGN = '+'.charCodeAt(0);
var DOT_SIGN = '.'.charCodeAt(0);
var COLON = ':'.charCodeAt(0);
var RIGHT_ANGLE = '>'.charCodeAt(0);
var OPEN_SQUARE = '['.charCodeAt(0);
var CLOSE_SQUARE = ']'.charCodeAt(0);
var TILDE = '~'.charCodeAt(0);
var EQUAL_SIGN = '='.charCodeAt(0);

/**
 * @returns {boolean}
 */
var CF_WORD = function CF_WORD(code) {
  return code >= 128 || code === 45 || code == 245 || code >= 48 && code <= 57 || code >= 65 && code <= 90 || code >= 97 && code <= 122;
};

/**
 * The selector tokenizer allows to break a css selector string into set of tokens.
 * The tokenization method is based on a set of lexer grammars rules. The full list of
 * available token types is next:
 *
 * <type-selector> - for basic type selectors eg. "article", "h1", "p" etc.
 * <class-selector> - for basic class selectors eg. ".button", ".post", etc.
 * <universal-selector> - for basic universal selector "*"
 * <attribute-selector> - for basic attribute selectors eg. "[attr]", "[attr=val]", "[attr^=val]" etc.
 * <pseudo-selector> - for pseudo-element and pseudo-class-selectors eg. ":first-child", "::first-letter"
 * <descendat-selector> - for selector's descendant combinator " "
 * <adjacent-sibling-selector> - for selector's adjacent sibling combinator "+"
 * <general-sibling-selector> - for selector's general sibling combinator "~"
 * <child-selector> - for selector's child combinator ">"
 *
 * The following example illustrates the principle the SelectorTokenizer.tokenize method
 * @example
 * tokens = tokenizer.tokenize(".page main");
 * tokens   //=> [{type: "class", value: ".page"}, {type: "type", value: "main"}]
 */

var SelectorTokenizer = function () {
  function SelectorTokenizer() {
    _classCallCheck(this, SelectorTokenizer);
  }

  /**
   * Get token type based on one charCode only
   * @param startCode
   * @returns {string}
   *
   * @throws SyntaxError - if target char code was not found in grammar
   *
   * @example
   * type = checker.getInitialTokenType(32);
   * type   //=> "descendant"
   */

  _createClass(SelectorTokenizer, [{
    key: 'getInitialTokenType',
    value: function getInitialTokenType(startCode) {
      // Find target startCode in grammar
      switch (startCode) {
        case WHITESPACE:
          return "descendant";
        case HASH:
          return "id";
        case OPEN_PARENTHESES:
          return "scope-start";
        case CLOSE_PARENTHESES:
          return "scope-end";
        case ASTERISK:
          return "universal";
        case PLUS_SIGN:
          return "adjacent-sibling";
        case DOT_SIGN:
          return "class";
        case COLON:
          return "pseudo";
        case RIGHT_ANGLE:
          return "child";
        case OPEN_SQUARE:
          return "attribute";
        case TILDE:
          return "general-sibling";
        default:
          if (CF_WORD(startCode)) return "type";
          break;
      }
      // Or throw a syntax error
      throw new SyntaxError('Unexpected character "' + String.fromCharCode(startCode) + '"');
    }

    /**
     * Get a token type update for more specificity with additional 3 char codes
     * NOTE: use this method to update toke type only. Use {getInitialTokenType} method
     * to get initial type of target token
     * @param firstCode
     * @param nextCode
     * @param secondCode
     * @returns {string|undefined}
     *
     * @example
     * type = checker.getInitialTokenType(32);
     * type   //=> "descendant"
     * type = checker.getLazyTokenType(32,41);
     * type   //=> "scope-end"
     */

  }, {
    key: 'getLazyTokenType',
    value: function getLazyTokenType(firstCode, nextCode, secondCode) {
      // Change token type if lazy <scope-ending-point> was spotted
      if (nextCode === CLOSE_PARENTHESES && firstCode === WHITESPACE) return "scope-end";

      // Change token type if lazy <adjacent-sibling-selector> was spotted
      else if (nextCode === PLUS_SIGN && firstCode === WHITESPACE) return "adjacent-sibling";

        // Change token type if lazy <child-selector> was spotted
        else if (nextCode === RIGHT_ANGLE && firstCode === WHITESPACE) return "child";

          // Change token type if lazy <general-sibling-selector> was spotted
          else if (nextCode === TILDE && firstCode === WHITESPACE) return "general-sibling";

      return undefined;
    }

    /**
     * Check for <descendant-selector> token bounds
     * @param firstCode
     * @param nextCode
     * @param wasBracesOpened
     * @returns {boolean}
     */

  }, {
    key: 'isDescendantBounds',
    value: function isDescendantBounds(firstCode, nextCode, wasBracesOpened) {
      return !wasBracesOpened && nextCode === WHITESPACE && firstCode !== WHITESPACE && firstCode !== PLUS_SIGN && firstCode !== RIGHT_ANGLE && firstCode !== TILDE;
    }

    /**
     * Check for <id-selector> token bounds
     * @param firstCode
     * @returns {boolean}
     */

  }, {
    key: 'isIdBounds',
    value: function isIdBounds(firstCode) {
      return firstCode === HASH;
    }

    /**
     * Check for <scope-starting-point> bounds
     * @param firstCode
     * @returns {boolean}
     */

  }, {
    key: 'isScopeStartBounds',
    value: function isScopeStartBounds(firstCode) {
      return firstCode === OPEN_PARENTHESES;
    }

    /**
     * Check for <scope-ending-point> bounds
     * @param firstCode
     * @param nextCode
     * @returns {boolean}
     */

  }, {
    key: 'isScopeEndBounds',
    value: function isScopeEndBounds(firstCode, nextCode) {
      return nextCode === CLOSE_PARENTHESES && firstCode !== WHITESPACE;
    }

    /**
     * Check for <universal-selector> bounds
     * @param firstCode
     * @param nextCode
     * @returns {boolean}
     */

  }, {
    key: 'isUniversalBounds',
    value: function isUniversalBounds(firstCode, nextCode) {
      return firstCode === ASTERISK && nextCode !== EQUAL_SIGN;
    }

    /**
     * Check for <adjacent-sibling-selector> bounds
     * @param firstCode
     * @param nextCode
     * @returns {boolean}
     */

  }, {
    key: 'isAdjacentSiblingBounds',
    value: function isAdjacentSiblingBounds(firstCode, nextCode) {
      return nextCode === PLUS_SIGN && firstCode !== WHITESPACE;
    }

    /**
     * Check for <class-selector> bounds
     * @param firstCode
     * @returns {boolean}
     */

  }, {
    key: 'isClassBounds',
    value: function isClassBounds(firstCode) {
      return firstCode === DOT_SIGN;
    }

    /**
     * Check for <pseudo-selector> bounds
     * @param firstCode
     * @param nextCode
     * @returns {boolean}
     */

  }, {
    key: 'isPseudoBounds',
    value: function isPseudoBounds(firstCode, nextCode) {
      return nextCode === COLON && firstCode !== COLON;
    }

    /**
     * Check for <child-selector> bounds
     * @param firstCode
     * @returns {boolean}
     */

  }, {
    key: 'isChildBounds',
    value: function isChildBounds(firstCode, nextCode) {
      return nextCode === RIGHT_ANGLE && firstCode !== WHITESPACE;
    }

    /**
     * Check for <attribute-selector> bounds
     * @param firstCode
     * @returns {boolean}
     */

  }, {
    key: 'isAttributeBounds',
    value: function isAttributeBounds(firstCode) {
      return firstCode === OPEN_SQUARE;
    }

    /**
     * Check for <general-sibling-selector> bounds
     * @param firstCode
     * @param nextCode
     * @param secondCode
     * @returns {boolean}
     */

  }, {
    key: 'isGeneralSiblingBounds',
    value: function isGeneralSiblingBounds(firstCode, nextCode, secondCode) {
      return nextCode === TILDE && secondCode !== EQUAL_SIGN && firstCode != WHITESPACE;
    }

    /**
     * Check for <type-selector> bounds
     * @param firstCode
     * @param nextCode
     * @param wasBracesOpened
     * @returns {boolean}
     */

  }, {
    key: 'isTypeBounds',
    value: function isTypeBounds(firstCode, nextCode, wasBracesOpened) {
      return (firstCode === WHITESPACE || firstCode === PLUS_SIGN || firstCode === TILDE || firstCode === RIGHT_ANGLE) && !wasBracesOpened && CF_WORD(nextCode);
    }

    /**
     * Check for token bounds
     * @param firstCode
     * @param nextCode
     * @param secondCode
     * @param wasBracesOpened
     * @returns {boolean}
     */

  }, {
    key: 'isTokenBounds',
    value: function isTokenBounds(firstCode, nextCode, secondCode, wasBracesOpened) {
      return this.isDescendantBounds(firstCode, nextCode, wasBracesOpened) || this.isIdBounds(nextCode) || this.isScopeStartBounds(nextCode) || this.isScopeEndBounds(firstCode, nextCode) || this.isUniversalBounds(nextCode, secondCode) || this.isAdjacentSiblingBounds(firstCode, nextCode) || this.isClassBounds(nextCode) || this.isPseudoBounds(firstCode, nextCode) || this.isChildBounds(firstCode, nextCode) || this.isAttributeBounds(nextCode) || this.isGeneralSiblingBounds(firstCode, nextCode, secondCode) || this.isTypeBounds(firstCode, nextCode, wasBracesOpened);
    }

    /**
     * Read a grammar token from a string starting at target position
     * @param selectorText - a string containing css text to read a token from
     * @param startIndex - position to start read a token at
     * @returns {number}
     *
     * @throws SyntaxError - if an unknown character was found in process
     *
     * @example
     * token = checker.tokenAt(".classname", 0);
     * token   //=> { type: "class", value: ".classname" }
     */

  }, {
    key: 'tokenAt',
    value: function tokenAt(selectorText, startIndex) {
      var size = 1,
          startCode = selectorText.codePointAt(startIndex),
          type = void 0,
          token = void 0,
          nextCode = void 0,
          nextIndex = void 0,
          prevCode = void 0,
          secondCode = void 0,
          openBraces = void 0,
          openQuotes = void 0,
          penultCode = void 0;

      // Get initial token type
      type = this.getInitialTokenType(startCode);

      // Set initial state for nextCode
      nextIndex = startIndex + size;
      prevCode = startCode;
      nextCode = selectorText.codePointAt(nextIndex);
      secondCode = selectorText.codePointAt(nextIndex + 1);
      openBraces = startCode === OPEN_SQUARE;

      // Check for <scope-starting-pointer> or <scope-ending-pointer>
      if (prevCode === OPEN_PARENTHESES || prevCode === CLOSE_PARENTHESES) {
        while (nextCode === WHITESPACE) {
          nextCode = selectorText.codePointAt(++size + startIndex);
        }
      } else {
        // While not EOF
        while (nextIndex < selectorText.length) {
          if (!openQuotes) {

            // Get a token type update or use the last one
            type = this.getLazyTokenType(prevCode, nextCode, secondCode) || type;

            // Break if next token spotted
            if (this.isTokenBounds(prevCode, nextCode, secondCode, openBraces)) break;
          }

          // Get codes for next iteration
          size++;
          nextIndex = size + startIndex;
          penultCode = prevCode;
          prevCode = nextCode;
          nextCode = selectorText.codePointAt(nextIndex);
          secondCode = selectorText.codePointAt(nextIndex + 1);

          // Check if " or ' was spotted without escape \
          if (prevCode !== SLASH && (nextCode === SINGLE_QUOTE || nextCode == DOUBLE_QUOTE)) {
            if (!!openQuotes) {
              if (nextCode === openQuotes) openQuotes = undefined;
            } else {
              openQuotes = nextCode;
            }
          }

          if (!openQuotes) {
            // Check if [ was spotted
            if (nextCode === OPEN_SQUARE) {
              if (openBraces) throw new SyntaxError('Unexpected character "' + selectorText[nextIndex] + '" at ' + nextIndex + ' position');
              openBraces = true;
            }

            // Check if ] was spotted
            if (nextCode === CLOSE_SQUARE) {
              if (!openBraces) throw new SyntaxError('Unexpected character "' + selectorText[nextIndex] + '" at ' + nextIndex + ' position');
              openBraces = false;
            }

            // Check for triple colon ::: parse error
            if (COLON === penultCode === prevCode === nextCode) {
              throw new SyntaxError('Unexpected character "' + selectorText[nextIndex] + '" at ' + nextIndex + ' position');
            }
          }
        }
      }

      // Create a token
      token = { type: type, value: selectorText.substr(startIndex, size) };

      return token;
    }

    /**
     * Create a set of tokens from target selector string
     * @param selectorText
     * @returns {Array}
     */

  }, {
    key: 'tokenize',
    value: function tokenize(selectorText) {
      var tokens = [],
          index = void 0,
          token = void 0;

      // Loop through selectorText char codes
      for (index = 0; index < selectorText.length; index++) {

        // Create a token
        token = this.tokenAt(selectorText, index);

        // Shift loop pointer by token size
        index = index + token.value.length - 1;

        // Add token to tokensList
        tokens.push(token);
      }

      return tokens;
    }
  }]);

  return SelectorTokenizer;
}();

exports.default = SelectorTokenizer;

},{}],2:[function(require,module,exports){
'use strict';

var _selectorTokenizer = require('../../../dist/selector-tokenizer.js');

var _selectorTokenizer2 = _interopRequireDefault(_selectorTokenizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_selectorTokenizer2.default); // import SelectorTokenizer from "../../../src/selector-tokenizer.es6";


describe('SelectorTokenizer', function () {
  describe('tokenize', function () {
    it('.class-name => [ class ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = ".class-name";
      expectedResult = [{ type: "class", value: ".class-name" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('#id => [ id ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "#id";
      expectedResult = [{ type: "id", value: "#id" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('article => [ type ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "article";
      expectedResult = [{ type: "type", value: "article" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[autocomplete] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[autocomplete]";
      expectedResult = [{ type: "attribute", value: "[autocomplete]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[class*=\'unit-\'] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[class*=\'unit-\']";
      expectedResult = [{ type: "attribute", value: "[class*=\'unit-\']" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[lang~="en-us"] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[lang~=\"en-us\"]";
      expectedResult = [{ type: "attribute", value: "[lang~=\"en-us\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[lang=\"pt\"] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[lang=\"pt\"]";
      expectedResult = [{ type: "attribute", value: "[lang=\"pt\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[lang|=\"zh\"] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[lang|=\"zh\"]";
      expectedResult = [{ type: "attribute", value: "[lang|=\"zh\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[href^=\"#\"] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[href^=\"#\"]";
      expectedResult = [{ type: "attribute", value: "[href^=\"#\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[href^=\"\'\.\'\"] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[href^=\"\'\.'\"]";
      expectedResult = [{ type: "attribute", value: "[href^=\"\'\.\'\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[href$=\".cn\"] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[href$=\".cn\"]";
      expectedResult = [{ type: "attribute", value: "[href$=\".cn\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[type=\"email\" i] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[type=\"email\" i]";
      expectedResult = [{ type: "attribute", value: "[type=\"email\" i]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it(':before => [ pseudo ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = ":before";
      expectedResult = [{ type: "pseudo", value: ":before" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('::first-letter => [ pseudo ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "::first-letter";
      expectedResult = [{ type: "pseudo", value: "::first-letter" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('a[href*=\"example\"] => [ type, attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "a[href*=\"example\"]";
      expectedResult = [{ type: "type", value: "a" }, { type: "attribute", value: "[href*=\"example\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('input::-ms-clear => [ type, pseudo ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "input::-ms-clear";
      expectedResult = [{ type: "type", value: "input" }, { type: "pseudo", value: "::-ms-clear" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('html:not(.lt-ie10).classname => [ type, pseudo, scope-start, class, scope-end, class ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "html:not(.lt-ie10).classname";
      expectedResult = [{ type: "type", value: "html" }, { type: "pseudo", value: ":not" }, { type: "scope-start", value: "(" }, { type: "class", value: ".lt-ie10" }, { type: "scope-end", value: ")" }, { type: "class", value: ".classname" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('p:nth-of-type(2n) => [ type, pseudo, scope-start, type, scope-end ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "p:nth-of-type(2n)";
      expectedResult = [{ type: "type", value: "p" }, { type: "pseudo", value: ":nth-of-type" }, { type: "scope-start", value: "(" }, { type: "type", value: "2n" }, { type: "scope-end", value: ")" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[class=\"()\"] => [ attribute ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "[class=\"()\"]";
      expectedResult = [{ type: "attribute", value: "[class=\"()\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('article   header => [ type, descendant, type ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "article   header";
      expectedResult = [{ type: "type", value: "article" }, { type: "descendant", value: "   " }, { type: "type", value: "header" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it(':not(  .lt-ie10  ) => [ pseudo, scope-start, class, scope-end ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = ":not(  .lt-ie10  )";
      expectedResult = [{ type: "pseudo", value: ":not" }, { type: "scope-start", value: "(  " }, { type: "class", value: ".lt-ie10" }, { type: "scope-end", value: "  )" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('html:not( .lt-ie10 ) .text-xs-justify => [ type, pseudo, scope-start, .class, scope-end, descendant, class ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "html:not( .lt-ie10 ) .text-xs-justify";
      expectedResult = [{ type: "type", value: "html" }, { type: "pseudo", value: ":not" }, { type: "scope-start", value: "( " }, { type: "class", value: ".lt-ie10" }, { type: "scope-end", value: " )" }, { type: "descendant", value: " " }, { type: "class", value: ".text-xs-justify" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('html *:first-child => [ type, descendant, universal, pseudo ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "html *:first-child";
      expectedResult = [{ type: "type", value: "html" }, { type: "descendant", value: " " }, { type: "universal", value: "*" }, { type: "pseudo", value: ":first-child" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('html p a:hover => [ type, descendant, type, descendant, type, pseudo ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "html p a:hover";
      expectedResult = [{ type: "type", value: "html" }, { type: "descendant", value: " " }, { type: "type", value: "p" }, { type: "descendant", value: " " }, { type: "type", value: "a" }, { type: "pseudo", value: ":hover" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('* + .range-lg => [ universal, adjacent-sibling, class ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "* + .range-lg";
      expectedResult = [{ type: "universal", value: "*" }, { type: "adjacent-sibling", value: " + " }, { type: "class", value: ".range-lg" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.list-progress-bars li+li => [ class, descendant, type, adjacent-sibling, type ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = ".list-progress-bars li+li";
      expectedResult = [{ type: "class", value: ".list-progress-bars" }, { type: "descendant", value: " " }, { type: "type", value: "li" }, { type: "adjacent-sibling", value: "+" }, { type: "type", value: "li" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.list>li+li => [ class, child, type, adjacent-sibling, type ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = ".list>li+li";
      expectedResult = [{ type: "class", value: ".list" }, { type: "child", value: ">" }, { type: "type", value: "li" }, { type: "adjacent-sibling", value: "+" }, { type: "type", value: "li" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('audio:not([controls]) => [ type, pseudo, scope-start, attribute, scope-end ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "audio:not([controls])";
      expectedResult = [{ type: "type", value: "audio" }, { type: "pseudo", value: ":not" }, { type: "scope-start", value: "(" }, { type: "attribute", value: "[controls]" }, { type: "scope-end", value: ")" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('svg:not(:root) => [ type, pseudo, scope-start, pseudo, scope-end ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "svg:not(:root)";
      expectedResult = [{ type: "type", value: "svg" }, { type: "pseudo", value: ":not" }, { type: "scope-start", value: "(" }, { type: "pseudo", value: ":root" }, { type: "scope-end", value: ")" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('button::-moz-focus-inner => [ type, pseudo ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "button::-moz-focus-inner";
      expectedResult = [{ type: "type", value: "button" }, { type: "pseudo", value: "::-moz-focus-inner" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('input[type=\"number\"]::-webkit-inner-spin-button => [ type, attribute, pseudo ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "input[type=\"number\"]::-webkit-inner-spin-button";
      expectedResult = [{ type: "type", value: "input" }, { type: "attribute", value: "[type=\"number\"]" }, { type: "pseudo", value: "::-webkit-inner-spin-button" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('*:before => [ universal, pseudo ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "*:before";
      expectedResult = [{ type: "universal", value: "*" }, { type: "pseudo", value: ":before" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.dropup> .btn >.caret => [ class, child, class, child, class ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = ".dropup> .btn >.caret";
      expectedResult = [{ type: "class", value: ".dropup" }, { type: "child", value: "> " }, { type: "class", value: ".btn" }, { type: "child", value: " >" }, { type: "class", value: ".caret" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.table>caption+thead>tr:first-child>td => [ class, child, type, adjacent-sibling, type, child, type, pseudo, adjacent-sibling, type, ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = ".table>caption+thead>tr:first-child>td";
      expectedResult = [{ type: "class", value: ".table" }, { type: "child", value: ">" }, { type: "type", value: "caption" }, { type: "adjacent-sibling", value: "+" }, { type: "type", value: "thead" }, { type: "child", value: ">" }, { type: "type", value: "tr" }, { type: "pseudo", value: ":first-child" }, { type: "child", value: ">" }, { type: "type", value: "td" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.table-striped>tbody>tr:nth-of-type(even) => [ class, child, type, child, type, pseudo, scope-start, type, scope-end ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = ".table-striped>tbody>tr:nth-of-type(even)";
      expectedResult = [{ type: "class", value: ".table-striped" }, { type: "child", value: ">" }, { type: "type", value: "tbody" }, { type: "child", value: ">" }, { type: "type", value: "tr" }, { type: "pseudo", value: ":nth-of-type" }, { type: "scope-start", value: "(" }, { type: "type", value: "even" }, { type: "scope-end", value: ")" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('h1~ p ~p~.btn => [ type, general-sibling, type, general-sibling, type, general-sibling, class ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = "h1~ p ~p~.btn";
      expectedResult = [{ type: "type", value: "h1" }, { type: "general-sibling", value: "~ " }, { type: "type", value: "p" }, { type: "general-sibling", value: " ~" }, { type: "type", value: "p" }, { type: "general-sibling", value: "~" }, { type: "class", value: ".btn" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.has-feedback label.sr-only~.form-control-feedback => [ class, descendant, type, class, general-sibling, class ]', function () {
      var source = void 0,
          actualResult = void 0,
          expectedResult = void 0,
          checker = new _selectorTokenizer2.default();

      source = ".has-feedback label.sr-only~.form-control-feedback";
      expectedResult = [{ type: "class", value: ".has-feedback" }, { type: "descendant", value: " " }, { type: "type", value: "label" }, { type: "class", value: ".sr-only" }, { type: "general-sibling", value: "~" }, { type: "class", value: ".form-control-feedback" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });
  });
});

},{"../../../dist/selector-tokenizer.js":1}],3:[function(require,module,exports){
"use strict";

require("./spec/SelectorTokenizerSpec.es6");

},{"./spec/SelectorTokenizerSpec.es6":2}]},{},[3]);
