const P = require("pino");
const knex = require("../db/connection");

function create(table) {
  return knex("tables").insert(table).returning("*");
}

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

function read(tableId) {
  return knex("tables").where({ table_id: tableId }).first();
}

function readReservation(resId) {
  return knex("reservations").where({ reservation_id: resId }).first();
}

function seat(resId, tableId) {
  return knex.transaction((trx) => {
    return trx("reservations")
      .where({ reservation_id: resId })
      .update({ status: "seated" })
      .then(() => {
        return trx("tables")
          .where({ table_id: tableId })
          .update({ reservation_id: resId }, ["*"]);
      });
  });
}

function destroy(tableId, resId) {
  return knex.transaction((trx) => {
    return trx("reservations")
      .where({ reservation_id: resId })
      .update({ status: "finished" })
      .then(() => {
        return trx("tables")
          .where({ table_id: tableId })
          .update({ reservation_id: null }, ["*"]);
      });
  });
}

module.exports = {
  create,
  delete: destroy,
  list,
  read,
  readReservation,
  seat,
};
