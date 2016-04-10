import React from 'react';
import classNames from 'classnames';

import Slider from "./Slider.jsx";

require('../sass/modules/skill.scss');

const baseURL = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');

export default class Skill extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="skill">
                <SkillIcon x={this.props.x} y={this.props.y} points={this.props.points} currentCharacter={this.props.currentCharacter} />
                <SkillName name={this.props.name} y={this.props.y} />
                <div className="skill__slider">
                    <Slider points={this.props.points} onPointChange={this.props.onPointChange} y={this.props.y} />
                </div>
            </div>
        );
    }
}

class SkillName extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var className = classNames(
            'skill__name',
            'skill__name--tree-color-' + this.props.y
        );
        return (
            <div className={className} >
                {this.props.name}
            </div>
        );
    }
}

class SkillIcon extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var styles = {
            backgroundImage: 'url(' + baseURL + '/characters/' + this.props.currentCharacter + '/icons.jpg)',
            backgroundPosition: (-64 * this.props.x) + 'px ' + (-64 * this.props.y) + 'px'
        };
        return (
            <div className='skill__icon' style={styles} />
        );
    }
}