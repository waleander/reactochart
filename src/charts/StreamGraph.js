import React from 'react';
const {PropTypes} = React;
import _ from 'lodash';
import d3 from 'd3';
import {accessor} from '../util.js';

const StreamGraph = React.createClass({
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
    implementsInterface(name) {
      return name === "XYChart";
    },
    getOptions(props) {
      const {datasets} = props;
      const xAccessor = accessor(props.getValue.x);
      const yAccessor = accessor(props.getValue.y);
      const domains = datasets.map(data => ({
        x: d3.extent(data, xAccessor),
        y: d3.extent(data, yAccessor)
      }));

      //console.log('xdomain', d3.extent(_.flatten(_.map(domains, 'x'))));

      return {
        domain: {
          x: d3.extent(_.flatten(_.map(domains, 'x'))),
          //y: d3.extent(_.flatten(_.map(domains, 'y')))
          y: [0,3]
        }
      };
    }
  },

  _initStack(props) {
    const xAccessor = accessor(props.getValue.x);
    const yAccessor = accessor(props.getValue.y);
    const stackDatasets = props.datasets.map(data => {
      return data.map(d => {
        return {
          d,
          x: xAccessor(d),
          y: yAccessor(d)
        }
      })
    });

    const stack = d3.layout.stack()
      .offset("silhouette");
      //.values(function(d) { return d.values; })
      //.x(accessor(props.getValue.x))
      //.y(accessor(props.getValue.y));

    const layers = stack(stackDatasets);
    console.log('layers', layers);
    return layers;
  },

  render() {
    const {scale} = this.props;
    const layers = this._initStack(this.props);

    console.log(scale.x.domain(), scale.y.domain());
    console.log(scale.x.range(), scale.y.range());

    const area = d3.svg.area()
      .interpolate('cardinal')
      .x(d => {
        console.log(d, scale.x(d.x), scale.y(d.y0), scale.y(d.y0 + d.y));
        return scale.x(d.x)
      })
      .y0(d => scale.y(d.y0))
      .y1(d => scale.y(d.y0 + d.y));

    return <g>
      {layers.map(layer => {
        return <path
          d={area(layer)}
          className="layer"
          fill={randomGray()}
          style={{
            fill: randomGray(),
            stroke: 'transparent'
          }}
        />
      })}
    </g>;

    return <line style={{stroke: 'red'}} x1={0} y1={0} x2={80} y2={80} />;
  }
});

function randomGray(min=0, max=255) {
  const rgb = _.random(min, max);
  return `rgb(${rgb}, ${rgb}, ${rgb})`;
}

export default StreamGraph;