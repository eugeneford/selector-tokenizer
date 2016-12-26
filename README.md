# Selector Tokenizer
Module for fast css selector tokenization from string

[![NPM](https://nodei.co/npm/selector-tokenizer.png?downloads=true)](https://nodei.co/npm/selector-tokenizer/)

## What does this repo about

The selector tokenizer allows to break a css selector string into set of tokens. 

The tokenization method is based on a set of lexer grammars rules. The full list of available token types is next:

 * \<type-selector> - for basic type selectors eg. "article", "h1", "p" etc.
 * \<class-selector> - for basic class selectors eg. ".button", ".post", etc.
 * \<universal-selector> - for basic universal selector "*"
 * \<attribute-selector> - for basic attribute selectors eg. "[attr]", "[attr=val]", "[attr^=val]" etc.
 * \<pseudo-selector> - for pseudo-element and pseudo-class-selectors eg. ":first-child", "::first-letter"
 * \<descendat-selector> - for selector's descendant combinator " "
 * \<adjacent-sibling-selector> - for selector's adjacent sibling combinator "+"
 * \<general-sibling-selector> - for selector's general sibling combinator "~"
 * \<child-selector> - for selector's child combinator ">"
 * \<scope-start> - to match the start of tokenization scopes ()
 * \<scope-end> - to match the end of tokenization scopes ()

## How to use

### Basic Example
The following example illustrates the principle the SelectorTokenizer.tokenize method
```javascript
tokenizer = new SelectorTokenizer();
tokens = tokenizer.tokenize(".page main");
tokens   //=> [{type: "class", value: ".page"}, {type: "descendant", value: " "}, {type: "type", value: "main"}]
```

### Methods
SelectorTokenizer has a set of different methods you can find to be useful.

##### tokenize(selectorText);
Create a set of tokens from target selector string
```javascript
tokenizer = new SelectorTokenizer();
tokens = tokenizer.tokenize(".page main");
tokens   //=> [{type: "class", value: ".page"}, {type: "descendant", value: " "}, {type: "type", value: "main"}]
```

##### tokenAt(selectorText, startIndex);
Read a grammar token from a string starting at target position. 

```javascript
tokenizer = new SelectorTokenizer();
token = tokenizer.tokenAt(".classname", 0); 
token   //=> { type: "class", value: ".classname" }
```

### Building
```javascript
npm install
```

### Development and Testing
* `npm run gulp` will launch dist building 
* `npm run watch` will launch a watcher for dist building 
* `npm run test` will launch unit-test building 
* `npm run test-watch` will launch a watcher for unit-test building 

## License

It's all about MIT stuff. (C) 2017 Eugene Ford 