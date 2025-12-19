import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'      
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // https: {
    //   key: fs.readFileSync('C:/Users/HONG/Desktop/BotTrader/localhost.key'),
    //   cert: fs.readFileSync('C:/Users/HONG/Desktop/BotTrader/localhost.crt'),
    // },
    port: 24830
  }
})