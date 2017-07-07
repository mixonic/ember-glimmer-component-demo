import Ember from 'ember';

const { Environment } = Ember.__loader.require('ember-glimmer');

export default class extends Environment {
  hasComponentDefinition(name, meta) {
    let definition = this.getComponentDefinition(name, meta);
    if (definition.manager.permitsAngleInvocation) {
      return definition.manager.permitsAngleInvocation();
    }
    return false;
  }
  static create(...args) {
    return new this(...args);
  }
}



