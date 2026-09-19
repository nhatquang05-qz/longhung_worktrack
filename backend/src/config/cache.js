import NodeCache from 'node-cache';

export const memoryCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export const clearTaskCache = () => {
  const keys = memoryCache.keys();
  const taskKeys = keys.filter((k) => k.startsWith('tasks_'));
  if (taskKeys.length > 0) {
    memoryCache.del(taskKeys);
  }
};