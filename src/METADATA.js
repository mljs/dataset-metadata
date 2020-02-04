import Matrix from 'ml-matrix';

/**
 * create new metadata object from 2D array
 * @param {Array} values - a 2d array with metadata values
 * @param {Object} [options]
 * @param {Array} [options.headers=[...Array(columns).keys()]] - an array with metadata headers
 * @param {Array} [options.IDs=[...Array(rows).keys()]] - an array with IDs
 */
export class METADATA {
  constructor(values, options = {}) {
    let { columns, rows } = [];

    if (values === true) {
      const metadata = options;
      this.headers = metadata.headers;
      this.IDs = metadata.IDs;
      this.values = options.values;
    } else {
      columns = values.length;
      rows = values[0].length;
      this.values = values;
      let {
        headers = [...Array(columns).keys()].map((x) => (x + 1).toString()),
        IDs = [...Array(rows).keys()].map((x) => (x + 1).toString()),
      } = options;

      this.headers = headers;
      this.IDs = IDs;
    }
  }

  /**
   * load metadata
   * @param {Boolean} [metadata=true] - a boolean
   * @param {Object} [options]
   * @param {JSON} [options.metadata] - a metadata object
   * @return {METADATA} - a metdata object
   */
  static load(metadata) {
    if (typeof metadata.name !== 'string') {
      throw new TypeError('metadata must have a name property');
    }
    if (metadata.name !== 'metadata') {
      throw new RangeError(`invalid model: ${metadata.name}`);
    }
    return new METADATA(true, metadata);
  }

  /**
   * save metadata to JSON
   * @return {JSON} - a JSON with metadata
   */
  toJSON() {
    return {
      name: 'metadata',
      headers: this.headers,
      IDs: this.IDs,
      values: this.values,
    };
  }

  /**
   * listMetadata
   * @return {Array} - an array with headers
   */
  list() {
    return this.headers;
  }

  /**
   * add metadata
   * @param {Array} value - an array with metadata
   * @param {String} [by = 'column'] - select by row or by column
   * @param {Object} [options]
   * @param {String} [options.header] - a header for new metadata
   */
  append(values, by = 'column', options = {}) {
    if (by === 'column') {
      let { header = (this.headers.length + 1).toString() } = options;

      if (typeof header !== 'string') {
        // header was coerced to string
        header = header.toString();
      }

      if (this.headers.includes(header)) {
        throw new Error('this header already exist');
      }

      if (values.length === this.values[0].length) {
        this.values.push(values);
        this.headers.push(header);
      } else {
        throw new Error("dimension doesn't match");
      }
    } else if (by === 'row') {
      let { ID = (this.IDs.length + 1).toString() } = options;

      if (typeof ID !== 'string') {
        // ID was coerced to string
        ID = ID.toString();
      }

      if (this.IDs.includes(ID)) {
        throw new Error('this ID already exist');
      }

      if (values.length === this.values.length) {
        this.values.map((x, idx) => x.push(values[idx]));
        this.IDs.push(ID);
      } else {
        throw new Error("dimension doesn't match");
      }
    }

    return this;
  }

  /**
   * remove row or column by index or name
   * @param {any} index - an index or a column/row name
   * @param {String} [by = 'row'] - select by row or by column
   */
  remove(index, by = 'row') {
    if (typeof index !== 'object') {
      index = [index];
    }
    if (by === 'column') {
      index.forEach((el, idx) => {
        if (typeof el === 'number') {
          index[idx] = this.headers[el];
        }
      });
      index.forEach((el, idx) => {
        let id = this.headers.indexOf(index[idx]);
        if (id > -1) {
          this.headers.splice(id, 1);
          this.values.splice(id, 1);
        }
      });
    } else if (by === 'row') {
      index.forEach((el, idx) => {
        if (typeof el === 'number') {
          index[idx] = this.IDs[el];
        }
      });
      index.forEach((el, idx) => {
        let id = this.IDs.indexOf(index[idx]);
        if (id > -1) {
          this.IDs.splice(id, 1);
          this.values.map((x) => x.splice(id, 1));
        }
      });
    }
    return this;
  }

  /**
   *
   * @param {String} title - a title
   * @return {Object} return { title, groupIDs, nClass, classVector, classFactor, classMatrix }
   */
  get(header, options = {}) {
    const { format = 'vector' } = options;
    let index = this.headers.indexOf(header);
    let classVector = this.values[index];

    let nObs = classVector.length;
    let counts = summaryAClass(classVector);
    let groupIDs = Object.keys(counts);
    let nClass = groupIDs.length;

    let classValues;
    switch (format) {
      case 'factor':
        classValues = classVector.map((x) => groupIDs.indexOf(x));
        break;
      case 'matrix':
        classValues = Matrix.from1DArray(
          nObs,
          1,
          classVector.map((x) => groupIDs.indexOf(x)),
        );
        break;

      default:
        classValues = classVector;
        break;
    }

    return {
      header: header,
      groups: groupIDs,
      summary: counts,
      nObs,
      nClass,
      values: classValues,
    };
  }

  sample(header, options = {}) {
    const { fraction = 0.8 } = options;
    let classVector = this.get(header).values;
    let { trainIndex, testIndex, mask } = sampleAClass(classVector, fraction);

    return {
      trainIndex,
      testIndex,
      mask,
      classVector,
    };
  }
}

export function summaryAClass(classVector) {
  let counts = {};
  classVector.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });
  return counts;
}

export function sampleAClass(classVector, fraction) {
  // sort the vector
  let classVectorSorted = JSON.parse(JSON.stringify(classVector));
  let result = Array.from(Array(classVectorSorted.length).keys()).sort((a, b) =>
    classVectorSorted[a] < classVectorSorted[b]
      ? -1
      : (classVectorSorted[b] < classVectorSorted[a]) | 0,
  );
  classVectorSorted.sort((a, b) => (a < b ? -1 : (b < a) | 0));

  // counts the class elements
  let counts = summaryAClass(classVectorSorted);

  // pick a few per class
  let indexOfSelected = [];
  Object.keys(counts).forEach((e, i) => {
    let shift = [];
    Object.values(counts).reduce((a, c, idx) => (shift[idx] = a + c), 0);

    let arr = [...Array(counts[e]).keys()];

    let r = [];
    for (let j = 0; j < Math.floor(counts[e] * fraction); j++) {
      let n = arr[Math.floor(Math.random() * arr.length)];
      r.push(n);
      let ind = arr.indexOf(n);
      arr.splice(ind, 1);
    }

    if (i === 0) {
      indexOfSelected = indexOfSelected.concat(r);
    } else {
      indexOfSelected = indexOfSelected.concat(r.map((x) => x + shift[i - 1]));
    }
  });

  // sort back the index
  let trainIndex = [];
  indexOfSelected.forEach((e) => trainIndex.push(result[e]));

  let testIndex = [];
  let mask = [];
  classVector.forEach((el, idx) => {
    if (trainIndex.includes(idx)) {
      mask.push(true);
    } else {
      mask.push(false);
      testIndex.push(idx);
    }
  });
  return { trainIndex, testIndex, mask };
}
