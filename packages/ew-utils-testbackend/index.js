const express = require('express')
const app = express()
const bodyParser = require('body-parser');


const producingAssets = []
const consumingAssets = []

app.use(bodyParser.json())


app.get('/ProducingAsset/:id', (req, res) => {
  console.log(`GET - ProducingAsset ${req.params.id}`)
  res.send(producingAssets[req.params.id])
})

app.put('/ProducingAsset/:id', function (req, res) {
  console.log(`PUT - ProducingAsset ${req.params.id}`)
  producingAssets[req.params.id] = req.body
  res.send("success")
})


app.get('/ConsumingAsset/:id', (req, res) => {
  console.log(`GET - ConsumingAsset ${req.params.id}`)
  res.send(consumingAssets[req.params.id])
})



app.put('/ConsumingAsset/:id', function (req, res) {
  console.log(`PUT - ConsumingAsset ${req.params.id}`)
  consumingAssets[req.params.id] = req.body
  res.send("success")
})


app.listen(3030);