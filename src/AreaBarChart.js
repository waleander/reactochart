import React from 'react';
import _ from 'lodash';
import invariant from 'invariant';
import PropTypes from 'prop-types';

import * as CustomPropTypes from './utils/CustomPropTypes';
import {hasXYScales, dataTypeFromScaleType} from './utils/Scale';
import {makeAccessor, domainFromRangeData} from './utils/Data';
import RangeRect from './RangeRect';

export default class AreaBarChart extends React.Component {
  static propTypes = {
    scale: CustomPropTypes.xyObjectOf(PropTypes.func.isRequired),
    data: PropTypes.array,
    horizontal: PropTypes.bool,

    getX: CustomPropTypes.getter,
    getXEnd: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,

    barClassName: PropTypes.string,
    barStyle: PropTypes.object
  };
  static defaultProps = {
    data: [],
    horizontal: false,
    barClassName: '',
    barStyle: {}
  };

  static getDomain(props) {
    const {scaleType, horizontal, data} = props;

    // only have to specify range axis domain, other axis uses default domainFromData
    // for area bar chart, the independent variable is the range
    // ie. the range controls the thickness of the bar
    const rangeAxis = horizontal ? 'y' : 'x';
    const rangeDataType = dataTypeFromScaleType(scaleType[rangeAxis]);
    // make accessor functions from getX|Y and getX|YEnd
    const rangeStartAccessor = makeAccessor(props[`get${rangeAxis.toUpperCase()}`]);
    const rangeEndAccessor = makeAccessor(props[`get${rangeAxis.toUpperCase()}End`]);

    return {
      [rangeAxis]: domainFromRangeData(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
    };
  }

  render() {
    const {scale, data, horizontal, getX, getXEnd, getY, getYEnd, barClassName, barStyle} = this.props;
    invariant(hasXYScales(scale), `AreaBarChart.props.scale.x and scale.y must both be valid d3 scales`);

    const barProps = {
      scale,
      className: `chart-area-bar ${barClassName}`,
      style: barStyle
    };
    const getZero = _.constant(0);

    return <g>
      {data.map((d, i) => {
        return <RangeRect
          datum={d}
          getX={horizontal ? getZero : getX}
          getXEnd={horizontal ? getX : getXEnd}
          getY={!horizontal ? getZero : getY}
          getYEnd={!horizontal ? getY : getYEnd}
          key={`chart-area-bar-${i}`}
          {...barProps}
        />;
      })}
    </g>;
  }
}
