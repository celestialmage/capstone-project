import React from "react";

export default function ListTables({ tables, finishReservationButton }) {
  return tables.map((table) => (
    <div className="table" key={table.table_id}>
      <h5>
        {table.table_name} - {table.capacity}
      </h5>
      <p data-table-id-status={table.table_id}>
        Status : {table.reservation_id ? "Occupied" : "Free"}
      </p>
      {table.reservation_id && (
        <button
          data-table-id-finish={table.table_id}
          onClick={() => {
            finishReservationButton(table.reservation_id);
          }}
        >
          Finish
        </button>
      )}
    </div>
  ));
}
