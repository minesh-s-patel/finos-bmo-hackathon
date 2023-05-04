import {log} from 'console';
import * as fs from 'fs';

export function loadSample(filename: string): any {
  const jsonString = fs.readFileSync('ecs-json/' + filename, 'utf-8');
  return JSON.parse(jsonString);
}

/**
 * Assume we have no multiple cardinality for now - we probably need to deal with it
 */
export function assetCountryOfOrigin(sample: any): any {
  if (sample?.criteria[0]?.asset[0]?.assetCountryOfOrigin) {
    return sample?.criteria[0]?.asset[0]?.assetCountryOfOrigin[0]?.value;
  }

  if (sample?.criteria[0]?.asset[0]?.denominatedCurrency) {
    return sample?.criteria[0]?.asset[0]?.denominatedCurrency[0]?.value;
  }
}

export function assetType(sample: any): any {
  return sample?.criteria[0]?.asset[0]?.collateralAssetType[0]?.assetType[0];
}

export function securityType(sample: any): any {
  if (sample?.criteria[0]?.asset[0]?.collateralAssetType[0]?.securityType)
    return sample?.criteria[0]?.asset[0]?.collateralAssetType[0]
      ?.securityType[0];
  else {
    return '';
  }
}

export function assetTypeE(sample: any): any {
  return securityType(sample) + ' ' + assetType(sample);
}

export function maturityLowerBound(sample: any): number {
  return sample?.criteria[0]?.asset[0]?.maturityRange?.lowerBound?.period
    ?.periodMultiplier;
}

export function maturityUpperBound(sample: any): number {
  return sample?.criteria[0]?.asset[0]?.maturityRange?.upperBound?.period
    ?.periodMultiplier;
}

export function issuerType(sample: any): any {
  if (sample?.criteria[0]?.issuer) {
    return sample?.criteria[0]?.issuer[0]?.issuerType[0]?.issuerType[0];
  } else {
    return '';
  }
}

export function haircutPercentage(sample: any): any {
  const pctSt =
    sample?.criteria[0]?.treatment?.valuationTreatment?.haircutPercentage;

  var pct: number = +pctSt;
  return pct * 100 + '%';
}

export function toScheduleSummary(sample: any): ScheduleSummary {
  return {
    assetCountryOfOrigin: assetCountryOfOrigin(sample),
    assetType: assetTypeE(sample),
    maturityLower: maturityLowerBound(sample),
    maturityUpper: maturityUpperBound(sample),
    issuerType: issuerType(sample),
    haircutPercentage: haircutPercentage(sample),
  };
}

interface ScheduleSummary {
  assetCountryOfOrigin: string;
  assetType: string;
  maturityLower: number;
  maturityUpper: number;
  issuerType: string;
  haircutPercentage: string;
}

export function toReadable(sched: ScheduleSummary) {
  let res;
  if (sched.maturityLower + '-' + sched.maturityUpper == 'NaN-NaN') {
    res = '';
  } else {
    res = sched.maturityLower + 'Y-' + sched.maturityUpper + 'Y';
  }

  return (
    sched.assetCountryOfOrigin +
    ' ' +
    sched.assetType +
    ' ' +
    res +
    ' ' +
    sched.issuerType +
    ' ' +
    sched.haircutPercentage
  );
}

const EU1515pct = loadSample('EU-1-5-15pct.JSON');
const US1510pct = loadSample('US-1-5-10pct.JSON');
const US154pctCorp = loadSample('US-1-5-4pct-Corp.JSON');
const USCash = loadSample('US-Cash.JSON');
const EU152pct = loadSample('EU-1-5-2pct.JSON');
const US152pct = loadSample('US-1-5-2pct.JSON');
const US154pct = loadSample('US-1-5-4pct.JSON');
const schedules = [
  EU1515pct,
  US1510pct,
  US154pctCorp,
  USCash,
  EU152pct,
  US152pct,
  US154pct,
].map(X => toScheduleSummary(X));

export function isEligible(
  assetCountryOfOrigin: string,
  assetType: string,
  issuerType?: string,
  maturity?: number
): ScheduleSummary[] {
  const isEligible = schedules
    .filter(
      loadedSchedule =>
        loadedSchedule.assetCountryOfOrigin == assetCountryOfOrigin
    )
    .filter(loadedSchedule => loadedSchedule.assetType == assetType)
    .filter(
      loadedSchedule => !issuerType || loadedSchedule.issuerType == issuerType
    )
    .filter(
      loadedSchedule => !maturity || maturity < loadedSchedule.maturityUpper
    )
    .filter(
      loadedSchedule => !maturity || maturity > loadedSchedule.maturityLower
    );
  return isEligible;
}

export function solveUsecase(
  assetCountryOfOrigin: string,
  assetType: string,
  issuerType?: string,
  maturity?: number
) {
  const usecase1Answer = isEligible(
    assetCountryOfOrigin,
    assetType,
    issuerType,
    maturity
  );

  console.log(
    'Q: Is an ' +
      assetCountryOfOrigin.toLowerCase().replace("_", " ") + ' ' + assetType.toLowerCase().replace("_", " ") +  ' ' + (issuerType ?  "issued by " + issuerType?.toLowerCase().replace("_", " ") : "") + ' with ' + maturity +  ' years remaining maturity eligible?'
  );

  console.log(usecase1Answer.length === 0 ? 'No' : 'Yes');
  if (usecase1Answer.length === 0) {
    console.log('A: No');
  } else {
    console.log('A: Yes');
    console.log('Q: If so, what are applicable haircuts?');
    usecase1Answer.map(x => console.log('A: ' + toReadable(x)));
  }
}

//schedules.forEach(x => console.log(toReadable(x)));

console.log('use case 1');
solveUsecase('EU', 'DEBT SECURITY', 'SOVEREIGN_CENTRAL_BANK', 4);
console.log('use case 2');
solveUsecase('JGB', 'DEBT SECURITY', 'SOVEREIGN_CENTRAL_BANK', 3);
console.log('use case 3');

solveUsecase('GBP', 'CASH', undefined, undefined);
