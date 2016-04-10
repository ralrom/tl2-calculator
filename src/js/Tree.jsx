import React from 'react';
import classNames from 'classnames';

import Skill from './Skill.jsx';

require('../sass/modules/tree.scss');

export default class Tree extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var skills = [];
        if(this.props.skills) {
            this.props.skills.map(function(skill, skillIndex) {
                skills.push(<Skill key={skill.name} x={skillIndex} y={this.props.y} name={skill.name} points={this.props.points[skillIndex]} onPointChange={this.props.onPointChange.bind(null, skillIndex)} currentCharacter={this.props.currentCharacter} />);
            }.bind(this));
        }
        var className = classNames(
            'tree',
            {'tree--active' : this.props.active}
        );
        return (
            <div className={className} >
                {skills}
            </div>
        );
    }
}