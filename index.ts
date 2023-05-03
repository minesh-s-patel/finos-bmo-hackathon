import * as fs from 'fs';

export function loadSample(filename: string): any {
  const jsonString = fs.readFileSync('ecs-json/' + filename, 'utf-8');
  return JSON.parse(jsonString)
}

/**
 * Assume we have no multiple cardinality for now - we probably need to deal with it
 */
export function assetCountryOfOrigin(sample: any): any {
  return sample.criteria[0].asset[0].assetCountryOfOrigin[0].value
}

export function assetType(sample: any): any {
  return sample.criteria[0].asset[0].collateralAssetType[0].assetType[0]
}

export function securityType(sample: any): any {
  return sample.criteria[0].asset[0].collateralAssetType[0].securityType[0]
}

export function maturityLowerBound(sample: any): any {
  return sample.criteria[0].asset[0].maturityRange.lowerBound.period.periodMultiplier + sample.criteria[0].asset[0].maturityRange.lowerBound.period.period[0]
}

export function maturityUpperBound(sample: any): any {
  return sample.criteria[0].asset[0].maturityRange.upperBound.period.periodMultiplier + sample.criteria[0].asset[0].maturityRange.upperBound.period.period[0]
}

const EU1515pct = loadSample('EU-1-5-15pct.JSON');
const US1510pct = loadSample('US-1-5-10pct.JSON');
const US154pctCorp = loadSample('US-1-5-4pct-Corp.JSON');
const USCash = loadSample('US-Cash.JSON');
const EU152pct = loadSample('EU-1-5-2pct.JSON');
const US152pct = loadSample('US-1-5-2pct.JSON');
const US154pct = loadSample('US-1-5-4pct.JSON');
 
console.log(maturityUpperBound(EU1515pct));

console.log(maturityUpperBound(EU1515pct));

