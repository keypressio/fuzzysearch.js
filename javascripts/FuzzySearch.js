/**
 * FuzzySearch.js
 * 
 * Originally found in Google DevTools, cleaned
 * up, and made into an easy to use function.
 *
 * Copyright (C) 2013 Google Inc. All rights Reserved.
 * See LICENSE for more information.
 * 
 * Modified by Michael Day <michael.lance.day@gmail.com>
 * 
 * Github: http://www.github.com/subtexteditor/fuzzysearch.js
 * Original Code: http://bit.ly/1moBPD8
 */
(function(window, undefined){
	var list = null,
		results = [],
		indexResults = [],
		_filterTimer,
		_scoringTimer,
		_selectedIndexInFiltered,
		_query,
		filteredItems = [],
		filterRegex;

	var filterItems = function(query, haystack) {
		var query = query.trim(),
			queryLength = query.length,
			filterRegex = query ? FilePathScoreFunction.filterRegex(query) : null,
			oldSelectedAbsoluteIndex = this._selectedIndexInFiltered ? this._filteredItems[this._selectedIndexInFiltered] : null,
			bestScores = [],
			bestItems = [],
			bestItemsToCollect = 100,
			minBestScore = 0,
			overflowItems = [];

		var scoreItems = function(fromIndex) {
			var maxWorkItems = 1000;
			var workDone = 0,
			score,
			index,
			i;

			for (i = fromIndex, _len = list.length; i < _len && workDone < maxWorkItems; ++i) {
				if (filterRegex && !filterRegex.test(list[i])) {
					continue;
				}

				score = itemScoreAt(i, _query);

				if (_query) {
					workDone++;
				}

				if (score > minBestScore || bestScores.length < bestItemsToCollect) {
					index = insertionIndexForObjectInListSortedByFunction(score, bestScores, compareIntegers, true);

					bestScores.splice(index, 0, score);
					bestItems.splice(index, 0, i);

					if (bestScores.length > bestItemsToCollect) {
						overflowItems.push(peekLast(bestItems));
						bestScores.length = bestItemsToCollect;
						bestItems.length = bestItemsToCollect;
					}

					minBestScore = peekLast(bestScores); // bestScores is an array // 
					results.push({item: list[i], index: i, score: score});
					indexResults.push({index: i, score: score});
				} else {
					filteredItems.push(list[i]);
				}
			}

			if (i < list.length) {
				_scoringTimer = setTimeout(scoreItems.bind(this, i), 0);
				return;
			}

			delete _scoringTimer;
			
			_filteredItems = bestItems.concat(overflowItems).concat(filteredItems);

			for (i = 0; i < _filteredItems.length; ++i) {
				if (_filteredItems[i] === oldSelectedAbsoluteIndex) {
					_selectedIndexInFiltered = i;
					break;
				}
			}

			if (!_query) {
				_selectedIndexInFiltered = 0;
			}
		}

		list = haystack;

		delete _filterTimer;

		if (_scoringTimer) {
		    clearTimeout(_scoringTimer);
		    delete _scoringTimer;
		}
			
		_selectedIndexInFiltered = 0;
		_query = query;

		scoreItems.call(this, 0);
	}

	var lowerBound = function(arr, object, comparator) {
		var l, r, m;

		function defaultComparator(a, b) {
			return a < b ? -1 : (a > b ? 1 : 0);
		}

		comparator = comparator || defaultComparator;

		l = 0;
		r = arr.length;

		while (l < r) {
			m = (l + r) >> 1;

			if (comparator(object, arr[m]) > 0) {
				l = m + 1;
			} else {
				r = m;
			}
		}

		return r;
	}

	var upperBound = function(arr, object, comparator) {
		function defaultComparator(a, b)  {
			return a < b ? -1 : (a > b ? 1 : 0);
		}

		comparator = comparator || defaultComparator;

		var l = 0;
		var r = arr.length;

		while (l < r) {
			var m = (l + r) >> 1;

			if (comparator(object, arr[m]) >= 0) {
				l = m + 1;
			} else {
				r = m;
			}
		}

		return r;
	}

	var peekLast = function(arr) {
		return arr[arr.length - 1];
	}

	var compareIntegers = function(a, b) {
		return b - a;
	}

	var insertionIndexForObjectInListSortedByFunction = function(object, list, comparator, insertionIndexAfter) {
		if (insertionIndexAfter) {
			return upperBound(list, object, comparator);
		} else {
			return lowerBound(list, object, comparator);
		}
	}

	var regexSpecialCharacters = function() {
		return "^[]{}()\\.$*+?|-,";
	}

	var itemScoreAt = function(itemIndex, query) {
		var item = list[itemIndex],
			_scorer,
			score = 0,
			path;
		
		if (!query || query.length < 2) {
			return score;
		} else {
			_scorer = new FilePathScoreFunction(query);
		}

		return score + 10 * _scorer.score(item, null);
	}

	var FilePathScoreFunction = function(query) {
		this._query = query;
		this._queryUpperCase = query.toUpperCase();
		this._score = null;
		this._sequence = null;
		this._dataUpperCase = "";
		this._fileNameIndex = 0;
	}

	FilePathScoreFunction.filterRegex = function(query) {
		const toEscape = regexSpecialCharacters();

		var regexString = "",
			i, c;

		for (i = 0; i < query.length; ++i) {
			c = query.charAt(i);
			
			if (toEscape.indexOf(c) !== -1) {
				c = "\\" + c;
			}

			if (i) {
				regexString += "[^" + c + "]*";
			}

			regexString += c;
		}
		return new RegExp(regexString, "i");
	}

	FilePathScoreFunction.prototype = {
		score: function(data, matchIndexes) {
			var score,
				sequence,
				n, m, i, j,
				skipCharScore,
				prevCharScore,
				consecutiveMatch,
				pickCharScore;

			if (!data || !this._query) {
				return 0;
			}

			n = this._query.length;
			m = data.length;

			if (!this._score || this._score.length < n * m) {
				this._score = new Int32Array(n * m * 2);
				this._sequence = new Int32Array(n * m * 2);
			}

			score = this._score;
			sequence = this._sequence;

			this._dataUpperCase = data.toUpperCase();
			this._fileNameIndex = data.lastIndexOf("/");

			for (i = 0; i < n; ++i) {
				for (j = 0; j < m; ++j) {
					skipCharScore = j === 0 ? 0 : score[i * m + j - 1];
					prevCharScore = i === 0 || j === 0 ? 0 : score[(i - 1) * m + j - 1];
					consecutiveMatch = i === 0 || j === 0 ? 0 : sequence[(i - 1) * m + j - 1];
					pickCharScore = this._match(this._query, data, i, j, consecutiveMatch);

					if (pickCharScore && prevCharScore + pickCharScore > skipCharScore) {
						sequence[i * m + j] = consecutiveMatch + 1;
						score[i * m + j] = (prevCharScore + pickCharScore);
					} else {
						sequence[i * m + j] = 0;
						score[i * m + j] = skipCharScore;
					}
				}
			}

			if (matchIndexes) {
				this._restoreMatchIndexes(sequence, n, m, matchIndexes);
			}

			return score[n * m - 1];
		},
		_testWordStart: function(data, j) {
			var prevChar = data.charAt(j - 1);

			return j === 0 || prevChar === "_" || prevChar === "-" || prevChar === "/" || (data[j - 1] !== this._dataUpperCase[j - 1] && data[j] === this._dataUpperCase[j]);
		},
		_restoreMatchIndexes: function(sequence, n, m, out) {
			var i = n - 1, j = m - 1;

			while (i >= 0 && j >= 0) {
				switch (sequence[i * m + j]) {
					case 0:
						--j;
						break;

					default:
						out.push(j);
						--i;
						--j;
						break;
				}
			}

			out.reverse();
		},
		_singleCharScore: function(query, data, i, j) {
			var isWordStart = this._testWordStart(data, j),
				isFileName = j > this._fileNameIndex,
				isPathTokenStart = j === 0 || data[j - 1] === "/",
				isCapsMatch = query[i] === data[j] && query[i] == this._queryUpperCase[i];
				score = 10;

			if (isPathTokenStart) {
				score += 4;
			}

			if (isWordStart) {
				score += 2;
			}

			if (isCapsMatch) {
				score += 6;
			}

			if (isFileName) {
				score += 4;
			}

			if (j === this._fileNameIndex + 1 && i === 0) {
				score += 5;
			}

			if (isFileName && isWordStart) {
				score += 3;
			}

			return score;
		},
		_sequenceCharScore: function(query, data, i, j, sequenceLength) {
			var isFileName = j > this._fileNameIndex,
				isPathTokenStart = j === 0 || data[j - 1] === "/",
				score = 10;

			if (isFileName) {
				score += 4;
			}

			if (isPathTokenStart) {
				score += 5;
			}

			score += sequenceLength * 4;

			return score;
		},
		_match: function(query, data, i, j, consecutiveMatch) {
			if (this._queryUpperCase[i] !== this._dataUpperCase[j]) {
				return 0;
			}

			if (!consecutiveMatch) {
				return this._singleCharScore(query, data, i, j);
			} else {
				return this._sequenceCharScore(query, data, i, j - consecutiveMatch, consecutiveMatch);
			}
		}
	};

	FuzzySearch = function(needle, haystack){
		results = [];
		filterItems(needle, haystack);

		results.sort(function(a, b){
			return b.score - a.score;
		});

		return results;
	}

	window.FuzzySearch = FuzzySearch;
})(window);