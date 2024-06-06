const knex = require("../db/connection");

function check(id) {
  return knex("reservations").where({ reservation_id: id }).first();
}

function create(reservation) {
  return knex("reservations").insert(reservation).returning("*");
}

function list() {
  return knex("reservations").select("*").orderBy("reservation_time");
}

function read(date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date: date })
    .whereNot({ status: "finished" })
    .orderBy("reservation_time");
}

function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

function update(reservation, id) {
  const {
    first_name,
    last_name,
    people,
    status,
    mobile_number,
    reservation_date,
    reservation_time,
  } = reservation;

  const data = {
    first_name,
    last_name,
    people,
    status,
    mobile_number,
    reservation_date,
    reservation_time,
  };

  return knex("reservations")
    .where({ reservation_id: id })
    .update(data)
    .returning("*");
}

function updateStatus(status, id) {
  return knex("reservations")
    .where({ reservation_id: id })
    .update(status, ["*"]);
}

module.exports = {
  check,
  create,
  list,
  read,
  search,
  update,
  updateStatus,
};
