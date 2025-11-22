const map = new Map();

map.set('a', 1);
map.set('b', 2);
map.set(new Date(), 54);

const keys = Array.from(map.keys());
const values = Array.from(map.values());

console.log(keys);
console.log(values);
