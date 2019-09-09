const deepEqual = require('./deepEqual');

describe('deepEqual test', () => {
  it('should compare primitive values', () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(1, 0)).toBe(false);
  });
  it('should compare object values', () => {
    expect(deepEqual({ v: 1 }, { v: 1 })).toBe(true);
    expect(deepEqual({ v: 1, j: 1 }, { v: 1 })).toBe(false);
  });
});
