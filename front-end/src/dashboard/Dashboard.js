import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ListReservations from "../layout/ListReservations";
import ListTables from "../layout/ListTables";

function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [update, setUpdate] = useState(true);
  const query = useQuery();
  const param = query.get("date");

  if (param) {
    date = param;
  }

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }

  async function adjustStatus(id, status) {
    try {
      const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/reservations`;
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

      setReservationsError(null);
      setUpdate(!update); // Trigger re-fetching of data
      return response;
    } catch (error) {
      setReservationsError(error);
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
    console.log("Finishing reservation with ID:", id);

    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      const resTable = tables.find((table) => table.reservation_id === id);

      console.log(`Found table with reservation ID ${id}`);
      console.log(resTable);

      if (!resTable) {
        console.error("No table found with the given reservation ID:", id);
        return;
      }

      try {
        const request = {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        };

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/tables/${resTable.table_id}/seat`,
          request
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Unknown error occurred");
        }

        console.log("Delete request successful:", response);

        const responseData = await response.json();
        console.log("Backend response data:", responseData);

        setUpdate(!update); // Trigger re-fetching of data
      } catch (error) {
        setReservationsError(error);
      }
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      const abortController = new AbortController();
      setReservationsError(null);

      try {
        const reservations = await listReservations(
          { date },
          abortController.signal
        );
        const data = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/tables`
        );
        const response = await data.json();

        setReservations(reservations);
        setTables(response.data);
      } catch (error) {
        setReservationsError(error);
      }
      return () => abortController.abort();
    }

    loadDashboard();
  }, [date, update]);

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date {date}</h4>
      </div>
      <ErrorAlert error={reservationsError} />

      {!reservations.length && (
        <div>
          <h3>No reservations found for this date.</h3>
        </div>
      )}
      {reservations.length > 0 && (
        <ListReservations
          reservations={reservations}
          adjustStatus={adjustStatus}
          cancelReservation={cancelReservation}
          finishReservation={finishReservation}
        />
      )}
      <ErrorAlert error={reservationsError} />
      <div>
        {tables.length > 0 && (
          <div>
            <h3>Tables</h3>
            <ListTables tables={tables} finishReservation={finishReservation} />
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
