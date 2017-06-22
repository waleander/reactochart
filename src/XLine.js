import React from 'react';
import PropTypes from 'prop-types';

export default class XLine extends React.Component {
  static propTypes = {
    scale: PropTypes.shape({x: PropTypes.func.isRequired}),
    value: PropTypes.any.isRequired
  };
  static defaultProps = {
    style: {}
  };

  render() {
    const {value, height, style} = this.props;
    const scale = this.props.scale.x;
    const className = `chart-line-x ${this.props.className || ''}`;
    const lineX = scale(value);

    return <line {...{
      x1: lineX,
      x2: lineX,
      y1: 0,
      y2: height,
      className, style
    }} />;
  }
}
