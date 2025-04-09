const randIntFromDouble = (value) => {
  return Math.floor(value) + (Math.random() < value % 1 ? 1 : 0);
};

const assert = (cond, msg) => {
  if (!cond) {
    throw Error(msg);
  }
};
