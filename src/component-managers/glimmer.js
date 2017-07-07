import Ember from 'ember';
import Component from "../ui/components/-utils/component";
import ComponentDefinition from "./-utils/component-definition";
import { RootReference } from "./-utils/references";

const { getOwner, setOwner }  = Ember;

const { compileLayout } = Ember.__loader.require("@glimmer/runtime");

export class ComponentStateBucket {
  constructor(definition, args, owner) {
    let componentFactory = definition.ComponentClass;
    let name = definition.name;
    this.args = args;
    let injections = {
      debugName: name,
      args: this.namedArgsSnapshot()
    };
    setOwner(injections, owner);
    this.component = componentFactory.create(injections);
  }
  namedArgsSnapshot() {
    return Object.freeze(this.args.named.value());
  }
}
class LayoutCompiler {
  constructor(name, template) {
    this.template = template;
    this.name = name;
  }
  compile(builder) {
    builder.fromLayout(this.name, this.template);
  }
}
class ComponentManager {
  static create(options) {
    return new ComponentManager(options);
  }
  prepareArgs(definition, args) {
    return null;
  }
  create(environment, definition, volatileArgs) {
    let componentFactory = definition.ComponentClass;
    if (!componentFactory) {
      return null;
    }
    let owner = getOwner(environment);
    return new ComponentStateBucket(definition, volatileArgs.capture(), owner);
  }
  createComponentDefinition(name, template, componentFactory) {
    return new ComponentDefinition(name, this, template, componentFactory);
  }
  layoutFor(definition, bucket, env) {
    let template = definition.template;
    return compileLayout(new LayoutCompiler(definition.name, template), env);
  }
  getSelf(bucket) {
    if (!bucket) {
      return null;
    }
    return new RootReference(bucket.component);
  }
  didCreateElement(bucket, element) {
    if (!bucket) {
      return;
    }
    bucket.component.element = element;
  }
  didRenderLayout(bucket, bounds) {
  }
  didCreate(bucket) {
    bucket && bucket.component.didInsertElement();
  }
  getTag() {
    return null;
  }
  update(bucket, scope) {
    if (!bucket) {
      return;
    }
    // TODO: This should be moved to `didUpdate`, but there's currently a
    // Glimmer bug that causes it not to be called if the layout doesn't update.
    let { component } = bucket;
    component.args = bucket.namedArgsSnapshot();
    component.didUpdate();
  }
  didUpdateLayout() { }
  didUpdate(bucket) { }
  getDestructor(bucket) {
    if (!bucket) {
      return;
    }
    return bucket.component;
  }
  permitsAngleInvocation() {
    return true;
  }
}

export default new ComponentManager();
