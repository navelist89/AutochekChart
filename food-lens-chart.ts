import * as Highcharts from 'highcharts'
import { AutochekChartOption, chartCommon } from '@AutochekChart/chart.option'
import * as moment from 'moment'
import { DaySummaryWithArray, FoodlensDaySummary, FoodlensMeasurement } from 'autochek-base/objects/device-data-object'

chartCommon(Highcharts)

// export interface FoodlensNutrition {
//   calcium: number;
//   calories: number;
//   carbonhydrate: number;
//   cholesterol: number;
//   dietrayfiber: number;
//   fat: number;
//   protein: number;
//   rawCalories: number;
//   rawtotalGram: number;
//   saturatedfat: number;
//   sodium: number;
//   sugar: number;
//   totalgram: number;
//   transfat: number;
//   unit: string;
//   vitamina: number;
//   vitaminb: number;
//   vitaminc: number;
//   vitamind: number;
//   vitamine: number;
// }
//
// export interface FoodlensRawUserSelectedFood {
//   foodId: number;
//   foodName: string;
//   nutrition: FoodlensNutrition;
// }
//
// export interface FoodlensRawFoodPosition {
//   eatAmount: number;
//   foodImagePath: string;
//   userSelectedFood: FoodlensRawUserSelectedFood;
//   foodCandidates: any[];
// }
//
// export interface FoodlensRaw {
//   eatDate: string;
//   eatType: number;
//   foodPositionList: FoodlensRawFoodPosition[];
//   mealType: string;
//   predictedImagePath: string;
// }
//
// // from Foodlens
// export interface FoodlensPartial extends FoodlensNutrition {
//   refPhoto: string; // use cloud store
//   foodname: string;
//   calories: number;
//   eatAmount: number;
// }
//
// export interface FoodlensMeasurement {
//   date: Date;
//   refPhoto: string; // cloud store url
//   composition: FoodlensPartial[];
//   mealType: string;
//   imgurl?: string;
// }
// FoodlensMeasurement.composition.forEach( foodlensPartial=>{
// sumCal += foodlensPartial.calories
// sumFat += foodlensPartial.fat
// sumProtein += foodlensPartial.Protein
// })


export function drawFoodLensChart(canvas: string, data: FoodlensMeasurement[] | FoodlensDaySummary[], opt?: AutochekChartOption) {
  // recent 에서는 선 그래프 with 누적 cal
  // 기간 별로는 선 그래프 total sumcal
  let chartOption: any = {}
  if (data.length > 0) {
    chartOption = setFoodLensOption(data, opt)
    console.log(chartOption)
    Highcharts.chart(canvas, chartOption)
  } else {
    Highcharts.chart(canvas, {title: {text: ''}})
  }
}

const options: any = {
  title: {
    text: 'temp'
  },
  chart: {
    type: 'area'
  },
  time: {
    timezone: 'Asia/Seoul'
  },
  xAxis: {
    type: 'datetime',
    title: {
      text: '시간',
      enabled: false
    },
    min: undefined,
    max: undefined
  },
  yAxis: {
    title: {
      text: ''
    },
    startOnTick: false,
    endOnTick: false
  },
  plotOptions: {
    series: {
      stacking: 'normal'
    }
  },
  series: [{
    name: '칼로리',
    data: []
  }]
}

function setFoodLensOption(data: FoodlensDaySummary[] | FoodlensMeasurement[], opt?: AutochekChartOption) {
  if (data[0] instanceof FoodlensMeasurement) {
    const sTime = moment().startOf('day').valueOf()
    const eTime = moment().endOf('day').valueOf()
    options.chart.type = 'line'
    options.title.text = '오늘 하루 시간별 섭취 칼로리'
    options.xAxis.min = sTime
    options.xAxis.max = eTime
    const tempArray = []
    tempArray.push({x: sTime, y: 0})
    data.forEach(food => {
      let sumCal = 0
      food.composition.forEach(eachFood => {
        sumCal += eachFood.calories
      })
      tempArray.push({x: food.date.getTime(), y: sumCal})
    })
    tempArray.push({x: eTime, y: 0})

    options.series[0].data = tempArray
    return options
  } else {
    options.chart.type = 'column'
    options.title.text = '일자별 섭취 칼로리 차트'
    const tempArray = []
    data.forEach(foodSummary => {
      tempArray.push({x: foodSummary.date.getTime(), y: foodSummary.sumCalories})
    })
    if (opt && opt.start) {
      options.xAxis.min = opt.start.getTime()
    }
    if (opt && opt.end) {
      options.xAxis.max = opt.end.getTime()
    }
    options.series[0].data = tempArray
    return options
  }
}
