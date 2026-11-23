(function (root) {
  'use strict';

  // Masks represent subsets of Ω = {A, B, C}. Mass arrays use unit fractions.
  const frame = 7;
  const sets = [1, 2, 4, 3, 5, 6, frame];
  const events = [0, ...sets];

  function name(mask) {
    if (mask === 0) return '∅';
    if (mask === frame) return 'Ω';
    return '{' + ['A', 'B', 'C'].filter((_, i) => mask & (1 << i)).join(', ') + '}';
  }

  function bounds(mass, event) {
    let belief = 0;
    let plausibility = 0;
    for (const set of sets) {
      const overlap = set & event;
      if (overlap === set) belief += mass[set];
      if (overlap) plausibility += mass[set];
    }
    return { belief, plausibility };
  }

  function combine(first, second) {
    const products = Array(8).fill(0);
    for (const left of sets) {
      for (const right of sets) {
        products[left & right] += first[left] * second[right];
      }
    }
    const surviving = sets.reduce((sum, set) => sum + products[set], 0);
    return {
      conflict: products[0],
      products,
      mass: surviving > 0
        ? [0, ...products.slice(1).map(value => value / surviving)]
        : null
    };
  }

  const api = { frame, sets, events, name, bounds, combine };
  if (typeof module !== 'undefined') module.exports = api;
  else root.BeliefFunctionModel = api;
})(globalThis);
