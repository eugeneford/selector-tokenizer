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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2VsZWN0b3ItdG9rZW5pemVyLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxJQUFNLGFBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGVBQW9CLEtBQUssVUFBTCxDQUFnQixDQUFoQixDQUExQjtBQUNBLElBQU0sZUFBb0IsS0FBSyxVQUFMLENBQWdCLENBQWhCLENBQTFCO0FBQ0EsSUFBTSxRQUFvQixLQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FBMUI7QUFDQSxJQUFNLE9BQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLG1CQUFvQixJQUFJLFVBQUosQ0FBZSxDQUFmLENBQTFCO0FBQ0EsSUFBTSxvQkFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sV0FBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sWUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sV0FBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sUUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sY0FBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sY0FBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sZUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sUUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sYUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjs7QUFFQTs7O0FBR0EsSUFBTSxVQUFVLFNBQVYsT0FBVSxDQUFVLElBQVYsRUFBZ0I7QUFDOUIsU0FBUSxRQUFR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QyxFQUE4QyxPQUE5QyxFQUF1RDs7QUFFckQ7QUFDQSxnQkFBUSxLQUFLLE9BQUwsQ0FBYSxZQUFiLEVBQTJCLEtBQTNCLENBQVI7O0FBRUE7QUFDQSxnQkFBUSxRQUFRLE1BQU0sS0FBTixDQUFZLE1BQXBCLEdBQTZCLENBQXJDOztBQUVBO0FBQ0EsZUFBTyxJQUFQLENBQVksS0FBWjtBQUNEOztBQUVELGFBQU8sTUFBUDtBQUNEOzs7Ozs7a0JBR1ksaUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgRXVnZW5lIEZvcmQgKHN0bWVjaGFudXNAZ21haWwuY29tKVxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZVxuICogYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sXG4gKiBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLFxuICogYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbyxcbiAqIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWxcbiAqIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UXG4gKiBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbiAqIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbiAqIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRVxuICogT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4gKi9cblxuY29uc3QgV0hJVEVTUEFDRSAgICAgICAgPSAnICcuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFNJTkdMRV9RVU9URSAgICAgID0gJ1xcXCInLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBET1VCTEVfUVVPVEUgICAgICA9ICdcXCcnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBTTEFTSCAgICAgICAgICAgICA9ICdcXFxcJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgSEFTSCAgICAgICAgICAgICAgPSAnIycuY2hhckNvZGVBdCgwKTtcbmNvbnN0IE9QRU5fUEFSRU5USEVTRVMgID0gJygnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBDTE9TRV9QQVJFTlRIRVNFUyA9ICcpJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQVNURVJJU0sgICAgICAgICAgPSAnKicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFBMVVNfU0lHTiAgICAgICAgID0gJysnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBET1RfU0lHTiAgICAgICAgICA9ICcuJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQ09MT04gICAgICAgICAgICAgPSAnOicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFJJR0hUX0FOR0xFICAgICAgID0gJz4nLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBPUEVOX1NRVUFSRSAgICAgICA9ICdbJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQ0xPU0VfU1FVQVJFICAgICAgPSAnXScuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFRJTERFICAgICAgICAgICAgID0gJ34nLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBFUVVBTF9TSUdOICAgICAgICA9ICc9Jy5jaGFyQ29kZUF0KDApO1xuXG4vKipcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5jb25zdCBDRl9XT1JEID0gZnVuY3Rpb24gKGNvZGUpIHtcbiAgcmV0dXJuIChjb2RlID49IDEyOCB8fCBjb2RlID09PSA0NSB8fCBjb2RlID09IDI0NSB8fCAoY29kZSA+PSA0OCAmJiBjb2RlIDw9IDU3KSB8fCAoY29kZSA+PSA2NSAmJiBjb2RlIDw9IDkwKSB8fCAoY29kZSA+PSA5NyAmJiBjb2RlIDw9IDEyMikpO1xufTtcblxuLyoqXG4gKiBUaGUgc2VsZWN0b3IgdG9rZW5pemVyIGFsbG93cyB0byBicmVhayBhIGNzcyBzZWxlY3RvciBzdHJpbmcgaW50byBzZXQgb2YgdG9rZW5zLlxuICogVGhlIHRva2VuaXphdGlvbiBtZXRob2QgaXMgYmFzZWQgb24gYSBzZXQgb2YgbGV4ZXIgZ3JhbW1hcnMgcnVsZXMuIFRoZSBmdWxsIGxpc3Qgb2ZcbiAqIGF2YWlsYWJsZSB0b2tlbiB0eXBlcyBpcyBuZXh0OlxuICpcbiAqIDx0eXBlLXNlbGVjdG9yPiAtIGZvciBiYXNpYyB0eXBlIHNlbGVjdG9ycyBlZy4gXCJhcnRpY2xlXCIsIFwiaDFcIiwgXCJwXCIgZXRjLlxuICogPGNsYXNzLXNlbGVjdG9yPiAtIGZvciBiYXNpYyBjbGFzcyBzZWxlY3RvcnMgZWcuIFwiLmJ1dHRvblwiLCBcIi5wb3N0XCIsIGV0Yy5cbiAqIDx1bml2ZXJzYWwtc2VsZWN0b3I+IC0gZm9yIGJhc2ljIHVuaXZlcnNhbCBzZWxlY3RvciBcIipcIlxuICogPGF0dHJpYnV0ZS1zZWxlY3Rvcj4gLSBmb3IgYmFzaWMgYXR0cmlidXRlIHNlbGVjdG9ycyBlZy4gXCJbYXR0cl1cIiwgXCJbYXR0cj12YWxdXCIsIFwiW2F0dHJePXZhbF1cIiBldGMuXG4gKiA8cHNldWRvLXNlbGVjdG9yPiAtIGZvciBwc2V1ZG8tZWxlbWVudCBhbmQgcHNldWRvLWNsYXNzLXNlbGVjdG9ycyBlZy4gXCI6Zmlyc3QtY2hpbGRcIiwgXCI6OmZpcnN0LWxldHRlclwiXG4gKiA8ZGVzY2VuZGF0LXNlbGVjdG9yPiAtIGZvciBzZWxlY3RvcidzIGRlc2NlbmRhbnQgY29tYmluYXRvciBcIiBcIlxuICogPGFkamFjZW50LXNpYmxpbmctc2VsZWN0b3I+IC0gZm9yIHNlbGVjdG9yJ3MgYWRqYWNlbnQgc2libGluZyBjb21iaW5hdG9yIFwiK1wiXG4gKiA8Z2VuZXJhbC1zaWJsaW5nLXNlbGVjdG9yPiAtIGZvciBzZWxlY3RvcidzIGdlbmVyYWwgc2libGluZyBjb21iaW5hdG9yIFwiflwiXG4gKiA8Y2hpbGQtc2VsZWN0b3I+IC0gZm9yIHNlbGVjdG9yJ3MgY2hpbGQgY29tYmluYXRvciBcIj5cIlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBpbGx1c3RyYXRlcyB0aGUgcHJpbmNpcGxlIHRoZSBTZWxlY3RvclRva2VuaXplci50b2tlbml6ZSBtZXRob2RcbiAqIEBleGFtcGxlXG4gKiB0b2tlbnMgPSB0b2tlbml6ZXIudG9rZW5pemUoXCIucGFnZSBtYWluXCIpO1xuICogdG9rZW5zICAgLy89PiBbe3R5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLnBhZ2VcIn0sIHt0eXBlOiBcInR5cGVcIiwgdmFsdWU6IFwibWFpblwifV1cbiAqL1xuY2xhc3MgU2VsZWN0b3JUb2tlbml6ZXIge1xuICBjb25zdHJ1Y3Rvcigpe31cblxuICAvKipcbiAgICogR2V0IHRva2VuIHR5cGUgYmFzZWQgb24gb25lIGNoYXJDb2RlIG9ubHlcbiAgICogQHBhcmFtIHN0YXJ0Q29kZVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKlxuICAgKiBAdGhyb3dzIFN5bnRheEVycm9yIC0gaWYgdGFyZ2V0IGNoYXIgY29kZSB3YXMgbm90IGZvdW5kIGluIGdyYW1tYXJcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogdHlwZSA9IGNoZWNrZXIuZ2V0SW5pdGlhbFRva2VuVHlwZSgzMik7XG4gICAqIHR5cGUgICAvLz0+IFwiZGVzY2VuZGFudFwiXG4gICAqL1xuICBnZXRJbml0aWFsVG9rZW5UeXBlKHN0YXJ0Q29kZSl7XG4gICAgLy8gRmluZCB0YXJnZXQgc3RhcnRDb2RlIGluIGdyYW1tYXJcbiAgICBzd2l0Y2ggKHN0YXJ0Q29kZSkge1xuICAgICAgY2FzZSBXSElURVNQQUNFOiAgICAgICAgICByZXR1cm4gXCJkZXNjZW5kYW50XCI7XG4gICAgICBjYXNlIEhBU0g6ICAgICAgICAgICAgICAgIHJldHVybiBcImlkXCI7XG4gICAgICBjYXNlIE9QRU5fUEFSRU5USEVTRVM6ICAgIHJldHVybiBcInNjb3BlLXN0YXJ0XCI7XG4gICAgICBjYXNlIENMT1NFX1BBUkVOVEhFU0VTOiAgIHJldHVybiBcInNjb3BlLWVuZFwiO1xuICAgICAgY2FzZSBBU1RFUklTSzogICAgICAgICAgICByZXR1cm4gXCJ1bml2ZXJzYWxcIjtcbiAgICAgIGNhc2UgUExVU19TSUdOOiAgICAgICAgICAgcmV0dXJuIFwiYWRqYWNlbnQtc2libGluZ1wiO1xuICAgICAgY2FzZSBET1RfU0lHTjogICAgICAgICAgICByZXR1cm4gXCJjbGFzc1wiO1xuICAgICAgY2FzZSBDT0xPTjogICAgICAgICAgICAgICByZXR1cm4gXCJwc2V1ZG9cIjtcbiAgICAgIGNhc2UgUklHSFRfQU5HTEU6ICAgICAgICAgcmV0dXJuIFwiY2hpbGRcIjtcbiAgICAgIGNhc2UgT1BFTl9TUVVBUkU6ICAgICAgICAgcmV0dXJuIFwiYXR0cmlidXRlXCI7XG4gICAgICBjYXNlIFRJTERFOiAgICAgICAgICAgICAgIHJldHVybiBcImdlbmVyYWwtc2libGluZ1wiO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKENGX1dPUkQoc3RhcnRDb2RlKSkgcmV0dXJuIFwidHlwZVwiO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgLy8gT3IgdGhyb3cgYSBzeW50YXggZXJyb3JcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIFwiJHtTdHJpbmcuZnJvbUNoYXJDb2RlKHN0YXJ0Q29kZSl9XCJgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSB0b2tlbiB0eXBlIHVwZGF0ZSBmb3IgbW9yZSBzcGVjaWZpY2l0eSB3aXRoIGFkZGl0aW9uYWwgMyBjaGFyIGNvZGVzXG4gICAqIE5PVEU6IHVzZSB0aGlzIG1ldGhvZCB0byB1cGRhdGUgdG9rZSB0eXBlIG9ubHkuIFVzZSB7Z2V0SW5pdGlhbFRva2VuVHlwZX0gbWV0aG9kXG4gICAqIHRvIGdldCBpbml0aWFsIHR5cGUgb2YgdGFyZ2V0IHRva2VuXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEBwYXJhbSBzZWNvbmRDb2RlXG4gICAqIEByZXR1cm5zIHtzdHJpbmd8dW5kZWZpbmVkfVxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB0eXBlID0gY2hlY2tlci5nZXRJbml0aWFsVG9rZW5UeXBlKDMyKTtcbiAgICogdHlwZSAgIC8vPT4gXCJkZXNjZW5kYW50XCJcbiAgICogdHlwZSA9IGNoZWNrZXIuZ2V0TGF6eVRva2VuVHlwZSgzMiw0MSk7XG4gICAqIHR5cGUgICAvLz0+IFwic2NvcGUtZW5kXCJcbiAgICovXG4gIGdldExhenlUb2tlblR5cGUoZmlyc3RDb2RlLCBuZXh0Q29kZSwgc2Vjb25kQ29kZSl7XG4gICAgLy8gQ2hhbmdlIHRva2VuIHR5cGUgaWYgbGF6eSA8c2NvcGUtZW5kaW5nLXBvaW50PiB3YXMgc3BvdHRlZFxuICAgIGlmIChuZXh0Q29kZSA9PT0gQ0xPU0VfUEFSRU5USEVTRVMgJiYgZmlyc3RDb2RlID09PSBXSElURVNQQUNFKVxuICAgICAgcmV0dXJuIFwic2NvcGUtZW5kXCI7XG5cbiAgICAvLyBDaGFuZ2UgdG9rZW4gdHlwZSBpZiBsYXp5IDxhZGphY2VudC1zaWJsaW5nLXNlbGVjdG9yPiB3YXMgc3BvdHRlZFxuICAgIGVsc2UgaWYgKG5leHRDb2RlID09PSBQTFVTX1NJR04gJiYgZmlyc3RDb2RlID09PSBXSElURVNQQUNFKVxuICAgICAgcmV0dXJuIFwiYWRqYWNlbnQtc2libGluZ1wiO1xuXG4gICAgLy8gQ2hhbmdlIHRva2VuIHR5cGUgaWYgbGF6eSA8Y2hpbGQtc2VsZWN0b3I+IHdhcyBzcG90dGVkXG4gICAgZWxzZSBpZiAobmV4dENvZGUgPT09IFJJR0hUX0FOR0xFICYmIGZpcnN0Q29kZSA9PT0gV0hJVEVTUEFDRSlcbiAgICAgIHJldHVybiBcImNoaWxkXCI7XG5cbiAgICAvLyBDaGFuZ2UgdG9rZW4gdHlwZSBpZiBsYXp5IDxnZW5lcmFsLXNpYmxpbmctc2VsZWN0b3I+IHdhcyBzcG90dGVkXG4gICAgZWxzZSBpZiAobmV4dENvZGUgPT09IFRJTERFICYmIGZpcnN0Q29kZSA9PT0gV0hJVEVTUEFDRSlcbiAgICAgIHJldHVybiBcImdlbmVyYWwtc2libGluZ1wiO1xuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGRlc2NlbmRhbnQtc2VsZWN0b3I+IHRva2VuIGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcGFyYW0gd2FzQnJhY2VzT3BlbmVkXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNEZXNjZW5kYW50Qm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUsIHdhc0JyYWNlc09wZW5lZCl7XG4gICAgcmV0dXJuICF3YXNCcmFjZXNPcGVuZWQgJiYgbmV4dENvZGUgPT09IFdISVRFU1BBQ0UgJiYgZmlyc3RDb2RlICE9PSBXSElURVNQQUNFXG4gICAgICAmJiBmaXJzdENvZGUgIT09IFBMVVNfU0lHTiAmJiBmaXJzdENvZGUgIT09IFJJR0hUX0FOR0xFICYmIGZpcnN0Q29kZSAhPT0gVElMREU7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxpZC1zZWxlY3Rvcj4gdG9rZW4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0lkQm91bmRzKGZpcnN0Q29kZSl7XG4gICAgcmV0dXJuIGZpcnN0Q29kZSA9PT0gSEFTSDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPHNjb3BlLXN0YXJ0aW5nLXBvaW50PiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU2NvcGVTdGFydEJvdW5kcyhmaXJzdENvZGUpe1xuICAgIHJldHVybiBmaXJzdENvZGUgPT09IE9QRU5fUEFSRU5USEVTRVNcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPHNjb3BlLWVuZGluZy1wb2ludD4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNTY29wZUVuZEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKXtcbiAgICByZXR1cm4gbmV4dENvZGUgPT09IENMT1NFX1BBUkVOVEhFU0VTICYmIGZpcnN0Q29kZSAhPT0gV0hJVEVTUEFDRTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPHVuaXZlcnNhbC1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNVbml2ZXJzYWxCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSl7XG4gICAgcmV0dXJuIGZpcnN0Q29kZSA9PT0gQVNURVJJU0sgJiYgbmV4dENvZGUgIT09IEVRVUFMX1NJR047XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxhZGphY2VudC1zaWJsaW5nLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0FkamFjZW50U2libGluZ0JvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKXtcbiAgICByZXR1cm4gbmV4dENvZGUgPT09IFBMVVNfU0lHTiAmJiBmaXJzdENvZGUgIT09IFdISVRFU1BBQ0U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxjbGFzcy1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0NsYXNzQm91bmRzKGZpcnN0Q29kZSl7XG4gICAgcmV0dXJuIGZpcnN0Q29kZSA9PT0gRE9UX1NJR047XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxwc2V1ZG8tc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzUHNldWRvQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpe1xuICAgIHJldHVybiBuZXh0Q29kZSA9PT0gQ09MT04gJiYgZmlyc3RDb2RlICE9PSBDT0xPTjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGNoaWxkLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQ2hpbGRCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSl7XG4gICAgcmV0dXJuIG5leHRDb2RlID09PSBSSUdIVF9BTkdMRSAmJiBmaXJzdENvZGUgIT09IFdISVRFU1BBQ0U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxhdHRyaWJ1dGUtc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNBdHRyaWJ1dGVCb3VuZHMoZmlyc3RDb2RlKXtcbiAgICByZXR1cm4gZmlyc3RDb2RlID09PSBPUEVOX1NRVUFSRTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBmb3IgPGdlbmVyYWwtc2libGluZy1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEBwYXJhbSBzZWNvbmRDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNHZW5lcmFsU2libGluZ0JvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlKXtcbiAgICByZXR1cm4gbmV4dENvZGUgPT09IFRJTERFICYmIHNlY29uZENvZGUgIT09IEVRVUFMX1NJR04gJiYgZmlyc3RDb2RlICE9IFdISVRFU1BBQ0U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDx0eXBlLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHBhcmFtIHdhc0JyYWNlc09wZW5lZFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVHlwZUJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCB3YXNCcmFjZXNPcGVuZWQpe1xuICAgIHJldHVybiAoZmlyc3RDb2RlID09PSBXSElURVNQQUNFIHx8IGZpcnN0Q29kZSA9PT0gUExVU19TSUdOIHx8IGZpcnN0Q29kZSA9PT0gVElMREUgfHwgZmlyc3RDb2RlID09PSBSSUdIVF9BTkdMRSlcbiAgICAgICYmICF3YXNCcmFjZXNPcGVuZWQgJiYgQ0ZfV09SRChuZXh0Q29kZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIHRva2VuIGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcGFyYW0gc2Vjb25kQ29kZVxuICAgKiBAcGFyYW0gd2FzQnJhY2VzT3BlbmVkXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNUb2tlbkJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlLCB3YXNCcmFjZXNPcGVuZWQpe1xuICAgIHJldHVybiB0aGlzLmlzRGVzY2VuZGFudEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCB3YXNCcmFjZXNPcGVuZWQpXG4gICAgICB8fCB0aGlzLmlzSWRCb3VuZHMobmV4dENvZGUpXG4gICAgICB8fCB0aGlzLmlzU2NvcGVTdGFydEJvdW5kcyhuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNTY29wZUVuZEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc1VuaXZlcnNhbEJvdW5kcyhuZXh0Q29kZSwgc2Vjb25kQ29kZSlcbiAgICAgIHx8IHRoaXMuaXNBZGphY2VudFNpYmxpbmdCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNDbGFzc0JvdW5kcyhuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNQc2V1ZG9Cb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNDaGlsZEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc0F0dHJpYnV0ZUJvdW5kcyhuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNHZW5lcmFsU2libGluZ0JvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlKVxuICAgICAgfHwgdGhpcy5pc1R5cGVCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSwgd2FzQnJhY2VzT3BlbmVkKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWQgYSBncmFtbWFyIHRva2VuIGZyb20gYSBzdHJpbmcgc3RhcnRpbmcgYXQgdGFyZ2V0IHBvc2l0aW9uXG4gICAqIEBwYXJhbSBzZWxlY3RvclRleHQgLSBhIHN0cmluZyBjb250YWluaW5nIGNzcyB0ZXh0IHRvIHJlYWQgYSB0b2tlbiBmcm9tXG4gICAqIEBwYXJhbSBzdGFydEluZGV4IC0gcG9zaXRpb24gdG8gc3RhcnQgcmVhZCBhIHRva2VuIGF0XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqXG4gICAqIEB0aHJvd3MgU3ludGF4RXJyb3IgLSBpZiBhbiB1bmtub3duIGNoYXJhY3RlciB3YXMgZm91bmQgaW4gcHJvY2Vzc1xuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiB0b2tlbiA9IGNoZWNrZXIudG9rZW5BdChcIi5jbGFzc25hbWVcIiwgMCk7XG4gICAqIHRva2VuICAgLy89PiB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiLmNsYXNzbmFtZVwiIH1cbiAgICovXG4gIHRva2VuQXQoc2VsZWN0b3JUZXh0LCBzdGFydEluZGV4KXtcbiAgICBsZXQgc2l6ZSA9IDEsIHN0YXJ0Q29kZSA9IHNlbGVjdG9yVGV4dC5jb2RlUG9pbnRBdChzdGFydEluZGV4KSxcbiAgICAgIHR5cGUsIHRva2VuLCBuZXh0Q29kZSwgbmV4dEluZGV4LCBwcmV2Q29kZSwgc2Vjb25kQ29kZSwgb3BlbkJyYWNlcyxcbiAgICAgIG9wZW5RdW90ZXMsIHBlbnVsdENvZGU7XG5cbiAgICAvLyBHZXQgaW5pdGlhbCB0b2tlbiB0eXBlXG4gICAgdHlwZSA9IHRoaXMuZ2V0SW5pdGlhbFRva2VuVHlwZShzdGFydENvZGUpO1xuXG4gICAgLy8gU2V0IGluaXRpYWwgc3RhdGUgZm9yIG5leHRDb2RlXG4gICAgbmV4dEluZGV4ID0gc3RhcnRJbmRleCArIHNpemU7XG4gICAgcHJldkNvZGUgPSBzdGFydENvZGU7XG4gICAgbmV4dENvZGUgPSBzZWxlY3RvclRleHQuY29kZVBvaW50QXQobmV4dEluZGV4KTtcbiAgICBzZWNvbmRDb2RlID0gc2VsZWN0b3JUZXh0LmNvZGVQb2ludEF0KG5leHRJbmRleCArIDEpO1xuICAgIG9wZW5CcmFjZXMgPSBzdGFydENvZGUgPT09IE9QRU5fU1FVQVJFO1xuXG4gICAgLy8gQ2hlY2sgZm9yIDxzY29wZS1zdGFydGluZy1wb2ludGVyPiBvciA8c2NvcGUtZW5kaW5nLXBvaW50ZXI+XG4gICAgaWYgKCBwcmV2Q29kZSA9PT0gT1BFTl9QQVJFTlRIRVNFUyAgfHwgcHJldkNvZGUgPT09IENMT1NFX1BBUkVOVEhFU0VTKXtcbiAgICAgIHdoaWxlIChuZXh0Q29kZSA9PT0gV0hJVEVTUEFDRSkge1xuICAgICAgICBuZXh0Q29kZSA9IHNlbGVjdG9yVGV4dC5jb2RlUG9pbnRBdCgrK3NpemUgKyBzdGFydEluZGV4KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBXaGlsZSBub3QgRU9GXG4gICAgICB3aGlsZSAobmV4dEluZGV4IDwgc2VsZWN0b3JUZXh0Lmxlbmd0aCkge1xuICAgICAgICBpZiAoIW9wZW5RdW90ZXMpe1xuXG4gICAgICAgICAgLy8gR2V0IGEgdG9rZW4gdHlwZSB1cGRhdGUgb3IgdXNlIHRoZSBsYXN0IG9uZVxuICAgICAgICAgIHR5cGUgPSB0aGlzLmdldExhenlUb2tlblR5cGUocHJldkNvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlKSB8fCB0eXBlO1xuXG4gICAgICAgICAgLy8gQnJlYWsgaWYgbmV4dCB0b2tlbiBzcG90dGVkXG4gICAgICAgICAgaWYgKCB0aGlzLmlzVG9rZW5Cb3VuZHMocHJldkNvZGUsIG5leHRDb2RlLCBzZWNvbmRDb2RlLCBvcGVuQnJhY2VzKSkgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgY29kZXMgZm9yIG5leHQgaXRlcmF0aW9uXG4gICAgICAgIHNpemUrKztcbiAgICAgICAgbmV4dEluZGV4ID0gc2l6ZSArIHN0YXJ0SW5kZXg7XG4gICAgICAgIHBlbnVsdENvZGUgPSBwcmV2Q29kZTtcbiAgICAgICAgcHJldkNvZGUgPSBuZXh0Q29kZTtcbiAgICAgICAgbmV4dENvZGUgPSBzZWxlY3RvclRleHQuY29kZVBvaW50QXQobmV4dEluZGV4KTtcbiAgICAgICAgc2Vjb25kQ29kZSA9IHNlbGVjdG9yVGV4dC5jb2RlUG9pbnRBdChuZXh0SW5kZXggKyAxKTtcblxuICAgICAgICAvLyBDaGVjayBpZiBcIiBvciAnIHdhcyBzcG90dGVkIHdpdGhvdXQgZXNjYXBlIFxcXG4gICAgICAgIGlmIChwcmV2Q29kZSAhPT0gU0xBU0ggJiYgKG5leHRDb2RlID09PSBTSU5HTEVfUVVPVEUgfHwgbmV4dENvZGUgPT0gRE9VQkxFX1FVT1RFKSkge1xuICAgICAgICAgIGlmICghIW9wZW5RdW90ZXMpIHtcbiAgICAgICAgICAgIGlmIChuZXh0Q29kZSA9PT0gb3BlblF1b3Rlcykgb3BlblF1b3RlcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3BlblF1b3RlcyA9IG5leHRDb2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb3BlblF1b3Rlcykge1xuICAgICAgICAgIC8vIENoZWNrIGlmIFsgd2FzIHNwb3R0ZWRcbiAgICAgICAgICBpZiAobmV4dENvZGUgPT09IE9QRU5fU1FVQVJFKSB7XG4gICAgICAgICAgICBpZiAob3BlbkJyYWNlcykgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBcIiR7c2VsZWN0b3JUZXh0W25leHRJbmRleF19XCIgYXQgJHtuZXh0SW5kZXh9IHBvc2l0aW9uYCk7XG4gICAgICAgICAgICBvcGVuQnJhY2VzID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBdIHdhcyBzcG90dGVkXG4gICAgICAgICAgaWYgKG5leHRDb2RlID09PSBDTE9TRV9TUVVBUkUpIHtcbiAgICAgICAgICAgIGlmICghb3BlbkJyYWNlcykgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBcIiR7c2VsZWN0b3JUZXh0W25leHRJbmRleF19XCIgYXQgJHtuZXh0SW5kZXh9IHBvc2l0aW9uYCk7XG4gICAgICAgICAgICBvcGVuQnJhY2VzID0gZmFsc2U7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHRyaXBsZSBjb2xvbiA6OjogcGFyc2UgZXJyb3JcbiAgICAgICAgICBpZiAoQ09MT04gPT09IHBlbnVsdENvZGUgPT09IHByZXZDb2RlID09PSBuZXh0Q29kZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBcIiR7c2VsZWN0b3JUZXh0W25leHRJbmRleF19XCIgYXQgJHtuZXh0SW5kZXh9IHBvc2l0aW9uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgdG9rZW5cbiAgICB0b2tlbiA9IHsgdHlwZSwgdmFsdWU6IHNlbGVjdG9yVGV4dC5zdWJzdHIoc3RhcnRJbmRleCwgc2l6ZSkgfTtcblxuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBzZXQgb2YgdG9rZW5zIGZyb20gdGFyZ2V0IHNlbGVjdG9yIHN0cmluZ1xuICAgKiBAcGFyYW0gc2VsZWN0b3JUZXh0XG4gICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICovXG4gIHRva2VuaXplKHNlbGVjdG9yVGV4dCl7XG4gICAgbGV0IHRva2VucyA9IFtdLCBpbmRleCwgdG9rZW47XG5cbiAgICAvLyBMb29wIHRocm91Z2ggc2VsZWN0b3JUZXh0IGNoYXIgY29kZXNcbiAgICBmb3IgKCBpbmRleCA9IDA7IGluZGV4IDwgc2VsZWN0b3JUZXh0Lmxlbmd0aDsgaW5kZXgrKykge1xuXG4gICAgICAvLyBDcmVhdGUgYSB0b2tlblxuICAgICAgdG9rZW4gPSB0aGlzLnRva2VuQXQoc2VsZWN0b3JUZXh0LCBpbmRleCk7XG5cbiAgICAgIC8vIFNoaWZ0IGxvb3AgcG9pbnRlciBieSB0b2tlbiBzaXplXG4gICAgICBpbmRleCA9IGluZGV4ICsgdG9rZW4udmFsdWUubGVuZ3RoIC0gMTtcblxuICAgICAgLy8gQWRkIHRva2VuIHRvIHRva2Vuc0xpc3RcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlbGVjdG9yVG9rZW5pemVyOyJdfQ==
