import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Flex, Box } from "reflexbox";
import dayjs from "dayjs";
import "dayjs/locale/en-SG";
import relativeTime from "dayjs/plugin/relativeTime";
import Modal from "../components/Modal";

const ACCOUNTS_API = "/api/open-trades";
const GAINS_API = "/api/gains";

dayjs.extend(relativeTime);

const Account = ({
  name,
  lastUpdateDate,
  id,
  session,
  currency,
  balance,
  equity,
  profit
}) => {
  const [trades, setTrades] = useState([]);
  const [weeklyGain, setweeklyGain] = useState(0);
  const [dailyGain, setDailyGain] = useState(0);
  const [modalVisible, setModal] = useState(false);

  const getOpenTrade = useCallback(async () => {
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
      return <span className="float float-text">0.00 {currency}</span>;
    const total = trades.reduce((m, trade) => m + trade.profit, 0);
    return (
      <Box
        as="span"
        fontWeight="bold"
        className={`float-text ${
          total < 0 ? "has-text-danger" : "has-text-success"
        }`}
      >
        {total > 0 ? "+" : ""}
        {total.toFixed(2)} {currency}
      </Box>
    );
  };

  const handleShowDetails = () => {
    console.log("open details");

    setModal(true);
  };

  const handleCloseModal = () => {
    setModal(false);
  };

  useEffect(() => {
    getOpenTrade();
    getCurrentWeekGain();
    getDailyGain();
  }, [session, id, getOpenTrade, getCurrentWeekGain, getDailyGain]);

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
                <span className="label">Balance/Equity</span>
                <span className="label value float">
                  {balance} / {equity} {currency}
                </span>
              </div>
              <div className="profit">
                <span className="label">Profit</span>
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
              </div>
              <div className="weekly-gain">
                <span className="label">This Week's Gain</span>
                <span
                  className={`label value float ${
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
                <span className="label">Today's Gain</span>
                <span
                  className={`label value float ${
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
            <div className="last-updated">
              <p>
                Updated{" "}
                {dayjs(lastUpdateDate)
                  .add(dayjs().utcOffset(), "minute")
                  .fromNow()}
              </p>
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
          .float {
            color: rgba(255, 255, 255, 0.5);
            font-weight: bold;
          }
          .balance-equity,
          .profit {
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
      {modalVisible && <Modal onClose={handleCloseModal} />}
    </>
  );
};

export default Account;
