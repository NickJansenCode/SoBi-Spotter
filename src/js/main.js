var listHubs = [];

// Custom infobox template. //
var infoboxTemplate = `
<div id='infoboxText'>
    <div class="float-left ignorePad"> <a class="btn btn-danger" href="javascript:void(0)" onclick="(function(){infobox.setOptions({visible: false}) })();"> x </a> </div> 
    <div> {headerContent}  </div>
    <div> {bodyContent} </div>
    <div><a onclick="copyToClipboard(infobox)" href="#"> Copy Point Data To Clipboard </a> </div>    
</div>`

var neighbourhoods = {
    'Corktown': { 'lat': 43.2501284, 'long': -79.8714028 },
    'Durand': { 'lat': 43.2511214, 'long': -79.8815258 },
    'Stinson': { 'lat': 43.2507937, 'long': -79.8685812 },
    'St. Clair': { 'lat': 43.245299, 'long': -79.8506123 },
    'Blakely': { 'lat': 43.2424412, 'long': -79.8450937 },
    'Crown Point West': { 'lat': 43.2497846, 'long': -79.8309647 },
    'Stipley': { 'lat': 43.2522747, 'long': -79.8410247 },
    'Gibson': { 'lat': 43.2547057, 'long': -79.8509757 },
    'Landsdale': { 'lat': 43.2571312, 'long': -79.860832 },
    'Beasly': { 'lat': 43.2596417, 'long': -79.8709197 },
    'Central Hamilton': { 'lat': 43.2596696, 'long': -79.8849231 },
    'Strathcona': { 'lat': 43.2655257, 'long': -79.8930973 },
    'North End': { 'lat': 43.2695871, 'long': -79.8666298 },
    'Industrial Sector A': { 'lat': 43.2686727, 'long': -79.8559718 },
    'Industrial Sector B': { 'lat': 43.2664632, 'long': -79.8459981 },
    'Industrial Sector C': { 'lat': 43.2641137, 'long': -79.8359898 },
    'Industrial Sector D': { 'lat': 43.2618127, 'long': -79.8260227 },
    'Kirkendall North': { 'lat': 43.2547682, 'long': -79.9019685 },
    'Kirkendall South': { 'lat': 43.2468732, 'long': -79.9010126 },
    'Chedoke Park B': { 'lat': 43.2495046, 'long': -79.9144347 },
    'Westdale North': { 'lat': 43.2675922, 'long': -79.9070187 },
    'Westdale South': { 'lat': 43.2614556, 'long': -79.9134973 },
    'Ainslie Wood North': { 'lat': 43.2625552, 'long': -79.9391968 },
    'Ainslie Wood East': { 'lat': 43.2527457, 'long': -79.9257258 },
    'Ainslie Wood': { 'lat': 43.2512792, 'long': -79.9380923 },
    'Dundas': { 'lat': 43.265943, 'long': -79.953666 },
}

var searchContent = `
Currently, the search feature of this app is limited to the
following list of neighbourhoods in Hamilton, ON.
<ul>
    <li>Corktown</li><li>Stinson</li><li>Durand</li><li>St.Clair</li><li>Blakely</li><li>Crown Point West</li><li>Stipley</li><li>Gibson</li><li>Landsdale</li><li>Beasly</li><li>Central Hamilton</li><li>Strathcona</li><li>NorthEnd</li><li>Industrial SectorA</li><li>Industrial SectorB</li><li>Industrial SectorC</li><li>Industrial SectorD</li><li>Kirkendall North</li><li>Kirkendall South</li><li>Chedoke Park B</li><li>Westdale North</li><li>Westdale South</li><li>Ainslie Wood North</li><li>Ainslie Wood East</li><li>Ainslie Wood</li><li>Dundas</li>
</ul>
To search, simply type in the search bar and select the 
desired neighbourhood you wish to move the map to.
`

var directionsContent = `
To get the map to show the fastest route between two hubs,
click on the icon for the hub you would like to choose as
your start point and select "Copy Point Data To Clipboard".
Paste the point data from your clipboard into the 'From' 
input above the map.

Follow the same directions to copy another icon's point
data to your clipboard, and paste it into the 'To'
input above the map.

Click the 'Go' button to have the map calculate and overlay
the route created on the map.

You may also select and copy the point data from your 
current location's icon (see legend). 
`

var findHubContent = `
Currently, this map contains all of the known SoBi hubs
in Hamilton, ON. To find a hub, simply navigate the map
on the interface and find your desired SoBi hub.

The closest SoBi hub to your current position has it's
icon highlighted in a green colour, and the closest
SoBi hub with a kiosk has it's icon highlighted in a 
purple colour. All other hubs are marked in a white
coloured icon, and your current location is denoted
by the bicycle rider icon.

Along with the directions finding functionality, this
app can allow you to upgrade your SoBi experience.
`



var minDistance = Number.MAX_SAFE_INTEGER;
var minDistanceKiosk = Number.MAX_SAFE_INTEGER;
var minDistanceIndex;
var minDistanceKioskIndex;
var toCoords;
var fromCoords;

// Uses the Haversine formula to determine the distance in km between two points. //
// Shamelessly stolen from https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula //
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

// Little helper method that converts degrees to radians. //
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function createMap(position, init = false, permission = false, filter = "") {
    // Gets the map div from the DOM. //
    var map = new Microsoft.Maps.Map($("#map")[0], {
        center: position,
        zoom: 16
    });

    // If the user has provided location permissions, populates the map with pushpins and infoboxes. //
    if (permission) {

        // Creates the infobox that will be reused for the map. //
        infobox = new Microsoft.Maps.Infobox(
            new Microsoft.Maps.Location(0, 0),
            {
                title: "temp",
                visible: false,
                autoAlignment: true
            });

        infobox.setMap(map);


        for (var i = 0; i < listHubs.length; i++) {
            var imgSrc = "";
            if (listHubs[i].haskiosk == "Yes") {
                if (i == minDistanceKioskIndex) {
                    imgSrc = 'src/img/purplebikeicon';
                }
            }
            else {
                if (i == 0) {
                    imgSrc = 'src/img/usericon.png';
                } else {
                    imgSrc = i == minDistanceIndex ? 'src/img/greenbikeicon' : 'src/img/bikeicon';

                }
            }


            // Initializes some variables for the pushpin. //
            let location = new Microsoft.Maps.Location(listHubs[i].lat, listHubs[i].long);
            let pushPin = new Microsoft.Maps.Pushpin(location, { icon: imgSrc, anchor: new Microsoft.Maps.Point(12, 39) });
            let title = listHubs[i].name;
            let description = listHubs[i].desc;


            // Sets some metadata for the pushPin. //
            pushPin.metadata = {
                title: title,
                description: description
            };


            // This case handles the user's current location pin. Sets the infobox to just display //
            // "current location" instead of all the other information that the rest do. //
            if (i == 0) {

                // Sets an onclick event handler for the pushpin that changes the infobox content and makes it pop up. //
                Microsoft.Maps.Events.addHandler(pushPin, 'click', function (args) {
                    infobox.setOptions({
                        visible: true,
                        location: args.target.getLocation(),
                        htmlContent: infoboxTemplate.replace('{headerContent}', args.target.metadata.title)
                    });
                });

                // Pushes the pushpin to the map. //
                map.entities.push(pushPin);
            }

            // This case handles all of the rec centre pushpins. //
            else {

                // If the filter includes the city name of the rec centre. //
                if (listHubs[i].desc.includes(filter)) {

                    //Sets an onclick event handle for the pushpin that changes the infobox content //
                    //(more detail than the user's location pin) and sets it to visible. //
                    Microsoft.Maps.Events.addHandler(pushPin, 'click', function (args) {
                        infobox.setOptions({
                            visible: true,
                            location: args.target.getLocation(),
                            htmlContent: infoboxTemplate.replace(
                                '{headerContent}', args.target.metadata.title).replace(
                                    '{bodyContent}', args.target.metadata.description)

                        });

                    });

                    // Pushes the pushpin to the map. //
                    map.entities.push(pushPin);
                };
            }


        }


    }

    //Load the directions module.
    Microsoft.Maps.loadModule('Microsoft.Maps.Directions', function () {
        //Create an instance of the directions manager.
        directionsManager = new Microsoft.Maps.Directions.DirectionsManager(map);
        directionsManager.showInputPanel('directionsInputContainer');
    });

}

// Callback method for the bing API script. //
function loadMapScenario(init = true, filters = "") {

    navigator.geolocation.getCurrentPosition(

        // Callback function for success in the getCurrentLocation() method. //
        function (position) {
            listHubs.push(
                {
                    "long": position.coords.longitude,
                    "lat": position.coords.latitude,
                    "name": "Current Location",
                    "desc": "Current Location",
                    "haskiosk": false
                });

            $.ajax({
                type: "GET",
                url: "src/php/getSobiData.php",
                success: function (data) {

                    for (var i = 0; i < data.length; i++) {

                        let distance = getDistanceFromLatLonInKm(listHubs[0].lat, listHubs[0].long, data[i].lat, data[i].long)

                        if (distance < minDistance) {
                            minDistance = distance;
                            minDistanceIndex = i + 1;
                        }

                        if (data[i].haskiosk == "Yes" && distance < minDistanceKiosk) {
                            minDistanceKiosk = distance;
                            minDistanceKioskIndex = i + 1;
                        }

                        listHubs.push({
                            "long": data[i].long,
                            "lat": data[i].lat,
                            "name": data[i].name,
                            "desc": data[i].desc,
                            "haskiosk": data[i].haskiosk
                        })
                    }

                    // Draws the map (this is the default map load method). //
                    createMap(new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude), init, true, filters);
                },
                dataType: 'json',
                async: 'false'
            });

        },


        // Callback function for an error in the getCurrentLocation() method. //
        function (error) {
            // Uses Mohawk College's location if permission is denied. //
            createMap(new Microsoft.Maps.Location(43.2387, -79.8881));
        }
    )


}

$(document).ready(function () {


    $('.modalLink').click(function (e) {
        switch (e.target.text) {
            case 'Search':
                $("#modal-content-body").html("");
                $("#modalTitle").html("");
                $("#modalTitle").html("Search");
                $("#modal-content-body").html(searchContent);
                return;

            case 'Get Directions':
                $("#modal-content-body").html("");
                $("#modalTitle").html("");
                $("#modalTitle").html("Get Directions");
                $("#modal-content-body").html(directionsContent);
                return;

            case 'Find a Hub':
                $("#modal-content-body").html("");
                $("#modalTitle").html("");
                $("#modalTitle").html("Find A Hub");
                $("#modal-content-body").html(findHubContent);
                return;
        }

    });

    $("#searchBox").autocomplete({
        source: function (request, response) {
            var results = $.ui.autocomplete.filter(Object.keys(neighbourhoods), request.term);
            response(results.slice(0, 10));
        },

        select: function (e) {
            var point = neighbourhoods[e.currentTarget.childNodes[0].innerText];
            createMap(new Microsoft.Maps.Location(point.lat, point.long), false, true);
        },
    });

    copyToClipboard = function (e) {
        var $temp = $("<input>");
        $("body").append($temp);
        $temp.val(String(e.getLocation().latitude) + ", " + String(e.getLocation().longitude)).select();
        document.execCommand("copy");
        $temp.remove();
    }
})

