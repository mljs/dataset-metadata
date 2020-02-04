import { getClasses } from 'ml-dataset-iris';

import { METADATA, summaryAClass } from '../METADATA.js';

const metadata = getClasses();

describe('metadata export and loading', () => {
  it('test export', () => {
    let L = new METADATA([metadata], { headers: ['iris'] });
    L = JSON.stringify(L.toJSON());
    let newL = METADATA.load(JSON.parse(L));
    expect(newL.list()[0]).toStrictEqual('iris');
    expect(newL.values[0]).toHaveLength(150);
  });
});

describe('summaryAClass', () => {
  it('test types for summaryAClass', () => {
    let L = new METADATA([metadata], { headers: ['iris'] });
    let values = L.get('iris').values;
    expect(summaryAClass(values)).toStrictEqual({
      setosa: 50,
      versicolor: 50,
      virginica: 50,
    });
    values = L.get('iris', { format: 'factor' }).values;
    expect(summaryAClass(values)).toStrictEqual({ 0: 50, 1: 50, 2: 50 });
  });
});

describe('metadata sampleAClass', () => {
  it('test export', () => {
    let L = new METADATA([metadata], { headers: ['iris'] });
    let dataset = L.get('iris').values;
    expect(dataset).toHaveLength(150);
  });
});

describe('metadata summary sample', () => {
  it('test get', () => {
    let L = new METADATA([metadata], { headers: ['iris'] });
    expect(L.get('iris').nClass).toStrictEqual(3);
    expect(typeof L.get('iris')).toStrictEqual('object');
  });
  it('test get sample', () => {
    let L = new METADATA([metadata], { headers: ['iris'] });
    expect(L.sample('iris').trainIndex).toHaveLength(120);
    let testSet = L.sample('iris').testIndex;
    let classVector = L.sample('iris').classVector;
    expect(testSet).toHaveLength(30);
    let newL = new METADATA([testSet.map((x) => classVector[x])], {
      headers: ['iris'],
    });
    expect(newL.get('iris').nClass).toStrictEqual(3);

    expect(newL.get('iris').summary.setosa).toStrictEqual(10);
    expect(newL.get('iris').summary.virginica).toStrictEqual(10);
  });
});

describe('metadata creation, append and remove', () => {
  it('test create', () => {
    let L = new METADATA([metadata]);
    expect(L.list()[0]).toStrictEqual('1');
    expect(L.values).toHaveLength(1);
    expect(L.values[0]).toHaveLength(150);
  });
  it('test create with headers', () => {
    let L = new METADATA([metadata], { headers: ['iris'] });
    expect(L.list()[0]).toStrictEqual('iris');
  });
  it('test create 2 with headers', () => {
    let L = new METADATA([metadata, metadata], {
      headers: ['iris', 'duplicate'],
    });
    expect(L.list()[1]).toStrictEqual('duplicate');
    expect(L.values).toHaveLength(2);
  });
  it('test add', () => {
    let L = new METADATA([metadata]);
    L.append(metadata, 'column', { header: 'duplicated' });
    expect(L.list()[1]).toStrictEqual('duplicated');
    expect(L.values[0]).toHaveLength(150);
  });
  it('test add with default header', () => {
    let L = new METADATA([metadata]);
    L.append(metadata, 'column');
    expect(L.list()[1]).toStrictEqual('2');
    expect(L.values[0]).toHaveLength(150);
  });
  it('test add with wrong rows', () => {
    let L = new METADATA([metadata]);
    expect(() =>
      L.append(metadata.splice(1, 2), 'column', { header: 'duplicated' }),
    ).toThrow("dimension doesn't match");
  });
  it('test add / remove row', () => {
    let L = new METADATA([metadata]);
    expect(L.values[0]).toHaveLength(148);
    L.append([133], 'row', { ID: 'lastOne' });
    expect(L.values[0]).toHaveLength(149);
    expect(L.IDs[147]).toStrictEqual('148');
    expect(L.IDs[148]).toStrictEqual('lastOne');
    expect(L.values[0][148]).toStrictEqual(133);
    expect(L.values[0][147]).toStrictEqual('virginica');
    L.remove('lastOne', 'row');
    expect(L.values[0]).toHaveLength(148);
    expect(L.values[0][147]).toStrictEqual('virginica');
    expect(L.IDs[147]).toStrictEqual('148');
  });
  it('test add / remove column', () => {
    let L = new METADATA([['1', '2', '3']]);
    expect(L.values).toHaveLength(1);
    L.append(['4', '5', '6'], 'column', { header: 'duplicate' });
    expect(L.values).toHaveLength(2);
    expect(L.values[1][0]).toStrictEqual('4');
    L.remove('duplicate', 'column');
    expect(L.values).toHaveLength(1);
    expect(L.values[0][0]).toStrictEqual('1');
  });
  it('test add / remove column wrong type', () => {
    let L = new METADATA([['1', '2', '3']]);
    L.append(['4', '5', '6'], 'column', { header: 2 });
    expect(L.values[1][0]).toStrictEqual('4');
    L.remove('2', 'column');
    expect(L.values).toHaveLength(1);
    expect(L.values[0][0]).toStrictEqual('1');
  });
  it('test add / remove column with duplicate header', () => {
    let L = new METADATA([['1', '2', '3']]);
    expect(() => L.append(['4', '5', '6'], 'column', { header: 1 })).toThrow(
      'this header already exist',
    );
  });
  it('test add / remove row checks', () => {
    let L = new METADATA([['1', '2', '3']]);
    L.append(['4', '5', '6'], 'column', { header: 2 });
    expect(() => L.append([6, 7], 'row', { ID: 2 })).toThrow(
      'this ID already exist',
    );
  });
  it('test remove row / column by id', () => {
    let L = new METADATA([['1', '2', '3']]);
    L.append(['4', '5', '6'], 'column', { header: 2 });
    L.remove(['1', '3'], 'row');
    expect(L.values[0]).toHaveLength(1);
    expect(L.values[0][0]).toStrictEqual('2');
    L.remove(0, 'column');
    expect(L.values).toHaveLength(1);
    expect(L.values[0][0]).toStrictEqual('5');
  });
  it('test remove row / column by index', () => {
    let L = new METADATA([['1', '2', '3']]);
    L.append(['4', '5', '6'], 'column', { header: 2 });
    L.append(['7', '8', '9'], 'column', { header: 3 });
    L.remove([0, 2], 'row');
    expect(L.values[0]).toHaveLength(1);
    expect(L.values[0][0]).toStrictEqual('2');
    L.remove([0, 2], 'column');
    expect(L.values).toHaveLength(1);
    expect(L.values[0][0]).toStrictEqual('5');
  });
});
