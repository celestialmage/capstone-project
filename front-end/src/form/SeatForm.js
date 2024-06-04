import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import formatReservationDate from "../utils/format-reservation-date";
import formatReservationTime from "../utils/format-reservation-time";
import ErrorAlert from "../layout/ErrorAlert";

export default function SeatForm() {
  const [formData, setFormData] = useState({ table_id: "" });
  const [reservation, setReservation] = useState({});
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useHistory();
  const parameters = useParams();
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const request = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: { reservation_id: reservation.reservation_id },
      }),
    };

    try {
      const response = await fetch(
        `${BASE_URL}/tables/${formData.table_id}/seat`,
        request
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Unknown Error Occured");
      }

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
      const resResponse = await fetch(BASE_URL + `/reservations/${id}`);
      let resData = await resResponse.json();

      // Ensure resData.data exists
      if (resData.data) {
        resData.data = formatReservationDate(resData.data);
        resData.data = formatReservationTime(resData.data);
        setReservation(resData.data);
      }

      const tableResponse = await fetch(BASE_URL + "/tables");
      let tableData = await tableResponse.json();

      if (tableData.data) {
        setTables(tableData.data);
      }
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
            {tables.map((table) => (
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
