<!--    Created by Gelieke Steeghs, copyright 2017.
        This code is for a dashboard web interface for Tonnie, the smart rainwater buffering system.
        The interface shows different charts and graphs which are created with JavaScript library D3 v4.
        The grid of the interface is made with Bootstrap v3.3.7, jQuery and Moment.js.
        The map is created with Leaflet v1.0.3 and the date range picker is retrieved from www.daterangepicker.com.

        This is the file called data-rain.php, which retrieves the current rain forecast for the next 2 hours from Buienradar.   -->

<?php
    $file = file_get_contents("https://gpsgadget.buienradar.nl/data/raintext?lat=52.2&lon=6.9"); // get the rain forecast in Enschede from Buienradar
    $file = explode("\r\n", $file);

    $data = array();

    for ($i = 0; $i < count($file)-1; $i++) {
        $data[$i] = explode("|", $file[$i]);
        $data[$i]["value"] = $data[$i][0]; // put the rain value under the heading "value"
        unset($data[$i][0]);
        $data[$i]["time"] = $data[$i][1]; // put the time under the heading "time"
        unset($data[$i][1]);
    }

    echo json_encode($data); // encode data to json file
?>