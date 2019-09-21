const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors')


var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}



const producingAssets = []
const consumingAssets = []
const demands = []
const supplies = []
const agreements = []
const matcher = []

app.use(bodyParser.json())

/**
 * Producing Asset
 */
app.get('/ProducingAsset/:id', cors(corsOptions), (req, res) => {
  console.log(`GET - ProducingAsset ${req.params.id}`)
  res.send(producingAssets[req.params.id])
})

app.put('/ProducingAsset/:id', cors(corsOptions), function (req, res) {
  console.log(`PUT - ProducingAsset ${req.params.id}`)
  producingAssets[req.params.id] = req.body
  res.send("success")
})

/**
 * Consuming Asset
 */
app.get('/ConsumingAsset/:id', cors(corsOptions), (req, res) => {
  console.log(`GET - ConsumingAsset ${req.params.id}`)
  res.send(consumingAssets[req.params.id])
})

app.put('/ConsumingAsset/:id', cors(corsOptions), (req, res) => {
  console.log(`PUT - ConsumingAsset ${req.params.id}`)
  consumingAssets[req.params.id] = req.body
  res.send("success")
})

/**
 * Demand 
 */
app.get('/Demand/:id', cors(corsOptions), (req, res) => {
  console.log(`GET - Demand ${req.params.id}`)
  res.send(demands[req.params.id])
})

app.put('/Demand/:id', cors(corsOptions), (req, res) => {
  console.log(`PUT - Demand ${req.params.id}`)
  demands[req.params.id] = req.body
  res.send("success")
})

/**
 * Supply
 */
app.get('/Supply/:id', cors(corsOptions), (req, res) => {
  console.log(`GET - Supply ${req.params.id}`)
  res.send(supplies[req.params.id])
})

app.put('/Supply/:id', cors(corsOptions), (req, res) => {
  console.log(`PUT - Supply ${req.params.id}`)
  supplies[req.params.id] = req.body
  res.send("success")
})

/**
 * Agreements
 */
app.get('/Agreement/:id', cors(corsOptions), (req, res) => {
  console.log(`GET - Agreement ${req.params.id}`)
  res.send(agreements[req.params.id])
})

app.put('/Agreement/:id', cors(corsOptions), (req, res) => {
  console.log(`PUT - Agreement ${req.params.id}`)
  agreements[req.params.id] = req.body
  res.send("success")
})

app.listen(3030);