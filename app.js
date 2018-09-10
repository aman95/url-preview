const express = require('express')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3000

const urlPreview = require('./index')

const app = express()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', (req, res, next) => {
    if(req.query.url === undefined || req.query.url === null || req.query.url === '') {
        return next({msg: 'URL not provided'})
    }
    urlPreview.handler({url: req.query.url}, null, (err, preview) => {
        if(err) next(err, null)
        else res.json(preview)
    })
})

app.all('*', (req, res) => res.status(400).json({msg: 'Invalid request'}))

app.use(function (err, req, res, next) {
    res.status(400).json({msg: 'URL not provided'})
})

app.listen(PORT, () => console.log('Listening on '+PORT))