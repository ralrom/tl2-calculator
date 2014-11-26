//Namespace
if (typeof TL2CALC !== 'undefined') {
    throw new Error('Namespace Conflict: variable TL2CALC is already defined.');
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * CORE
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

var TL2CALC = function () {
    var player = "berserker"; // Default player
    var points = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
    var pointsMax = 132;
    var skillMax = 15;
    return {
        setPoint: function (tree, skill, level) {

            //Make sure we're working with a number
            level = Number(level);
            if (isNaN(level)) {
                level = 0;
            }

            //Set level within boundaries
            level = level > skillMax ? skillMax : level;
            level = level < 0 ? 0 : level;

            //Make sure we don't spend more points than allowed (but spend maximum possible)
            var pointsSpent = this.getPointsSpent();
            level = level - points[tree][skill] + pointsSpent > pointsMax ? pointsMax - pointsSpent + points[tree][skill] : level;

            //Update point
            points[tree][skill] = level;

            TL2CALC.Mailman.publish('pointChange', tree, skill, level);
        },
        getPoint: function (tree, skill) {
            return points[tree][skill];
        },
        getPointsInTree: function (tree) {
            var sum = 0;
            for (var i = 0, m = points[tree].length; i < m; i++) {
                sum += points[tree][i];
            }
            return sum;
        },
        getPointsSpent: function () {
            var sum = 0;
            for (var i = 0, m = points.length; i < m; i++) {
                sum += this.getPointsInTree(i);
            }
            return sum;
        },
        setPlayer: function (name){
            player = String(name);
        },
        getPlayer: function () {
            return player;
        }
    }
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * MAILMAN MODULE
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
TL2CALC.Mailman = function () {
    var subscribers = [];
    return {
        subscribe: function (topic, context, callback) {
            if (typeof topic !== 'string') {
                throw new Error('You must provide a topic as a string!');
            }
            if (typeof subscribers[topic] === 'undefined') {
                subscribers[topic] = [];
            }
            subscribers[topic].push({
                context: context,
                callback: callback
            });
        },
        unsubscribe: function (topic, context, callback) {
            for (var i = 0; i < subscribers[topic].length; i++) {
                if (subscribers[topic][i].callback === callback && subscribers[topic][i].context == context) {
                    subscribers[topic].splice(i, 1);
                    i--;
                }
            }
        },
        publish: function (topic) {
            //Get arguments (except topic) as array
            var args = [].slice.call(arguments, 1);
            //Stop if there are no subscribers
            if (typeof subscribers[topic] === 'undefined') {
                return true;
            }
            //Callback all subscribers
            for (var i = 0, m = subscribers[topic].length; i < m; i++) {
                subscribers[topic][i].callback.apply(subscribers[topic][i].context, args);
            }
        }
    }
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * DATA MODULE
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
TL2CALC.SkillsetLoader = function () {
    var transferProgress = function (event) {
        //TO-DO: SHOW LOADING
    }

    var transferComplete = function (event) {
        if (event.target.status === 200) {
            TL2CALC.Mailman.publish('skillsetLoaded', JSON.parse(event.target.responseText));
        }
    };

    //Called for both abort & cancel
    var transferFailed = function (event) {
        //TO-DO: ADD ERROR HANDLING
    };

    var load = function (player) {
        TL2CALC.setPlayer(player);
        
        var request = new XMLHttpRequest();
        request.addEventListener('progress', transferProgress);
        request.addEventListener('load', transferComplete);
        request.addEventListener('error', transferFailed);
        request.addEventListener('abort', transferFailed);
        request.open('GET', 'data/' + player + '.min.json', true);
        request.send();
    }
    TL2CALC.Mailman.subscribe('playerChange', this, load);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * URL MANAGER MODULE
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
TL2CALC.UrlManager = function () {

    //Returns URL parameter [Taken from: https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.search]
    var getParameter = function (parameter) {
        return decodeURI(window.location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURI(parameter).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1'));
    };

    var loadBuild = function () {
        var player = getParameter("class");
        if (player == null || player == "") {
            player = TL2CALC.getPlayer();
        }

        //Run once
        TL2CALC.Mailman.unsubscribe('uiReady', this, loadBuild);

        TL2CALC.Mailman.subscribe("skillsetLoaded", this, loadPoints);
        TL2CALC.Mailman.publish("playerChange", player);
    }

    var loadPoints = function () {
        var points = getParameter("points").split("");
        
        console.log(points);

        if (points == null || points == "") { // No points parameter set all to 0
            points = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        } else if (points.length < 30) {
            //Fill missing numbers
            for (var i = points.length; i < 30; i++) {
                points[i] = 0;
            }
        }
        
        console.log(points);

        //Set points
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 10; j++) {
                TL2CALC.setPoint(i, j, parsePoint(points[i * 10 + j]));
            }
        }

        //Run once
        TL2CALC.Mailman.unsubscribe("skillsetLoaded", this, loadPoints);
    }

    // f -> 15
    var parsePoint = function (point) {
        point = parseInt(point, 16);
        if (isNaN(point)) {
            return 0;
        } else {
            return point;
        }
    }
    
    // 15 -> f
    var encodePoint = function(point){
        point = parseInt(point, 10);
        if(isNaN(point)){
          return 0;
        } else {
          return point.toString(16);
        }
    }
    
    // 15,10,3,4 -> "fa34"
    var serializePoints = function(){
        var points = "";
        for(var i = 0; i < 30; i++){
            points += encodePoint(TL2CALC.getPoint(Math.floor(i/10), i-10*Math.floor(i/10)));
        }
        return points;
    }

    var shareLink = function () {
        var link = [location.protocol, '//', location.host, location.pathname].join('');
        link += '?class=' + TL2CALC.getPlayer() + '&points=' + serializePoints();
        //Update browser URL link
        history.replaceState({calc: "points"}, "TL2 Calculator Saved Build", link);
        TL2CALC.Mailman.publish('linkChange', link);
        TL2CALC.Mailman.subscribe('playerChange', this, shareLink);
    }

    TL2CALC.Mailman.subscribe('uiReady', this, loadBuild);
    TL2CALC.Mailman.subscribe('pointChange', this, shareLink);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * UI MODULE
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
TL2CALC.UI = {};

TL2CALC.UI.Player = function (_element) {
    var changePlayer = function () {
        var player = _element.getAttribute("data-player");
        TL2CALC.Mailman.publish("playerChange", player);
    }
    var updatePlayer = function (player) {
        var _player = _element.getAttribute("data-player");
        if (_player == player) {
            if (!_element.className.match(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'))) {
                _element.className += " active";
            }
        } else {
            _element.className = _element.className.replace(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'), '');
        }
    }
    TL2CALC.Mailman.subscribe("playerChange", this, updatePlayer);
    _element.addEventListener("click", changePlayer);
};

TL2CALC.UI.Tab = function (_element, _tree) {
    var requestTree = function (event) {
        TL2CALC.Mailman.publish('treeChange', _tree);
    };

    var updateName = function (data) {
        _element.getElementsByClassName("name")[0].innerHTML = data.skillset.tree[_tree].name;
    };

    var updateTab = function (tree) {
        //Add or remove "active" class (use element.classList if you don't care about IE9 and below)
        if (_tree == tree) {
            if (!_element.className.match(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'))) {
                _element.className += " active";
            }
        } else {
            _element.className = _element.className.replace(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'), '');
        }
    }
    TL2CALC.Mailman.subscribe('treeChange', this, updateTab);
    TL2CALC.Mailman.subscribe('skillsetLoaded', this, updateName);
    _element.addEventListener('click', requestTree);
};

TL2CALC.UI.Point = function (_element, _tree) {
    var updatePoint = function (tree) {
        if (_tree == tree) {
            _element.innerHTML = TL2CALC.getPointsInTree(tree);
        }
    }
    TL2CALC.Mailman.subscribe('pointChange', this, updatePoint);
};

TL2CALC.UI.Tree = function (_element, _tree) {
    var updateTree = function (tree) {
        //Add or remove "active" class (use element.classList if you don't care about IE9 and below)
        if (_tree == tree) {
            if (!_element.className.match(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'))) {
                _element.className += " active";
            }
        } else {
            _element.className = _element.className.replace(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'), '');
        }
    }
    TL2CALC.Mailman.subscribe('treeChange', this, updateTree);
}

TL2CALC.UI.SkillButton = function (_element, _tree, _skill) {
    var setPoint = function (event) {
        var effect = _element.getAttribute("data-effect");
        switch (effect) {
        case "clear":
            TL2CALC.setPoint(_tree, _skill, 0);
            break;
        case "minus":
            TL2CALC.setPoint(_tree, _skill, TL2CALC.getPoint(_tree, _skill) - 1);
            break;
        case "plus":
            TL2CALC.setPoint(_tree, _skill, TL2CALC.getPoint(_tree, _skill) + 1);
            break;
        }
    }
    _element.addEventListener('click', setPoint);
};

TL2CALC.UI.SkillName = function (_element, _tree, _skill) {
    var updateName = function (data) {
        _element.innerHTML = data.skillset.tree[_tree].skill[_skill].name;
    }
    TL2CALC.Mailman.subscribe('skillsetLoaded', this, updateName);
};

TL2CALC.UI.SkillLevel = function (_element, _tree, _skill) {
    var updateLevel = function (tree, skill, level) {
        if (_tree == tree && _skill == skill) {
            _element.innerHTML = level;
        }
    }
    TL2CALC.Mailman.subscribe('pointChange', this, updateLevel);
};

TL2CALC.UI.SkillIcon = function (_element, _tree, _skill) {
    var icon = {};
    var setIcon = function (data) {
        icon.inactive = {
            "xPos": data.skillset.tree[_tree].skill[_skill].icons.inactive.xPos,
            "yPos": data.skillset.tree[_tree].skill[_skill].icons.inactive.yPos
        };
        icon.active = {
            "xPos": data.skillset.tree[_tree].skill[_skill].icons.active.xPos,
            "yPos": data.skillset.tree[_tree].skill[_skill].icons.active.yPos
        };
        updateIcon(_tree, _skill, TL2CALC.getPoint(_tree, _skill));
    }
    var updateIcon = function (tree, skill, level) {
        if (_tree == tree && _skill == skill) {
            if (level > 0) {
                _element.style.backgroundPositionX = -icon.active.xPos + "px";
                _element.style.backgroundPositionY = -icon.active.yPos + "px";
            } else {
                _element.style.backgroundPositionX = -icon.inactive.xPos + "px";
                _element.style.backgroundPositionY = -icon.inactive.yPos + "px";
            }
        }
    }
    TL2CALC.Mailman.subscribe('skillsetLoaded', this, setIcon);
    TL2CALC.Mailman.subscribe('pointChange', this, updateIcon);
};

TL2CALC.UI.ShareLink = function(_element) {
    var updateLink = function(link){
        _element.innerHTML = link;
    }
    TL2CALC.Mailman.subscribe('linkChange', this, updateLink);
};

window.onload = function () {

    //Initialize all our UI Objects
    var players = [];
    var skillButtons = [];
    var skillIcons = [];
    var skillNames = [];
    var skillLevels = [];
    var points = [];
    var tabs = [];
    var trees = [];
    var shareLink;

    //Loop through players
    var playerElems = document.getElementsByClassName("player");
    for (var i = 0, m = playerElems.length; i < m; i++) {
        players[i] = new TL2CALC.UI.Player(playerElems[i]);
    }

    //Loop through tabs
    var tabElems = document.getElementsByClassName("tab");
    for (var i = 0, m = tabElems.length; i < m; i++) {
        tabs[i] = new TL2CALC.UI.Tab(tabElems[i], i);
        points[i] = new TL2CALC.UI.Point(tabElems[i].getElementsByClassName("point")[0], i);
    }

    //Loop through trees & skills    
    var treeElems = document.getElementsByClassName("tree");
    for (var i = 0, m = treeElems.length; i < m; i++) {

        trees[i] = new TL2CALC.UI.Tree(treeElems[i], i);

        var skills = treeElems[i].getElementsByClassName("skill");

        skillButtons[i] = [];
        skillNames[i] = [];
        skillIcons[i] = [];
        skillLevels[i] = [];

        for (var j = 0, n = skills.length; j < n; j++) {

            skillNames[i][j] = new TL2CALC.UI.SkillName(skills[j].getElementsByClassName("skill-name")[0], i, j);
            skillIcons[i][j] = new TL2CALC.UI.SkillIcon(skills[j].getElementsByClassName("skill-icon")[0], i, j);
            skillLevels[i][j] = new TL2CALC.UI.SkillLevel(skills[j].getElementsByClassName("skill-level")[0], i, j);

            var buttons = skills[j].getElementsByClassName("skill-button");
            skillButtons[i][j] = [];

            for (var k = 0, o = buttons.length; k < o; k++) {
                skillButtons[i][j][k] = new TL2CALC.UI.SkillButton(buttons[k], i, j);
            }
        }
    }
    
    shareLink = new TL2CALC.UI.ShareLink(document.getElementById("share-link"));

    TL2CALC.Mailman.publish('uiReady');
};