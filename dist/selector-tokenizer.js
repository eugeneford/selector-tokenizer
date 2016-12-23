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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2VsZWN0b3ItdG9rZW5pemVyLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQSxJQUFNLGFBQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLGVBQW9CLEtBQUssVUFBTCxDQUFnQixDQUFoQixDQUExQjtBQUNBLElBQU0sZUFBb0IsS0FBSyxVQUFMLENBQWdCLENBQWhCLENBQTFCO0FBQ0EsSUFBTSxRQUFvQixLQUFLLFVBQUwsQ0FBZ0IsQ0FBaEIsQ0FBMUI7QUFDQSxJQUFNLE9BQW9CLElBQUksVUFBSixDQUFlLENBQWYsQ0FBMUI7QUFDQSxJQUFNLG1CQUFvQixJQUFJLFVBQUosQ0FBZSxDQUFmLENBQTFCO0FBQ0EsSUFBTSxvQkFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sV0FBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sWUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sV0FBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sUUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sY0FBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sY0FBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sZUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sUUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjtBQUNBLElBQU0sYUFBb0IsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUExQjs7QUFFQTs7O0FBR0EsSUFBTSxVQUFVLFNBQVYsT0FBVSxDQUFVLElBQVYsRUFBZ0I7QUFDOUIsU0FBUSxRQUFR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QXRDLEVBQThDLE9BQTlDLEVBQXVEOztBQUVyRDtBQUNBLGdCQUFRLEtBQUssT0FBTCxDQUFhLFlBQWIsRUFBMkIsS0FBM0IsQ0FBUjs7QUFFQTtBQUNBLGdCQUFRLFFBQVEsTUFBTSxLQUFOLENBQVksTUFBcEIsR0FBNkIsQ0FBckM7O0FBRUE7QUFDQSxlQUFPLElBQVAsQ0FBWSxLQUFaO0FBQ0Q7O0FBRUQsYUFBTyxNQUFQO0FBQ0Q7Ozs7OztBQUdIOzs7a0JBdlVxQixpQjtBQXdVckIsSUFBSSxNQUFNLE9BQU8sR0FBUCxJQUFjLEVBQXhCO0FBQ0EsSUFBSSxpQkFBSixHQUF3QixpQkFBeEI7QUFDQSxPQUFPLEdBQVAsR0FBYSxHQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE3IEV1Z2VuZSBGb3JkIChzdG1lY2hhbnVzQGdtYWlsLmNvbSlcbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5IG9mIHRoaXMgc29mdHdhcmVcbiAqIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLFxuICogaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSxcbiAqIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sXG4gKiBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsXG4gKiBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVFxuICogTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuXG4gKiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG4gKiBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkVcbiAqIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmNvbnN0IFdISVRFU1BBQ0UgICAgICAgID0gJyAnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBTSU5HTEVfUVVPVEUgICAgICA9ICdcXFwiJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgRE9VQkxFX1FVT1RFICAgICAgPSAnXFwnJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgU0xBU0ggICAgICAgICAgICAgPSAnXFxcXCcuY2hhckNvZGVBdCgwKTtcbmNvbnN0IEhBU0ggICAgICAgICAgICAgID0gJyMnLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBPUEVOX1BBUkVOVEhFU0VTICA9ICcoJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgQ0xPU0VfUEFSRU5USEVTRVMgPSAnKScuY2hhckNvZGVBdCgwKTtcbmNvbnN0IEFTVEVSSVNLICAgICAgICAgID0gJyonLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBQTFVTX1NJR04gICAgICAgICA9ICcrJy5jaGFyQ29kZUF0KDApO1xuY29uc3QgRE9UX1NJR04gICAgICAgICAgPSAnLicuY2hhckNvZGVBdCgwKTtcbmNvbnN0IENPTE9OICAgICAgICAgICAgID0gJzonLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBSSUdIVF9BTkdMRSAgICAgICA9ICc+Jy5jaGFyQ29kZUF0KDApO1xuY29uc3QgT1BFTl9TUVVBUkUgICAgICAgPSAnWycuY2hhckNvZGVBdCgwKTtcbmNvbnN0IENMT1NFX1NRVUFSRSAgICAgID0gJ10nLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBUSUxERSAgICAgICAgICAgICA9ICd+Jy5jaGFyQ29kZUF0KDApO1xuY29uc3QgRVFVQUxfU0lHTiAgICAgICAgPSAnPScuY2hhckNvZGVBdCgwKTtcblxuLyoqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuY29uc3QgQ0ZfV09SRCA9IGZ1bmN0aW9uIChjb2RlKSB7XG4gIHJldHVybiAoY29kZSA+PSAxMjggfHwgY29kZSA9PT0gNDUgfHwgY29kZSA9PSAyNDUgfHwgKGNvZGUgPj0gNDggJiYgY29kZSA8PSA1NykgfHwgKGNvZGUgPj0gNjUgJiYgY29kZSA8PSA5MCkgfHwgKGNvZGUgPj0gOTcgJiYgY29kZSA8PSAxMjIpKTtcbn07XG5cbi8qKlxuICogVGhlIHNlbGVjdG9yIHRva2VuaXplciBhbGxvd3MgdG8gYnJlYWsgYSBjc3Mgc2VsZWN0b3Igc3RyaW5nIGludG8gc2V0IG9mIHRva2Vucy5cbiAqIFRoZSB0b2tlbml6YXRpb24gbWV0aG9kIGlzIGJhc2VkIG9uIGEgc2V0IG9mIGxleGVyIGdyYW1tYXJzIHJ1bGVzLiBUaGUgZnVsbCBsaXN0IG9mXG4gKiBhdmFpbGFibGUgdG9rZW4gdHlwZXMgaXMgbmV4dDpcbiAqXG4gKiA8dHlwZS1zZWxlY3Rvcj4gLSBmb3IgYmFzaWMgdHlwZSBzZWxlY3RvcnMgZWcuIFwiYXJ0aWNsZVwiLCBcImgxXCIsIFwicFwiIGV0Yy5cbiAqIDxjbGFzcy1zZWxlY3Rvcj4gLSBmb3IgYmFzaWMgY2xhc3Mgc2VsZWN0b3JzIGVnLiBcIi5idXR0b25cIiwgXCIucG9zdFwiLCBldGMuXG4gKiA8dW5pdmVyc2FsLXNlbGVjdG9yPiAtIGZvciBiYXNpYyB1bml2ZXJzYWwgc2VsZWN0b3IgXCIqXCJcbiAqIDxhdHRyaWJ1dGUtc2VsZWN0b3I+IC0gZm9yIGJhc2ljIGF0dHJpYnV0ZSBzZWxlY3RvcnMgZWcuIFwiW2F0dHJdXCIsIFwiW2F0dHI9dmFsXVwiLCBcIlthdHRyXj12YWxdXCIgZXRjLlxuICogPHBzZXVkby1zZWxlY3Rvcj4gLSBmb3IgcHNldWRvLWVsZW1lbnQgYW5kIHBzZXVkby1jbGFzcy1zZWxlY3RvcnMgZWcuIFwiOmZpcnN0LWNoaWxkXCIsIFwiOjpmaXJzdC1sZXR0ZXJcIlxuICogPGRlc2NlbmRhdC1zZWxlY3Rvcj4gLSBmb3Igc2VsZWN0b3IncyBkZXNjZW5kYW50IGNvbWJpbmF0b3IgXCIgXCJcbiAqIDxhZGphY2VudC1zaWJsaW5nLXNlbGVjdG9yPiAtIGZvciBzZWxlY3RvcidzIGFkamFjZW50IHNpYmxpbmcgY29tYmluYXRvciBcIitcIlxuICogPGdlbmVyYWwtc2libGluZy1zZWxlY3Rvcj4gLSBmb3Igc2VsZWN0b3IncyBnZW5lcmFsIHNpYmxpbmcgY29tYmluYXRvciBcIn5cIlxuICogPGNoaWxkLXNlbGVjdG9yPiAtIGZvciBzZWxlY3RvcidzIGNoaWxkIGNvbWJpbmF0b3IgXCI+XCJcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgaWxsdXN0cmF0ZXMgdGhlIHByaW5jaXBsZSB0aGUgU2VsZWN0b3JUb2tlbml6ZXIudG9rZW5pemUgbWV0aG9kXG4gKiBAZXhhbXBsZVxuICogdG9rZW5zID0gdG9rZW5pemVyLnRva2VuaXplKFwiLnBhZ2UgbWFpblwiKTtcbiAqIHRva2VucyAgIC8vPT4gW3t0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5wYWdlXCJ9LCB7dHlwZTogXCJ0eXBlXCIsIHZhbHVlOiBcIm1haW5cIn1dXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdG9yVG9rZW5pemVyIHtcbiAgY29uc3RydWN0b3IoKXt9XG5cbiAgLyoqXG4gICAqIEdldCB0b2tlbiB0eXBlIGJhc2VkIG9uIG9uZSBjaGFyQ29kZSBvbmx5XG4gICAqIEBwYXJhbSBzdGFydENvZGVcbiAgICogQHJldHVybnMge3N0cmluZ31cbiAgICpcbiAgICogQHRocm93cyBTeW50YXhFcnJvciAtIGlmIHRhcmdldCBjaGFyIGNvZGUgd2FzIG5vdCBmb3VuZCBpbiBncmFtbWFyXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIHR5cGUgPSBjaGVja2VyLmdldEluaXRpYWxUb2tlblR5cGUoMzIpO1xuICAgKiB0eXBlICAgLy89PiBcImRlc2NlbmRhbnRcIlxuICAgKi9cbiAgZ2V0SW5pdGlhbFRva2VuVHlwZShzdGFydENvZGUpe1xuICAgIC8vIEZpbmQgdGFyZ2V0IHN0YXJ0Q29kZSBpbiBncmFtbWFyXG4gICAgc3dpdGNoIChzdGFydENvZGUpIHtcbiAgICAgIGNhc2UgV0hJVEVTUEFDRTogICAgICAgICAgcmV0dXJuIFwiZGVzY2VuZGFudFwiO1xuICAgICAgY2FzZSBIQVNIOiAgICAgICAgICAgICAgICByZXR1cm4gXCJpZFwiO1xuICAgICAgY2FzZSBPUEVOX1BBUkVOVEhFU0VTOiAgICByZXR1cm4gXCJzY29wZS1zdGFydFwiO1xuICAgICAgY2FzZSBDTE9TRV9QQVJFTlRIRVNFUzogICByZXR1cm4gXCJzY29wZS1lbmRcIjtcbiAgICAgIGNhc2UgQVNURVJJU0s6ICAgICAgICAgICAgcmV0dXJuIFwidW5pdmVyc2FsXCI7XG4gICAgICBjYXNlIFBMVVNfU0lHTjogICAgICAgICAgIHJldHVybiBcImFkamFjZW50LXNpYmxpbmdcIjtcbiAgICAgIGNhc2UgRE9UX1NJR046ICAgICAgICAgICAgcmV0dXJuIFwiY2xhc3NcIjtcbiAgICAgIGNhc2UgQ09MT046ICAgICAgICAgICAgICAgcmV0dXJuIFwicHNldWRvXCI7XG4gICAgICBjYXNlIFJJR0hUX0FOR0xFOiAgICAgICAgIHJldHVybiBcImNoaWxkXCI7XG4gICAgICBjYXNlIE9QRU5fU1FVQVJFOiAgICAgICAgIHJldHVybiBcImF0dHJpYnV0ZVwiO1xuICAgICAgY2FzZSBUSUxERTogICAgICAgICAgICAgICByZXR1cm4gXCJnZW5lcmFsLXNpYmxpbmdcIjtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChDRl9XT1JEKHN0YXJ0Q29kZSkpIHJldHVybiBcInR5cGVcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIC8vIE9yIHRocm93IGEgc3ludGF4IGVycm9yXG4gICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBcIiR7U3RyaW5nLmZyb21DaGFyQ29kZShzdGFydENvZGUpfVwiYCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgdG9rZW4gdHlwZSB1cGRhdGUgZm9yIG1vcmUgc3BlY2lmaWNpdHkgd2l0aCBhZGRpdGlvbmFsIDMgY2hhciBjb2Rlc1xuICAgKiBOT1RFOiB1c2UgdGhpcyBtZXRob2QgdG8gdXBkYXRlIHRva2UgdHlwZSBvbmx5LiBVc2Uge2dldEluaXRpYWxUb2tlblR5cGV9IG1ldGhvZFxuICAgKiB0byBnZXQgaW5pdGlhbCB0eXBlIG9mIHRhcmdldCB0b2tlblxuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcGFyYW0gc2Vjb25kQ29kZVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfHVuZGVmaW5lZH1cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogdHlwZSA9IGNoZWNrZXIuZ2V0SW5pdGlhbFRva2VuVHlwZSgzMik7XG4gICAqIHR5cGUgICAvLz0+IFwiZGVzY2VuZGFudFwiXG4gICAqIHR5cGUgPSBjaGVja2VyLmdldExhenlUb2tlblR5cGUoMzIsNDEpO1xuICAgKiB0eXBlICAgLy89PiBcInNjb3BlLWVuZFwiXG4gICAqL1xuICBnZXRMYXp5VG9rZW5UeXBlKGZpcnN0Q29kZSwgbmV4dENvZGUsIHNlY29uZENvZGUpe1xuICAgIC8vIENoYW5nZSB0b2tlbiB0eXBlIGlmIGxhenkgPHNjb3BlLWVuZGluZy1wb2ludD4gd2FzIHNwb3R0ZWRcbiAgICBpZiAobmV4dENvZGUgPT09IENMT1NFX1BBUkVOVEhFU0VTICYmIGZpcnN0Q29kZSA9PT0gV0hJVEVTUEFDRSlcbiAgICAgIHJldHVybiBcInNjb3BlLWVuZFwiO1xuXG4gICAgLy8gQ2hhbmdlIHRva2VuIHR5cGUgaWYgbGF6eSA8YWRqYWNlbnQtc2libGluZy1zZWxlY3Rvcj4gd2FzIHNwb3R0ZWRcbiAgICBlbHNlIGlmIChuZXh0Q29kZSA9PT0gUExVU19TSUdOICYmIGZpcnN0Q29kZSA9PT0gV0hJVEVTUEFDRSlcbiAgICAgIHJldHVybiBcImFkamFjZW50LXNpYmxpbmdcIjtcblxuICAgIC8vIENoYW5nZSB0b2tlbiB0eXBlIGlmIGxhenkgPGNoaWxkLXNlbGVjdG9yPiB3YXMgc3BvdHRlZFxuICAgIGVsc2UgaWYgKG5leHRDb2RlID09PSBSSUdIVF9BTkdMRSAmJiBmaXJzdENvZGUgPT09IFdISVRFU1BBQ0UpXG4gICAgICByZXR1cm4gXCJjaGlsZFwiO1xuXG4gICAgLy8gQ2hhbmdlIHRva2VuIHR5cGUgaWYgbGF6eSA8Z2VuZXJhbC1zaWJsaW5nLXNlbGVjdG9yPiB3YXMgc3BvdHRlZFxuICAgIGVsc2UgaWYgKG5leHRDb2RlID09PSBUSUxERSAmJiBmaXJzdENvZGUgPT09IFdISVRFU1BBQ0UpXG4gICAgICByZXR1cm4gXCJnZW5lcmFsLXNpYmxpbmdcIjtcblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxkZXNjZW5kYW50LXNlbGVjdG9yPiB0b2tlbiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHBhcmFtIHdhc0JyYWNlc09wZW5lZFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzRGVzY2VuZGFudEJvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlLCB3YXNCcmFjZXNPcGVuZWQpe1xuICAgIHJldHVybiAhd2FzQnJhY2VzT3BlbmVkICYmIG5leHRDb2RlID09PSBXSElURVNQQUNFICYmIGZpcnN0Q29kZSAhPT0gV0hJVEVTUEFDRVxuICAgICAgJiYgZmlyc3RDb2RlICE9PSBQTFVTX1NJR04gJiYgZmlyc3RDb2RlICE9PSBSSUdIVF9BTkdMRSAmJiBmaXJzdENvZGUgIT09IFRJTERFO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8aWQtc2VsZWN0b3I+IHRva2VuIGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNJZEJvdW5kcyhmaXJzdENvZGUpe1xuICAgIHJldHVybiBmaXJzdENvZGUgPT09IEhBU0g7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxzY29wZS1zdGFydGluZy1wb2ludD4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1Njb3BlU3RhcnRCb3VuZHMoZmlyc3RDb2RlKXtcbiAgICByZXR1cm4gZmlyc3RDb2RlID09PSBPUEVOX1BBUkVOVEhFU0VTXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxzY29wZS1lbmRpbmctcG9pbnQ+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzU2NvcGVFbmRCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSl7XG4gICAgcmV0dXJuIG5leHRDb2RlID09PSBDTE9TRV9QQVJFTlRIRVNFUyAmJiBmaXJzdENvZGUgIT09IFdISVRFU1BBQ0U7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDx1bml2ZXJzYWwtc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVW5pdmVyc2FsQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpe1xuICAgIHJldHVybiBmaXJzdENvZGUgPT09IEFTVEVSSVNLICYmIG5leHRDb2RlICE9PSBFUVVBTF9TSUdOO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8YWRqYWNlbnQtc2libGluZy1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNBZGphY2VudFNpYmxpbmdCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSl7XG4gICAgcmV0dXJuIG5leHRDb2RlID09PSBQTFVTX1NJR04gJiYgZmlyc3RDb2RlICE9PSBXSElURVNQQUNFO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8Y2xhc3Mtc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgaXNDbGFzc0JvdW5kcyhmaXJzdENvZGUpe1xuICAgIHJldHVybiBmaXJzdENvZGUgPT09IERPVF9TSUdOO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8cHNldWRvLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1BzZXVkb0JvdW5kcyhmaXJzdENvZGUsIG5leHRDb2RlKXtcbiAgICByZXR1cm4gbmV4dENvZGUgPT09IENPTE9OICYmIGZpcnN0Q29kZSAhPT0gQ09MT047XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxjaGlsZC1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0NoaWxkQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpe1xuICAgIHJldHVybiBuZXh0Q29kZSA9PT0gUklHSFRfQU5HTEUgJiYgZmlyc3RDb2RlICE9PSBXSElURVNQQUNFO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8YXR0cmlidXRlLXNlbGVjdG9yPiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzQXR0cmlidXRlQm91bmRzKGZpcnN0Q29kZSl7XG4gICAgcmV0dXJuIGZpcnN0Q29kZSA9PT0gT1BFTl9TUVVBUkU7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgZm9yIDxnZW5lcmFsLXNpYmxpbmctc2VsZWN0b3I+IGJvdW5kc1xuICAgKiBAcGFyYW0gZmlyc3RDb2RlXG4gICAqIEBwYXJhbSBuZXh0Q29kZVxuICAgKiBAcGFyYW0gc2Vjb25kQ29kZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzR2VuZXJhbFNpYmxpbmdCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSwgc2Vjb25kQ29kZSl7XG4gICAgcmV0dXJuIG5leHRDb2RlID09PSBUSUxERSAmJiBzZWNvbmRDb2RlICE9PSBFUVVBTF9TSUdOICYmIGZpcnN0Q29kZSAhPSBXSElURVNQQUNFO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciA8dHlwZS1zZWxlY3Rvcj4gYm91bmRzXG4gICAqIEBwYXJhbSBmaXJzdENvZGVcbiAgICogQHBhcmFtIG5leHRDb2RlXG4gICAqIEBwYXJhbSB3YXNCcmFjZXNPcGVuZWRcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc1R5cGVCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSwgd2FzQnJhY2VzT3BlbmVkKXtcbiAgICByZXR1cm4gKGZpcnN0Q29kZSA9PT0gV0hJVEVTUEFDRSB8fCBmaXJzdENvZGUgPT09IFBMVVNfU0lHTiB8fCBmaXJzdENvZGUgPT09IFRJTERFIHx8IGZpcnN0Q29kZSA9PT0gUklHSFRfQU5HTEUpXG4gICAgICAmJiAhd2FzQnJhY2VzT3BlbmVkICYmIENGX1dPUkQobmV4dENvZGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGZvciB0b2tlbiBib3VuZHNcbiAgICogQHBhcmFtIGZpcnN0Q29kZVxuICAgKiBAcGFyYW0gbmV4dENvZGVcbiAgICogQHBhcmFtIHNlY29uZENvZGVcbiAgICogQHBhcmFtIHdhc0JyYWNlc09wZW5lZFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGlzVG9rZW5Cb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSwgc2Vjb25kQ29kZSwgd2FzQnJhY2VzT3BlbmVkKXtcbiAgICByZXR1cm4gdGhpcy5pc0Rlc2NlbmRhbnRCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSwgd2FzQnJhY2VzT3BlbmVkKVxuICAgICAgfHwgdGhpcy5pc0lkQm91bmRzKG5leHRDb2RlKVxuICAgICAgfHwgdGhpcy5pc1Njb3BlU3RhcnRCb3VuZHMobmV4dENvZGUpXG4gICAgICB8fCB0aGlzLmlzU2NvcGVFbmRCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNVbml2ZXJzYWxCb3VuZHMobmV4dENvZGUsIHNlY29uZENvZGUpXG4gICAgICB8fCB0aGlzLmlzQWRqYWNlbnRTaWJsaW5nQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpXG4gICAgICB8fCB0aGlzLmlzQ2xhc3NCb3VuZHMobmV4dENvZGUpXG4gICAgICB8fCB0aGlzLmlzUHNldWRvQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUpXG4gICAgICB8fCB0aGlzLmlzQ2hpbGRCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSlcbiAgICAgIHx8IHRoaXMuaXNBdHRyaWJ1dGVCb3VuZHMobmV4dENvZGUpXG4gICAgICB8fCB0aGlzLmlzR2VuZXJhbFNpYmxpbmdCb3VuZHMoZmlyc3RDb2RlLCBuZXh0Q29kZSwgc2Vjb25kQ29kZSlcbiAgICAgIHx8IHRoaXMuaXNUeXBlQm91bmRzKGZpcnN0Q29kZSwgbmV4dENvZGUsIHdhc0JyYWNlc09wZW5lZClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkIGEgZ3JhbW1hciB0b2tlbiBmcm9tIGEgc3RyaW5nIHN0YXJ0aW5nIGF0IHRhcmdldCBwb3NpdGlvblxuICAgKiBAcGFyYW0gc2VsZWN0b3JUZXh0IC0gYSBzdHJpbmcgY29udGFpbmluZyBjc3MgdGV4dCB0byByZWFkIGEgdG9rZW4gZnJvbVxuICAgKiBAcGFyYW0gc3RhcnRJbmRleCAtIHBvc2l0aW9uIHRvIHN0YXJ0IHJlYWQgYSB0b2tlbiBhdFxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKlxuICAgKiBAdGhyb3dzIFN5bnRheEVycm9yIC0gaWYgYW4gdW5rbm93biBjaGFyYWN0ZXIgd2FzIGZvdW5kIGluIHByb2Nlc3NcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogdG9rZW4gPSBjaGVja2VyLnRva2VuQXQoXCIuY2xhc3NuYW1lXCIsIDApO1xuICAgKiB0b2tlbiAgIC8vPT4geyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIi5jbGFzc25hbWVcIiB9XG4gICAqL1xuICB0b2tlbkF0KHNlbGVjdG9yVGV4dCwgc3RhcnRJbmRleCl7XG4gICAgbGV0IHNpemUgPSAxLCBzdGFydENvZGUgPSBzZWxlY3RvclRleHQuY29kZVBvaW50QXQoc3RhcnRJbmRleCksXG4gICAgICB0eXBlLCB0b2tlbiwgbmV4dENvZGUsIG5leHRJbmRleCwgcHJldkNvZGUsIHNlY29uZENvZGUsIG9wZW5CcmFjZXMsXG4gICAgICBvcGVuUXVvdGVzLCBwZW51bHRDb2RlO1xuXG4gICAgLy8gR2V0IGluaXRpYWwgdG9rZW4gdHlwZVxuICAgIHR5cGUgPSB0aGlzLmdldEluaXRpYWxUb2tlblR5cGUoc3RhcnRDb2RlKTtcblxuICAgIC8vIFNldCBpbml0aWFsIHN0YXRlIGZvciBuZXh0Q29kZVxuICAgIG5leHRJbmRleCA9IHN0YXJ0SW5kZXggKyBzaXplO1xuICAgIHByZXZDb2RlID0gc3RhcnRDb2RlO1xuICAgIG5leHRDb2RlID0gc2VsZWN0b3JUZXh0LmNvZGVQb2ludEF0KG5leHRJbmRleCk7XG4gICAgc2Vjb25kQ29kZSA9IHNlbGVjdG9yVGV4dC5jb2RlUG9pbnRBdChuZXh0SW5kZXggKyAxKTtcbiAgICBvcGVuQnJhY2VzID0gc3RhcnRDb2RlID09PSBPUEVOX1NRVUFSRTtcblxuICAgIC8vIENoZWNrIGZvciA8c2NvcGUtc3RhcnRpbmctcG9pbnRlcj4gb3IgPHNjb3BlLWVuZGluZy1wb2ludGVyPlxuICAgIGlmICggcHJldkNvZGUgPT09IE9QRU5fUEFSRU5USEVTRVMgIHx8IHByZXZDb2RlID09PSBDTE9TRV9QQVJFTlRIRVNFUyl7XG4gICAgICB3aGlsZSAobmV4dENvZGUgPT09IFdISVRFU1BBQ0UpIHtcbiAgICAgICAgbmV4dENvZGUgPSBzZWxlY3RvclRleHQuY29kZVBvaW50QXQoKytzaXplICsgc3RhcnRJbmRleClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gV2hpbGUgbm90IEVPRlxuICAgICAgd2hpbGUgKG5leHRJbmRleCA8IHNlbGVjdG9yVGV4dC5sZW5ndGgpIHtcbiAgICAgICAgaWYgKCFvcGVuUXVvdGVzKXtcblxuICAgICAgICAgIC8vIEdldCBhIHRva2VuIHR5cGUgdXBkYXRlIG9yIHVzZSB0aGUgbGFzdCBvbmVcbiAgICAgICAgICB0eXBlID0gdGhpcy5nZXRMYXp5VG9rZW5UeXBlKHByZXZDb2RlLCBuZXh0Q29kZSwgc2Vjb25kQ29kZSkgfHwgdHlwZTtcblxuICAgICAgICAgIC8vIEJyZWFrIGlmIG5leHQgdG9rZW4gc3BvdHRlZFxuICAgICAgICAgIGlmICggdGhpcy5pc1Rva2VuQm91bmRzKHByZXZDb2RlLCBuZXh0Q29kZSwgc2Vjb25kQ29kZSwgb3BlbkJyYWNlcykpIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IGNvZGVzIGZvciBuZXh0IGl0ZXJhdGlvblxuICAgICAgICBzaXplKys7XG4gICAgICAgIG5leHRJbmRleCA9IHNpemUgKyBzdGFydEluZGV4O1xuICAgICAgICBwZW51bHRDb2RlID0gcHJldkNvZGU7XG4gICAgICAgIHByZXZDb2RlID0gbmV4dENvZGU7XG4gICAgICAgIG5leHRDb2RlID0gc2VsZWN0b3JUZXh0LmNvZGVQb2ludEF0KG5leHRJbmRleCk7XG4gICAgICAgIHNlY29uZENvZGUgPSBzZWxlY3RvclRleHQuY29kZVBvaW50QXQobmV4dEluZGV4ICsgMSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgXCIgb3IgJyB3YXMgc3BvdHRlZCB3aXRob3V0IGVzY2FwZSBcXFxuICAgICAgICBpZiAocHJldkNvZGUgIT09IFNMQVNIICYmIChuZXh0Q29kZSA9PT0gU0lOR0xFX1FVT1RFIHx8IG5leHRDb2RlID09IERPVUJMRV9RVU9URSkpIHtcbiAgICAgICAgICBpZiAoISFvcGVuUXVvdGVzKSB7XG4gICAgICAgICAgICBpZiAobmV4dENvZGUgPT09IG9wZW5RdW90ZXMpIG9wZW5RdW90ZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9wZW5RdW90ZXMgPSBuZXh0Q29kZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9wZW5RdW90ZXMpIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiBbIHdhcyBzcG90dGVkXG4gICAgICAgICAgaWYgKG5leHRDb2RlID09PSBPUEVOX1NRVUFSRSkge1xuICAgICAgICAgICAgaWYgKG9wZW5CcmFjZXMpIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgXCIke3NlbGVjdG9yVGV4dFtuZXh0SW5kZXhdfVwiIGF0ICR7bmV4dEluZGV4fSBwb3NpdGlvbmApO1xuICAgICAgICAgICAgb3BlbkJyYWNlcyA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgXSB3YXMgc3BvdHRlZFxuICAgICAgICAgIGlmIChuZXh0Q29kZSA9PT0gQ0xPU0VfU1FVQVJFKSB7XG4gICAgICAgICAgICBpZiAoIW9wZW5CcmFjZXMpIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgXCIke3NlbGVjdG9yVGV4dFtuZXh0SW5kZXhdfVwiIGF0ICR7bmV4dEluZGV4fSBwb3NpdGlvbmApO1xuICAgICAgICAgICAgb3BlbkJyYWNlcyA9IGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENoZWNrIGZvciB0cmlwbGUgY29sb24gOjo6IHBhcnNlIGVycm9yXG4gICAgICAgICAgaWYgKENPTE9OID09PSBwZW51bHRDb2RlID09PSBwcmV2Q29kZSA9PT0gbmV4dENvZGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgXCIke3NlbGVjdG9yVGV4dFtuZXh0SW5kZXhdfVwiIGF0ICR7bmV4dEluZGV4fSBwb3NpdGlvbmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIHRva2VuXG4gICAgdG9rZW4gPSB7IHR5cGUsIHZhbHVlOiBzZWxlY3RvclRleHQuc3Vic3RyKHN0YXJ0SW5kZXgsIHNpemUpIH07XG5cbiAgICByZXR1cm4gdG9rZW47XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgc2V0IG9mIHRva2VucyBmcm9tIHRhcmdldCBzZWxlY3RvciBzdHJpbmdcbiAgICogQHBhcmFtIHNlbGVjdG9yVGV4dFxuICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAqL1xuICB0b2tlbml6ZShzZWxlY3RvclRleHQpe1xuICAgIGxldCB0b2tlbnMgPSBbXSwgaW5kZXgsIHRva2VuO1xuXG4gICAgLy8gTG9vcCB0aHJvdWdoIHNlbGVjdG9yVGV4dCBjaGFyIGNvZGVzXG4gICAgZm9yICggaW5kZXggPSAwOyBpbmRleCA8IHNlbGVjdG9yVGV4dC5sZW5ndGg7IGluZGV4KyspIHtcblxuICAgICAgLy8gQ3JlYXRlIGEgdG9rZW5cbiAgICAgIHRva2VuID0gdGhpcy50b2tlbkF0KHNlbGVjdG9yVGV4dCwgaW5kZXgpO1xuXG4gICAgICAvLyBTaGlmdCBsb29wIHBvaW50ZXIgYnkgdG9rZW4gc2l6ZVxuICAgICAgaW5kZXggPSBpbmRleCArIHRva2VuLnZhbHVlLmxlbmd0aCAtIDE7XG5cbiAgICAgIC8vIEFkZCB0b2tlbiB0byB0b2tlbnNMaXN0XG4gICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxufVxuXG4vLyBFeHBvcnQgdG8gZ2xvYmFsIHNjb3BlXG5sZXQgbGliID0gd2luZG93LmxpYiB8fCB7fTtcbmxpYi5TZWxlY3RvclRva2VuaXplciA9IFNlbGVjdG9yVG9rZW5pemVyO1xud2luZG93LmxpYiA9IGxpYjsiXX0=
