/* Shared calculations: no interpolation and no missing-value substitution. */
(function (root) {
  'use strict';
  const valid = value => typeof value === 'number' && Number.isFinite(value);
  function growth(current, previous) {
    return valid(current) && valid(previous) && previous > 0
      ? (current / previous - 1) * 100 : null;
  }
  function ranks(values) {
    return values.map(value => {
      const below = values.filter(x => x < value).length;
      const tied = values.filter(x => x === value).length;
      return below + (tied + 1) / 2;
    });
  }
  function spearman(x, y, minimumPairs = 10) {
    if (x.length !== y.length || x.length < minimumPairs || !x.every(valid) || !y.every(valid)) return null;
    const a = ranks(x), b = ranks(y);
    const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
    const ma = mean(a), mb = mean(b);
    let numerator = 0, varianceA = 0, varianceB = 0;
    for (let i = 0; i < a.length; i++) {
      numerator += (a[i] - ma) * (b[i] - mb);
      varianceA += (a[i] - ma) ** 2;
      varianceB += (b[i] - mb) ** 2;
    }
    return varianceA && varianceB ? numerator / Math.sqrt(varianceA * varianceB) : null;
  }
  function temporalCorrelation(series, key = 'totalRadiance') {
    const ordered = [...series].sort((a, b) => a.year - b.year), x = [], y = [];
    for (let i = 1; i < ordered.length; i++) {
      const current = ordered[i], previous = ordered[i - 1];
      if (current.year !== previous.year + 1) continue;
      const lightChange = key === 'concentration'
        ? (valid(current[key]) && valid(previous[key]) ? (current[key] - previous[key]) * 100 : null)
        : growth(current[key], previous[key]);
      const gdpGrowth = growth(current.gdp, previous.gdp);
      if (valid(lightChange) && valid(gdpGrowth)) { x.push(lightChange); y.push(gdpGrowth); }
    }
    return { rho: spearman(x, y), n: x.length };
  }
  const api = { valid, growth, ranks, spearman, temporalCorrelation };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AfterlightStatistics = api;
})(globalThis);
