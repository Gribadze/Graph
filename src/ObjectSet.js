const deepEqual = require('./utils/deepEqual');

class ObjectSet extends Set {
  add(item) {
    if (!(item instanceof Object)) {
      throw new Error(`ObjectSet for objects only. Type received: ${typeof item}`);
    }
    const exists = Array.from(this.values()).some((i) => deepEqual(item, i));
    if (exists) {
      return;
    }
    super.add(item);
  }
}

module.exports = ObjectSet;
