import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { Flex, Box } from "reflexbox";

const LOGIN_API = "/api/login";

const Home = () => {
  const router = useRouter();
  const [auth, setAuth] = useState({
    username: "",
    password: ""
  });
  const [sessionError, setSessionError] = useState(null);
  const [loading, setLoading] = useState(null);

  const handleSetAuth = event => {
    const { name, value } = event.target;

    setAuth({ ...auth, [name]: value });
  };

  const handleLogin = async e => {
    const { username, password } = auth;

    e.preventDefault();

    if (username && password) {
      setSessionError(null);
      setLoading(true);

      console.log("Logging in...");

      try {
        const request = await axios.get(LOGIN_API, {
          params: {
            username,
            password
          }
        });

        if (request.status === 200) {
          if (!request.data.error && request.data.session) {
            console.log(`Logged in... Session ${request.data.session}`);
            localStorage.setItem("session", request.data.session);
            router.push("/accounts");
          }
        }
      } catch (error) {
        setSessionError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const getSession = useCallback(() => {
    const session = localStorage.getItem("session");

    if (session) {
      // redirect to account
      router.push("/accounts");
    }
  }, [router]);

  useEffect(() => {
    getSession();
  }, [getSession]);

  return (
    <Flex
      bg="#262b34"
      height="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      className="hero-container"
    >
      <Head>
        <title>Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box width={[1, 1 / 3]}>
        <Box
          as="form"
          onSubmit={handleLogin}
          className="container has-text-centered"
        >
          <Box width={1} px={4} className="login-container">
            <Box width={1} className="field">
              <div className="control">
                <input
                  type="text"
                  placeholder="MyFxbook username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="input"
                  value={auth.username}
                  name="username"
                  onChange={handleSetAuth}
                />
              </div>
            </Box>
            <Box width={1} className="field">
              <div className="control">
                <input
                  type="password"
                  placeholder="MyFxbook password"
                  autoComplete="password"
                  className="input"
                  value={auth.password}
                  name="password"
                  onChange={handleSetAuth}
                />
              </div>
            </Box>
            <Box width={1} className="field">
              <div className="control">
                <button
                  className="button is-link is-fullwidth"
                  onClick={handleLogin}
                >
                  {loading ? "Loading..." : "Login"}
                </button>
              </div>
            </Box>
            {sessionError && (
              <Box className="has-text-danger has-text-centered">
                Unable to login. {sessionError}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <style jsx>{`
        .hero-container {
          background-color: #262b34;
          // height: 100vh;
        }
        .login-container {
          margin: 0 auto;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>
      <style global jsx>{`
        html,
        body,
        body > div {
          overflow-x: hidden;
          overflow-y: auto;
          height: 100%;
        }
        body,
        .wrapper {
          background-color: #262b34;
        }
      `}</style>
    </Flex>
  );
};

export default Home;
