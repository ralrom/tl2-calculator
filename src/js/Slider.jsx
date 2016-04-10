import React from 'react';
import classNames from 'classnames';

require('../sass/modules/slider.scss');

export default class Slider extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="slider">
                <SliderInput points={this.props.points} onPointChange={this.props.onPointChange} y={this.props.y}/>
                <SliderBar onPointChange={this.props.onPointChange} >
                    <SliderHandle points={this.props.points} y={this.props.y} />
                    <SliderFill points={this.props.points} y={this.props.y} />
                </SliderBar>
            </div>
        );
    }
}

class SliderInput extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    
    /**
     * Determines how many points are requested based on the input value
     */
    handleChange(event) {
        var desiredPoints = parseInt(event.target.value, 10);
        this.props.onPointChange(desiredPoints);
    }
    render() {
        var className = classNames(
            'slider__input',
            'slider__input--tree-color-' + this.props.y
        );
        return (
            <input
                className={className}
                type="text"
                value={this.props.points}
                onChange={this.handleChange}/>
        );
    }
}

class SliderBar extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    
    /**
     * Determines how many points are requested based on the mouse click position
     */
    handleClick(event) {
        var boundingRect = this.refs.sliderbar.getBoundingClientRect();
        var barWidth = boundingRect.right - boundingRect.left;
        var percentage = ( event.clientX - boundingRect.left ) / barWidth;
        var desiredPoints = Math.round(percentage * 15);
        this.props.onPointChange(desiredPoints);
    }
    render() {
        return (
            <div className="slider__bar" onClick={this.handleClick} ref="sliderbar" >
                {this.props.children}
            </div>
        );
    }
}

class SliderHandle extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var style = {
            left: (this.props.points / 15) * 100 + '%'
        };
        var className = classNames(
            'slider__handle',
            'slider__handle--tree-color-' + this.props.y
        );
        return (
            <div
                className={className}
                style={style} />
        );
    }
}

class SliderFill extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var style = {
            width: (this.props.points / 15) * 100 + '%'
        };
        var className = classNames(
            'slider__fill',
            'slider__fill--tree-color-' + this.props.y
        );
        return (
            <div
                className={className}
                style={style} />
        );
    }
}