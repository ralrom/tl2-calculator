import React from 'react';

require('../sass/modules/character-select.scss');

const baseURL = [window.location.protocol, '//', window.location.host, window.location.pathname].join('');

export default class CharacterSelect extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var characters = [];
        for(var i = 0, m = this.props.characters.length; i < m; i++) {
            const character = this.props.characters[i];
            if(character !== this.props.currentCharacter) {
                characters.push(<li key={character}><Character character={character} onCharacterChange={this.props.onCharacterChange} /></li>);
            }
        }
        return (
            <ul className='character-select'>
                {characters}
            </ul>
        );
    }
}

class Character extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <div className="character" onClick={this.props.onCharacterChange.bind(null, this.props.character)} >
                <img className="character__portrait" src={baseURL + "characters/" + this.props.character + "/portrait.jpg"} />
                <h3 className="character__name">{this.props.character}</h3>
            </div>
        );
    }
}