const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');



app.use(express.static("public"));
app.use(express.json());




app.use(cors())
app.use(express.static("public"));
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) =>{
    const authorization = req.headers.authorization;
    if(!authorization){
      return res.status(401).send({error: true, message: 'unauthorized access'})
    }
    const token = authorization.split(' ')[1];
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
      const classesCollection = client.db("Assignment-12").collection('classes')
      const bookingsCollection = client.db("Assignment-12").collection('bookings')
      const paymentCollection = client.db("Assignment-12").collection('payment')
      const instructorCollection = client.db("Assignment-12").collection('instructors')
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
  
  // jwt verification 
      app.post('/jwt', (req, res)=>{
        const body = req.body;
        const token = jwt.sign(body, process.env.Access_Token, {expiresIn : '1h'})
        res.send(token)
      })
     
      app.get('/user/admin/:email', verifyJWT,  async (req, res) =>{
        const email = req.params.email;
        const decoEmail = req.decoded.email;
        
        if(email !== decoEmail){
          return ({admin: false})
        }
        const query = {email: email};
        const user = await userCollection.findOne(query);
        const result = {admin: user?.role === 'admin'}
        res.send(result)
      })
      app.get('/user/instructor/:email', verifyJWT,  async (req, res) =>{
        const email = req.params.email;
        const decoEmail = req.decoded.email;
        if(email !== decoEmail){
          return ({instructor: false})
        }
        const query = {email: email};
        const user = await userCollection.findOne(query);
        const result = {instructor: user?.role === 'instructor'}
        res.send(result)
        
      })
      app.get('/allUsers', verifyJWT, veryfyAdmin, async(req, res)=>{
        const result = await userCollection.find().toArray();
        res.send(result)
      })
      app.put('/users/role/:id', verifyJWT, veryfyAdmin, async(req, res)=>{
        const id = req.params.id;
        const body = req.body;
        const query = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const updateDoc = {
          $set: body,
        }
        const result = await userCollection.updateOne(query, updateDoc, options)
        res.send(result)
      })
      app.post('/user', async(req, res) =>{
          const data = req.body;
          const query = {email: data.email};
          const user = await userCollection.findOne(query);
          if(user){
            return res.send({message: 'user already exist'})
          }
          const result = await userCollection.insertOne(data);
          res.send(result)
      })
      app.get('/instructorClasses/:email', verifyJWT, async(req, res)=>{
        const email = req.params.email;
        const decoEmail = req.decoded.email;
        if(email !== decoEmail){
          return ({instructor: false})
        }
        const query = {instructorEmail: email}
        const result = await classesCollection.find(query).toArray();
        res.send(result)
      })
      app.get('/allClasses/:email', verifyJWT, veryfyAdmin, async(req, res)=>{
        const email = req.params.email;
        const decoEmail = req.decoded.email;
        if(email !== decoEmail){
          return ({admin: false})
        }
        const result = await classesCollection.find().toArray();
        res.send(result)
      })
      app.get('/approvedClasses', async(req, res)=>{
        const query = {status: 'approved'}
        const result = await classesCollection.find(query).toArray();
        res.send(result)
      })
      app.put('/approve/:id', verifyJWT, veryfyAdmin, async(req, res)=>{
        const id = req.params.id;
        const body = req.body;
        const query = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const updateDoc = {
          $set: body,
        }
        const result = await classesCollection.updateOne(query, updateDoc, options)
        res.send(result)
      })
      app.put('/classUpdate/:id', verifyJWT, async(req, res)=>{
        const id = req.params.id;
        const body = req.body;
        const query = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const updateDoc = {
          $set: body,
        }
        const result = await classesCollection.updateOne(query, updateDoc, options)
        res.send(result)
      })
      app.put('/seatsUpdate/:id', verifyJWT, async(req, res)=>{
        const id = req.params.id;
        const body = req.body;
        const query = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const updateDoc = {
          $set: body,
        }
        const result = await classesCollection.updateOne(query, updateDoc, options)
        res.send(result)
      })
      app.post('/bookings', verifyJWT, async(req, res)=>{
        const body = req.body;
        const result = await bookingsCollection.insertOne(body)
        res.send(result)
      })
      app.get('/selected/:email', verifyJWT, async(req, res)=>{
        const email = req.params.email;
        const query = {email : email}
        const result = await bookingsCollection.find(query).toArray();
        res.send(result)
      })
      
      app.get('/Allinstructors',  async(req, res)=>{
        const query = {role : 'instructor'}
        const result = await userCollection.find(query).toArray();
        res.send(result)
      })
      app.delete('/delete/:id', verifyJWT, async(req, res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await bookingsCollection.deleteOne(query);
        res.send(result)
      })
      app.post('/addClass/:email',verifyJWT, async(req, res) =>{
        const email = req.params.email;
        const decoEmail = req.decoded.email;
        const body = req.body;
        if(email !== decoEmail){
          return ({instructor: false})
        }
        const result = await classesCollection.insertOne(body)
        res.send(result)
      })
      app.post('/create-payment-intent', verifyJWT, async (req, res) => {
        const { price } = req.body;
        const amount = parseInt(price * 100);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
          payment_method_types: ['card']
        });
  
        res.send({
          clientSecret: paymentIntent.client_secret
        })
      })
      app.get('/enrolledItem/:email', verifyJWT, async(req, res)=>{
        const email = req.params.email;
        const query = {email: email}
        const result = await paymentCollection.find(query).toArray();
        res.send(result);
      })
      app.post('/payment', verifyJWT, async(req, res)=>{
        const body = req.body;
        const result = await paymentCollection.insertOne(body)
        res.send(result);
      })
      app.get('/history/:email', async(req, res)=>{
        const email = req.params.email
        const query = {email: email}
        const options = {
          sort: { date: -1 },
          
        };
        const result = await paymentCollection.find(query, options).toArray();
        res.send(result);
      })
      app.get('/popular', async(req, res)=>{
        const query = {status: 'approved'}
        const result = await classesCollection.find(query).limit(6).sort({student: -1}).toArray();
        res.send(result);
      })
      app.put('/instructors/:email', verifyJWT, async(req, res)=>{
        const body = req.body;
        const email = req.params.email;
        const query = {email: email}
        const options = { upsert: true };
        const updateDoc = {
          $set: body,
        }
        const result = await instructorCollection.updateOne(query, updateDoc, options)
        res.send(result);
      }) 
      app.get('/instructorsData/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email: email}
        const result = await instructorCollection.findOne(query);
        res.send(result);
      })
      app.get('/popularInstructor', async(req, res)=>{
        const result = await instructorCollection.find().sort({student: -1}).limit(6).toArray();
        res.send(result);
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