function Loader(){
  this.percentage = ""
  this.setPercentage = function(percentage){
    this.percentage = 100*percentage+"%"
  }
  this.transferProgress = function(event){
    console.log("Class data transfer in progress..")
  }
  this.transferComplete = function(event){
    if(event.target.status === 200){
      console.log(event);
      var dispatch = new Event('xmlLoaded', true)
      event.target.dispatchEvent(dispatch)
      console.log("Class data transfer complete")
    } else {
      console.error("Class data transfer status not OK")
    }
  }
  this.transferFailed = function(event){
    console.error("Class data transfer failed")
  }
  this.transferCanceled = function(event){
    console.error("Class data transfer was canceled")
  }
  this.loadClass = function(className){
    var request = new XMLHttpRequest()
    request.addEventListener("progress", this.transferProgress.bind(this))
    request.addEventListener("load", this.transferComplete.bind(this))
    request.addEventListener("error", this.transferFailed.bind(this))
    request.addEventListener("abort", this.transferCanceled.bind(this))
    request.open("GET", "xml/" + className + ".xml", true)
    request.send()
  }
}

function test(){
  console.log("hi");
}

function initialize(event){
  window.addEventListener("xmlLoaded", test);
  var loader = new Loader()
  loader.loadClass("outlander")
}


window.addEventListener("DOMContentLoaded", initialize);
