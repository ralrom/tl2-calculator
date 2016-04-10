import React from 'react';

require('../sass/modules/share-link.scss');

export default class ShareLink extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var encodePoint = function(point) {
            return parseInt(point, 10) ? point.toString(16) : 0;
        };
        
        var pointString = "";
        for(var i = 0; i < 3; i++) {
            for(var j = 0; j < 10; j++) {
                pointString += encodePoint(this.props.points[i][j]);
            }
        }
        
        var url = [window.location.protocol, '//', window.location.host, window.location.pathname].join('')
			+ '?class='	+ this.props.character
			+ '&points=' + pointString;
        return (
            <div className="share-link">
                <div className="share-link__label">Share:</div>
                <input className="share-link__url" value={url} readOnly />
            </div>
        );
    }
}
