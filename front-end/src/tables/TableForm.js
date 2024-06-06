import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";

export default function TableForm() {
  const defaultForm = {
    table_name: "",
    capacity: 0,
  };

  const BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/tables`;
  const [formData, setFormData] = useState(defaultForm);
  const [error, setError] = useState(null);

  const navigate = useHistory();

  const request = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const handleChange = async ({ target }) => {
    if (target.name !== "capacity") {
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
        setError(error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let response;

    request.body = JSON.stringify({ data: formData });

    try {
      response = await fetch(BASE_URL, request); // Send POST request

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error occurred");
      }

      setError(null);
      navigate.push(`/dashboard`);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="table_name">
          Table Name
          <input
            name="table_name"
            id="table_name"
            required
            type="text"
            onChange={handleChange}
          />
        </label>
        <label htmlFor="capacity">
          Capacity
          <input
            name="capacity"
            id="capacity"
            required
            type="number"
            onChange={handleChange}
          />
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
