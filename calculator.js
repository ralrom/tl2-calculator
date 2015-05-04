var Tl2calc={};Tl2calc.Core=function(){var e="berserker",a=132,l=15,t=3,n=10,c=[];return function(){for(var e=0;t>e;e++){c[e]=[];for(var a=0;n>a;a++)c[e][a]=0}}(),{getTrees:function(){return t},getSkills:function(){return n},getCharacter:function(){return e},setCharacter:function(a){e=a,Tl2calc.Mailman.publish("characterChanged",a)},getSpentInTree:function(e){for(var a=0,l=0;n>l;l++)a+=c[e][l];return a},getSpent:function(){for(var e=0,a=0;t>a;a++)e+=this.getSpentInTree(a);return e},getPoint:function(e,a){return c[e][a]},setPoint:function(e,t,n){"number"!=typeof n&&(n=0),n=n>l?l:n,n=0>n?0:n;var i=this.getSpent();n=n-c[e][t]+i>a?a-i+c[e][t]:n,c[e][t]=n,Tl2calc.Mailman.publish("pointChanged"),Tl2calc.Mailman.publish("pointChanged:"+e),Tl2calc.Mailman.publish("pointChanged:"+e+","+t,n)},getPoints:function(){return c},getSkillMax:function(){return l}}}(),Tl2calc.Mailman=function(){var e=[];return{publish:function(a){if("string"!=typeof a)throw new Error("You must provide a valid topic to publish.");var l,t,n,c,i=[].slice.call(arguments,1),s=0;if(!e[a])return!0;for(l=e[a].slice(),n=l.length;n>s&&(t=l[s],c=t.callback.apply(t.context,i),c!==!1);s++);return c!==!1},subscribe:function(a,l,t,n){if("string"!=typeof a)throw new Error("You must provide a valid topic to create a subscription.");n=n||5;for(var c,i=0,s=a.split(/\s/),r=s.length;r>i;i++){a=s[i],c=!1,e[a]||(e[a]=[]);for(var o=e[a].length-1,u={callback:t,context:l,priority:n};o>=0;o--)if(e[a][o].priority<=n){e[a].splice(o+1,0,u),c=!0;break}c||e[a].unshift(u)}return t},unsubscribe:function(a,l,t){if("string"!=typeof a)throw new Error("You must provide a valid topic to remove a subscription.");if(2===arguments.length&&(t=l,l=null),e[a])for(var n=e[a].length,c=0;n>c;c++)e[a][c].callback===t&&(l&&e[a][c].context!==l||(e[a].splice(c,1),c--,n--))}}}(),Tl2calc.SkillsetFetcher=function(){var e=this,a=function(e){},l=function(a){200===a.target.status&&(data=JSON.parse(a.target.responseText),Tl2calc.Mailman.publish("skillsetLoaded",data.skillset),Tl2calc.Mailman.subscribe("characterChanged",e,n))},t=function(e){},n=function(c){Tl2calc.Mailman.unsubscribe("characterChanged",e,n);var i=new XMLHttpRequest;i.addEventListener("progress",a),i.addEventListener("load",l),i.addEventListener("error",t),i.addEventListener("abort",t),i.overrideMimeType("application/json"),i.open("GET","characters/"+c+"/skillset.json",!0),i.send()};Tl2calc.Mailman.subscribe("characterChanged",e,n)}(),Tl2calc.SkillsetDescriptor=function(){var e,a=function(a){e=a},l=function(a,l){{var t,l=l||{},n=l.tree||0,c=l.skill||0;l.tier||0,l.status||"active"}switch(a){case"treeName":t=e.trees[n].name,Tl2calc.Mailman.publish("propertyDescribed:treeName,"+n,t);break;case"skillName":t=e.trees[n].skills[c].name,Tl2calc.Mailman.publish("propertyDescribed:skillName,"+n+","+c,t);break;case"skillIcon":t=e.trees[n].skills[c].icon,Tl2calc.Mailman.publish("propertyDescribed:skillIcon,"+n+","+c,t);break;case"skillAll":t=e.trees[n].skills[c],Tl2calc.Mailman.publish("propertyDescribed:skillAll",t)}};Tl2calc.Mailman.subscribe("describeProperty",this,l),Tl2calc.Mailman.subscribe("skillsetLoaded",this,a,0)}(),Tl2calc.BuildManager=function(){var e=function(e){return decodeURI(window.location.search.replace(new RegExp("^(?:.*[&\\?]"+encodeURI(e).replace(/[\.\+\*]/g,"\\$&")+"(?:\\=([^&]*))?)?.*$","i"),"$1"))},a=function(e){return parseInt(e,16)||0},l=function(e){return parseInt(e,10)?e.toString(16):0},t=function(){for(var l=Tl2calc.Core.getTrees(),t=Tl2calc.Core.getSkills(),n=e("class")||Tl2calc.Core.getCharacter(),c=e("points").split(""),i=0,s=l*t;s>i;i++)c[i]=a(c[i]);Tl2calc.Core.setCharacter(n);for(var i=0;l>i;i++)for(var r=0;t>r;r++)Tl2calc.Core.setPoint(i,r,c[10*i+r])},n=function(){for(var e=Tl2calc.Core.getTrees(),a=Tl2calc.Core.getSkills(),t=(Tl2calc.Core.getCharacter(),Tl2calc.Core.getPoints()),n="",c=0;e>c;c++)for(var i=0;a>i;i++)n+=l(t[c][i]);var s=[location.protocol,"//",location.host,location.pathname].join("")+"?class="+Tl2calc.Core.getCharacter()+"&points="+n;history.replaceState({calc:"points"},"TL2 Calculator Saved Build",s),Tl2calc.Mailman.publish("buildEncoded",s)};Tl2calc.Mailman.subscribe("characterChanged",this,n),Tl2calc.Mailman.subscribe("pointChanged",this,n),Tl2calc.Mailman.subscribe("windowLoaded",this,t,10)}(),Tl2calc.Portraits=function(){var e=function(){for(var e=[],l=document.getElementsByClassName("portrait"),t=0,n=l.length;n>t;t++)e[t]=new a(l[t],l[t].getAttribute("data-character"))},a=function(e,a){var l=function(){Tl2calc.Core.setCharacter(a)},t=function(l){l===a?(e.className=e.className.replace(new RegExp("(?:^|\\s)inactive(?!\\S)","g"),""),e.className.match(new RegExp("(?:^|\\s)active(?!\\S)","g"))||(e.className+=" active")):(e.className=e.className.replace(new RegExp("(?:^|\\s)active(?!\\S)","g"),""),e.className.match(new RegExp("(?:^|\\s)inactive(?!\\S)","g"))||(e.className+=" inactive"))};e.addEventListener("click",l),Tl2calc.Mailman.subscribe("characterChanged",this,t)};Tl2calc.Mailman.subscribe("windowLoaded",this,e)}(),Tl2calc.Tabs=function(){var e=function(){for(var e=[],l=document.getElementsByClassName("tab"),t=0,n=l.length;n>t;t++)e[t]=new a(l[t],t)},a=function(e,a){var l=e.getElementsByClassName("tab-name")[0],t=function(e){Tl2calc.Mailman.publish("showTree",a)},n=function(l){l===a?e.className.match(new RegExp("(?:^|\\s)active(?!\\S)","g"))||(e.className+=" active"):e.className=e.className.replace(new RegExp("(?:^|\\s)active(?!\\S)","g"),"")},c=function(e){l.innerHTML=e},i=function(){Tl2calc.Mailman.publish("describeProperty","treeName",{tree:a})};e.addEventListener("click",t),Tl2calc.Mailman.subscribe("showTree",this,n),Tl2calc.Mailman.subscribe("propertyDescribed:treeName,"+a,this,c),Tl2calc.Mailman.subscribe("skillsetLoaded",this,i,10)};Tl2calc.Mailman.subscribe("windowLoaded",this,e)}(),Tl2calc.TabPoints=function(){var e=function(){for(var e=[],l=document.getElementsByClassName("tab-points"),t=0,n=l.length;n>t;t++)e[t]=new a(l[t],t)},a=function(e,a){var l=function(){e.innerHTML=Tl2calc.Core.getSpentInTree(a)};Tl2calc.Mailman.subscribe("pointChanged:"+a,this,l)};Tl2calc.Mailman.subscribe("windowLoaded",this,e)}(),Tl2calc.Trees=function(){var e=function(){for(var e=[],l=document.getElementsByClassName("tree"),t=0,n=l.length;n>t;t++)e[t]=new a(l[t],t)},a=function(e,a){var l=function(l){l===a?e.className.match(new RegExp("(?:^|\\s)active(?!\\S)","g"))||(e.className+=" active"):e.className=e.className.replace(new RegExp("(?:^|\\s)active(?!\\S)","g"),"")};Tl2calc.Mailman.subscribe("showTree",this,l)};Tl2calc.Mailman.subscribe("windowLoaded",this,e)}(),Tl2calc.SkillBars=function(){var e,a,l=Tl2calc.Core.getSkillMax(),t=function(){var t=document.getElementsByClassName("skill-bar"),c=Tl2calc.Core.getSkills();e=t[0].offsetWidth/(l+2),a=t[0].getElementsByClassName("skill-bar-knob")[0].offsetWidth;for(var i=[],s=0,r=t.length;r>s;s++){var o=Math.floor(s/c);i[s]=new n(t[s],o,s-c*o)}},n=function(t,n,c){var i=t.getElementsByClassName("skill-bar-knob")[0],s=t.getElementsByClassName("skill-bar-fill")[0],r=function(l){i.style.left=e*l+"px",s.style.width=e*l+a/2+"px"},o=function(a){var i=Math.floor((a.clientX-t.getBoundingClientRect().left)/e);i=i>l?l:i,i=0>i?0:i,Tl2calc.Core.setPoint(n,c,i)},u=function(e){o(e),window.addEventListener("mousemove",o)},m=function(e){window.removeEventListener("mousemove",o)};t.addEventListener("mousedown",u),window.addEventListener("mouseup",m),Tl2calc.Mailman.subscribe("pointChanged:"+n+","+c,this,r)};Tl2calc.Mailman.subscribe("windowLoaded",this,t)}(),Tl2calc.SkillLevels=function(){var e=Tl2calc.Core.getSkillMax(),a=function(){for(var e=document.getElementsByClassName("skill-level"),a=Tl2calc.Core.getSkills(),t=[],n=0,c=e.length;c>n;n++){var i=Math.floor(n/a);t[n]=new l(e[n],i,n-a*i)}},l=function(a,l,t){var n=function(e){a.value=e},c=function(a){if(""!=a.target.value){var n=parseInt(a.target.value,10)||0;n=n>e?e:n,n=0>n?0:n,Tl2calc.Core.setPoint(l,t,n)}},i=function(e){""==e.target.value&&n(Tl2calc.Core.getPoint(l,t))};a.addEventListener("keyup",c),a.addEventListener("change",i),Tl2calc.Mailman.subscribe("pointChanged:"+l+","+t,this,n)};Tl2calc.Mailman.subscribe("windowLoaded",this,a)}(),Tl2calc.SkillNames=function(){var e=function(){for(var e=[],l=document.getElementsByClassName("skill-name"),t=Tl2calc.Core.getSkills(),n=0,c=l.length;c>n;n++){var i=Math.floor(n/t);e[n]=new a(l[n],i,n-t*i)}},a=function(e,a,l){var t=function(a){e.innerHTML=a},n=function(){Tl2calc.Mailman.publish("describeProperty","skillName",{tree:a,skill:l})},c=function(e){Tl2calc.Mailman.publish("showDescription",a,l)},i=function(e){Tl2calc.Mailman.publish("hideDescription")};e.addEventListener("mouseover",c),e.addEventListener("mouseout",i),Tl2calc.Mailman.subscribe("propertyDescribed:skillName,"+a+","+l,this,t),Tl2calc.Mailman.subscribe("skillsetLoaded",this,n,10)};Tl2calc.Mailman.subscribe("windowLoaded",this,e)}(),Tl2calc.SkillIcons=function(){var e=function(){for(var e=document.getElementsByClassName("skill-icon"),l=Tl2calc.Core.getSkills(),t=[],n=0,c=e.length;c>n;n++){var i=Math.floor(n/l);t[n]=new a(e[n],i,n-l*i)}},a=function(e,a,l){var t=function(t){t>0?e.className=e.className.replace(new RegExp("(?:^|\\s)inactive(?!\\S)","g"),""):e.className.match(new RegExp("(?:^|\\s)inactive(?!\\S)","g"))||(e.className+=" inactive"),e.style.backgroundImage="url('characters/"+Tl2calc.Core.getCharacter()+"/icons.jpg')",e.style.backgroundPosition=64*-l+"px "+64*-a+"px"},n=function(){t(Tl2calc.Core.getPoint(a,l))},c=function(e){Tl2calc.Mailman.publish("showDescription",a,l)},i=function(e){Tl2calc.Mailman.publish("hideDescription")};e.addEventListener("mouseover",c),e.addEventListener("mouseout",i),Tl2calc.Mailman.subscribe("pointChanged:"+a+","+l,this,t),Tl2calc.Mailman.subscribe("skillsetLoaded",this,n,10)};Tl2calc.Mailman.subscribe("windowLoaded",this,e)}(),Tl2calc.SkillDescription=function(){var e,a=document.getElementsByClassName("description")[0],l=a.getElementsByClassName("description-name")[0],t=a.getElementsByClassName("description-content")[0],n=a.getElementsByClassName("description-tier"),c=function(){a.style.left="-100%"},i=function(l,t){e=Tl2calc.Core.getPoint(l,t),a.style.top=t>5?"0":"50%",a.style.left=0,Tl2calc.Mailman.publish("describeProperty","skillAll",{tree:l,skill:t})},s=function(a){var l=!1;switch(a){case 0:e>=5&&(l=!0);break;case 1:e>=10&&(l=!0);break;case 2:e>=15&&(l=!0)}l?n[a].className.match(new RegExp("(?:^|\\s)active(?!\\S)","g"))||(n[a].className+=" active"):n[a].className=n[a].className.replace(new RegExp("(?:^|\\s)active(?!\\S)","g"),"")},r=function(e){l.innerHTML=e.name,t.innerHTML=e.description;for(var a=0;3>a;a++)n[a].innerHTML="undefined"==typeof e.tiers?"":e.tiers[a],s(a)};Tl2calc.Mailman.subscribe("propertyDescribed:skillAll",this,r),Tl2calc.Mailman.subscribe("showDescription",this,i),Tl2calc.Mailman.subscribe("hideDescription",this,c)}(),Tl2calc.ShareLink=function(){var e=document.getElementsByClassName("share")[0].getElementsByClassName("link")[0],a=function(a){e.innerHTML=a};Tl2calc.Mailman.subscribe("buildEncoded",this,a)}(),window.onload=function(){Tl2calc.Mailman.publish("windowLoaded")};