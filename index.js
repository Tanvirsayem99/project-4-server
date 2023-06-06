const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');


require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) =>{
    const authorizatin = req.headers.authorizatin;
    if(!authorizatin){
      return res.status(401).send({error: true, message: 'unauthorized access'})
    }
    const token = authorizatin.split(' ')[1];
    jwt.verify(token, process.env.Access_Token,(err, decoded) =>{
      if(err){
        return res.status(403).send({error: true, message: 'unauthorized access'})
      }
      req.decoded = decoded;
      next()
    })
  }
  
  const uri = `mongodb+srv://${process.env.User_Name}:${process.env.User_Password}@cluster11.9w9o26r.mongodb.net/?retryWrites=true&w=majority`;
  
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();
  
      const userCollection = client.db("Assignment-12").collection('users')
      const assignmentCollection = client.db("Assignment-12").collection('assignment')
      const resultCollection = client.db("Assignment-12").collection('result')
      // Send a ping to confirm a successful connection

      const veryfyAdmin = async(req, res, next) =>{
        const email = req.decoded.email;
        const query = {email: email};
        const user = await userCollection.findOne(query);
        if(user?.role !== 'admin'){
          return res.status(403).send({error: true, message: 'unauthorized access'})
        }
        next()
      }
  
  
      app.post('/jwt', (req, res)=>{
        const body = req.body;
        const token = jwt.sign(body, process.env.Access_Token, {expiresIn : '1h'})
        res.send(token)
      })
      app.put('/users/:email', (req, res) =>{
          const data = req.body;
          const email = req.params.email;
          const options = { upsert: true };
          const query = {email: email};
          const updateDoc = {
            $set : data
          }
          const result = userCollection.updateOne(query, updateDoc, options)
          res.send(result)
          console.log(email)
      })
     
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res)=>{
    console.log(process.env.User_Name)
    res.send('hello bangla')
    
})

app.listen(port, ()=>{
    console.log(`this is the port ${port}`)
})