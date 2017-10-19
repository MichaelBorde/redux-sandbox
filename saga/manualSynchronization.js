'use strict';

const {createStore: createReduxStore, applyMiddleware} = require('redux');
const createSagaMiddleware = require('redux-saga').default;
const {all, fork, join, put, take, takeEvery} = require('redux-saga/effects');

const {loggingMiddleware} = require('../common');

const store = createStore();

setTimeout(() => store.dispatch({type: 'action2', payload: 'before'}), 100);
setTimeout(() => store.dispatch({type: 'action2', payload: 'before'}), 200);
setTimeout(() => store.dispatch({type: 'action1'}), 300);
setTimeout(() => store.dispatch({type: 'action2', payload: 'after'}), 400);
setTimeout(() => store.dispatch({type: 'action2', payload: 'after'}), 500);
setTimeout(() => store.dispatch({type: 'action2', payload: 'after'}), 600);
setTimeout(() => store.dispatch({type: 'action1'}), 700);

function createStore() {
  const sagaMiddleware = createSagaMiddleware();
  const middlewares = [loggingMiddleware(), sagaMiddleware];
  const store = createReduxStore(x => x, applyMiddleware(...middlewares));
  sagaMiddleware.run(createRootSaga());
  return store;
}

function createRootSaga() {
  return root;

  function* root() {
    yield all([
      fork(watchAction1),
      fork(watchAction2WhenReady)
    ]);
  }

  function* watchAction1() {
    yield takeEvery('action1', action1);
  }

  function* action1(action) {
    yield put({type: 'action1 succeeded', payload: action.payload});
  }

  function* watchAction2WhenReady() {
    const action2s = [];
    let ready = false;
    while (!ready) {
      const action = yield take(['action1', 'action2']);
      if (action.type === 'action1') {
        ready = true;
      } else {
        action2s.push(action);
      }
    }
    yield all([
      ...action2s.map(a => fork(action2, a)),
      fork(watchAction2)
    ]);
  }

  function* watchAction2() {
    yield takeEvery('action2', action2);
  }

  function* action2(action) {
    yield put({type: 'action2 succeeded', payload: action.payload});
  }
}


