function removeClass(obj, cls) {
  var classes = obj.className.split(' ');
  for(i=0; i<classes.length; i++) {
    if (classes[i] == cls) {
      classes.splice(i, 1); // удалить класс 
      i--; // (*)
    }
  }
  obj.className = classes.join(' ');
}
var addClass = function(obj, cls){
	obj.className = obj.className + " hover";
}

function getXmlHttpRequest(){ 
  var xmlhttp; 
  try { 
    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP"); 
  } catch (e) { 
    try { 
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); 
    } catch (E) { 
      xmlhttp = false; 
    } 
  } 
  if (!xmlhttp && typeof XMLHttpRequest!='undefined') { 
    xmlhttp = new XMLHttpRequest(); 
  } 
  return xmlhttp; 
} 

function Ajax(url, callback, async, method, params, header) 
{ 
    var xmlhttp = getXmlHttpRequest(); 

    async = async || false; 
    params = params || ''; 
    method = method || 'GET'; 
     
    if (method == 'GET') url += '?' + params; 
    if (header != null) xmlhttp.setRequestHeader('Content-Type', header) 
    else if (method == 'POST') 
    { 
        header = 'application/x-www-form-urlencoded'; 
        xmlhttp.setRequestHeader('Content-Type', header) 
    } 
     
    xmlhttp.open(method, url, async); 
     
    if (!async) 
    { 
        if (params == '')xmlhttp.send(null); else xmlhttp.send(params); 
         callback(xmlhttp); 
    } 
    else 
    { 
        xmlhttp.onreadystatechange = function() { 
          if (xmlhttp.readyState == 4) { 
               callback(xmlhttp); 
          } 
        }; 
        xmlhttp.send(null); 
    } 
    //return xmlhttp; 
}  
function fixEvent(e) {
  e = e || window.event;

  if (!e.target) e.target = e.srcElement;

  if (e.pageX == null && e.clientX != null ) { // если нет pageX..
    var html = document.documentElement;
    var body = document.body;

    e.pageX = e.clientX + (html.scrollLeft || body && body.scrollLeft || 0);
    e.pageX -= html.clientLeft || 0;

    e.pageY = e.clientY + (html.scrollTop || body && body.scrollTop || 0);
    e.pageY -= html.clientTop || 0;
  }

  if (!e.which && e.button) {
    e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) )
  }

  return e;
}

function handleMouseleave(handler) {

  return function(e) {
    e = e || event; // IE
    var toElement = e.relatedTarget || e.toElement; // IE

    // проверяем, мышь ушла на элемент внутри текущего?
    while (toElement && toElement !== this) {
      toElement = toElement.parentNode;
    }

    if (toElement == this) { // да, внутри
      return; // значит мы перешли с родителя на потомка, лишнее событие
    }

    return handler.call(this, e);
  };
}


function getCoords(elem) {
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docElem = document.documentElement;

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

var make_draggable = function(el){
	el.onmousedown = function(e) {
				is_drug = true;
			  var self = this;
			  e = fixEvent(e);

			  var coords = getCoords(this);

			  var shiftX = e.pageX - coords.left;
			  var shiftY = e.pageY - coords.top;


			  this.style.position = 'absolute';
			  document.body.appendChild(this);
			  moveAt(e);

			  this.style.zIndex = 1000; // над другими элементами

			  function moveAt(e) {
			    self.style.left = e.pageX - shiftX + 'px';
			    self.style.top = e.pageY - shiftY+ 'px';
			  }

			  document.onmousemove = function(e) {
			    e = fixEvent(e);
			    moveAt(e); 
			  };

			  this.onmouseup = function() {
			    document.onmousemove = self.onmouseup = null;
			  };

			}

			el.ondragstart = function() { 
			  return false; 
			};
}


var Uploader = function(container, files){
	var self = this;
	self.files = files || [];
	self.container = container;

	//render empty table
	var $container = document.getElementById(self.container);
	$container.innerHTML  = 
	'<table class="table">'+
    '      <thead>'+
    '        <tr>'+
    '          <th>Name</th>'+
    '          <th>Size</th>'+
    '          <th>Date Modified</th>'+
    '		   <th></th>' + 
    '        </tr>'+
    '      </thead>'+
    '      <tbody>'+
    '      </tbody>'+
    '</table>'+ 
    '<div class="dropZone ">dropZone<div>';
    $table = $container.getElementsByTagName('table')[0];
    $table.onmouseout = handleMouseleave(function(e) {
    	//if (self.is_drug)
    		console.log('dsf');
	});
	is_drug = false;

	$th_list = $container.getElementsByTagName('th');
	for (var n = 0; n < $th_list.length; n++) {
		$th_list[n].onclick = function(e){
			var key = e.target.innerText;
			var field = fieds[key];

			if (self.sort.field == field){
				self.sort.dist = self.sort.dist == 'asc' ? 'desc' : 'asc';
			}
			else{
				self.sort.field = field;
				self.sort.dist = 'asc';
			}
			self.render_table();
		}
	};

	var fieds = {
		'Name' : 'name',
		'Size' : 'size',
		'Date Modified' : 'date_dodified'
	};
	self.sort = {
		field : 'name',
		dist : 'asc'
	};


    var $dropZone = $container.getElementsByClassName('dropZone')[0];

    $dropZone.ondragover = function() {
    	addClass($dropZone, "hover");
	    return false;
	};

	    
	$dropZone.ondragleave = function() {
		removeClass($dropZone, "hover");
		return false;
	};

	function uploadProgress(event) {
	    var percent = parseInt(event.loaded / event.total * 100, 10);
	    $dropZone.innerHTML = 'Загрузка: ' + percent + '%';
	}

	function stateChange(event) {
	    if (event.target.readyState == 4) {
	        if (event.target.status == 200) {
	        	var new_file = JSON.parse(event.target.responseText);
	        	console.log(new_file);
				self.files.push(new_file);
				self.render_table();

	          //  $dropZone.innerHTML  = 'Загрузка успешно завершена!';
	        } else {
	            $dropZone.innerHTML = 'Произошла ошибка!';
	            addClass($dropZone, "error");
	        }
	    }
	}

	$dropZone.ondrop = function(event) {
	    event.preventDefault();
	    removeClass($dropZone, "hover");
	    addClass($dropZone, "drop");

	    var file = event.dataTransfer.files[0];

	    for (var n = 0; n < self.files.length; n++) {
	    	var file_in_table = self.files[n];
	    	if (file_in_table.name == file.name){
	    		return;
	    	}
	    };

	    var xhr = new XMLHttpRequest();
		xhr.upload.addEventListener('progress', uploadProgress, false);
		xhr.onreadystatechange = stateChange;
		xhr.open('POST', '/upload');
		xhr.setRequestHeader('X-FILE-NAME', file.name);
		xhr.send(file);
	};

	

	self.render_table = function(){
        var tbody = '';
        var field = self.sort.field;
        var dist = self.sort.dist;

        self.files = self.files.sort(function(f1, f2){
        	if (dist == 'asc')
        		return f1[field] < f2[field];
        	else
        		return f1[field] > f2[field];
        });

        for (var n = 0; n < self.files.length; n++) {
        	var file = self.files[n];
        	tbody += '<tr>' + 
        				'<td><div class="draggable-row">' + file.name + '</div></td>' + 
        				'<td>' + file.size + '</td>' + 
        				'<td>' + file.date_dodified + '</td>' +
        				'<td><a class="btn delete">delete<a></td>' +
        			'</tr>';	
        };



        var $tbody =  $container.getElementsByTagName('tbody')[0];
        $tbody.innerHTML = tbody;

        var namecolumn = $container.getElementsByTagName('div');
        for (var n = 0; n < namecolumn.length; n++) {
        	var row = namecolumn[n];
        	make_draggable(row);
        };

		var $delete_list = $container.getElementsByClassName('delete');
        for (var i = 0; i < $delete_list.length; i++) {
        	var btn = $delete_list[i];
        	btn.onclick = function(e) {
        		var file_name = e.target.parentElement.parentElement.childNodes[0].childNodes[0].innerHTML;//:(
				var http = new XMLHttpRequest();
 				var url = "/delete";
				var params = "file=" + file_name;
				http.open("POST", url, true);

				//Send the proper header information along with the request
				http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				//http.setRequestHeader("Content-length", params.length);
				//http.setRequestHeader("Connection", "close");

				http.onreadystatechange = function() {//Call a function when the state changes.
					if(http.readyState == 4 && http.status == 200) {
						var result = JSON.parse(http.responseText);
						if (result.success)
							e.target.parentElement.parentElement.remove();
					}
				}
				http.send(params);

        		//todo: make ajax requiest
        		
        	}
        };
	}
	self.render_table();
}

