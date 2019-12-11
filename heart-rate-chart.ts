import * as moment from 'moment';
import MomentTimeZone from 'moment-timezone';
import {PedometerHeartrateSegment} from '@AutochekCommon/vanilla/objects/device-data-object';

import * as Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';
import {chartCommon} from '@AutochekChart/chart.option';

window['moment'] = moment;
MomentTimeZone();

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
chartCommon();

export async function drawHeartRateChart(canvas: string, data: PedometerHeartrateSegment[]) {
  const option = await setHeartRateChartOption(data);
  await Highcharts.chart(canvas, option);
}

async function setHeartRateChartOption(heartRateData: PedometerHeartrateSegment[]) {
  const options: any = {
    title: {
      text: 'Heart Rate Chart'
    },
    time: {
      timezone: 'Asia/Seoul'
    },
    xAxis: {
      type: 'datetime',
      gridLineWidth: 1,
    },
    yAxis: {
      title: {
        text: 'BPM(심박수/1분)',
        rotation: '270'
      },
      labels: {
        format: '{value}',
      }
    },
    plotOptions: {
      series: {
        animation: false,
        marker: {
          enabled: false
        }
      }
    },
    series: [{
      name: '심박수',
      type: 'line',
      color: Highcharts.getOptions().colors[0],
      data: []
    }]
  };

  heartRateData.forEach(data => {
    if (data.rate > 10) {
      const time = new Date(data.date).getTime();
      options.series[0].data.push([time, data.rate]);
    }
  });
  // set xAxis min: first input data start of day  max: last input data end of day
  const startOfDay = moment(heartRateData[0].date).startOf('day').toDate();
  const endOfDay = moment(heartRateData[heartRateData.length - 1].date).endOf('day').toDate();
  options.xAxis.min = startOfDay.getTime();
  options.xAxis.max = endOfDay.getTime();

  return options;
}
