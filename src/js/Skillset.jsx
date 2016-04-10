import React from 'react';

import Tree from './Tree.jsx';
import Tab from './Tab.jsx';

export default class Skillset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {currentTree: 0};
        this.handleTreeChange = this.handleTreeChange.bind(this);
    }
    handleTreeChange(tree, event) {
        this.setState({currentTree: tree});
    }
    render() {
        var trees = [];
        var tabs = [];
        if(this.props.trees) {
            this.props.trees.map(function(tree, treeIndex) {
                var isActive = treeIndex === this.state.currentTree;
                tabs.push(<Tab key={tree.name} active={isActive} name={tree.name} points={this.props.points[treeIndex]} y={treeIndex} onTreeChange={this.handleTreeChange.bind(null, treeIndex)} />);
                trees.push(<Tree key={tree.name} active={isActive} y={treeIndex} skills={tree.skills} points={this.props.points[treeIndex]} onPointChange={this.props.onPointChange.bind(null, treeIndex)} currentCharacter={this.props.currentCharacter} />);
            }.bind(this));
        }
        return (
            <div className="skillset">
                <div className="tabs">
                    {tabs}
                </div>
                <div className="trees">
                    {trees}
                </div>
            </div>
        );
    }
}