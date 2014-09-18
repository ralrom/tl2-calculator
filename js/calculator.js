/*
Torchlight II Skill Builder
Browser Support: IE9+
*/
var Calculator = {
  //Set default character to outlander
  selectedCharacter: "outlander",
  //Current character skillset
  skillsetData: "",
  //Loader bar
  loader: {
    elem: "",
    setProgress: function(percent) {
      this.elem.style.width = percent + "%";
      console.log("Loading: " + percent + "%");
    },
    show: function() {
      this.elem.style.opacity = 1;
      console.log("Loader shown");
    },
    hide: function() {
      this.elem.style.opacity = 0;
      console.log("Loader hidden");
    }
  }
}

var Compressor = {
  //Convert decimal to hex (15 -> f)
  atob: function (a){
    a = Number(a);
    return a.toString(16);
  },
  //Convert hex to decimal (f -> 15)
  btoa: function (b){
    b = String(b);
    return parseInt(b, 16);
  },
  //Convert points string to hex string
  compress: function (points){
    var compressed = "";
    points = points.split(",");
    for(var i = 0, m = points.length; i < m; i++){
      compressed += this.atob(points[i]);
    }
    return compressed;
  },
  //Convert hex points string to decimal array
  decompress: function (pointsHex){
    var decompressed = "";
    pointsHex = pointsHex.split("");
    for(var i = 0, m = pointsHex.length; i < m; i++){
      decompressed += this.btoa(pointsHex[i])+",";
    }
    //Return as array of numbers
    return decompressed.replace(/,$/, "").split(",");
  }
}

//Begin on DOMContent load
window.addEventListener("DOMContentLoaded", initialize);

//Returns URL parameter,
//Taken from: https://developer.mozilla.org/en-US/docs/Web/API/URLUtils.search
function getURLParameter(parameter) {
  var value = decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(parameter).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  console.log({
    "parameter": parameter,
    "value": value
  });
  //Return null if empty result;
  return value ? value : null;
}

//Initialize Skill Calculator
function initialize() {
  //Set selectedCharacter if provided, if not keep default
  Calculator.selectedCharacter = getURLParameter("class") || Calculator.selectedCharacter;
  //Show selectedCharacter to user
  document.getElementById("portrait-" + Calculator.selectedCharacter).className += " class-selected";
  //Set loader element
  Calculator.loader.elem = document.getElementById("loader");
  console.log("Loading skills for: " + Calculator.selectedCharacter);
  //Begin AJAX load of skills
  loadSkillset(Calculator.selectedCharacter);
}

//Load skillset of chosen character
function loadSkillset(character) {
  var skillLoader = new XMLHttpRequest();
  skillLoader.addEventListener("progress", transferProgress, false);
  skillLoader.addEventListener("load", transferComplete, false);
  skillLoader.addEventListener("error", transferFailed, false);
  skillLoader.addEventListener("abort", transferCanceled, false);
  skillLoader.open("GET", "xml/" + character + ".xml", true);
  skillLoader.send();
  //Show loader bar (initial width = 0)
  Calculator.loader.show();
}

function transferProgress(event) {
  if (event.lengthComputable) { // Set width if size is computable (Not computable on GitHub)
    Calculator.loader.setProgress(100 * event.loaded / event.total);
  }
}

function transferFailed(event) {
  console.error("Skill transfer failed");
}

function transferComplete(event) {
  Calculator.loader.hide();
  if (this.status === 200) { // Status is OK
    if (this.responseXML) { // ResponseXML is not null/undefined
      Calculator.skillsetData = this.responseXML;
      //Update UI with data
      updateUI();
    } else { // ResponseXML missing
      console.error("Skill ResponseXML was empty");
    }
  } else { // Status is not OK
    console.error("Skill transfer completed, but response was not OK");
  }
}

function transferCanceled(event) {
  console.error("Skill transfer was cancelled");
}

//Sanitize given point
function checkPoint(point){
  var p = Number(point);
  if(p){
    if (p > 15) {
      p = 15;
    } else if (p < 0) {
      p = 0;
    }
  } else {
    p = 0;
  }
  return p;
}

//Get Points from URL Parameter and generate an array from it;
function getURLPoints(){
  //Get Points from GET Parameter
  var points = getURLParameter("points") ? Compressor.decompress(getURLParameter("points")) : [];
  //Get length (for efficiency)
  var length = points.length;
  //Counts total skill points spent so far
  var total = 0;
  if(length > 0) { //points parameter was given
    /* Get through all skills (30 skils per class).
    This works even if points parameter is shorter than expected
    because points are are set to 0 by sanitizer if null */
    for(var i = 0; i < 30; i++){
      //Sanitize point data
      points[i] = checkPoint(points[i]);
      //Make sure maximum skill points not exceeded
      points[i] = points[i] + total > 132 ? 132 - total : points[i];
      //Update to new total
      total += points[i];
    }
  } else {
    points = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  return points;
}

//Update UI (run once)
function updateUI() {
  //Get Tab elements
  var elemTabs = document.getElementsByClassName("tab");
  //Get Skill-Tree elements
  var elemTrees = document.getElementsByClassName("skill-tree");
  //Get Skill-Tree data (from XML)
  var dataTrees = Calculator.skillsetData.getElementsByTagName("tree");
  //Get Skill-Tree levels (from GET parameters)
  var dataPoints = getURLPoints();
  //Loop through Tabs, Skill-Trees, Skill-Boxes & Skill-Buttons
  for (var i = 0, m = dataTrees.length; i < m; i++) {
    //Set Tab title
    elemTabs[i].innerHTML = dataTrees[i].getAttribute("name");
    console.log("Tree: " + dataTrees[i].getAttribute("name"));
    //Set Tab Listener
    elemTabs[i].addEventListener("click", switchTab);
    //Get Skill-Box elements in current Skill-Tree
    var elemSkills = elemTrees[i].getElementsByClassName("skill-box");
    //Get Skill-Box data in current Skill-Tree
    var dataSkills = dataTrees[i].getElementsByTagName("skill");
    for (var j = 0, n = dataSkills.length; j < n; j++) {
      //Set Skill-Box title
      elemSkills[j].getElementsByClassName("skill-title")[0].innerHTML = dataSkills[j].getAttribute("name");
      console.log("Skill: " + dataSkills[j].getAttribute("name"));
      //Set alt & title attributes
      elemSkills[j].getElementsByClassName("skill-icon")[0].setAttribute("title", dataSkills[j].getAttribute("name"));
      elemSkills[j].getElementsByClassName("skill-icon")[0].setAttribute("alt", dataSkills[j].getAttribute("name"));
      //Update Skill level
      updateSkill(elemSkills[j], dataSkills[j], dataPoints[10 * i + j]);
      //Add Skill-Box listeners
      elemSkills[j].addEventListener("mouseenter", skillDescription, false);
      elemSkills[j].addEventListener("mouseleave", hideDescription);
      //Add Skill-Buttons listeners
      var elemButtons = elemSkills[j].getElementsByClassName("skill-button");
      for (var k = 0, o = elemButtons.length; k < o; k++) {
        elemButtons[k].addEventListener("click", levelSkill);
      }
    }
  }
}

//Visually update skill when it is leveled up
function updateSkill(element, data, level) {
  //Determine if skill is learned or not
  var activity = level > 0 ? "active" : "inactive";
  var activityNode = data.getElementsByTagName(activity)[0];
  //Change skill-icon accordingly
  element.getElementsByClassName("skill-icon")[0].style.backgroundPosition = "-"+activityNode.getAttribute("xPos") + "px -" + activityNode.getAttribute("yPos") + "px";
  //Update skill-level-bar display & data;
  var elemLevelBar = element.getElementsByClassName("skill-level-bar")[0];
  elemLevelBar.setAttribute("data-level", level);
  elemLevelBar.style.width = 100 * level / 15 + "%";
  //Update skill-level-number text
  var elemLevelNumber = element.getElementsByClassName("skill-level-number")[0];
  elemLevelNumber.innerHTML = level;
  //Update skill distribution bar
  updatePointDistributionBar();
  //Generate new share link
  shareLink();
}

//Change skill level
function levelSkill(event) {
  //Get skill level change (up, down, or clear)
  var change = event.target.getAttribute("data-change");
  //Get Skill-Box corresponding to Skill-Button pressed
  var elemSkill = event.target.parentNode.parentNode.parentNode;
  //Load Skill-Tree for given Skill-Box (from XML)
  var tree = elemSkill.getAttribute("data-tree");
  var skill = elemSkill.getAttribute("data-skill");
  var dataSkill = Calculator.skillsetData.getElementsByTagName("tree")[tree].getElementsByTagName("skill")[skill];
  //Get current skill level
  var dataLevel = elemSkill.getElementsByClassName("skill-level-bar")[0].getAttribute("data-level");
  //Manage change
  if(change == "plus"){
    if (dataLevel < 15 && (getTreePointTotal(0)+getTreePointTotal(1)+getTreePointTotal(2)) < 132) { // Check max skill & max total points
      updateSkill(elemSkill, dataSkill, Number(dataLevel) + 1);
    }
  } else if (change == "minus"){
    if (dataLevel > 0) {
      updateSkill(elemSkill, dataSkill, Number(dataLevel) - 1);
    }
  } else if(change == "clear"){
    updateSkill(elemSkill, dataSkill, 0);
  }
}


function skillDescription(event){
  var descriptor = document.getElementById("descriptor");
  //Get skill data
  var tree = event.target.getAttribute("data-tree");
  var skill = event.target.getAttribute("data-skill");
  //Change side on which description is displayed for last column of skills
  if(skill == 2 || skill == 5 || skill == 9){
    descriptor.className = removeClass("right", descriptor.className);
    descriptor.className = addClass("left", descriptor.className);
  } else {
    descriptor.className = removeClass("left", descriptor.className);
    descriptor.className = addClass("right", descriptor.className);
  }
  var dataSkill = Calculator.skillsetData.getElementsByTagName("tree")[tree].getElementsByTagName("skill")[skill];
  //Set title
  document.getElementById("skill-title").innerHTML = dataSkill.getAttribute("name");
  //Set description
  document.getElementById("description").innerHTML = dataSkill.getElementsByTagName("description")[0].innerHTML;
  //Get Tier data
  var dataTiers = dataSkill.getElementsByTagName("tier");
  var elemTiers = document.getElementsByClassName("tier-description");
  //Loop through Tier elements & fill them
  for(var i = 0, m = dataTiers.length; i < m; i++){
    elemTiers[i].innerHTML = dataTiers[i].innerHTML;
  }
  if(m == 0){ // If no tiers are available (passives) hide tier bonuses
    document.getElementById("tiers").style.display = "none";
  } else {
    document.getElementById("tiers").style.display = "block";
  }
  document.getElementById("descriptor").style.display = "block";
}

function hideDescription(event){
  document.getElementById("descriptor").style.display = "none";
}

//Returns the total skill points spent in a given tree
function getTreePointTotal(tree){
  var points = getPointDistribution()[tree];
  var total = 0;
  for(var i = 0, m = points.length; i < m; i++){
    total += Number(points[i]);
  }
  return total;
}

//Updates the skill point distribution bar
function updatePointDistributionBar(){
  for(var i = 0; i < 3; i++){
    var treeTotal = getTreePointTotal(i);
    document.getElementById("points-bar-"+i).style.width = 100*treeTotal/132+"%";
    document.getElementById("tree-"+i+"-total").innerHTML = treeTotal;
  }
}

//Returns a 2D array containing all Skill points distribution
function getPointDistribution() {
  //Get all Skill-Tree elments
  var elemTrees = document.getElementsByClassName("skill-tree");
  //Variable to hold all Skill-Box level data
  var points = [];
  //Loop through all Skill-Boxes to fill dataTrees
  for (var i = 0, m = elemTrees.length; i < m; i++) {
    points[i] = [];
    var elemSkills = elemTrees[i].getElementsByClassName("skill-box");
    for (var j = 0, n = elemSkills.length; j < n; j++) {
      //Get current skill level
      points[i][j] = elemSkills[j].getElementsByClassName("skill-level-bar")[0].getAttribute("data-level");
    }
  }
  return points;
}

//Create & Display a share link so build can be shared
function shareLink() {
  //Start Link as current page without query string
  var link = [location.protocol, '//', location.host, location.pathname].join('');
  //Get Link input element
  var elemLink = document.getElementById("share-link");
  //Add current character to Link
  link += "?class=" + Calculator.selectedCharacter;
  //Add points (compressed) to Link
  var dataPoints = getPointDistribution();
  link += "&points=" + Compressor.compress(dataPoints.toString());
  //Display Link in Link input element
  elemLink.innerHTML = link;
  //Display current skill point distribution in browser bar (Browser support: IE10+)
  history.replaceState({calc: "points"}, "TL2 Calc Saved Points", link);
}

//Show current tab view and hide other ones
function switchTab(event) {
  //Get Skill-Tree elements
  var elemTrees = document.getElementsByClassName("skill-tree");
  //Get Tab elements
  var elemTabs = document.getElementsByClassName("tab");
  //Hide all Skill-Trees & change all tabs to unselected
  for (var i = 0, m = elemTrees.length; i < m; i++) {
    elemTrees[i].className = removeClass("current-tree", elemTrees[i].className);
    elemTabs[i].className = removeClass("current-tab", elemTabs[i].className);
  }
  //Get requested Skill-Tree
  var reqTree = event.target.getAttribute("data-tree");
  //Display requested Skill-Tree
  document.getElementById("tree-" + reqTree).className = addClass("current-tree", document.getElementById("tree-" + reqTree).className);
  //Select current tab
  document.getElementById("tree-" + reqTree + "-title").className = addClass("current-tab", document.getElementById("tree-" + reqTree + "-title").className);
}


//Adds CSS class (if not already there)
function addClass(c, className){
  if ( !className.match(new RegExp('(?:^|\\s)' + c + '(?!\\S)', 'g'))) {
    return className += " "+c;
  } else {
    return className;
  }
}

//Removes CSS class
function removeClass(c, className){
  return className.replace(new RegExp('(?:^|\\s)' + c + '(?!\\S)', 'g'), '');
}
