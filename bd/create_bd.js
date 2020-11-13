const sqlite3 = require('sqlite3').verbose();
//CONSTANTES
const CREAT_USER = `CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  email TEXT, 
  password TEXT, 
  nom TEXT,
  prenom TEXT,
  date_update INTEGER,
  nb_malades INTEGER,
  nb_malades_sec INTEGER,
  nb_malades_click INTEGER);`;

const CREAT_ITEM = `CREATE TABLE IF NOT EXISTS item (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  price INTEGER, 
  number INTEGER, 
  production INTEGER,
  name TEXT,
  image TEXT,
  id_user INTEGER,
  FOREIGN KEY (id_user) REFERENCES user(id));`;

const CREAT_POWER = `CREATE TABLE IF NOT EXISTS power (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actif BOOLEAN, 
  name TEXT,
  price INTEGER, 
  coeff INTEGER,
  item_id INTEGER, 
  image TEXT,
  id_user INTEGER,
  FOREIGN KEY (id_user) REFERENCES user(id));`;

const INSERT_USER = "INSERT INTO user(email, password, nom, prenom, date_update, nb_malades, nb_malades_sec, nb_malades_click) VALUES(?,?,?,?,?,?,?,?)";
const INSERT_ITEM = "INSERT INTO item(price, number, production, name, image, id_user) VALUES(?,?,?,?,?,?)";
const INSERT_POWER = "INSERT INTO power(actif, name, price, coeff, item_id, image, id_user) VALUES(?,?,?,?,?,?,?)";
  
const SELECT_ALL_USER = "SELECT * FROM user;";
const SELECT_ALL_ITEM = "SELECT * FROM item;";
const SELECT_ALL_POWER = "SELECT * FROM power;";


//Connexion à la BD
const db = new sqlite3.Database('database_cc.db', (err) => {
  if(err){
      return console.error(err);
    }
    console.log("Connecté à la base de données SQlite phe\n");   
});

//Requêtes SQL
db.serialize(() => {
    
  //Activer les foreign keys
  db.get("PRAGMA foreign_keys = ON");
  db.get("PRAGMA foreign_keys;",function(err,data){
    console.log(data);
  });

  //Création
  db.run(CREAT_USER);
  db.run(CREAT_ITEM);
  db.run(CREAT_POWER);


  //Début du peuplement de la BD
  db.run(INSERT_USER,["richardbichard@gmail.com","dfDdBss083ddDegJ3D8sdfE4","Boilley","Richard",Math.floor(Date.now()/1000),1,172,13]);
  db.run(INSERT_ITEM,[1000,14,12,"Fêtes de Bayonne","pangolin.png",1]);
  db.run(INSERT_POWER,[false,"Dubler Click",100,0.5,13,"pangolin-power.png",1]);

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

//Fermeture de la BD
db.close();