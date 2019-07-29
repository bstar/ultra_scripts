//const playerApi = require('./api/players');
const AddBoid = require('../server/api/controllers/AddBoid');
const UpdateBoid = require('../server/api/controllers/UpdateBoidById');
const FindBoid = require('../server/api/controllers/FindBoidById');
const league = process.env.LEAGUE || 'development';
const utils = require('./utils').utils;
const argv = require('minimist')(process.argv.slice(2));
const game_date = argv.date;
const csvFilePath = `../exports/${league.toUpperCase()}/${game_date}.csv`;
const Base64 = require('js-base64').Base64;
const fs = require('fs');
const _ = require('lodash');
const converter = require('json-2-csv');
const async = require('async');

const setAttRatings = (player) => {
  
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
    technicalPlayer: [
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
    technicalGoalie: [
      { type: 'blocker', offWeight: 1, defWeight: 1, twoWeight: 1 },
      { type: 'glove', offWeight: 1, defWeight: 1, twoWeight: 1 },
      { type: 'passing', offWeight: 1, defWeight: 1, twoWeight: 1 },
      { type: 'pokecheck', offWeight: 1, defWeight: 1, twoWeight: 1 },
      { type: 'positioning', offWeight: 1, defWeight: 1, twoWeight: 1 },
      { type: 'rebound_control', offWeight: 1, defWeight: 1, twoWeight: 1 },
      { type: 'recovery', offWeight: 1, defWeight: 1, twoWeight: 1 },
      { type: 'reflexes', offWeight: 1, defWeight: 1, twoWeight: 1 },
      { type: 'stickhandling', offWeight: 1, defWeight: 1, twoWeight: 1 },
    ],
  };
  
  const isGoalie = player.positions_short === "G" ? true : false;
  const technicalType = isGoalie ? 'technicalGoalie' : 'technicalPlayer';
  
  player.mental_rating = _.reduce(profiles.mental, (sum, att) => {
  
    return sum + player.attributes[att.type];
  }, 0);
  
  player.physical_rating = _.reduce(profiles.physical, (sum, att) => {
  
    return sum + player.attributes[att.type];
  }, 0);
  
  player.technical_rating = _.reduce(profiles[technicalType], (sum, att) => {
  
    return sum + player.attributes[att.type];
  }, 0);
  
  let weights = {};
  
  
  [ { weight: 'offWeight', type: 'mental' }, { weight: 'defWeight', type: 'mental' }, { weight: 'twoWeight', type: 'mental' },
    { weight: 'offWeight', type: 'technical' }, { weight: 'defWeight', type: 'technical' }, { weight: 'twoWeight', type: 'technical' },
    { weight: 'offWeight', type: 'physical' }, { weight: 'defWeight', type: 'physical' }, { weight: 'twoWeight', type: 'physical' },
  ].map((weightObj, i) => {
    
    const type = (weightObj.type === 'technical') ? technicalType : weightObj.type;
    
    weights[`${weightObj.type}_${weightObj.weight}`] = _.reduce(profiles[type], (sumObj, att) => {
      
      const weightedValue = player.attributes[att.type] * att[weightObj.weight];
      
      return { weightedSum: sumObj.weightedSum + weightedValue, weightSum: sumObj.weightSum + att.offWeight };
    }, { weightedSum: 0, weightSum: 0 });
  });

  player.mental_off_weighted = ((weights['mental_offWeight'].weightedSum / weights['mental_offWeight'].weightSum)/20)*100;
  player.mental_def_weighted = ((weights['mental_defWeight'].weightedSum / weights['mental_defWeight'].weightSum)/20)*100;
  player.mental_two_weighted = ((weights['mental_twoWeight'].weightedSum / weights['mental_twoWeight'].weightSum)/20)*100;
  
  player.physical_off_weighted = ((weights['physical_offWeight'].weightedSum / weights['physical_offWeight'].weightSum)/20)*100;
  player.physical_def_weighted = ((weights['physical_defWeight'].weightedSum / weights['physical_defWeight'].weightSum)/20)*100;
  player.physical_two_weighted = ((weights['physical_twoWeight'].weightedSum / weights['physical_twoWeight'].weightSum)/20)*100;

  player.technical_off_weighted = ((weights['technical_offWeight'].weightedSum / weights['technical_offWeight'].weightSum)/20)*100;
  player.technical_def_weighted = ((weights['technical_defWeight'].weightedSum / weights['technical_defWeight'].weightSum)/20)*100;
  player.technical_two_weighted = ((weights['technical_twoWeight'].weightedSum / weights['technical_twoWeight'].weightSum)/20)*100;
  
  player.combined_off_weighted = (player.technical_off_weighted + player.physical_off_weighted + player.mental_off_weighted)/3;
  player.combined_def_weighted = (player.technical_def_weighted + player.physical_def_weighted + player.mental_def_weighted)/3;
  player.combined_two_weighted = (player.technical_two_weighted + player.physical_two_weighted + player.mental_two_weighted)/3;
  
  
  player.attributes.mental_off_weighted = player.mental_off_weighted;
  player.attributes.mental_def_weighted = player.mental_def_weighted;
  player.attributes.mental_two_weighted = player.mental_two_weighted;
  
  player.attributes.physical_off_weighted = player.physical_off_weighted;
  player.attributes.physical_def_weighted = player.physical_def_weighted;
  player.attributes.physical_two_weighted = player.physical_two_weighted;

  player.attributes.technical_off_weighted = player.technical_off_weighted;
  player.attributes.technical_def_weighted = player.technical_def_weighted;
  player.attributes.technical_two_weighted = player.technical_two_weighted;
  
  player.attributes.combined_off_weighted = player.combined_off_weighted;
  player.attributes.combined_def_weighted = player.combined_def_weighted;
  player.attributes.combined_two_weighted = player.combined_two_weighted;
  
  player.combined_rating = player.mental_rating + player.physical_rating + player.technical_rating;
  player.attributes.mental_rating = player.mental_rating;
  player.attributes.physical_rating = player.physical_rating;
  player.attributes.technical_rating = player.technical_rating;
  player.attributes.combined_rating = player.combined_rating;

  return player;
};

const initPlayer = (doc) => {
  const player = {};
  // general non-stat player properties
  player.ehm_id = parseInt(doc.Id, 10);
  player.id = Base64.encodeURI(doc.Id + doc.Nation + doc['Date Of Birth']);
  player.att_growth = 0;
  player.name = doc.Name;
  player.nation = doc.Nation;
  player.second_nation = doc['Second Nation'];
  player.international_apps = doc['International Apps'] && parseInt(doc['International Apps'], 10);
  player.international_goals = doc['International Goals'] && parseInt(doc['International Goals'], 10);
  player.international_assists = doc['International Assists'] && parseInt(doc['International Assists'], 10);
  // player.estimated_value = doc['Estimated Value'];
  player.club_playing = doc['Club Playing'];
  player.division_playing = doc['Division Playing'];
  player.club_contracted = doc['Club Contracted'];
  player.positions_short = doc['Positions Short'];
  player.stanley_cups_won = doc['Stanley Cups Won'] && parseInt(doc['Stanley Cups Won'], 10);
  player.birth_town = doc['Birth Town'];
  player.dob = doc['Date Of Birth'];
  player.age = doc.Age && parseInt(doc.Age, 10);
  // player.current_ability = doc['Current Ability'] && parseInt(doc['Current Ability'], 10);
  player.home_reputation = doc['Home Reputation'] && parseInt(doc['Home Reputation'], 10);
  // player.current_reputation = doc['Current Reputation'] && parseInt(doc['Current Reputation'], 10);
  // player.world_reputation = doc['World Reputation'] && parseInt(doc['World Reputation'], 10);
  player.handedness = doc.Handedness;
  player.junior_preference = doc['Junior Preference'];
  player.player_roles = doc['Player Roles'];
  player.defensive_role = doc['Defensive Role'] && parseInt(doc['Defensive Role'], 10);
  player.offensive_role = doc['Offensive Role'] && parseInt(doc['Offensive Role'], 10);
  player.morale = doc.Morale && parseInt(doc.Morale, 10);
  player.favorite_number = doc['Favorite Number'], parseInt(doc['Favorite Number'], 10);
  player.squad_number = doc['Squad Number'] && parseInt(doc['Squad Number'], 10);

  // attributes hidden by the game, should probably not be revealed in UI
  player.attributes = {};
  player.attributes.att_growth = 0;
  player.attributes.player_age = player.age;
  player.attributes.game_date = game_date;
  // player.attributes.loyalty = doc.Loyalty && parseInt(doc.Loyalty, 10);
  // player.attributes.pressure = doc.Pressure && parseInt(doc.Pressure, 10);
  // player.attributes.professionalism = doc.Professionalism && parseInt(doc.Professionalism, 10);
  // player.attributes.sportsmanship = doc.Sportsmanship && parseInt(doc.Sportsmanship, 10);
  // player.attributes.temperament = doc.Temperament && parseInt(doc.Temperament, 10);
  // player.attributes.consistency = doc.Consistency && parseInt(doc.Consistency, 10);
  // player.attributes.decisions = doc.Decisions && parseInt(doc.Decisions, 10);
  // player.attributes.dirtiness = doc.Dirtiness && parseInt(doc.Dirtiness, 10);
  // player.attributes.potential_ability = doc['Potential Ability'] && parseInt(doc['Potential Ability'], 10);
  // player.attributes.adaptability = doc.Adaptability && parseInt(doc.Adaptability, 10);
  // player.attributes.ambition = doc.Ambition && parseInt(doc.Ambition, 10);
  // player.attributes.important_matches = doc['Important Matches'] && parseInt(doc['Important Matches'], 10);
  // player.attributes.pass_tendency = doc['Pass Tendency'] && parseInt(doc['Pass Tendency'], 10);
  // player.attributes.fighting = doc.Fighting && parseInt(doc.Fighting, 10);
  // player.attributes.injury_proneness = doc['Injury Proneness'] && parseInt(doc['Injury Proneness'], 10);
  // player.attributes.natural_fitness = doc['Natural Fitness'] && parseInt(doc['Natural Fitness'], 10);
  // player.attributes.agitation = doc.Agitation && parseInt(doc.Agitation, 10);
  // player.attributes.one_on_ones = doc['One On Ones'] && parseInt(doc['One On Ones'], 10);
  // player.attributes.versatility = doc.Versatility && parseInt(doc.Versatility, 10);
  
  // positional ratings
  player.attributes.goaltender = doc.Goaltender && parseInt(doc.Goaltender, 10);
  player.attributes.left_defence = doc['Left Defence'] && parseInt(doc['Left Defence'], 10);
  player.attributes.right_defence = doc['Right Defence'] && parseInt(doc['Right Defence'], 10);
  player.attributes.left_wing = doc['Left Wing'] && parseInt(doc['Left Wing'], 10);
  player.attributes.right_wing = doc['Right Wing'] && parseInt(doc['Right Wing'], 10);
  player.attributes.center = doc.Center && parseInt(doc.Center, 10);
  
  // attributes labeled as 'mental' in game
  player.attributes.aggression = doc.Aggression && parseInt(doc.Aggression, 10);
  player.attributes.anticipation = doc.Anticipation && parseInt(doc.Anticipation, 10);
  player.attributes.bravery = doc.Bravery && parseInt(doc.Bravery, 10);
  player.attributes.creativity = doc.Creativity && parseInt(doc.Creativity, 10);
  player.attributes.determination = doc.Determination && parseInt(doc.Determination, 10);
  player.attributes.flair = doc.Flair && parseInt(doc.Flair, 10);
  player.attributes.influence = doc.Influence && parseInt(doc.Influence, 10);
  player.attributes.teamwork = doc.Teamwork && parseInt(doc.Teamwork, 10);
  player.attributes.work_rate = doc['Work Rate'] && parseInt(doc['Work Rate'], 10);
  
  // attributes labeled as 'physical' in game
  player.attributes.acceleration = doc.Acceleration && parseInt(doc.Acceleration, 10);
  player.attributes.agility = doc.Agility && parseInt(doc.Agility, 10);
  player.attributes.balance = doc.Balance && parseInt(doc.Balance, 10);
  player.attributes.speed = doc.Speed && parseInt(doc.Speed, 10);
  player.attributes.stamina = doc.Stamina && parseInt(doc.Stamina, 10);
  player.attributes.strength = doc.Strength && parseInt(doc.Strength, 10);
  
  // attributes labeled as 'technical' in game for forwards and defencemen
  player.attributes.checking = doc.Checking && parseInt(doc.Checking, 10);
  player.attributes.deflections = doc.Deflections && parseInt(doc.Deflections, 10);
  player.attributes.deking = doc.Deking && parseInt(doc.Deking, 10);
  player.attributes.faceoffs = doc.Faceoffs && parseInt(doc.Faceoffs, 10);
  player.attributes.hitting = doc.Hitting && parseInt(doc.Hitting, 10);
  player.attributes.off_the_puck = doc['Off The Puck'] && parseInt(doc['Off The Puck'], 10);
  player.attributes.passing = doc.Passing && parseInt(doc.Passing, 10);
  player.attributes.pokecheck = doc.Pokecheck && parseInt(doc.Pokecheck, 10);
  player.attributes.positioning = doc.Positioning && parseInt(doc.Positioning, 10);
  player.attributes.slapshot = doc.Slapshot && parseInt(doc.Slapshot, 10);
  player.attributes.stickhandling = doc.Stickhandling && parseInt(doc.Stickhandling, 10);
  player.attributes.wristshot = doc.Wristshot && parseInt(doc.Wristshot, 10);
  
  // attributes labeled as 'technical' in game for goalies
  player.attributes.blocker = doc.Blocker && parseInt(doc.Blocker, 10);
  player.attributes.glove = doc.Glove && parseInt(doc.Glove, 10);
  player.attributes.rebound_control = doc['Rebound Control'] && parseInt(doc['Rebound Control'], 10);
  player.attributes.recovery = doc.Recovery && parseInt(doc.Recovery, 10);
  player.attributes.reflexes = doc.Reflexes && parseInt(doc.Reflexes, 10);

  return player;
};


const updatePlayerDb = (csvPlayer, cb) => {
  
  try {
    FindBoid.Get(csvPlayer.id, (err, boid) => {
      
        if (boid) {
          UpdateBoid.UpdateAttributes(csvPlayer, cb);
        } else {
          AddBoid.Add(csvPlayer, () => {
            cb();
          });
        }
    });
  } catch (e) {
    console.log("ERROR", err);
  }
};

const processCsv = () => {
  
  const csv_data = fs.readFileSync(csvFilePath, "utf8");
  
  const csvCb = function (err, json) {
      if (err) throw err;
      
      async.each(json, (line, cb) => {
        let player = initPlayer(line);
        
        updatePlayerDb(setAttRatings(player), () => {
          cb()
        });
      })
  }  
  
  const options = {
    delimiter : {
        field : ';',
        array : '|',
    },
    trimHeaderFields : true,
    trimFieldValues  :  true,
  };

  converter.csv2json(csv_data, csvCb, options);
};

const run = () => {
  if (utils.isValidDate(game_date)) {
    processCsv();
  } else {
    console.log("Date Arg is Not Provided or is Invalid:", game_date);
  }
}

run();
