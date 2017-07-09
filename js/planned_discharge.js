/*  Created by Gelieke Steeghs, copyright 2017.
    This code is for a dashboard web interface for Tonnie, the smart rainwater buffering system.
    The interface shows different charts and graphs which are created with JavaScript library D3 v4.
    The grid of the interface is made with Bootstrap v3.3.7, jQuery and Moment.js.
    The map is created with Leaflet v1.0.3 and the date range picker is retrieved from www.daterangepicker.com.

    This is the JavaScript file called planned_discharge.js, which is the code for the planned discharge graph for the coming few hours.   */

function drawDischarge() {
    
    var buffercapacity = 190; // capacity of the buffer
    var bufferfilled = 170; // how full is the buffer?
    
    var dischargesvg = d3.select(".svg_discharge"),
        margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        dischargeg = dischargesvg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body").append("g").attr("class", "toolTipDischarge").style("opacity", 0);
    var parseTime = d3.timeParse("%H:%M"); // parse the time for the time scale and axis
    var formatTime = d3.timeFormat("%H:%M");

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the area
    var bufferarea = d3.area()
        .x(function(d) { return x(d.time); })
        .y0(height)
        .y1(function(d) { return y(d.amount); });

    // define the line
    var bufferline = d3.line()
        .x(function(d) { return x(d.time); })
        .y(function(d) { return y(d.amount); });
    
    var amount_speed = [];

    d3.json(datahandler_discharge, function(error, data) {
          if (error) throw error; 

          // format the data
          data.forEach(function(d, i) {
              d.time = parseTime(d.time);
              
              bufferfilled = bufferfilled - d.amount; // subtract from the current content
              amount_speed[i] = d.amount;
              d.amount = +Math.round(bufferfilled * 100) / 100; // round to at most 2 decimal places
              
              if (d.amount <= 0) d.amount = 0;
              
              return d;
          });

      x.domain(d3.extent(data, function(d) { return d.time; }));
      y.domain([0, buffercapacity]);
      bufferarea.y0(y(0)); // make sure the area starts from the x axis (y=0)

      // add the area
      dischargeg.append("path")
          .datum(data)
          .attr("class", "area")
          .attr("d", bufferarea);

      // add the waterlevelline path.
      dischargeg.append("path")
          .data([data])
          .attr("class", "line")
          .attr("d", bufferline);

      // Add the dots
      dischargeg.selectAll("dot")
          .data(data)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 5)
          .attr("cx", function(d) { return x(d.time); })
          .attr("cy", function(d) { return y(d.amount); })
              // tooltip
              .on("mousemove", function(d, i){
                    tooltip
                     .transition()
                     .duration(200)
                     .style("opacity", .9);
                    tooltip
                      .attr("class", "toolTipDischarge")
                      .style("left", d3.event.pageX - 70 + "px")
                      .style("top", d3.event.pageY - 100 + "px")
                      .style("display", "inline-block")
                      .html("Tijd: " + (formatTime(d.time)) + "<br> Volume: " + (d.amount) + " L " + "<br>" + "Leegloop: " + (Math.round((amount_speed[i]/5) * 100) / 100) + " L/min");
                })
              .on("mouseout", function(d){ tooltip.style("display", "none");});

      // Draw the x axis
      dischargeg.append("g")
          .data(data)
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).ticks(d3.timeMinute, 20).tickFormat(d3.timeFormat("%H:%M")));

      // Draw the y axis
      dischargeg.append("g")
          .data(data)
          .attr("class", "y axis")
          .call(d3.axisLeft(y))
        .append("text")
          .attr("fill", "#000")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Leegloop (L)");
    });
}