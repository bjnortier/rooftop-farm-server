'use strict';

const d3 = require('d3');
const View = require('trip.dom').View;

class GraphView extends View {

  constructor(model, scene, options) {
    super(model, scene, View.mergeOptions(options, {class: 'graph'}));
    this.sensorId = options.sensorId;
  }

  render() {
    super.render();
    let data = this.model[this.sensorId];

    let margin = {top: 40, right: 20, bottom: 30, left: 40};
    let w = 800 - margin.left - margin.right;
    let h = 250 - margin.top - margin.bottom;

    let greenMin = 0.3;
    let greenMax = 0.35;
    let orangeMin = 0.25;
    let orangeMax = 0.40;

    let svg = d3.select(this.$el[0]).append('svg')
        .attr('width', w + margin.left + margin.right)
        .attr('height', h + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var xScale = d3.time.scale()
      .range([0, w]);

    var yScale = d3.scale.linear()
      .range([h, 0]);

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom');

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left');

    xScale.domain(d3.extent(data, function(d) { return d.timestamp; }));
    yScale.domain(d3.extent(data, function(d) { return d.value; }));

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + h + ')')
      .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('moisture');

    let line = d3.svg.line()
      .x((d) => {
        return xScale(d.timestamp);
      })
      .y((d) => {
        return yScale(d.value);
      });

    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line);

    function toHoriontalDatum(value) {
      return [
        {
          timestamp: data[0].timestamp,
          value: value,
        },
        {
          timestamp: data[data.length - 1].timestamp,
          value: value,
        }
      ];
    }

    svg.append('path')
      .datum(toHoriontalDatum(greenMin))
      .attr('class', 'green-bounds')
      .attr('d', line);

    svg.append('path')
      .datum(toHoriontalDatum(greenMax))
      .attr('class', 'green-bounds')
      .attr('d', line);

    svg.append('path')
      .datum(toHoriontalDatum(orangeMin))
      .attr('class', 'orange-bounds')
      .attr('d', line);

    svg.append('path')
      .datum(toHoriontalDatum(orangeMax))
      .attr('class', 'orange-bounds')
      .attr('d', line);


    let circles = svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle');

    circles
      .attr('class', 'measurement')
      .attr('cx', (d) => {
        return xScale(d.timestamp);
      })
      .attr('cy', (d) => {
        return yScale(d.value);
      })
      .classed('green-band', function (d) {
        return ((d.value >= greenMin) && (d.value <= greenMax));
      })
      .classed('orange-band', function (d) {
        return (((d.value >= orangeMin) && (d.value < greenMin)) ||
                ((d.value > greenMax) && (d.value <= orangeMax)));
      })
      .classed('red-band', function (d) {
        return ((d.value < orangeMin) || (d.value > orangeMax));
      })
      .attr('r', 2);
  }

}

module.exports = GraphView;
