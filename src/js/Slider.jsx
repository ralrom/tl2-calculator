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
        this.beginDrag = this.beginDrag.bind(this);
        this.endDrag = this.endDrag.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.requestPoints = this.requestPoints.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.state = {drag: false};
    }
    componentDidMount() {
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.endDrag);
        window.addEventListener('touchmove', this.handleTouchMove);
        window.addEventListener('touchend', this.endDrag);
    }
    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.endDrag);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.endDrag);
    }
    
    /**
     * Determines how many points are requested based on the mouse click position
     */
    handleMouseMove(event) {
        if(this.state.drag) {
            var xPos = event.clientX;
            this.requestPoints(xPos);
        }
    }
    
    handleTouchMove(event) {
        if(this.state.drag) {
            var xPos = event.touches[0].clientX;
            this.requestPoints(xPos);
        }
    }
    
    requestPoints(xPos) {
        var boundingRect = this.refs.sliderbar.getBoundingClientRect();
        var barWidth = boundingRect.right - boundingRect.left;
        var percentage = ( xPos - boundingRect.left ) / barWidth;
        percentage = percentage > 1 ? 1 : percentage;
        percentage = percentage < 0 ? 0 : percentage;
        var desiredPoints = Math.round(percentage * 15);
        this.props.onPointChange(desiredPoints);
        console.log(xPos);
    }
    
    beginDrag(event) {
        event.preventDefault();
        event.persist();
        // Begin drag and move the handle right away (for clicks)
        this.setState({drag: true}, function(event){
            if(event.type === "mousedown") {
                this.handleMouseMove(event);
            } else if (event.type === "touchstart") {
                this.handleTouchMove(event);
            }
        }.bind(this, event));
    }
    endDrag() {
        this.setState({drag: false});
    }
    render() {
        return (
            <div className="slider__bar" onMouseDown={this.beginDrag} onTouchStart={this.beginDrag} ref="sliderbar" >
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