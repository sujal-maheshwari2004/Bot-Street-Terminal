import axios from 'axios'

const BASE_URL = 'https://bot-street-api.sujalmaheshwari.com'
const api = axios.create({ baseURL: BASE_URL, timeout: 8000 })

export const SYMBOLS = ['PEAR', 'TSLA', 'LBRY', 'RNFR', 'MHRD']

// Market
export const getAllPrices  = ()           => api.get('/market/all/prices').then(r => r.data)
export const getPrice      = (symbol)     => api.get(`/market/${symbol}/price`).then(r => r.data)
export const getOrderBook  = (symbol, n=10) => api.get(`/market/${symbol}/orderbook?levels=${n}`).then(r => r.data)
export const getCandles    = (symbol, n=30) => api.get(`/market/${symbol}/candles?n=${n}`).then(r => r.data)
export const getSentiment  = (symbol)     => api.get(`/market/${symbol}/sentiment`).then(r => r.data)

// System
export const getHealth     = ()           => api.get('/system/health').then(r => r.data)
export const getStatus     = ()           => api.get('/system/status').then(r => r.data)
export const getLeaderboard= ()           => api.get('/system/leaderboard').then(r => r.data)

// Portfolio
export const getPortfolio  = (clientId)  => api.get(`/portfolio/${clientId}`).then(r => r.data)

// Orders
export const placeOrder = (order) => api.post('/orders', order).then(r => r.data)