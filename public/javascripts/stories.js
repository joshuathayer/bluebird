$(document).ready(function() {

    var layer = new L.StamenTileLayer("watercolor");
    var map = new L.Map("map", {zoom: 17, zoomControl: false});
    map.addLayer(layer);

    var userMarker;
    var userLocation;
    var $j = jQuery.noConflict();
    var mapInited = false;
    var radius = 20;
    var mySound = null;

    var playState = false;
    var buttonState = "hidden";

    // audio state
    // button state
    // hidden -- enter region  ->             visible
    //        <- exit region   --
    //        <- start playing --  
    //        -- audio end, but in region -> 
    // 
    //           (audio ends)
    //    v--------------------\
    // hidden -> available -> playing
    //    ^---------/
    //      (move out of region)
    //
    // maybe? check for playable content when moving to hidden?
    // what happens if you're in the location you were just in?

    function buttonToVisibleState() {
	console.log("toVisibleState, from " + buttonState);
	console.log("playState is " + playState);

	if ((buttonState != "visible") && !(playState)) {
	    playControl.addTo(map);
	    buttonState = "visible";
	}
    }

    function buttonToHiddenState() {
	console.log("toHiddenState, from " + buttonState);
	console.log("playState is " + playState);

	if (buttonState != "hidden") {
	    playControl.removeFrom(map);
	    buttonState = "hidden";
	}
	    
    }

    var PlayControl = L.Control.extend({

	options: {
		position: 'topleft'
	},

	onAdd: function (map) {

	    var className = 'row',
                container = L.DomUtil.create('div', className);

	    this._map = map;
	    
	    this._playButton = this._createButton(
		"a story is available", 'play',  "small round success button",
		container, this._playStory,  this);
	    
            return container;
	},

	_createButton: function (html, title, className, container, fn, context) {
		var link = L.DomUtil.create('a', className, container);
		link.innerHTML = html;
		link.href = '#';
		link.title = title;

		var stop = L.DomEvent.stopPropagation;

		L.DomEvent
		    .on(link, 'click', stop)
		    .on(link, 'mousedown', stop)
		    .on(link, 'dblclick', stop)
		    .on(link, 'click', L.DomEvent.preventDefault)
		    .on(link, 'click', fn, context);

		return link;
	},

	_playStory: function () {
	    mySound.play();

	    mySound.bind("ended", function(e) {
		playState = false;
		console.log("playing done. playState is " + playState);
		buttonToHiddenState();
	    });

	    playState = true;
	    buttonToHiddenState();
	}
    });

    var playControl = new(PlayControl);

    var points = [
	{ latlng: [40.7255, -73.9877],
	  title: "home",
	  story: "home"},
	{ latlng: [40.72307952345681, -73.98881614208221],
	  title: "F train",
	  story: "ftrain"},
	{ latlng: [40.727100221143374, -73.98608565330504],
	  title: "abraco coffee",
	  story: "abraco"},
	{ latlng: [40.727486422997785, -73.9867776632309],
	  title: "big bar",
	  story: "bigbar"},
	{ latlng: [40.72945398501714, -73.98974418640137],
	  title: "dodgy hotel",
	  story: "hotel"},
	{ latlng: [40.726624579990144, -73.98186922073364],
	  title: "thompkins square",
	  story: "tsq"}
    ];

    function fakeLocationFound(latlng) {

	if (!mapInited) {
	    _.each(points, function(point) {
		L.circle(point.latlng, radius).addTo(map);
	    });
		
	    userMarker = L.marker(latlng);
	    userMarker.addTo(map);
	    mapInited = true;
	}

	updatedLocation(latlng);
    }
    
   function updatedLocation(latlng) {

       userMarker.setLatLng(latlng);

       var inActiveArea = false;

       _.each(points, function(point) {
	   if (userMarker.getLatLng().distanceTo([point.latlng[0], point.latlng[1]])
	       < 20) {
	       inActiveArea = point
	   }});
       
       if (inActiveArea == false) {

	   if (userLocation != null) {
	       // we were somewhere. now, we're nowhere
	       buttonToHiddenState();
	   }

	   userLocation = null;
	   
	   // we always display our popup, for development
	   // userMarker.bindPopup("[" + latlng.lat + ", " + latlng.lng + "]");
	   // userMarker.openPopup();
       } 

       if (inActiveArea.title != userLocation) {
	   userLocation = inActiveArea.title;

	   // we moved in to a region (either from nothing, or from elsewhere
	   //userMarker.bindPopup("You seem to be in the area of " + inActiveArea.title);
	   //userMarker.openPopup();

	   playNewStory(inActiveArea.story);
       }
   };

    function playNewStory(storyName) {

	if (mySound == null) {

	    mySound = new buzz.sound("/audio/" + storyName, {
		formats: [ "mp3"],
		preload: true,
		autoplay: false
            })

	} else {

	    mySound.stop();
	    mySound = new buzz.sound("/audio/" + storyName, {
		formats: [ "mp3"],
		preload: true,
		autoplay: false
            })

	}


	buttonToVisibleState();

    }

    
    map.on('locationfound', function(e) {
	fakeLocationFound(e.latlng);
    });

    // map.on('click', function(e) {
    //  	updatedLocation(e.latlng)
    // });

    map.on('locationerror', function() {
	fakeLocationFound([40.7255, -73.9877])
    });

    map.locate({setView: true,
		maximumAge: 500,
		watch: false,
		maxZoom: 18});

})
