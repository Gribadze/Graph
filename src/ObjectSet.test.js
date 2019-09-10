const ObjectSet = require('./ObjectSet');

describe('ObjectSet tests', () => {
  it('should insert only unique object values', () => {
    const os = new ObjectSet();
    os.add({ v: 1 });
    os.add({ v: 1 });
    expect(os.size).toBe(1);
  });
  it('should check if has object value', () => {
    const os = new ObjectSet();
    os.add({ v: 1 });
    expect(os.has({ v: 1 })).toBe(true);
  });
  it('should get object reference by value', () => {
    const os = new ObjectSet();
    const testObj = { v: 1 };
    os.add(testObj);
    expect(os.get({ v: 1 })).toBe(testObj);
  });
});
