//Namespace (throw right away if taken)
if(typeof TL2CALC !== 'undefined'){
  throw new Error('Namespace Conflict: variable TL2CALCULATOR is already defined.');
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* TL2CALC - VERSION 1.0.0 - BASE LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var TL2CALC = function(){
  //Protected Constants
  var constants = {
    PLAYERS: ['outlander', 'embermage', 'berserker', 'engineer'],
    POINT_MIN: 0,
    POINT_MAX: 15,
    POINTS_GIVEN: 132,
    TREES: 3,
    SKILLS: 10,
  };
  //Initialize points for given TREES & SKILLS (assumes each tree has same # of skills)
  var points = [];
  for(var i = 0; i < constants.TREES; i++){
    points[i] = [];
    for(var j = 0; j < constants.SKILLS; j++){
      points[i][j] = 0;
    }
  }
  return {
    //Retrieves a constant
    get: function(name){
      return constants[name];
    },
    getPoint: function(tree, skill){
      return points[tree][skill];
    },
    getPoints: function(){
      return points;
    },
    setPoint: function(tree, skill, level){
      level = Number(level);
      if(isNaN(level)){
        level = 0;
      }
      //Set level within boundaries
      level = level > constants.POINT_MAX ? 15 : level;
      level = level < constants.POINT_MIN ? 0 : level;
      //Make sure we don't spend more points than given
      var spent = this.getSpent();
      level = spent + level > constants.POINTS_GIVEN ? constants.POINTS_GIVEN - spent : level;
      //Update point
      points[tree][skill] = level;
      //Notify subscribers
      //General Event
      TL2CALC.CORE.Postman.publish('TL2CALC.EVENT.SetPoint');
      //Specific Event
      TL2CALC.CORE.Postman.publish('TL2CALC.EVENT.SetPoint.'+tree+'.'+skill, level);
    },
    getTreeSum: function(tree){
      var sum = 0;
      for(var i = 0; i < constants.SKILLS; i++){
        sum += points[tree][i];
      }
      return sum;
    },
    getSpent: function(){
      var spent = 0;
      for(var i = 0; i < constants.TREES; i++){
        spent += this.getTreeSum(i);
      }
      return spent;
    },
    init: function(){
      TL2CALC.CORE.Postman.publish('TL2CALC.EVENT.Init');
    }
  };
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* CORE LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Modules in the this layer can be accessed directly by other modules
* Modules in other layers SHOULD NOT be directly accessed
*/
TL2CALC.CORE = {};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* CLASSES MODULE - CORE LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.CORE.Classes = function(){
  return {
    //Adds CSS class (if not already there)
    add: function(c, className){
      if ( !className.match(new RegExp('(?:^|\\s)' + c + '(?!\\S)', 'g'))) {
        return className += " "+c;
      } else {
        return className;
      }
    },
    //Removes CSS class
    remove:function(c, className){
      return className.replace(new RegExp('(?:^|\\s)' + c + '(?!\\S)', 'g'), '');
    }
  }
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* POSTMAN MODULE - CORE LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Inspired by AmplifyJS
* http://amplifyjs.com
* Copyright 2011 - 2013 appendTo LLC. (http://appendto.com/team)
* Dual licensed under the MIT or GPL licenses.
* http://appendto.com/open-source-licenses
*/
TL2CALC.CORE.Postman = function(){
  var subscribers = [];
  return {
    subscribe: function(topic, context, callback){
      if(typeof topic !== 'string'){
        throw new Error('You must provide a topic as a string!');
      }
      if(typeof subscribers[topic] === 'undefined'){
        subscribers[topic] = [];
      }
      subscribers[topic].push({context: context, callback: callback});
    },
    unsubscribe: function(topic, context, callback){
      for(var i = 0, m = subscribers[topic].length; i < m; i++){
        if(subscribers[topic][i].callback === callback && subscribers[topic][i].context == context){
          subscribers[topic].splice(i, 1);
          i--;
          m--;
        }
      }
    },
    publish: function(topic){
      //Get arguments (except topic) as array
      var args = [].slice.call(arguments, 1);
      //Stop if there are no subscribers
      if(typeof subscribers[topic] === 'undefined'){
        return true;
      }
      //Callback all subscribers
      for(var i = 0, m = subscribers[topic].length; i < m; i++){
        subscribers[topic][i].callback.apply(subscribers[topic][i].context, args);
      }
    }
  }
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* APPLICATION LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Modules in this layer should be decoupled and should only handle application logic
* Requests between modules should pass through TL2CALC.CORE.Postman
*/

TL2CALC.APP = {};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* URL MODULE - APPLICATION LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.APP.URL = function(){
  //Convert decimal to hex (15 -> f). Returns 0 if invalid parameter
  var atob = function (a){
    a = parseInt(a, 10);
    if(isNaN(a)){
      return 0;
    } else {
      return a.toString(16);
    }
  };
  //Convert hex to decimal (f -> 15). Returns 0 if invalid parameter
  var btoa = function (b){
    b = parseInt(b, 16);
    if(isNaN(b)){
      return 0;
    } else {
      return b;
    }
  };
  //Convert decimal array to hex string, returns empty string if points is empty
  var toBase16String = function (points){
    var result = '';
    if(points instanceof Array){
      for(var i = 0, m = points.length; i < m; i++){
        for(var j = 0, n = points[i].length; j < n; j++){
          result += atob(points[i][j]);
        }
      }
    }
    return result;
  };
  //Convert hex string to decimal array, returns empty array if points is empty
  var toBase10Array = function (points){
    var result = [];
    if(typeof points === 'string'){ // Points is an array
      //Split the points string into individual hex digits
      points = points.split('');
      //Convert hex digit to decimal & put in array
      for(var i = 0, m = points.length; i < m; i++){
        result[i] = btoa(points[i]);
      }
    }
    return result;
  };
  //Returns URL parameter [Taken from: https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.search]
  var getParameter = function(parameter){
    return decodeURI(window.location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURI(parameter).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1'));
  };
  //Get points from URL parameter & set TL2CALC's points
  var insertGETPoints = function(){
    var points = toBase10Array(getParameter('points'));
    for(var i = 0, m = TL2CALC.get('TREES'); i < m; i++){
      for(var j = 0, n = TL2CALC.get('SKILLS'); j < n; j++){
        //TL2CALC.setPoint will set undefined to 0
        //We want this to trigger the setPoint notification
        TL2CALC.setPoint(i, j, points[10*i+j]);
      }
    }
  };
  var getPlayer = function(){
    var player = getParameter('class');
    var allowedPlayers = TL2CALC.get('PLAYERS');
    TL2CALC.CORE.Postman.publish('TL2CALC.RESPONSE.Player', allowedPlayers.indexOf(player) > -1 ? player : allowedPlayers[0]);
  };
  var serializePoints = function(){
    TL2CALC.CORE.Postman.publish('TL2CALC.RESPONSE.SerializedPoints', toBase16String(TL2CALC.getPoints()));
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.REQUEST.SerializedPoints', this, serializePoints);
  TL2CALC.CORE.Postman.subscribe('TL2CALC.REQUEST.GetPoints', this, insertGETPoints);
  TL2CALC.CORE.Postman.subscribe('TL2CALC.REQUEST.Player', this, getPlayer);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* DATALOADER MODULE - APPLICATION LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.APP.DataLoader = function(){
  var transferProgress= function(event){
  };
  var transferComplete = function(event){
    if(event.target.status === 200){
      TL2CALC.CORE.Postman.publish('TL2CALC.EVENT.DataLoaded', event.target.responseText);
    }
  };
  //Called for both abort & cancel
  var transferFailed = function(event){
  };
  var requestPlayer = function(){
    TL2CALC.CORE.Postman.publish('TL2CALC.REQUEST.Player');
  }
  //Load data file of given player
  var loadPlayer = function(player){
    TL2CALC.CORE.Postman.unsubscribe('TL2CALC.RESPONSE.Player', this, loadPlayer);
    var request = new XMLHttpRequest()
    request.addEventListener('progress', transferProgress);
    request.addEventListener('load', transferComplete);
    request.addEventListener('error', transferFailed);
    request.addEventListener('abort', transferFailed);
    request.open('GET', 'data/' + player + '.min.json', true);
    request.send();
  };
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.Init', this, requestPlayer);
  TL2CALC.CORE.Postman.subscribe('TL2CALC.RESPONSE.Player', this, loadPlayer);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* DATAFETCHER MODULE - APPLICATION LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.APP.DataFetcher = function(){
  var data;
  var init = function(response){
    data = JSON.parse(response);
    TL2CALC.CORE.Postman.publish('TL2CALC.EVENT.FetcherReady');
  };
  var getSkill = function(tree, skill){
    TL2CALC.CORE.Postman.publish('TL2CALC.RESPONSE.SkillData.'+tree+'.'+skill, data.skillset.tree[tree].skill[skill]);
  }
  var getIcon = function(tree, skill, level){
    var activity = level > 0 ? 'active' : 'inactive';
    TL2CALC.CORE.Postman.publish('TL2CALC.RESPONSE.SkillIcon.'+tree+'.'+skill, data.skillset.tree[tree].skill[skill].icons[activity]);
  }
  var getName = function(tree, skill){
    TL2CALC.CORE.Postman.publish('TL2CALC.RESPONSE.SkillName.'+tree+'.'+skill, data.skillset.tree[tree].skill[skill].name);
  }
  var getTreeName = function(tree){
    TL2CALC.CORE.Postman.publish('TL2CALC.RESPONSE.TreeName', data.skillset.tree[tree].name);
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.DataLoaded', this, init);
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.SkillEnter', this, getSkill);
  TL2CALC.CORE.Postman.subscribe('TL2CALC.REQUEST.TreeName', this, getTreeName);
  TL2CALC.CORE.Postman.subscribe('TL2CALC.REQUEST.SkillData', this, getSkill);
  TL2CALC.CORE.Postman.subscribe('TL2CALC.REQUEST.SkillName', this, getName);
  TL2CALC.CORE.Postman.subscribe('TL2CALC.REQUEST.SkillIcon', this, getIcon);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* UI LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Modules in this layer should be decoupled and should only handle UI
*/
TL2CALC.UI = function(){
  return "empty";
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* SKILLS MODULE - UI LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.UI.Skills = function(){
  //Skill object (reusable)
  var Skill = function(element, tree, skill) {
    var elemName = element.getElementsByClassName('skill-title')[0];
    var elemIcon = element.getElementsByClassName('skill-icon')[0];
    var elemLevelNumber = element.getElementsByClassName('skill-level-number')[0];
    var elemLevelBar = element.getElementsByClassName('skill-level-bar')[0];
    var setLevel = function(level){
      elemLevelNumber.innerHTML = level;
      elemLevelBar.style.width = 100*level/TL2CALC.get('POINT_MAX')+'%';
      //Request skill icon
      TL2CALC.CORE.Postman.publish('TL2CALC.REQUEST.SkillIcon', tree, skill, level);
    }
    var setIcon = function(icons){
      elemIcon.style.backgroundPosition = '-'+icons.xPos+'px -'+icons.yPos+'px';
    }
    var setName = function(name){
      elemName.innerHTML = name;
    }
    var onEnter = function(event){
      TL2CALC.CORE.Postman.publish('TL2CALC.EVENT.SkillEnter', tree, skill);
    }
    var onLeave = function(event){
      TL2CALC.CORE.Postman.publish('TL2CALC.EVENT.SkillLeave');
    }
    TL2CALC.CORE.Postman.subscribe('TL2CALC.RESPONSE.SkillName.'+tree+'.'+skill, this, setName);
    TL2CALC.CORE.Postman.subscribe('TL2CALC.RESPONSE.SkillIcon.'+tree+'.'+skill, this, setIcon);
    TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.SetPoint.'+tree+'.'+skill, this, setLevel);
    TL2CALC.CORE.Postman.publish('TL2CALC.REQUEST.SkillData', tree, skill);
    TL2CALC.CORE.Postman.publish('TL2CALC.REQUEST.SkillName', tree, skill);
    element.addEventListener('mouseenter', onEnter);
    element.addEventListener('mouseleave', onLeave);

  };
  //Create Skill objects
  var init = function(){
    var trees = document.getElementsByClassName('tree');
    for(var i = 0, m = TL2CALC.get('TREES'); i < m; i++){
      var skills = trees[i].getElementsByClassName('skill');
      for(var j = 0, n = TL2CALC.get('SKILLS'); j < n; j++){
        new Skill(skills[j], i, j);
      }
    }
    TL2CALC.CORE.Postman.publish('TL2CALC.REQUEST.GetPoints');
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.FetcherReady', this, init);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* SKILLBUTTONS MODULE - UI LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.UI.SkillButtons = function(){
  //SkillButton object (reusable)
  var SkillButton = function(element, tree, skill) {
    var change = function(event){
      var change = element.getAttribute('data-change');
      if(change == 'plus'){
        TL2CALC.setPoint(tree, skill, TL2CALC.getPoint(tree, skill)+1);
      } else if(change == 'minus'){
        TL2CALC.setPoint(tree, skill, TL2CALC.getPoint(tree, skill)-1);
      } else if(change == 'clear'){
        TL2CALC.setPoint(tree, skill, 0);
      }
    }
    element.addEventListener('click', change);
  };
  //Create SkillButton objects
  var init = function(){
    var trees = document.getElementsByClassName('tree');
    for(var i = 0, m = TL2CALC.get('TREES'); i < m; i++){
      var skills = trees[i].getElementsByClassName('skill');
      for(var j = 0, n = TL2CALC.get('SKILLS'); j < n; j++){
        var skillButtons = skills[j].getElementsByClassName('skill-button');
        for(var k = 0, o = skillButtons.length; k < o; k++){
          new SkillButton(skillButtons[k], i, j);
        }
      }
    }
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.DataLoaded', this, init);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* SKILLDISTRIBUTION MODULE - UI LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.UI.SkillDistribution = function(){
  //SkillDistribution object (only used once)
  var SkillDistribution = function(element) {
    var elemNumbers = element.getElementsByClassName('tree-total');
    var elemBars = element.getElementsByClassName('points-bar');
    //Create SkillButton objects
    var setDistribution = function(){
      for(var i = 0, m = TL2CALC.get('TREES'); i < m; i++){
        var treeSum = TL2CALC.getTreeSum(i)
        elemNumbers[i].innerHTML = treeSum;
        elemBars[i].style.width = 100*treeSum/TL2CALC.get('POINTS_GIVEN')+"%";
      }
    }
    TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.SetPoint', this, setDistribution);
  }
  var init = function(){
    new SkillDistribution(document.getElementById('points-box'));
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.Init', this, init);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* SHARELINK MODULE - UI LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
//TO-DO: MESSY CODE -> REWRITE WHEN POSSIBLE
TL2CALC.UI.ShareLink = function(){
  var ShareLink = function(element){
    var player;
    var points;
    var ready = {player: false, points: false};
    var setPlayer = function(pName){
      player = pName;
      ready.player = true;
    }
    var setPoints = function(serialPoints){
      points = serialPoints;
      ready.points = true;
      checkReady();
    }
    var checkReady = function(){
      if(ready.points && ready.player){
        setLink();
      }
    }
    var getData = function(){
      ready.points = false;
      ready.player = false;
      TL2CALC.CORE.Postman.publish('TL2CALC.REQUEST.Player');
      TL2CALC.CORE.Postman.publish('TL2CALC.REQUEST.SerializedPoints');
    }
    var setLink = function(){
      //Start Link as current page without query string
      var link = [location.protocol, '//', location.host, location.pathname].join('');
      link += '?class='+player+'&points='+points;
      element.innerHTML = link;
      //Display current skill point distribution in browser bar (Browser support: IE10+)
      history.replaceState({calc: "points"}, "TL2 Calc Saved Points", link);
    }
    TL2CALC.CORE.Postman.subscribe('TL2CALC.RESPONSE.Player', this, setPlayer);
    TL2CALC.CORE.Postman.subscribe('TL2CALC.RESPONSE.SerializedPoints', this, setPoints);
    TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.SetPoint', this, getData);
  };
  var init = function(){
    new ShareLink(document.getElementById('share-link'));
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.Init', this, init);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* TABS MODULE - UI LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.UI.Tabs = function(){
  var Tab = function(element, n){
    var setName = function(name){
      element.innerHTML = name;
      TL2CALC.CORE.Postman.unsubscribe('TL2CALC.RESPONSE.TreeName', this, setName);
    }
    var setFront = function(){
      element.className = TL2CALC.CORE.Classes.add('current-tab', element.className);
      TL2CALC.CORE.Postman.publish('TL2CALC.EVENT.Tab', n);
    }
    var setBack = function(){
      element.className = TL2CALC.CORE.Classes.remove('current-tab', element.className);
    }
    var position = function(tab){
      if(tab !== n){
        setBack();
      }
    }
    element.addEventListener('click', setFront);
    TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.Tab', this, position);
    TL2CALC.CORE.Postman.subscribe('TL2CALC.RESPONSE.TreeName', this, setName);
    TL2CALC.CORE.Postman.publish('TL2CALC.REQUEST.TreeName', n);
  }
  var init = function(){
    var elemTabs = document.getElementsByClassName('tab');
    for(var i = 0, m = TL2CALC.get('TREES'); i < m; i++){
      new Tab(elemTabs[i], i);
    }
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.DataLoaded', this, init);
}();
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* TREES MODULE - UI LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.UI.Trees = function(){
  var Tree = function(element, n){
    var setFront = function(){
      element.className = TL2CALC.CORE.Classes.add('current-tree', element.className);
    }
    var setBack = function(){
      element.className = TL2CALC.CORE.Classes.remove('current-tree', element.className);
    }
    var position = function(tab){
      if(tab !== n){
        setBack();
      } else {
        setFront();
      }
    }
    TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.Tab', this, position);
  }
  var init = function(){
    var elemTrees = document.getElementsByClassName('tree');
    for(var i = 0, m = TL2CALC.get('TREES'); i < m; i++){
      new Tree(elemTrees[i], i);
    }
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.DataLoaded', this, init);
}();
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* DESCRIPTION MODULE - UI LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.UI.Description = function(){
  var Descriptor = function(element){
    var elemTitle = document.getElementById('description-title');
    var elemDescription = document.getElementById('description');
    var elemTierWrapper = document.getElementById('tiers');
    var elemTier = {};
    elemTier = [];
    for(var i = 0; i < 3; i++){
      elemTier[i] = {};
      elemTier[i].title = element.getElementsByClassName('tier-title')[i];
      elemTier[i].description = element.getElementsByClassName('tier-description')[i];
    }
    var setup = function(data){
      elemTitle.innerHTML = data.name;
      elemDescription.innerHTML = data.description;
      if(typeof data.tiers !== 'undefined'){
        elemTierWrapper.style.display = 'block';
        for(var i = 0; i < 3; i++){
          elemTier[i].description.innerHTML = data.tiers.tier[i];
        }
      } else {
        elemTierWrapper.style.display = 'none';
      }
    }
    var update = function(level){
      for(var i = 0; i < 3; i++){
        elemTier[i].title.className = TL2CALC.CORE.Classes.remove('tier-obtained', elemTier[i].title.className);
        elemTier[i].description.className = TL2CALC.CORE.Classes.remove('tier-obtained', elemTier[i].description.className);
      }
      if(level >= 5){
        elemTier[0].title.className = TL2CALC.CORE.Classes.add('tier-obtained', elemTier[0].title.className);
        elemTier[0].description.className = TL2CALC.CORE.Classes.add('tier-obtained', elemTier[0].description.className);
      }
      if(level >= 10){
        elemTier[1].title.className = TL2CALC.CORE.Classes.add('tier-obtained', elemTier[1].title.className);
        elemTier[1].description.className = TL2CALC.CORE.Classes.add('tier-obtained', elemTier[1].description.className);
      }
      if(level == 15){
        elemTier[2].title.className = TL2CALC.CORE.Classes.add('tier-obtained', elemTier[2].title.className);
        elemTier[2].description.className = TL2CALC.CORE.Classes.add('tier-obtained', elemTier[2].description.className);
      }
    }
    var show = function(tree, skill){
      if(skill == 2 || skill == 5 || skill == 9){
        element.className = TL2CALC.CORE.Classes.remove("right", element.className);
        element.className = TL2CALC.CORE.Classes.add("left", element.className);
      } else {
        element.className = TL2CALC.CORE.Classes.remove("left", element.className);
        element.className = TL2CALC.CORE.Classes.add("right", element.className);
      }
      element.style.display = 'block';
      update(TL2CALC.getPoint(tree, skill));
      TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.SetPoint.'+tree+'.'+skill, this, update);
      TL2CALC.CORE.Postman.subscribe('TL2CALC.RESPONSE.SkillData.'+tree+'.'+skill, this, setup);
      TL2CALC.CORE.Postman.publish('TL2CALC.REQUEST.SkillData', tree, skill);
    }
    var hide = function(){
      element.style.display = 'none';
    }
    TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.SkillEnter', this, show);
    TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.SkillLeave', this, hide);
  }
  var init = function(){
    new Descriptor(document.getElementById('descriptor'));
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.Init', this, init);
}();

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* PORTRAITS MODULE - UI LAYER
* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
TL2CALC.UI.Portraits = function(){
  var Portrait = function(element, player){
    var setFront = function(){
      console.log('front');
      element.className = TL2CALC.CORE.Classes.add('class-selected', element.className);
    }
    var setBack = function(){
      element.className = TL2CALC.CORE.Classes.remove('class-selected', element.className);
    }
    var position = function(_player){
      if(player == _player){
        setFront();
      } else {
        setBack();
      }
    }
    TL2CALC.CORE.Postman.subscribe('TL2CALC.RESPONSE.Player', this, position);
  }
  var init = function(){
    var players = TL2CALC.get('PLAYERS');
    for(var i = 0, m = players.length; i < m; i++){
      new Portrait(document.getElementById('portrait-'+players[i]), players[i]);
    }
  }
  TL2CALC.CORE.Postman.subscribe('TL2CALC.EVENT.Init', this, init);
}();

window.onload = function(){
  TL2CALC.init();
}
