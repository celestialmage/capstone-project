import React, { useState, useEffect } from "react";
import { listTables, readReservation, seatReservation } from "../utils/api";
import { useParams, useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import "./Form.css";

export default function SeatForm() {
  const [formData, setFormData] = useState({ table_id: "" });
  const [reservation, setReservation] = useState({});
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useHistory();
  const parameters = useParams();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await seatReservation(formData.table_id, reservation.reservation_id);

      setError(null);
      navigate.push("/dashboard");
    } catch (error) {
      setError(error);
    }
  };

  const handleChange = (event) => {
    setFormData({ table_id: Number(event.target.value) });
  };

  useEffect(() => {
    async function loadInfo() {
      const { id } = parameters;
      const reservation = await readReservation(id);
      setReservation(reservation);

      const tables = await listTables();
      setTables(tables);
    }

    loadInfo();
  }, [parameters]);

  return (
    <div>
      <h1>Reservation Information</h1>
      <p>
        Reservation Name :{" "}
        {reservation.first_name + " " + reservation.last_name}
      </p>
      <p>Reservation Date : {reservation.reservation_date}</p>
      <p>Reservation Time : {reservation.reservation_time}</p>
      <p>Reservation Phone Number : {reservation.mobile_number}</p>
      <p>Reservation Count : {reservation.people}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="status">
          Seat at Table :
          <select
            name="table_id"
            id="status"
            type="select"
            onChange={handleChange}
            defaultValue=""
          >
            <option key="default" value="" disabled>
              -- Select a table --
            </option>
            {tables.length > 0 &&
              tables
                .filter((table) => !table.reservation_id)
                .map((table) => (
                  <option key={table.table_id} value={table.table_id}>
                    {table.table_name} - {table.capacity}
                  </option>
                ))}
          </select>
        </label>
        <hr />
        <button name="submit" type="submit">
          Submit
        </button>
        <button name="cancel" onClick={() => navigate.go(-1)}>
          Cancel
        </button>
      </form>
      <ErrorAlert error={error} />
    </div>
  );
}
