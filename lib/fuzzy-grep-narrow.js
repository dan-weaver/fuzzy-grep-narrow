'use babel';

import FuzzyGrepNarrowView from './fuzzy-grep-narrow-view';
import { CompositeDisposable, Point } from 'atom';
import path from 'path';
settings = require(atom.packages.resolvePackagePath('narrow') + '/lib/settings')

function createProvider(Base, api) {
  return class GrepOpenProvider extends Base {
    static configScope = 'fuzzy-grep-narrow'
    getItems() {
     var results = api.results.map(function(item) {
        var point = new Point(0, 0);
        return { filePath: item.fullPath, text: item.content, point };
      })
      this.finishUpdateItems(results);
    }
  }
}

export default {

  fuzzyGrepNarrowView: null,
  modalPanel: null,
  subscriptions: null,
  config: settings.createProviderConfig({}),


  activate(state) {
    var that = this;
    this.narrowPromise = new Promise(function(resolve) {
      that.narrowResolve = resolve;
    })
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'fuzzy-grep-narrow:narrow-grep': () => this.openInNarrow()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.fuzzyGrepNarrowView.destroy();
  },

  openInNarrow() {
    var that = this;
    this.narrowPromise.then(function(service) {
      that.results = that.fuzzyGrep.getCurrentItems();
      that.service = service
      that.registerProvider(service);
      service.narrow('open-grep');
    })
  },

  consumeFuzzyGrep(service) {
    this.fuzzyGrep = service;
  },

  registerProvider(service) {
    service.registerProvider('open-grep', createProvider(service.ProviderBase, this));
  },

  consumeNarrow(service) {
    const {narrow, registerProvider, ProviderBase} = service;
    this.narrowResolve(service)
  }

};
