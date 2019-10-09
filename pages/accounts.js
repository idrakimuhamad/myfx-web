import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import Account from '../components/Account'

const ACCOUNTS_API = 'http://localhost:3000/api/accounts'
const LOGOUT_API = 'http://localhost:3000/api/logout'

const Accounts = () => {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(null)
  const [accounts, setAccounts] = useState([])

  const getAccounts = async () => {
    setLoading(true)
    try {
      const request = await axios.get(ACCOUNTS_API, {
        params: {
          session
        }
      })

      if (request.status === 200) {
        if (!request.data.error && request.data.accounts) {
          console.log(`Accounts received... Account ${request.data.accounts}`)

          setAccounts(request.data.accounts)
        }
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    console.log('Logging out...')

    try {
      const request = await axios.get(LOGOUT_API, {
        params: {
          session
        }
      })

      if (request.status === 200) {
        if (!request.data.error) {
          console.log(`Logged out`)
          localStorage.clear()
          setSession(null)
          router.replace('/')
        }
      }
    } catch (error) {
      console.log('error when logging out.', error.message)
    }
  }

  const getSession = () => {
    const sessionStore = localStorage.getItem('session')
    setSession(sessionStore)
  }

  useEffect(() => {
    if (!session) getSession()
    getAccounts()
  }, [session])

  return (
    <div className="wrapper">
      <div className="container">
        <div className="top-header is-flex">
          <h3 className="title">Accounts</h3>
          <button onClick={handleLogout} className="button is-danger">
            Logout
          </button>
        </div>
        <div className="account-list is-flex-tablet">
          {loading && <span className="has-text-white">Retrieving account</span>}
          {!loading && !accounts.length && (
            <span className="has-text-white">No account found. Try to create one in MyFxbook</span>
          )}
          {accounts.map(account => (
            <Account key={account.id} session={session} {...account}></Account>
          ))}
        </div>
      </div>
      <style jsx>{`
        .top-header {
          flex-direction: row;
          justify-content: space-between;
        }
        .container {
          padding: 2rem 0;
        }
        .title {
          color: rgba(255, 255, 255, 0.7);
        }
        .account-list {
          margin: 0 auto;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          margin: 0 -1rem 0;
        }
        @media screen and (max-width: 768px) {
          .top-header {
            padding: 0 1rem;
          }
          .account-list {
            flex-direction: column;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default Accounts
