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

const WHITESPACE        = ' '.charCodeAt(0);
const SINGLE_QUOTE      = '\"'.charCodeAt(0);
const DOUBLE_QUOTE      = '\''.charCodeAt(0);
const SLASH             = '\\'.charCodeAt(0);
const HASH              = '#'.charCodeAt(0);
const OPEN_PARENTHESES  = '('.charCodeAt(0);
const CLOSE_PARENTHESES = ')'.charCodeAt(0);
const ASTERISK          = '*'.charCodeAt(0);
const PLUS_SIGN         = '+'.charCodeAt(0);
const DOT_SIGN          = '.'.charCodeAt(0);
const COLON             = ':'.charCodeAt(0);
const RIGHT_ANGLE       = '>'.charCodeAt(0);
const OPEN_SQUARE       = '['.charCodeAt(0);
const CLOSE_SQUARE      = ']'.charCodeAt(0);
const TILDE             = '~'.charCodeAt(0);
const EQUAL_SIGN        = '='.charCodeAt(0);

/**
 * @returns {boolean}
 */
const CF_WORD = function (code) {
  return (code >= 128 || code === 45 || code == 245 || (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122));
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
 * <descendant-selector> - for selector's descendant combinator " "
 * <adjacent-sibling-selector> - for selector's adjacent sibling combinator "+"
 * <general-sibling-selector> - for selector's general sibling combinator "~"
 * <child-selector> - for selector's child combinator ">"
 *
 * The following example illustrates the principle the SelectorTokenizer.tokenize method
 * @example
 * tokens = tokenizer.tokenize(".page main");
 * tokens   //=> [{type: "class", value: ".page"}, {type: "type", value: "main"}]
 */
class SelectorTokenizer {
  constructor(){}

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
  getInitialTokenType(startCode){
    // Find target startCode in grammar
    switch (startCode) {
      case WHITESPACE:          return "descendant";
      case HASH:                return "id";
      case OPEN_PARENTHESES:    return "scope-start";
      case CLOSE_PARENTHESES:   return "scope-end";
      case ASTERISK:            return "universal";
      case PLUS_SIGN:           return "adjacent-sibling";
      case DOT_SIGN:            return "class";
      case COLON:               return "pseudo";
      case RIGHT_ANGLE:         return "child";
      case OPEN_SQUARE:         return "attribute";
      case TILDE:               return "general-sibling";
      default:
        if (CF_WORD(startCode)) return "type";
        break;
    }
    // Or throw a syntax error
    throw new SyntaxError(`Unexpected character "${String.fromCharCode(startCode)}"`);
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
  getLazyTokenType(firstCode, nextCode, secondCode){
    // Change token type if lazy <scope-ending-point> was spotted
    if (nextCode === CLOSE_PARENTHESES && firstCode === WHITESPACE)
      return "scope-end";

    // Change token type if lazy <adjacent-sibling-selector> was spotted
    else if (nextCode === PLUS_SIGN && firstCode === WHITESPACE)
      return "adjacent-sibling";

    // Change token type if lazy <child-selector> was spotted
    else if (nextCode === RIGHT_ANGLE && firstCode === WHITESPACE)
      return "child";

    // Change token type if lazy <general-sibling-selector> was spotted
    else if (nextCode === TILDE && firstCode === WHITESPACE)
      return "general-sibling";

    return undefined;
  }

  /**
   * Check for <descendant-selector> token bounds
   * @param firstCode
   * @param nextCode
   * @param wasBracesOpened
   * @returns {boolean}
   */
  isDescendantBounds(firstCode, nextCode, wasBracesOpened){
    return !wasBracesOpened && nextCode === WHITESPACE && firstCode !== WHITESPACE
      && firstCode !== PLUS_SIGN && firstCode !== RIGHT_ANGLE && firstCode !== TILDE;
  }

  /**
   * Check for <id-selector> token bounds
   * @param firstCode
   * @returns {boolean}
   */
  isIdBounds(firstCode){
    return firstCode === HASH;
  }

  /**
   * Check for <scope-starting-point> bounds
   * @param firstCode
   * @returns {boolean}
   */
  isScopeStartBounds(firstCode){
    return firstCode === OPEN_PARENTHESES
  }

  /**
   * Check for <scope-ending-point> bounds
   * @param firstCode
   * @param nextCode
   * @returns {boolean}
   */
  isScopeEndBounds(firstCode, nextCode){
    return nextCode === CLOSE_PARENTHESES && firstCode !== WHITESPACE;
  }

  /**
   * Check for <universal-selector> bounds
   * @param firstCode
   * @param nextCode
   * @returns {boolean}
   */
  isUniversalBounds(firstCode, nextCode){
    return firstCode === ASTERISK && nextCode !== EQUAL_SIGN;
  }

  /**
   * Check for <adjacent-sibling-selector> bounds
   * @param firstCode
   * @param nextCode
   * @returns {boolean}
   */
  isAdjacentSiblingBounds(firstCode, nextCode){
    return nextCode === PLUS_SIGN && firstCode !== WHITESPACE;
  }

  /**
   * Check for <class-selector> bounds
   * @param firstCode
   * @returns {boolean}
   */
  isClassBounds(firstCode){
    return firstCode === DOT_SIGN;
  }

  /**
   * Check for <pseudo-selector> bounds
   * @param firstCode
   * @param nextCode
   * @returns {boolean}
   */
  isPseudoBounds(firstCode, nextCode){
    return nextCode === COLON && firstCode !== COLON;
  }

  /**
   * Check for <child-selector> bounds
   * @param firstCode
   * @returns {boolean}
   */
  isChildBounds(firstCode, nextCode){
    return nextCode === RIGHT_ANGLE && firstCode !== WHITESPACE;
  }

  /**
   * Check for <attribute-selector> bounds
   * @param firstCode
   * @returns {boolean}
   */
  isAttributeBounds(firstCode){
    return firstCode === OPEN_SQUARE;
  }

  /**
   * Check for <general-sibling-selector> bounds
   * @param firstCode
   * @param nextCode
   * @param secondCode
   * @returns {boolean}
   */
  isGeneralSiblingBounds(firstCode, nextCode, secondCode){
    return nextCode === TILDE && secondCode !== EQUAL_SIGN && firstCode != WHITESPACE;
  }

  /**
   * Check for <type-selector> bounds
   * @param firstCode
   * @param nextCode
   * @param wasBracesOpened
   * @returns {boolean}
   */
  isTypeBounds(firstCode, nextCode, wasBracesOpened){
    return (firstCode === WHITESPACE || firstCode === PLUS_SIGN || firstCode === TILDE || firstCode === RIGHT_ANGLE)
      && !wasBracesOpened && CF_WORD(nextCode);
  }

  /**
   * Check for token bounds
   * @param firstCode
   * @param nextCode
   * @param secondCode
   * @param wasBracesOpened
   * @returns {boolean}
   */
  isTokenBounds(firstCode, nextCode, secondCode, wasBracesOpened){
    return this.isDescendantBounds(firstCode, nextCode, wasBracesOpened)
      || this.isIdBounds(nextCode)
      || this.isScopeStartBounds(nextCode)
      || this.isScopeEndBounds(firstCode, nextCode)
      || this.isUniversalBounds(nextCode, secondCode)
      || this.isAdjacentSiblingBounds(firstCode, nextCode)
      || this.isClassBounds(nextCode)
      || this.isPseudoBounds(firstCode, nextCode)
      || this.isChildBounds(firstCode, nextCode)
      || this.isAttributeBounds(nextCode)
      || this.isGeneralSiblingBounds(firstCode, nextCode, secondCode)
      || this.isTypeBounds(firstCode, nextCode, wasBracesOpened)
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
  tokenAt(selectorText, startIndex){
    let size = 1, startCode = selectorText.codePointAt(startIndex),
      type, token, nextCode, nextIndex, prevCode, secondCode, openBraces,
      openQuotes, penultCode;

    // Get initial token type
    type = this.getInitialTokenType(startCode);

    // Set initial state for nextCode
    nextIndex = startIndex + size;
    prevCode = startCode;
    nextCode = selectorText.codePointAt(nextIndex);
    secondCode = selectorText.codePointAt(nextIndex + 1);
    openBraces = startCode === OPEN_SQUARE;

    // Check for <scope-starting-pointer> or <scope-ending-pointer>
    if ( prevCode === OPEN_PARENTHESES  || prevCode === CLOSE_PARENTHESES){
      while (nextCode === WHITESPACE) {
        nextCode = selectorText.codePointAt(++size + startIndex)
      }
    } else {
      // While not EOF
      while (nextIndex < selectorText.length) {
        if (!openQuotes){

          // Get a token type update or use the last one
          type = this.getLazyTokenType(prevCode, nextCode, secondCode) || type;

          // Break if next token spotted
          if ( this.isTokenBounds(prevCode, nextCode, secondCode, openBraces)) break;
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
            if (openBraces) throw new SyntaxError(`Unexpected character "${selectorText[nextIndex]}" at ${nextIndex} position`);
            openBraces = true;
          }

          // Check if ] was spotted
          if (nextCode === CLOSE_SQUARE) {
            if (!openBraces) throw new SyntaxError(`Unexpected character "${selectorText[nextIndex]}" at ${nextIndex} position`);
            openBraces = false;
          }

          // Check for triple colon ::: parse error
          if (COLON === penultCode === prevCode === nextCode) {
            throw new SyntaxError(`Unexpected character "${selectorText[nextIndex]}" at ${nextIndex} position`);
          }
        }
      }
    }

    // Create a token
    token = { type, value: selectorText.substr(startIndex, size) };

    return token;
  }

  /**
   * Create a set of tokens from target selector string
   * @param selectorText
   * @returns {Array}
   */
  tokenize(selectorText){
    let tokens = [], index, token;

    // Loop through selectorText char codes
    for ( index = 0; index < selectorText.length; index++) {

      // Create a token
      token = this.tokenAt(selectorText, index);

      // Shift loop pointer by token size
      index = index + token.value.length - 1;

      // Add token to tokensList
      tokens.push(token);
    }

    return tokens;
  }
}

export default SelectorTokenizer;
