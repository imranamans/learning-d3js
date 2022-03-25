<template>
    <div class="line-chart-container">
        <svg :id="id"
             ref="lineChart"
             :viewBox="viewBox"
             class="line-chart"
             width="100%">
            <defs>
                <radialGradient id="pointHighlight">
                    <stop offset="50%" stop-color="var(--brand-blue)" stop-opacity="1"/>
                    <stop offset="100%" stop-color="var(--brand-blue)" stop-opacity="0.3"/>
                </radialGradient>
            </defs>

            <g :id="id + '_shadedRegionGroup'"
               class="shaded-region"></g>
            <g :id="id + '_shadedRegionBorderGroup'"
               class="shaded-region-border"></g>

            <g :id="id + '_xGrid'" class="x-grid"></g>
            <g :id="id + '_yGrid'" class="y-grid"></g>

            <g :id="id + '_xAxis'" class="x-axis"></g>
            <g :id="id + '_yAxis'" class="y-axis"></g>

            <g :id="id + '_lineGroup'"
               class="line"></g>

            <g :id="id + '_pointsGroup'"
               class="points"></g>

            <g :id="id + '_legendGroup'"
               class="legend"></g>

            <g :id="id + '_annotationsGroup'"
               class="annotations"></g>
        </svg>
    </div>
</template>

<script>
import {
    debugChart,
    drawAnnotation,
    drawAxes,
    drawGrids,
    drawLegend,
    drawLine,
    drawPoints,
    drawShadedRegion
} from './Chart.js';
import {merge} from 'lodash';

export default {
    name: 'LineChart',
    props: {
        id: {
            type: String,
            required: true
        },
        /**
         * Overall width of the line chart
         */
        width: {
            type: Number,
            required: true
        },
        /**
         * Overall height of the line chart
         */
        height: {
            type: Number,
            required: true
        },
        /**
         * An array of objects.  The value for the X axis is retrieved from the object
         * property named by options.parsing.xAxisKey.  The value for the Y axis is
         * retrieved from the object property named by options.parsing.yAxisKey.
         */
        data: {
            type: Array,
            required: true
        },
        /**
         * Defines options for how the line chart will be displayed.
         * @see https://confluence.pointclickcare.com/confluence/display/HC/Graphing+Component+API+Documentation
         */
        options: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            defaultOptions: {
                margin: {top: 20, right: 20, bottom: 40, left: 40},
                width: this.width,
                height: this.height,
                parsing: {
                    xAxisKey: 'x',
                    yAxisKey: 'y'
                },
                dataKey: null,
                scales: {
                    x: {
                        display: true,
                        position: 'bottom',
                        axis: 'x',
                        type: 'time',
                        animate: false,
                        title: {
                            display: false,
                            text: null,
                            color: 'var(--gray-2)'
                        },
                        grid: {
                            display: false,
                            color: 'var(--gray-4)',
                            width: 0.2,
                            drawBorder: false
                        },
                        ticks: {
                            padding: 8,
                            size: -4,
                            innerSize: null,
                            outerSize: null,
                            count: null,
                            timeInterval: null,
                            color: 'var(--gray-4)',
                            font: {
                                size: '7px',
                                weight: 0.5
                            },
                            tickFormat: null,
                            hideAxisLine: false
                        },
                        nice: false,
                        min: null,
                        max: null,
                        suggestedMin: null,
                        suggestedMax: null
                    },
                    y: {
                        display: true,
                        position: 'left',
                        axis: 'y',
                        type: 'linear',
                        animate: false,
                        title: {
                            display: false,
                            text: null,
                            color: 'var(--gray-2)'
                        },
                        grid: {
                            display: false,
                            color: 'var(--gray-4)',
                            width: 0.2,
                            drawBorder: false
                        },
                        ticks: {
                            padding: 10,
                            size: 0,
                            innerSize: null,
                            outerSize: null,
                            count: null,
                            timeInterval: null,
                            color: 'var(--gray-4)',
                            font: {
                                size: '8px',
                                weight: 0.5
                            },
                            tickFormat: null,
                            hideAxisLine: false
                        },
                        nice: false,
                        min: null,
                        max: null,
                        suggestedMin: null,
                        suggestedMax: null
                    }
                },
                shadedRegion: {
                    display: false,
                    backgroundColor: 'var(--gray-8)',
                    y: {
                        start: null,
                        end: null
                    },
                    xAxisID: 'x',
                    yAxisID: 'y'
                },
                points: {
                    display: true,
                    shape: function(d, i) {
                        return 'circle';
                    },
                    size: function(d, i) {
                        return 20;
                    },
                    borderColor: function(d, i) {
                        return 'var(--brand-blue)';
                    },
                    borderWidth: 1,
                    backgroundColor: function(d, i) {
                        return 'var(--brand-blue)';
                    },
                    animation: false,
                    labels: {
                        display: false,
                        text: function(d, i) {
                            return null;
                        },
                        fontSize: '8px',
                        color: function(d, i) {
                            return 'var(--brand-blue)';
                        },
                        x: null,
                        y: null
                    },
                    tooltip: {
                        display: false,
                        callback: function(d, i) {
                            // can return html.
                            return '';
                        },
                        textAlign: 'center',
                        backgroundColor: 'var(--gray-1)',
                        color: 'var(--foreground-color)',
                        borderRadius: '5px',
                        borderWidth: 0,
                        borderColor: null,
                        pointerEvents: 'none',
                        width: 'auto',
                        height: 'auto',
                        padding: '5px',
                        offset: 10
                    }
                },
                line: {
                    display: true,
                    color: 'var(--gray-4)',
                    width: 0.5,
                    animation: false
                },
                legend: {
                    padding: 10,
                    display: false,
                    fontSize: '6px',
                    items: []
                },
                annotation: {
                    annotations: {}
                }
            }
        };
    },
    computed: {
        config() {
            return merge({}, this.defaultOptions, this.options);
        },
        viewBox() {
            return `0 0 ${this.width} ${this.height}`;
        }
    },
    watch: {
        data: function(newValue) {
            this.redrawChart();
        },
        options: {
            deep: true,
            handler(newValue) {
                this.redrawChart();
            }
        }
    },
    mounted() {
        this.drawChart();
    },
    methods: {
        drawChart() {
            debugChart(this.config, this.data, this.$refs.lineChart);
            drawShadedRegion(this.config, this.data, this.$refs.lineChart);
            drawGrids(this.config, this.data, this.$refs.lineChart);
            drawAxes(this.config, this.data, this.$refs.lineChart);
            drawLine(this.config, this.data, this.$refs.lineChart);
            drawPoints(this.config, this.data, this.$refs.lineChart);
            drawLegend(this.config, this.$refs.lineChart);
            drawAnnotation(this.config, this.data, this.$refs.lineChart);
        },
        redrawChart() {
            this.drawChart();
        }
    }
};
</script>

<style scoped>

@import '../../../../css/color.css';

.line-chart-container {
    width: 100%;
}

.line-chart {
    width: 100%;
}

g.shaded-region-border {
    stroke: var(--gray-5);
    stroke-dasharray: 2, 2;
    stroke-width: 0.5;
}

</style>