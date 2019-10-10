import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { Box, Flex } from "reflexbox";
import Account from "../components/Account";

const ACCOUNTS_API = "/api/accounts";
const LOGOUT_API = "/api/logout";

const Refresh = ({ onClick }) => (
  <Box
    as="a"
    display="block"
    width={30}
    height={30}
    sx={{
      cursor: "pointer"
    }}
    onClick={onClick}
    title="Refresh data feed"
  >
    <span className="refresh-button">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width={30}
        height={30}
      >
        <path
          fill="rgba(255, 255, 255, 0.7)"
          d="M433 288.8c-7.7 0-14.3 5.9-14.9 13.6-6.9 83.1-76.8 147.9-161.8 147.9-89.5 0-162.4-72.4-162.4-161.4 0-87.6 70.6-159.2 158.2-161.4 2.3-.1 4.1 1.7 4.1 4v50.3c0 12.6 13.9 20.2 24.6 13.5L377 128c10-6.3 10-20.8 0-27.1l-96.1-66.4c-10.7-6.7-24.6.9-24.6 13.5v45.7c0 2.2-1.7 4-3.9 4C148 99.8 64 184.6 64 288.9 64 394.5 150.1 480 256.3 480c100.8 0 183.4-76.7 191.6-175.1.8-8.7-6.2-16.1-14.9-16.1z"
        />
      </svg>
    </span>
    <style jsx>{`
      .refresh-button {
        display: block;
        transform: rotate(0deg);
        transition: all 0.25s ease-in-out;
        height: 30px;
      }
      .refresh-button:hover {
        transform: rotate(45deg);
      }
      .refresh-button:active {
        transform: rotate(360deg);
      }
    `}</style>
  </Box>
);

const Accounts = () => {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(null);
  const [loadingLogout, setLoadingLogout] = useState(null);
  const [accounts, setAccounts] = useState([]);
  let pollInterval;

  const getAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const request = await axios.get(ACCOUNTS_API, {
        params: {
          session
        }
      });

      if (request.status === 200) {
        if (!request.data.error && request.data.accounts) {
          console.log(`Accounts received... Account ${request.data.accounts}`);

          setAccounts(request.data.accounts);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  const handleLogout = async () => {
    console.log("Logging out...");
    setLoadingLogout(true);

    try {
      const request = await axios.get(LOGOUT_API, {
        params: {
          session
        }
      });

      if (request.status === 200) {
        if (!request.data.error) {
          console.log(`Logged out`);
          localStorage.clear();
          setSession(null);
          setLoadingLogout(false);
          router.replace("/");
        }
      }
    } catch (error) {
      console.log("error when logging out.", error.message);
    }
  };

  const handlePolling = () => {
    console.log("start polling");

    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(() => {
      console.log("Refreshing data...");
      getAccounts();
    }, 1000 * 60 * 5);
  };

  const handleRefreshAccounts = () => {
    // clear any interval
    if (pollInterval) clearInterval(pollInterval);

    getAccounts();

    // start back the polling
    handlePolling();
  };

  const getSession = () => {
    const sessionStore = localStorage.getItem("session");
    setSession(sessionStore);
  };

  useEffect(() => {
    if (!session) getSession();
    getAccounts();

    return function clear() {
      clearInterval(pollInterval);
    };
  }, [session, getAccounts, pollInterval]);

  return (
    <Box bg="#262b34" className="wrapper">
      <Head>
        <title>Accounts</title>
      </Head>
      <Box px={3} py={4} mx="auto" className="container">
        <Flex
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Flex flexDirection="row" alignItems="center">
            <Box fontSize="2rem" as="h3" m={0} color="rgba(255, 255, 255, 0.7)">
              Accounts
            </Box>
            <Box ml={3}>
              <Refresh onClick={handleRefreshAccounts} />
            </Box>
          </Flex>
          <button onClick={handleLogout} className="button is-danger">
            {loadingLogout ? "Loading..." : "Logout"}
          </button>
        </Flex>
        <Flex
          flexDirection={["column", "row"]}
          alignItems="center"
          flexWrap={["nowrap", "wrap"]}
          mx={-3}
          className="account-list"
        >
          {loading && !accounts.length && (
            <Box as="span" px={3} className="has-text-white">
              Retrieving account
            </Box>
          )}
          {loading && !!accounts.length ? (
            <Box as="span" px={3} className="has-text-white">
              Refreshing data...
            </Box>
          ) : (
            accounts.map(account => (
              <Account key={account.id} session={session} {...account} />
            ))
          )}
          {!loading && !accounts.length && (
            <Box as="span" px={3} className="has-text-white">
              No account found. Try to create one in MyFxbook
            </Box>
          )}
        </Flex>
      </Box>
      <style jsx>{`
        .wrapper {
          background-color: #262b34;
        }
        .container {
          padding: 2rem 0;
        }
        .refresh-button {
          background-color: blue;
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
    </Box>
  );
};

export default Accounts;
