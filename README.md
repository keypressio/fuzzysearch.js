## FuzzySearch.js

FuzzySearch.js is a small javascript function that can be used to do a fuzzy search on a list of items. For example, if you have a list of file names, and you want to search through them.

## Usage

```javascript
var results = FuzzySearch(needle, haystack);
```

Where ```needle``` is what you want to search for and ```haystack``` is an array of strings to be searched. FuzzySearch returns an array of objects. Each object contains the index (used for sorting), the item itself, and a score.

For example, if you started with the following list:

```json
names = [
	"Kobe Bryant, SG, Lakers",
	"LeBron James, SF, Cavaliers",
	"Dwyane Wade, SG, Heat",
	"Dwight Howard, C, Magic",
	"Tim Duncan, PF, Spurs",
	"Chris Paul, PG, Hornets",
	"Kevin Garnett, PF, Celtics",
	"Dirk Nowitzki, PF, Mavericks",
	"Anthony, SF, Nuggets",
	"Paul Pierce, SF, Celtics",
	"Steve Nash, PG, Suns",
	"Deron Williams, PG, Jazz",
	"Tony Parker, PG, Spurs",
	"Brandon Roy, SG, Trail Blazers",
	"Yao Ming, C, Rockets",
	"Shaquille O'Neal, C, Cavaliers",
	"Pau Gasol, PF, Lakers",
	"Chris Bosh, PF, Raptors",
	"Amare Stoudemire, PF, Suns",
	"Chauncey Billups, PG, Nuggets"
]
```

The following searches would provide the following results:

```javascript
FuzzySearch('kobelakers', names);

// [
//   {
//     "item": "Kobe Bryant, SG, Lakers",
//     "index": 0,
//     "score": 2530
//   }
// ]
```

```javascript
FuzzySearch('t pg', names);

// [
//   {
//     "item": "Tony Parker, PG, Spurs",
//     "index": 12,
//     "score": 850
//   },
//   {
//     "item": "Steve Nash, PG, Suns",
//     "index": 10,
//     "score": 710
//   }
// ]
```

```javascript
FuzzySearch('lkrs', names);

// [
//   {
//     "item": "Kobe Bryant, SG, Lakers",
//     "index": 0,
//     "score": 600
//   },
//   {
//     "item": "Pau Gasol, PF, Lakers",
//     "index": 16,
//     "score": 600
//   }
// ]
```

## Contributing

Pull requests to this repository are welcome. 

However, the bulk of this function was originally written by Google for the Chrome DevTools. While not necessary, If you make any changes to the fundamental filtering parts of this function, consider contributing to the Chrome DevTools as well. The original code can be found in [this file](https://chromium.googlesource.com/chromium/blink/+/master/Source/devtools/front_end/sources/FilePathScoreFunction.js), and instructions on contributing to Chrome DevTools are [here](https://developer.chrome.com/devtools/docs/contributing)
