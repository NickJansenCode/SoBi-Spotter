var listHubs = [];

// Custom infobox template. //
var infoboxTemplate = `
<div id='infoboxText'>
    <div class="float-left ignorePad"> <a class="btn btn-danger" href="javascript:void(0)" onclick="(function(){infobox.setOptions({visible: false}) })();"> x </a> </div> 
    <div> {headerContent}  </div>
    <div> {bodyContent} </div>    
</div>`


function createMap(position, init = false, permission = false, filter = "") {
    // Gets the map div from the DOM. //
    var map = new Microsoft.Maps.Map($("#map")[0], {
        center: position
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

        if (init) {
            for (var i = 0; i < listHubs.length; i++) {

                // Initializes some variables for the pushpin. //
                let location = new Microsoft.Maps.Location(listHubs[i].lat, listHubs[i].long);
                let pushPin = new Microsoft.Maps.Pushpin(location, {icon: 'src/img/bikeicon.png', anchor: new Microsoft.Maps.Point(12, 39)});
                let title = listHubs[i].name;
                let description = listHubs[i].description;


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

    }

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
                    "desc": "Current Location"
                });

            $.ajax({
                type: "GET",
                url: "src/php/getSobiData.php",
                success: function (data) {

                    for (var i = 0; i < data.length; i++) {
                        listHubs.push({
                            "long": data[i].long,
                            "lat": data[i].lat,
                            "desc": data[i].desc,
                            "name": data.name
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
