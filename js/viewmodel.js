//Declare Markers Array
var markers=[];

var ViewModel = function(){

	var self = this;

	self.searchQuery = ko.observable('');
	self.locations = ko.observableArray(Places);

	//Creates InfoWindow
	var largeInfoWindow = new google.maps.InfoWindow();

	//Creates Map Boundaries
	var bounds = new google.maps.LatLngBounds();

	// Referenced https://stackoverflow.com/questions/29551997/knockout-search-filter
	//Filters locations according to search query filter
	self.filteredLocations = ko.computed(function() {
        var queryString = self.searchQuery().toLowerCase();

        if(queryString !==""){
             return ko.utils.arrayFilter(self.locations(), function(location) {
                var name = location.name.toLowerCase();
                return (name.indexOf(queryString) !==-1);
            });
        }
        else{
            return self.locations();;
        }
    });
   
   // Referrenced https://discussions.udacity.com/t/cant-get-to-filter-markers/195121
    self.filteredMarkers = ko.computed(function() {
        var queryString = self.searchQuery().toLowerCase();

         return ko.utils.arrayFilter(self.locations(), function(location) {
             var name = location.name.toLowerCase();
             if (name.indexOf(queryString) !==-1) {
                 if (location.marker) {
                location.marker.setVisible(true);
                 return true;
                }
             } else {
                 location.marker.setVisible(false);
                 return false;
             }
         });
     }, self);


	// Open infoWindow when clicking on list item
    self.selectedItem= function(data){
    	populateInfoWindow(data.marker,largeInfoWindow);
    }


    //Create Marker Object
    function setMarker() {
    	//Create marker for every location in the array
        self.locations().forEach(function(location) {
            var position = location.location;
            var name = location.name;
            var address = location.address;
            var type = location.type;

            // Credit to Udacity's FEND  - Lesson 17 : Getting Started with API'S
            location.marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    name: name,
                    address: address,
                    type:type,
                    animation: google.maps.Animation.DROP,
                    id: location
            });

                //Push marker objects to markers array
                markers.push(location.marker);
               
             location.marker.addListener('click', function() {
                populateInfoWindow(this, largeInfoWindow);
                });

            bounds.extend(location.marker.position);
          
        });

        map.fitBounds(bounds);
    }


    //Create function to display infoWindow
    function populateInfoWindow(marker,infowindow){
    	if (infowindow.marker != marker){
    		infowindow.marker = marker;

    		//Declare FourSquare AJAX function
    		function getFoursquareData(){
    			//Declare URL elements
		    	var URL = "https://api.foursquare.com/v2/venues/search";
		    	var clientID="HHQT0NCJBN0ECJKYOHJ3TA5YO4ACP3KF5X0G4OMIEQCGA4JW";
		    	var clientSecret = "QCBFXSS5DN2VSK4UCREI0R2AIJS4C1X1LXHDBQDWUQKAU1UV";
		    	var version = 20130815;
		    	var query = marker.name.replace(/ on| in| &/, '');
		    	var near = "tampa";

		    	//Build Foursquare AJAX request URL
		    	var fourSquareUrl = URL + 
		    		"?client_id=" + 
		    		clientID + 
		    		"&client_secret=" + 
		    		clientSecret + 
		    		"&v=" +
		    		version +
		    		"&near="+
		    		near +
		    		"&query=" +
		    		query;

		    	$.ajax({
		    		url: fourSquareUrl,
		    		success: function(data){
		    			//console.log(data);
		    			var phoneNumber = data.response.venues[0].contact.formattedPhone;
		    			var menuLink = data.response.venues[0].menu.url;
		    			/*var photo = data.response.venue.*/
		    			infowindow.setContent('<div><strong>'+ marker.name + '</strong><br>' +
		    									marker.address + '<br><br>' +
		    									'<i>'+ 'Phone Number: '+ phoneNumber + '</i></div>')
		    		}
		    	})
		    	// Error Handling for AJAX request
		    	.fail(function() {
                    infowindow.setContent('<div>No place found for '+ marker.name +'.'+ '</div>');
    			});
		    }
		    //Initialize Foursquare AJAX function
    		getFoursquareData();
    		infowindow.open(map,marker);

    		infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
    	}	
   }

   //Initialize Marker function
   setMarker();


  
};




