import {
  MERGE_CONFIG,
  SET_CONFIG_KEY,
  DONE_SAVING_CONFIG,
} from '../constants';

const Rx = require('rxjs/Rx');
const fs = require('fs');
const jupyterPaths = require('jupyter-paths');

const Observable = Rx.Observable;

export const LOAD_CONFIG = 'LOAD_CONFIG';
export const loadConfig = () => ({ type: LOAD_CONFIG });

export const SAVE_CONFIG = 'SAVE_CONFIG';
export const saveConfig = () => ({ type: SAVE_CONFIG });
export const doneSavingConfig = () => ({ type: DONE_SAVING_CONFIG });

const readFileObservable = (filename, ...args) =>
  Observable.create(observer => {
    fs.readFile(filename, ...args, (error, data) => {
      if (error) {
        observer.error(error);
      } else {
        observer.next(data);
        observer.complete();
      }
    });
  });

const writeFileObservable = (filename, data, ...args) =>
  Observable.create(observer => {
    fs.writeFile(filename, data, ...args, error => {
      if (error) {
        observer.error(error);
      } else {
        observer.next({ filename, data });
        observer.complete();
      }
    });
  });

export const configLoaded = (config) => ({
  type: MERGE_CONFIG,
  config,
});

export const CONFIG_FILE_PATH = `${jupyterPaths.dataDirs()[0]}/nteract.json`;

export const loadConfigEpic = actions =>
  actions.ofType(LOAD_CONFIG)
    .switchMap(action =>
      readFileObservable(CONFIG_FILE_PATH)
        .map(JSON.parse)
        .map(configLoaded)
        .catch((err) =>
          Observable.of({ type: 'ERROR', payload: err, error: true })
        )
    );

export const saveConfigOnChangeEpic = actions =>
  actions.ofType(SET_CONFIG_KEY)
    .mapTo({ type: SAVE_CONFIG });

export const saveConfigEpic = actions =>
  actions.ofType(SAVE_CONFIG)
    .mergeMap(action =>
      writeFileObservable(CONFIG_FILE_PATH, JSON.stringify(store.getState().config.toJS()))
      .map(doneSavingConfig)
      .catch((err) =>
        Observable.of({ type: 'ERROR', payload: err, error: true })
      )
    );
