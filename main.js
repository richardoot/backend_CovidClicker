'use strict;'

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const sqlite3 = require('sqlite3').verbose();

// Initialisation serveur
const app = express();

// Sécurité
app.use(cors());

// Configuration parser body
app.use(bodyParser.json());

                    
const SELECT_ALL_USER = "SELECT * FROM user;";
const SELECT_ALL_ITEM = "SELECT * FROM item;";
const SELECT_ALL_POWER = "SELECT * FROM power;";

let db = new sqlite3.Database('database_cc.db', () => {
    console.log("Connected to database...");

    db.serialize(() => {

        //Afficher la BD
        db.all(SELECT_ALL_USER,[], function(err,data){
            console.log("USERS");
            console.log(data);
        });
        db.all(SELECT_ALL_ITEM,[], function(err,data){
            console.log("ITEMS");
            console.log(data);
        });
        db.all(SELECT_ALL_POWER,[], function(err,data){
            console.log("POWERS");
            console.log(data);
        });
    });
});

/* Only get user data by id */
app.get('/', (req, res) => {
    res.status(200).json({
        message: "OK"
    });
});

/* Only get item dynamic data by user id for store */
app.get('/itemByUserId/:userId', (req, res) => {
    let id = req.params.userId;

    getItemByID(id)
    .then(json => {
        res.status(200).json({json});
    })
});

/* Only get power data by user id for ShopPower Component */
app.get('/powerByUserId/:userId', (req, res) => {
    let id = req.params.userId;

    getPowerByID(id)
    .then(json => {
        res.status(200).json({json});
    })
});

/* Get user data by id for store */
app.get('/user/:id', (req, res) => {
    let id = req.params.id;

    getUserDataByID(id)
    .then(data => {
        res.status(200).json({data});
    })
});


/* Get all users */
app.get('/user', (req, res) => {

    getAllUsers()
    .then(data => {
        res.status(200).json({data});
    })
});
/* Get all items */
app.get('/item', (req, res) => {

    getAllElement("item")
    .then(data => {
        res.status(200).json({data});
    })
});
/* Get all powers */
app.get('/power', (req, res) => {

    getAllElement("power")
    .then(data => {
        res.status(200).json({data});
    })
});

////////////////// POST
/* Login */
app.post('/login', cors(), (req, res) => {
    let userData = req.body;

    login(userData)
    .then(user => {
        res.status(200).json(user);
    })
    .catch(code => {
        res.status(code).json({msg: "interdit"});
    });

});

/* Inscription d'un nouveau utilisateur */
app.post('/user', (req, res) => {
    let userData = req.body;

    ajouter_un_user(userData)
    .then((bool) => {
        if(bool){
            verifier_inscription(userData)
            .then(user => {
                res.status(200).json(user);
            });
        }
    })
    .catch(code => {
        res.status(code).json({message: "Email déjà existant"});
    });


});


////////////////// PATCH
/* Mise à jour complète */
app.patch('/user/:id', (req, res) => {
    let id = req.params.id;
    let user = req.body;
    let items = user.items;
    let powers = user.powers;
    delete user.items;
    delete user.powers;

    updateUser(id,user);
    updateItems(items);
    updatePowers(powers);
    // res.status(200).json({msg: "OK"});

    verifier_user(id)
    .then(user => {
        verifierElement('item',id)
        .then(items => {
            user.items = items;
            verifierElement('power',id)
            .then(powers => {
                user.powers = powers;
                res.status(200).json(user);
            }) 
        });
    });
});

/* Mise à jour des données utilisateur Pour la sauvegarde */
// app.patch('/user/:id', (req, res) => {
//     let id = req.params.id;
//     let body = req.body;

//     updateUser(id,body);
//     verifier_user(id)
//     .then(user => {
//         res.status(200).json(user);
//     });
// });






let port = 3000;
app.listen(port, () => {
    console.log(`listent on port ${port}`);
});


//////////////FONCTIONS

////////// USER
function login(userData){
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user WHERE email=? AND password=?",[userData.email,userData.password], function(err,data){
            if(err){
                reject(500);
            }

            if(data){
                getItemByID(data.id)
                .then(items => {
                    data.items = items;
                    resolve(data);
                });

            } else{
                reject(401);
            }
        });
    });
}

function updateUser(id,body) {
    let UPDATE_REQUEST = 'UPDATE user SET';
    for (const attribut in body) {
        switch (attribut) {
            case 'nb_malades':
              UPDATE_REQUEST+=` nb_malades='${body.nb_malades}',`;
              break;
            case 'production_per_sec':
              UPDATE_REQUEST+=` production_per_sec = ${body.production_per_sec},`;
              break;
            case 'production_click':
              UPDATE_REQUEST+=` production_click = ${body.production_click},`;
              break;
            default:
              break;
          }
    }
    UPDATE_REQUEST=UPDATE_REQUEST.slice(0,-1); //supprimer la dernière virgule
    UPDATE_REQUEST+=` WHERE user.id = ${id};`;
    db.run(UPDATE_REQUEST);
}

function ajouter_un_user(userData) {
  try {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT * FROM user WHERE email=?',[userData.email],function(err,data){
                console.log("THE DATA");
                console.log("THE DATA is : %j",data);
                if(data){
                    reject(400);
                } else {
                    db.run('INSERT INTO user(email, password, nom, prenom, date_update, nb_malades, production_per_sec, production_click) VALUES(?,?,?,?,?,?,?,?)',[userData.email, userData.password, userData.nom, userData.prenom, Math.floor(Date.now()/1000), 0, 0, 1000]); 
                    db.get('SELECT * FROM user WHERE email=?',[userData.email],function(err,data){
                        db.run('INSERT INTO item(price, number, production, name, image, id_user) VALUES(?,?,?,?,?,?)',[10,     0,      0.5,    "Pangolin"          ,"pangolin-item.png"   ,data.id]);
                        db.run('INSERT INTO item(price, number, production, name, image, id_user) VALUES(?,?,?,?,?,?)',[100,    0,      3,      "Test défaillant"   ,"test-tube.png"       ,data.id]);
                        db.run('INSERT INTO item(price, number, production, name, image, id_user) VALUES(?,?,?,?,?,?)',[1000,   0,      6,      "Cluster"           ,"cluster.png"         ,data.id]);
                        db.run('INSERT INTO item(price, number, production, name, image, id_user) VALUES(?,?,?,?,?,?)',[5000,   0,      12,     "Fêtes de Bayonne"  ,"party.png"           ,data.id]);
                        
                        db.run('INSERT INTO power(actif, name, price, coeff, item_id, image, id_user) VALUES(?,?,?,?,?,?,?)',[false,   "Double Clicker",                        100,    2,   null,  "img.jpg",  data.id]);
                        // db.run('INSERT INTO power(actif, name, price, coeff, item_id, image, id_user) VALUES(?,?,?,?,?,?,?)',[false,   "Double Production Pangolin",           1000,    2,   0,  ,  "img.jpg",  data.id]);
                        // db.run('INSERT INTO power(actif, name, price, coeff, item_id, image, id_user) VALUES(?,?,?,?,?,?,?)',[false,   "Double Production des faux tests",     5000,    2,   1,  ,  "img.jpg",  data.id]);
                        // db.run('INSERT INTO power(actif, name, price, coeff, item_id, image, id_user) VALUES(?,?,?,?,?,?,?)',[false,   "Double Production Cluster",            10000,   2,   2,  ,  "img.jpg",  data.id]);
                        // db.run('INSERT INTO power(actif, name, price, coeff, item_id, image, id_user) VALUES(?,?,?,?,?,?,?)',[false,   "Double Alcool Fêtes de Bayonne",       50000,   2,   3,  ,  "img.jpg",  data.id]);
                        resolve(true);
                    });
                }
            });
        });
    });
  } catch (err) {
    throw err;
  }
}

function verifier_inscription(userData) {
    return new Promise((resolve, reject) => {
      try {
        db.get('SELECT * FROM user WHERE email=?',[userData.email] , function(err, data) {
            let SELECT_ITEMS_OF_USER = `SELECT * FROM user JOIN item ON item.id_user = user.id WHERE user.id = ${data.id}`;
            db.all(SELECT_ITEMS_OF_USER, function(err,items){
                data.items = items;
                resolve(data);
            })
        })
        
      } catch (err) {
        throw err;
      }
    });
}
function verifier_user(id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM user WHERE id=?',[id] , function(err, data) {
          resolve(data);
        });
    });
}
function getAllUsers(){
    return new Promise((resolve, reject) => {
        const SELECT_USER_DATA = `SELECT * FROM user`;

        db.all(SELECT_USER_DATA, function(err,data){
            resolve(data);
        })
    });
}

function getUserDataByID(id){
    return new Promise((resolve, reject) => {
        const SELECT_USER_DATA = `SELECT * FROM user WHERE user.id = ${id}`;

        db.get(SELECT_USER_DATA, function(err,data){
            resolve(data);
        })
    });
}

////////// ITEMS
function updateItems(items) {
    items.forEach(item => {
        updateItem(item);
    })
}

function updateItem(item) {
    let UPDATE_REQUEST = 'UPDATE item SET';
    for (const attribut in item) {
        switch (attribut) {
            case 'price':
              UPDATE_REQUEST+=` price='${item.price}',`;
              break;
            case 'number':
              UPDATE_REQUEST+=` number = ${item.number},`;
              break;
            case 'production':
              UPDATE_REQUEST+=` production = ${item.production},`;
              break;
            default:
              break;
          }
    }
    UPDATE_REQUEST=UPDATE_REQUEST.slice(0,-1); //supprimer la dernière virgule
    UPDATE_REQUEST+=` WHERE item.id = ${item.id};`;
    db.run(UPDATE_REQUEST);
}
function verifierElement(type,id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM ${type} WHERE user_id=?`,[id] , function(err, data) {
          resolve(data);
        });
    });
}
function getItemByID(id){
    return new Promise((resolve, reject) => {
        const SELECT_ITEMS_OF_USER = `SELECT * FROM user JOIN item ON item.id_user = user.id WHERE user.id = ${id}`;

        db.all(SELECT_ITEMS_OF_USER, function(err,data){
            resolve(data);
        })
    });
}
function getAllElement(type){
    return new Promise((resolve, reject) => {
        const SELECT_ELEMENTS = `SELECT * FROM ${type}`;

        db.all(SELECT_ELEMENTS, function(err,data){
            resolve(data);
        })
    });
}


////////// POWERS
function updatePowers(powers) {
    powers.forEach(power => {
        updatePower(power);
    })
}
function updatePower(power) {
    let UPDATE_REQUEST = `UPDATE power SET actif=${power.actif} WHERE power.id = ${power.id};`;
    db.run(UPDATE_REQUEST);
}
function getPowerByID(id){
    return new Promise((resolve, reject) => {
        const SELECT_POWER_OF_USER = `SELECT power.id, power.name, power.price, power.coeff, power.item_id, power.actif FROM user JOIN power ON power.id_user = user.id WHERE user.id = ${id}`;

        db.all(SELECT_POWER_OF_USER, function(err,data){
            resolve(data);
        })
    });
}