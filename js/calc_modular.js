/*

DOES NOT WORK. BROKEN CODE.

Author: Robert Al-Romhein (https://github.com/ralrom)
License: Do whatever you want with this

Browser Support: IE9+

Designed with module pattern
Read more about modular patten: http://yuiblog.com/blog/2007/06/12/module-pattern/
*/

//Namespace
if(typeof TL2CALCULATOR === 'undefined'){
  var TL2CALCULATOR = {};
} else { // Throw right away if taken
  throw "Namespace Conflict: variable TL2CALCULATOR is already defined.";
}

//Personnal shortcut for dispatching events (compatible with IE9+)
TL2CALCULATOR.EventDispatcher = function(){
  return {
    send: function(eventType, canBubble, cancelable, detail){
      var notifier = document.createEvent("CustomEvent");
      notifier.initCustomEvent(eventType, canBubble, cancelable, detail);
      document.dispatchEvent(notifier);
    }
  }
}();

TL2CALCULATOR.UI = function(){
  return {
    //Only call after DOMContentLoaded or you will get errors
    initialize: function(){
      this.Tabs.initialize();
      this.Trees.initialize();
    }
  }
}();

TL2CALCULATOR.UI.Helper = function(){
  return {
    addClass: function(c, className){
      if ( !className.match(new RegExp('(?:^|\\s)' + c + '(?!\\S)', 'g'))) {
        return className += " "+c;
      } else {
        return className;
      }
    },
    removeClass: function(c, className){
      return className.replace(new RegExp('(?:^|\\s)' + c + '(?!\\S)', 'g'), '');
    }
  }
}();

TL2CALCULATOR.Skill = function(elem, XMLData){
  var name = XMLData.getElementsByTagName("name")[0].innerHTML;
  var active = {"xPos": XMLData.getElementsByTagName("active")[0].getAttribute("xPos"), "yPos": XMLData.getElementsByTagName("active")[0].getAttribute("yPos")};
  var inactive = {"xPos": XMLData.getElementsByTagName("inactive")[0].getAttribute("xPos"), "yPos": XMLData.getElementsByTagName("inactive")[0].getAttribute("yPos")}
  var level = 0;
  var description = XMLData.getElementsByTagName("description")[0].innerHTML;
  var tiers = [XMLData.getElementsByTagName("tier")[0], XMLData.getElementsByTagName("tier")[1], XMLData.getElementsByTagName("tier")[2]];
  return {
    getName: function(){
      return name;
    },
    getActive: function(){
      return active;
    },
    getInactive: function(){
      return inactive;
    },
    getLevel: function(){
      return level;
    },
    setLevel: function(lvl){
      level = lvl;
      TL2CALCULATOR.EventDispatcher.send("skillChanged", false, false, {"level": lvl})
    },
    getDescrition: function(){
      return description;
    },
    getTier: function(tier){
      return tiers[tier];
    }
  }
}

TL2CALCULATOR.Skills = function(){
  var data = [];
  var initialize = function(event){
    var XMLData = event.detail.responseXML;
    var XMLTrees = XMLData.getElementsByTagName("tree");
    for(var i = 0, m = XMLTrees.length; i < m; i++){
      data[i] = [];
      var XMLSkills = XMLTrees[i].getElementsByTagName("skill");
      for(var j = 0, n = XMLSkills.length; j < n; j++){
        data[i][j] = new TL2CALCULATOR.Skill(document.getElementsByClassName("tree")[i].getElementsByClassName("skill")[j], XMLSkills[j]);
        TL2CALCULATOR.EventDispatcher.send("skillReady", false, false, {"tree": i, "skill": j})
      }
    }
    return {
      data: data
    }
  }
  document.addEventListener("xmlReady", function(event){initialize(event)});
}();

TL2CALCULATOR.UI.Skill = function(elem){
  var elemTitle = elem.getElementsByClassName("skill-title")[0];
  var elemIcon = elem.getElementsByClassName("skill-icon")[0];
  var elemLevelNumber = elem.getElementsByClassName("skill-level-number")[0];
  var elemLevelBar = elem.getElementsByClassName("skill-level-bar")[0];
  var setLevel = function(level){
    elemLevelNumber.innerHTML = level;
    elemLevelBar.style.width = 100*level/15+"%";
  }
  return {
    elem: elem,
    setTitle: function(title){
      elemTitle.innerHTML = title;
    },
    setIcon: function(xPos, yPos){
      elemIcon.style.backgroundPosition = "-"+xPos+"px -"+yPos+"px";
    },
    setLevel: function(level){
      setLevel(level);
    }
  }
}

TL2CALCULATOR.UI.Skills = function(){
  var UISkills = [];
  var initialize = function(event){
    var elemTrees = document.getElementsByClassName("tree");
    for(var i = 0, m = elemTrees.length; i < m; i++){
      UISkills[i] = [];
      var elemSkills = elemTrees[i].getElementsByClassName("skill");
      for(var j = 0, n = elemSkills.length; j < n; j++){
        UISkills[i][j] = new TL2CALCULATOR.UI.Skill(elemSkills[j]);
      }
    }
    document.addEventListener("skillReady", function(event){updateSkill(0, 0)});
  }
  var updateSkill = function(tree, skill){
    UISkills[tree][skill].setLevel(TL2CALCULATOR.Skills.data[tree][skill].getLevel());
  }
  document.addEventListener("xmlReady", initialize);
  return {
    skills: UISkills
  }
}();

TL2CALCULATOR.UI.Tabs = function(){
  var elemTabs;
  //Switch current Skill Tree and fire a custom event when this is done
  var show = function(tab){
    for(var i = 0, m = elemTabs.length; i < m; i++){
      elemTabs[i].className = TL2CALCULATOR.UI.Helper.removeClass("current-tab", elemTabs[i].className);
    }
    elemTabs[tab].className = TL2CALCULATOR.UI.Helper.addClass("current-tab", elemTabs[tab].className);
    //Dispatch Event so other UI modules can react
    TL2CALCULATOR.EventDispatcher.send("treeSwitch", false, false, {"tab": tab});
  };
  return {
    initialize: function(){
      elemTabs = document.getElementById("tabs").getElementsByClassName("tab");
      //Add click event listener to all tabs
      for(var i = 0, m = elemTabs.length; i < m; i++){
        elemTabs[i].addEventListener("click", function(event){show(event.target.getAttribute("data-tree"))});
      }
    }
  }
}();

TL2CALCULATOR.UI.Trees = function(){
  var elemTrees;
  //Switch current Skill Tree
  var show = function(tree){
    for(var i = 0, m = elemTrees.length; i < m; i++){
      //TO-DO: Use removeClass function instead
      elemTrees[i].className = TL2CALCULATOR.UI.Helper.removeClass("current-tree", elemTrees[i].className);
    }
    //TO-DO: Use addClass function instead
    elemTrees[tree].className = TL2CALCULATOR.UI.Helper.addClass("current-tree", elemTrees[tree].className);
  };
  return {
    initialize: function(){
      elemTrees = document.getElementsByClassName("tree");
      document.addEventListener("treeSwitch", function(event){show(event.detail.tab)});
    }
  }
}();

//Reads and Writes URL
TL2CALCULATOR.URLHelper = function(){
  //Convert decimal to hex (15 -> f). Returns 0 if invalid parameter
  var atob = function (a){
    a = parseInt(a, 10);
    if(isNaN(a)){ // a could not be parsed as int
      return 0;
    } else { // a was parsed as int
      return a.toString(16);
    }
  };
  //Convert hex to decimal (f -> 15). Returns 0 if invalid parameter
  var btoa = function (b){
    b = parseInt(b, 16);
    if(isNaN(b)){ // b could not be parsed as int
      return 0;
    } else { // b was parsed as int
      return b;
    }
  };
  //Convert decimal array to hex string, returns empty string if points is empty
  var compress = function (points){
    var compressed = "";
    if(points instanceof Array){
      for(var i = 0, m = points.length; i < m; i++){
        compressed += atob(points[i]);
      }
    }
    return compressed;
  };
  //Convert hex string to decimal array, returns empty array if points is empty
  var decompress = function (points){
    var decompressed = [];
    if(typeof points === "string"){ // Points is an array
      //Split the points string into individual hex digits
      points = points.split("");
      //Convert hex digit to decimal & put in array
      for(var i = 0, m = points.length; i < m; i++){
        decompressed[i] = btoa(points[i]);
      }
    }
    return decompressed;
  };
  var sanitizePoint = function(point){
    point = parseInt(point, 10);
    if(isNaN(point)){ // Point is not a number
      return 0;
    } else {
      if(point > 15){ // Point is above max
        return 15;
      } else if (point < 0){ // Point is below min
        return 0;
      } else {
        return point; // Point is OK
      }
    }
  };
  return {
    //Returns URL parameter [Taken from: https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.search]
    getParameter: function(parameter){
      return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(parameter).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    },
    //Sanitize points from URL parameter
    getPoints: function(){
      //this.decompress returns empty array if points parameter is null, this is handled below
      var points = decompress(getParameter("points"));
      //Count points spent so far
      var pointsSpent = 0;
      //Make sure we have 30 points & all are sanitized
      //Handles empty array
      for(var i = 0; i < 30; i++){
        //Sanitize the point
        points[i] = sanitizePoint(points[i]);
        //Make sure maximum skill points are not exceeded (132 Max)
        points[i] = points[i] + pointsSpent > 132 ? 132 - pointsSpent : points[i];
        //Update points spent
        pointsSpent += points[i];
      }
      return points;
    }
  }
}();

TL2CALCULATOR.XMLLoader = function(){
  return {
    transferProgress: function(event){
      //Send xmlProgress event
      TL2CALCULATOR.EventDispatcher.send("xmlProgress", false, false, {"lengthComputable": event.lengthComputable, "loaded": event.loaded, "total": event.total});
    },
    transferComplete: function(event){
      if(event.target.status === 200){
        //Send xmlLoaded event
        TL2CALCULATOR.EventDispatcher.send("xmlReady", false, false, {"responseXML": event.target.responseXML});
      } else {
        //Send xmlFailed event
        TL2CALCULATOR.EventDispatcher.send("xmlFailed", false, false);
      }
    },
    //Called for both abort & cancel
    transferFailed: function(event){
      //Send xmlFailed event
      TL2CALCULATOR.EventDispatcher.send("xmlFailed", false, false);
      console.error("Class data transfer failed");
    },
    //Load XML file of given player class
    loadClass: function(className){
      var request = new XMLHttpRequest()
      request.addEventListener("progress", this.transferProgress)
      request.addEventListener("load", this.transferComplete)
      request.addEventListener("error", this.transferFailed)
      request.addEventListener("abort", this.transferFailed)
      request.open("GET", "xml/" + className + ".xml", true)
      request.send()
    }
  }
}();

window.onload = function(){
  TL2CALCULATOR.UI.initialize();
  TL2CALCULATOR.XMLLoader.loadClass("outlander");
}
