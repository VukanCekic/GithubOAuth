import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const GITHUB_CLIENT_ID = "e49e59bcef0c76cb68ad";
const gitHubRedirectURL = "http://localhost:3000/api/auth/github";
const path = "/";

function App() {
  const [user, setUser] = useState();
  const state = (Math.random() + 1).toString(36).substring(7);

  useEffect(() => {
    (async function () {
      const usr = await axios
          .get(`http://localhost:3000/api/me`, {
            withCredentials: true,
          })
          .then((res) => res.data);

      setUser(usr);
    })();
  }, []);

  return (
      <div className="App">
        {!user ? (
            <a
                href={`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${gitHubRedirectURL}?path=${path}&scope=user:email&state=${state}`}
            >
              LOGIN WITH GITHUB
            </a>
        ) : (
            <h1>Welcome {user.login}</h1>
        )}
      </div>
  );
}

export default App;