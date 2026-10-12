export function applyTaskStatistics(metrics, statistics) {
  if (!statistics || !['total', 'active', 'done', 'abnormal'].every(
    key => Number.isInteger(statistics[key]) && statistics[key] >= 0
  )) return false;
  metrics.total = statistics.total;
  metrics.running = statistics.active;
  metrics.done = statistics.done;
  metrics.abnormal = statistics.abnormal;
  return true;
}

export function createTaskListClient(request) {
  const pending = new Map();
  return {
    get(endpoint, params, includeStatistics = true) {
      const query = includeStatistics ? { ...params, include_statistics: 1 } : { ...params };
      const key = JSON.stringify([endpoint, Object.keys(query).sort().map(name => [name, query[name]])]);
      if (pending.has(key)) return pending.get(key);
      const result = Promise.resolve().then(() => request.get(endpoint, { params: query }));
      pending.set(key, result);
      const cleanup = () => {
        if (pending.get(key) === result) pending.delete(key);
      };
      result.then(cleanup, cleanup);
      return result;
    }
  };
}
