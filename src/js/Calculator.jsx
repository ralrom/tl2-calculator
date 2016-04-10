import React from 'react';
import ReactDOM from 'react-dom';

const microAjax = require('./microAjax.js');

import Skillset from "./Skillset.jsx";
import ShareLink from "./ShareLink.jsx";
import CharacterSummary from "./CharacterSummary.jsx";
import CharacterSelect from "./CharacterSelect.jsx";

require('../sass/modules/calculator.scss');

class Calculator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            points: [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ],
            skillset: null,
            currentCharacter: this.props.characters[0]
        };

        // Bind this
        this.getTotalPoints = this.getTotalPoints.bind(this);
        this.handlePointChange = this.handlePointChange.bind(this);
        this.handleCharacterChange = this.handleCharacterChange.bind(this);
        this.updateUrl = this.updateUrl.bind(this);
    }
    getTotalPoints() {
        var total = 0;
        const points = this.state.points;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 10; j++) {
                total += points[i][j];
            }
        }
        return total;
    }
    updateUrl() {
        		
		var encodePoint = function(point) {
    		return parseInt(point, 10) ? point.toString(16) : 0;
    	};
    	
        var pointString = "";
		for(var i = 0; i < 3; i++) {
			for(var j = 0; j < 10; j++) {
				pointString += encodePoint(this.state.points[i][j]);
			}
		}

    	
        var buildUrl =
			[window.location.protocol, '//', window.location.host, window.location.pathname].join('')
			+ '?class='	+ this.state.currentCharacter
			+ '&points=' + pointString;

        //Update browser URL
        window.history.replaceState(
    			{calc: "points"},
    			"TL2 Calculator Saved Build",
    			buildUrl);
    }
    handlePointChange(tree, skill, level) {

        const currLevel = this.state.points[tree][skill];

        // Don't spend more points than allowed (but spend maximum possible)
        const pointsSpent = this.getTotalPoints();

        // Make sure we're working with a number
        if (isNaN(level)) {
            level = 0;
        }

        // Set level within allowable boundaries
        level = level > 15 ? 15 : level;
        level = level < 0 ? 0 : level;

        level = level - currLevel + pointsSpent > 132 ? 132 - pointsSpent + currLevel : level;

        var newPoints = this.state.points;
        newPoints[tree][skill] = level;
        this.setState({
            points: newPoints
        });
        
        this.updateUrl();
    }
    handleCharacterChange(character) {
        microAjax("/characters/" + character + "/skillset.json", function(response) {
            this.setState({
                skillset: response.skillset,
                currentCharacter: character
            });
            this.updateUrl();
        }.bind(this));
    }
    componentDidMount() {
        var parseUrl = function() {

            // Get current character from URL parameter (or load default character)
            var character = getParameter('class') || this.state.currentCharacter;

            // Get points from URL parameter and split into an array
            var points = getParameter('points').split("");

            // Parse all the points obtained from the URL parameter
            for (var i = 0, u = 30; i < u; i++) {
                points[i] = parsePoint(points[i]);
            }

            this.handleCharacterChange(character);

            //Set points
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 10; j++) {
                    this.handlePointChange(i, j, points[i * 10 + j]);
                }
            }
        }.bind(this);
        
        var getParameter = function(parameter) {
            return decodeURI(
                window.location.search.replace(
                    new RegExp(
                        '^(?:.*[&\\?]' + encodeURI(parameter).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'
                    ),
                    '$1'
                )
            );
        };

        /*
         * Converts a hexadecimal digit to a decimal number: f -> 15
         */
        var parsePoint = function(point) {
            return parseInt(point, 16) || 0;
        }
        
        parseUrl();
    }
    render() {
        var trees = this.state.skillset ? this.state.skillset.trees : null;
        return (
            <div className="calculator">
                <div className="calculator__header">
                    <div className="calculator__current-character">
                        <CharacterSummary character={this.state.currentCharacter} points={this.state.points} />
                    </div>
                    <div className="calculator__characters">
                        <h2 className="calculator__switch-text">Switch Character</h2>
                        <CharacterSelect characters={this.props.characters} currentCharacter={this.state.currentCharacter} onCharacterChange={this.handleCharacterChange} />
                    </div>
                </div>
                <Skillset trees={trees} points={this.state.points} onPointChange={this.handlePointChange} currentCharacter={this.state.currentCharacter} />
                <ShareLink points={this.state.points} character={this.state.currentCharacter} />
            </div>
        );
    }
}

ReactDOM.render(
    <Calculator characters={['berserker', 'embermage', 'engineer', 'outlander']} />,
    document.getElementById('calculator')
);