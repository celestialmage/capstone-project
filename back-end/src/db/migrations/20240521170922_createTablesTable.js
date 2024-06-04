exports.up = function (knex) {
  return knex.schema.createTable("tables", (table) => {
    table.increments("table_id").primary();
    table.string("table_name").notNullable().unique();
    table.integer("capacity").notNullable();
    table
      .integer("reservation_id")
      .references("reservation_id")
      .inTable("reservations")
      .nullable()
      .onDelete("SET NULL");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tables");
};
