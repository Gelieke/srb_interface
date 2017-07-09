/*  Created by Gelieke Steeghs, copyright 2017.
    This code is for a dashboard web interface for Tonnie, the smart rainwater buffering system.
    The interface shows different charts and graphs which are created with JavaScript library D3 v4.
    The grid of the interface is made with Bootstrap v3.3.7, jQuery and Moment.js.
    The map is created with Leaflet v1.0.3 and the date range picker is retrieved from www.daterangepicker.com.

    This is the JavaScript file called pie.js, which is the code for the water ratio discharge graph (donut chart).   */

function drawPie() {
    
// set the dimensions and margins of the graph
var margin = {top: 60, right: 10, bottom: 30, left: 20},
    width = 450 - margin.left - margin.right,
    height = 310 - margin.top - margin.bottom;

var radius = Math.min(width, height) / 2;
var donutWidth = 60;
var legendRectSize = 22;
var legendSpacing = 6;
    
var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S%Z"); // parse the time for the time scale and axis

var color = d3.scaleOrdinal().range(["#004466", "#2c81bf", "#c5dbf0"]); // set the colours of the donut parts

var svg = d3.select('.svg_pie').append('g').attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

var arc = d3.arc()
  .innerRadius(radius - donutWidth)
  .outerRadius(radius);
    
var pie = d3.pie()
  .value(function(d) { return d.value; })
  .sort(null);

var tooltip = d3.select('#pieid')                               
  .append('div')                                                
  .attr('class', 'toolTipPie');  
    
tooltip.append('div')                                           
   .attr('class', 'value');
    
var counter = 0;
var valve_counter3 = null;
var valve_counter4 = null;
var valve_counter5 = null;
var data_agg = new Array();    
   
var pielabel = ["", "", "", "Riool", "Bewoner", "Tuin"];

d3.json(datahandler_pie, function(error, data) {
    if (error) throw error; 
    
  // make new array with only the values we need
  for (j = 0; j < data.length; j++) {
      
      var today = new Date();
      data[j]["date"] = parseTime(data[j]["date"]);
      
      if (data[j]["date"].getDate() == today.getDate()) { // pak alleen de data voor de datum van vandaag
      
          if (data[j]["valve"] == 3) { // If the valve is 3, sewers

              if (valve_counter3 != null) { // if there are two nr 3 valves, so two neighbourhoods are selected
                  data_agg[valve_counter3]["value"] = ((data[j]["value"]+data_agg[valve_counter3]["value"])/2);
              } else {
                  data_agg[counter] = new Array();
                  data_agg[counter] = data[j];
                  valve_counter3 = counter;
                  counter++;
              }

          } else if (data[j]["valve"] == 4) { // If the valve is 4, faucet

              if (valve_counter4 != null) { // if there are two nr 3 valves, so two neighbourhoods are selected
                  data_agg[valve_counter4]["value"] = ((data[j]["value"]+data_agg[valve_counter4]["value"])/2);
              } else {
                  data_agg[counter] = new Array();
                  data_agg[counter] = data[j];
                  valve_counter4 = counter;
                  counter++;
              }

          } else if (data[j]["valve"] == 5) { // If the valve is 4, garden

              if (valve_counter5 != null) { // if there are two nr 3 valves, so two neighbourhoods are selected
                  data_agg[valve_counter5]["value"] = ((data[j]["value"]+data_agg[valve_counter5]["value"])/2);
              } else {
                  data_agg[counter] = new Array();
                  data_agg[counter] = data[j];
                  valve_counter5 = counter;
                  counter++;
              }
          }
      }
  }
    
  data_agg.forEach(function(d) {
      d.value = +d.value;
  });
        
  var path = svg.selectAll('path')
    .data(pie(data_agg))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('class',function(d,i){ return 'arc'+i })
    .attr('fill', function(d,i) { return color(d.data.valve-3); });

  path.on('mouseover', function(d) {                            
    var total = d3.sum(data_agg.map(function(d) {                
      return d.value;                                           
    }));                                                        
    var percent = Math.round(1000 * d.value / total) / 10;
    tooltip.select('.value').html("Afvoer naar: " + pielabel[d.data.valve] + "<br> Hoeveelheid: " + d.value + " L" + "<br> Percentage: " + percent + '%');  
    tooltip.style('display', 'block');
    d3.select(this).style("opacity", 0.6);
  });                                                           

  path.on('mouseout', function() {                              
    tooltip.style('display', 'none'); 
    d3.select(this).style("opacity", 1);
  });                                                           

  path.on('mousemove', function(d) {                            
      tooltip.style('top', (d3.event.layerY - 100) + 'px')         
      .style('left', (d3.event.layerX - 70) + 'px');
  });                                                           

  // legend selection mouseover
  var legend = svg.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  height * color.domain().length / 2;
      var horz = 130;
      var vert = i * height - offset;
      return 'translate(' + horz + ',' + vert + ')';
    })
  .on('mouseover',function(d,i){
      d3.select('.arc'+i).style("opacity", 0.6);
  })
  .on('mouseout',function(d,i){
      d3.select('.arc'+i).style("opacity", 1);
  })

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color);

  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(function(d) { return pielabel[d+3]; });
});

}