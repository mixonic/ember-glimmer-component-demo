const { ComponentDefinition: GlimmerComponentDefinition } = Ember.__loader.require("@glimmer/runtime");

export default class ComponentDefinition extends GlimmerComponentDefinition {
    constructor(name, manager, template, componentFactory) {
        super(name, manager, componentFactory);
        this.template = template;
        this.componentFactory = componentFactory;
    }
    toJSON() {
        return { GlimmerDebug: `<component-definition name="${this.name}">` };
    }
}
