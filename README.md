# dataset-metadata

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

a class to manipulate metadata for statistical analysis

## Installation

`$ npm i dataset-metadata`

## [API Documentation](https://mljs.github.io/dataset-metadata/)

## Examples

to import the package use
```js
const METADATA = require('dataset-metadata');
```

or 
```js
import { METADATA } from 'ml-dataset-metadata';
```

to create a metadata object use
```js
import { getClasses } from 'ml-dataset-iris';
const metadata = getClasses();
let L = new METADATA([metadata], { headers: ['iris'] });
```
this will create an array with the class of the famous iris dataset and create a METADATA object L.

List all the available metadata
```js
L.list()
```
returns an array with all the metadata headers.

Retrieve information (number of classes, counts for each classes) about a particular metadata using
```js
L.get('iris');
```

Retrieve values of a particular metadata as a Matrix object. This will coerce any string class into a Matrix of number with first class being "0", second being "1", etc.
```js
L.get('iris', { format: 'matrix' }).values
```

For supervised method it is usual to sample a class to get a training set and a test set.
```js
L.sample('iris')
```
returns an object with four arrays: trainIndex, testIndex, mask (a boolean filter), and classVector (the original class). 

To append another metadata.
```js
let newMetadata = metadata;
L.append(NewMetadata, 'column', { header: 'duplicated' });
``` 

To remove the duplicated metadata.
```js
L.remove('duplicated', 'column');
```

Import and export METADATA object.
```js
let L = new METADATA([metadata], { headers: ['iris'] });
    L = JSON.stringify(L.toJSON());
    let newL = METADATA.load(JSON.parse(L));
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/dataset-metadata.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/dataset-metadata
[travis-image]: https://img.shields.io/travis/com/mljs/dataset-metadata/master.svg?style=flat-square
[travis-url]: https://travis-ci.com/mljs/dataset-metadata
[codecov-image]: https://img.shields.io/codecov/c/github/mljs/dataset-metadata.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/mljs/dataset-metadata
[david-image]: https://img.shields.io/david/mljs/dataset-metadata.svg?style=flat-square
[david-url]: https://david-dm.org/mljs/dataset-metadata
[download-image]: https://img.shields.io/npm/dm/dataset-metadata.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/dataset-metadata
