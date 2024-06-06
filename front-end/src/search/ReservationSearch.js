import React, { useState, useEffect } from "react";
import { listTables, finishReservation, adjustStatus } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ListReservations from "../layout/ListReservations";
import "./ReservationSearch.css";

export default function ReservationSearch() {
  const defaultForm = {
    mobile_number: "",
  };

  const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/reservations`;
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

  async function cancelReservation(id) {
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      await adjustStatus(id, "cancelled");
      setUpdate(!update);
    }
  }

  async function finishReservationButton(id) {
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      try {
        const resTable = tables.find((table) => table.reservation_id === id);
        await finishReservation(resTable.table_id);
        setUpdate(!update);
      } catch (error) {
        setError(error);
      }
    }
  }

  useEffect(() => {
    async function loadTables() {
      const tables = await listTables();

      setTables(tables);
    }

    loadTables();
  }, [update]);

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input
          name="mobile_number"
          id="mobile_number"
          required
          type="text"
          onChange={handleChange}
        />
        <button name="submit" type="submit">
          Find
        </button>
      </form>

      <ErrorAlert error={error} />

      {reservations.length > 0 && (
        <ListReservations
          reservations={reservations}
          cancelReservation={cancelReservation}
          finishReservationButton={finishReservationButton}
        />
      )}

      {reservations.length === 0 && <h5>No reservations found.</h5>}
    </main>
  );
}
