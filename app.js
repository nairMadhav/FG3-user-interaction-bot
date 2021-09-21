const http = require('http');
const express = require('express');
require('dotenv').config();
const BusBoy=require('busboy')
const FileUpload=require('express-fileupload');


//middleware 
const port=process.env.PORT;
const app=express();
app.use(FileUpload())

//mock db from userData.json to mimick order details of users
const userDb=require('./userData.json')
console.log(`There are ${userDb.users.length} users in the mock DB`)

//=============================================================

app.get('/upload',(req,res)=>{
    /* The IOS frontend should send the audio stream 
        as an audio file here
        ...
        This is just a test to check if the file io works
    */
    res.sendFile(__dirname+'/file-io-test.htm')
})

app.post('/upload',(req,res)=>{
    /*
    The audio stream from the user is uploaded to the server over here
    

    maybe it could be piped instead of downloading it locally?
    */
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }
    console.log(req)
    const file=req.files.audio;
    const uploadPath=__dirname+'/uploadedFiles/'+file.name;

    file.mv(uploadPath,(err)=>{
        console.log(err)
    })

})
//get JSON of specific userx
app.get(`/api/:uid`,(req,res)=>{
    const user=userDb.users.filter(user=>user._id==req.params.uid)
    res.status(200).send(user)
})


//get the number of orders a user has
app.get(`/api/numOrders/:uid`,(req,res)=>{
    const user=userDb.users.filter(user=>user._id==req.params.uid)
    res.status(200).send(user[0].orders.length.toString())
})


//Get the number of orders for a specific user that have a specific status code
app.get(`/api/numOrders/:uid/:status`,(req,res)=>{
    /*
        status codes:
        0-Delivered
        100-Out for delivery
        200-Shipped
        300-Order Confirmed

        return these values in future iterations
     */

    const user=userDb.users.filter(user=>user._id==req.params.uid)
    const orders=(user.map(user=>user.orders)[0]).filter(order=>order.status==req.params.status)
    console.log(orders.length)
    res.status(200).send(orders.length.toString())
})
app.get(`/api/get-desc/:uid`,(req,res)=>{

    const user=userDb.users.filter(user=>user._id==req.params.uid);
    const orders=(user.map(user=>user.orders)[0])
    console.log(user)
    console.log(orders.length)
    var desc=`My name is ${user[0].username}.\n I have ordered ${orders.length.toString()} items.\n`;
    
    for(i=0;i<orders.length;i++){
        desc+=(` My ${orders[i].desc} `)
        switch (orders[i].status) {
            case 0:
                desc+= `has been delivered.\n`
                break;
            case 100:
                desc+= `is currently out for delivery.\n`
                break;
            case 200:
                desc+= `has been shipped.\n`
                break;
            case 300:
                desc+= `order has been confirmed.\n`
                break;
            default:
                desc+= `status is unavailable.\n`
                break;
        }
    }
    res.status(200).send(desc);
    console.log(desc)
})






//==================================================================================
app.listen(port,()=>{
    console.log(`server is up on http://localhost:${port}`)
})

