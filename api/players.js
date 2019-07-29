
const axios = require('axios');

const _ = require('lodash');
// const models = require('../models');
// const utils = require('../lib/utils').utils;

// var processFilters = function (filter) {
//   const filters = filter.split("|");
//   const filterObj ={};
// 
//   for (var i = 0; i < filters.length; i++) {
//     const filter = filters[i];
//     const match = filter.match(/(.*):(.*)/);
// 
//     filterObj[match[1]] = match[2];
//   }
// 
//   console.log("FILTERS: ", filterObj)
//   return filterObj;
// };

exports.players = {
  // getAll: (request, reply) => {
  //   const params = Object.assign({}, request.query);
  //   const limit = params && params.limit ? parseInt(params.limit, 10) : 50;
  //   const filter = params.filter ? processFilters(params.filter) : {};
  // 
  //   models.player.findAll({
  //       where: filter,
  //       limit: limit,
  //       include: [{ model: models.stat }]
  //     })
  //     .then((players) => {
  //       reply(players).code(200);
  //     });
  // },
  // 
  // getOne: (request, reply) => {
  //   models.player.find({
  //       where: { id: request.params.id },
  //       include: [{ model: models.stat }],
  //       limit: 1
  //     })
  //     .then((player) => {
  //       reply(player).code(200);
  //     });
  // },

  // cliCreate: (playerData, cb) => {
  //   models.player.create(playerData).then((player) => {
  //     playerData.stats.playerId = player.id;
  //     models.stat.create(playerData.stats).then(cb);
  //   });
  // },
  // 
  // cliUpdate: (csvPlayerData, dbPlayer, cb) => {
  //   csvPlayerData.stats.playerId = csvPlayerData.id;
  //   models.stat.create(csvPlayerData.stats).then(cb);
  // },
  // 
  // cliGetById: (id, cb) => {
  //   models.player.findOne({
  //       where: { id: id },
  //       include: [{ model: models.stat }]
  //     })
  //     .then((player) => {
  //       cb(null, player);
  //     });
  // }
  
  create: (playerData, cb) => {
    const url = 'http://localhost:10010/boids';
    
    const tempShape = {
      name: playerData.name,
      dob: playerData.date_of_birth,
      nation: playerData.nation,
    };
    
    // console.log(tempShape);
    // var request = new Request(url, {
    //     method: 'POST', 
    //     body: tempShape, 
    //     headers: new Headers()
    // });
    // 
    // let fetchData = { 
    //   method: 'POST', 
    //   body: tempShape,
    //   headers: new Headers()
    // }
  
  
    axios.post(url, tempShape)
    .then((response) => {
      console.log("status", response.status);
      cb();
    })
    .catch((err) => {
      console.log('error...', err);
      cb();
    });
  
  
  // fetch(url, {
  // 	method: 'post',
  // 	body: tempShape,
  // }).then(() => {
  //   console.log("Player Created.")
  //   cb();
  // })  

  
  
  
    
    // fetch(url, fetchData)
    // .then(() => {
    //   console.log("Player Created.")
    //   cb();
    //     // Handle response we get from the API
    // })  
    
  },
  
  getById: (id, cb) => {
    
    const url = `http://localhost:10010/boid/${id}`
    
    fetch(url)
    .then((player) => {
      console.log("Found Player", player)
      cb(null, player);
    })
    .catch((err) => {
      console.log("FETCH ERROR", err);
    });
  }
}