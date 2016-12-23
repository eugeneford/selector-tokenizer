(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var _selectorTokenizer = require('../../../src/selector-tokenizer.es6');

var _selectorTokenizer2 = _interopRequireDefault(_selectorTokenizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

},{"../../../src/selector-tokenizer.es6":1}],3:[function(require,module,exports){
"use strict";

require("./spec/SelectorTokenizerSpec.es6");

},{"./spec/SelectorTokenizerSpec.es6":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2VsZWN0b3ItdG9rZW5pemVyLmVzNiIsInRlc3QvanMvc3BlYy9TZWxlY3RvclRva2VuaXplclNwZWMuZXM2IiwidGVzdC9qcy9zdWl0ZS5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkEsSUFBTSxhQUFvQixJQUFJLFVBQUosQ0FBZSxDQUFmLENBQTFCO0FBQ0EsSUFBTSxlQUFvQixLQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FBMUI7QUFDQSxJQUFNLGVBQW9CLEtBQUssVUFBTCxDQUFnQixDQUFoQixDQUExQjtBQUNBLElBQU0sUUFBb0IsS0FBSyxVQUFMLENBQWdCLENBQWhCLENBQTFCO0FBQ0EsSUFBTSxPQUFvQixJQUFJLFVBQUosQ0FBZSxDQUFmLENBQTFCO0FBQ0EsSUFBTSxtQkFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sb0JBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFdBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFlBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFdBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFFBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGNBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGNBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGVBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFFBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGFBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7O0FB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LEVBRmUsRUFHZixFQUFFLE1BQU0sTUFBUixFQUFnQixPQUFPLE9BQXZCLEVBSGUsRUFJZixFQUFFLE1BQU0sT0FBUixFQUFpQixPQUFPLFVBQXhCLEVBSmUsRUFLZixFQUFFLE1BQU0saUJBQVIsRUFBMkIsT0FBTyxHQUFsQyxFQUxlLEVBTWYsRUFBRSxNQUFNLE9BQVIsRUFBaUIsT0FBTyx3QkFBeEIsRUFOZSxDQUFqQjs7QUFTQSxxQkFBZSxRQUFRLFFBQVIsQ0FBaUIsTUFBakIsQ0FBZjs7QUFFQSxhQUFPLFlBQVAsRUFBcUIsT0FBckIsQ0FBNkIsY0FBN0I7QUFDRCxLQWhCRDtBQWlCRCxHQXpoQkQ7QUEwaEJELENBM2hCRDs7Ozs7QUNGQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNyBFdWdlbmUgRm9yZCAoc3RtZWNoYW51c0BnbWFpbC5jb20pXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlXG4gKiBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbixcbiAqIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsXG4gKiBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLFxuICogc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbFxuICogcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1RcbiAqIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULlxuICogSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLFxuICogV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFXG4gKiBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBXSElURVNQQUNFICAgICAgICA9ICcgJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgU0lOR0xFX1FVT1RFICAgICAgPSAnXFxcIicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IERPVUJMRV9RVU9URSAgICAgID0gJ1xcJycuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFNMQVNIICAgICAgICAgICAgID0gJ1xcXFwnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBIQVNIICAgICAgICAgICAgICA9ICcjJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgT1BFTl9QQVJFTlRIRVNFUyAgPSAnKCcuY2hhckNvZGVBdCgwKTtcbmNvbnN0IENMT1NFX1BBUkVOVEhFU0VTID0gJyknLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBBU1RFUklTSyAgICAgICAgICA9ICcqJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgUExVU19TSUdOICAgICAgICAgPSAnKycuY2hhckNvZGVBdCgwKTtcbmNvbnN0IERPVF9TSUdOICAgICAgICAgID0gJy4nLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBDT0xPTiAgICAgICAgICAgICA9ICc6Jy5jaGFyQ29kZUF0KDApO1xuY29uc3QgUklHSFRfQU5HTEUgICAgICAgPSAnPicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IE9QRU5fU1FVQVJFICAgICAgID0gJ1snLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBDTE9TRV9TUVVBUkUgICAgICA9ICddJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgVElMREUgICAgICAgICAgICAgPSAnficuY2hhckNvZGVBdCgwKTtcbmNvbnN0IEVRVUFMX1NJR04gICAgICAgID0gJz0nLmNoYXJDb2RlQXQoMCk7XG5cbi8qKlxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmNvbnN0IENGX1dPUkQgPSBmdW5jdGlvbiAoY29kZSkge1xuICByZXR1cm4gKGNvZGUgPj0gMTI4IHx8IGNvZGUgPT09IDQ1IHx8IGNvZGUgPT0gMjQ1IHx8IChjb2RlID49IDQ4ICYmIGNvZGUgPD0gNTcpIHx8IChjb2RlID49IDY1ICYmIGNvZGUgPD0gOTApIHx8IChjb2RlID49IDk3ICYmIGNvZGUgPD0gMTIyKSk7XG59O1xuXG4vKipcbiAqIFRoZSBzZWxlY3RvciB0b2tlbml6ZXIgYWxsb3dzIHRvIGJyZWFrIGEgY3NzIHNlbGVjdG9yIHN0cmluZyBpbnRvIHNldCBvZiB0b2tlbnMuXG4gKiBUaGUgdG9rZW5pemF0aW9uIG1ldGhvZCBpcyBiYXNlZCBvbiBhIHNldCBvZiBsZXhlciBncmFtbWFycyBydWxlcy4gVGhlIGZ1bGwgbGlzdCBvZlxuICogYXZhaWxhYmxlIHRva2VuIHR5cGVzIGlzIG5leHQ6XG4gKlxuICogPHR5cGUtc2VsZWN0b3I+IC0gZm9yIGJhc2ljIHR5cGUgc2VsZWN0b3JzIGVnLiBcImFydGljbGVcIiwgXCJoMVwiLCBcInBcIiBldGMuXG4gKiA8Y2xhc3Mtc2VsZWN0b3I+IC0gZm9yIGJhc2ljIGNsYXNzIHNlbGVjdG9ycyBlZy4gXCIuYnV0dG9uXCIsIFwiLnBvc3RcIiwgZXRjLlxuICogPHVuaXZlcnNhbC1zZWxlY3Rvcj4gLSBmb3IgYmFzaWMgdW5pdmVyc2FsIHNlbGVjdG9yIFwiKlwiXG4gKiA8YXR0cmlidXRlLXNlbGVjdG9yPiAtIGZvciBiYXNpYyBhdHRyaWJ1dGUgc2VsZWN0b3JzIGVnLiBcIlthdHRyXVwiLCBcIlthdHRyPXZhbF1cIiwgXCJbYXR0cl49dmFsXVwiIGV0Yy5cbiAqIDxwc2V1ZG8tc2VsZWN0b3I+IC0gZm9yIHBzZXVkby1lbGVtZW50IGFuZCBwc2V1ZG8tY2xhc3Mtc2VsZWN0b3JzIGVnLiBcIjpmaXJzdC1jaGlsZFwiLCBcIjo6Zmlyc3QtbGV0dGVyXCJcbiAqIDxkZXNjZW5kYXQtc2VsZWN0b3I+IC0gZm9yIHNlbGVjdG9yJ3MgZGVzY2VuZGFudCBjb21iaW5hdG9yIFwiIFwiXG4gKiA8YWRqYWNlbnQtc2libGluZy1zZWxlY3Rvcj4gLSBmb3Igc2VsZWN0b3IncyBhZGphY2VudCBzaWJsaW5nIGNvbWJpbmF0b3IgXCIrXCJcbiAqIDxnZW5lcmFsLXNpYmxpbmctc2VsZWN0b3I+IC0gZm9yIHNlbGVjdG9yJ3MgZ2VuZXJhbCBzaWJsaW5nIGNvbWJpbmF0b3IgXCJ+XCJcbiAqIDxjaGlsZC1zZWxlY3Rvcj4gLSBmb3Igc2VsZWN0b3IncyBjaGlsZCBjb21iaW5hdG9yIFwiPlwiXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGlsbHVzdHJhdGVzIHRoZSBwcmluY2lwbGUgdGhlIFNlbGVjdG9yVG9rZW5pemVyLnRva2VuaXplIG1ldGhvZFxuICogQGV4YW1wbGVcbiAqIHRva2VucyA9IHRva2VuaXplci50b2tlbml6ZShcIi5wYWdlIG1haW5cIik7XG4gKiB0b2tlbnMgICAvLz0+IFt7dHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIucGFnZVwifSwge3R5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJtYWluXCJ9XVxuICovXG5jbGFzcyBTZWxlY3RvclRva2VuaXplciB7XG4gIGNvbnN0cnVjdG9yKCl7fVxuXG4gIC8qKlxuICAgKiBHZXQgdG9rZW4gdHlwZSBiYXNlZCBvbiBvbmUgY2hhckNvZGUgb25seVxuICAgKiBAcGFyYW0gc3RhcnRDb2RlXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqXG4gICAqIEB0aHJvd3MgU3ludGF4RXJyb3IgLSBpZiB0YXJnZXQgY2hhciBjb2RlIHdhcyBub3QgZm91bmQgaW4gZ3JhbW1hclxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB0eXBlID0gY2hlY2tlci5nZXRJbml0aWFsVG9rZW5UeXBlKDMyKTtcbiAgICogdHlwZSAgIC8vPT4gXCJkZXNjZW5kYW50XCJcbiAgICovXG4gIGdldEluaXRpYWxUb2tlblR5cGUoc3RhcnRDb2RlKXtcbiAgICAvLyBGaW5kIHRhcmdldCBzdGFydENvZGUgaW4gZ3JhbW1hclxuICAgIHN3aXRjaCAoc3RhcnRDb2RlKSB7XG4gICAgICBjYXNlIFdISVRFU1BBQ0U6ICAgICAgICAgIHJldHVybiBcImRlc2NlbmRhbnRcIjtcbiAgICAgIGNhc2UgSEFTSDogICAgICAgICAgICAgICAgcmV0dXJuIFwiaWRcIjtcbiAgICAgIGNhc2UgT1BFTl9QQVJFTlRIRVNFUzogICAgcmV0dXJuIFwic2NvcGUtc3RhcnRcIjtcbiAgICAgIGNhc2UgQ0xPU0VfUEFSRU5USEVTRVM6ICAgcmV0dXJuIFwic2NvcGUtZW5kXCI7XG4gICAgICBjYXNlIEFTVEVSSVNLOiAgICAgICAgICAgIHJldHVybiBcInVuaXZlcnNhbFwiO1xuICAgICAgY2FzZSBQTFVTX1NJR046ICAgICAgICAgICByZXR1cm4gXCJhZGphY2VudC1zaWJsaW5nXCI7XG4gICAgICBjYXNlIERPVF9TSUdOOiAgICAgICAgICAgIHJldHVybiBcImNsYXNzXCI7XG4gICAgICBjYXNlIENPTE9OOiAgICAgICAgICAgICAgIHJldHVybiBcInBzZXVkb1wiO1xuICAgICAgY2FzZSBSSUdIVF9BTkdMRTogICAgICAgICByZXR1cm4gXCJjaGlsZFwiO1xuICAgICAgY2FzZSBPUEVOX1NRVUFSRTogICAgICAgICByZXR1cm4gXCJhdHRyaWJ1dGVcIjtcbiAgICAgIGNhc2UgVElMREU6ICAgICAgICAgICAgICAgcmV0dXJuIFwiZ2VuZXJhbC1zaWJsaW5nXCI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoQ0ZfV09SRChzdGFydENvZGUpKSByZXR1cm4gXCJ0eXBlXCI7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICAvLyBPciB0aHJvdyBhIHN5bnRheCBlcnJvclxuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgXCIke1N0cmluZy5mcm9tQ2hhckNvZGUoc3RhcnRDb2RlKX1cImApO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHRva2VuIHR5cGUgdXBkYXRlIGZvciBtb3JlIHNwZWNpZmljaXR5IHdpdGggYWRkaXRpb25hbCAzIGNoYXIgY29kZXNcbiAgICogTk9URTogdXNlIHRoaXMgbWV0aG9kIHRvIHVwZGF0ZSB0b2tlIHR5cGUgb25seS4gVXNlIHtnZXRJbml0aWFsVG9rZW5UeXBlfSBtZXRob2RcbiAgICogdG8gZ2V0IGluaXRpYWwgdHlwZSBvZiB0YXJnZXQgdG9rZW5cbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHBhcmFtIHNlY29uZENvZGVcbiAgICogQHJldHVybnMge3N0cmluZ3x1bmRlZmluZWR9XG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIHR5cGUgPSBjaGVja2VyLmdldEluaXRpYWxUb2tlblR5cGUoMzIpO1xuICAgKiB0eXBlICAgLy89PiBcImRlc2NlbmRhbnRcIlxuICAgKiB0eXBlID0gY2hlY2tlci5nZXRMYXp5VG9rZW5UeXBlKDMyLDQxKTtcbiAgICogdHlwZSAgIC8vPT4gXCJzY29wZS1lbmRcIlxuICAgKi9cbiAgZ2V0TGF6eVRva2VuVHlwZShmaXJzdENvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlKXtcbiAgICAvLyBDaGFuZ2UgdG9rZW4gdHlwZSBpZiBsYXp5IDxzY29wZS1lbmRpbmctcG9pbnQ+IHdhcyBzcG90dGVkXG4gICAgaWYgKG5leHRDb2RlID09PSBDTE9TRV9QQVJFTlRIRVNFUyAmJiBmaXJzdENvZGUgPT09IFdISVRFU1BBQ0UpXG4gICAgICByZXR1cm4gXCJzY29wZS1lbmRcIjtcblxuICAgIC8vIENoYW5nZSB0b2tlbiB0eXBlIGlmIGxhenkgPGFkamFjZW50LXNpYmxpbmctc2VsZWN0b3I+IHdhcyBzcG90dGVkXG4gICAgZWxzZSBpZiAobmV4dENvZGUgPT09IFBMVVNfU0lHTiAmJiBmaXJzdENvZGUgPT09IFdISVRFU1BBQ0UpXG4gICAgICByZXR1cm4gXCJhZGphY2VudC1zaWJsaW5nXCI7XG5cbiAgICAvLyBDaGFuZ2UgdG9rZW4gdHlwZSBpZiBsYXp5IDxjaGlsZC1zZWxlY3Rvcj4gd2FzIHNwb3R0ZWRcbiAgICBlbHNlIGlmIChuZXh0Q29kZSA9PT0gUklHSFRfQU5HTEUgJiYgZmlyc3RDb2RlID09PSBXSElURVNQQUNFKVxuICAgICAgcmV0dXJuIFwiY2hpbGRcIjtcblxuICAgIC8vIENoYW5nZSB0b2tlbiB0eXBlIGlmIGxhenkgPGdlbmVyYWwtc2libGluZy1zZWxlY3Rvcj4gd2FzIHNwb3R0ZWRcbiAgICBlbHNlIGlmIChuZXh0Q29kZSA9PT0gVElMREUgJiYgZmlyc3RDb2RlID09PSBXSElURVNQQUNFKVxuICAgICAgcmV0dXJuIFwiZ2VuZXJhbC1zaWJsaW5nXCI7XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8ZGVzY2VuZGFudC1zZWxlY3Rvcj4gdG9rZW4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEBwYXJhbSB3YXNCcmFjZXNPcGVuZWRcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0Rlc2NlbmRhbnRCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSwgd2FzQnJhY2VzT3BlbmVkKXtcbiAgICByZXR1cm4gIXdhc0JyYWNlc09wZW5lZCAmJiBuZXh0Q29kZSA9PT0gV0hJVEVTUEFDRSAmJiBmaXJzdENvZGUgIT09IFdISVRFU1BBQ0VcbiAgICAgICYmIGZpcnN0Q29kZSAhPT0gUExVU19TSUdOICYmIGZpcnN0Q29kZSAhPT0gUklHSFRfQU5HTEUgJiYgZmlyc3RDb2RlICE9PSBUSUxERTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGlkLXNlbGVjdG9yPiB0b2tlbiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzSWRCb3VuZHMoZmlyc3RDb2RlKXtcbiAgICByZXR1cm4gZmlyc3RDb2RlID09PSBIQVNIO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8c2NvcGUtc3RhcnRpbmctcG9pbnQ+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNTY29wZVN0YXJ0Qm91bmRzKGZpcnN0Q29kZSl7XG4gICAgcmV0dXJuIGZpcnN0Q29kZSA9PT0gT1BFTl9QQVJFTlRIRVNFU1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8c2NvcGUtZW5kaW5nLXBvaW50PiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1Njb3BlRW5kQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpe1xuICAgIHJldHVybiBuZXh0Q29kZSA9PT0gQ0xPU0VfUEFSRU5USEVTRVMgJiYgZmlyc3RDb2RlICE9PSBXSElURVNQQUNFO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8dW5pdmVyc2FsLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1VuaXZlcnNhbEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKXtcbiAgICByZXR1cm4gZmlyc3RDb2RlID09PSBBU1RFUklTSyAmJiBuZXh0Q29kZSAhPT0gRVFVQUxfU0lHTjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGFkamFjZW50LXNpYmxpbmctc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQWRqYWNlbnRTaWJsaW5nQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpe1xuICAgIHJldHVybiBuZXh0Q29kZSA9PT0gUExVU19TSUdOICYmIGZpcnN0Q29kZSAhPT0gV0hJVEVTUEFDRTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGNsYXNzLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQ2xhc3NCb3VuZHMoZmlyc3RDb2RlKXtcbiAgICByZXR1cm4gZmlyc3RDb2RlID09PSBET1RfU0lHTjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPHBzZXVkby1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNQc2V1ZG9Cb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSl7XG4gICAgcmV0dXJuIG5leHRDb2RlID09PSBDT0xPTiAmJiBmaXJzdENvZGUgIT09IENPTE9OO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8Y2hpbGQtc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNDaGlsZEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKXtcbiAgICByZXR1cm4gbmV4dENvZGUgPT09IFJJR0hUX0FOR0xFICYmIGZpcnN0Q29kZSAhPT0gV0hJVEVTUEFDRTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGF0dHJpYnV0ZS1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0F0dHJpYnV0ZUJvdW5kcyhmaXJzdENvZGUpe1xuICAgIHJldHVybiBmaXJzdENvZGUgPT09IE9QRU5fU1FVQVJFO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8Z2VuZXJhbC1zaWJsaW5nLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHBhcmFtIHNlY29uZENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0dlbmVyYWxTaWJsaW5nQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUsIHNlY29uZENvZGUpe1xuICAgIHJldHVybiBuZXh0Q29kZSA9PT0gVElMREUgJiYgc2Vjb25kQ29kZSAhPT0gRVFVQUxfU0lHTiAmJiBmaXJzdENvZGUgIT0gV0hJVEVTUEFDRTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPHR5cGUtc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcGFyYW0gd2FzQnJhY2VzT3BlbmVkXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNUeXBlQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUsIHdhc0JyYWNlc09wZW5lZCl7XG4gICAgcmV0dXJuIChmaXJzdENvZGUgPT09IFdISVRFU1BBQ0UgfHwgZmlyc3RDb2RlID09PSBQTFVTX1NJR04gfHwgZmlyc3RDb2RlID09PSBUSUxERSB8fCBmaXJzdENvZGUgPT09IFJJR0hUX0FOR0xFKVxuICAgICAgJiYgIXdhc0JyYWNlc09wZW5lZCAmJiBDRl9XT1JEKG5leHRDb2RlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgdG9rZW4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEBwYXJhbSBzZWNvbmRDb2RlXG4gICAqIEBwYXJhbSB3YXNCcmFjZXNPcGVuZWRcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1Rva2VuQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUsIHNlY29uZENvZGUsIHdhc0JyYWNlc09wZW5lZCl7XG4gICAgcmV0dXJuIHRoaXMuaXNEZXNjZW5kYW50Qm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUsIHdhc0JyYWNlc09wZW5lZClcbiAgICAgIHx8IHRoaXMuaXNJZEJvdW5kcyhuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNTY29wZVN0YXJ0Qm91bmRzKG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc1Njb3BlRW5kQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpXG4gICAgICB8fCB0aGlzLmlzVW5pdmVyc2FsQm91bmRzKG5leHRDb2RlLCBzZWNvbmRDb2RlKVxuICAgICAgfHwgdGhpcy5pc0FkamFjZW50U2libGluZ0JvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc0NsYXNzQm91bmRzKG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc1BzZXVkb0JvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc0NoaWxkQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpXG4gICAgICB8fCB0aGlzLmlzQXR0cmlidXRlQm91bmRzKG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc0dlbmVyYWxTaWJsaW5nQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUsIHNlY29uZENvZGUpXG4gICAgICB8fCB0aGlzLmlzVHlwZUJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCB3YXNCcmFjZXNPcGVuZWQpXG4gIH1cblxuICAvKipcbiAgICogUmVhZCBhIGdyYW1tYXIgdG9rZW4gZnJvbSBhIHN0cmluZyBzdGFydGluZyBhdCB0YXJnZXQgcG9zaXRpb25cbiAgICogQHBhcmFtIHNlbGVjdG9yVGV4dCAtIGEgc3RyaW5nIGNvbnRhaW5pbmcgY3NzIHRleHQgdG8gcmVhZCBhIHRva2VuIGZyb21cbiAgICogQHBhcmFtIHN0YXJ0SW5kZXggLSBwb3NpdGlvbiB0byBzdGFydCByZWFkIGEgdG9rZW4gYXRcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICpcbiAgICogQHRocm93cyBTeW50YXhFcnJvciAtIGlmIGFuIHVua25vd24gY2hhcmFjdGVyIHdhcyBmb3VuZCBpbiBwcm9jZXNzXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIHRva2VuID0gY2hlY2tlci50b2tlbkF0KFwiLmNsYXNzbmFtZVwiLCAwKTtcbiAgICogdG9rZW4gICAvLz0+IHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIuY2xhc3NuYW1lXCIgfVxuICAgKi9cbiAgdG9rZW5BdChzZWxlY3RvclRleHQsIHN0YXJ0SW5kZXgpe1xuICAgIGxldCBzaXplID0gMSwgc3RhcnRDb2RlID0gc2VsZWN0b3JUZXh0LmNvZGVQb2ludEF0KHN0YXJ0SW5kZXgpLFxuICAgICAgdHlwZSwgdG9rZW4sIG5leHRDb2RlLCBuZXh0SW5kZXgsIHByZXZDb2RlLCBzZWNvbmRDb2RlLCBvcGVuQnJhY2VzLFxuICAgICAgb3BlblF1b3RlcywgcGVudWx0Q29kZTtcblxuICAgIC8vIEdldCBpbml0aWFsIHRva2VuIHR5cGVcbiAgICB0eXBlID0gdGhpcy5nZXRJbml0aWFsVG9rZW5UeXBlKHN0YXJ0Q29kZSk7XG5cbiAgICAvLyBTZXQgaW5pdGlhbCBzdGF0ZSBmb3IgbmV4dENvZGVcbiAgICBuZXh0SW5kZXggPSBzdGFydEluZGV4ICsgc2l6ZTtcbiAgICBwcmV2Q29kZSA9IHN0YXJ0Q29kZTtcbiAgICBuZXh0Q29kZSA9IHNlbGVjdG9yVGV4dC5jb2RlUG9pbnRBdChuZXh0SW5kZXgpO1xuICAgIHNlY29uZENvZGUgPSBzZWxlY3RvclRleHQuY29kZVBvaW50QXQobmV4dEluZGV4ICsgMSk7XG4gICAgb3BlbkJyYWNlcyA9IHN0YXJ0Q29kZSA9PT0gT1BFTl9TUVVBUkU7XG5cbiAgICAvLyBDaGVjayBmb3IgPHNjb3BlLXN0YXJ0aW5nLXBvaW50ZXI+IG9yIDxzY29wZS1lbmRpbmctcG9pbnRlcj5cbiAgICBpZiAoIHByZXZDb2RlID09PSBPUEVOX1BBUkVOVEhFU0VTICB8fCBwcmV2Q29kZSA9PT0gQ0xPU0VfUEFSRU5USEVTRVMpe1xuICAgICAgd2hpbGUgKG5leHRDb2RlID09PSBXSElURVNQQUNFKSB7XG4gICAgICAgIG5leHRDb2RlID0gc2VsZWN0b3JUZXh0LmNvZGVQb2ludEF0KCsrc2l6ZSArIHN0YXJ0SW5kZXgpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFdoaWxlIG5vdCBFT0ZcbiAgICAgIHdoaWxlIChuZXh0SW5kZXggPCBzZWxlY3RvclRleHQubGVuZ3RoKSB7XG4gICAgICAgIGlmICghb3BlblF1b3Rlcyl7XG5cbiAgICAgICAgICAvLyBHZXQgYSB0b2tlbiB0eXBlIHVwZGF0ZSBvciB1c2UgdGhlIGxhc3Qgb25lXG4gICAgICAgICAgdHlwZSA9IHRoaXMuZ2V0TGF6eVRva2VuVHlwZShwcmV2Q29kZSwgbmV4dENvZGUsIHNlY29uZENvZGUpIHx8IHR5cGU7XG5cbiAgICAgICAgICAvLyBCcmVhayBpZiBuZXh0IHRva2VuIHNwb3R0ZWRcbiAgICAgICAgICBpZiAoIHRoaXMuaXNUb2tlbkJvdW5kcyhwcmV2Q29kZSwgbmV4dENvZGUsIHNlY29uZENvZGUsIG9wZW5CcmFjZXMpKSBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdldCBjb2RlcyBmb3IgbmV4dCBpdGVyYXRpb25cbiAgICAgICAgc2l6ZSsrO1xuICAgICAgICBuZXh0SW5kZXggPSBzaXplICsgc3RhcnRJbmRleDtcbiAgICAgICAgcGVudWx0Q29kZSA9IHByZXZDb2RlO1xuICAgICAgICBwcmV2Q29kZSA9IG5leHRDb2RlO1xuICAgICAgICBuZXh0Q29kZSA9IHNlbGVjdG9yVGV4dC5jb2RlUG9pbnRBdChuZXh0SW5kZXgpO1xuICAgICAgICBzZWNvbmRDb2RlID0gc2VsZWN0b3JUZXh0LmNvZGVQb2ludEF0KG5leHRJbmRleCArIDEpO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIFwiIG9yICcgd2FzIHNwb3R0ZWQgd2l0aG91dCBlc2NhcGUgXFxcbiAgICAgICAgaWYgKHByZXZDb2RlICE9PSBTTEFTSCAmJiAobmV4dENvZGUgPT09IFNJTkdMRV9RVU9URSB8fCBuZXh0Q29kZSA9PSBET1VCTEVfUVVPVEUpKSB7XG4gICAgICAgICAgaWYgKCEhb3BlblF1b3Rlcykge1xuICAgICAgICAgICAgaWYgKG5leHRDb2RlID09PSBvcGVuUXVvdGVzKSBvcGVuUXVvdGVzID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcGVuUXVvdGVzID0gbmV4dENvZGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFvcGVuUXVvdGVzKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgWyB3YXMgc3BvdHRlZFxuICAgICAgICAgIGlmIChuZXh0Q29kZSA9PT0gT1BFTl9TUVVBUkUpIHtcbiAgICAgICAgICAgIGlmIChvcGVuQnJhY2VzKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIFwiJHtzZWxlY3RvclRleHRbbmV4dEluZGV4XX1cIiBhdCAke25leHRJbmRleH0gcG9zaXRpb25gKTtcbiAgICAgICAgICAgIG9wZW5CcmFjZXMgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGlmIF0gd2FzIHNwb3R0ZWRcbiAgICAgICAgICBpZiAobmV4dENvZGUgPT09IENMT1NFX1NRVUFSRSkge1xuICAgICAgICAgICAgaWYgKCFvcGVuQnJhY2VzKSB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIFwiJHtzZWxlY3RvclRleHRbbmV4dEluZGV4XX1cIiBhdCAke25leHRJbmRleH0gcG9zaXRpb25gKTtcbiAgICAgICAgICAgIG9wZW5CcmFjZXMgPSBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3IgdHJpcGxlIGNvbG9uIDo6OiBwYXJzZSBlcnJvclxuICAgICAgICAgIGlmIChDT0xPTiA9PT0gcGVudWx0Q29kZSA9PT0gcHJldkNvZGUgPT09IG5leHRDb2RlKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIFwiJHtzZWxlY3RvclRleHRbbmV4dEluZGV4XX1cIiBhdCAke25leHRJbmRleH0gcG9zaXRpb25gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSB0b2tlblxuICAgIHRva2VuID0geyB0eXBlLCB2YWx1ZTogc2VsZWN0b3JUZXh0LnN1YnN0cihzdGFydEluZGV4LCBzaXplKSB9O1xuXG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIHNldCBvZiB0b2tlbnMgZnJvbSB0YXJnZXQgc2VsZWN0b3Igc3RyaW5nXG4gICAqIEBwYXJhbSBzZWxlY3RvclRleHRcbiAgICogQHJldHVybnMge0FycmF5fVxuICAgKi9cbiAgdG9rZW5pemUoc2VsZWN0b3JUZXh0KXtcbiAgICBsZXQgdG9rZW5zID0gW10sIGluZGV4LCB0b2tlbjtcblxuICAgIC8vIExvb3AgdGhyb3VnaCBzZWxlY3RvclRleHQgY2hhciBjb2Rlc1xuICAgIGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBzZWxlY3RvclRleHQubGVuZ3RoOyBpbmRleCsrKSB7XG5cbiAgICAgIC8vIENyZWF0ZSBhIHRva2VuXG4gICAgICB0b2tlbiA9IHRoaXMudG9rZW5BdChzZWxlY3RvclRleHQsIGluZGV4KTtcblxuICAgICAgLy8gU2hpZnQgbG9vcCBwb2ludGVyIGJ5IHRva2VuIHNpemVcbiAgICAgIGluZGV4ID0gaW5kZXggKyB0b2tlbi52YWx1ZS5sZW5ndGggLSAxO1xuXG4gICAgICAvLyBBZGQgdG9rZW4gdG8gdG9rZW5zTGlzdFxuICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgIH1cblxuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VsZWN0b3JUb2tlbml6ZXI7IiwiaW1wb3J0IFNlbGVjdG9yVG9rZW5pemVyIGZyb20gXCIuLi8uLi8uLi9zcmMvc2VsZWN0b3ItdG9rZW5pemVyLmVzNlwiO1xuXG5kZXNjcmliZSgnU2VsZWN0b3JUb2tlbml6ZXInLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCd0b2tlbml6ZScsICgpID0+IHtcbiAgICBpdCgnLmNsYXNzLW5hbWUgPT4gWyBjbGFzcyBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIi5jbGFzcy1uYW1lXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFt7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLmNsYXNzLW5hbWVcIiB9XTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCcjaWQgPT4gWyBpZCBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIiNpZFwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcImlkXCIsIHZhbHVlOiBcIiNpZFwiIH1dO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2FydGljbGUgPT4gWyB0eXBlIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiYXJ0aWNsZVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiYXJ0aWNsZVwiIH1dO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ1thdXRvY29tcGxldGVdID0+IFsgYXR0cmlidXRlIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiW2F1dG9jb21wbGV0ZV1cIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW3sgdHlwZTogXCJhdHRyaWJ1dGVcIiwgdmFsdWU6IFwiW2F1dG9jb21wbGV0ZV1cIiB9XTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdbY2xhc3MqPVxcJ3VuaXQtXFwnXSA9PiBbIGF0dHJpYnV0ZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIltjbGFzcyo9XFwndW5pdC1cXCddXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFt7IHR5cGU6IFwiYXR0cmlidXRlXCIsIHZhbHVlOiBcIltjbGFzcyo9XFwndW5pdC1cXCddXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnW2xhbmd+PVwiZW4tdXNcIl0gPT4gWyBhdHRyaWJ1dGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJbbGFuZ349XFxcImVuLXVzXFxcIl1cIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW3sgdHlwZTogXCJhdHRyaWJ1dGVcIiwgdmFsdWU6IFwiW2xhbmd+PVxcXCJlbi11c1xcXCJdXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnW2xhbmc9XFxcInB0XFxcIl0gPT4gWyBhdHRyaWJ1dGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJbbGFuZz1cXFwicHRcXFwiXVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcImF0dHJpYnV0ZVwiLCB2YWx1ZTogXCJbbGFuZz1cXFwicHRcXFwiXVwiIH1dO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ1tsYW5nfD1cXFwiemhcXFwiXSA9PiBbIGF0dHJpYnV0ZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIltsYW5nfD1cXFwiemhcXFwiXVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcImF0dHJpYnV0ZVwiLCB2YWx1ZTogXCJbbGFuZ3w9XFxcInpoXFxcIl1cIiB9XTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdbaHJlZl49XFxcIiNcXFwiXSA9PiBbIGF0dHJpYnV0ZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIltocmVmXj1cXFwiI1xcXCJdXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFt7IHR5cGU6IFwiYXR0cmlidXRlXCIsIHZhbHVlOiBcIltocmVmXj1cXFwiI1xcXCJdXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnW2hyZWZePVxcXCJcXCdcXC5cXCdcXFwiXSA9PiBbIGF0dHJpYnV0ZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIltocmVmXj1cXFwiXFwnXFwuJ1xcXCJdXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFt7IHR5cGU6IFwiYXR0cmlidXRlXCIsIHZhbHVlOiBcIltocmVmXj1cXFwiXFwnXFwuXFwnXFxcIl1cIiB9XTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdbaHJlZiQ9XFxcIi5jblxcXCJdID0+IFsgYXR0cmlidXRlIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiW2hyZWYkPVxcXCIuY25cXFwiXVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcImF0dHJpYnV0ZVwiLCB2YWx1ZTogXCJbaHJlZiQ9XFxcIi5jblxcXCJdXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnW3R5cGU9XFxcImVtYWlsXFxcIiBpXSA9PiBbIGF0dHJpYnV0ZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIlt0eXBlPVxcXCJlbWFpbFxcXCIgaV1cIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW3sgdHlwZTogXCJhdHRyaWJ1dGVcIiwgdmFsdWU6IFwiW3R5cGU9XFxcImVtYWlsXFxcIiBpXVwiIH1dO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJzpiZWZvcmUgPT4gWyBwc2V1ZG8gXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCI6YmVmb3JlXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFt7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpiZWZvcmVcIiB9XTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCc6OmZpcnN0LWxldHRlciA9PiBbIHBzZXVkbyBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIjo6Zmlyc3QtbGV0dGVyXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFt7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjo6Zmlyc3QtbGV0dGVyXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnYVtocmVmKj1cXFwiZXhhbXBsZVxcXCJdID0+IFsgdHlwZSwgYXR0cmlidXRlIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiYVtocmVmKj1cXFwiZXhhbXBsZVxcXCJdXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiYVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJhdHRyaWJ1dGVcIiwgdmFsdWU6IFwiW2hyZWYqPVxcXCJleGFtcGxlXFxcIl1cIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2lucHV0OjotbXMtY2xlYXIgPT4gWyB0eXBlLCBwc2V1ZG8gXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJpbnB1dDo6LW1zLWNsZWFyXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiaW5wdXRcIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjo6LW1zLWNsZWFyXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdodG1sOm5vdCgubHQtaWUxMCkuY2xhc3NuYW1lID0+IFsgdHlwZSwgcHNldWRvLCBzY29wZS1zdGFydCwgY2xhc3MsIHNjb3BlLWVuZCwgY2xhc3MgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJodG1sOm5vdCgubHQtaWUxMCkuY2xhc3NuYW1lXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiaHRtbFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOm5vdFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1zdGFydFwiLCB2YWx1ZTogXCIoXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5sdC1pZTEwXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLWVuZFwiLCB2YWx1ZTogXCIpXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5jbGFzc25hbWVcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3A6bnRoLW9mLXR5cGUoMm4pID0+IFsgdHlwZSwgcHNldWRvLCBzY29wZS1zdGFydCwgdHlwZSwgc2NvcGUtZW5kIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwicDpudGgtb2YtdHlwZSgybilcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJwXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInBzZXVkb1wiLCB2YWx1ZTogXCI6bnRoLW9mLXR5cGVcIiB9LFxuICAgICAgICB7IHR5cGU6IFwic2NvcGUtc3RhcnRcIiwgdmFsdWU6IFwiKFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcIjJuXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLWVuZFwiLCB2YWx1ZTogXCIpXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdbY2xhc3M9XFxcIigpXFxcIl0gPT4gWyBhdHRyaWJ1dGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJbY2xhc3M9XFxcIigpXFxcIl1cIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwiYXR0cmlidXRlXCIsIHZhbHVlOiBcIltjbGFzcz1cXFwiKClcXFwiXVwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnYXJ0aWNsZSAgIGhlYWRlciA9PiBbIHR5cGUsIGRlc2NlbmRhbnQsIHR5cGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJhcnRpY2xlICAgaGVhZGVyXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiYXJ0aWNsZVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJkZXNjZW5kYW50XCIsIHZhbHVlOiBcIiAgIFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImhlYWRlclwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnOm5vdCggIC5sdC1pZTEwICApID0+IFsgcHNldWRvLCBzY29wZS1zdGFydCwgY2xhc3MsIHNjb3BlLWVuZCBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIjpub3QoICAubHQtaWUxMCAgKVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOm5vdFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1zdGFydFwiLCB2YWx1ZTogXCIoICBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLmx0LWllMTBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwic2NvcGUtZW5kXCIsIHZhbHVlOiBcIiAgKVwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnaHRtbDpub3QoIC5sdC1pZTEwICkgLnRleHQteHMtanVzdGlmeSA9PiBbIHR5cGUsIHBzZXVkbywgc2NvcGUtc3RhcnQsIC5jbGFzcywgc2NvcGUtZW5kLCBkZXNjZW5kYW50LCBjbGFzcyBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcImh0bWw6bm90KCAubHQtaWUxMCApIC50ZXh0LXhzLWp1c3RpZnlcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJodG1sXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInBzZXVkb1wiLCB2YWx1ZTogXCI6bm90XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLXN0YXJ0XCIsIHZhbHVlOiBcIiggXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5sdC1pZTEwXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLWVuZFwiLCB2YWx1ZTogXCIgKVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJkZXNjZW5kYW50XCIsIHZhbHVlOiBcIiBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLnRleHQteHMtanVzdGlmeVwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnaHRtbCAqOmZpcnN0LWNoaWxkID0+IFsgdHlwZSwgZGVzY2VuZGFudCwgdW5pdmVyc2FsLCBwc2V1ZG8gXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJodG1sICo6Zmlyc3QtY2hpbGRcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJodG1sXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImRlc2NlbmRhbnRcIiwgdmFsdWU6IFwiIFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ1bml2ZXJzYWxcIiwgdmFsdWU6IFwiKlwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOmZpcnN0LWNoaWxkXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdodG1sIHAgYTpob3ZlciA9PiBbIHR5cGUsIGRlc2NlbmRhbnQsIHR5cGUsIGRlc2NlbmRhbnQsIHR5cGUsIHBzZXVkbyBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcImh0bWwgcCBhOmhvdmVyXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiaHRtbFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJkZXNjZW5kYW50XCIsIHZhbHVlOiBcIiBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJwXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImRlc2NlbmRhbnRcIiwgdmFsdWU6IFwiIFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImFcIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpob3ZlclwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnKiArIC5yYW5nZS1sZyA9PiBbIHVuaXZlcnNhbCwgYWRqYWNlbnQtc2libGluZywgY2xhc3MgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCIqICsgLnJhbmdlLWxnXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInVuaXZlcnNhbFwiLCB2YWx1ZTogXCIqXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImFkamFjZW50LXNpYmxpbmdcIiwgdmFsdWU6IFwiICsgXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5yYW5nZS1sZ1wiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnLmxpc3QtcHJvZ3Jlc3MtYmFycyBsaStsaSA9PiBbIGNsYXNzLCBkZXNjZW5kYW50LCB0eXBlLCBhZGphY2VudC1zaWJsaW5nLCB0eXBlIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiLmxpc3QtcHJvZ3Jlc3MtYmFycyBsaStsaVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIubGlzdC1wcm9ncmVzcy1iYXJzXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImRlc2NlbmRhbnRcIiwgdmFsdWU6IFwiIFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImxpXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImFkamFjZW50LXNpYmxpbmdcIiwgdmFsdWU6IFwiK1wiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImxpXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCcubGlzdD5saStsaSA9PiBbIGNsYXNzLCBjaGlsZCwgdHlwZSwgYWRqYWNlbnQtc2libGluZywgdHlwZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIi5saXN0PmxpK2xpXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5saXN0XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNoaWxkXCIsIHZhbHVlOiBcIj5cIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJsaVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJhZGphY2VudC1zaWJsaW5nXCIsIHZhbHVlOiBcIitcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJsaVwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnYXVkaW86bm90KFtjb250cm9sc10pID0+IFsgdHlwZSwgcHNldWRvLCBzY29wZS1zdGFydCwgYXR0cmlidXRlLCBzY29wZS1lbmQgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJhdWRpbzpub3QoW2NvbnRyb2xzXSlcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJhdWRpb1wiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOm5vdFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1zdGFydFwiLCB2YWx1ZTogXCIoXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImF0dHJpYnV0ZVwiLCB2YWx1ZTogXCJbY29udHJvbHNdXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLWVuZFwiLCB2YWx1ZTogXCIpXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdzdmc6bm90KDpyb290KSA9PiBbIHR5cGUsIHBzZXVkbywgc2NvcGUtc3RhcnQsIHBzZXVkbywgc2NvcGUtZW5kIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwic3ZnOm5vdCg6cm9vdClcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJzdmdcIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpub3RcIiB9LFxuICAgICAgICB7IHR5cGU6IFwic2NvcGUtc3RhcnRcIiwgdmFsdWU6IFwiKFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOnJvb3RcIiB9LFxuICAgICAgICB7IHR5cGU6IFwic2NvcGUtZW5kXCIsIHZhbHVlOiBcIilcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2J1dHRvbjo6LW1vei1mb2N1cy1pbm5lciA9PiBbIHR5cGUsIHBzZXVkbyBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcImJ1dHRvbjo6LW1vei1mb2N1cy1pbm5lclwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImJ1dHRvblwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOjotbW96LWZvY3VzLWlubmVyXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdpbnB1dFt0eXBlPVxcXCJudW1iZXJcXFwiXTo6LXdlYmtpdC1pbm5lci1zcGluLWJ1dHRvbiA9PiBbIHR5cGUsIGF0dHJpYnV0ZSwgcHNldWRvIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiaW5wdXRbdHlwZT1cXFwibnVtYmVyXFxcIl06Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b25cIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJpbnB1dFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJhdHRyaWJ1dGVcIiwgdmFsdWU6IFwiW3R5cGU9XFxcIm51bWJlclxcXCJdXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInBzZXVkb1wiLCB2YWx1ZTogXCI6Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b25cIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJyo6YmVmb3JlID0+IFsgdW5pdmVyc2FsLCBwc2V1ZG8gXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCIqOmJlZm9yZVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJ1bml2ZXJzYWxcIiwgdmFsdWU6IFwiKlwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOmJlZm9yZVwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnLmRyb3B1cD4gLmJ0biA+LmNhcmV0ID0+IFsgY2xhc3MsIGNoaWxkLCBjbGFzcywgY2hpbGQsIGNsYXNzIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiLmRyb3B1cD4gLmJ0biA+LmNhcmV0XCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5kcm9wdXBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2hpbGRcIiwgdmFsdWU6IFwiPiBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLmJ0blwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjaGlsZFwiLCB2YWx1ZTogXCIgPlwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIuY2FyZXRcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJy50YWJsZT5jYXB0aW9uK3RoZWFkPnRyOmZpcnN0LWNoaWxkPnRkID0+IFsgY2xhc3MsIGNoaWxkLCB0eXBlLCBhZGphY2VudC1zaWJsaW5nLCB0eXBlLCBjaGlsZCwgdHlwZSwgcHNldWRvLCBhZGphY2VudC1zaWJsaW5nLCB0eXBlLCBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIi50YWJsZT5jYXB0aW9uK3RoZWFkPnRyOmZpcnN0LWNoaWxkPnRkXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi50YWJsZVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjaGlsZFwiLCB2YWx1ZTogXCI+XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiY2FwdGlvblwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJhZGphY2VudC1zaWJsaW5nXCIsIHZhbHVlOiBcIitcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJ0aGVhZFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjaGlsZFwiLCB2YWx1ZTogXCI+XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwidHJcIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpmaXJzdC1jaGlsZFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjaGlsZFwiLCB2YWx1ZTogXCI+XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwidGRcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJy50YWJsZS1zdHJpcGVkPnRib2R5PnRyOm50aC1vZi10eXBlKGV2ZW4pID0+IFsgY2xhc3MsIGNoaWxkLCB0eXBlLCBjaGlsZCwgdHlwZSwgcHNldWRvLCBzY29wZS1zdGFydCwgdHlwZSwgc2NvcGUtZW5kIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiLnRhYmxlLXN0cmlwZWQ+dGJvZHk+dHI6bnRoLW9mLXR5cGUoZXZlbilcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLnRhYmxlLXN0cmlwZWRcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2hpbGRcIiwgdmFsdWU6IFwiPlwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcInRib2R5XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNoaWxkXCIsIHZhbHVlOiBcIj5cIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJ0clwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOm50aC1vZi10eXBlXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLXN0YXJ0XCIsIHZhbHVlOiBcIihcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJldmVuXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLWVuZFwiLCB2YWx1ZTogXCIpXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdoMX4gcCB+cH4uYnRuID0+IFsgdHlwZSwgZ2VuZXJhbC1zaWJsaW5nLCB0eXBlLCBnZW5lcmFsLXNpYmxpbmcsIHR5cGUsIGdlbmVyYWwtc2libGluZywgY2xhc3MgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJoMX4gcCB+cH4uYnRuXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiaDFcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiZ2VuZXJhbC1zaWJsaW5nXCIsIHZhbHVlOiBcIn4gXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwicFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJnZW5lcmFsLXNpYmxpbmdcIiwgdmFsdWU6IFwiIH5cIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJwXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImdlbmVyYWwtc2libGluZ1wiLCB2YWx1ZTogXCJ+XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5idG5cIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJy5oYXMtZmVlZGJhY2sgbGFiZWwuc3Itb25seX4uZm9ybS1jb250cm9sLWZlZWRiYWNrID0+IFsgY2xhc3MsIGRlc2NlbmRhbnQsIHR5cGUsIGNsYXNzLCBnZW5lcmFsLXNpYmxpbmcsIGNsYXNzIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiLmhhcy1mZWVkYmFjayBsYWJlbC5zci1vbmx5fi5mb3JtLWNvbnRyb2wtZmVlZGJhY2tcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLmhhcy1mZWVkYmFja1wiIH0sXG4gICAgICAgIHsgdHlwZTogXCJkZXNjZW5kYW50XCIsIHZhbHVlOiBcIiBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJsYWJlbFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIuc3Itb25seVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJnZW5lcmFsLXNpYmxpbmdcIiwgdmFsdWU6IFwiflwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIuZm9ybS1jb250cm9sLWZlZWRiYWNrXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcbiAgfSk7XG59KTsiLCJpbXBvcnQgXCIuL3NwZWMvU2VsZWN0b3JUb2tlbml6ZXJTcGVjLmVzNlwiOyJdfQ==
