/*  Created by Gelieke Steeghs, copyright 2017.
    This code is for a dashboard web interface for Tonnie, the smart rainwater buffering system.
    The interface shows different charts and graphs which are created with JavaScript library D3 v4.
    The grid of the interface is made with Bootstrap v3.3.7, jQuery and Moment.js.
    The map is created with Leaflet v1.0.3 and the date range picker is retrieved from www.daterangepicker.com.

    This is the JavaScript file called rainforecast_municipality.js, which is the code for the rain forecast graph for the next 2 hours.   */

var svg = d3.select(".svg_rain"), // set svg dimensions
    margin = {top: 10, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("g").attr("class", "toolTip").style("opacity", 0);
var parseTime = d3.timeParse("%H:%M"); // parse the time for the time scale and axis
var formatTime = d3.timeFormat("%H:%M");

var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the area
var rainarea = d3.area()
    .x(function(d) { return x(d.time); })
    .y0(height)
    .y1(function(d) { return y(d.value); });

// define the line
var rainline = d3.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.value); });

// gridlines in y axis function
function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(11)
}

d3.json("data-rain.php", function(error, data) {
      if (error) throw error; 

      // format the data
  data.forEach(function(d) {
      d.time = parseTime(d.time);     
      var rain = Math.pow(10,((d.value)-109.00)/32.00); // convert number to mm/h
      d.value = +Math.round(rain * 100) / 100; // round to at most 2 decimal places
      
      return d;
  });

  x.domain(d3.extent(data, function(d) { return d.time; }));
  y.domain([0, d3.max(data, function(d) { return d.value; })]);
  rainarea.y0(y(0)); // make sure the area starts from the x axis (y=0)
    
  // add the Y gridlines
  g.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )
  
  g.selectAll(".grid .tick line")
        .style("stroke", "lightgrey");
    
  g.selectAll(".grid path")
        .style("stroke-width", 0);

  // add the area
  g.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", rainarea);

  // add the waterlevelline path.
  g.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", rainline);

  // Add the dots
  g.selectAll("dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", function(d) { return x(d.time); })
      .attr("cy", function(d) { return y(d.value); })
          // tooltip
          .on("mousemove", function(d){
                tooltip
                 .transition()
                 .duration(200)
                 .style("opacity", .9);
                tooltip
                  .attr("class", "toolTip")
                  .style("left", d3.event.pageX - 70 + "px")
                  .style("top", d3.event.pageY - 75 + "px")
                  .style("display", "inline-block")
                  .html("Tijd: " + (formatTime(d.time)) + "<br>" + "Neerslag: " + (d.value) + " mm/u");
            })
          .on("mouseout", function(d){ tooltip.style("display", "none");});

  // Draw the x axis
  g.append("g")
      .data(data)
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(d3.timeMinute, 10).tickFormat(d3.timeFormat("%H:%M")))

  // Draw the y axis
  g.append("g")
      .data(data)
      .attr("class", "y axis")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Neerslag (mm/u)");
});