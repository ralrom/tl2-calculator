import React from 'react';

import PointDistribution from "./PointDistribution.jsx";

require('../sass/modules/character-summary.scss');

const baseURL = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');

export default class CharacterSummary extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className='character-summary'>
                <img className="character-summary__portrait" src={baseURL + "characters/" + this.props.character + "/portrait.jpg"}/>
                <h1 className="character-summary__name">{this.props.character}</h1>
                <div className="character-summary__points">
                    <h2 className="character-summary__title">Point Distribution</h2>
                    <PointDistribution points={this.props.points} />
                </div>
            </div>
        );
    }
}