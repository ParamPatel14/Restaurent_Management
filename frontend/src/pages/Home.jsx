import { useEffect, useState } from "react";
import api from "../api/client";

function Home() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get("/health").then((res) => {
      setStatus(res.data.database);
    });
  }, []);

  return (
    <div>
      <h1>Restaurant Management System</h1>
      <p>Database Status: {status}</p>
    </div>
  );
}

export default Home;
