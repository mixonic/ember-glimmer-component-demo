import Resolver from 'ember-resolver/resolvers/glimmer-wrapper';
import buildResolverConfig from 'ember-resolver/ember-config';
import config from '../config/environment';

let resolverConfig = buildResolverConfig(config.modulePrefix);

resolverConfig.types['component-manager'] = { definitiveCollection: 'component-managers' };
resolverConfig.collections['component-managers'] = {
  types: ['component-manager'],
  privateCollections: ['utils'],
  defaultType: 'component-manager'
};

export default Resolver.extend({
  config: resolverConfig
});
