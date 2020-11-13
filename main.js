const express = require('express');
const sqlite3 = require('sqlite3').verbose();
// const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// app.use(cors);
app.use(bodyParser.json());

const INSERT_USER = "INSERT INTO user(email, password, nom, prenom, nb_malades, nb_malades_sec, nb_malades_click) VALUES(?,?,?,?,?,?,?)";
const INSERT_ITEM = "INSERT INTO item(price, number, production, name, image, id_user) VALUES(?,?,?,?,?,?)";
const INSERT_POWER = "INSERT INTO power(actif, name, price, coeff, item_id, image, id_user) VALUES(?,?,?,?,?,?,?)";
                    
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
app.get('/dynamic/itemByUserId/:userId', (req, res) => {
    let id = req.params.userId;

    getDynamicItemByID(id)
    .then(json => {
        res.status(200).json({json});
    })
});

/* Only get item static data by user id for Game component */
app.get('/static/itemByUserId/:userId', (req, res) => {
    let id = req.params.userId;

    getStaticItemByID(id)
    .then(userData => {
        res.status(200).json({userData});
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
/* Inscription d'un nouveau utilisateur */
app.post('/user', (req, res) => {
    let userData = req.body;

    ajouter_un_user(userData);

    verifier_inscription(userData)
    .then(user => {
        res.status(200).json(user);
    });

});


////////////////// PATCH
/* Mise à jour des données utilisateur Pour la sauvegarde */
app.patch('/user/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;

    updateUser(id,body);
    verifier_user(id)
    .then(user => {
        res.status(200).json(user);
    });
});

/* Mise à jour des items Pour la sauvegarde */
app.patch('/item/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;

    updateItem(id,body);
    verifierElement('item',id)
    .then(user => {
        res.status(200).json(user);
    });
});

/* Mise à jour des powers Pour la sauvegarde */
app.patch('/power/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;

    updatePower(id,body);
    verifierElement('power',id)
    .then(user => {
        res.status(200).json(user);
    });
});






let port = 3000;
app.listen(port, () => {
    console.log(`listent on port ${port}`);
});


//////////////FONCTIONS

////////// USER
function updateUser(id,body) {
    let UPDATE_REQUEST = 'UPDATE user SET';
    for (const attribut in body) {
        switch (attribut) {
            case 'nb_malades':
              UPDATE_REQUEST+=` nb_malades='${body.nb_malades}',`;
              break;
            case 'nb_malades_sec':
              UPDATE_REQUEST+=` nb_malades_sec = ${body.nb_malades_sec},`;
              break;
            case 'nb_malades_click':
              UPDATE_REQUEST+=` nb_malades_click = ${body.nb_malades_click},`;
              break;
            default:
              console.log(`Sorry, we are out of ${expr}.`);
          }
    }
    UPDATE_REQUEST=UPDATE_REQUEST.slice(0,-1); //supprimer la dernière virgule
    UPDATE_REQUEST+=` WHERE user.id = ${id};`;
    db.run(UPDATE_REQUEST);
}

function ajouter_un_user(userData) {
  try {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO user(email, password, nom, prenom, date_update, nb_malades, nb_malades_sec, nb_malades_click) VALUES(?,?,?,?,?,?,?,?)',[userData.email, userData.password, userData.nom, userData.prenom, Math.floor(Date.now()/1000), 0, 0, 0]); 
    });
  } catch (err) {
    throw err;
  }
}

function verifier_inscription(userData) {
    return new Promise((resolve, reject) => {
      try {
        db.get('SELECT * FROM user WHERE email=?',[userData.email] , function(err, data) {
          resolve(data);
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
function updateItem(id,body) {
    let UPDATE_REQUEST = 'UPDATE item SET';
    for (const attribut in body) {
        switch (attribut) {
            case 'price':
              UPDATE_REQUEST+=` price='${body.price}',`;
              break;
            case 'number':
              UPDATE_REQUEST+=` number = ${body.number},`;
              break;
            case 'production':
              UPDATE_REQUEST+=` production = ${body.production},`;
              break;
            default:
              console.log(`Sorry, we are out of ${expr}.`);
          }
    }
    UPDATE_REQUEST=UPDATE_REQUEST.slice(0,-1); //supprimer la dernière virgule
    UPDATE_REQUEST+=` WHERE item.id = ${id};`;
    db.run(UPDATE_REQUEST);
}
function verifierElement(type,id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM ${type} WHERE id=?`,[id] , function(err, data) {
          resolve(data);
        });
    });
}
function getDynamicItemByID(id){
    return new Promise((resolve, reject) => {
        const SELECT_ITEMS_OF_USER = `SELECT item.id, price, number, production FROM user JOIN item ON item.id_user = user.id WHERE user.id = ${id}`;

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
function getStaticItemByID(id){
    return new Promise((resolve, reject) => {
        const SELECT_ITEMS_OF_USER = `SELECT item.id, name, image FROM user JOIN item ON item.id_user = user.id WHERE user.id = ${id}`;

        db.all(SELECT_ITEMS_OF_USER, function(err,data){
            resolve(data);
        })
    });
}

////////// POWERS
function updatePower(id,body) {
    let UPDATE_REQUEST = `UPDATE power SET actif=${body.actif} WHERE power.id = ${id};`;
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