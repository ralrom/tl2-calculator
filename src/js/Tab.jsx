import React from 'react';
import classNames from 'classnames';

require('../sass/modules/tab.scss');

export default class Tab extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var pointTotal = 0;
        for(var i = 0; i < 10; i++) {
            pointTotal += this.props.points[i];
        }
        var className = classNames(
            'tab',
            {'tab--active': this.props.active}
        );
        return (
            <div className={className} onClick={this.props.onTreeChange} >
                <TabIndicator y={this.props.y} />
                <TabPoints y={this.props.y} points={pointTotal} />
                <TabName name={this.props.name} y={this.props.y} />
            </div>
        );
    }
}

class TabIndicator extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var className = classNames(
            'tab__indicator',
            'tab__indicator--tree-color-' + this.props.y
        );
        return (
            <div className={className}></div>
        );
    }
}

class TabPoints extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var className = classNames(
            'tab__level',
            'tab__level--tree-color-' + this.props.y
        );
        return (
            <div className={className}>{this.props.points}</div>
        );
    }
}

class TabName extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var className = classNames(
            'tab__name',
            'tab__name--tree-color-' + this.props.y
        );
        return (
            <div className={className}>{this.props.name}</div>
        );
    }
}