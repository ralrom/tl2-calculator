// Namespace
var Tl2calc = {};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Core
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Provides the core functionality of the app. A simple points array with useful
 * setters and getters
*/

Tl2calc.Core = function() {

	// Default character to load
	var _character = 'berserker';

	// Maximum amount of skill points
	var _maxPoints = 132;

	// Maximum level of a given skill
	var _skillMax = 15;

	// Number of skill trees for each class
	var _trees = 3; // Populated from gulpfile (Swig)

	// Number of skills in each skill 
	var _skills = 10; // Populated from gulpfile (Swig)

	// 2D array containing the current build info
	var _points = [];

	// Initiate the points array as 0's
	(function() {
		for(var i = 0; i < _trees; i++) {
			_points[i] = [];
			for(var j = 0; j < _skills; j++) {
				_points[i][j] = 0;
			}
		}
	})();

	return {

		/*
		 * Return number of trees in skillset
		*/
		getTrees: function() {
			return _trees;
		},

		/*
		 * Return number of skills in skillset
		*/
		getSkills: function() {
			return _skills;
		},

		/*
		 * Returns currently loaded character
		*/
		getCharacter: function() {
			return _character;
		},

		/*
		 * Set currently loaded character
		*/
		setCharacter: function(character) {
			_character = character;
			Tl2calc.Mailman.publish('characterChanged', character);
		},

		/*
		 * Return the sum of points spent in a given skill tree

		 * @param tree:number the tree for which we want the sum of points
		*/
		getSpentInTree: function(tree) {
			var spent = 0;
			for(var i = 0; i < _skills; i++) {
				spent += _points[tree][i];
			}
			return spent;
		},

		/*
		 * Return the sum of points spent in all trees
		*/
		getSpent: function() {
			var spent = 0;
			for(var i = 0; i < _trees; i++) {
				spent += this.getSpentInTree(i);
			}
			return spent;
		},

		/*
		 * Retrieve a given point
		*/
		getPoint: function(tree, skill) {
			return _points[tree][skill];
		},

		/*
		 * Set a single point to a given level

		 * @param tree:number tree for which we're setting the point
		 * @param skill:number skill in the tree for which we're setting the point
		 * @param level:number level at which we're setting the point
		*/
		setPoint: function(tree, skill, level) {
			// Make sure we're working with a number
			if(typeof level !== 'number') {
				level = 0;
			}

			// Set level within allowable boundaries
			level = level > _skillMax ? _skillMax : level;
			level = level < 0 ? 0 : level;

			// Don't spend more points than allowed (but spend maximum possible)
			var pointsSpent = this.getSpent();
			level = level - _points[tree][skill] + pointsSpent > _maxPoints
				? _maxPoints - pointsSpent + _points[tree][skill]
				:	level;

			// Update point
			_points[tree][skill] = level;

			// Publish the point change to subscribers
			// General
			Tl2calc.Mailman.publish('pointChanged');
			// Tree specific
			Tl2calc.Mailman.publish('pointChanged:' + tree);
 			// Skill specific
			Tl2calc.Mailman.publish('pointChanged:' + tree + ',' + skill, level);
		},

		getPoints: function(){
			return _points;
		},

		getSkillMax: function(){
			return _skillMax;
		}
	}
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Mailman
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Allows communication between modules by using the subscribe/publish pattern
*/

Tl2calc.Mailman = function() {
	var subscriptions = [];
	return {

		/*
		 * Subscribe to a topic and provide a callback for when there is a
		 * publication in the given topic
		 *
		 * @param topic:string the topic to subscribe to
		 * @param context used to keep "this" in context
		 * @param callback:function called when there's a publication
		 * @param priority:number(0-10) priority for the callback
		 */
publish: function( topic ) {
		if ( typeof topic !== "string" ) {
			throw new Error( "You must provide a valid topic to publish." );
		}

		var args = [].slice.call( arguments, 1 ),
			topicSubscriptions,
			subscription,
			length,
			i = 0,
			ret;

		if ( !subscriptions[ topic ] ) {
			return true;
		}

		topicSubscriptions = subscriptions[ topic ].slice();
		for ( length = topicSubscriptions.length; i < length; i++ ) {
			subscription = topicSubscriptions[ i ];
			ret = subscription.callback.apply( subscription.context, args );
			if ( ret === false ) {
				break;
			}
		}
		return ret !== false;
	},

	subscribe: function( topic, context, callback, priority ) {
		if ( typeof topic !== "string" ) {
			throw new Error( "You must provide a valid topic to create a subscription." );
		}

		priority = priority || 5;

		var topicIndex = 0,
			topics = topic.split( /\s/ ),
			topicLength = topics.length,
			added;
		for ( ; topicIndex < topicLength; topicIndex++ ) {
			topic = topics[ topicIndex ];
			added = false;
			if ( !subscriptions[ topic ] ) {
				subscriptions[ topic ] = [];
			}

			var i = subscriptions[ topic ].length - 1,
				subscriptionInfo = {
					callback: callback,
					context: context,
					priority: priority
				};

			for ( ; i >= 0; i-- ) {
				if ( subscriptions[ topic ][ i ].priority <= priority ) {
					subscriptions[ topic ].splice( i + 1, 0, subscriptionInfo );
					added = true;
					break;
				}
			}

			if ( !added ) {
				subscriptions[ topic ].unshift( subscriptionInfo );
			}
		}

		return callback;
	},

	unsubscribe: function( topic, context, callback ) {
		if ( typeof topic !== "string" ) {
			throw new Error( "You must provide a valid topic to remove a subscription." );
		}

		if ( arguments.length === 2 ) {
			callback = context;
			context = null;
		}

		if ( !subscriptions[ topic ] ) {
			return;
		}

		var length = subscriptions[ topic ].length,
			i = 0;

		for ( ; i < length; i++ ) {
			if ( subscriptions[ topic ][ i ].callback === callback ) {
				if ( !context || subscriptions[ topic ][ i ].context === context ) {
					subscriptions[ topic ].splice( i, 1 );
					
					// Adjust counter and length for removed item
					i--;
					length--;
				}
			}
		}
	}
}
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Skillset Fetcher
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Fetches the skillset 
*/

Tl2calc.SkillsetFetcher = function() {

	var that = this;

	/*
	 * Called during transfer progress
	*/
	var transferProgress = function (event) {
		//TO-DO: SHOW LOADING
	}

	/*
	 * Called when the transfer is complete
	*/
	var transferComplete = function (event) {
		if (event.target.status === 200) {
			data = JSON.parse(event.target.responseText);
			Tl2calc.Mailman.publish('skillsetLoaded', data.skillset);
			Tl2calc.Mailman.subscribe('characterChanged', that, fetch);
		}
	};

	/*
	 * Called when the transfer is aborted or fails
	*/
	var transferFailed = function (event) {
		//TO-DO: ADD ERROR HANDLING
	};

	/*
	 * Asynchronously load the given character's skillset
	*/
	var fetch = function(character) {
		Tl2calc.Mailman.unsubscribe('characterChanged', that, fetch);
		// Ajax request
		var request = new XMLHttpRequest();
		request.addEventListener('progress', transferProgress);
		request.addEventListener('load', transferComplete);
		request.addEventListener('error', transferFailed);
		request.addEventListener('abort', transferFailed);
		request.overrideMimeType("application/json"); // Should be set by server
		request.open('GET', 'characters/' + character + '/skillset.json', true);
		request.send();
	}

	Tl2calc.Mailman.subscribe('characterChanged', that, fetch);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Skillset Descriptor
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Provides access to skillset data
*/

Tl2calc.SkillsetDescriptor = function(){

	// Object containing the skillset information (skills, descriptions, tiers)
	var _skillset;

	/*
	 * Update to the current skillset
	*/
	var update = function(skillset) {
		_skillset = skillset;
	}

	var describe = function(property, options) {

		// Options
		var options = options || {};
		var tree = options.tree || 0;
		var skill = options.skill || 0;
		var tier = options.tier || 0;
		var status = options.status || 'active';

		// Stores the value of the requested property
		var result;

		// Possible properties
		switch(property) {
			case 'treeName':
				result = _skillset.trees[tree].name;
				Tl2calc.Mailman.publish('propertyDescribed:treeName,' + tree, result);
				break;
			case 'skillName':
				result = _skillset.trees[tree].skills[skill].name;
				Tl2calc.Mailman.publish(
					'propertyDescribed:skillName,' + tree + ',' + skill,
					result);
				break;
			case 'skillIcon':
				result = _skillset.trees[tree].skills[skill].icon;
				Tl2calc.Mailman.publish(
					'propertyDescribed:skillIcon,' + tree + ',' + skill,
					result);
				break;
			case 'skillAll':
				result = _skillset.trees[tree].skills[skill];
				Tl2calc.Mailman.publish('propertyDescribed:skillAll',	result);
				break;
		}
	}

	Tl2calc.Mailman.subscribe('describeProperty', this, describe);
	Tl2calc.Mailman.subscribe('skillsetLoaded', this, update, 0);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Build Manager
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Provides methods to serialize/parse a build to/from a URL
*/

Tl2calc.BuildManager = function() {

	/*
	 * Returns a URL parameter
	 * From: https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.search
	*/
	var getParameter = function(parameter) {
	  return decodeURI(
			window.location.search.replace(
				new RegExp(
					'^(?:.*[&\\?]'
					+ encodeURI(parameter).replace(/[\.\+\*]/g, '\\$&')
					+ '(?:\\=([^&]*))?)?.*$', 'i'
				),
				'$1'
			)
		);
	};

	/*
	 * Converts a hexadecimal digit to a decimal number: f -> 15
	*/
	var parsePoint = function (point) {
		return parseInt(point, 16) || 0;
	}

	/*
	 * Converts a decimal number to a hexadecimal digit: 15 -> f
	*/
	var encodePoint = function(point) {
		return parseInt(point, 10) ? point.toString(16) : 0;
	}

	/*
	 * Parse the URL and setup the build into the calculator
	*/
	var parseUrl = function() {

		// Variables for loops
		var trees = Tl2calc.Core.getTrees();
		var skills = Tl2calc.Core.getSkills();

		// Get current character from URL parameter (or load default character)
		var character = getParameter('class') || Tl2calc.Core.getCharacter();

		// Get points from URL parameter and split into an array
		var points = getParameter('points').split("");

		// Parse all the points obtained from the URL parameter
		for(var i = 0, u = trees * skills; i < u; i++){
			points[i] = parsePoint(points[i]);
		}

		Tl2calc.Core.setCharacter(character);

		//Set points
		for (var i = 0; i < trees; i++) {
			for (var j = 0; j < skills; j++) {
				Tl2calc.Core.setPoint(i, j, points[i * 10 + j]);
			}
		}
	}

	/*
	 * Encode the URL for build sharing
	*/
	var encodeBuild = function() {

		// Variables for loops
		var trees = Tl2calc.Core.getTrees();
		var skills = Tl2calc.Core.getSkills();

		// Current build variables
		var character = Tl2calc.Core.getCharacter();
		var points = Tl2calc.Core.getPoints();

		// Serialize points 15,10,0 -> fa0
		var pointsString = "";
		for(var i = 0; i < trees; i++) {
			for(var j = 0; j < skills; j++) {
				pointsString += encodePoint(points[i][j]);
			}
		}

		// Generate the URL for the current build
    var buildUrl =
			[location.protocol, '//', location.host, location.pathname].join('')
			+ '?class='	+ Tl2calc.Core.getCharacter()
			+ '&points=' + pointsString;

    //Update browser URL
    history.replaceState(
			{calc: "points"},
			"TL2 Calculator Saved Build",
			buildUrl);

		Tl2calc.Mailman.publish('buildEncoded', buildUrl);
	}

	Tl2calc.Mailman.subscribe('characterChanged', this, encodeBuild);
	Tl2calc.Mailman.subscribe('pointChanged', this, encodeBuild);

	// Initialize after DOM is ready (with low priority so UI can load first)
	Tl2calc.Mailman.subscribe('windowLoaded', this, parseUrl, 10);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Portraits
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates Portrait object on all portrait elements
*/

Tl2calc.Portraits = function() {

	var initialize = function() {
		var portraits = [];
		var elements = document.getElementsByClassName('portrait');
		for(var i = 0, u = elements.length; i < u; i++) {
			portraits[i] = new Portrait(elements[i], elements[i].getAttribute('data-character'));
		}
	}

	var Portrait = function(element, character) {

		var display = function() {
			Tl2calc.Core.setCharacter(character);
		}

		/*
		 * Toggle the portraits
		*/
		var toggle = function(characterReq) {
        if (characterReq === character) {
            element.className = element.className.replace(new RegExp('(?:^|\\s)' + 'inactive' + '(?!\\S)', 'g'), '');
            if (!element.className.match(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'))) {
                element.className += " active";
            }
        } else {
            element.className = element.className.replace(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'), '');
            if (!element.className.match(new RegExp('(?:^|\\s)' + 'inactive' + '(?!\\S)', 'g'))) {
                element.className += " inactive";
            }
        }
		}

		// Listen to clicks
		element.addEventListener('click', display);
		Tl2calc.Mailman.subscribe('characterChanged', this, toggle);
	}

	Tl2calc.Mailman.subscribe('windowLoaded', this, initialize);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Tabs
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates Tab object on all tab elements
*/

Tl2calc.Tabs = function() {

	/*
	 * Initialize the Tab object on all tab elements
	*/
	var initialize = function() {
		var tabs = [];
		var elements = document.getElementsByClassName('tab');
		for(var i = 0, u = elements.length; i < u; i++){
			tabs[i] =	new Tab(elements[i], i);
		}
	}

	/*
	 * Tab object
	*/
	var Tab = function(element, tree) {

		var tabName = element.getElementsByClassName('tab-name')[0];

		/*
		 * Publish showTree for all trees
		*/
		var display = function(e) {
			Tl2calc.Mailman.publish('showTree', tree);
		}

		/*
		 * Toggle the trees
		*/
		var toggle = function(treeReq) {
        if (treeReq === tree) {
            if (!element.className.match(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'))) {
                element.className += " active";
            }
        } else {
            element.className = element.className.replace(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'), '');
        }
		}

		/*
		 * Update the tab name
		*/
		var update = function(name) {
			tabName.innerHTML = name;
		}

		/*
		 * Request the tab name
		*/
		var request = function() {
			Tl2calc.Mailman.publish('describeProperty', 'treeName', { tree: tree });
		}

		// Listen to clicks
		element.addEventListener('click', display);

		Tl2calc.Mailman.subscribe('showTree', this, toggle);
		Tl2calc.Mailman.subscribe('propertyDescribed:treeName,' + tree, this, update);
		Tl2calc.Mailman.subscribe('skillsetLoaded', this, request, 10); 
	}

	// Initialize after DOM is ready
	Tl2calc.Mailman.subscribe('windowLoaded', this, initialize);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Tab Points
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates TabPoint object on all tab-points elements
*/

Tl2calc.TabPoints = function() {

	/*
	 * Initialize the Tab object on all tab elements
	*/
	var initialize = function() {
		var tabPoints = [];
		var elements = document.getElementsByClassName('tab-points');
		for(var i = 0, u = elements.length; i < u; i++){
			tabPoints[i] = new TabPoint(elements[i], i);
		}
	}

	/*
	 * TabPoint object
	*/
	var TabPoint = function(element, tree) {

		/*
		 * Update points spent in tree
		*/
		var update = function() {
			element.innerHTML = Tl2calc.Core.getSpentInTree(tree);
		}

		Tl2calc.Mailman.subscribe('pointChanged:' + tree, this, update);
	}

	// Initialize after DOM is ready
	Tl2calc.Mailman.subscribe('windowLoaded', this, initialize);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Trees
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates Tree object on all tab elements
*/

Tl2calc.Trees = function() {

	/*
	 * Initialize the Tab object on all tab elements
	*/
	var initialize = function() {
		var trees = [];
		var elements = document.getElementsByClassName('tree');
		for(var i = 0, u = elements.length; i < u; i++){
			trees[i] = new Tree(elements[i], i);
		}
	}

	/*
	 * Tree Object
	*/
	var Tree = function(element, tree) {

		// Toggle the trees
		var toggle = function(treeReq) {
        if (treeReq === tree) {
            if (!element.className.match(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'))) {
                element.className += " active";
            }
        } else {
            element.className = element.className.replace(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'), '');
        }
		}
		
		Tl2calc.Mailman.subscribe('showTree', this, toggle);
	}

	// Initialize after DOM is ready
	Tl2calc.Mailman.subscribe('windowLoaded', this, initialize);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Skill Bars
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates SkillBar object on all skill-bar elements
*/

Tl2calc.SkillBars = function() {

	// Step size (in px)
	var stepSize;

	// Knob width (in px)
	var knobWidth;

	// Max skill level
	var skillMax = Tl2calc.Core.getSkillMax();

	/*
	 * Initialize the SkillBar object on all skill-bar elements
	*/
	var initialize = function() {
		//Variables used to identify elements
		var elements = document.getElementsByClassName('skill-bar');
		var skills = Tl2calc.Core.getSkills();

		//Update these variable now that DOM is ready
		stepSize = elements[0].offsetWidth / (skillMax+2);
		knobWidth = elements[0].getElementsByClassName('skill-bar-knob')[0].offsetWidth;

		var bars = [];
		//Initiate SkillBar Objects
		for(var i = 0, u = elements.length; i < u; i++){
			var rowSize = Math.floor(i/skills);
			bars[i] = new SkillBar(elements[i], rowSize, i - skills * rowSize);
		}
	}

	/*
	 * SkillBar object
	*/
	var SkillBar = function(element, tree, skill) {

		// Variables that should only be queried once per SkillBar object
		var knob = element.getElementsByClassName('skill-bar-knob')[0];
		var fill = element.getElementsByClassName('skill-bar-fill')[0];

		/*
		 * Update skill-bar visual elements
		*/
		var update = function(level) {
			knob.style.left = stepSize * level + 'px';
			fill.style.width = stepSize * level + knobWidth / 2 + 'px';
		}

		/*
		 * Follow the mouse to get the skill level
		*/
		var follow = function(e) {

			// Get level from the mouse position
			var level = Math.floor(
				(e.clientX - element.getBoundingClientRect().left) / stepSize);

			// Set level within acceptable boundaries
			level = level > skillMax ? skillMax : level;
			level = level < 0 ? 0 : level;

			// Set Point
			Tl2calc.Core.setPoint(tree, skill, level);
		}

		/*
		 * Begin tracking mouse movement
		*/
		var start = function(e) {
			follow(e);
			window.addEventListener('mousemove', follow);
		}

		/*
		 * End tracking of mouse movement
		*/
		var stop = function(e) {
			window.removeEventListener('mousemove', follow);
		}

		// Add event listeners
		element.addEventListener('mousedown', start);
		window.addEventListener('mouseup', stop);

		// Subscribe to level change
		Tl2calc.Mailman.subscribe(
			'pointChanged:' + tree + ',' + skill,
			this,
			update);
	}

	// Initialize after DOM is ready
	Tl2calc.Mailman.subscribe('windowLoaded', this, initialize);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Skill Levels
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates SkillLevel object on all skill-level elements
*/

Tl2calc.SkillLevels = function() {

	// Max skill level
	var skillMax = Tl2calc.Core.getSkillMax();

	/*
	 * Initialize the SkillLevel object on all skill-level elements
	*/
	var initialize = function() {
		var elements = document.getElementsByClassName('skill-level');
		var skills = Tl2calc.Core.getSkills();
		var levels = [];
		for(var i = 0, u = elements.length; i < u; i++){
			var rowSize = Math.floor(i/skills);
			levels[i] = new SkillLevel(elements[i], rowSize, i - skills * rowSize);
		}
	}

	/*
	 * SkillLevel object
	*/
	var SkillLevel = function(element, tree, skill) {

		/*
		 * Update skill-bar visual elements
		*/
		var update = function(level) {
			element.value = level;
		}

		/*
		 * Follow changes
		*/
		var follow = function(e) {

			// Don't do anything if input is empty (quality of life improvement)
			if(e.target.value == "") {
				return;
			}

			// Get current input
			var level = parseInt(e.target.value, 10) || 0;

			// Set level within acceptable boundaries
			level = level > skillMax ? skillMax : level;
			level = level < 0 ? 0 : level;

			// Publish level change
			Tl2calc.Core.setPoint(tree, skill, level);
		}

		/*
		 * Check if SkillLevel is empty after the user has done editing it. If yes,
		 * reset to the current level.
		 *
		 * This is done as part of a quality of life improvement where we don't
		 * update the input if it is empty on the keyup event because it would add a
		 * 0 in front of the number the user is typing.
		*/
		var checkEmpty = function(e) {
			if(e.target.value == "") {
				update(Tl2calc.Core.getPoint(tree, skill));
			}
		}

		// Add event listeners
		element.addEventListener('keyup', follow);
		element.addEventListener('change', checkEmpty);

		// Subscribe to level change
		Tl2calc.Mailman.subscribe(
			'pointChanged:' + tree + ',' + skill,
			this,
			update);
	}

	// Initialize after DOM is ready
	Tl2calc.Mailman.subscribe('windowLoaded', this, initialize);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Skill Names
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates SkillLevel object on all skill-level elements
*/

Tl2calc.SkillNames = function() {

	/*
	 * Initialize the SkillLevel object on all skill-level elements
	*/
	var initialize = function() {
		var names = [];
		var elements = document.getElementsByClassName('skill-name');
		var skills = Tl2calc.Core.getSkills();
		for(var i = 0, u = elements.length; i < u; i++){
			var rowSize = Math.floor(i/skills);
			names[i] = new SkillName(elements[i], rowSize, i - skills * rowSize);
		}
	}

	/*
	 * SkillName object
	*/
	var SkillName = function(element, tree, skill) {

		/*
		 * Update skill-name
		*/
		var update = function(name) {
			element.innerHTML = name;
		}

		var request = function(){
			Tl2calc.Mailman.publish(
				'describeProperty',
				'skillName',
				{ tree: tree, skill: skill});
		}

		// Initialize after DOM is ready (low priority)
		Tl2calc.Mailman.subscribe(
			'propertyDescribed:skillName,' + tree + ',' + skill,
			this,
			update);
		Tl2calc.Mailman.subscribe('skillsetLoaded', this, request, 10);
	}

	// Initialize after DOM is ready (low priority)
	Tl2calc.Mailman.subscribe('windowLoaded', this, initialize);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Skill Icons
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates SkillIcon object on all skill-icon elements
*/

Tl2calc.SkillIcons = function() {

	/*
	 * Initialize the SkillIcon object on all skill-icon elements
	*/
	var initialize = function() {
		var elements = document.getElementsByClassName('skill-icon');
		var skills = Tl2calc.Core.getSkills();
		var icons = [];
		for(var i = 0, u = elements.length; i < u; i++){
			var rowSize = Math.floor(i/skills);
			icons[i] = new SkillIcon(elements[i], rowSize, i - skills * rowSize);
		}
	}

	/*
	 * SkillIcon object
	*/
	var SkillIcon = function(element, tree, skill) {

		/*
		 * Update skill-icon
		*/
		var update = function(level) {
			// Update icon if leveled up
			if( level > 0 ) {

				// Remove inactive class
				element.className = element.className.replace(new RegExp('(?:^|\\s)' + 'inactive' + '(?!\\S)', 'g'), '');
			} else {

				// Add inactive class
				if (!element.className.match(new RegExp('(?:^|\\s)' + 'inactive' + '(?!\\S)', 'g'))) {
					element.className += " inactive";
				}
			}
			element.style.backgroundImage = "url('characters/" + Tl2calc.Core.getCharacter() + "/icons.jpg')";
			element.style.backgroundPosition = -skill * 64 + "px " + -tree * 64 + "px";
		}

		/*
		 * Request an initial icon after skillset has loaded
		*/
		var firstUpdate = function() {
			// Request an updated icon
			update(Tl2calc.Core.getPoint(tree, skill));
		}

		/*
		 * Request the description to show
		*/
		var showDescription = function(e) {
			Tl2calc.Mailman.publish('showDescription', tree, skill);
		}

		/*
		 * Request the description to hide
		*/
		var hideDescription = function(e) {
			Tl2calc.Mailman.publish('hideDescription');
		}

		element.addEventListener('mouseover', showDescription);
		element.addEventListener('mouseout', hideDescription);

		Tl2calc.Mailman.subscribe(
			'pointChanged:' + tree + ',' + skill,
			this,
			update);

		Tl2calc.Mailman.subscribe('skillsetLoaded', this, firstUpdate, 10);
	}

	// Initialize after DOM is ready (low priority)
	Tl2calc.Mailman.subscribe('windowLoaded', this, initialize);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Skill Description
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates SkillDescription object on the description element
*/

Tl2calc.SkillDescription = function() {
	var element = document.getElementsByClassName('description')[0];
	var name = element.getElementsByClassName('description-name')[0];
	var content = element.getElementsByClassName('description-content')[0];
	var tiers = element.getElementsByClassName('description-tier');
	var level;

	/*
	 * Hide the description element
	*/
	var hide = function(){
		element.style.left = '-100%';
	}

	/*
	 * Show the description element
	*/
	var show = function(tree, skill) {
		level = Tl2calc.Core.getPoint(tree, skill);
		if(skill > 5) {
			element.style.top = '0';
		} else {
			element.style.top = '50%';
		}
		element.style.left = 0;
		Tl2calc.Mailman.publish('describeProperty', 'skillAll', { tree: tree, skill: skill });
	}

	var highlightTier = function(tier) {
		var highlight = false;
		switch(tier) {
			case 0:
				if(level >= 5){
					highlight = true;
				}
				break;
			case 1:
				if(level >= 10){
					highlight = true;
				}
				break;
			case 2:
				if(level >= 15){
					highlight = true;
				}
				break;
		}
		if(highlight){
			if (!tiers[tier].className.match(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'))) {
				tiers[tier].className += " active";
			}
		} else {
			tiers[tier].className = tiers[tier].className.replace(new RegExp('(?:^|\\s)' + 'active' + '(?!\\S)', 'g'), '');
		}
	}

	var update = function(skill) {
		name.innerHTML = skill.name;
		content.innerHTML = skill.description;
		for(var i = 0; i < 3; i++) {
			tiers[i].innerHTML = typeof skill.tiers === 'undefined' ? '' : skill.tiers[i];
			highlightTier(i);
		}
	}

	Tl2calc.Mailman.subscribe('propertyDescribed:skillAll', this, update);

	Tl2calc.Mailman.subscribe('showDescription', this, show);
	Tl2calc.Mailman.subscribe('hideDescription', this, hide);
}();


/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Share Link
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Initiates SkillLink object on the share-link element
*/

Tl2calc.ShareLink = function() {
	var element = document.getElementsByClassName('share')[0]
		.getElementsByClassName('link')[0];

	var update = function(link) {
		element.innerHTML = link;
	}

	Tl2calc.Mailman.subscribe('buildEncoded', this, update);
}();

window.onload = function() {
	Tl2calc.Mailman.publish('windowLoaded');
}
