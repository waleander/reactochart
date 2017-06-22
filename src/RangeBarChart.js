import React from 'react';
import invariant from 'invariant';
import PropTypes from 'prop-types';

import * as CustomPropTypes from './utils/CustomPropTypes';
import {hasXYScales, dataTypeFromScaleType} from './utils/Scale';
import {makeAccessor, domainFromRangeData} from './utils/Data';
import Bar from './Bar';

export default class RangeBarChart extends React.Component {
  static propTypes = {
    scale: CustomPropTypes.xyObjectOf(PropTypes.func.isRequired),
    data: PropTypes.array,
    horizontal: PropTypes.bool,

    getX: CustomPropTypes.getter,
    getXEnd: CustomPropTypes.getter,
    getY: CustomPropTypes.getter,
    getYEnd: CustomPropTypes.getter,

    barThickness: PropTypes.number,
    barClassName: PropTypes.string,
    barStyle: PropTypes.object
  };
  static defaultProps = {
    data: [],
    horizontal: false,
    barThickness: 8,
    barClassName: '',
    barStyle: {}
  };

  static getDomain(props) {
    const {scaleType, horizontal, data, getX, getXEnd, getY, getYEnd} = props;

    // only have to specify range axis domain, other axis uses default domainFromData
    const rangeAxis = horizontal ? 'x' : 'y';
    const rangeStartAccessor = horizontal ? makeAccessor(getX) : makeAccessor(getY);
    const rangeEndAccessor = horizontal ? makeAccessor(getXEnd) : makeAccessor(getYEnd);
    const rangeDataType = dataTypeFromScaleType(scaleType[rangeAxis]);

    return {
      [rangeAxis]: domainFromRangeData(data, rangeStartAccessor, rangeEndAccessor, rangeDataType)
    };
  }

  render() {
    const {scale, data, horizontal, getX, getXEnd, getY, getYEnd, barThickness, barClassName, barStyle} = this.props;
    invariant(hasXYScales(scale), `RangeBarChart.props.scale.x and scale.y must both be valid d3 scales`);
    // invariant(hasOneOfTwo(getXEnd, getYEnd), `RangeBarChart expects a getXEnd *or* getYEnd prop, but not both.`);

    const accessors = {x: makeAccessor(getX), y: makeAccessor(getY)};
    const endAccessors = {x: makeAccessor(getXEnd), y: makeAccessor(getYEnd)};
    const barProps = {
      scale,
      thickness: barThickness,
      className: `chart-bar ${barClassName}`,
      style: barStyle
    };

    return <g>
      {data.map((d, i) => {
        const thisBarProps = {
          xValue: accessors.x(d),
          yValue: accessors.y(d),
          key: `chart-bar-${i}`,
          ...barProps
        };

        return horizontal ?
          <Bar xEndValue={endAccessors.x(d)} {...thisBarProps} /> :
          <Bar yEndValue={endAccessors.y(d)} {...thisBarProps} />;
      })}
    </g>;
  }
}
