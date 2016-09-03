var Sortify = (function() {
	var fs = require('fs'),
		Lexer = require('lex'),
		row = 1,
		previousMatch,
		offenders = [],
		lex;

	_initialize = function(filePath) {
		lex = new Lexer(function() {
			return;
		});

		lex.setInput(fs.readFileSync(filePath, 'utf8'));

		_addRules();

		_process();
	};

	_addRules = function() {
		lex.addRule(/\n/, function () {
			row++;
		}, []);

		lex.addRule(/\t(.*)?/, function(lexeme) {
			if (lexeme.match(/[#{,}]|order:ignore/i)) {
				previousMatch = null;

				return;
			}

			if (previousMatch && previousMatch > lexeme.toLowerCase()) {
				offenders.push({
					row: row - 1,
					prev: previousMatch,
					next: lexeme
				});

				allOkay = false;
			}

			previousMatch = lexeme;
		});

		lex.addRule(/$/, function() {
			_outputResults();
		});
	};

	_process = function() {
		lex.lex();
	};

	_outputResults = function() {
		if (! allOkay) {
			for (var i = 0; i < offenders.length; i++) {
				console.log(
					'----------------------------' + '\n' +
					' Order Error on line ' + offenders[i].row + ':' + '\n' +
					'\t' + offenders[i].prev.trim() + '\n' +
					'\t' + offenders[i].next.trim() + '\n' +
					'----------------------------\n'
				);
			}

			console.log('Total errors found: ' + offenders.length);
		} else {
			console.log('All declarations are in order.');
		}
	};

	return {
		init: _initialize
	}
})();

module.exports = exports = Sortify;

Sortify.init('test.less');