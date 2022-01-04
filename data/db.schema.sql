BEGIN TRANSACTION;
DROP TABLE IF EXISTS "Consigna";
CREATE TABLE "Consigna" (
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
DROP TABLE IF EXISTS "Distribuidores";
CREATE TABLE "Distribuidores" (
	"id"	text,
	"nombre"	text NOT NULL,
	"localidad"	text,
	"contacto"	text,
	"telefono"	text,
	"email"	text,
	"direccion"	text,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "Salidas";
CREATE TABLE "Salidas" (
	"id"	integer,
	"fecha"	text,
	"concepto"	text,
	"importe"	float,
	PRIMARY KEY("id" AUTOINCREMENT)
);
DROP TABLE IF EXISTS "Users";
CREATE TABLE "Users" (
	"id"	text NOT NULL UNIQUE,
	"nombre"	text NOT NULL,
	"email"	text NOT NULL,
	"password"	TEXT,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "Vendedores";
CREATE TABLE "Vendedores" (
	"id"	text NOT NULL UNIQUE,
	"nombre"	text NOT NULL,
	"email"	text,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "Ventas";
CREATE TABLE "Ventas" (
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
DROP INDEX IF EXISTS "distribuidorNombre";
CREATE UNIQUE INDEX "distribuidorNombre" ON "Distribuidores" (
	"nombre"
);
DROP INDEX IF EXISTS "userEmail";
CREATE UNIQUE INDEX "userEmail" ON "Users" (
	"email"
);
DROP INDEX IF EXISTS "userNombre";
CREATE UNIQUE INDEX "userNombre" ON "Users" (
	"nombre"
);
DROP INDEX IF EXISTS "vendedorEmail";
CREATE UNIQUE INDEX "vendedorEmail" ON "Vendedores" (
	"email"
);
DROP INDEX IF EXISTS "vendedorNombre";
CREATE UNIQUE INDEX "vendedorNombre" ON "Vendedores" (
	"nombre"
);
COMMIT;
