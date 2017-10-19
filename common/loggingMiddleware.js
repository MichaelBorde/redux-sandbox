'use strict';

function loggingMiddleware() {
  return () => next => action => {
    console.log('Dispatched action:', action);
    return next(action);
  };
}

module.exports = loggingMiddleware;
