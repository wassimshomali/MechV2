import { matchRoute } from './routes.js';

export function createRouter({ onRouteChange }) {
  function getCurrentPath() {
    const hash = window.location.hash.slice(1);
    return hash.split('?')[0] || '/';
  }

  function navigate(path) {
    window.location.hash = path.startsWith('/') ? path : `/${path}`;
  }

  function resolve() {
    const path = getCurrentPath();
    const route = matchRoute(path);
    onRouteChange(route, path);
    return route;
  }

  window.addEventListener('hashchange', resolve);

  return {
    getCurrentPath,
    navigate,
    resolve,
    start() {
      if (!window.location.hash) {
        window.location.hash = '/';
        return null;
      }
      return resolve();
    },
  };
}
