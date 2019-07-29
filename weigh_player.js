const player = require("./player.json");
const _ = require("lodash");


const profiles = {
  mental: [
    { type: 'aggression', offWeight: 1, defWeight: 3, twoWeight: 2 },
    { type: 'anticipation', offWeight: 5, defWeight: 5, twoWeight: 5 },
    { type: 'bravery', offWeight: 2, defWeight: 3, twoWeight: 2 },
    { type: 'creativity', offWeight: 4, defWeight: 1, twoWeight: 2 },
    { type: 'determination', offWeight: 5, defWeight: 5, twoWeight: 5 },
    { type: 'flair', offWeight: 2, defWeight: 1, twoWeight: 1 },
    { type: 'influence', offWeight: 2, defWeight: 2, twoWeight: 2 },
    { type: 'teamwork', offWeight: 3, defWeight: 3, twoWeight: 3 },
    { type: 'work_rate', offWeight: 4, defWeight: 4, twoWeight: 4 },
  ],
  physical: [
    { type: 'acceleration', offWeight: 5, defWeight: 5, twoWeight: 5 },
    { type: 'agility', offWeight: 3, defWeight: 2, twoWeight: 2 },
    { type: 'balance', offWeight: 2, defWeight: 3, twoWeight: 3 },
    { type: 'speed', offWeight: 5, defWeight: 5, twoWeight: 5 },
    { type: 'stamina', offWeight: 4, defWeight: 4, twoWeight: 4 },
    { type: 'strength', offWeight: 1, defWeight: 4, twoWeight: 3 },
  ],
  technical: [
    { type: 'checking', offWeight: 1, defWeight: 5, twoWeight: 3 },
    { type: 'deflections', offWeight: 1, defWeight: 3, twoWeight: 3 },
    { type: 'deking', offWeight: 5, defWeight: 1, twoWeight: 2 },
    { type: 'faceoffs', offWeight: 2, defWeight: 2, twoWeight: 2 },
    { type: 'hitting', offWeight: 1, defWeight: 3, twoWeight: 2 },
    { type: 'off_the_puck', offWeight: 4, defWeight: 2, twoWeight: 4 },
    { type: 'passing', offWeight: 5, defWeight: 3, twoWeight: 4 },
    { type: 'pokecheck', offWeight: 1, defWeight: 5, twoWeight: 3 },
    { type: 'positioning', offWeight: 3, defWeight: 5, twoWeight: 4 },
    { type: 'slapshot', offWeight: 2, defWeight: 4, twoWeight: 3 },
    { type: 'stickhandling', offWeight: 5, defWeight: 2, twoWeight: 3 },
    { type: 'wristshot', offWeight: 5, defWeight: 2, twoWeight: 4 },
  ],
};

let weights = {};
const lastAttributeSet = player.attributes[player.attributes.length-1]; 

[ { weight: 'offWeight', type: 'mental' }, { weight: 'defWeight', type: 'mental' }, { weight: 'twoWeight', type: 'mental' },
  { weight: 'offWeight', type: 'technical' }, { weight: 'defWeight', type: 'technical' }, { weight: 'twoWeight', type: 'technical' },
  { weight: 'offWeight', type: 'physical' }, { weight: 'defWeight', type: 'physical' }, { weight: 'twoWeight', type: 'physical' },
].map((weightObj, i) => {

  weights[`${weightObj.type}_${weightObj.weight}`] = _.reduce(profiles[weightObj.type], (sumObj, att) => {

    const weightedValue = lastAttributeSet[att.type] * att[weightObj.weight];

    return { weightedSum: sumObj.weightedSum + weightedValue, weightSum: sumObj.weightSum + att.offWeight };
  }, { weightedSum: 0, weightSum: 0 });
});

const mental_off_weighted = ((weights['mental_offWeight'].weightedSum / weights['mental_offWeight'].weightSum)/20)*100;
const mental_def_weighted = ((weights['mental_defWeight'].weightedSum / weights['mental_defWeight'].weightSum)/20)*100;
const mental_two_weighted = ((weights['mental_twoWeight'].weightedSum / weights['mental_twoWeight'].weightSum)/20)*100;

const physical_off_weighted = ((weights['physical_offWeight'].weightedSum / weights['physical_offWeight'].weightSum)/20)*100;
const physical_def_weighted = ((weights['physical_defWeight'].weightedSum / weights['physical_defWeight'].weightSum)/20)*100;
const physical_two_weighted = ((weights['physical_twoWeight'].weightedSum / weights['physical_twoWeight'].weightSum)/20)*100;

const technical_off_weighted = ((weights['technical_offWeight'].weightedSum / weights['technical_offWeight'].weightSum)/20)*100;
const technical_def_weighted = ((weights['technical_defWeight'].weightedSum / weights['technical_defWeight'].weightSum)/20)*100;
const technical_two_weighted = ((weights['technical_twoWeight'].weightedSum / weights['technical_twoWeight'].weightSum)/20)*100;

const combined_off_weighted = (technical_off_weighted + physical_off_weighted + mental_off_weighted)/3;
const combined_def_weighted = (technical_def_weighted + physical_def_weighted + mental_def_weighted)/3;
const combined_two_weighted = (technical_two_weighted + physical_two_weighted + mental_two_weighted)/3;

console.log("");
console.log(player.name + '.............');

console.log("");
console.log("Combined Offensive : ", combined_off_weighted.toFixed(2));
console.log("Combined Defensive : ", combined_def_weighted.toFixed(2));
console.log("Combined 2 Way     : ", combined_two_weighted.toFixed(2));

console.log("");
console.log("Technical Offensive : ", technical_off_weighted.toFixed(2));
console.log("Technical Defensive : ", technical_def_weighted.toFixed(2));
console.log("Technical 2 Way     : ", technical_two_weighted.toFixed(2));

console.log("");
console.log("Mental Offensive    : ", mental_off_weighted.toFixed(2));
console.log("Mental Defensive    : ", mental_def_weighted.toFixed(2));
console.log("Mental 2 Way        : ", mental_two_weighted.toFixed(2));

console.log("");
console.log("Physical Offensive  : ", physical_off_weighted.toFixed(2));
console.log("Physical Defensive  : ", physical_def_weighted.toFixed(2));
console.log("Physical 2 Way      : ", physical_two_weighted.toFixed(2));


