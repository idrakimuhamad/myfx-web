import React, { useState, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/en-SG'
import relativeTime from 'dayjs/plugin/relativeTime'

const ACCOUNTS_API = 'http://localhost:3000/api/open-trades'
const GAINS_API = 'http://localhost:3000/api/gains'

dayjs.extend(relativeTime)

const Account = ({ name, lastUpdateDate, id, session, currency, balance, equity, profit }) => {
  const [trades, setTrades] = useState([])
  const [weeklyGain, setweeklyGain] = useState(0)
  let pollInterval

  const getOpenTrade = async () => {
    try {
      const request = await axios.get(ACCOUNTS_API, {
        params: {
          session,
          id
        }
      })

      if (request.status === 200) {
        if (!request.data.error && request.data.openTrades) {
          console.log(`Trades received.. ${request.data.openTrades}`)

          setTrades(request.data.openTrades)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentWeekGain = async () => {
    const startOfWeek = dayjs()
      .startOf('week')
      .format('YYYY-MM-DD')
    const endOfWeek = dayjs()
      .endOf('week')
      .format('YYYY-MM-DD')

    try {
      const request = await axios.get(GAINS_API, {
        params: {
          session,
          id,
          start: startOfWeek,
          end: endOfWeek
        }
      })

      if (request.status === 200) {
        if (!request.data.error && request.data.value) {
          console.log(`Gains received.. ${request.data.value}`)

          setweeklyGain(request.data.value)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const calculateTotalPL = () => {
    if (trades && !trades.length) return <span className="float">0.00 {currency}</span>
    const total = trades.reduce((m, trade) => m + trade.profit, 0)
    return (
      <span className={`float ${total < 0 ? 'has-text-danger' : 'has-text-success'}`}>
        {total > 0 ? '+' : ''}
        {total.toFixed(2)} {currency}
      </span>
    )
  }

  const handlePolling = () => {
    console.log('start polling')

    if (pollInterval) clearInterval(pollInterval)

    pollInterval = setInterval(() => {
      console.log('Refreshing data...')
      getOpenTrade()
      getCurrentWeekGain()
    }, 1000 * 60 * 5)
  }

  useEffect(() => {
    getOpenTrade()
    getCurrentWeekGain()
    handlePolling()

    return function clear() {
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [session, id])

  return (
    <div className="account">
      <div className="card">
        <div className="card-content">
          <div className="main is-flex">
            <h5 className="sub-title">{name}</h5>
            {calculateTotalPL()}
          </div>
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
                    ? 'rgba(255,255,255, .5)'
                    : parseFloat(profit) > 0
                    ? 'has-text-success'
                    : 'has-text-danger'
                }`}>
                {parseFloat(profit) > 0 ? '+' : ''}
                {profit} {currency}
              </span>
            </div>
            <div className="weekly-gain">
              <span className="label">Week's Gained</span>
              <span
                className={`label value float ${
                  weeklyGain === 0
                    ? 'rgba(255,255,255, .5)'
                    : weeklyGain > 0
                    ? 'has-text-success'
                    : 'has-text-danger'
                }`}>
                {weeklyGain > 0 ? '+' : ''}
                {weeklyGain.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="last-updated">
            <p>
              Updated{' '}
              {dayjs(lastUpdateDate)
                .add(dayjs().utcOffset(), 'minute')
                .fromNow()}
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .main {
          flex-direction: row;
          justify-content: space-between;
        }
        .sub-title {
          color: rgba(255, 255, 255, 0.7);
        }
        .account {
          width: calc(100% / 3);
          padding: 0 1rem 2rem;
        }
        .card {
          border-radius: 4px;
          background-color: rgba(255, 255, 255, 0.025);
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
      `}</style>
    </div>
  )
}

export default Account
