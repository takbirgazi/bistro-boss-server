const express =  require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

// MongoDB Start


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PWD}@cluster0.mbbwdlc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const database = client.db("bistroBossDB");
    const allMenus = database.collection("menu");
    const allReviews = database.collection("reviews");
    const carts = database.collection("carts");
    const users = database.collection("users");

    // Middleware 
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({message: 'Unauthorize access'})
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
        if (err) {
          return res.status(401).send({message: 'unauthorize access'})
        }
        req.decoded = decoded;
        next();
      })
    }

    // Admin verify
    const verifyAdmin = async(req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await users.findOne(query);
      const isAdmin = user?.role === "Admin";
      if (!isAdmin) {
        res.status(403).send({message:"Forbidden Access"})
      }
      next();
    }


    //JWT API
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      });
      res.send(token); // token:token
    })

    app.get('/menu', async(req, res)=>{
        const menus = await allMenus.find().toArray();
        res.send(menus);
    })
    app.get('/reviews', async(req, res)=>{
        const review = await allReviews.find().toArray();
        res.send(review);
    })
    app.get('/carts', async(req, res)=>{
      const email = req.query.email;
      const query = {email:email}
      const cart = await carts.find(query).toArray();
      res.send(cart);
    })
    app.post('/carts', async(req, res)=>{
        const cart = req.body;
        const result = await carts.insertOne(cart);
        res.send(result);
    })
    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const result = await users.find().toArray();
      res.send(result);
    })
    app.get('/users/admin/:email', verifyToken, async(req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({message: 'Forbidden assess'})
      }
      const query = { email: email }
      const user = await users.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'Admin';
      }
      res.send({ admin });
    })

    app.post('/users', async(req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existUser = await users.findOne(query);
      if (existUser) {
        return res.send({message: 'Already Have The User', insertedId: null})
      }
      const result = await users.insertOne(user)
      res.send(result)
    })
    app.delete('/users/:id',async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await users.deleteOne(query);
      res.send(result);
    })

    app.patch('/users/admin/:id',async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const updatedDAta = {
        $set: {
          role:'Admin'
        }
      }
      const result = await users.updateOne(query, updatedDAta);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// MongoDB End

app.get('/', (req, res)=>{
    res.send('Bistro Boss Is Running');
})
app.listen(port, ()=>{
    console.log(`Server Is Running at port ${port}`);
})