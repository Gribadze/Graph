const deepEqual = require('./utils/deepEqual');

class ObjectSet extends Set {
  add(item) {
    const exists = Array.from(this.values()).some((i) => deepEqual(item, i));
    if (exists) {
      return;
    }
    super.add(item);
  }
}

module.exports = ObjectSet;
