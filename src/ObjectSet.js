const deepEqual = require('./utils/deepEqual');

function $itemExists(item) {
  return Array.from(this.values()).some((i) => deepEqual(item, i));
}

class ObjectSet extends Set {
  add(item) {
    if (this.has(item)) {
      return;
    }
    super.add(item);
  }

  has(item) {
    return $itemExists.call(this, item);
  }

  get(item) {
    return Array.from(this.values()).find((i) => deepEqual(item, i));
  }
}

module.exports = ObjectSet;
