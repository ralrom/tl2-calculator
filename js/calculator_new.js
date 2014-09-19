function Skill(elemSkill, level, XMLdata){
  //Data
  this.data = {
    name: XMLdata.getElementsByTagName("name")[0].innerHTML,
    active: {"xPos": XMLdata.getElementsByTagName("active")[0].getAttribute("xPos"), "yPos": XMLdata.getElementsByTagName("active")[0].getAttribute("yPos")},
    inactive: {"xPos": XMLdata.getElementsByTagName("inactive")[0].getAttribute("xPos"), "yPos": XMLdata.getElementsByTagName("inactive")[0].getAttribute("yPos")},
    level: 0,
    description: XMLdata.getElementsByTagName("description")[0].innerHTML,
    tiers: [XMLdata.getElementsByTagName("tier")[0], XMLdata.getElementsByTagName("tier")[1], XMLdata.getElementsByTagName("tier")[2]]
  };
  //DOM Elements
  this.elements = {
    name: elemSkill.getElementsByClassName("skill-title")[0],
    icon: elemSkill.getElementsByClassName("skill-icon")[0],
    levelNumber: elemSkill.getElementsByClassName("skill-level-number")[0],
    levelBar: elemSkill.getElementsByClassName("skill-level-bar")[0],
    buttons: elemSkill.getElementsByClassName("skill-button"),
  };
  //Set level (Updates data & visuals)
  this.setLevel = function(level){
    this.data.level = level;
    //Get appropriate icon state
    var activity = level > 0 ? "active" : "inactive";
    this.elements.icon.style.backgroundPosition = "-"+this.data[activity].xPos+"px -"+this.data[activity].yPos+"px";
    //Update level number & bar
    this.elements.levelNumber.innerHTML = level;
    this.elements.levelBar.style.width = 100*level/15+"%";
  }
  //Handle button clicks
  this.click = function(event){
    var change = event.target.getAttribute("data-change");
    if(change == "plus"){
      if(this.data.level < 15){
        this.setLevel(this.data.level+1);
      }
    } else if(change == "minus"){
      if(this.data.level > 0){
        this.setLevel(this.data.level-1);
      }
    } else if(change =="clear"){
      this.setLevel(0);
    }
  };
  //Add Button listeners
  this.addClick = function(){
    for(var i = 0, m = this.elements.buttons.length; i < m; i++){
      this.elements.buttons[i].addEventListener("click", this.click.bind(this));
    }
  }
  //Run
  this.addClick();
  this.setLevel(level);
}

//Manages reading and writing URLs
//  Contains Compressor class
var URLManager = {
  //Compresses & Decompresses points
  Compressor: {
    //Convert decimal to hex (15 -> f)
    //  Returns 0 if invalid parameter
    atob: function (a){
      a = parseInt(a, 10);
      if(isNaN(a)){ // a could not be parsed as int
        return 0;
      } else { // a was parsed as int
        return a.toString(16);
      }
    },
    //Convert hex to decimal (f -> 15)
    //  Returns 0 if invalid parameter
    btoa: function (b){
      b = parseInt(b, 16);
      if(isNaN(b)){ // b could not be parsed as int
        return 0;
      } else { // b was parsed as int
        return b;
      }
    },
    //Convert decimal array to hex string, returns empty string if points is empty
    compress: function (points){
      var compressed = "";
      if(points instanceof Array){
        for(var i = 0, m = points.length; i < m; i++){
          compressed += this.atob(points[i]);
        }
      }
      return compressed;
    },
    //Convert hex string to decimal array, returns empty array if points is empty
    decompress: function (points){
      var decompressed = [];
      if(typeof points === "string"){ // Points is an array
        //Split the points string into individual hex digits
        points = points.split("");
        //Convert hex digit to decimal & put in array
        for(var i = 0, m = points.length; i < m; i++){
          decompressed[i] = this.btoa(points[i]);
        }
      }
      return decompressed;
    }
  },
  //Returns URL parameter
  //  Taken from: https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.search
  getURLParameter: function (parameter) {
    var value = decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(parameter).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
    //Return null if empty result;
    return value ? value : null;
  },
  getClass: function(){
    return this.getURLParameter("class") || "outlander";
  },
  //Gets points from URL parameter & outputs in format we want (an array)
  getPoints: function(){
    //Fill points with URL Parameter
    //Compressor.decompress returns empty array if points parameter is null, this is handled below
    var points = this.Compressor.decompress(this.getURLParameter("points"));
    //Count points spent so far
    var pointsSpent = 0;
    //Make sure we have 30 points & all are sanitized
    //Handles empty array
    for(var i = 0; i < 30; i++){
      //Sanitize the point
      points[i] = this.sanitizePoint(points[i]);
      //Make sure maximum skill points are not exceeded (132 Max)
      points[i] = points[i] + pointsSpent > 132 ? 132 - pointsSpent : points[i];
      //Update points spent
      pointsSpent += points[i];
    }
    return points;
  },
  //Cleans points to match application requirements
  sanitizePoint: function(point){
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
  },
  //Generates link to share build
  getShareLink: function(){
    //Start Link string with current page and without query string
    var link = [location.protocol, '//', location.host, location.pathname].join('');
    //Add current character to Link
    link += "?class=" + stateManager.currentClass;
    //TO-DO:: ADD STUFF
  }
}

var SkillManager = {
  skills: [],
  loadSkills: function(XMLdata){
    var points = URLManager.getPoints();
    var elemTrees = document.getElementsByClassName("skill-tree");
    for(var i = 0, m = elemTrees.length; i < m; i++){
      this.skills[i] = [];
      var elemSkills = elemTrees[i].getElementsByClassName("skill");
      for(var j = 0, n = elemSkills.length; j < n; j++){
        this.skills[i][j] = new Skill(elemSkills[j], points[10*i+j], XMLdata.getElementsByTagName("tree")[i].getElementsByTagName("skill")[j]);
      }
    }
  }
}

//Loads XML files
function Loader(elemLoader){
  this.currentClass = URLManager.getClass();
  this.elements = {
    bar: elemLoader
  }
  this.setProgress = function(percentage){
    this.elements.bar.style.width = 100*percentage+"%";
  };
  this.show = function(){
    this.elements.bar.style.opacity = 1;
  }
  this.hide = function(){
    this.elements.bar.style.opacity = 0;
  }
  //Update loader bar on progress
  this.transferProgress = function(event){
    if (event.target.lengthComputable) { // Set width if size is computable (Not computable on GitHub)
      this.setProgress(event.target.loaded / event.target.total);
    } else {
      this.setProgress(1);
    }
  }
  //XML Transfer is complete
  this.transferComplete = function(event){
    if (event.target.status === 200) { // Status is OK
      if (event.target.responseXML) { // ResponseXML is not null/undefined
        //Update UI with data
        SkillManager.loadSkills(event.target.responseXML);
        URLManager.getPoints();
      } else { // ResponseXML missing
        console.error("Skill ResponseXML was empty");
      }
    } else { // Status is not OK
      console.error("Skill transfer completed, but response was not OK");
    }
  }.bind(this);
  this.transferCanceled = function (event) {
    console.error("Skill transfer was cancelled");
  }
  this.transferFailed = function(event) {
    console.error("Skill transfer failed");
  }
  var request = new XMLHttpRequest();
  request.addEventListener("progress", this.transferProgress.bind(this));
  request.addEventListener("load", this.transferComplete.bind(this));
  request.addEventListener("error", this.transferFailed.bind(this));
  request.addEventListener("abort", this.transferCanceled.bind(this));
  request.open("GET", "xml/" + this.currentClass + ".xml", true);
  request.send();
}

window.onload = function(){
  var loader = new Loader(document.getElementById("loader"));
}
