function createMap(position) {
    // Gets the map div from the DOM. //
    var map = new Microsoft.Maps.Map($("#map")[0], {
        center: position
    });

    

}

// Callback method for the bing API script. //
function loadMapScenario() {

    navigator.geolocation.getCurrentPosition(

        // Callback function for success in the getCurrentLocation() method. //
        function (position) {
            $.ajax({
                type: "GET",
                url: "src/php/getSobiData.php",
                success: function (data) {
                    console.log(data);
                },
                dataType: 'json',
                async: 'false'
            });
            createMap(new Microsoft.Maps.Location(position.coords.latitude, position.coords.longitude));
        },


        // Callback function for an error in the getCurrentLocation() method. //
        function (error) {
            // Uses Mohawk College's location if permission is denied. //
            createMap(new Microsoft.Maps.Location(43.2387, -79.8881));
        }
    )
}
