import React, { Component } from "react";
import * as d3 from "d3";
import "./Child1.css";
class Child1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCompany: "Apple",
      chosenMonth: "November",
    };
  }
  componentDidMount() {
    this.drawChart();
  }
  componentDidUpdate() {
    this.drawChart();
  }
  drawChart = () => {
    const { csv_data } = this.props;
    const { selectedCompany, chosenMonth } = this.state;
    const selectedMonthIndex = new Date(`${chosenMonth} 1`).getMonth();
    const filteredStocks = csv_data.filter(
      (item) =>
        item.Company === selectedCompany &&
        new Date(item.Date).getMonth() === selectedMonthIndex
    );
    d3.select("#stock-chart").selectAll("*").remove();
    if (!filteredStocks.length) return;
    const margin = { top: 30, right: 100, bottom: 50, left: 50 },
      chartWidth = 750 - margin.left - margin.right,
      chartHeight = 400 - margin.top - margin.bottom;
    const svg = d3
      .select("#stock-chart")
      .append("svg")
      .attr("width", chartWidth + margin.left + margin.right)
      .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    const timeScale = d3
      .scaleTime()
      .domain(d3.extent(filteredStocks, (d) => new Date(d.Date)))
      .range([0, chartWidth]);
    const priceScale = d3
      .scaleLinear()
      .domain([
        d3.min(filteredStocks, (d) => Math.min(d.Open, d.Close)),
        d3.max(filteredStocks, (d) => Math.max(d.Open, d.Close)),
      ])
      .range([chartHeight, 0]);
    svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(timeScale).ticks(d3.timeDay.every(2)))
      .selectAll("text")
      .attr("transform", "rotate(40)")
      .style("text-anchor", "start");
    svg.append("g").call(d3.axisLeft(priceScale));
    const createLine = (key) =>
      d3
        .line()
        .x((d) => timeScale(new Date(d.Date)))
        .y((d) => priceScale(d[key]));
    svg
      .append("path")
      .datum(filteredStocks)
      .attr("fill", "none")
      .attr("stroke", "#b2df8a")
      .attr("stroke-width", 2)
      .attr("d", createLine("Open"));
    svg
      .append("path")
      .datum(filteredStocks)
      .attr("fill", "none")
      .attr("stroke", "#e41a1c")
      .attr("stroke-width", 2)
      .attr("d", createLine("Close"));
    svg
      .selectAll(".circle-open")
      .data(filteredStocks)
      .enter()
      .append("circle")
      .attr("class", "circle-open")
      .attr("cx", (d) => timeScale(new Date(d.Date)))
      .attr("cy", (d) => priceScale(d.Open))
      .attr("r", 4);
    svg
      .selectAll(".circle-close")
      .data(filteredStocks)
      .enter()
      .append("circle")
      .attr("class", "circle-close")
      .attr("cx", (d) => timeScale(new Date(d.Date)))
      .attr("cy", (d) => priceScale(d.Close))
      .attr("r", 4);
    const legendData = [
      { label: "Open", color: "#b2df8a" },
      { label: "Close", color: "#e41a1c" },
    ];
    const legend = svg
      .selectAll(".legend")
      .data(legendData)
      .enter()
      .append("g")
      .attr("transform", (_, i) => `translate(${chartWidth + 20},${i * 20})`);
    legend
      .append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", (d) => d.color);
    legend
      .append("text")
      .attr("x", 25)
      .attr("y", 13)
      .text((d) => d.label);
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("visibility", "hidden");
    svg
      .selectAll(".circle-open, .circle-close")
      .on("mouseover", function (event, d) {
        const open = parseFloat(d.Open).toFixed(2);
        const close = parseFloat(d.Close).toFixed(2);
        const difference = (d.Close - d.Open).toFixed(2);
        tooltip
          .html(
            `Date: ${new Date(d.Date).toLocaleDateString()}<br>
            Open: $${open}<br>
            Close: $${close}<br>
            Difference: $${difference}`
          )
          .style("visibility", "visible");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", event.pageY + 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });
  };
  handleCompanySelect = (e) => {
    this.setState({ selectedCompany: e.target.value });
  };
  handleMonthSelect = (e) => {
    this.setState({ chosenMonth: e.target.value });
  };
  render() {
    const companies = ["Apple", "Microsoft", "Amazon", "Google", "Meta"];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return (
      <div className="stock-chart-container">
        <div className="controls">
          <div className="company-controls">
            Company:
            {companies.map((company) => (
              <label key={company}>
                <input
                  type="radio"
                  value={company}
                  checked={this.state.selectedCompany === company}
                  onChange={this.handleCompanySelect}
                />
                {company}
              </label>
            ))}
          </div>
          <div className="month-controls">
            Month:
            <select
              value={this.state.chosenMonth}
              onChange={this.handleMonthSelect}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div id="stock-chart"></div>
      </div>
    );
  }
}
export default Child1;