const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fqvfigl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const database = client.db('jobster_db');
    const usersColletion = database.collection('users');
    const jobsColletion = database.collection('alljobs');

    app.post('/users', async(req, res)=>{
      const user = req.body;
      console.log(user);
      const result = await usersColletion.insertOne(user);
      res.send(result);
    })

    app.get('/users/:email', async(req, res)=>{
      const email = req.params.email;
      const query = {email};
      const user = await usersColletion.findOne(query);
      res.send(user);
    })

    app.put('/updateUser/:email', async(req, res)=>{
      const email = req.params.email;
      const data = req.body;
      
      const name = data.name;
      const location = data.location;

      const query = {email};
      const user = await usersColletion.findOne(query);
      const filter = {_id: new ObjectId(user._id)};

      const option = {upsert: true};

      const updateDoc = {
        $set:{
          name: name,
          location: location
        }
      }

      const result = await usersColletion.updateOne(filter, updateDoc, option);
      res.send(result);

    })

    app.post('/alljobs', async(req, res)=>{
      const job = req.body;
      // console.log(job);
      const result = await jobsColletion.insertOne(job);
      res.send(result);
    })

    app.get('/alljobs/:email', async(req, res)=>{
      const email = req.params.email;
      const query = {userEmail:email};

      const result = await jobsColletion.find(query).toArray();
      res.send(result);
    })

    app.delete('/deletejob/:id', async(req, res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};

      const result = await jobsColletion.deleteOne(query);
      res.send(result);
    })

    app.put('/updatejobs/:id', async(req, res)=>{
      const id = req.params.id;
      
      const data = req.body;
      // console.log(data);
      
      const position = data.position;
      const company = data.company;
      const jobLocation = data.jobLocation;
      const status = data.status;
      const jobType = data.jobType;

      const filter = {_id: new ObjectId(id)};

      const option = {upsert: true};

      const updateDoc = {
        $set:{
          position:position,
          company:company,
          jobLocation:jobLocation,
          status:status,
          jobType:jobType
        }
      }

      const result = await jobsColletion.updateOne(filter, updateDoc, option);
      res.send(result);
    })
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Our Jobster is Run')
})

app.listen(port, () => {
  console.log(`Jobster app listening on port ${port}`)
})
