<!DOCTYPE html>
<html lang="en">
  <head>
      
    <!--    Created by Gelieke Steeghs, copyright 2017.
            This code is for a dashboard web interface for Tonnie, the smart rainwater buffering system.
            The interface shows different charts and graphs which are created with JavaScript library D3 v4.
            The grid of the interface is made with Bootstrap v3.3.7, jQuery and Moment.js.
            The map is created with Leaflet v1.0.3 and the date range picker is retrieved from www.daterangepicker.com
            DINPro font retrieved from Freakfont: http://freakfonts.com/fonts/dinproregular2320.html
            Icons retrieved from The Noun Project: https://thenounproject.com/

            This is the main file called index.php, where all JavaScript files of the charts and graphs are loaded into.   -->
      
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

    <title>Tonnie, the smart rainwater buffering system</title>

    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
    <link href="css/ie10-viewport-bug-workaround.css" rel="stylesheet">
      
    <!-- Leaflet code -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.0.3/dist/leaflet.js"></script>
    
    <!-- JQuery & Moment.js -->
    <script type="text/javascript" src="//cdn.jsdelivr.net/jquery/1/jquery.min.js"></script>
    <script type="text/javascript" src="//cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
      
    <!-- Include Date Range Picker -->
    <script type="text/javascript" src="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.js"></script>
    <link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.css" />
      
    <!-- Custom styles for this template -->
    <link href="css/dashboard.css" rel="stylesheet">
      
    <!-- D3 style -->
    <link href="css/d3.css" rel="stylesheet">  
    
  </head>
    
  <body style="background-color: #ededed; overflow-x:hidden;"> <!-- custom background color -->
      
<!-- load the d3.js library -->    	
<script src="https://d3js.org/d3.v4.min.js"></script>

    <nav class="navbar navbar-inverse navbar-fixed-top shadow bluegreen">
      <div class="container-fluid">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" style="color: #2a3f54; font-size: 30pt" href="#">TONNIE</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
          <ul class="nav navbar-nav navbar-right">
              <!-- Date display -->
              <li><a style="color: #2a3f54; font-size: 20pt" href="#">
                  <script>
                  var today = new Date();
                  var monthNames = [ "januari", "februari", "maart", "april", "mei", "juni",
"juli", "augustus", "september", "oktober", "november", "december" ];
                  var weekDays = [ "Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag" ];
                  var date = (weekDays[today.getDay()])+' '+today.getDate()+' '+(monthNames[today.getMonth()])+' '+today.getFullYear();
                  document.write(date);
                  </script>
                  </a></li>
              <!-- Status display -->
              <li><div id="status">
                  
                  <script>
                  var images = ["images/Priority-critical.png", "images/Priority-error.png", "images/Priority-warning.png", "images/Priority-notification.png", "images/Priority-OK.png"]; // array with the paths to the priority (status) images. index corresponds to priority number (0, 1, 2, 3, 4)
                  var statusnames = ["Kritiek", "Error", "Waarschuwing", "Melding", "OK"]; // array with priority (status) names
                      
                  $.getJSON('data-status.php', function(index) {  
                    document.getElementById('status').innerHTML = "<img src=" + images[index] + " width='40px' style='margin-top:-5px; margin-left: -5px'> Status: " + statusnames[index];   
                  });
                
                  </script>
                  </div></li>
          </ul>
        </div>
      </div>
    </nav>
    
    <div class="row" style="margin-top: 15px;">
        <div class="col-md-8 whitebox">
            <h3>Buffer vullingsgraad <p style="margin-left: 440px; display: inline">Selectie: </p><p id="currentneighbourhood" style="color: #fff; text-align: right; display: inline">Gehele gebied</p></h3> 
            
            <div class="row">
                
                <div class="col-md-3">
                <h4 style="margin-left: -5px;">Selecteer een wijk</h4>
                    
                    <br>
                    
                    <div id="mapid">
                    
                    <script>
                    
                    var colour = '#68add8';
                    var toggle = 0; // toggle variable for selecting one neighbourhood, none or both
                        
                    // get the date of today
                    var today = new Date();
                    var formatToday = d3.timeFormat("%Y-%m-%d");   
                    var neighbourhoodnumber = 0;

                    // data file handler php, define default selection
                    var datahandler = "http://regenbuffer.student.utwente.nl/app.php/buffers?start=2017-06-04&end=2017-06-10&neighbourhood=both";
                    var datahandler_current = "http://regenbuffer.student.utwente.nl/app.php/buffers?start=" + formatToday(today) + "&end=" + formatToday(today) + "&neighbourhood=both";
                    var datahandler_discharge = "http://regenbuffer.student.utwente.nl/app.php/plannings?neighbourhood=both";
                    var datahandler_pie = "http://regenbuffer.student.utwente.nl/app.php/buffers/" + neighbourhoodnumber + "/waterflows";
                                                
                    // split data for further handling
                    var data_part = datahandler.split("?"); 
                    var data_part_current = datahandler_current.split("?");
                    var data_part_discharge = datahandler_discharge.split("?");
                    var data_part_pie = datahandler_pie.split("buffers/");
                    var data_part_pie2 = data_part_pie[1].split("/waterflows"); // get the current neighbourhoodnumber
                        
                    var data_part_split = data_part[1].split("&") // split the url in the start [0], end [1] and neighbourhood [2] statements
                    var data_part_split_current = data_part_current[1].split("&") // split the url in the start [0], end [1] and neighbourhood [2] statements    
                        
                    //Handle click on polygon
                    var onPolyClick = function(event){
                        
                        var neighbourhood = event.target.options.wijk;
                        
                        // if and else statements for the toggle colour selections of the neighbourhoods
                        if (toggle == 0) { // if no selection made yet
                            if (neighbourhood == "De Bothoven") { // if De Bothoven is selected

                                    toggle = 1; // Bothoven is selected, Velve-Lindenhof is not

                                    if (colour == '#2c81bf') {
                                        colour = '#68add8';
                                        changeColour(group, toggle, colour);
                                    } else if (colour == "#68add8") {
                                        colour = '#2c81bf';
                                        changeColour(group, toggle, colour); // change colour back
                                    }
                            } else if (neighbourhood == "Velve-Lindenhof") {
                                
                                    toggle = 2; // Velve-Lindenhof is selected, De Bothoven is not

                                    if (colour == '#68add8') {
                                        colour = '#2c81bf';
                                        changeColour(group, toggle, colour);
                                    } else if (colour == "#2c81bf") {
                                        colour = '#68add8';
                                        changeColour(group, toggle, colour); // change colour back
                                    }
                            }
                        } else if (toggle == 1) { // if previous selection was De Bothoven
                            if (neighbourhood == "De Bothoven") { // and current selection is also De Bothoven
                                neighbourhood = "both";
                                colour = '#68add8';
                                changeColour(group, toggle, colour); // change colour of De Bothoven back
                                toggle = 0; // no neighbourhood is selected anymore
                            } else if (neighbourhood == "Velve-Lindenhof") {
                                neighbourhood = "both";
                                colour = "#2c81bf";
                                changeColour(group, 2, colour);
                                toggle = 3; // Both neighbourhoods are selected
                            }       
                        } else if (toggle == 2) { // if previous selection was Velve-Lindenhof
                            if (neighbourhood == "Velve-Lindenhof") { // and current selection is also Velve-Lindenhof
                                neighbourhood = "both";
                                colour = '#68add8';
                                changeColour(group, toggle, colour); // change colour back
                                toggle = 0; // no neighbourhood is selected anymore
                            } else if (neighbourhood == "De Bothoven") {
                                neighbourhood = "both";
                                colour = "#2c81bf";
                                changeColour(group, 1, colour);
                                toggle = 3; // Both neighbourhoods are selected
                            }   
                        } else if (toggle == 3) { // if both neighbourhoods are selected
                            if (neighbourhood == "De Bothoven") {
                                toggle = 2; // now only Velve-Lindenhof is selected still
                                colour = "#68add8";
                                changeColour(group, 1, colour);
                                neighbourhood = "Velve-Lindenhof";

                            } else if (neighbourhood == "Velve-Lindenhof") {
                                toggle = 1; // now only De Bothoven is selected still
                                colour = "#68add8";
                                changeColour(group, 2, colour);
                                neighbourhood = "De Bothoven";
                            }
                        }
                        
                        // numbers for the pie chart
                        if (neighbourhood == "Velve-Lindenhof") neighbourhoodnumber = 1;
                        else if (neighbourhood == "De Bothoven") neighbourhoodnumber = 2;
                        else if (neighbourhood == "both") neighbourhoodnumber = 0;
                                                
                        // Get previous neighbourhood
                        var nbh_part = data_part_split[2].split("=");
                        nbh_part[1] = neighbourhood; // replace with newly selected neighbourhood
                        
                        // Create the new data handler url
                        datahandler = data_part[0] + "?" + data_part_split[0] + "&" + data_part_split[1] + "&" + nbh_part[0] + "=" + nbh_part[1];
                        datahandler_current = data_part_current[0] + "?" + data_part_split_current[0] + "&" + data_part_split_current[1] + "&" + nbh_part[0] + "=" + nbh_part[1];
                        datahandler_discharge = data_part_discharge[0] + "?" + nbh_part[0] + "=" + nbh_part[1];
                        datahandler_pie = data_part_pie[0] + "buffers/" + neighbourhoodnumber + "/waterflows";
                        
                        // update chart
                          d3.select(".svg_capacity").remove(); // remove current svg for updating purposes
                          d3.select(".svg_buffer").remove();
                          d3.select(".svg_discharge").remove();
                          d3.select(".svg_pie").remove();
                          d3.select(".toolTipBuffer").remove();
                        
                          var newSvgCap = document.getElementById("capid");
                          newSvgCap.innerHTML += '<svg class="svg_capacity" width="400" height="290"></svg>'; // add the svg again
                        
                          var newSvgBuf = document.getElementById("bufferid");
                          newSvgBuf.innerHTML += '<svg class="svg_buffer" width="280" height="300"></svg>'; // add the svg again
                        
                          var newSvgDis = document.getElementById("dischargeid");
                          newSvgDis.innerHTML += '<svg class="svg_discharge" width="650" height="250"></svg>'; // add the svg again
                        
                          var newSvgPie = document.getElementById("pieid");
                          newSvgPie.innerHTML += '<svg class="svg_pie" width="450" height="310"></svg>'; // add the svg again
                        
                          // set name so it is clear which neighbourhood is selected
                          var updateText = document.getElementById("currentneighbourhood");
                          var updateText2 = document.getElementById("currentneighbourhood2");
                          var updateText3 = document.getElementById("currentneighbourhood3");
                          console.log(updateText); // added bij Jeroen
                          if (neighbourhood == "both") {
                              updateText.innerHTML = "Gehele gebied";
                              updateText2.innerHTML = "Gehele gebied";
                              updateText3.innerHTML = "Gehele gebied";
                          } else {
                              updateText.innerHTML = neighbourhood;
                              updateText2.innerHTML = neighbourhood;
                              updateText3.innerHTML = neighbourhood;
                          }
                        
                          // draw the charts again, in the right order
                          drawBuffer();  
                          drawChart();
                          drawDischarge();
                          drawPie();
                    };
                    </script>
                    <script src="js/map.js"></script>
                    </div>
                </div>
                
                <div class="col-md-3" style="margin-left: 25px;">
                    <h4>Vandaag</h4>
                    
                    <div id="bufferid" style="margin-top: 15px;">
                    <svg class="svg_buffer" width="280" height="300"></svg>
                    <script src="js/buffer.js"></script>
                    </div>
                        
                </div>
                
            <div class="col-md-5">
                <h4>Historie</h4>
                
                <div style="text-align:center;">
                    Selecteer een tijdsperiode: <input type="text" name="daterange" value="" style="width:175px; text-align: center; background-color: #c6c6c6; border: none"/>
                </div>

                <div id="capid">
                <svg class="svg_capacity" width="400" height="290"></svg> <!-- create svg for the first time the chart is drawn -->
                
                <script src="js/capacity_municipality.js"></script>

                <script type="text/javascript">
                // initialize date range picker
                $(function() {
                    $('input[name="daterange"]').daterangepicker(
                        {
                        locale: {
                          format: 'DD-MM-YYYY'
                        },
                          startDate: '04-06-2017',
                          endDate: '10-06-2017'
                        }, 
                        function(start, end, label) {

                          // Get previous dates
                          var start_part = data_part_split[0].split("=");
                          var end_part = data_part_split[1].split("=");
                          
                          var start_corrected = moment(start).subtract(1);
                            
                          // Replace with newly selected dates
                          start_part[1] = start_corrected.format("YYYY-MM-DD");                            
                          end_part[1] = end.format("YYYY-MM-DD");  
                          
                          // Create the new data handler url
                          datahandler = data_part[0] + "?" + start_part[0] + "=" + start_part[1] + "&" + end_part[0] + "=" + end_part[1] + "&" + data_part_split[2];
                            
                          // update chart
                          d3.select(".svg_capacity").remove(); // remove current svg for updating purposes
                          var newSvgCap2 = document.getElementById("capid");
                          newSvgCap2.innerHTML += '<svg class="svg_capacity" width="400" height="290"></svg>'; // add the svg again
                            
                          drawChart(); // update chart
                        }
                    );
                });

                $(document).ready(function(){
                    // call draw functions when DOM is ready
                    drawBuffer();
                    drawChart();
                    drawMap();
                    drawDischarge();
                    drawPie();
                });

                </script>
                </div>
            </div>
        </div>
        </div>
    <div class="col-md-4 whitebox" style="height: 394px">
        
        <h3>Waterafvoer <p style="margin-left: 90px; display: inline">Selectie: </p><p id="currentneighbourhood3" style="color: #fff; text-align: right; display: inline">Gehele gebied</p></h3>
        <h4>Verhouding waterafvoer naar het riool, de tuin en de bewoner</h4>
        <div id="pieid">
            <svg class="svg_pie" width="450" height="310"></svg>
            <script src="js/pie.js"></script>
        </div>
        
    </div>
      </div> 
      <div class="row">
          
          <div class="col-md-6 whitebox">
              <h3>Regenvoorspelling</h3>
              <h4>Verwachte regen voor de komende 2 uur</h4>
              
              <div id="rainid">
              <svg class="svg_rain" width="650" height="250"></svg>
              <script src="js/rainforecast_municipality.js"></script>
              </div>
          </div>
          
          <div class="col-md-6 whitebox">
              <h3>Geplande leegloop <p style="margin-left: 240px; display: inline">Selectie: </p><p id="currentneighbourhood2" style="color: #fff; text-align: right; display: inline">Gehele gebied</p></h3>
              <h4>Geplande leegloop voor de komende paar uur</h4>
              
              <div id="dischargeid">
              <svg class="svg_discharge" width="680" height="250"></svg>
              <script src="js/planned_discharge.js"></script>
              </div>
          </div>
      </div>
      
      <div class="row" style="text-align: center; padding: 5px">
          © <div style="color: #2c81bf; display: inline;">Copyright Tonnie 2017</div>
      </div>

    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="js/bootstrap.min.js"></script>
    <!-- Just to make our placeholder images work. Don't actually copy the next line! -->
    <script src="js/holder.min.js"></script>
    <!-- IE10 viewport hack for Surface/desktop Windows 8 bug -->
    <script src="js/ie10-viewport-bug-workaround.js"></script>
  </body>
</html>
