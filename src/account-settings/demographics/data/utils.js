export const TO = 'to';
export const FROM = 'from';

// Frontend wants (example):
//    demographics_user_ethnicity: ["asian", "white", "other"]
//
// Demographics wants (example):
//    user_ethnicity: [
//      { ethnicity: "asian" },
//      { ethnicity: "white" },
//      { ethnicity: "other" }
//    ]
function convertEthnicity(ethnicityData, direction) {
  if (direction === FROM) {
    return ethnicityData.map(e => e.ethnicity);
  }

  if (direction === TO) {
    return ethnicityData.map(e => ({ ethnicity: e }));
  }

  return ethnicityData;
}

// Handles conversion of data to/from Demographics IDA to/from format needed for
// frontend
//  * handles ethnicity field
//  * adds/removes 'demographics' to/from key
//  * replace `null` with empty string or empty string with null
export function convertData(dataObject, direction) {
  const converted = {};

  Object.entries(dataObject).forEach(([key, value]) => {
    let newValue = value;

    if (key.includes('ethnicity')) {
      newValue = convertEthnicity(value, direction);
    }

    if (direction === TO) {
      converted[key.replace('demographics_', '')] = newValue || null;
    }

    if (direction === FROM) {
      converted[`demographics_${key}`] = newValue || '';
    }
  });

  return converted;
}
