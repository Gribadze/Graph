const concatDistinct = require('./concatDistinct');

describe('concatDistinct test', () => {
  it('should concat unique primitive values by default', () => {
    const arr1 = [1, 2];
    const arr2 = [2, 3];
    const concatenatedArr = concatDistinct(arr1, arr2);
    expect(concatenatedArr).toHaveLength(3);
  });
  it('should concat object values using predicate for analysing unique value', () => {
    const arr1 = [{ val: 1 }, { val: 2 }];
    const arr2 = [{ val: 2 }, { val: 3 }];
    const concatenatedArr = concatDistinct(arr1, arr2, (val1, val2) => val1.val === val2.val);
    expect(concatenatedArr).toHaveLength(3);
  });
  it('more complex objects', () => {
    const arr1 = [new Set([1, 2])];
    const arr2 = [new Set([2, 1])];
    const concatenatedArr = concatDistinct(arr1, arr2, (val1, val2) =>
      Array.from(val1.values()).every((v) => val2.has(v)),
    );
    expect(concatenatedArr).toHaveLength(1);
  });
});
