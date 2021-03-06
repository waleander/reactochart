import _ from 'lodash';
import React from 'react';
import invariant from 'invariant';
import depthEqual from './depthEqual';

/**
 * `resolveObjectProps` is a higher-order-component.
 * It wraps Components which expect some object props of a certain shape, eg. {a,b,c}.
 *
 * It allows those props to be passed normally as an object like `{a: 5, b: [2], c: 'foo'}`,
 * or as an incompletely specified object like `{a: 5}`
 *   -> the specified value will be used and the missing values will be filled from defaultProps object
 * or as a single value like `5`
 *   -> an object with be created with all expected keys equal to this value (`{a: 5, b: 5, c: 5}`)
 * or not passed at all
 *   -> defaultProps will be used normally
 *
 * Note that the Component must specify defaultProps for defaults to be resolved correctly.
 *
 * @example
 * class BoxThing extends React.Component {...}
 * export default resolveObjectProps(BoxThing, ['margin', 'padding'], ['top', 'left', 'bottom', 'right']);
 * // then you can use <BoxThing> with incompletely specified props:
 * render() { return <BoxThing margin={5} padding={top: 10, bottom: 20} />; }
 *
 * @param {Component} Component - The React Component (class) which should be wrapped by this HOC
 * @param {string[]} propKeys - A list of keys for all the object props it is expected to resolve.
 * @param {string[]} objKeys - A list of keys for which values will be resolved on each object prop (object shape).
 * @returns {Component} - A Component which auto-resolves the specified object props.
 */

const errs = {
  badDefault: (Component, key, objKeys) => {
    return `Bad defaultProp in ${componentName(Component)}: Prop '${key}' is expected to be a ` +
      `{${objKeys.join(',')}}-shaped object, but it has a defaultProp which is not this shape.`;
  }
};
function componentName(Component) {
  return Component.displayName || "Component wrapped by resolveObjectProps";
}

function hasSome(obj, keys) {
  return _.isObject(obj) && _.some(keys, k => _.has(obj, k));
}
function hasAll(obj, keys) {
  return _.isObject(obj) && _.every(keys, k => _.has(obj, k));
}

function resolveProp(prop, objKeys, defaultProp) {
  // pass through objects which are already fully specified
  if(hasAll(prop, objKeys)) return prop;
  // for partially specified objects, use default for the other (unspecified) values
  if(hasSome(prop, objKeys)) return _.defaults(prop, defaultProp);
  // for single values, create an object with the same value for each expected key
  return _.isUndefined(prop) ? defaultProp :
    // for undefined prop values, return the entire defaultProp
    _.fromPairs(objKeys.map(k => [k, prop]));
}


export default function resolveObjectProps(ComposedComponent, propKeys, objKeys) {
  return class extends React.Component {
    // attach static reference to default props so that we can compose multiple resolveObjectProps wrappers,
    // but don't call it defaultProps, to avoid actually triggering the default behavior
    static _defaultProps = ComposedComponent.defaultProps;
    static getScaleType = ComposedComponent.getScaleType;
    static getDomain = ComposedComponent.getDomain;
    static getMargin = ComposedComponent.getMargin;

    shouldComponentUpdate(nextProps) {
      // 2-level-deep object compare for props which we expect to be objects
      // so that parent can pass object literals efficiently
      // shallow compare for all other props


      // todo fix this????
      // broken for InteractiveLineExample, maybe for anything with children?
      return true;

      const shouldUpdate = !(
        depthEqual(_.omit(this.props, propKeys), _.omit(this.props, propKeys), 1) &&
        depthEqual(_.pick(this.props, propKeys), _.pick(nextProps, propKeys), 2)
      );
      console.log('resolveObjectProps shouldComponentUpdate', shouldUpdate);
      return shouldUpdate;
    }

    render() {
      const defaultProps = ComposedComponent.defaultProps || ComposedComponent._defaultProps || {};
      
      const resolvedProps = _.fromPairs(propKeys.map(k => {
        invariant( // ensure ComposedComponent has undefined or good default for each prop
          _.isUndefined(defaultProps[k]) || _.isObject(defaultProps[k]),
          errs.badDefault(ComposedComponent, k, objKeys)
        );

        const resolved = resolveProp(this.props[k], objKeys, defaultProps[k]);
        return [k, resolved];
      }));

      const props = _.assign({}, this.props, resolvedProps);
      return <ComposedComponent {...props} />;
    }
  }
}
