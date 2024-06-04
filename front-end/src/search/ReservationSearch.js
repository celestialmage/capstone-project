import React, { useState, useEffect } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import ListReservations from "../layout/ListReservations";

export default function ReservationSearch() {
  const defaultForm = {
    mobile_number: "",
  };

  const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/reservations`;
  console.log(BASE_URL);
  const [formData, setFormData] = useState(defaultForm);
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);
  const [update, setUpdate] = useState(false);

  const handleChange = async ({ target }) => {
    if (target.name !== "people") {
      setFormData({
        ...formData,
        [target.name]: target.value,
      });
    } else {
      try {
        setFormData({
          ...formData,
          [target.name]: Number(target.value),
        });
      } catch (error) {
        throw error;
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let response;

    try {
      response = await fetch(
        `${BASE_URL}?mobile_number=${formData.mobile_number}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred");
      }

      const results = await response.json();

      setUpdate(!update);
      setReservations(results.data);
      setError(null);
    } catch (error) {
      setError(error);
    }
  };

  async function adjustStatus(id, status) {
    try {
      const request = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: { status } }),
      };

      const response = await fetch(`${BASE_URL}/${id}/status`, request);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred");
      }

      setError(null);
      return response;
    } catch (error) {
      setError(error);
    }
  }

  async function cancelReservation(id) {
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      await adjustStatus(id, "cancelled");
    }
  }

  async function finishReservation(id) {
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      const request = {
        method: "DELETE",
      };

      const resTable = tables.find((table) => table.reservation_id === id);

      await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/tables/${resTable.table_id}/seat`,
        request
      );

      setUpdate(!update);
    }
  }

  useEffect(() => {
    async function loadTables() {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/tables`
      );

      const data = await response.json();

      const results = data.data;

      setTables(results);
    }

    loadTables();
  }, [update]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="mobile_number">
          <input
            name="mobile_number"
            id="mobile_number"
            required
            type="text"
            onChange={handleChange}
          />
        </label>
        <button name="submit" type="submit">
          Find
        </button>
      </form>

      <ErrorAlert error={error} />

      {reservations.length > 0 && (
        <ListReservations
          reservations={reservations}
          cancelReservation={cancelReservation}
          finishReservation={finishReservation}
        />
      )}

      {reservations.length === 0 && <h5>No reservations found.</h5>}
    </div>
  );
}
