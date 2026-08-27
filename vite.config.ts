import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'vite-dev-email-middleware',
        configureServer(server) {
          server.middlewares.use('/api/send-email', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
              res.statusCode = 200
              res.end()
              return
            }

            if (req.method === 'POST') {
              let bodyStr = ''
              req.on('data', chunk => { bodyStr += chunk })
              req.on('end', async () => {
                try {
                  const body = JSON.parse(bodyStr || '{}')
                  const apiKey = body.apiKey || env.VITE_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY
                  const from = body.from || env.VITE_RESEND_FROM_EMAIL || 'Nexora Connect <connect@mail.nexoratechs.xyz>'
                  
                  const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${apiKey}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      from: from,
                      to: Array.isArray(body.to) ? body.to : [body.to],
                      reply_to: body.reply_to || 'contactnexoratechs@gmail.com',
                      subject: body.subject,
                      html: body.html
                    })
                  })

                  const data = await response.json()
                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = response.status
                  res.end(JSON.stringify(data))
                } catch (err: any) {
                  res.setHeader('Content-Type', 'application/json')
                  res.statusCode = 500
                  res.end(JSON.stringify({ error: err?.message || 'Error sending email' }))
                }
              })
            } else {
              res.statusCode = 405
              res.end('Method not allowed')
            }
          })
        }
      }
    ],
    server: {
      proxy: {
        '/api/resend': {
          target: 'https://api.resend.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/resend/, ''),
          headers: {
            'Origin': 'https://api.resend.com'
          }
        }
      }
    }
  }
})
