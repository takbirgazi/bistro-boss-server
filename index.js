const express =  require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

// MongoDB Start


const { MongoClient, ServerApiVersion } = require('mongodb');
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

    app.get('/menu', async(req, res)=>{
        const menus = await allMenus.find().toArray();
        res.send(menus);
    })
    app.get('/reviews', async(req, res)=>{
        const review = await allReviews.find().toArray();
        res.send(review);
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