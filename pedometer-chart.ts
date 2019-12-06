import * as moment from 'moment';
import MomentTimeZone from 'moment-timezone';

window['moment'] = moment;
MomentTimeZone();

import * as Highcharts from 'highcharts';
import Boost from 'highcharts/modules/boost';
import noData from 'highcharts/modules/no-data-to-display';
import More from 'highcharts/highcharts-more';
import {PedometerDaySummary, PedometerTimeSegment} from '@AutochekCommon/vanilla/objects/device-data-object';
import {AutochekChartOption} from './chart.option';

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);

export function drawPedometerChart(canvas: string, data: PedometerTimeSegment[] | PedometerDaySummary[], opt?: AutochekChartOption) {
  const pedometerData = setPedometerData(data);
  pedometerData.forEach((dataset, i) => {
    const chartDiv = document.createElement('div');
    chartDiv.className = 'chart';
    document.getElementById(canvas).appendChild(chartDiv);
    options.series[0].data = dataset;
    options.title.text = optionData[i].title;
    options.tooltip.pointFormat = '{point.y} ' + optionData[i].unit;

    if (opt.start) {
      options.xAxis.min = opt.start.getTime();
    }
    if (opt.end) {
      options.xAxis.max = opt.end.getTime();
    }
    if (data[0] instanceof PedometerTimeSegment) {
      options.plotOptions.series.groupPadding = 0;
    }
    Highcharts.chart(chartDiv, options);
  });
}

Highcharts.setOptions({
  lang: {
    months: [
      '1', '2', '3', '4',
      '5', '6', '7', '8',
      '9', '10', '11', '12'
    ],
    weekdays: [
      '일', '월', '화', '수', '목', '금', '토'
    ],
    shortMonths: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    thousandsSep: ','
  }
});

const optionData = [
  {title: '활동량', yAxisTitle: '걸음(보)', unit: '보'},
  {title: '소모 칼로리', yAxisTitle: '칼로리(kcal)', unit: 'kcal'},
  {title: '이동거리', yAxisTitle: '거리(km)', unit: 'kcal'}
];

const options: any = {
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  tooltip: {
    pointFormat: '{point.y}',
    xDateFormat: '%b월 %e일'
  },
  time: {
    timezone: 'Asia/Seoul'
  },
  xAxis: {
    type: 'datetime',
    startOnTick: false,
    endOnTick: false,
    gridLineWidth: 1,
    title: {
      text: '시간',
      enabled: false
    },
    dateTimeLabelFormats: {
      minute: '%H:%M',
      hour: '%H:%M',
      day: '%b월 %e일',
      week: '%b월 %e일',
      month: '%y년 %b월'
    }
  },
  yAxis: {
    title: {
      text: ''
    },
    startOnTick: false,
    endOnTick: false,
    labels: {
      format: '{value}',
      padding: 2,
    }
  },
  plotOptions: {
    series: {
      showInLegend: false,
      marker: {
        enabled: true
      },
      groupPadding: 0.05,
      pointPadding: 0,
      color: Highcharts.getOptions().colors[3]
    }
  },
  series: [{
    type: 'column',
    data: []
  }]
};

function setPedometerData(pedoData: PedometerTimeSegment[] | PedometerDaySummary[]) {
  const rtnData = [];
  const step = [];
  const cal = [];
  const dist = [];
  // 빈배열 일 때 조심해서 다뤄야 함 채크 필요
  if (pedoData[0] instanceof PedometerTimeSegment) {
    let timeCriteria = moment(pedoData[0].date).startOf('hour');
    let dataSum = [0, 0, 0];
    pedoData.forEach((data, i) => {
      const timeAndDate = moment(data.date).startOf('hour');
      const tempTime = new Date(timeCriteria.toDate()).getTime();

      // code 정리 가능할 것 같음.
      if (timeCriteria.isSame(timeAndDate) && i !== pedoData.length - 1) {
        dataSum[0] += data.step;
        dataSum[1] += data.cal;
        dataSum[2] += data.dist;
      } else if (i !== pedoData.length - 1) {
        step.push([tempTime, dataSum[0]]);
        cal.push([tempTime, parseFloat(dataSum[1].toFixed(2))]);
        dist.push([tempTime, parseFloat(dataSum[2].toFixed(2))]);

        timeCriteria = timeAndDate;
        dataSum = [data.step, data.cal, data.dist];

        dataSum[0] += data.step;
        dataSum[1] += data.cal;
        dataSum[2] += data.dist;
      }
      if (i === pedoData.length - 1) {
        dataSum[0] += data.step;
        dataSum[1] += data.cal;
        dataSum[2] += data.dist;

        step.push([tempTime, dataSum[0]]);
        cal.push([tempTime, parseFloat(dataSum[1].toFixed(2))]);
        dist.push([tempTime, parseFloat(dataSum[2].toFixed(2))]);
      }

    });
  } else {
    pedoData.forEach((data) => {
      const timeAndDate = new Date(data.date).getTime();
      step.push([
        timeAndDate, data.step
      ]);
      cal.push([
        timeAndDate, data.cal
      ]);
      dist.push([
        timeAndDate, data.dist
      ]);
    });
  }
  rtnData.push(step);
  rtnData.push(cal);
  rtnData.push(dist);

  return rtnData;
}