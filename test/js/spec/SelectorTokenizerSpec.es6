import SelectorTokenizer from "../../../src/selector-tokenizer.es6";

describe('SelectorTokenizer', () => {
  describe('tokenize', () => {
    it('.class-name => [ class ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = ".class-name";
      expectedResult = [{ type: "class", value: ".class-name" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('#id => [ id ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "#id";
      expectedResult = [{ type: "id", value: "#id" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('article => [ type ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "article";
      expectedResult = [{ type: "type", value: "article" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[autocomplete] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[autocomplete]";
      expectedResult = [{ type: "attribute", value: "[autocomplete]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[class*=\'unit-\'] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[class*=\'unit-\']";
      expectedResult = [{ type: "attribute", value: "[class*=\'unit-\']" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[lang~="en-us"] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[lang~=\"en-us\"]";
      expectedResult = [{ type: "attribute", value: "[lang~=\"en-us\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[lang=\"pt\"] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[lang=\"pt\"]";
      expectedResult = [{ type: "attribute", value: "[lang=\"pt\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[lang|=\"zh\"] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[lang|=\"zh\"]";
      expectedResult = [{ type: "attribute", value: "[lang|=\"zh\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[href^=\"#\"] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[href^=\"#\"]";
      expectedResult = [{ type: "attribute", value: "[href^=\"#\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[href^=\"\'\.\'\"] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[href^=\"\'\.'\"]";
      expectedResult = [{ type: "attribute", value: "[href^=\"\'\.\'\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[href$=\".cn\"] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[href$=\".cn\"]";
      expectedResult = [{ type: "attribute", value: "[href$=\".cn\"]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[type=\"email\" i] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[type=\"email\" i]";
      expectedResult = [{ type: "attribute", value: "[type=\"email\" i]" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it(':before => [ pseudo ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = ":before";
      expectedResult = [{ type: "pseudo", value: ":before" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('::first-letter => [ pseudo ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "::first-letter";
      expectedResult = [{ type: "pseudo", value: "::first-letter" }];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('a[href*=\"example\"] => [ type, attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "a[href*=\"example\"]";
      expectedResult = [
        { type: "type", value: "a" },
        { type: "attribute", value: "[href*=\"example\"]" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('input::-ms-clear => [ type, pseudo ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "input::-ms-clear";
      expectedResult = [
        { type: "type", value: "input" },
        { type: "pseudo", value: "::-ms-clear" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('html:not(.lt-ie10).classname => [ type, pseudo, scope-start, class, scope-end, class ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "html:not(.lt-ie10).classname";
      expectedResult = [
        { type: "type", value: "html" },
        { type: "pseudo", value: ":not" },
        { type: "scope-start", value: "(" },
        { type: "class", value: ".lt-ie10" },
        { type: "scope-end", value: ")" },
        { type: "class", value: ".classname" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('p:nth-of-type(2n) => [ type, pseudo, scope-start, type, scope-end ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "p:nth-of-type(2n)";
      expectedResult = [
        { type: "type", value: "p" },
        { type: "pseudo", value: ":nth-of-type" },
        { type: "scope-start", value: "(" },
        { type: "type", value: "2n" },
        { type: "scope-end", value: ")" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('[class=\"()\"] => [ attribute ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "[class=\"()\"]";
      expectedResult = [
        { type: "attribute", value: "[class=\"()\"]" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('article   header => [ type, descendant, type ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "article   header";
      expectedResult = [
        { type: "type", value: "article" },
        { type: "descendant", value: "   " },
        { type: "type", value: "header" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it(':not(  .lt-ie10  ) => [ pseudo, scope-start, class, scope-end ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = ":not(  .lt-ie10  )";
      expectedResult = [
        { type: "pseudo", value: ":not" },
        { type: "scope-start", value: "(  " },
        { type: "class", value: ".lt-ie10" },
        { type: "scope-end", value: "  )" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('html:not( .lt-ie10 ) .text-xs-justify => [ type, pseudo, scope-start, .class, scope-end, descendant, class ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "html:not( .lt-ie10 ) .text-xs-justify";
      expectedResult = [
        { type: "type", value: "html" },
        { type: "pseudo", value: ":not" },
        { type: "scope-start", value: "( " },
        { type: "class", value: ".lt-ie10" },
        { type: "scope-end", value: " )" },
        { type: "descendant", value: " " },
        { type: "class", value: ".text-xs-justify" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('html *:first-child => [ type, descendant, universal, pseudo ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "html *:first-child";
      expectedResult = [
        { type: "type", value: "html" },
        { type: "descendant", value: " " },
        { type: "universal", value: "*" },
        { type: "pseudo", value: ":first-child" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('html p a:hover => [ type, descendant, type, descendant, type, pseudo ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "html p a:hover";
      expectedResult = [
        { type: "type", value: "html" },
        { type: "descendant", value: " " },
        { type: "type", value: "p" },
        { type: "descendant", value: " " },
        { type: "type", value: "a" },
        { type: "pseudo", value: ":hover" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('* + .range-lg => [ universal, adjacent-sibling, class ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "* + .range-lg";
      expectedResult = [
        { type: "universal", value: "*" },
        { type: "adjacent-sibling", value: " + " },
        { type: "class", value: ".range-lg" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.list-progress-bars li+li => [ class, descendant, type, adjacent-sibling, type ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = ".list-progress-bars li+li";
      expectedResult = [
        { type: "class", value: ".list-progress-bars" },
        { type: "descendant", value: " " },
        { type: "type", value: "li" },
        { type: "adjacent-sibling", value: "+" },
        { type: "type", value: "li" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.list>li+li => [ class, child, type, adjacent-sibling, type ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = ".list>li+li";
      expectedResult = [
        { type: "class", value: ".list" },
        { type: "child", value: ">" },
        { type: "type", value: "li" },
        { type: "adjacent-sibling", value: "+" },
        { type: "type", value: "li" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('audio:not([controls]) => [ type, pseudo, scope-start, attribute, scope-end ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "audio:not([controls])";
      expectedResult = [
        { type: "type", value: "audio" },
        { type: "pseudo", value: ":not" },
        { type: "scope-start", value: "(" },
        { type: "attribute", value: "[controls]" },
        { type: "scope-end", value: ")" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('svg:not(:root) => [ type, pseudo, scope-start, pseudo, scope-end ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "svg:not(:root)";
      expectedResult = [
        { type: "type", value: "svg" },
        { type: "pseudo", value: ":not" },
        { type: "scope-start", value: "(" },
        { type: "pseudo", value: ":root" },
        { type: "scope-end", value: ")" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('button::-moz-focus-inner => [ type, pseudo ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "button::-moz-focus-inner";
      expectedResult = [
        { type: "type", value: "button" },
        { type: "pseudo", value: "::-moz-focus-inner" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('input[type=\"number\"]::-webkit-inner-spin-button => [ type, attribute, pseudo ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "input[type=\"number\"]::-webkit-inner-spin-button";
      expectedResult = [
        { type: "type", value: "input" },
        { type: "attribute", value: "[type=\"number\"]" },
        { type: "pseudo", value: "::-webkit-inner-spin-button" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('*:before => [ universal, pseudo ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "*:before";
      expectedResult = [
        { type: "universal", value: "*" },
        { type: "pseudo", value: ":before" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.dropup> .btn >.caret => [ class, child, class, child, class ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = ".dropup> .btn >.caret";
      expectedResult = [
        { type: "class", value: ".dropup" },
        { type: "child", value: "> " },
        { type: "class", value: ".btn" },
        { type: "child", value: " >" },
        { type: "class", value: ".caret" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.table>caption+thead>tr:first-child>td => [ class, child, type, adjacent-sibling, type, child, type, pseudo, adjacent-sibling, type, ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = ".table>caption+thead>tr:first-child>td";
      expectedResult = [
        { type: "class", value: ".table" },
        { type: "child", value: ">" },
        { type: "type", value: "caption" },
        { type: "adjacent-sibling", value: "+" },
        { type: "type", value: "thead" },
        { type: "child", value: ">" },
        { type: "type", value: "tr" },
        { type: "pseudo", value: ":first-child" },
        { type: "child", value: ">" },
        { type: "type", value: "td" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.table-striped>tbody>tr:nth-of-type(even) => [ class, child, type, child, type, pseudo, scope-start, type, scope-end ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = ".table-striped>tbody>tr:nth-of-type(even)";
      expectedResult = [
        { type: "class", value: ".table-striped" },
        { type: "child", value: ">" },
        { type: "type", value: "tbody" },
        { type: "child", value: ">" },
        { type: "type", value: "tr" },
        { type: "pseudo", value: ":nth-of-type" },
        { type: "scope-start", value: "(" },
        { type: "type", value: "even" },
        { type: "scope-end", value: ")" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('h1~ p ~p~.btn => [ type, general-sibling, type, general-sibling, type, general-sibling, class ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = "h1~ p ~p~.btn";
      expectedResult = [
        { type: "type", value: "h1" },
        { type: "general-sibling", value: "~ " },
        { type: "type", value: "p" },
        { type: "general-sibling", value: " ~" },
        { type: "type", value: "p" },
        { type: "general-sibling", value: "~" },
        { type: "class", value: ".btn" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });

    it('.has-feedback label.sr-only~.form-control-feedback => [ class, descendant, type, class, general-sibling, class ]', () => {
      let source, actualResult, expectedResult, checker = new SelectorTokenizer();

      source = ".has-feedback label.sr-only~.form-control-feedback";
      expectedResult = [
        { type: "class", value: ".has-feedback" },
        { type: "descendant", value: " " },
        { type: "type", value: "label" },
        { type: "class", value: ".sr-only" },
        { type: "general-sibling", value: "~" },
        { type: "class", value: ".form-control-feedback" }
      ];

      actualResult = checker.tokenize(source);

      expect(actualResult).toEqual(expectedResult);
    });
  });
});