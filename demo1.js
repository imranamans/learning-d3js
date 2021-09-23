
let data = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 5, y: 2 },
    { x: 6, y: 2 },
    { x: 7, y: 1 },
];

let scX = d3.scaleLinear().domain([0, 7]).range([1, 550]);
let scY = d3.scaleLinear().domain([0, 7]).range([1, 250]);

function makeDemo1() {
    d3.select('svg')
        .append('g')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('cx', d => scX(d['x']))
        .attr('cy', d => scY(d['y']));

    let lnMkr = d3.line()
        .curve(d3.curveNatural)
        .x(d => scX(d['x']))
        .y(d => scY(d['y']));

    d3.select('svg')
        .append('g')
        .append('path')
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('d', lnMkr(data));
}