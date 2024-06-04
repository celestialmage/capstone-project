import React, { useEffect, useState } from "react";
import { useLocation, useParams, useHistory } from "react-router-dom";
import formatReservationDate from "../utils/format-reservation-date";
import ErrorAlert from "../layout/ErrorAlert";

function ResForm() {
  const defaultForm = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
  };

  const navigate = useHistory();
  const parameters = useParams();
  const isNew = useLocation().pathname.includes("new");
  const [method, setMethod] = useState("POST"); // Initialize with a default method
  const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/reservations`;

  // Use useEffect to set the method based on isNew
  useEffect(() => {
    if (isNew) {
      setMethod("POST");
    } else {
      setMethod("PUT");
    }
  }, [isNew]);

  const request = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState(null);

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

    request.body = JSON.stringify({ data: formData });

    try {
      if (isNew) {
        response = await fetch(BASE_URL, request); // Send POST request
      } else {
        response = await fetch(`${BASE_URL}/${parameters.id}`, request); // Corrected to include request object
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred");
      }

      setError(null);
      navigate.push(`/dashboard?date=${formData.reservation_date}`);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(() => {
    async function loadReservation(id) {
      const data = await fetch(`${BASE_URL}/${id}`);
      const response = await data.json();

      formatReservationDate(response.data);

      setFormData(response.data);
    }

    if (!isNew) {
      loadReservation(parameters.id);
    } else {
      setFormData(defaultForm);
    }
  }, [isNew, parameters.id]);

  if (!formData) return <div>Loading...</div>;

  return (
    <div>
      <form className="col-5" onSubmit={handleSubmit}>
        <label htmlFor="first_name">
          First Name
          <input
            name="first_name"
            id="first_name"
            value={formData.first_name}
            required
            onChange={handleChange}
            type="text"
          />
        </label>
        <label htmlFor="last_name">
          Last Name
          <input
            name="last_name"
            id="last_name"
            value={formData.last_name}
            required
            onChange={handleChange}
            type="text"
          />
        </label>
        <label htmlFor="mobile_number">
          Mobile Number
          <input
            name="mobile_number"
            id="mobile_number"
            value={formData.mobile_number}
            required
            type="text"
            onChange={handleChange}
          />
        </label>
        <label htmlFor="reservation_date">
          Date
          <input
            name="reservation_date"
            id="reservation_date"
            value={formData.reservation_date}
            type="date"
            required
            onChange={handleChange}
          />
        </label>
        <label htmlFor="reservation_time">
          Time
          <input
            name="reservation_time"
            id="reservation_time"
            type="time"
            value={formData.reservation_time}
            required
            onChange={handleChange}
          />
        </label>
        <label htmlFor="people">
          People
          <input
            name="people"
            id="people"
            type="number"
            value={formData.people}
            required
            onChange={handleChange}
          />
        </label>
        <hr />
        <button name="submit" type="submit">
          Submit
        </button>
        <button name="cancel" id="cancel" onClick={() => navigate.go(-1)}>
          cancel
        </button>
      </form>
      {error && <ErrorAlert error={error} />}
    </div>
  );
}

export default ResForm;
