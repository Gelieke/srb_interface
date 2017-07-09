<!--    Created by Gelieke Steeghs, copyright 2017.
        This code is for a dashboard web interface for Tonnie, the smart rainwater buffering system.
        The interface shows different charts and graphs which are created with JavaScript library D3 v4.
        The grid of the interface is made with Bootstrap v3.3.7, jQuery and Moment.js.
        The map is created with Leaflet v1.0.3 and the date range picker is retrieved from www.daterangepicker.com.

        This is the file called data-status.php, which retrieves the current status from the server.   -->

<?php
    $file = file_get_contents("http://regenbuffer.student.utwente.nl/app.php/status"); // get the number of the current status from the server
    echo json_encode($file); // encode to json file
?>