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

// Export to global scope


exports.default = SelectorTokenizer;
var lib = window.lib || {};
lib.SelectorTokenizer = SelectorTokenizer;
window.lib = lib;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2VsZWN0b3ItdG9rZW5pemVyLmVzNiIsInRlc3QvanMvc3BlYy9TZWxlY3RvclRva2VuaXplclNwZWMuZXM2IiwidGVzdC9qcy9zdWl0ZS5lczYiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkEsSUFBTSxhQUFvQixJQUFJLFVBQUosQ0FBZSxDQUFmLENBQTFCO0FBQ0EsSUFBTSxlQUFvQixLQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FBMUI7QUFDQSxJQUFNLGVBQW9CLEtBQUssVUFBTCxDQUFnQixDQUFoQixDQUExQjtBQUNBLElBQU0sUUFBb0IsS0FBSyxVQUFMLENBQWdCLENBQWhCLENBQTFCO0FBQ0EsSUFBTSxPQUFvQixJQUFJLFVBQUosQ0FBZSxDQUFmLENBQTFCO0FBQ0EsSUFBTSxtQkFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sb0JBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFdBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFlBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFdBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFFBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGNBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGNBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGVBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLFFBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGFBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7O0FB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QSxlQUFTLG9EQUFUO0FBQ0EsdUJBQWlCLENBQ2YsRUFBRSxNQUFNLE9BQVIsRUFBaUIsT0FBTyxlQUF4QixFQURlLEVBRWYsRUFBRSxNQUFNLFlBQVIsRUFBc0IsT0FBTyxHQUE3QixFQUZlLEVBR2YsRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBTyxPQUF2QixFQUhlLEVBSWYsRUFBRSxNQUFNLE9BQVIsRUFBaUIsT0FBTyxVQUF4QixFQUplLEVBS2YsRUFBRSxNQUFNLGlCQUFSLEVBQTJCLE9BQU8sR0FBbEMsRUFMZSxFQU1mLEVBQUUsTUFBTSxPQUFSLEVBQWlCLE9BQU8sd0JBQXhCLEVBTmUsQ0FBakI7O0FBU0EscUJBQWUsUUFBUSxRQUFSLENBQWlCLE1BQWpCLENBQWY7O0FBRUEsYUFBTyxZQUFQLEVBQXFCLE9BQXJCLENBQTZCLGNBQTdCO0FBQ0QsS0FoQkQ7QUFpQkQsR0F6aEJEO0FBMGhCRCxDQTNoQkQ7Ozs7O0FDRkEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgRXVnZW5lIEZvcmQgKHN0bWVjaGFudXNAZ21haWwuY29tKVxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZVxuICogYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sXG4gKiBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLFxuICogYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcbiAqIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWxcbiAqIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbiAqIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbiAqIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRVxuICogT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxuY29uc3QgV0hJVEVTUEFDRSAgICAgICAgPSAnICcuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFNJTkdMRV9RVU9URSAgICAgID0gJ1xcXCInLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBET1VCTEVfUVVPVEUgICAgICA9ICdcXCcnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBTTEFTSCAgICAgICAgICAgICA9ICdcXFxcJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgSEFTSCAgICAgICAgICAgICAgPSAnIycuY2hhckNvZGVBdCgwKTtcbmNvbnN0IE9QRU5fUEFSRU5USEVTRVMgID0gJygnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBDTE9TRV9QQVJFTlRIRVNFUyA9ICcpJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQVNURVJJU0sgICAgICAgICAgPSAnKicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFBMVVNfU0lHTiAgICAgICAgID0gJysnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBET1RfU0lHTiAgICAgICAgICA9ICcuJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQ09MT04gICAgICAgICAgICAgPSAnOicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFJJR0hUX0FOR0xFICAgICAgID0gJz4nLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBPUEVOX1NRVUFSRSAgICAgICA9ICdbJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQ0xPU0VfU1FVQVJFICAgICAgPSAnXScuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFRJTERFICAgICAgICAgICAgID0gJ34nLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBFUVVBTF9TSUdOICAgICAgICA9ICc9Jy5jaGFyQ29kZUF0KDApO1xuXG4vKipcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5jb25zdCBDRl9XT1JEID0gZnVuY3Rpb24gKGNvZGUpIHtcbiAgcmV0dXJuIChjb2RlID49IDEyOCB8fCBjb2RlID09PSA0NSB8fCBjb2RlID09IDI0NSB8fCAoY29kZSA+PSA0OCAmJiBjb2RlIDw9IDU3KSB8fCAoY29kZSA+PSA2NSAmJiBjb2RlIDw9IDkwKSB8fCAoY29kZSA+PSA5NyAmJiBjb2RlIDw9IDEyMikpO1xufTtcblxuLyoqXG4gKiBUaGUgc2VsZWN0b3IgdG9rZW5pemVyIGFsbG93cyB0byBicmVhayBhIGNzcyBzZWxlY3RvciBzdHJpbmcgaW50byBzZXQgb2YgdG9rZW5zLlxuICogVGhlIHRva2VuaXphdGlvbiBtZXRob2QgaXMgYmFzZWQgb24gYSBzZXQgb2YgbGV4ZXIgZ3JhbW1hcnMgcnVsZXMuIFRoZSBmdWxsIGxpc3Qgb2ZcbiAqIGF2YWlsYWJsZSB0b2tlbiB0eXBlcyBpcyBuZXh0OlxuICpcbiAqIDx0eXBlLXNlbGVjdG9yPiAtIGZvciBiYXNpYyB0eXBlIHNlbGVjdG9ycyBlZy4gXCJhcnRpY2xlXCIsIFwiaDFcIiwgXCJwXCIgZXRjLlxuICogPGNsYXNzLXNlbGVjdG9yPiAtIGZvciBiYXNpYyBjbGFzcyBzZWxlY3RvcnMgZWcuIFwiLmJ1dHRvblwiLCBcIi5wb3N0XCIsIGV0Yy5cbiAqIDx1bml2ZXJzYWwtc2VsZWN0b3I+IC0gZm9yIGJhc2ljIHVuaXZlcnNhbCBzZWxlY3RvciBcIipcIlxuICogPGF0dHJpYnV0ZS1zZWxlY3Rvcj4gLSBmb3IgYmFzaWMgYXR0cmlidXRlIHNlbGVjdG9ycyBlZy4gXCJbYXR0cl1cIiwgXCJbYXR0cj12YWxdXCIsIFwiW2F0dHJePXZhbF1cIiBldGMuXG4gKiA8cHNldWRvLXNlbGVjdG9yPiAtIGZvciBwc2V1ZG8tZWxlbWVudCBhbmQgcHNldWRvLWNsYXNzLXNlbGVjdG9ycyBlZy4gXCI6Zmlyc3QtY2hpbGRcIiwgXCI6OmZpcnN0LWxldHRlclwiXG4gKiA8ZGVzY2VuZGF0LXNlbGVjdG9yPiAtIGZvciBzZWxlY3RvcidzIGRlc2NlbmRhbnQgY29tYmluYXRvciBcIiBcIlxuICogPGFkamFjZW50LXNpYmxpbmctc2VsZWN0b3I+IC0gZm9yIHNlbGVjdG9yJ3MgYWRqYWNlbnQgc2libGluZyBjb21iaW5hdG9yIFwiK1wiXG4gKiA8Z2VuZXJhbC1zaWJsaW5nLXNlbGVjdG9yPiAtIGZvciBzZWxlY3RvcidzIGdlbmVyYWwgc2libGluZyBjb21iaW5hdG9yIFwiflwiXG4gKiA8Y2hpbGQtc2VsZWN0b3I+IC0gZm9yIHNlbGVjdG9yJ3MgY2hpbGQgY29tYmluYXRvciBcIj5cIlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBpbGx1c3RyYXRlcyB0aGUgcHJpbmNpcGxlIHRoZSBTZWxlY3RvclRva2VuaXplci50b2tlbml6ZSBtZXRob2RcbiAqIEBleGFtcGxlXG4gKiB0b2tlbnMgPSB0b2tlbml6ZXIudG9rZW5pemUoXCIucGFnZSBtYWluXCIpO1xuICogdG9rZW5zICAgLy89PiBbe3R5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLnBhZ2VcIn0sIHt0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwibWFpblwifV1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0b3JUb2tlbml6ZXIge1xuICBjb25zdHJ1Y3Rvcigpe31cblxuICAvKipcbiAgICogR2V0IHRva2VuIHR5cGUgYmFzZWQgb24gb25lIGNoYXJDb2RlIG9ubHlcbiAgICogQHBhcmFtIHN0YXJ0Q29kZVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKlxuICAgKiBAdGhyb3dzIFN5bnRheEVycm9yIC0gaWYgdGFyZ2V0IGNoYXIgY29kZSB3YXMgbm90IGZvdW5kIGluIGdyYW1tYXJcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogdHlwZSA9IGNoZWNrZXIuZ2V0SW5pdGlhbFRva2VuVHlwZSgzMik7XG4gICAqIHR5cGUgICAvLz0+IFwiZGVzY2VuZGFudFwiXG4gICAqL1xuICBnZXRJbml0aWFsVG9rZW5UeXBlKHN0YXJ0Q29kZSl7XG4gICAgLy8gRmluZCB0YXJnZXQgc3RhcnRDb2RlIGluIGdyYW1tYXJcbiAgICBzd2l0Y2ggKHN0YXJ0Q29kZSkge1xuICAgICAgY2FzZSBXSElURVNQQUNFOiAgICAgICAgICByZXR1cm4gXCJkZXNjZW5kYW50XCI7XG4gICAgICBjYXNlIEhBU0g6ICAgICAgICAgICAgICAgIHJldHVybiBcImlkXCI7XG4gICAgICBjYXNlIE9QRU5fUEFSRU5USEVTRVM6ICAgIHJldHVybiBcInNjb3BlLXN0YXJ0XCI7XG4gICAgICBjYXNlIENMT1NFX1BBUkVOVEhFU0VTOiAgIHJldHVybiBcInNjb3BlLWVuZFwiO1xuICAgICAgY2FzZSBBU1RFUklTSzogICAgICAgICAgICByZXR1cm4gXCJ1bml2ZXJzYWxcIjtcbiAgICAgIGNhc2UgUExVU19TSUdOOiAgICAgICAgICAgcmV0dXJuIFwiYWRqYWNlbnQtc2libGluZ1wiO1xuICAgICAgY2FzZSBET1RfU0lHTjogICAgICAgICAgICByZXR1cm4gXCJjbGFzc1wiO1xuICAgICAgY2FzZSBDT0xPTjogICAgICAgICAgICAgICByZXR1cm4gXCJwc2V1ZG9cIjtcbiAgICAgIGNhc2UgUklHSFRfQU5HTEU6ICAgICAgICAgcmV0dXJuIFwiY2hpbGRcIjtcbiAgICAgIGNhc2UgT1BFTl9TUVVBUkU6ICAgICAgICAgcmV0dXJuIFwiYXR0cmlidXRlXCI7XG4gICAgICBjYXNlIFRJTERFOiAgICAgICAgICAgICAgIHJldHVybiBcImdlbmVyYWwtc2libGluZ1wiO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKENGX1dPUkQoc3RhcnRDb2RlKSkgcmV0dXJuIFwidHlwZVwiO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gT3IgdGhyb3cgYSBzeW50YXggZXJyb3JcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIFwiJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHN0YXJ0Q29kZSl9XCJgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSB0b2tlbiB0eXBlIHVwZGF0ZSBmb3IgbW9yZSBzcGVjaWZpY2l0eSB3aXRoIGFkZGl0aW9uYWwgMyBjaGFyIGNvZGVzXG4gICAqIE5PVEU6IHVzZSB0aGlzIG1ldGhvZCB0byB1cGRhdGUgdG9rZSB0eXBlIG9ubHkuIFVzZSB7Z2V0SW5pdGlhbFRva2VuVHlwZX0gbWV0aG9kXG4gICAqIHRvIGdldCBpbml0aWFsIHR5cGUgb2YgdGFyZ2V0IHRva2VuXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEBwYXJhbSBzZWNvbmRDb2RlXG4gICAqIEByZXR1cm5zIHtzdHJpbmd8dW5kZWZpbmVkfVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB0eXBlID0gY2hlY2tlci5nZXRJbml0aWFsVG9rZW5UeXBlKDMyKTtcbiAgICogdHlwZSAgIC8vPT4gXCJkZXNjZW5kYW50XCJcbiAgICogdHlwZSA9IGNoZWNrZXIuZ2V0TGF6eVRva2VuVHlwZSgzMiw0MSk7XG4gICAqIHR5cGUgICAvLz0+IFwic2NvcGUtZW5kXCJcbiAgICovXG4gIGdldExhenlUb2tlblR5cGUoZmlyc3RDb2RlLCBuZXh0Q29kZSwgc2Vjb25kQ29kZSl7XG4gICAgLy8gQ2hhbmdlIHRva2VuIHR5cGUgaWYgbGF6eSA8c2NvcGUtZW5kaW5nLXBvaW50PiB3YXMgc3BvdHRlZFxuICAgIGlmIChuZXh0Q29kZSA9PT0gQ0xPU0VfUEFSRU5USEVTRVMgJiYgZmlyc3RDb2RlID09PSBXSElURVNQQUNFKVxuICAgICAgcmV0dXJuIFwic2NvcGUtZW5kXCI7XG5cbiAgICAvLyBDaGFuZ2UgdG9rZW4gdHlwZSBpZiBsYXp5IDxhZGphY2VudC1zaWJsaW5nLXNlbGVjdG9yPiB3YXMgc3BvdHRlZFxuICAgIGVsc2UgaWYgKG5leHRDb2RlID09PSBQTFVTX1NJR04gJiYgZmlyc3RDb2RlID09PSBXSElURVNQQUNFKVxuICAgICAgcmV0dXJuIFwiYWRqYWNlbnQtc2libGluZ1wiO1xuXG4gICAgLy8gQ2hhbmdlIHRva2VuIHR5cGUgaWYgbGF6eSA8Y2hpbGQtc2VsZWN0b3I+IHdhcyBzcG90dGVkXG4gICAgZWxzZSBpZiAobmV4dENvZGUgPT09IFJJR0hUX0FOR0xFICYmIGZpcnN0Q29kZSA9PT0gV0hJVEVTUEFDRSlcbiAgICAgIHJldHVybiBcImNoaWxkXCI7XG5cbiAgICAvLyBDaGFuZ2UgdG9rZW4gdHlwZSBpZiBsYXp5IDxnZW5lcmFsLXNpYmxpbmctc2VsZWN0b3I+IHdhcyBzcG90dGVkXG4gICAgZWxzZSBpZiAobmV4dENvZGUgPT09IFRJTERFICYmIGZpcnN0Q29kZSA9PT0gV0hJVEVTUEFDRSlcbiAgICAgIHJldHVybiBcImdlbmVyYWwtc2libGluZ1wiO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGRlc2NlbmRhbnQtc2VsZWN0b3I+IHRva2VuIGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcGFyYW0gd2FzQnJhY2VzT3BlbmVkXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNEZXNjZW5kYW50Qm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUsIHdhc0JyYWNlc09wZW5lZCl7XG4gICAgcmV0dXJuICF3YXNCcmFjZXNPcGVuZWQgJiYgbmV4dENvZGUgPT09IFdISVRFU1BBQ0UgJiYgZmlyc3RDb2RlICE9PSBXSElURVNQQUNFXG4gICAgICAmJiBmaXJzdENvZGUgIT09IFBMVVNfU0lHTiAmJiBmaXJzdENvZGUgIT09IFJJR0hUX0FOR0xFICYmIGZpcnN0Q29kZSAhPT0gVElMREU7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxpZC1zZWxlY3Rvcj4gdG9rZW4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0lkQm91bmRzKGZpcnN0Q29kZSl7XG4gICAgcmV0dXJuIGZpcnN0Q29kZSA9PT0gSEFTSDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPHNjb3BlLXN0YXJ0aW5nLXBvaW50PiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU2NvcGVTdGFydEJvdW5kcyhmaXJzdENvZGUpe1xuICAgIHJldHVybiBmaXJzdENvZGUgPT09IE9QRU5fUEFSRU5USEVTRVNcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPHNjb3BlLWVuZGluZy1wb2ludD4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNTY29wZUVuZEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKXtcbiAgICByZXR1cm4gbmV4dENvZGUgPT09IENMT1NFX1BBUkVOVEhFU0VTICYmIGZpcnN0Q29kZSAhPT0gV0hJVEVTUEFDRTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPHVuaXZlcnNhbC1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNVbml2ZXJzYWxCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSl7XG4gICAgcmV0dXJuIGZpcnN0Q29kZSA9PT0gQVNURVJJU0sgJiYgbmV4dENvZGUgIT09IEVRVUFMX1NJR047XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxhZGphY2VudC1zaWJsaW5nLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0FkamFjZW50U2libGluZ0JvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKXtcbiAgICByZXR1cm4gbmV4dENvZGUgPT09IFBMVVNfU0lHTiAmJiBmaXJzdENvZGUgIT09IFdISVRFU1BBQ0U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxjbGFzcy1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0NsYXNzQm91bmRzKGZpcnN0Q29kZSl7XG4gICAgcmV0dXJuIGZpcnN0Q29kZSA9PT0gRE9UX1NJR047XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxwc2V1ZG8tc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzUHNldWRvQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpe1xuICAgIHJldHVybiBuZXh0Q29kZSA9PT0gQ09MT04gJiYgZmlyc3RDb2RlICE9PSBDT0xPTjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGNoaWxkLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQ2hpbGRCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSl7XG4gICAgcmV0dXJuIG5leHRDb2RlID09PSBSSUdIVF9BTkdMRSAmJiBmaXJzdENvZGUgIT09IFdISVRFU1BBQ0U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxhdHRyaWJ1dGUtc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNBdHRyaWJ1dGVCb3VuZHMoZmlyc3RDb2RlKXtcbiAgICByZXR1cm4gZmlyc3RDb2RlID09PSBPUEVOX1NRVUFSRTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGdlbmVyYWwtc2libGluZy1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEBwYXJhbSBzZWNvbmRDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNHZW5lcmFsU2libGluZ0JvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlKXtcbiAgICByZXR1cm4gbmV4dENvZGUgPT09IFRJTERFICYmIHNlY29uZENvZGUgIT09IEVRVUFMX1NJR04gJiYgZmlyc3RDb2RlICE9IFdISVRFU1BBQ0U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDx0eXBlLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHBhcmFtIHdhc0JyYWNlc09wZW5lZFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVHlwZUJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCB3YXNCcmFjZXNPcGVuZWQpe1xuICAgIHJldHVybiAoZmlyc3RDb2RlID09PSBXSElURVNQQUNFIHx8IGZpcnN0Q29kZSA9PT0gUExVU19TSUdOIHx8IGZpcnN0Q29kZSA9PT0gVElMREUgfHwgZmlyc3RDb2RlID09PSBSSUdIVF9BTkdMRSlcbiAgICAgICYmICF3YXNCcmFjZXNPcGVuZWQgJiYgQ0ZfV09SRChuZXh0Q29kZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIHRva2VuIGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcGFyYW0gc2Vjb25kQ29kZVxuICAgKiBAcGFyYW0gd2FzQnJhY2VzT3BlbmVkXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNUb2tlbkJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlLCB3YXNCcmFjZXNPcGVuZWQpe1xuICAgIHJldHVybiB0aGlzLmlzRGVzY2VuZGFudEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCB3YXNCcmFjZXNPcGVuZWQpXG4gICAgICB8fCB0aGlzLmlzSWRCb3VuZHMobmV4dENvZGUpXG4gICAgICB8fCB0aGlzLmlzU2NvcGVTdGFydEJvdW5kcyhuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNTY29wZUVuZEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc1VuaXZlcnNhbEJvdW5kcyhuZXh0Q29kZSwgc2Vjb25kQ29kZSlcbiAgICAgIHx8IHRoaXMuaXNBZGphY2VudFNpYmxpbmdCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNDbGFzc0JvdW5kcyhuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNQc2V1ZG9Cb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNDaGlsZEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc0F0dHJpYnV0ZUJvdW5kcyhuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNHZW5lcmFsU2libGluZ0JvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlKVxuICAgICAgfHwgdGhpcy5pc1R5cGVCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSwgd2FzQnJhY2VzT3BlbmVkKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWQgYSBncmFtbWFyIHRva2VuIGZyb20gYSBzdHJpbmcgc3RhcnRpbmcgYXQgdGFyZ2V0IHBvc2l0aW9uXG4gICAqIEBwYXJhbSBzZWxlY3RvclRleHQgLSBhIHN0cmluZyBjb250YWluaW5nIGNzcyB0ZXh0IHRvIHJlYWQgYSB0b2tlbiBmcm9tXG4gICAqIEBwYXJhbSBzdGFydEluZGV4IC0gcG9zaXRpb24gdG8gc3RhcnQgcmVhZCBhIHRva2VuIGF0XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqXG4gICAqIEB0aHJvd3MgU3ludGF4RXJyb3IgLSBpZiBhbiB1bmtub3duIGNoYXJhY3RlciB3YXMgZm91bmQgaW4gcHJvY2Vzc1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB0b2tlbiA9IGNoZWNrZXIudG9rZW5BdChcIi5jbGFzc25hbWVcIiwgMCk7XG4gICAqIHRva2VuICAgLy89PiB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLmNsYXNzbmFtZVwiIH1cbiAgICovXG4gIHRva2VuQXQoc2VsZWN0b3JUZXh0LCBzdGFydEluZGV4KXtcbiAgICBsZXQgc2l6ZSA9IDEsIHN0YXJ0Q29kZSA9IHNlbGVjdG9yVGV4dC5jb2RlUG9pbnRBdChzdGFydEluZGV4KSxcbiAgICAgIHR5cGUsIHRva2VuLCBuZXh0Q29kZSwgbmV4dEluZGV4LCBwcmV2Q29kZSwgc2Vjb25kQ29kZSwgb3BlbkJyYWNlcyxcbiAgICAgIG9wZW5RdW90ZXMsIHBlbnVsdENvZGU7XG5cbiAgICAvLyBHZXQgaW5pdGlhbCB0b2tlbiB0eXBlXG4gICAgdHlwZSA9IHRoaXMuZ2V0SW5pdGlhbFRva2VuVHlwZShzdGFydENvZGUpO1xuXG4gICAgLy8gU2V0IGluaXRpYWwgc3RhdGUgZm9yIG5leHRDb2RlXG4gICAgbmV4dEluZGV4ID0gc3RhcnRJbmRleCArIHNpemU7XG4gICAgcHJldkNvZGUgPSBzdGFydENvZGU7XG4gICAgbmV4dENvZGUgPSBzZWxlY3RvclRleHQuY29kZVBvaW50QXQobmV4dEluZGV4KTtcbiAgICBzZWNvbmRDb2RlID0gc2VsZWN0b3JUZXh0LmNvZGVQb2ludEF0KG5leHRJbmRleCArIDEpO1xuICAgIG9wZW5CcmFjZXMgPSBzdGFydENvZGUgPT09IE9QRU5fU1FVQVJFO1xuXG4gICAgLy8gQ2hlY2sgZm9yIDxzY29wZS1zdGFydGluZy1wb2ludGVyPiBvciA8c2NvcGUtZW5kaW5nLXBvaW50ZXI+XG4gICAgaWYgKCBwcmV2Q29kZSA9PT0gT1BFTl9QQVJFTlRIRVNFUyAgfHwgcHJldkNvZGUgPT09IENMT1NFX1BBUkVOVEhFU0VTKXtcbiAgICAgIHdoaWxlIChuZXh0Q29kZSA9PT0gV0hJVEVTUEFDRSkge1xuICAgICAgICBuZXh0Q29kZSA9IHNlbGVjdG9yVGV4dC5jb2RlUG9pbnRBdCgrK3NpemUgKyBzdGFydEluZGV4KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXaGlsZSBub3QgRU9GXG4gICAgICB3aGlsZSAobmV4dEluZGV4IDwgc2VsZWN0b3JUZXh0Lmxlbmd0aCkge1xuICAgICAgICBpZiAoIW9wZW5RdW90ZXMpe1xuXG4gICAgICAgICAgLy8gR2V0IGEgdG9rZW4gdHlwZSB1cGRhdGUgb3IgdXNlIHRoZSBsYXN0IG9uZVxuICAgICAgICAgIHR5cGUgPSB0aGlzLmdldExhenlUb2tlblR5cGUocHJldkNvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlKSB8fCB0eXBlO1xuXG4gICAgICAgICAgLy8gQnJlYWsgaWYgbmV4dCB0b2tlbiBzcG90dGVkXG4gICAgICAgICAgaWYgKCB0aGlzLmlzVG9rZW5Cb3VuZHMocHJldkNvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlLCBvcGVuQnJhY2VzKSkgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgY29kZXMgZm9yIG5leHQgaXRlcmF0aW9uXG4gICAgICAgIHNpemUrKztcbiAgICAgICAgbmV4dEluZGV4ID0gc2l6ZSArIHN0YXJ0SW5kZXg7XG4gICAgICAgIHBlbnVsdENvZGUgPSBwcmV2Q29kZTtcbiAgICAgICAgcHJldkNvZGUgPSBuZXh0Q29kZTtcbiAgICAgICAgbmV4dENvZGUgPSBzZWxlY3RvclRleHQuY29kZVBvaW50QXQobmV4dEluZGV4KTtcbiAgICAgICAgc2Vjb25kQ29kZSA9IHNlbGVjdG9yVGV4dC5jb2RlUG9pbnRBdChuZXh0SW5kZXggKyAxKTtcblxuICAgICAgICAvLyBDaGVjayBpZiBcIiBvciAnIHdhcyBzcG90dGVkIHdpdGhvdXQgZXNjYXBlIFxcXG4gICAgICAgIGlmIChwcmV2Q29kZSAhPT0gU0xBU0ggJiYgKG5leHRDb2RlID09PSBTSU5HTEVfUVVPVEUgfHwgbmV4dENvZGUgPT0gRE9VQkxFX1FVT1RFKSkge1xuICAgICAgICAgIGlmICghIW9wZW5RdW90ZXMpIHtcbiAgICAgICAgICAgIGlmIChuZXh0Q29kZSA9PT0gb3BlblF1b3Rlcykgb3BlblF1b3RlcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3BlblF1b3RlcyA9IG5leHRDb2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb3BlblF1b3Rlcykge1xuICAgICAgICAgIC8vIENoZWNrIGlmIFsgd2FzIHNwb3R0ZWRcbiAgICAgICAgICBpZiAobmV4dENvZGUgPT09IE9QRU5fU1FVQVJFKSB7XG4gICAgICAgICAgICBpZiAob3BlbkJyYWNlcykgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBcIiR7c2VsZWN0b3JUZXh0W25leHRJbmRleF19XCIgYXQgJHtuZXh0SW5kZXh9IHBvc2l0aW9uYCk7XG4gICAgICAgICAgICBvcGVuQnJhY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBdIHdhcyBzcG90dGVkXG4gICAgICAgICAgaWYgKG5leHRDb2RlID09PSBDTE9TRV9TUVVBUkUpIHtcbiAgICAgICAgICAgIGlmICghb3BlbkJyYWNlcykgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBcIiR7c2VsZWN0b3JUZXh0W25leHRJbmRleF19XCIgYXQgJHtuZXh0SW5kZXh9IHBvc2l0aW9uYCk7XG4gICAgICAgICAgICBvcGVuQnJhY2VzID0gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHRyaXBsZSBjb2xvbiA6OjogcGFyc2UgZXJyb3JcbiAgICAgICAgICBpZiAoQ09MT04gPT09IHBlbnVsdENvZGUgPT09IHByZXZDb2RlID09PSBuZXh0Q29kZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBcIiR7c2VsZWN0b3JUZXh0W25leHRJbmRleF19XCIgYXQgJHtuZXh0SW5kZXh9IHBvc2l0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgdG9rZW5cbiAgICB0b2tlbiA9IHsgdHlwZSwgdmFsdWU6IHNlbGVjdG9yVGV4dC5zdWJzdHIoc3RhcnRJbmRleCwgc2l6ZSkgfTtcblxuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBzZXQgb2YgdG9rZW5zIGZyb20gdGFyZ2V0IHNlbGVjdG9yIHN0cmluZ1xuICAgKiBAcGFyYW0gc2VsZWN0b3JUZXh0XG4gICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICovXG4gIHRva2VuaXplKHNlbGVjdG9yVGV4dCl7XG4gICAgbGV0IHRva2VucyA9IFtdLCBpbmRleCwgdG9rZW47XG5cbiAgICAvLyBMb29wIHRocm91Z2ggc2VsZWN0b3JUZXh0IGNoYXIgY29kZXNcbiAgICBmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgc2VsZWN0b3JUZXh0Lmxlbmd0aDsgaW5kZXgrKykge1xuXG4gICAgICAvLyBDcmVhdGUgYSB0b2tlblxuICAgICAgdG9rZW4gPSB0aGlzLnRva2VuQXQoc2VsZWN0b3JUZXh0LCBpbmRleCk7XG5cbiAgICAgIC8vIFNoaWZ0IGxvb3AgcG9pbnRlciBieSB0b2tlbiBzaXplXG4gICAgICBpbmRleCA9IGluZGV4ICsgdG9rZW4udmFsdWUubGVuZ3RoIC0gMTtcblxuICAgICAgLy8gQWRkIHRva2VuIHRvIHRva2Vuc0xpc3RcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG59XG5cbi8vIEV4cG9ydCB0byBnbG9iYWwgc2NvcGVcbmxldCBsaWIgPSB3aW5kb3cubGliIHx8IHt9O1xubGliLlNlbGVjdG9yVG9rZW5pemVyID0gU2VsZWN0b3JUb2tlbml6ZXI7XG53aW5kb3cubGliID0gbGliOyIsImltcG9ydCBTZWxlY3RvclRva2VuaXplciBmcm9tIFwiLi4vLi4vLi4vc3JjL3NlbGVjdG9yLXRva2VuaXplci5lczZcIjtcblxuZGVzY3JpYmUoJ1NlbGVjdG9yVG9rZW5pemVyJywgKCkgPT4ge1xuICBkZXNjcmliZSgndG9rZW5pemUnLCAoKSA9PiB7XG4gICAgaXQoJy5jbGFzcy1uYW1lID0+IFsgY2xhc3MgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCIuY2xhc3MtbmFtZVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5jbGFzcy1uYW1lXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnI2lkID0+IFsgaWQgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCIjaWRcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW3sgdHlwZTogXCJpZFwiLCB2YWx1ZTogXCIjaWRcIiB9XTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdhcnRpY2xlID0+IFsgdHlwZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcImFydGljbGVcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW3sgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImFydGljbGVcIiB9XTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdbYXV0b2NvbXBsZXRlXSA9PiBbIGF0dHJpYnV0ZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIlthdXRvY29tcGxldGVdXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFt7IHR5cGU6IFwiYXR0cmlidXRlXCIsIHZhbHVlOiBcIlthdXRvY29tcGxldGVdXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnW2NsYXNzKj1cXCd1bml0LVxcJ10gPT4gWyBhdHRyaWJ1dGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJbY2xhc3MqPVxcJ3VuaXQtXFwnXVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcImF0dHJpYnV0ZVwiLCB2YWx1ZTogXCJbY2xhc3MqPVxcJ3VuaXQtXFwnXVwiIH1dO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ1tsYW5nfj1cImVuLXVzXCJdID0+IFsgYXR0cmlidXRlIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiW2xhbmd+PVxcXCJlbi11c1xcXCJdXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFt7IHR5cGU6IFwiYXR0cmlidXRlXCIsIHZhbHVlOiBcIltsYW5nfj1cXFwiZW4tdXNcXFwiXVwiIH1dO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ1tsYW5nPVxcXCJwdFxcXCJdID0+IFsgYXR0cmlidXRlIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiW2xhbmc9XFxcInB0XFxcIl1cIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW3sgdHlwZTogXCJhdHRyaWJ1dGVcIiwgdmFsdWU6IFwiW2xhbmc9XFxcInB0XFxcIl1cIiB9XTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdbbGFuZ3w9XFxcInpoXFxcIl0gPT4gWyBhdHRyaWJ1dGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJbbGFuZ3w9XFxcInpoXFxcIl1cIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW3sgdHlwZTogXCJhdHRyaWJ1dGVcIiwgdmFsdWU6IFwiW2xhbmd8PVxcXCJ6aFxcXCJdXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnW2hyZWZePVxcXCIjXFxcIl0gPT4gWyBhdHRyaWJ1dGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJbaHJlZl49XFxcIiNcXFwiXVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcImF0dHJpYnV0ZVwiLCB2YWx1ZTogXCJbaHJlZl49XFxcIiNcXFwiXVwiIH1dO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ1tocmVmXj1cXFwiXFwnXFwuXFwnXFxcIl0gPT4gWyBhdHRyaWJ1dGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJbaHJlZl49XFxcIlxcJ1xcLidcXFwiXVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcImF0dHJpYnV0ZVwiLCB2YWx1ZTogXCJbaHJlZl49XFxcIlxcJ1xcLlxcJ1xcXCJdXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnW2hyZWYkPVxcXCIuY25cXFwiXSA9PiBbIGF0dHJpYnV0ZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIltocmVmJD1cXFwiLmNuXFxcIl1cIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW3sgdHlwZTogXCJhdHRyaWJ1dGVcIiwgdmFsdWU6IFwiW2hyZWYkPVxcXCIuY25cXFwiXVwiIH1dO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ1t0eXBlPVxcXCJlbWFpbFxcXCIgaV0gPT4gWyBhdHRyaWJ1dGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJbdHlwZT1cXFwiZW1haWxcXFwiIGldXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFt7IHR5cGU6IFwiYXR0cmlidXRlXCIsIHZhbHVlOiBcIlt0eXBlPVxcXCJlbWFpbFxcXCIgaV1cIiB9XTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCc6YmVmb3JlID0+IFsgcHNldWRvIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiOmJlZm9yZVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcInBzZXVkb1wiLCB2YWx1ZTogXCI6YmVmb3JlXCIgfV07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnOjpmaXJzdC1sZXR0ZXIgPT4gWyBwc2V1ZG8gXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCI6OmZpcnN0LWxldHRlclwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbeyB0eXBlOiBcInBzZXVkb1wiLCB2YWx1ZTogXCI6OmZpcnN0LWxldHRlclwiIH1dO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2FbaHJlZio9XFxcImV4YW1wbGVcXFwiXSA9PiBbIHR5cGUsIGF0dHJpYnV0ZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcImFbaHJlZio9XFxcImV4YW1wbGVcXFwiXVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImFcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiYXR0cmlidXRlXCIsIHZhbHVlOiBcIltocmVmKj1cXFwiZXhhbXBsZVxcXCJdXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdpbnB1dDo6LW1zLWNsZWFyID0+IFsgdHlwZSwgcHNldWRvIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiaW5wdXQ6Oi1tcy1jbGVhclwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImlucHV0XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInBzZXVkb1wiLCB2YWx1ZTogXCI6Oi1tcy1jbGVhclwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnaHRtbDpub3QoLmx0LWllMTApLmNsYXNzbmFtZSA9PiBbIHR5cGUsIHBzZXVkbywgc2NvcGUtc3RhcnQsIGNsYXNzLCBzY29wZS1lbmQsIGNsYXNzIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiaHRtbDpub3QoLmx0LWllMTApLmNsYXNzbmFtZVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImh0bWxcIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpub3RcIiB9LFxuICAgICAgICB7IHR5cGU6IFwic2NvcGUtc3RhcnRcIiwgdmFsdWU6IFwiKFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIubHQtaWUxMFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1lbmRcIiwgdmFsdWU6IFwiKVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIuY2xhc3NuYW1lXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdwOm50aC1vZi10eXBlKDJuKSA9PiBbIHR5cGUsIHBzZXVkbywgc2NvcGUtc3RhcnQsIHR5cGUsIHNjb3BlLWVuZCBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcInA6bnRoLW9mLXR5cGUoMm4pXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwicFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOm50aC1vZi10eXBlXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLXN0YXJ0XCIsIHZhbHVlOiBcIihcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCIyblwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1lbmRcIiwgdmFsdWU6IFwiKVwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnW2NsYXNzPVxcXCIoKVxcXCJdID0+IFsgYXR0cmlidXRlIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiW2NsYXNzPVxcXCIoKVxcXCJdXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcImF0dHJpYnV0ZVwiLCB2YWx1ZTogXCJbY2xhc3M9XFxcIigpXFxcIl1cIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2FydGljbGUgICBoZWFkZXIgPT4gWyB0eXBlLCBkZXNjZW5kYW50LCB0eXBlIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiYXJ0aWNsZSAgIGhlYWRlclwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImFydGljbGVcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiZGVzY2VuZGFudFwiLCB2YWx1ZTogXCIgICBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJoZWFkZXJcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJzpub3QoICAubHQtaWUxMCAgKSA9PiBbIHBzZXVkbywgc2NvcGUtc3RhcnQsIGNsYXNzLCBzY29wZS1lbmQgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCI6bm90KCAgLmx0LWllMTAgIClcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpub3RcIiB9LFxuICAgICAgICB7IHR5cGU6IFwic2NvcGUtc3RhcnRcIiwgdmFsdWU6IFwiKCAgXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5sdC1pZTEwXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLWVuZFwiLCB2YWx1ZTogXCIgIClcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2h0bWw6bm90KCAubHQtaWUxMCApIC50ZXh0LXhzLWp1c3RpZnkgPT4gWyB0eXBlLCBwc2V1ZG8sIHNjb3BlLXN0YXJ0LCAuY2xhc3MsIHNjb3BlLWVuZCwgZGVzY2VuZGFudCwgY2xhc3MgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJodG1sOm5vdCggLmx0LWllMTAgKSAudGV4dC14cy1qdXN0aWZ5XCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiaHRtbFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOm5vdFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1zdGFydFwiLCB2YWx1ZTogXCIoIFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIubHQtaWUxMFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1lbmRcIiwgdmFsdWU6IFwiIClcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiZGVzY2VuZGFudFwiLCB2YWx1ZTogXCIgXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi50ZXh0LXhzLWp1c3RpZnlcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2h0bWwgKjpmaXJzdC1jaGlsZCA9PiBbIHR5cGUsIGRlc2NlbmRhbnQsIHVuaXZlcnNhbCwgcHNldWRvIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiaHRtbCAqOmZpcnN0LWNoaWxkXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiaHRtbFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJkZXNjZW5kYW50XCIsIHZhbHVlOiBcIiBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidW5pdmVyc2FsXCIsIHZhbHVlOiBcIipcIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpmaXJzdC1jaGlsZFwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnaHRtbCBwIGE6aG92ZXIgPT4gWyB0eXBlLCBkZXNjZW5kYW50LCB0eXBlLCBkZXNjZW5kYW50LCB0eXBlLCBwc2V1ZG8gXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJodG1sIHAgYTpob3ZlclwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImh0bWxcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiZGVzY2VuZGFudFwiLCB2YWx1ZTogXCIgXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwicFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJkZXNjZW5kYW50XCIsIHZhbHVlOiBcIiBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJhXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInBzZXVkb1wiLCB2YWx1ZTogXCI6aG92ZXJcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJyogKyAucmFuZ2UtbGcgPT4gWyB1bml2ZXJzYWwsIGFkamFjZW50LXNpYmxpbmcsIGNsYXNzIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiKiArIC5yYW5nZS1sZ1wiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJ1bml2ZXJzYWxcIiwgdmFsdWU6IFwiKlwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJhZGphY2VudC1zaWJsaW5nXCIsIHZhbHVlOiBcIiArIFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIucmFuZ2UtbGdcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJy5saXN0LXByb2dyZXNzLWJhcnMgbGkrbGkgPT4gWyBjbGFzcywgZGVzY2VuZGFudCwgdHlwZSwgYWRqYWNlbnQtc2libGluZywgdHlwZSBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIi5saXN0LXByb2dyZXNzLWJhcnMgbGkrbGlcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLmxpc3QtcHJvZ3Jlc3MtYmFyc1wiIH0sXG4gICAgICAgIHsgdHlwZTogXCJkZXNjZW5kYW50XCIsIHZhbHVlOiBcIiBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJsaVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJhZGphY2VudC1zaWJsaW5nXCIsIHZhbHVlOiBcIitcIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJsaVwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnLmxpc3Q+bGkrbGkgPT4gWyBjbGFzcywgY2hpbGQsIHR5cGUsIGFkamFjZW50LXNpYmxpbmcsIHR5cGUgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCIubGlzdD5saStsaVwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIubGlzdFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjaGlsZFwiLCB2YWx1ZTogXCI+XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwibGlcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiYWRqYWNlbnQtc2libGluZ1wiLCB2YWx1ZTogXCIrXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwibGlcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJ2F1ZGlvOm5vdChbY29udHJvbHNdKSA9PiBbIHR5cGUsIHBzZXVkbywgc2NvcGUtc3RhcnQsIGF0dHJpYnV0ZSwgc2NvcGUtZW5kIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiYXVkaW86bm90KFtjb250cm9sc10pXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiYXVkaW9cIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpub3RcIiB9LFxuICAgICAgICB7IHR5cGU6IFwic2NvcGUtc3RhcnRcIiwgdmFsdWU6IFwiKFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJhdHRyaWJ1dGVcIiwgdmFsdWU6IFwiW2NvbnRyb2xzXVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1lbmRcIiwgdmFsdWU6IFwiKVwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc3ZnOm5vdCg6cm9vdCkgPT4gWyB0eXBlLCBwc2V1ZG8sIHNjb3BlLXN0YXJ0LCBwc2V1ZG8sIHNjb3BlLWVuZCBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcInN2Zzpub3QoOnJvb3QpXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwic3ZnXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInBzZXVkb1wiLCB2YWx1ZTogXCI6bm90XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLXN0YXJ0XCIsIHZhbHVlOiBcIihcIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpyb290XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInNjb3BlLWVuZFwiLCB2YWx1ZTogXCIpXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCdidXR0b246Oi1tb3otZm9jdXMtaW5uZXIgPT4gWyB0eXBlLCBwc2V1ZG8gXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCJidXR0b246Oi1tb3otZm9jdXMtaW5uZXJcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJidXR0b25cIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjo6LW1vei1mb2N1cy1pbm5lclwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnaW5wdXRbdHlwZT1cXFwibnVtYmVyXFxcIl06Oi13ZWJraXQtaW5uZXItc3Bpbi1idXR0b24gPT4gWyB0eXBlLCBhdHRyaWJ1dGUsIHBzZXVkbyBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcImlucHV0W3R5cGU9XFxcIm51bWJlclxcXCJdOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiaW5wdXRcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiYXR0cmlidXRlXCIsIHZhbHVlOiBcIlt0eXBlPVxcXCJudW1iZXJcXFwiXVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJwc2V1ZG9cIiwgdmFsdWU6IFwiOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCcqOmJlZm9yZSA9PiBbIHVuaXZlcnNhbCwgcHNldWRvIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiKjpiZWZvcmVcIjtcbiAgICAgIGV4cGVjdGVkUmVzdWx0ID0gW1xuICAgICAgICB7IHR5cGU6IFwidW5pdmVyc2FsXCIsIHZhbHVlOiBcIipcIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpiZWZvcmVcIiB9XG4gICAgICBdO1xuXG4gICAgICBhY3R1YWxSZXN1bHQgPSBjaGVja2VyLnRva2VuaXplKHNvdXJjZSk7XG5cbiAgICAgIGV4cGVjdChhY3R1YWxSZXN1bHQpLnRvRXF1YWwoZXhwZWN0ZWRSZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgaXQoJy5kcm9wdXA+IC5idG4gPi5jYXJldCA9PiBbIGNsYXNzLCBjaGlsZCwgY2xhc3MsIGNoaWxkLCBjbGFzcyBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIi5kcm9wdXA+IC5idG4gPi5jYXJldFwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIuZHJvcHVwXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNoaWxkXCIsIHZhbHVlOiBcIj4gXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5idG5cIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2hpbGRcIiwgdmFsdWU6IFwiID5cIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLmNhcmV0XCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCcudGFibGU+Y2FwdGlvbit0aGVhZD50cjpmaXJzdC1jaGlsZD50ZCA9PiBbIGNsYXNzLCBjaGlsZCwgdHlwZSwgYWRqYWNlbnQtc2libGluZywgdHlwZSwgY2hpbGQsIHR5cGUsIHBzZXVkbywgYWRqYWNlbnQtc2libGluZywgdHlwZSwgXScsICgpID0+IHtcbiAgICAgIGxldCBzb3VyY2UsIGFjdHVhbFJlc3VsdCwgZXhwZWN0ZWRSZXN1bHQsIGNoZWNrZXIgPSBuZXcgU2VsZWN0b3JUb2tlbml6ZXIoKTtcblxuICAgICAgc291cmNlID0gXCIudGFibGU+Y2FwdGlvbit0aGVhZD50cjpmaXJzdC1jaGlsZD50ZFwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIudGFibGVcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2hpbGRcIiwgdmFsdWU6IFwiPlwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImNhcHRpb25cIiB9LFxuICAgICAgICB7IHR5cGU6IFwiYWRqYWNlbnQtc2libGluZ1wiLCB2YWx1ZTogXCIrXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwidGhlYWRcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2hpbGRcIiwgdmFsdWU6IFwiPlwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcInRyXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInBzZXVkb1wiLCB2YWx1ZTogXCI6Zmlyc3QtY2hpbGRcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2hpbGRcIiwgdmFsdWU6IFwiPlwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcInRkXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCcudGFibGUtc3RyaXBlZD50Ym9keT50cjpudGgtb2YtdHlwZShldmVuKSA9PiBbIGNsYXNzLCBjaGlsZCwgdHlwZSwgY2hpbGQsIHR5cGUsIHBzZXVkbywgc2NvcGUtc3RhcnQsIHR5cGUsIHNjb3BlLWVuZCBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIi50YWJsZS1zdHJpcGVkPnRib2R5PnRyOm50aC1vZi10eXBlKGV2ZW4pXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi50YWJsZS1zdHJpcGVkXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImNoaWxkXCIsIHZhbHVlOiBcIj5cIiB9LFxuICAgICAgICB7IHR5cGU6IFwidHlwZVwiLCB2YWx1ZTogXCJ0Ym9keVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjaGlsZFwiLCB2YWx1ZTogXCI+XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwidHJcIiB9LFxuICAgICAgICB7IHR5cGU6IFwicHNldWRvXCIsIHZhbHVlOiBcIjpudGgtb2YtdHlwZVwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1zdGFydFwiLCB2YWx1ZTogXCIoXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwiZXZlblwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJzY29wZS1lbmRcIiwgdmFsdWU6IFwiKVwiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG5cbiAgICBpdCgnaDF+IHAgfnB+LmJ0biA9PiBbIHR5cGUsIGdlbmVyYWwtc2libGluZywgdHlwZSwgZ2VuZXJhbC1zaWJsaW5nLCB0eXBlLCBnZW5lcmFsLXNpYmxpbmcsIGNsYXNzIF0nLCAoKSA9PiB7XG4gICAgICBsZXQgc291cmNlLCBhY3R1YWxSZXN1bHQsIGV4cGVjdGVkUmVzdWx0LCBjaGVja2VyID0gbmV3IFNlbGVjdG9yVG9rZW5pemVyKCk7XG5cbiAgICAgIHNvdXJjZSA9IFwiaDF+IHAgfnB+LmJ0blwiO1xuICAgICAgZXhwZWN0ZWRSZXN1bHQgPSBbXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcImgxXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcImdlbmVyYWwtc2libGluZ1wiLCB2YWx1ZTogXCJ+IFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcInBcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiZ2VuZXJhbC1zaWJsaW5nXCIsIHZhbHVlOiBcIiB+XCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwicFwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJnZW5lcmFsLXNpYmxpbmdcIiwgdmFsdWU6IFwiflwiIH0sXG4gICAgICAgIHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCIuYnRuXCIgfVxuICAgICAgXTtcblxuICAgICAgYWN0dWFsUmVzdWx0ID0gY2hlY2tlci50b2tlbml6ZShzb3VyY2UpO1xuXG4gICAgICBleHBlY3QoYWN0dWFsUmVzdWx0KS50b0VxdWFsKGV4cGVjdGVkUmVzdWx0KTtcbiAgICB9KTtcblxuICAgIGl0KCcuaGFzLWZlZWRiYWNrIGxhYmVsLnNyLW9ubHl+LmZvcm0tY29udHJvbC1mZWVkYmFjayA9PiBbIGNsYXNzLCBkZXNjZW5kYW50LCB0eXBlLCBjbGFzcywgZ2VuZXJhbC1zaWJsaW5nLCBjbGFzcyBdJywgKCkgPT4ge1xuICAgICAgbGV0IHNvdXJjZSwgYWN0dWFsUmVzdWx0LCBleHBlY3RlZFJlc3VsdCwgY2hlY2tlciA9IG5ldyBTZWxlY3RvclRva2VuaXplcigpO1xuXG4gICAgICBzb3VyY2UgPSBcIi5oYXMtZmVlZGJhY2sgbGFiZWwuc3Itb25seX4uZm9ybS1jb250cm9sLWZlZWRiYWNrXCI7XG4gICAgICBleHBlY3RlZFJlc3VsdCA9IFtcbiAgICAgICAgeyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5oYXMtZmVlZGJhY2tcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiZGVzY2VuZGFudFwiLCB2YWx1ZTogXCIgXCIgfSxcbiAgICAgICAgeyB0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwibGFiZWxcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLnNyLW9ubHlcIiB9LFxuICAgICAgICB7IHR5cGU6IFwiZ2VuZXJhbC1zaWJsaW5nXCIsIHZhbHVlOiBcIn5cIiB9LFxuICAgICAgICB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLmZvcm0tY29udHJvbC1mZWVkYmFja1wiIH1cbiAgICAgIF07XG5cbiAgICAgIGFjdHVhbFJlc3VsdCA9IGNoZWNrZXIudG9rZW5pemUoc291cmNlKTtcblxuICAgICAgZXhwZWN0KGFjdHVhbFJlc3VsdCkudG9FcXVhbChleHBlY3RlZFJlc3VsdCk7XG4gICAgfSk7XG4gIH0pO1xufSk7IiwiaW1wb3J0IFwiLi9zcGVjL1NlbGVjdG9yVG9rZW5pemVyU3BlYy5lczZcIjsiXX0=
