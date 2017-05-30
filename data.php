<?php
    $username = "id1804782_regenton"; 
    $password = "Regenton123";   
    $host = "localhost";
    $database = "id1804782_data";
    $table= "rainforecast";

    // Create connection
    $conn = new mysqli($host, $username, $password, $database);

   // Check connection
    if ($conn->connect_error) die("Connection failed: " . $conn->connect_error);

    $sql = "SELECT  value, time  FROM " . $table;
    $result = $conn->query($sql);

    for ($data = array (); $row = $result->fetch_assoc(); $data[] = $row);
    echo json_encode($data);

    $conn->close();    
?>