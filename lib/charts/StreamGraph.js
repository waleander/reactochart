'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _util = require('../util.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PropTypes = _react2.default.PropTypes;


var colorScale = _d2.default.scale.category20();

var StreamGraph = _react2.default.createClass({
  displayName: 'StreamGraph',

  propTypes: {
    //data: PropTypes.array.isRequired,
    datasets: PropTypes.array.isRequired,
    getValue: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    getLabel: PropTypes.func,
    nodeStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    labelStyle: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    minLabelWidth: PropTypes.number,
    minLabelHeight: PropTypes.number
  },
  statics: {
    implementsInterface: function implementsInterface(name) {
      return name === "XYChart";
    },
    getOptions: function getOptions(props) {
      var datasets = props.datasets;

      var xAccessor = (0, _util.accessor)(props.getValue.x);
      var yAccessor = (0, _util.accessor)(props.getValue.y);
      var domains = datasets.map(function (data) {
        return {
          x: _d2.default.extent(data, xAccessor),
          y: _d2.default.extent(data, yAccessor)
        };
      });

      //console.log('xdomain', d3.extent(_.flatten(_.map(domains, 'x'))));

      return {
        domain: {
          x: _d2.default.extent(_lodash2.default.flatten(_lodash2.default.map(domains, 'x'))),
          //y: d3.extent(_.flatten(_.map(domains, 'y')))
          y: [0, 3]
        }
      };
    }
  },

  _initStack: function _initStack(props) {
    var xAccessor = (0, _util.accessor)(props.getValue.x);
    var yAccessor = (0, _util.accessor)(props.getValue.y);
    var stackDatasets = props.datasets.map(function (data) {
      return data.map(function (d) {
        return {
          d: d,
          x: xAccessor(d),
          y: yAccessor(d)
        };
      });
    });

    var stack = _d2.default.layout.stack().offset("silhouette");
    //.values(function(d) { return d.values; })
    //.x(accessor(props.getValue.x))
    //.y(accessor(props.getValue.y));

    var layers = stack(stackDatasets);
    console.log('layers', layers);
    return layers;
  },
  render: function render() {
    var scale = this.props.scale;

    var layers = this._initStack(this.props);

    console.log(scale.x.domain(), scale.y.domain());
    console.log(scale.x.range(), scale.y.range());

    var area = _d2.default.svg.area().interpolate('cardinal').x(function (d) {
      console.log(d, scale.x(d.x), scale.y(d.y0), scale.y(d.y0 + d.y));
      return scale.x(d.x);
    }).y0(function (d) {
      return scale.y(d.y0);
    }).y1(function (d) {
      return scale.y(d.y0 + d.y);
    });

    return _react2.default.createElement(
      'g',
      null,
      layers.map(function (layer, i) {
        return _react2.default.createElement('path', {
          d: area(layer),
          className: 'layer',
          style: {
            fill: colorScale(i),
            stroke: 'transparent'
          }
        });
      })
    );

    return _react2.default.createElement('line', { style: { stroke: 'red' }, x1: 0, y1: 0, x2: 80, y2: 80 });
  }
});

function randomGray() {
  var min = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var max = arguments.length <= 1 || arguments[1] === undefined ? 255 : arguments[1];

  var rgb = _lodash2.default.random(min, max);
  return 'rgb(' + rgb + ', ' + rgb + ', ' + rgb + ')';
}

exports.default = StreamGraph;