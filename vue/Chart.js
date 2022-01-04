import {
    axisBottom,
    axisLeft,
    axisRight,
    axisTop,
    curveLinear,
    easeBack,
    easeBounce,
    easeCircle,
    easeCubic,
    easeElastic,
    easeExp,
    easeLinear,
    easePoly,
    easeQuad,
    easeSin,
    event,
    extent,
    line,
    max,
    min,
    scaleLinear,
    scaleTime,
    select,
    sum,
    symbol,
    symbolCircle,
    symbolCross,
    symbolDiamond,
    symbolSquare,
    symbolStar,
    symbolTriangle,
    symbolWye,
    timeFormat
} from 'd3';

const squareDiamondSymbol = {
    draw: function(context, size) {
        const tan30 = Math.sqrt(1 / 3);
        const tan30_2 = tan30 * 2;

        const y = Math.sqrt(size / tan30_2);

        context.moveTo(0, -y);
        context.lineTo(y, 0);
        context.lineTo(0, y);
        context.lineTo(-y, 0);
        context.closePath();
    }
};

/**
 * https://github.com/d3/d3-shape/blob/v1.3.7/README.md#symbol
 */
const symbolTypes = {
    'circle': symbol().type(symbolCircle).size(20),
    'cross': symbol().type(symbolCross).size(20),
    'diamond': symbol().type(symbolDiamond).size(20),
    'squareDiamond': symbol().type(squareDiamondSymbol).size(20),
    'square': symbol().type(symbolSquare).size(20),
    'star': symbol().type(symbolStar).size(20),
    'triangle': symbol().type(symbolTriangle).size(20),
    'wye': symbol().type(symbolWye).size(20)
};

export function drawShadedRegion(config, data, svg) {
    if (!config.shadedRegion.display || !data.length) {
        return;
    }
    const scY = scaleY(config, data);
    const domainMin = scY.domain()[0];
    const domainMax = scY.domain()[1];
    const regionStart = config.shadedRegion.y.start;
    const regionEnd = config.shadedRegion.y.end;

    // shaded area
    select(svg)
        .select('g.shaded-region')
        .append('rect')
        .attr('x', config.margin.left)
        .attr('y', scY(regionEnd > domainMax ? domainMax : regionEnd))
        .attr('height', scY(regionStart < domainMin ? domainMin : regionStart) - scY(regionEnd > domainMax ? domainMax : regionEnd))
        .attr('width', internalWidth(config))
        .style('fill', config.shadedRegion.backgroundColor);

    // borders for shaded area rendered only when within scale
    if (regionEnd <= domainMax) {
        // top bound
        select(svg)
            .select('g.shaded-region-border')
            .append('line')
            .attr('x1', config.margin.left)
            .attr('y1', scY(regionEnd))
            .attr('x2', config.width - config.margin.right)
            .attr('y2', scY(regionEnd));
    }

    if (regionStart >= domainMin) {
        // bottom bound
        select(svg)
            .select('g.shaded-region-border')
            .append('line')
            .attr('x1', config.margin.left)
            .attr('y1', scY(regionStart))
            .attr('x2', config.width - config.margin.right)
            .attr('y2', scY(regionStart));
    }
}

export function drawGridLines(config, data, svg) {
    drawGridLinesX(config, data, svg);
    drawGridLinesY(config, data, svg);
}

export function drawAxes(config, data, svg) {
    drawAxisX(config, data, svg);
    drawAxisY(config, data, svg);
}

export function drawLine(config, data, svg) {
    const x = config.parsing.xAxisKey;
    const y = config.parsing.yAxisKey;

    const scX = scaleX(config, data);
    const scY = scaleY(config, data);

    const lineMakerFn = line()
        .x(d => scX(d[x]))
        .y(d => scY(d[y]))
        .curve(curveLinear);

    const lineGroup = select(svg).select('g.line');

    let linePath = lineGroup
        .select('.line-path');

    if (!linePath.node()) {
        linePath = lineGroup
            .append('path')
            .attr('class', 'line-path');
    }

    linePath
        .attr('fill', 'none')
        .attr('stroke', config.line.color)
        .attr('stroke-width', config.line.width)
        .attr('d', lineMakerFn(data));

    animateLine(config, linePath);
}

export function drawPoints(config, data, svg) {
    if (!config.points.display || !data.length) {
        return;
    }

    const x = config.parsing.xAxisKey;
    const y = config.parsing.yAxisKey;

    const scX = scaleX(config, data);
    const scY = scaleY(config, data);

    const pointGroupsUpdate = select('g.points')
        .selectAll('g')
        .data(data, config.dataKey)
        .attr('transform', function(d) {
            return `translate(${scX(d[x])}, ${scY(d[y])})`;
        });

    const pointGroupsEnter = pointGroupsUpdate
        .enter()
        .append('g')
        .attr('transform', function(d) {
            return `translate(${scX(d[x])}, 0)`;
        })
        .call(enter => animatePointGroupsEnter(config, enter, scX, scY, x, y));

    pointGroupsUpdate
        .exit()
        .call(exit => animatePointGroupsExit(config, exit, scX, scY, x, y));

    const pointsGroup = pointGroupsEnter.merge(pointGroupsUpdate);

    pointsGroup
        .each(function(d, i) {
            const pointPathGroup = select(this);

            let pointPath = pointPathGroup.select('.point-path');

            if (!pointPath.node()) {
                pointPath = pointPathGroup
                    .append('path')
                    .attr('class', 'point-path');
            }

            pointPath
                .attr('d', getPointPathShape)
                .attr('stroke', config.points.borderColor)
                .attr('stroke-width', config.points.borderWidth)
                .attr('fill', config.points.backgroundColor);
        });

    const pointPaths = pointsGroup.selectAll('path.point-path');

    drawPointsTooltip(config, data, svg, pointPaths);

    drawPointsText(config, pointsGroup, pointPaths);

    function getPointPathShape(d, i) {
        const shape = getConfigValue(config.points.shape, d, i);
        const shapeFn = symbolTypes[shape];
        const size = getConfigValue(config.points.size, d, i);
        if (size) {
            shapeFn.size(size);
        }
        return shapeFn();
    }
}

export function drawLegend(config, svg) {
    if (!config.legend.display) {
        return;
    }

    const legendHeight = 10;

    const x = config.margin.left;
    const y = config.height - legendHeight;

    const legend = select(svg)
        .select('g.legend');

    // legend position, bottom-left by default
    legend
        .attr('transform', `translate(${x}, ${y})`);

    const legendGroups = legend
        .selectAll('g')
        .data(config.legend.items)
        .enter()
        .append('g');

    // point shape
    legendGroups
        .filter(d => !!d.point.shape)
        .append('path')
        .attr('d', function(d) {
            const shapeFn = symbolTypes[d.point.shape];
            if (d.point.size) {
                shapeFn.size(d.point.size);
            }
            return shapeFn();
        })
        .attr('fill', d => d.point.backgroundColor)
        .attr('stroke', d => d.point.borderColor)
        .attr('transform', 'translate(0,0)');

    // point image
    legendGroups
        .filter(d => !!d.point.image)
        .append('svg:image')
        .attr('xlink:href', d => d.point.image)
        .attr('width', d => d.point.imageWidth)
        .attr('height', d => d.point.imageHeight)
        .attr('x', d => -(d.point.imageWidth / 2))
        .attr('y', d => -(d.point.imageHeight / 2));

    // point text
    legendGroups
        .filter(d => !!d.point.text)
        .append('text')
        .text(function(d) {
            if (!d.point.text) {
                return '';
            }
            return d.point.text.text;
        })
        .style('font-size', function(d) {
            return d.point.text.fontSize ? d.point.text.fontSize : '6px';
        })
        .attr('fill', d => d.point.backgroundColor)
        .attr('dominant-baseline', 'middle')
        .attr('transform', function(d, i) {
            return `translate(${d.point.text.x ? d.point.text.x : 0}, ${d.point.text.y ? d.point.text.y : 0})`;
        });

    // legend label
    legendGroups
        .append('text')
        .text(d => d.label)
        .attr('transform', 'translate(5)')
        .attr('dominant-baseline', 'middle')
        .style('font-size', config.legend.fontSize)
        .attr('fill', 'var(--gray-3)');

    const labels = config.legend.items.map(i => i.label);

    // spacing b/w legend items
    legendGroups.attr('transform', function(d, i) {
        return 'translate(' + (sum(labels, function(e, j) {
            if (j < i) {
                return legendGroups.nodes()[j].getBBox().width;
            } else {
                return 0;
            }
        }) + (config.legend.padding * i)) + ', 0)';
    });
}

export function drawAnnotation(config, data, svg) {

    const annotations = config.annotation.annotations;

    const annotationPoints = Object.values(annotations)
        // eslint-disable-next-line no-confusing-arrow
        .filter(it => it.hasOwnProperty('display')
            ? it.display
            : true);

    if (annotationPoints.length === 0 || !data.length) {
        return;
    }

    const scX = scaleX(config, data);
    const scY = scaleY(config, data);

    const annotationPointsGroup = select(svg)
        .append('g')
        .classed('annotation-points', true)
        .selectAll('g')
        .data(annotationPoints)
        .enter()
        .append('g')
        .attr('transform', function(d) {
            return 'translate(' + scX(d['xValue']) + ',' + scY(d['yValue']) + ')';
        });

    // render shapes
    annotationPointsGroup
        .filter(d => d.hasOwnProperty('shape'))
        .append('path')
        .attr('d', function(d, i) {
            const shapeFn = symbolTypes[d.shape];
            if (d.size) {
                shapeFn.size(d.size);
            }
            return shapeFn();
        })
        .attr('stroke', d => d.borderColor)
        .attr('fill', d => d.backgroundColor);

    // render images
    annotationPointsGroup
        .filter(d => d.hasOwnProperty('image'))
        .append('svg:image')
        .attr('xlink:href', d => d.image)
        .attr('width', d => d.imageWidth)
        .attr('height', d => d.imageHeight)
        .attr('x', d => -(d.imageWidth / 2))
        .attr('y', d => -(d.imageHeight / 2));
}

export function clearChart(config, data, svg) {
    select(svg)
        .selectAll('g > *')
        .remove();
}

export function debugChart(config, data, svg) {

    // DOM to SVG coordinate translation
    function domToSvg(event) {

        const pt = svg.createSVGPoint();

        // pass event coordinates
        pt.x = event.clientX;
        pt.y = event.clientY;

        // transform to SVG coordinates
        return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    const tooltipDiv = select('div.debug-chart-tooltip').node()
        ? select('div.debug-chart-tooltip')
        : (
            select('body')
                .append('div')
                .attr('class', 'debug-chart-tooltip top')
                .style('position', 'absolute')
                .style('overflow', 'warp')
                .style('text-align', 'center')
                .style('width', 'auto')
                .style('height', 'auto')
                .style('padding', '8px')
                .style('background-color', '#4E4E4E')
                .style('color', '#FFFFFF')
                .style('pointer-events', 'none')
                .style('opacity', 0)
        );

    select(svg)
        .attr('style', 'border:1px solid black')
        .on('mousemove', function() {
            // console.log(event); // log the mouse x,y position
            tooltipDiv
                .html(domToSvg(event).x + ', ' + domToSvg(event).y)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px')
                .style('opacity', 0.9);
        })
        .on('mouseout', function() {
            tooltipDiv
                .style('opacity', 0);
        });
}

function accessorX(config) {
    const x = config.parsing.xAxisKey;
    return function(d, i) {
        return d[x];
    };
}

function accessorY(config) {
    const y = config.parsing.yAxisKey;
    return function(d, i) {
        return d[y];
    };
}

function domainX(config, data) {
    const xMin = config.scales.x.min;
    const xMax = config.scales.x.max;
    if (xMin || xMax) {
        return [
            xMin ? xMin : min(data, accessorX(config)),
            xMax ? xMax : max(data, accessorX(config))
        ];
    } else {
        const xSuggestedMin = config.scales.x.suggestedMin;
        const xSuggestedMax = config.scales.x.suggestedMax;
        if (xSuggestedMin || xSuggestedMax) {
            const calculatedMin = min(data, accessorX(config));
            const calculatedMax = max(data, accessorX(config));
            return [
                xSuggestedMin ? Math.min(calculatedMin, xSuggestedMin) : calculatedMin,
                xSuggestedMax ? Math.max(calculatedMax, xSuggestedMax) : calculatedMax
            ];
        }
    }
    return extent(data, accessorX(config));
}

function domainY(config, data) {
    const yMin = config.scales.y.min;
    const yMax = config.scales.y.max;
    if (yMin || yMax) {
        return [
            yMin ? yMin : min(data, accessorY(config)),
            yMax ? yMax : max(data, accessorY(config))
        ];
    } else {
        const ySuggestedMin = config.scales.y.suggestedMin;
        const ySuggestedMax = config.scales.y.suggestedMax;
        if (ySuggestedMin || ySuggestedMax) {
            const calculatedMin = min(data, accessorY(config));
            const calculatedMax = max(data, accessorY(config));
            return [
                ySuggestedMin ? Math.min(calculatedMin, ySuggestedMin) : calculatedMin,
                ySuggestedMax ? Math.max(calculatedMax, ySuggestedMax) : calculatedMax
            ];
        }
    }
    return extent(data, accessorY(config));
}

function rangeX(config) {
    return [config.margin.left, config.width - config.margin.right];
}

function rangeY(config) {
    return [config.height - config.margin.bottom, config.margin.top];
}

function scaleX(config, data) {
    const scale = scaleTime()
        .domain(domainX(config, data))
        .range(rangeX(config));
    return config.scales.x.nice ? scale.nice() : scale;
}

function scaleY(config, data) {
    const scale = scaleLinear()
        .domain(domainY(config, data))
        .range(rangeY(config));
    return config.scales.y.nice ? scale.nice() : scale;
}

function drawGridLinesX(config, data, svg) {
    if (!config.scales.x.grid.display || !data.length) {
        return;
    }

    const scY = scaleY(config, data);

    const xgridlines = axisLeft(scY)
        .tickFormat('')
        .tickSize(-(internalWidth(config)));

    select(svg)
        .select('g.x-grid')
        .style('stroke-width', '0.2')
        .style('color', 'var(--gray-4)')
        .attr('transform', `translate(${config.margin.left}, 0)`)
        .call(xgridlines);

    select('g.x-grid path')
        .remove();
}

function drawGridLinesY(config, data, svg) {
    if (!config.scales.y.grid.display || !data.length) {
        return;
    }

    const scX = scaleX(config, data);

    const ygridlines = axisTop(scX)
        .tickFormat('')
        .tickSize(-(config.height - config.margin.bottom - config.margin.top));

    select(svg)
        .select('g.y-grid')
        .style('stroke-width', '0.2')
        .style('color', 'var(--gray-4)')
        .attr('transform', `translate(0, ${config.margin.top})`)
        .call(ygridlines);

    select('g.y-grid path')
        .remove();
}

function drawAxisX(config, data, svg) {

    if (!config.scales.x.display) {
        return;
    }

    const scX = scaleX(config, data);
    let xAxisGenerator = axisBottom(scX)
        .tickSize(config.scales.x.ticks.size)
        .tickPadding(config.scales.x.ticks.padding)
        .ticks(config.scales.x.ticks.count);

    const tickSizeInner = config.scales.x.ticks.innerSize;
    if (tickSizeInner !== undefined && tickSizeInner !== null) {
        xAxisGenerator = xAxisGenerator.tickSizeInner(tickSizeInner);
    }

    if (config.scales.x.ticks.tickFormat) {
        xAxisGenerator = xAxisGenerator.tickFormat(timeFormat(config.scales.x.ticks.tickFormat));
    }

    let xAxis = select(svg)
        .select('g.x-axis')
        .attr('transform', `translate(0, ${config.height - config.margin.bottom})`)
        .style('color', config.scales.x.ticks.color)
        .style('stroke-width', config.scales.x.ticks.font.weight)
        .style('font-size', config.scales.x.ticks.font.size)
        .call(xAxisGenerator);

    if (config.scales.x.ticks.hideAxisLine) {
        xAxis = xAxis.call(g => g.select('.domain').remove());
    }

    if (!!config.scales.x.title.display) {

        const tickSize = config.scales.x.ticks.size;
        const titleOffset = config.scales.x.ticks.padding + (tickSize > 0 ? tickSize : 0);

        const titleX = config.width / 2;
        const titleY = config.margin.bottom - titleOffset;

        xAxis
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(${titleX}, ${titleY})`)
            .attr('fill', config.scales.x.title.color)
            .text(config.scales.x.title.text);
    }

}

function drawAxisY(config, data, svg) {

    if (!config.scales.y.display) {
        return;
    }

    const scY = scaleY(config, data);
    const yAxisGenerator = (config.scales.y.position === 'right' ? axisRight(scY) : axisLeft(scY))
        .tickSize(config.scales.y.ticks.size)
        .tickPadding(config.scales.y.ticks.padding)
        .ticks(config.scales.y.ticks.count);

    let yAxis = select(svg).select('g.y-axis');
    yAxis = config.scales.y.position === 'right'
        ? yAxis.attr('transform', `translate(${config.width - config.margin.right}, 0)`)
        : yAxis.attr('transform', `translate(${config.margin.left}, 0)`);

    yAxis = yAxis.style('color', config.scales.y.ticks.color)
        .style('stroke-width', config.scales.y.ticks.font.weight)
        .style('font-size', config.scales.y.ticks.font.size)
        .call(yAxisGenerator);

    if (!!config.scales.y.title.display) {

        const tickSize = config.scales.y.ticks.size;
        const titleOffset = config.scales.y.ticks.padding + (tickSize > 0 ? tickSize : 0);

        const titleX = config.margin.left - titleOffset;
        const titleY = (config.height) / 2;

        yAxis
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', `translate(${-titleX}, ${titleY}) rotate(-90)`)
            .attr('fill', config.scales.y.title.color)
            .text(config.scales.y.title.text);
    }
}

function internalWidth(config) {
    return config.width - config.margin.right - config.margin.left;
}

function drawPointsText(config, pointGroups, pointPaths) {
    if (!config.points.labels.display) {
        return;
    }

    if (!!config.points.labels.image) {

        pointGroups
            .each(function(d, i) {

                const pointImageGroup = select(this);

                let pointImage = pointImageGroup.select('.point-label-image');

                if (!pointImage.node()) {
                    pointImage = pointImageGroup
                        .append('svg:image')
                        .attr('class', 'point-label-image');
                }
                pointImage
                    .attr('xlink:href', config.points.labels.image)
                    .attr('width', config.points.labels.imageWidth)
                    .attr('height', config.points.labels.imageHeight)
                    .attr('x', config.points.labels.x)
                    .attr('y', config.points.labels.y);
            });

        const pointImages = pointGroups
            .selectAll('.point-label-image');

        // Automatically apply x and y, if x and y are not explicity provided.
        pointImages
            .attr('x', (d, i) => {
                // center node on the point horizontally
                const node = pointImages.nodes()[i];
                const attrX = node.getAttribute('x');
                return (!!attrX)
                    ? attrX
                    : -(node.getBBox().width / 2);
            })
            .attr('y', (d, i) => {
                // position node vertically just above the point
                const node = pointImages.nodes()[i];
                const attrY = node.getAttribute('y');
                return (!!attrY)
                    ? attrY
                    : -(node.getBBox().height + pointPaths.nodes()[i].getBBox().height);
            });
    }

    if (!!config.points.labels.text) {

        pointGroups
            .each(function(d, i) {

                const pointLabelGroup = select(this);

                let pointLabel = pointLabelGroup.select('.point-label-text');

                if (!pointLabel.node()) {
                    pointLabel = pointLabelGroup
                        // At this point a 'path' element denoting the point should exist.
                        .insert('text', 'path')
                        .attr('class', 'point-label-text');
                }
                pointLabel
                    .text(config.points.labels.text)
                    .attr('x', config.points.labels.x)
                    .attr('y', config.points.labels.y)
                    .attr('fill', config.points.labels.color)
                    .attr('font-size', config.points.labels.fontSize);
            });

        const pointLabels = pointGroups
            .selectAll('text.point-label-text');

        // Apply x and y offsets (dx & dy) automatically if x and y are not explicity provided.
        pointLabels
            .each(function(d, i) {
                select(this)
                    .attr('dx', (d, i) => {
                        // center node on the point horizontally
                        const node = pointLabels.nodes()[i];
                        const attrX = node.getAttribute('x');
                        return (!!attrX)
                            ? undefined
                            : -(node.getBBox().width / 2);
                    })
                    .attr('dy', (d, i) => {
                        // position node vertically just above the point
                        const node = pointLabels.nodes()[i];
                        const attrY = node.getAttribute('y');
                        return (!!attrY)
                            ? undefined
                            : -(pointPaths.nodes()[i].getBBox().height);
                    });
            });
    }
}

function drawPointsTooltip(config, data, svg, pointPaths) {

    if (!config.points.tooltip.display) {
        return;
    }

    const tooltipDiv = select('div.chart-tooltip').node()
        ? select('div.chart-tooltip')
        : (
            select('body')
                .append('div')
                .attr('class', 'chart-tooltip top')
                .style('position', 'absolute')
                .style('text-align', config.points.tooltip.textAlign)
                .style('width', config.points.tooltip.width)
                .style('height', config.points.tooltip.height)
                .style('padding', config.points.tooltip.padding)
                .style('background-color', config.points.tooltip.backgroundColor)
                .style('color', config.points.tooltip.color)
                .style('border-width', config.points.tooltip.borderWidth)
                .style('border-color', config.points.tooltip.borderColor)
                .style('border-radius', config.points.tooltip.borderRadius)
                .style('pointer-events', config.points.tooltip.pointerEvents)
                .style('opacity', 0)
        );

    function doHighlightPoint(d, i) {
        select(svg)
            .select('#pointHighlight')
            .selectAll('stop').each(function(e, j) {
            if (j === 0) {
                select(this)
                    .attr('stop-color', config.points.backgroundColor(d, i));
            } else {
                select(this)
                    .attr('stop-color', config.points.borderColor(d, i));
            }
        });

        const path = select(this);
        path
            .style('stroke', 'url(#pointHighlight)')
            .style('stroke-width', 5);
    }

    function showTooltip(d, i) {
        tooltipDiv.transition()
            .duration(200)
            .style('opacity', 0.9);

        tooltipDiv.html(config.points.tooltip.callback(d, i));

        const tooltipBox = tooltipDiv.node().getBoundingClientRect();
        const pointPathBox = this.getBoundingClientRect();
        const dy = config.points.tooltip.offset; // render tooltip at relative distance from point.
        tooltipDiv
            .style('left', ((pointPathBox.left + (pointPathBox.width / 2)) - (tooltipBox.width / 2)) + 'px')
            .style('top', (window.scrollY + pointPathBox.top - (tooltipBox.height + pointPathBox.height) - dy) + 'px');
    }

    function hideTooltip() {
        tooltipDiv.transition()
            .duration(900)
            .style('opacity', 0);
    }

    function undoHighlightPoint() {
        const path = select(this);
        path
            .style('stroke', config.points.borderColor)
            .style('stroke-width', config.points.borderWidth);
    }

    pointPaths
        .on('mouseover', function(d, i) {
            showTooltip.call(this, d, i);
            doHighlightPoint.call(this, d, i);
        })
        .on('mouseout', function(d, i) {
            hideTooltip();
            undoHighlightPoint.call(this);
        });
}

function animateLine(config, linePath) {

    const animation = resolveAnimationConfig(config.line.animation);

    if (!animation.enabled) {
        return;
    }
    // Line grow animation
    const totalLength = linePath.node().getTotalLength();

    linePath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(animation.duration)
        .delay(animation.delay)
        .ease(resolveEase(animation.ease))
        .attr('stroke-dashoffset', 0);
}

function animatePointGroupsEnter(config, enter, scX, scY, x, y) {
    const animation = resolveAnimationConfig(config.points.animation);

    if (animation.enabled) {
        enter
            .transition()
            .duration(animation.duration)
            .delay(animation.delay)
            .ease(resolveEase(animation.ease))
            .attr('transform', function(d) {
                return `translate(${scX(d[x])}, ${scY(d[y])})`;
            });
    } else {
        enter
            .attr('transform', function(d) {
                return `translate(${scX(d[x])}, ${scY(d[y])})`;
            });
    }
}

function animatePointGroupsExit(config, exit, scX, scY, x, y) {
    const animation = resolveAnimationConfig(config.points.animation);
    if (animation.enabled) {
        exit
            .transition()
            .duration(animation.duration)
            .delay(animation.delay)
            .ease(resolveEase(animation.ease))
            .attr('transform', function(d) {
                const currentTranslateString = select(this).attr('transform');
                const currentTranslate = currentTranslateString
                    .substring(currentTranslateString.indexOf('(') + 1, currentTranslateString.indexOf(')'))
                    .split(',');

                return `translate(${currentTranslate[0]}, ${config.height})`;
            })
            .remove();
    } else {

        exit.remove();
    }
}

function getConfigValue(valOrFn, d, i) {
    if (!valOrFn) {
        return valOrFn;
    }

    return typeof valOrFn === 'function' ? valOrFn(d, i) : valOrFn;
}

function resolveAnimationConfig(animationConfig) {
    const resolvedConfig = animationConfigDefaults();
    if (!animationConfig) {
        resolvedConfig.enabled = false;
        return resolvedConfig;
    }
    if (typeof animationConfig === 'boolean') {
        resolvedConfig.enabled = animationConfig;
    }
    if (typeof animationConfig === 'object') {
        Object.assign(resolvedConfig, animationConfig);
    }
    return resolvedConfig;
}

function animationConfigDefaults() {
    return {
        enabled: true,
        duration: 1000,
        easing: 'easeLinear',
        delay: null
    };
}

function resolveEase(easeStr) {
    switch (easeStr) {
        case 'easeElastic':
            return easeElastic;
        case 'easeBounce':
            return easeBounce;
        case 'easeLinear':
            return easeLinear;
        case 'easeSin':
            return easeSin;
        case 'easeQuad':
            return easeQuad;
        case 'easeCubic':
            return easeCubic;
        case 'easePoly':
            return easePoly;
        case 'easeCircle':
            return easeCircle;
        case 'easeExp':
            return easeExp;
        case 'easeBack':
            return easeBack;
        default:
            return easeLinear;
    }
}