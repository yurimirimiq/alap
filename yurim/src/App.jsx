import { useState } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import "./index.css";

function App() {
  const [user, setUser] = useState(null);

  return user ? <Home user={user} /> : <Login onLogin={setUser} />;
}

export default App;
