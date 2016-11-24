const lodashMerge = require('lodash.merge');
const joinArrays = require('./join-arrays');
const reduceLoaders = require('./reduce-loaders');

function merge() {
  return lodashMerge.apply(null, [{}].concat(...arguments).concat([
    joinArrays()
  ]));
}

function mergeSmart() {
  return lodashMerge.apply(null, [{}].concat(...arguments).concat([
    joinArrays({
      customizeArray: (a, b, key) => {
        if (isLoader(key.split('.').slice(-1)[0])) {
          return a.reduce(reduceLoaders, b.slice());
        }
      }
    })
  ]));
}

function mergeStrategy(rules = {}) {
  // rules: { <field>: <'append'|'prepend'> }
  // All default to append but you can override here
  return function () {
    return lodashMerge.apply(null, [{}].concat(...arguments).concat([
      joinArrays({
        customizeArray: (a, b, key) => {
          if (rules[key]) {
            return rules[key] === 'prepend' && b.concat(a);
          }
        },
        customizeObject: (a, b, key) => {
          if (rules[key]) {
            return rules[key] === 'prepend' && lodashMerge({}, b, a, joinArrays());
          }
        }
      })
    ]));
  };
}

function mergeSmartStrategy(rules = {}) {
  // rules: { <field>: <'append'|'prepend'> }
  // All default to append but you can override here
  return function () {
    return lodashMerge.apply(null, [{}].concat(...arguments).concat([
      joinArrays({
        customizeArray: (a, b, key) => {
          if (isLoader(key.split('.').slice(-1)[0])) {
            if (rules[key]) {
              return b.reduce(reduceLoaders, a.slice());
            }

            return a.reduce(reduceLoaders, b.slice());
          }

          if (rules[key]) {
            return rules[key] === 'prepend' && b.concat(a);
          }
        },
        customizeObject: (a, b, key) => {
          if (rules[key]) {
            return rules[key] === 'prepend' && lodashMerge({}, b, a, joinArrays());
          }
        }
      })
    ]));
  };
}

function isLoader(key) {
  return ['preLoaders', 'loaders', 'postLoaders', 'rules'].indexOf(key) >= 0;
}

module.exports = merge;
module.exports.smart = mergeSmart;
module.exports.strategy = mergeStrategy;
module.exports.smartStrategy = mergeSmartStrategy;
