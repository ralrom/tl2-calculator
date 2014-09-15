var dataChecker = setInterval(checkData, 250);
var aborter = setInterval(abortCheck, 5000);
var selectedChar = "";

//Make sure data has loaded before beginning
function checkData(){
  console.log("Waiting for data...");
  //Check if Characters are defined
  if(typeof Characters !== "undefined"){
    console.log("Data loaded");
    clearInterval(dataChecker);
    initialize();
  }
}

//Create timeout if data wasn't loaded after a while
function abortCheck(){
  if(typeof Characters === "undefined"){
    console.log("Data retrieval timed out. Skill calculator aborted.")
    clearInterval(dataChecker);
    clearInterval(abortCheck);
  }
}

function initialize(){
  populateSkills("Outlander");
  addButtonListeners();
}

//Add listeners to skill buttons
function addButtonListeners(){
  console.log("Adding button listeners")

  var tabs = document.getElementsByClassName("tab");
  for(var i = 0; i < tabs.length; i++){
    tabs[i].addEventListener("click", changeTree);
  }

  //Get all skill buttons
  var buttons = document.getElementsByClassName("skill-button");

  //Loop through them and add listener
  for(i = 0; i < buttons.length; i++){
    buttons[i].addEventListener("click", levelSkill);
  }
}

//Populate skill tree with Character data
function populateSkills(char){
  console.log("Populating " + char + " skills");

  //Set selected character
  selectedChar = char;
  var charData = Characters[char];

  //Loop through all skills
  for(var i = 0; i < 3; i++){
    //Set tree title in tab;
    var treeTitle = document.getElementById("tree-"+i+"-title");
    treeTitle.innerHTML = charData["tree"+i].name;

    //Get skill levels from query string
    var skillLevels = parseTree(i);

    for(var j = 0; j < 10; j++){
      //Get apropriate skill-box
      var elem = document.getElementById("tree-"+i+"-skill-"+j);

      //Set skill levels
      setSkill(elem, skillLevels[j]);
    }
  }
}

//Takes care of individual skill display
function setSkill(elem, level){
  //Get desired skill & tree
  var treeNo = elem.getAttribute("data-tree");
  var skillNo = elem.getAttribute("data-skill");

  //Pull skill data
  var skill = Characters[selectedChar]["tree"+treeNo]["skill"+skillNo];

  //Set name
  console.log("Updating "+skill.name);
  var elemTitle = elem.getElementsByClassName("skill-title")[0];
  elemTitle.innerHTML = skill.name;

  //Get skill level bar
  var elemLevel = elem.getElementsByClassName("skill-level-bar")[0];

  //Set skill level
  elemLevel.setAttribute("data-level", level);
  elemLevel.style.width = 100*level/15+"%";

  //Update icon
  var elemIcon = elem.getElementsByClassName("skill-icon")[0];
  elemIcon.setAttribute("title", skill.name);
  elemIcon.setAttribute("alt", skill.name);

  //Change to colored version if level > 0
  var active = level > 0 ? "active" : "inactive";
  elemIcon.style.backgroundImage = "url('img/"+skill[active].sheet+".png')";
  elemIcon.style.backgroundPosition = "-"+skill[active].xPos+"px -"+skill[active].yPos+"px";

  //Update Share Link
  shareLink();
}

//Takes care of skill level
function levelSkill(evt){
  //Get skill-box corresponding to pressed button
  var elem = evt.target.parentNode.parentNode;
  var elemLevel = elem.getElementsByClassName("skill-level-bar")[0];

  //Get current skill level & cast as Number
  var level = Number(elemLevel.getAttribute("data-level"));

  if(evt.target.getAttribute("data-change") == "plus"){
    if(level < 15){
      setSkill(elem, level+1);
    }
  } else if(evt.target.getAttribute("data-change") == "minus"){
    if(level > 0){
      setSkill(elem, level-1);
    }
  }
}

function changeTree(evt){
  //Get all tab elements
  var tabs = document.getElementsByClassName("tab");

  //Get requested tree number
  var tab = evt.target.getAttribute("data-tree");

  //Get request tree div
  var skillTree = document.getElementById("tree-"+tab);

  //Hide all tress
  var trees = document.getElementsByClassName("skill-tree");
  for(var i = 0; i < trees.length; i++){
    trees[i].className = "skill-tree";
  }

  //Show current tree
  skillTree.className ="skill-tree current-tree";

  //Set all tabs back to default
  for(i = 0; i < tabs.length; i++){
    tabs[i].className = "tab";
  }

  //Set current tab
  evt.target.className= "tab tab-current";
}

function shareLink(){
  //Get Link element
  var elemLink = document.getElementById("share-link");

  //Get page URL without query string
  var url = [location.protocol, '//', location.host, location.pathname].join('');

  //Generate link
  var link = url;
  link += "?tree0="+serializeTree(0);
  link += "&tree1="+serializeTree(1);
  link += "&tree2="+serializeTree(2);
  elemLink.value = link;
}


function parseTree(tree){
  return getParameterByName("tree"+tree).split(",");
}


function serializeTree(tree){
  //Get all skill-boxes in given tree
  var elemTree = document.getElementById("tree-"+tree).getElementsByClassName("skill-box");
  var treeSerialized = [];

  //Get data-level attribute from all skill-boxes in given tree
  for(var i = 0; i < elemTree.length; i++){
    var level = elemTree[i].getElementsByClassName("skill-level-bar")[0].getAttribute("data-level");
    treeSerialized[i] = level;
  }

  //Return data
  return treeSerialized;
}

function getParameterByName(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
