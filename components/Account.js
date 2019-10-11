import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Flex, Box } from "reflexbox";
import dayjs from "dayjs";
import "dayjs/locale/en-SG";
import relativeTime from "dayjs/plugin/relativeTime";
import Modal from "../components/Modal";

const ACCOUNTS_API = "/api/open-trades";
const GAINS_API = "/api/gains";
const DAILY_API = "/api/daily-data";

dayjs.extend(relativeTime);

const Account = ({
  name,
  lastUpdateDate,
  id,
  session,
  currency,
  balance,
  equity,
  profit,
  gain
}) => {
  const [trades, setTrades] = useState([]);
  const [weeklyGain, setweeklyGain] = useState(0);
  const [dailyGain, setDailyGain] = useState(0);
  const [modalVisible, setModal] = useState(false);
  const [lastUpdated, setTimeUpdated] = useState("");
  const [dailyDetails, setDailyData] = useState(null);
  const [weeklyDetails, setWeeklyData] = useState(null);
  const updateTimeInterval = useRef();

  const getOpenTrade = useCallback(async () => {
    updateTrackingTime(lastUpdated);

    try {
      const request = await axios.get(ACCOUNTS_API, {
        params: {
          session,
          id
        }
      });

      if (request.status === 200) {
        if (!request.data.error && request.data.openTrades) {
          console.log(`Trades received.. ${request.data.openTrades}`);

          setTrades(request.data.openTrades);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [id, session, updateTrackingTime, lastUpdated]);

  const getDailyData = useCallback(async () => {
    const today = dayjs().format("YYYY-MM-DD");
    try {
      const response = await axios.get(DAILY_API, {
        params: {
          session,
          id,
          start: today,
          end: today
        }
      });

      if (
        response.status === 200 &&
        !response.data.error &&
        response.data.dataDaily
      ) {
        console.log("Received daily data");
        const { dataDaily } = response.data;
        const { pips: todaysPips, profit: todaysProfit } = dataDaily[0][0];

        setDailyData({
          todaysPips,
          todaysProfit
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {}
  }, [id, session]);

  const getWeeklyData = useCallback(async () => {
    const startOfWeek = dayjs()
      .startOf("week")
      .format("YYYY-MM-DD");
    const endOfWeek = dayjs()
      .endOf("week")
      .format("YYYY-MM-DD");

    try {
      const request = await axios.get(DAILY_API, {
        params: {
          session,
          id,
          start: startOfWeek,
          end: endOfWeek
        }
      });

      if (request.status === 200) {
        if (!request.data.error && request.data.dataDaily) {
          console.log(`Received weekly data`);
          const [weekly] = request.data.dataDaily;

          const weeklyProfit = weekly.reduce((m, week) => week.profit + m, 0);
          const weeklyPips = weekly.reduce((m, week) => week.pips + m, 0);

          setWeeklyData({
            weeklyProfit,
            weeklyPips
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [id, session]);

  const getCurrentWeekGain = useCallback(async () => {
    const startOfWeek = dayjs()
      .startOf("week")
      .format("YYYY-MM-DD");
    const endOfWeek = dayjs()
      .endOf("week")
      .format("YYYY-MM-DD");

    try {
      const request = await axios.get(GAINS_API, {
        params: {
          session,
          id,
          start: startOfWeek,
          end: endOfWeek
        }
      });

      if (request.status === 200) {
        if (!request.data.error && request.data.value) {
          console.log(`Gains received.. ${request.data.value}`);

          setweeklyGain(request.data.value);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [id, session]);

  const getDailyGain = useCallback(async () => {
    const today = dayjs().format("YYYY-MM-DD");

    try {
      const response = await axios.get(GAINS_API, {
        params: {
          start: today,
          end: today,
          session,
          id
        }
      });

      if (response.status === 200) {
        if (!response.data.error && response.data.value) {
          console.log(
            `Get daily gain for ${today}: ${JSON.stringify(
              response.data.value
            )}`
          );

          setDailyGain(response.data.value);
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  }, [id, session]);

  const calculateTotalPL = () => {
    if (trades && !trades.length)
      return (
        <span className="float float-text has-text-right">0.00 {currency}</span>
      );
    const total = trades.reduce((m, trade) => m + trade.profit, 0);
    const totalPips = trades.reduce((m, trade) => m + trade.pips, 0);
    return (
      <Box className="has-text-right">
        <Box
          fontWeight="bold"
          className={`float-text has-text-right ${
            total < 0 ? "has-text-danger" : "has-text-success"
          }`}
        >
          {total > 0 ? "+" : ""}
          {total.toFixed(2)} {currency}
        </Box>
        <Box
          as="span"
          fontWeight="bold"
          fontSize={0}
          className={`float-text has-text-right ${
            totalPips < 0 ? "has-text-danger" : "has-text-success"
          }`}
        >
          {totalPips > 0 ? "+" : ""}
          {totalPips.toFixed(2)} pips
        </Box>
      </Box>
    );
  };

  const handleShowDetails = () => {
    console.log("open details");

    setModal(true);
  };

  const handleCloseModal = () => setModal(false);

  const updateTrackingTime = useCallback(() => {
    const update = dayjs(lastUpdateDate)
      .add(dayjs().utcOffset(), "minute")
      .fromNow();

    startPollingTime(update);

    setTimeUpdated(update);
  }, [lastUpdateDate, startPollingTime]);

  const startPollingTime = useCallback(
    time => {
      let interval = 1000;

      if (time.includes("minute")) {
        interval = 1000 * 60;
      } else if (time.includes("hour")) {
        interval = 1000 * 60 * 60;
      }

      console.log(`Start time update polling for ${name} in ${interval}ms...`);

      if (updateTimeInterval.current) clearInterval(updateTimeInterval.current);

      updateTimeInterval.current = setInterval(() => {
        console.log(`Update time ago for ${name}s`);

        updateTrackingTime(lastUpdated);
      }, interval);
    },
    [updateTrackingTime, name, lastUpdated]
  );

  useEffect(() => {
    getOpenTrade();
    getCurrentWeekGain();
    getWeeklyData();
    getDailyGain();
    getDailyData();

    return function clear() {
      if (updateTimeInterval.current) clearInterval(updateTimeInterval.current);
    };
  }, [
    session,
    id,
    getOpenTrade,
    getCurrentWeekGain,
    getWeeklyData,
    getDailyGain,
    getDailyData
  ]);

  return (
    <>
      <div className="account is-block-mobile">
        <div className="card" onClick={handleShowDetails}>
          <div className="card-content">
            <Flex
              flexDirection="row"
              justifyContent="space-between"
              className="main"
            >
              <h5 className="sub-title">{name}</h5>
              {calculateTotalPL()}
            </Flex>
            <div className="meta">
              <div className="balance-equity">
                <span className="label">Balance / Equity</span>
                <span className="label value float">
                  {balance} / {equity} {currency}
                </span>
              </div>

              <div className="weekly-gain">
                <span className="label">This Week</span>
                <span
                  className={`label value float ${
                    weeklyDetails && weeklyDetails.weeklyProfit === 0
                      ? "rgba(255,255,255, .5)"
                      : weeklyDetails && weeklyDetails.weeklyProfit > 0
                      ? "has-text-success"
                      : "has-text-danger"
                  }`}
                >
                  {weeklyDetails && weeklyDetails.weeklyProfit > 0 ? "+" : ""}
                  {weeklyDetails && weeklyDetails.weeklyProfit.toFixed(2)}{" "}
                  {currency}
                </span>
                <span
                  className={`label value gain float ${
                    weeklyGain === 0
                      ? "rgba(255,255,255, .5)"
                      : weeklyGain > 0
                      ? "has-text-success"
                      : "has-text-danger"
                  }`}
                >
                  {weeklyGain > 0 ? "+" : ""}
                  {weeklyGain.toFixed(2)}%
                </span>
              </div>
              <Box className="daily-gain" mt={2}>
                <span className="label">Today</span>
                <span
                  className={`label value float ${
                    dailyDetails && dailyDetails.todaysProfit === 0
                      ? "rgba(255,255,255, .5)"
                      : dailyDetails && dailyDetails.todaysProfit > 0
                      ? "has-text-success"
                      : "has-text-danger"
                  } `}
                >
                  {dailyDetails && dailyDetails.todaysProfit > 0 ? "+" : ""}
                  {dailyDetails &&
                    dailyDetails.todaysProfit &&
                    dailyDetails.todaysProfit.toFixed(2)}{" "}
                  {currency}
                </span>
                <span
                  className={`label value gain float ${
                    dailyGain === 0
                      ? "rgba(255,255,255, .5)"
                      : dailyGain > 0
                      ? "has-text-success"
                      : "has-text-danger"
                  } `}
                >
                  {dailyGain > 0 ? "+" : ""}
                  {dailyGain && dailyGain.toFixed(2)}%
                </span>
              </Box>
            </div>
            <Box mb={2} className="profit">
              <span className="label">All Time</span>
              <span
                className={`label value float ${
                  parseFloat(profit) === 0
                    ? "rgba(255,255,255, .5)"
                    : parseFloat(profit) > 0
                    ? "has-text-success"
                    : "has-text-danger"
                }`}
              >
                {parseFloat(profit) > 0 ? "+" : ""}
                {profit} {currency}
              </span>
              <span
                className={`label value float gain ${
                  parseFloat(gain) === 0
                    ? "rgba(255,255,255, .5)"
                    : parseFloat(gain) > 0
                    ? "has-text-success"
                    : "has-text-danger"
                }`}
              >
                {parseFloat(gain) > 0 ? "+" : ""}
                {gain.toFixed(2)}%
              </span>
            </Box>
            <div className="last-updated">
              <p>Updated {lastUpdated}</p>
            </div>
          </div>
        </div>
        <style jsx>{`
          .sub-title {
            color: rgba(255, 255, 255, 0.7);
          }
          .sub-title,
          .float-text {
            max-width: 50%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .account {
            width: calc(100% / 3);
            padding: 0 1rem 2rem;
          }
          .card {
            border-radius: 4px;
            background-color: rgba(255, 255, 255, 0.025);
            z-index: 7;
            position: relative;
          }
          .meta {
            padding: 0.8rem 0;
          }
          .label {
            color: rgba(255, 255, 255, 0.25);
            font-size: 0.6rem;
            line-height: 1;
          }
          .value {
            font-size: 0.9em;
          }
          .gain {
            font-size: 0.75em;
          }
          .float {
            color: rgba(255, 255, 255, 0.5);
            font-weight: bold;
          }
          .balance-equity {
            margin-bottom: 0.6rem;
          }
          .last-updated {
            padding: 0.5rem 0;
            font-size: 0.7rem;
            color: rgba(255, 255, 255, 0.15);
          }
          @media screen and (max-width: 768px) {
            .account {
              width: 100%;
            }
          }
        `}</style>
      </div>
      {modalVisible && (
        <Modal trades={trades} currency={currency} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default Account;
