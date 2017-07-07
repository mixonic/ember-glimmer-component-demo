import { tagForProperty, UntrackedPropertyError } from "./tracked";

const { dict } = Ember.__loader.require("@glimmer/util");
const { CONSTANT_TAG, ConstReference, DirtyableTag, UpdatableTag, combine, isConst } = Ember.__loader.require("@glimmer/reference");
const { ConditionalReference: GlimmerConditionalReference, PrimitiveReference } = Ember.__loader.require("@glimmer/runtime");

/**
 * The base PathReference.
 */
export class ComponentPathReference {
    get(key) {
        return PropertyReference.create(this, key);
    }
}
export class CachedReference extends ComponentPathReference {
    constructor() {
        super(...arguments);
        this._lastRevision = null;
        this._lastValue = null;
    }
    value() {
        let { tag, _lastRevision, _lastValue } = this;
        if (!_lastRevision || !tag.validate(_lastRevision)) {
            _lastValue = this._lastValue = this.compute();
            this._lastRevision = tag.value();
        }
        return _lastValue;
    }
}
export class RootReference extends ConstReference {
    constructor() {
        super(...arguments);
        this.children = dict();
    }
    get(propertyKey) {
        let ref = this.children[propertyKey];
        if (!ref) {
            ref = this.children[propertyKey] = new RootPropertyReference(this.inner, propertyKey);
        }
        return ref;
    }
}
export class PropertyReference extends CachedReference {
    static create(parentReference, propertyKey) {
        if (isConst(parentReference)) {
            return new RootPropertyReference(parentReference.value(), propertyKey);
        }
        else {
            return new NestedPropertyReference(parentReference, propertyKey);
        }
    }
    get(key) {
        return new NestedPropertyReference(this, key);
    }
}
function buildError(obj, key) {
    let message = `The '${key}' property on the ${obj} was changed after it had been rendered. Properties that change after being rendered must be tracked. Use the @tracked decorator to mark this as a tracked property.`;
    throw new UntrackedPropertyError(obj, key, message);
}
export class RootPropertyReference extends PropertyReference {
    constructor(parentValue, propertyKey) {
        super();
        this._parentValue = parentValue;
        this._propertyKey = propertyKey;
        this.tag = tagForProperty(parentValue, propertyKey, buildError);
    }
    compute() {
        return this._parentValue[this._propertyKey];
    }
}
export class NestedPropertyReference extends PropertyReference {
    constructor(parentReference, propertyKey) {
        super();
        let parentReferenceTag = parentReference.tag;
        let parentObjectTag = UpdatableTag.create(CONSTANT_TAG);
        this._parentReference = parentReference;
        this._parentObjectTag = parentObjectTag;
        this._propertyKey = propertyKey;
        this.tag = combine([parentReferenceTag, parentObjectTag]);
    }
    compute() {
        let { _parentReference, _parentObjectTag, _propertyKey } = this;
        let parentValue = _parentReference.value();
        _parentObjectTag.inner.update(tagForProperty(parentValue, _propertyKey));
        if (typeof parentValue === "string" && _propertyKey === "length") {
            return parentValue.length;
        }
        if (typeof parentValue === "object" && parentValue) {
            return parentValue[_propertyKey];
        }
        else {
            return undefined;
        }
    }
}
export class UpdatableReference extends ComponentPathReference {
    constructor(value) {
        super();
        this.tag = DirtyableTag.create();
        this._value = value;
    }
    value() {
        return this._value;
    }
    update(value) {
        let { _value } = this;
        if (value !== _value) {
            this.tag.inner.dirty();
            this._value = value;
        }
    }
}
export class ConditionalReference extends GlimmerConditionalReference {
    static create(reference) {
        if (isConst(reference)) {
            let value = reference.value();
            return PrimitiveReference.create(value);
        }
        return new ConditionalReference(reference);
    }
}
