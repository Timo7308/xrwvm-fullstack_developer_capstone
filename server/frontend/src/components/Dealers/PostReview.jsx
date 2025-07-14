import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";

const PostReview = () => {
  const [dealer, setDealer] = useState(null);
  const [carmodels, setCarmodels] = useState([]);
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate();

  // ✅ Hier muss `id` stehen, wenn deine Route /postreview/:id lautet
  const { id } = useParams();

  // ✅ Relative Pfade statt window.location.origin
  const endpoints = {
    dealer:    `/djangoapp/dealer/${id}`,
    addReview: `/djangoapp/add_review`,
    carModels: `/djangoapp/get_cars`,
  };

  const fetchDealer = async () => {
    try {
      const res  = await fetch(endpoints.dealer);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (data.status === 200) {
        // könnte Array oder Objekt sein
        const d = Array.isArray(data.dealer) ? data.dealer[0] : data.dealer;
        setDealer(d);
      }
    } catch (err) {
      console.error("Error fetching dealer:", err);
    }
  };

  const fetchCarModels = async () => {
    try {
      const res  = await fetch(endpoints.carModels);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (data.CarModels) {
        setCarmodels(data.CarModels);
      }
    } catch (err) {
      console.error("Error fetching car models:", err);
    }
  };

  const handlePostReview = async () => {
    const name = (
      `${sessionStorage.getItem("firstname") || ""} ${sessionStorage.getItem("lastname") || ""}`
    ).trim() || sessionStorage.getItem("username");

    if (!model || !review.trim() || !date || !year || !name) {
      alert("Bitte alle Felder ausfüllen.");
      return;
    }

    const [make, ...modelParts] = model.split(" ");
    const payload = {
      name,
      dealership: id,
      review,
      purchase: true,
      purchase_date: date,
      car_make: make,
      car_model: modelParts.join(" "),
      car_year: year,
    };

    try {
      const res    = await fetch(endpoints.addReview, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.status === 200) {
        alert("Review erfolgreich abgeschickt!");
        navigate(`/dealer/${id}`);
      } else {
        alert(`Fehler: ${result.message || "Konnte nicht posten."}`);
      }
    } catch (err) {
      console.error("Error posting review:", err);
      alert("Server-Fehler. Bitte später erneut versuchen.");
    }
  };

  useEffect(() => {
    fetchDealer();
    fetchCarModels();
  }, []);

  if (!dealer) {
    return (
      <div>
        <Header />
        <p className="loading-text" style={{ margin: "5%", color: "grey" }}>
          Lade Dealer-Details…
        </p>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="review-container" style={{ margin: "5%" }}>
        <h1 className="dealer-name" style={{ color: "darkblue" }}>
          {dealer.full_name || "Dealer Name"}
        </h1>
        <textarea
          className="review-textarea"
          placeholder="Schreibe deine Bewertung…"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          cols="50"
          rows="7"
        />
        <div className="input_field">
          Kaufdatum{" "}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="input_field">
          Auto Marke & Modell{" "}
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="" disabled>
              Wähle Marke & Modell
            </option>
            {carmodels.map((c, i) => (
              <option key={i} value={`${c.CarMake} ${c.CarModel}`}>
                {c.CarMake} {c.CarModel}
              </option>
            ))}
          </select>
        </div>
        <div className="input_field">
          Baujahr{" "}
          <input
            type="number"
            min={1990}
            max={2025}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <button className="postreview" onClick={handlePostReview}>
          Bewertung abschicken
        </button>
      </div>
    </div>
  );
};

export default PostReview;
