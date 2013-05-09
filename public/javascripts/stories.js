
$(document).ready(function() {

    var layer = new L.StamenTileLayer("watercolor");
    var map = new L.Map("map");
    map.addLayer(layer);

    var userMarker;
    var userLocation;
    var $j = jQuery.noConflict();
    var mapInited = false;
    var radius = 20;
    var mySound = null;
    var playState = false;

    $j("#audio").hide("slow");

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
	       $j("#audio").html("");
	   }

	   userLocation = null;
	   
	   // we always display our popup, for development
	   //userMarker.bindPopup("[" + latlng.lat + ", " + latlng.lng + "]");
	  // userMarker.openPopup();
       } 

       if (inActiveArea.title != userLocation) {
	   userLocation = inActiveArea.title;

	   // we moved in to a region (either from nothing, or from elsewhere
	   userMarker.bindPopup("You seem to be in the area of " + inActiveArea.title);
	   userMarker.openPopup();

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

	$j("#audio").html("<p>Story available! Touch here to play.");	
	$j("#audio").show("slow");

	$j("#audio").click(function() {
	    mySound.play();
	    $j("#audio").hide("slow");
	});
    }

    
    map.on('locationfound', function(e) {
	fakeLocationFound(e.latlng);
    });

    // map.on('click', function(e) {
    // 	updatedLocation(e.latlng)
    // });

    map.on('locationerror', function() {
	fakeLocationFound([40.7255, -73.9877])
    });

    map.locate({setView: true,
		maximumAge: 500,
		watch: true,
		maxZoom: 18});

})
