// @ts-check

import Component from '@glimmer/component';
import d3 from 'd3';
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class EventsGraphComponent extends Component {
  @tracked
  height = 400;

  @tracked
  width = 400;
  margin = { top: 0, right: 0, bottom: 30, left: 0 };

  @tracked
  graphElement = null;

  @tracked
  xAxisElement = null;

  @tracked
  graph = null;

  // // TODO: TEMP
  // @tracked
  // data = [
  //   { name: 'E', value: 0.12702 },
  //   { name: 'T', value: 0.09056 },
  //   { name: 'A', value: 0.08167 },
  //   { name: 'O', value: 0.07507 },
  //   { name: 'I', value: 0.06966 },
  //   { name: 'N', value: 0.06749 },
  //   { name: 'S', value: 0.06327 },
  //   { name: 'H', value: 0.06094 },
  //   { name: 'R', value: 0.05987 },
  //   { name: 'D', value: 0.04253 },
  //   { name: 'L', value: 0.04025 },
  //   { name: 'C', value: 0.02782 },
  //   { name: 'U', value: 0.02758 },
  //   { name: 'M', value: 0.02406 },
  //   { name: 'W', value: 0.0236 },
  //   { name: 'F', value: 0.02288 },
  //   { name: 'G', value: 0.02015 },
  //   { name: 'Y', value: 0.01974 },
  //   { name: 'P', value: 0.01929 },
  //   { name: 'B', value: 0.01492 },
  //   { name: 'V', value: 0.00978 },
  //   { name: 'K', value: 0.00772 },
  //   { name: 'J', value: 0.00153 },
  //   { name: 'X', value: 0.0015 },
  //   { name: 'Q', value: 0.00095 },
  //   { name: 'Z', value: 0.00074 },
  // ];

  get data() {
    return this.args.data;
  }

  get xBand() {
    let scale = d3
      .scaleBand()
      .domain(this.data.map((d) => d.Index))
      .range([this.margin.left, this.width - this.margin.right])
      .padding(0.75);

    if (this.zoomTransform) {
      scale.range(
        [this.margin.left, this.width - this.margin.right].map((d) =>
          this.zoomTransform.applyX(d)
        )
      );
    }
    return scale;
  }

  multiply(n) {
    return n * 50;
  }

  get yBand() {
    return d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.value)])
      .nice()
      .range([this.height - this.margin.bottom, this.margin.top]);
  }

  @action
  initializeGraph(el) {
    this.graphElement = el;
    this.height = el.clientHeight;
    this.width = el.clientWidth;

    window.d3 = d3; // TODO: temp

    this.graph = d3.select(el).call(this.zoom);

    this.transformXAxis();
  }

  @action
  onResize() {
    this.width = this.graphElement.clientWidth;
    this.height = this.graphElement.clientHeight;
    this.transformXAxis();
  }

  @action
  initializeXAxis(el) {
    this.xAxisElement = el;
  }

  @action
  transformXAxis() {
    const axis = d3.select(this.xAxisElement);
    axis
      .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.xBand).tickSizeOuter(0));
  }

  @action
  zoom(svg) {
    const { margin, width, height } = this;
    const extent = [
      [margin.left, margin.top],
      [width - margin.right, height - margin.top],
    ];

    svg.call(
      d3
        .zoom()
        .scaleExtent([1, 8])
        .translateExtent(extent)
        .extent(extent)
        .on('zoom', this.refitDataToZoom)
    );
  }

  @tracked zoomTransform;

  @action
  refitDataToZoom(event) {
    this.zoomTransform = event.transform;
    this.graph.selectAll('.x-axis').call(this.transformXAxis);
  }
}