const ObjectSet = require('./ObjectSet');

describe('ObjectSet tests', () => {
  it('should insert only unique object values', () => {
    const os = new ObjectSet();
    os.add({ v: 1 });
    os.add({ v: 1 });
    expect(os.size).toBe(1);
  });
});
