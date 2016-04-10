import React from 'react';
import classNames from 'classnames';

require('../sass/modules/point-distribution.scss');

export default class PointDistribution extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var fills = [];
        for(var i = 0; i < 3; i++) {
            var total = 0;
            for(var j = 0; j < 10; j++) {
                total += this.props.points[i][j];
            }
            fills.push(<Fill key={i} y={i} points={total} />)
        }
        
        return (
            <div className='point-distribution' >
                {fills}
            </div>
        );
    }
}

class Fill extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var className = classNames(
            'point-distribution__fill',
            'point-distribution__fill--tree-color-' + this.props.y
        );
        var style = {
            width: (100 * this.props.points / 132) + '%'
        };
        return (
            <div className={className} style={style} />
        );
    }
}