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
    transition
} from 'd3';
import {get, merge, omit, pick} from 'lodash';

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

export function clearChart(config, data, parentElement) {
    select(parentElement)
        .selectAll('g > *')
        .remove();
}

/**
 * Config resolution strategy: the config closest to data wins.
 * @param config
 * @param data
 */
export function resolveConfig(config, data) {

    for (let i = 0; i < data.datasets.length; i++) {

        data.datasets[i] = merge({},
            omit(config, ['shadedRegion', 'annotation', 'legend']),
            datasetConfigDefaults('Dataset' + (i + 1)),
            data.datasets[i]
        );

        if (!data.datasets[i].id) {
            data.datasets[i].id = 'dataset' + i;
        }
    }
}

export function makeScales(data) {

    function groupByScale(data) {

        const domainDataByScale = {/* scaleId (eg. x): { data: [x1, x2, x3], config: {} } */};

        function domainDataByScaleTemplate() {
            return {data: [], config: {scales: {}, margin: {}}, scale: null};
        }

        const propsToCopy = ['margin', 'width', 'height'];

        for (const dataset of data.datasets) {
            // x
            domainDataByScale[dataset.xAxisID] = (domainDataByScale[dataset.xAxisID] || domainDataByScaleTemplate());
            domainDataByScale[dataset.xAxisID].data = domainDataByScale[dataset.xAxisID].data.concat(
                dataset.data.map((d) => (d[dataset.parsing.xAxisKey]))
            );
            // The latter config with the same scaleId will override the former.
            domainDataByScale[dataset.xAxisID].config.scales[dataset.xAxisID] = dataset.scales[dataset.xAxisID];
            Object.assign(domainDataByScale[dataset.xAxisID].config, pick(dataset, propsToCopy));
            // y
            domainDataByScale[dataset.yAxisID] = (domainDataByScale[dataset.yAxisID] || domainDataByScaleTemplate());
            domainDataByScale[dataset.yAxisID].data = domainDataByScale[dataset.yAxisID].data.concat(
                dataset.data.map((d) => (d[dataset.parsing.yAxisKey]))
            );
            domainDataByScale[dataset.yAxisID].config.scales[dataset.yAxisID] = dataset.scales[dataset.yAxisID];
            Object.assign(domainDataByScale[dataset.yAxisID].config, pick(dataset, propsToCopy));
        }

        return domainDataByScale;
    }

    const groupedByScale = groupByScale(data);

    for (const [scaleId, value] of Object.entries(groupedByScale)) {
        value.scale = makeScale(value.config, value.data, scaleId, (d) => (d));
    }

    return groupedByScale;
}

export function makeScale(config, data = [], scaleId, accessor = getAccessor(config, scaleId)) {
    const scaleConfig = config.scales[scaleId];
    const scale = getScaleByType(scaleConfig.type)
        .domain(getDomain(config, data, scaleId, accessor))
        .range(getRange(config, scaleId));
    return scaleConfig.nice ? scale.nice() : scale;
}

export function drawShadedRegion(config, data, parentElement, scX, scY = makeScale(config, data, 'y')) {

    if (!get(config, 'shadedRegion.display', false) || !data.length) {
        return;
    }

    const domainMin = scY.domain()[0];
    const domainMax = scY.domain()[1];
    const regionStart = config.shadedRegion.y.start;
    const regionEnd = config.shadedRegion.y.end;

    let shadedArea = select(parentElement)
        .select('g.shaded-region')
        .select('.shaded-area');

    if (!shadedArea.node()) {
        shadedArea = select(parentElement)
            .select('g.shaded-region')
            .append('rect')
            .attr('class', 'shaded-area');
    }

    // shaded area
    shadedArea
        .attr('x', config.margin.left)
        .attr('y', scY(regionEnd > domainMax ? domainMax : regionEnd))
        .attr('height', scY(regionStart < domainMin ? domainMin : regionStart) - scY(regionEnd > domainMax ? domainMax : regionEnd))
        .attr('width', getInternalWidth(config))
        .style('fill', config.shadedRegion.backgroundColor);

    // borders for shaded area rendered only when within scale
    if (regionEnd <= domainMax) {
        // top bound
        let borderTop = select(parentElement)
            .select('g.shaded-region-border')
            .select('.shaded-region-border-top');

        if (!borderTop.node()) {

            borderTop = select(parentElement)
                .select('g.shaded-region-border')
                .append('line')
                .attr('class', 'shaded-region-border-top');
        }

        borderTop
            .attr('x1', config.margin.left)
            .attr('y1', scY(regionEnd))
            .attr('x2', config.width - config.margin.right)
            .attr('y2', scY(regionEnd));
    }

    if (regionStart >= domainMin) {
        // bottom bound
        let borderBottom = select(parentElement)
            .select('g.shaded-region-border')
            .select('.shaded-region-border-bottom');

        if (!borderBottom.node()) {
            borderBottom = select(parentElement)
                .select('g.shaded-region-border')
                .append('line')
                .attr('class', 'shaded-region-border-bottom');
        }

        borderBottom
            .attr('x1', config.margin.left)
            .attr('y1', scY(regionStart))
            .attr('x2', config.width - config.margin.right)
            .attr('y2', scY(regionStart));
    }
}

export function drawGrids(config, data, parentElement) {
    drawGrid(config, data, parentElement, 'x');
    drawGrid(config, data, parentElement, 'y');
}

export function drawAxes(config, data, parentElement) {
    drawAxis(config, data, parentElement, 'x');
    drawAxis(config, data, parentElement, 'y');
}

export function drawLine(
    config,
    data,
    parentElement,
    datasetId = 'dataset0',
    xScaleId = 'x',
    yScaleId = 'y',
    scX = makeScale(config, data, xScaleId),
    scY = makeScale(config, data, yScaleId)
) {

    if (!get(config, 'line.display', false)) {
        return;
    }

    const xAxisKey = getAxisKey(config, xScaleId);
    const yAxisKey = getAxisKey(config, yScaleId);

    const lineMakerFn = line()
        .x(d => scX(d[xAxisKey]))
        .y(d => scY(d[yAxisKey]))
        .curve(curveLinear);

    const lineGroup = getElementSelection(parentElement, 'g', ['line', datasetId]);

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
        .attr('stroke-width', config.line.width);

    animateLine(config, data, linePath, lineMakerFn);
}

export function drawPoints(
    config,
    data,
    parentElement,
    datasetId = 'dataset0',
    xScaleId = 'x',
    yScaleId = 'y',
    scX = makeScale(config, data, xScaleId),
    scY = makeScale(config, data, yScaleId)
) {

    if (!get(config, 'points.display', false) || !data.length) {
        return;
    }

    const xAxisKey = getAxisKey(config, xScaleId);
    const yAxisKey = getAxisKey(config, yScaleId);

    const pointGroupSelector = getElementSelection(parentElement, 'g', ['points', datasetId]);

    const pointGroupsUpdate = pointGroupSelector
        .selectAll('g')
        .data(data, config.dataKey)
        .attr('transform', function(d) {
            return `translate(${scX(d[xAxisKey])}, ${scY(d[yAxisKey])})`;
        });

    const pointGroupsEnter = pointGroupsUpdate
        .enter()
        .append('g')
        .attr('transform', function(d) {
            return `translate(${scX(d[xAxisKey])}, 0)`;
        })
        .call(enter => animatePointGroupsEnter(config, enter, scX, scY, xAxisKey, yAxisKey));

    pointGroupsUpdate
        .exit()
        .call(exit => animatePointGroupsExit(config, exit, scX, scY, xAxisKey, yAxisKey));

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

    drawPointsTooltip(config, data, parentElement, pointPaths);

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

export function drawLegend(config, parentElement) {

    if (!get(config, 'legend.display', false)) {
        return;
    }

    const legendHeight = 10;

    const x = config.margin.left;
    const y = config.height - legendHeight;

    const legend = getElementSelection(parentElement, 'g', 'legend');

    // legend position, bottom-left by default
    legend
        .attr('transform', `translate(${x}, ${y})`);

    const legendGroups = legend
        .selectAll('g.legend-item')
        .data(config.legend.items)
        .join('g')
        .attr('class', 'legend-item');

    // point shape
    legendGroups
        .filter(d => !!d.point.shape)
        .each(function(d, i) {
            let legendItemShape = select(this)
                .select('path.legend-item-shape');
            if (!legendItemShape.node()) {
                legendItemShape = select(this)
                    .append('path')
                    .attr('class', 'legend-item-shape');
            }
            legendItemShape
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
        });

    // point image
    legendGroups
        .filter(d => !!d.point.image)
        .each(function(d, i) {
            let legendItemImage = select(this)
                .select('.legend-item-image');
            if (!legendItemImage.node()) {
                legendItemImage = select(this)
                    .append('svg:image')
                    .attr('class', 'legend-item-image');
            }
            legendItemImage
                .attr('xlink:href', d => d.point.image)
                .attr('width', d => d.point.imageWidth)
                .attr('height', d => d.point.imageHeight)
                .attr('x', d => -(d.point.imageWidth / 2))
                .attr('y', d => -(d.point.imageHeight / 2));
        });

    // point text
    legendGroups
        .filter(d => !!d.point.text)
        .each(function(d, i) {
            let legendItemText = select(this)
                .select('text.legend-item-text');
            if (!legendItemText.node()) {
                legendItemText = select(this)
                    .append('text')
                    .attr('class', 'legend-item-text');
            }
            legendItemText
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
        });

    // legend label
    legendGroups
        .each(function(d, i) {
            let legendItemLabel = select(this)
                .select('text.legend-item-label');
            if (!legendItemLabel.node()) {
                legendItemLabel = select(this)
                    .append('text')
                    .attr('class', 'legend-item-label');
            }
            legendItemLabel
                .text(d => d.label)
                .attr('transform', 'translate(5)')
                .attr('dominant-baseline', 'middle')
                .style('font-size', config.legend.fontSize)
                .attr('fill', 'var(--gray-3)');
        });

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

export function drawAxis(config, data, parentElement, scaleId, scale = makeScale(config, data, scaleId)) {

    const scaleConfig = config.scales[scaleId];

    if (!scaleConfig.display) {
        return;
    }

    const tickSize = Number.isSafeInteger(scaleConfig.ticks.size) ? scaleConfig.ticks.size : 0;

    const axisGenerator = (getAxis(config, scaleId)(scale))
        .ticks(scaleConfig.type === 'time' && scaleConfig.ticks.timeInterval
            ? scaleConfig.ticks.timeInterval
            : scaleConfig.ticks.count)
        .tickFormat(scaleConfig.ticks.tickFormat)
        .tickSize(tickSize)
        .tickSizeInner(Number.isSafeInteger(scaleConfig.ticks.innerSize) ? scaleConfig.ticks.innerSize : tickSize)
        .tickSizeOuter(Number.isSafeInteger(scaleConfig.ticks.outerSize) ? scaleConfig.ticks.outerSize : tickSize)
        .tickPadding(Number.isSafeInteger(scaleConfig.ticks.padding) ? scaleConfig.ticks.padding : 0);

    let axis = getElementSelection(parentElement, 'g', `${scaleId}-axis`);

    axis
        .attr('transform', getAxisTransform(config, scaleId))
        .style('color', scaleConfig.ticks.color)
        .style('stroke-width', scaleConfig.ticks.font.weight)
        .style('font-size', scaleConfig.ticks.font.size);

    if (scaleConfig.animate) {
        const t = transition()
            .duration(500);
        axis = axis.transition(t);
    }
    axis.call(axisGenerator);

    if (scaleConfig.ticks.hideAxisLine) {
        axis = axis.call(g => g.select('.domain').remove());
    }

    if (!!scaleConfig.title.display) {
        axis
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('transform', getAxisTitleTransform(config, scaleId))
            .attr('fill', scaleConfig.title.color)
            .text(scaleConfig.title.text);
    }
}

export function drawGrid(config, data, parentElement, scaleId, scale = makeScale(config, data, scaleId)) {

    const scaleConfig = config.scales[scaleId];

    if (!scaleConfig.grid.display || !data.length) {
        return;
    }

    const axisGenerator = (getAxis(config, scaleId)(scale))
        .tickFormat('')
        .tickSize(-(getGridLength(config, scaleId)));

    const axis = getElementSelection(parentElement, 'g', `${scaleId}-grid`)
        .style('stroke-width', scaleConfig.grid.width)
        .style('color', scaleConfig.grid.color)
        .attr('transform', getAxisTransform(config, scaleId))
        .call(axisGenerator);

    if (!scaleConfig.grid.drawBorder) {
        axis
            .call(g => g.select('.domain').remove());
    }
}

export function drawAnnotation(
    config,
    data,
    parentElement,
    xScaleId = 'x',
    yScaleId = 'y',
    scX = makeScale(config, data, xScaleId),
    scY = makeScale(config, data, yScaleId)
) {

    const annotationsConfig = get(config, 'annotation.annotations', {});

    resolveAnnotationsConfig(annotationsConfig);

    const effectiveAnnotationsConfig = [];

    for (const [, annotationConfigValue] of Object.entries(annotationsConfig)) {
        effectiveAnnotationsConfig.push(annotationConfigValue);
    }

    drawAnnotationRect(effectiveAnnotationsConfig, config, data, parentElement, xScaleId, yScaleId, scX, scY);

    drawAnnotationLines(effectiveAnnotationsConfig, config, data, parentElement, xScaleId, yScaleId, scX, scY);

    drawAnnotationPoints(effectiveAnnotationsConfig, config, data, parentElement, xScaleId, yScaleId, scX, scY);
}

export function resolveAnnotationsConfig(annotationsConfig) {
    for (const [annotationConfigKey, annotationConfigValue] of Object.entries(annotationsConfig)) {
        annotationsConfig[annotationConfigKey] = Object.assign({},
            annotationConfigDefaults(annotationConfigValue.type),
            annotationConfigValue,
            {
                annotationId: annotationConfigKey
            });
    }
}

function drawAnnotationRect(
    annotationsConfig,
    config,
    data,
    parentElement,
    xScaleId = 'x',
    yScaleId = 'y',
    scX = makeScale(config, data, xScaleId),
    scY = makeScale(config, data, yScaleId)
) {

    const rectAnnotationsConfig = annotationsConfig.filter((d) => d.type === 'box' && d.display);

    const groupByParentSelector = groupBy(rectAnnotationsConfig, 'parentSelector');

    const [xMin, xMax] = scX.domain();
    const [yMin, yMax] = scY.domain();

    for (const [parentSelector, rectAnnotations] of Object.entries(groupByParentSelector)) {

        let parentElementSelection = select(parentSelector === 'DEFAULT' ? parentElement : parentSelector);

        parentElementSelection = (parentElementSelection.node() ? parentElementSelection : select(parentElement));

        parentElementSelection
            .selectAll('.annotation-rect')
            .data(rectAnnotations, (d) => d.annotationId)
            .join('rect')
            .attr('class', 'annotation-rect')
            .attr('x', function(d, i) {
                return scX(d.xMin || xMin);
            })
            .attr('y', function(d, i) {
                return scY(d.yMin || yMin);
            })
            .attr('height', function(d, i) {
                return scY(d.yMax || yMax) - scY(d.yMin || yMin);
            })
            .attr('width', function(d, i) {
                return scX(d.xMax || xMax) - scX(d.xMin || xMin);
            })
            .attr('stroke-width', function(d, i) {
                return d.borderWidth;
            })
            .attr('stroke', function(d, i) {
                return d.borderColor;
            })
            .attr('stroke-dasharray', function(d, i) {
                return d.borderDash;
            })
            .style('fill', function(d, i) {
                return d.backgroundColor;
            });
    }
}

function drawAnnotationLines(
    annotationsConfig,
    config,
    data,
    parentElement,
    xScaleId = 'x',
    yScaleId = 'y',
    scX = makeScale(config, data, xScaleId),
    scY = makeScale(config, data, yScaleId)
) {

    const annotationLineOptions = annotationsConfig.filter((d) => d.type === 'line' && d.display);

    const groupByParentSelector = groupBy(annotationLineOptions, 'parentSelector');

    const [xMin, xMax] = scX.domain();
    const [yMin, yMax] = scY.domain();

    for (const [parentSelector, lineAnnotations] of Object.entries(groupByParentSelector)) {

        let parentElementSelection = select(parentSelector === 'DEFAULT' ? parentElement : parentSelector);

        parentElementSelection = (parentElementSelection.node() ? parentElementSelection : select(parentElement));

        parentElementSelection
            .selectAll('.annotation-line')
            .data(lineAnnotations, (d) => d.annotationId)
            .join('line')
            .attr('class', 'annotation-line')
            .attr('x1', function(d, i) {
                return scX(d.xMin || xMin);
            })
            .attr('y1', function(d, i) {
                return scY(d.yMin || yMin);
            })
            .attr('x2', function(d, i) {
                return scX(d.xMax || xMax);
            })
            .attr('y2', function(d, i) {
                return scY(d.yMax || yMax);
            })
            .attr('stroke-width', function(d, i) {
                return d.borderWidth;
            })
            .attr('stroke', function(d, i) {
                return d.borderColor;
            })
            .attr('stroke-dasharray', function(d, i) {
                return d.borderDash;
            });
    }
}

function drawAnnotationPoints(
    annotationsConfig,
    config,
    data,
    parentElement,
    xScaleId = 'x',
    yScaleId = 'y',
    scX = makeScale(config, data, xScaleId),
    scY = makeScale(config, data, yScaleId)
) {

    const [xMin, xMax] = scX.range();
    const [yMin, yMax] = scY.range();

    const xMid = (xMin + xMax) / 2;
    const yMid = (yMin + yMax) / 2;

    const pointAnnotationsConfig = annotationsConfig.filter((d) => d.type === 'point' && d.display);

    const pointAnnotationsConfigByParentSelector = groupBy(pointAnnotationsConfig, 'parentSelector');

    for (const [parentSelector, pointAnnotations] of Object.entries(pointAnnotationsConfigByParentSelector)) {

        let parentElementSelection = select(parentSelector === 'DEFAULT' ? parentElement : parentSelector);

        parentElementSelection = (parentElementSelection.node() ? parentElementSelection : select(parentElement));

        const annotationPointsGroup = parentElementSelection
            .selectAll('g.annotation-point')
            .data(pointAnnotations, (d) => d.annotationId)
            .join('g')
            .attr('class', 'annotation-point')
            .attr('transform', function(d) {
                return 'translate(' + (d.xValue ? scX(d.xValue) : xMid) + ',' + (d.yValue ? scY(d.yValue) : yMid) + ')';
            });

        // render shapes
        annotationPointsGroup
            .filter(d => d.hasOwnProperty('shape') && d.shape)
            .each(function(d, i) {
                let itemPath = select(this)
                    .select('path.annotation-point-path');
                if (!itemPath.node()) {
                    itemPath = select(this)
                        .append('path')
                        .attr('class', 'annotation-point-path');
                }
                itemPath
                    .attr('d', function(d, i) {
                        const shapeFn = symbolTypes[d.shape];
                        if (d.size) {
                            shapeFn.size(d.size);
                        }
                        return shapeFn();
                    })
                    .attr('stroke', d => d.borderColor)
                    .attr('fill', d => d.backgroundColor);
            });

        // render images
        annotationPointsGroup
            .filter(d => d.hasOwnProperty('image') && d.image)
            .each(function(d, i) {
                let itemImage = select(this)
                    .select('.annotation-point-image');
                if (!itemImage.node()) {
                    itemImage = select(this)
                        .append('svg:image')
                        .attr('class', 'annotation-point-image');
                }
                itemImage
                    .attr('xlink:href', d => d.image)
                    .attr('width', d => d.imageWidth)
                    .attr('height', d => d.imageHeight)
                    .attr('x', d => -(d.imageWidth / 2))
                    .attr('y', d => -(d.imageHeight / 2));
            });
    }
}

function getAccessor(config, scaleId) {
    const axisKey = getAxisKey(config, scaleId);
    return function accessorFn(d, i) {
        return d[axisKey];
    };
}

function getAxisKey(config, scaleId) {
    return config.parsing[scaleId + 'AxisKey'];
}

function getDomain(config, data, scaleId, accessor) {
    const scaleConfig = config.scales[scaleId];

    const sMin = scaleConfig.min;
    const sMax = scaleConfig.max;
    if (sMin || sMax) {
        return [
            sMin ? sMin : min(data, accessor),
            sMax ? sMax : max(data, accessor)
        ];
    } else {
        const sSuggestedMin = scaleConfig.suggestedMin;
        const sSuggestedMax = scaleConfig.suggestedMax;
        if (sSuggestedMin || sSuggestedMax) {
            const calculatedMin = min(data, accessor);
            const calculatedMax = max(data, accessor);
            return [
                sSuggestedMin ? Math.min(calculatedMin, sSuggestedMin) : calculatedMin,
                sSuggestedMax ? Math.max(calculatedMax, sSuggestedMax) : calculatedMax
            ];
        }
    }
    return extent(data, accessor);
}

function getRange(config, scaleId) {
    if (['right', 'left'].includes(config.scales[scaleId].position)) {
        return [config.height - config.margin.bottom, config.margin.top];
    }
    if (['top', 'bottom'].includes(config.scales[scaleId].position)) {
        return [config.margin.left, config.width - config.margin.right];
    }
}

function getScaleByType(scaleType) {
    switch (scaleType) {
        case 'time':
            return scaleTime();
        case 'linear':
        default:
            return scaleLinear();
    }
}

function getGridLength(config, scaleId) {
    switch (config.scales[scaleId].position) {
        case 'top':
        case 'bottom':
            return getInternalHeight(config);
        case 'right':
        case 'left':
            return getInternalWidth(config);
    }
}

function getAxisTitleTransform(config, scaleId) {

    const scaleConfig = config.scales[scaleId];

    const tickSize = scaleConfig.ticks.size;
    const titleOffset = scaleConfig.ticks.padding + (tickSize > 0 ? tickSize : 0);

    switch (config.scales[scaleId].position) {
        case 'bottom':
        case 'top':
            return `translate(${(config.width / 2)}, ${(config.margin.bottom - titleOffset)})`;
        case 'right':
        case 'left':
            return `translate(${-(config.margin.left - titleOffset)}, ${(config.height / 2)}) rotate(-90)`;
    }
}

function getAxis(config, scaleId) {
    switch (config.scales[scaleId].position) {
        case 'bottom':
            return axisBottom;
        case 'right':
            return axisRight;
        case 'top':
            return axisTop;
        case 'left':
            return axisLeft;
    }
}

function getAxisTransform(config, scaleId) {
    switch (config.scales[scaleId].position) {
        case 'bottom':
            return `translate(0, ${config.height - config.margin.bottom})`;
        case 'right':
            return `translate(${config.width - config.margin.right}, 0)`;
        case 'top':
            return `translate(0, ${config.margin.top})`;
        case 'left':
            return `translate(${config.margin.left}, 0)`;
    }
}

function getInternalWidth(config) {
    return config.width - config.margin.right - config.margin.left;
}

function getInternalHeight(config) {
    return config.height - config.margin.bottom - config.margin.top;
}

function drawPointsText(config, pointGroups, pointPaths) {
    if (!get(config, 'points.labels.display', false)) {
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

function drawPointsTooltip(config, data, parentElement, pointPaths) {

    if (!get(config, 'points.tooltip.display', false)) {
        return;
    }

    const tooltipDiv = select('div.chart-tooltip').node()
        ? select('div.chart-tooltip')
        : (
            select('body')
                .append('div')
                .attr('class', 'chart-tooltip')
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
                .style('box-shadow', '0 3px 10px rgb(0 0 0 / 0.2)')
                .style('opacity', 0)
        );

    function doHighlightPoint(d, i) {
        select(parentElement)
            .select('#pointHighlight')
            .selectAll('stop').each(function(e, j) {
            if (j === 0) {
                select(this)
                    .attr('stop-color', getConfigValue(config.points.backgroundColor, d, i));
            } else {
                select(this)
                    .attr('stop-color', getConfigValue(config.points.borderColor, d, i));
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
        const dy = config.points.tooltip.offset; // render tooltip at relative distance from point. vertical offset.

        const tooltipLeft = ((pointPathBox.left + (pointPathBox.width / 2)) - (tooltipBox.width / 2));
        const tooltipTop = (window.scrollY + pointPathBox.top - (tooltipBox.height + pointPathBox.height) - dy);

        const boundingClientRect = parentElement.getBoundingClientRect();

        if (tooltipLeft + tooltipBox.width > boundingClientRect.right) {
            // move box left when overflowing on the right edge
            tooltipDiv
                .style('left', Math.floor(boundingClientRect.right - tooltipBox.width) + 'px');
        } else if (tooltipLeft < boundingClientRect.left) {
            // move box right when overflowing on the left edge
            tooltipDiv
                .style('left', boundingClientRect.left + 'px');
        } else {
            tooltipDiv
                .style('left', tooltipLeft + 'px');
        }
        tooltipDiv
            .style('top', (tooltipTop < 0 ? 0 : tooltipTop) + 'px');
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

function animateLine(config, data, linePath, lineMakerFn) {

    const animation = resolveAnimationConfig(config.line.animation);

    if (!animation.enabled) {
        linePath
            .attr('d', lineMakerFn(data));
        return;
    }

    const t = transition()
        .duration(animation.duration)
        .delay(animation.delay)
        .ease(resolveEase(animation.ease));

    switch (animation.type) {
        case 'grow':
            // Line grow animation
            const totalLength = linePath.node().getTotalLength();

            linePath
                .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
                .attr('stroke-dashoffset', totalLength)
                .transition(t)
                .attr('stroke-dashoffset', 0);
            break;
        case 'simple':
        default:
            linePath
                .transition(t)
                .attr('d', lineMakerFn(data));
    }

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
        delay: null,
        type: 'simple'
    };
}

function resolveEase(easing) {
    switch (easing) {
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

function annotationConfigDefaults(annotationType) {
    let result;
    switch (annotationType) {
        case 'box':
            result = {
                display: true,
                type: 'box',
                xMin: null,
                xMax: null,
                yMin: null,
                yMax: null,
                borderColor: null,
                borderWidth: null,
                borderDash: null,
                backgroundColor: 'var(--gray-8)',
                parentSelector: 'DEFAULT',
                xAxisID: 'x',
                yAxisID: 'y'
            };
            break;
        case 'line':
            result = {
                display: true,
                type: 'line',
                xMin: null,
                xMax: null,
                yMin: null,
                yMax: null,
                borderColor: 'var(--gray-5)',
                borderWidth: 0.5,
                borderDash: [2, 2],
                parentSelector: 'DEFAULT',
                xAxisID: 'x',
                yAxisID: 'y'
            };
            break;
        case 'point':
        default:
            result = {
                display: true,
                type: 'point',
                xValue: null,
                yValue: null,
                image: null,
                imageWidth: 10,
                imageHeight: 10,
                shape: null,
                size: 20,
                borderColor: null,
                backgroundColor: null,
                parentSelector: 'DEFAULT',
                xAxisID: 'x',
                yAxisID: 'y'
            };
    }
    return result;
}

function datasetConfigDefaults(label) {
    return {
        label,
        xAxisID: 'x',
        yAxisID: 'y'
    };
}

/**
 *
 * @param {DOMElement} parentElement - html element that will act as the parent of the element to be (created if not exists and) returned
 * @param {string} elementName - name of the html element to be created under the parent.
 * @param {string | array} classNames - class names to be used to look up the element under the parent,
 *                                      and if not exists add the class names to the element after creation.
 * @returns {Selection} - a d3 Selection of the element.
 */
function getElementSelection(parentElement, elementName, classNames) {
    let elementSelection = select(parentElement)
        .select(`${elementName}.${Array.isArray(classNames) ? classNames.join('.') : classNames}`);
    if (!elementSelection.node()) {
        elementSelection = select(parentElement)
            .append(elementName)
            .attr('class', Array.isArray(classNames) ? classNames.join(' ') : classNames);
    }
    // Adding id's to dyanmically created groups.
    if (!elementSelection.attr('id') && select(parentElement).attr('id')) {
        elementSelection.attr('id', `${select(parentElement).attr('id')}_${Array.isArray(classNames) ? classNames.reverse().join('_') : classNames}`);
    }
    return elementSelection;
}

/**
 * @param {function|string|number} valOrFn
 * @param {object} d
 * @param {index} i
 * @returns {*} - the value of a config property. If value is a function, it executes the function and retuns the value,
 *                if value is a string, returns the value.
 */
function getConfigValue(valOrFn, d, i) {
    if (!valOrFn) {
        return valOrFn;
    }

    return typeof valOrFn === 'function' ? valOrFn(d, i) : valOrFn;
}

/**
 * @param {array} array - an array of objects
 * @param {string} prop - a property of an object in the array
 * @returns {object} - an object with key as the prop's value and value as array of object that have the same prop value.
 */
function groupBy(array, prop) {
    return array.reduce((acc, e) => {
        (acc[e[prop]] = acc[e[prop]] || []).push(e);
        return acc;
    }, {});
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