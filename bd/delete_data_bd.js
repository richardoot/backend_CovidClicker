const sqlite3 = require('sqlite3').verbose();

const SELECT_ALL_USER = "SELECT * FROM user;";
const SELECT_ALL_ITEM = "SELECT * FROM item;";
const SELECT_ALL_POWER = "SELECT * FROM power;";

//Connexion à la BD
const db = new sqlite3.Database('database_cc.db', (err) => {
    if(err){
      return console.error(err);
    }

    console.log("Connecté à la base de données SQlite phe.");   
});

//Requêtes SQL
db.serialize(() => {
    
    //Afficher les données Avant la suppression de données
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

    //Supprimer les données
    db.run(`DELETE FROM user`, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Suppression des données de la table user");
        console.log(`Row(s) deleted ${this.changes}`);
    });
    db.run(`DELETE FROM item`, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Suppression des données de la table item");
        console.log(`Row(s) deleted ${this.changes}`);
    });
    db.run(`DELETE FROM power`, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Suppression des données de la table power");
        console.log(`Row(s) deleted ${this.changes}`);
    });

    //Afficher la table vide
    
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

//Fermeture de la BD
db.close();

 
