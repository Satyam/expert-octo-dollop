BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Consigna" (
	"id"	INTEGER,
	"fecha"	text,
	"idDistribuidor"	text,
	"idVendedor"	text,
	"entregados"	integer,
	"porcentaje"	float,
	"vendidos"	integer,
	"devueltos"	integer,
	"cobrado"	float,
	"iva"	boolean,
	"comentarios"	text,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("idVendedor") REFERENCES "Vendedores"("id"),
	FOREIGN KEY("idDistribuidor") REFERENCES "Distribuidores"("id")
);
CREATE TABLE IF NOT EXISTS "Distribuidores" (
	"id"	text,
	"nombre"	text NOT NULL,
	"localidad"	text,
	"contacto"	text,
	"telefono"	text,
	"email"	text,
	"direccion"	text,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "Salidas" (
	"id"	integer,
	"fecha"	text,
	"concepto"	text,
	"importe"	float,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Users" (
	"id"	text NOT NULL UNIQUE,
	"nombre"	text NOT NULL,
	"email"	text NOT NULL,
	"password"	TEXT,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "Vendedores" (
	"id"	text NOT NULL UNIQUE,
	"nombre"	text NOT NULL,
	"email"	text,
	PRIMARY KEY("id")
);
CREATE TABLE IF NOT EXISTS "Ventas" (
	"id"	INTEGER,
	"concepto"	text,
	"fecha"	text,
	"idVendedor"	text,
	"cantidad"	integer,
	"precioUnitario"	float,
	"iva"	boolean,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("idVendedor") REFERENCES "Vendedores"("id")
);
INSERT INTO "Consigna" VALUES (1,'2018-01-09T23:00:00.000Z','tequiero','ro',10,0.3,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (2,'2018-06-26T22:00:00.000Z','tequiero','ro',0,0.0,10,0,84.0,0,'');
INSERT INTO "Consigna" VALUES (3,'2018-06-26T22:00:00.000Z','tequiero','rora',10,0.0,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (4,'2018-09-16T22:00:00.000Z','tequiero','rora',0,0.0,2,0,0.0,0,'Pendiente de facturar');
INSERT INTO "Consigna" VALUES (5,'2018-03-05T23:00:00.000Z','alibri','rora',6,0.35,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (6,'2018-05-16T22:00:00.000Z','alibri','rora',0,0.0,6,0,46.81,1,'');
INSERT INTO "Consigna" VALUES (7,'2018-06-05T22:00:00.000Z','alibri','rora',10,0.0,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (8,'2018-09-16T22:00:00.000Z','alibri','rora',0,0.0,1,0,0.0,0,'Pendiente de facturar');
INSERT INTO "Consigna" VALUES (9,'2018-09-05T22:00:00.000Z','losangeles','rora',4,0.3,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (10,'2018-09-16T22:00:00.000Z','losangeles','rora',0,0.0,4,0,33.6,0,'');
INSERT INTO "Consigna" VALUES (11,'2018-09-18T22:00:00.000Z','losangeles','rora',4,0.0,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (12,'2018-06-14T22:00:00.000Z','lluvia','rora',10,0.35,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (13,'2018-09-18T22:00:00.000Z','lluvia','rora',0,0.0,4,0,0.0,0,'Pendiente de facturar');
INSERT INTO "Consigna" VALUES (14,'2018-06-14T22:00:00.000Z','swinton','rora',3,0.35,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (15,'2018-02-07T23:00:00.000Z','dharani','ra',4,0.25,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (16,'2018-07-16T22:00:00.000Z','biositges','ro',3,0.0,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (17,'2018-07-16T22:00:00.000Z','biositges','ro',0,0.0,1,0,10.0,0,'');
INSERT INTO "Consigna" VALUES (18,'2018-07-16T22:00:00.000Z','biositges','ro',1,0.0,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (19,'2018-08-21T22:00:00.000Z','gabalda','ra',5,0.3,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (20,'2018-09-05T22:00:00.000Z','gabalda','ra',0,0.0,3,0,0.0,0,'Pendiente de facturar');
INSERT INTO "Consigna" VALUES (21,'2018-09-05T22:00:00.000Z','gabalda','ra',3,0.0,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (22,'2018-09-05T22:00:00.000Z','mulassa','ro',6,0.3,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (23,'2018-05-08T22:00:00.000Z','simplecat','rora',0,0.35,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (24,'2018-05-08T22:00:00.000Z','simplecat','rora',0,0.0,30,0,230.14,1,'');
INSERT INTO "Consigna" VALUES (25,'2017-12-09T23:00:00.000Z','alfamar','ro',4,0.0,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (26,'2018-03-20T23:00:00.000Z','alfamar','ro',0,0.0,2,0,20.0,0,'');
INSERT INTO "Consigna" VALUES (27,'2018-09-18T22:00:00.000Z','alfamar','ro',0,0.0,1,0,10.0,0,'');
INSERT INTO "Consigna" VALUES (28,'2018-10-03T22:00:00.000Z','alfamar','ro',0,0.0,1,0,10.0,0,'');
INSERT INTO "Consigna" VALUES (29,'2018-10-03T22:00:00.000Z','alfamar','ro',3,0.0,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (30,'2018-09-05T22:00:00.000Z','cambalache','ro',20,0.5,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (31,'2018-05-08T22:00:00.000Z','olivia','ro',55,0.0,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (32,'2018-05-09T22:00:00.000Z','olivia','ro',0,0.0,14,0,112.0,0,'');
INSERT INTO "Consigna" VALUES (33,'2018-10-03T22:00:00.000Z','encarna','ro',10,0.25,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (34,'2018-10-03T22:00:00.000Z','tatiana','ro',20,0.25,5,0,0.0,0,'Pendientes de cobrar');
INSERT INTO "Consigna" VALUES (35,'2018-10-05T22:00:00.000Z','clara','ro',10,0.25,10,0,90.0,0,'Cta Raed 7/11 Raed debe a caja');
INSERT INTO "Consigna" VALUES (36,'2018-03-11T23:00:00.000Z','ansara','ro',1,0.17,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (37,'2018-10-21T22:00:00.000Z','maya','ro',5,0.25,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (38,'2018-11-01T23:00:00.000Z','beatriz','ro',10,0.25,0,0,0.0,0,'');
INSERT INTO "Consigna" VALUES (39,'2018-11-13T23:00:00.000Z','olympia','ra',4,0.33,0,0,0.0,0,'');
INSERT INTO "Distribuidores" VALUES ('cambalache','Asociación Cambalache','Oviedo','Germán','985 20 22 92','cambalache@localcambalache.org','c/Martínez Vigil 30, bajo
33010 Oviedo - Asturias');
INSERT INTO "Distribuidores" VALUES ('swinton','Swinton & Grant','Madrid','Goyo  ','659 479 421','aloha@swintonandgrant.com','Factura: Bit Flow Studio S. L. 
c/ Miguel Servet 21 - B 85849065');
INSERT INTO "Distribuidores" VALUES ('lluvia','El Olor de la Lluvia','Madrid','Raquel y Alfonso ','91 138 9054','libreria@elolordelalluvia','c/ de las Maldonadas 6  - E 87413407');
INSERT INTO "Distribuidores" VALUES ('olivia','Ed Olivia ','Buenos Aires','Adrián Scotto','0054 9 11 3202 6709','info@editorialolivia.com','Esmeralda 980 1º B 
C.A.B.A. (C1007ABJ) Argentina');
INSERT INTO "Distribuidores" VALUES ('alibri','Alibri','Barcelona','Andrés ','93 317 0578','','Carrer de Balmes, 26  - Barcelona');
INSERT INTO "Distribuidores" VALUES ('tequiero','Té Quiero','Barcelona','Iris / Chelo  ','93 284 6000','libreríatequiero@yahoo.es','Carrer de Torrijos, 9 - Barcelona
NIF 38062310R');
INSERT INTO "Distribuidores" VALUES ('losangeles','Librería Los Ángeles','Barcelona','María del Pilar','932 18 89 86','Travessera de Gràcia, 157  ','');
INSERT INTO "Distribuidores" VALUES ('dharani','Dharani','Sitges',' ','','','');
INSERT INTO "Distribuidores" VALUES ('biositges','BioSitges','Sitges','','','','');
INSERT INTO "Distribuidores" VALUES ('alfamar','Alfamar 4 libros','Barcelona','Emilio  ','93 318 8453','','Carrer de Roger de Llúria, 46');
INSERT INTO "Distribuidores" VALUES ('simplecat','Simple.cat','Barcelona','','656 966 373','enric@simple.cat',' C/Joan Ramon Benaprès, 15, 1-1 - 08870 SITGES
NIF: 35.111.953S ');
INSERT INTO "Distribuidores" VALUES ('gabalda','Gabaldà','Sant Pere','','93 896 02 51','llibreria.gabalda@gmail.com','Plaça de la Vila 8, Sant Pere de Ribes
CIF/NIF 77081261G');
INSERT INTO "Distribuidores" VALUES ('mulassa','La Mulassa','Vilanova i la Geltrú','Berta Chivite','93 814 48 46','info@llibrerialamulassa.cat
presentación: anna@llibrerialamulassa.cat','Rambla Principal 2, Vilanova i la Geltrú
B62197165');
INSERT INTO "Distribuidores" VALUES ('tatiana','Tatiana Sibilia','Barcelona','','671 843 924','','');
INSERT INTO "Distribuidores" VALUES ('encarna','Encarna Martínez','Barcelona','Encarna Martínez','607 112 743','','');
INSERT INTO "Distribuidores" VALUES ('clara','Clara Rodriguez','Madrid','Clara Rodriguez','636 613 886','','Calle Francisco Rabal 2, 2-C
28901 Getafe Madrid');
INSERT INTO "Distribuidores" VALUES ('ansara','Ansara','','','','','');
INSERT INTO "Distribuidores" VALUES ('maya','La Mano de Maya','Sitges','Laia','93 510 48 89','info@lamanodemaya.com','Carrer de Sant Josep, 36-38 MEXCALI, S.L. B66529702');
INSERT INTO "Distribuidores" VALUES ('beatriz','Beatriz Oliva','Asturias','Beatriz','696 512 564','bogrupos@gmail.com','Avenida María Faes 15 Siero 33519  Asturias');
INSERT INTO "Distribuidores" VALUES ('olympia','Olympia','','','616 335 060','','');
INSERT INTO "Distribuidores" VALUES ('ckcxi8ls70000fzqpd4w897jm','Satyam','Sitges','Daniel Barreiro','+34615672205','satyam@satyam.com.ar','Miquel Ribas i Llopis 6
5-1');
INSERT INTO "Salidas" VALUES (1,'2018-02-15T23:00:00.000Z','Gastos Sala Flores ',116.0);
INSERT INTO "Salidas" VALUES (2,'2018-03-08T23:00:00.000Z','Gastos envío Bs As Adrián ',76.0);
INSERT INTO "Salidas" VALUES (3,'2018-04-05T22:00:00.000Z','Gastos envío Bs As Eusi ',76.0);
INSERT INTO "Salidas" VALUES (4,'2018-05-03T22:00:00.000Z','Reintegro 50% Raed y 50%Roxy',1000.0);
INSERT INTO "Salidas" VALUES (5,'2018-06-13T22:00:00.000Z','Madrid Renfe',344.6);
INSERT INTO "Salidas" VALUES (6,'2018-06-13T22:00:00.000Z','Madrid Hotel',58.9);
INSERT INTO "Salidas" VALUES (7,'2018-06-13T22:00:00.000Z','Madrid Sala',36.3);
INSERT INTO "Salidas" VALUES (8,'2018-06-13T22:00:00.000Z','Madrid Clara',72.5);
INSERT INTO "Salidas" VALUES (9,'2018-06-13T22:00:00.000Z','Madrid viáticos comida ambos',114.85);
INSERT INTO "Salidas" VALUES (10,'2018-09-17T22:00:00.000Z','La Bolsera',9.6);
INSERT INTO "Salidas" VALUES (11,'2018-08-28T22:00:00.000Z','Correo Costa Rica',13.75);
INSERT INTO "Salidas" VALUES (12,'2018-08-28T22:00:00.000Z','Comisión Pay Pal',1.32);
INSERT INTO "Salidas" VALUES (13,'2018-08-27T22:00:00.000Z','Bonaire Eco de Sitges',5.25);
INSERT INTO "Salidas" VALUES (14,'2018-08-26T22:00:00.000Z','Correo Cambalache',10.26);
INSERT INTO "Salidas" VALUES (15,'2018-10-05T22:00:00.000Z','Correo Madrid Clara y amigo Raed',4.16);
INSERT INTO "Salidas" VALUES (16,'2018-10-11T22:00:00.000Z','Comisión Raed de 180 €',45.0);
INSERT INTO "Salidas" VALUES (17,'2018-10-11T22:00:00.000Z','Comisión Roxy de 1822 €',455.5);
INSERT INTO "Salidas" VALUES (18,'2018-10-11T22:00:00.000Z','Reintegro 50% Raed y 50%Roxy',400.0);
INSERT INTO "Salidas" VALUES (19,'2018-10-18T22:00:00.000Z','Correo Miki y Arnina',27.5);
INSERT INTO "Salidas" VALUES (20,'2018-11-01T23:00:00.000Z','Correo Beatriz Asturias 10 libros',3.55);
INSERT INTO "Salidas" VALUES (21,'2018-11-11T23:00:00.000Z','Correo Costa Rica Bis',13.75);
INSERT INTO "Users" VALUES ('ro','Roxana Cabut','RoxanaCabut@gmail.com','d4f16e15b5c329da8b3445b3647eb7efc630b5469546cac40f2bbe5e9b72f0e7');
INSERT INTO "Users" VALUES ('ra','Raed El Younsi','reyezuelo@gmail.com','6b3927a0cee10a1520e8cf76e19a38e4d3cac3e3883192e55f253afc74081e2f');
INSERT INTO "Users" VALUES ('pepe','Pepe','pepe@correo.com','8e0a753667e6f20fb5b39055371ac796ede848ecc804b0da0b4038469ad040db');
INSERT INTO "Vendedores" VALUES ('ro','Roxana Cabut','RoxanaCabut@gmail.com');
INSERT INTO "Vendedores" VALUES ('ra','Raed El Younsi','reyezuelo@gmail.com');
INSERT INTO "Vendedores" VALUES ('rora','Roxana & Raed','reyezuelo@gmail.com;RoxanaCabut@gmail.com');
INSERT INTO "Vendedores" VALUES ('ckwhyq1qb000092qpb9114f1j','pepe','pepe@correo.com');
INSERT INTO "Vendedores" VALUES ('ckwhyvs23000192qp16udgc7g','pepecito','acme@correo.com');
INSERT INTO "Ventas" VALUES (1,'Cercedilla','2018-02-03T23:00:00.000Z','rora',21,10.0,NULL);
INSERT INTO "Ventas" VALUES (2,'Cercedilla','2018-02-03T23:00:00.000Z','rora',5,0.0,NULL);
INSERT INTO "Ventas" VALUES (3,'Sala Flores','2018-02-15T23:00:00.000Z','rora',24,10.0,NULL);
INSERT INTO "Ventas" VALUES (4,'Sala Flores','2018-02-15T23:00:00.000Z','rora',2,0.0,NULL);
INSERT INTO "Ventas" VALUES (5,'Sant Jordi','2018-04-22T22:00:00.000Z','rora',6,10.0,NULL);
INSERT INTO "Ventas" VALUES (6,'Sant Jordi','2018-04-22T22:00:00.000Z','rora',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (7,'Madrid ','2018-06-13T22:00:00.000Z','rora',10,10.0,NULL);
INSERT INTO "Ventas" VALUES (8,'Manchón','2018-06-26T22:00:00.000Z','rora',6,10.0,NULL);
INSERT INTO "Ventas" VALUES (9,'Roxana desde 17/12/2017','2018-09-30T22:00:00.000Z','ro',180,10.0,NULL);
INSERT INTO "Ventas" VALUES (10,'Roxana desde 17/12/2017','2018-09-30T22:00:00.000Z','ro',1,12.0,NULL);
INSERT INTO "Ventas" VALUES (11,'Roxana desde 17/12/2017','2018-09-30T22:00:00.000Z','ro',47,0.0,NULL);
INSERT INTO "Ventas" VALUES (12,'Raed desde 17/12/2017','2018-09-30T22:00:00.000Z','ra',7,10.0,NULL);
INSERT INTO "Ventas" VALUES (13,'Raed desde 17/12/2017','2018-09-30T22:00:00.000Z','ra',20,5.0,NULL);
INSERT INTO "Ventas" VALUES (14,'Raed desde 17/12/2017','2018-09-30T22:00:00.000Z','ra',28,0.0,NULL);
INSERT INTO "Ventas" VALUES (15,'Raed y Roxana desde 17/12/2017','2018-09-30T22:00:00.000Z','rora',26,0.0,NULL);
INSERT INTO "Ventas" VALUES (16,'Depósito Legal','2018-09-30T22:00:00.000Z','rora',4,0.0,NULL);
INSERT INTO "Ventas" VALUES (17,'Sol (Río Abirto masajes)','2018-10-03T22:00:00.000Z','ro',1,10.0,NULL);
INSERT INTO "Ventas" VALUES (18,'Carlos Hornstein','2018-10-02T22:00:00.000Z','ra',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (19,'Roxy  para ella','2018-10-07T22:00:00.000Z','ro',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (20,'Raed para él','2018-10-07T22:00:00.000Z','ra',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (21,'Raed','2018-10-11T22:00:00.000Z','ra',1,10.0,NULL);
INSERT INTO "Ventas" VALUES (22,'Manoli','2018-10-19T22:00:00.000Z','ro',1,12.0,NULL);
INSERT INTO "Ventas" VALUES (23,'Laia (La Mano de Maya)','2018-10-21T22:00:00.000Z','ro',1,10.0,NULL);
INSERT INTO "Ventas" VALUES (24,'Coco','2018-10-21T22:00:00.000Z','ro',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (25,'Biblioteca Rusiñol de Sitges','2018-10-24T22:00:00.000Z','rora',4,10.0,NULL);
INSERT INTO "Ventas" VALUES (26,'Olga Costa Rica (devuelto)','2018-08-28T22:00:00.000Z','rora',1,22.0,NULL);
INSERT INTO "Ventas" VALUES (27,'Jon Santacana','2018-11-01T23:00:00.000Z','ra',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (28,'Jaime Amselem (correo Madrid)','2018-10-05T22:00:00.000Z','ra',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (29,'Arnina y Miki Kashtan','2018-10-18T22:00:00.000Z','rora',2,0.0,NULL);
INSERT INTO "Ventas" VALUES (30,'Machi (yoga compi)','2018-11-05T23:00:00.000Z','ro',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (31,'Xavi López','2018-11-06T23:00:00.000Z','ra',1,10.0,NULL);
INSERT INTO "Ventas" VALUES (32,'Jon del Vas','2018-11-08T23:00:00.000Z','rora',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (33,'Paola (curso Jon)','2018-11-09T23:00:00.000Z','rora',1,10.0,NULL);
INSERT INTO "Ventas" VALUES (34,'Jonathan Tepper','2018-11-11T23:00:00.000Z','ra',1,0.0,NULL);
INSERT INTO "Ventas" VALUES (35,'Devuelto de Costa Rica','2018-10-29T23:00:00.000Z','rora',-1,0.0,NULL);
INSERT INTO "Ventas" VALUES (36,'Olga 13.75 Costa Rica Bis ','2018-11-11T23:00:00.000Z','rora',1,13.75,NULL);
INSERT INTO "Ventas" VALUES (37,'Ángela España Borja (Murcia)','2018-11-13T23:00:00.000Z','ro',2,13.0,NULL);
CREATE UNIQUE INDEX IF NOT EXISTS "distribuidorNombre" ON "Distribuidores" (
	"nombre"
);
CREATE UNIQUE INDEX IF NOT EXISTS "userNombre" ON "Users" (
	"nombre"
);
CREATE UNIQUE INDEX IF NOT EXISTS "userEmail" ON "Users" (
	"email"
);
CREATE UNIQUE INDEX IF NOT EXISTS "vendedorNombre" ON "Vendedores" (
	"nombre"
);
CREATE UNIQUE INDEX IF NOT EXISTS "vendedorEmail" ON "Vendedores" (
	"email"
);
COMMIT;
