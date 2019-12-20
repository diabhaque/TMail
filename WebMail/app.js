var express  = require('express');
const bodyParser= require('body-parser');
const cors=require("cors");
var app = express();

var monk = require('monk');
var db = monk('localhost:27017/assignment1');

app.use(function(req,res,next){
    req.db = db;
    next();
})

app.use(cors);
app.use(express.static('public'));
app.use(bodyParser.json());

app.get('/setMaxPage', function(req, res){
  var db=req.db;
  var collection= db.get('emailList');
  var inboxSize=3;
  var importantSize=4;
  var sentSize=5;
  var trashSize=6;
  var response='';
  collection.find({mailbox:'Inbox'}).then((docs)=>{
    var docLength=docs.length;
    if(docs.length%4==0){
      docLength--;
    }
    inboxSize=Math.floor(docLength/4).toString();
    response+=inboxSize;
    collection.find({mailbox:'Important'}).then((docs)=>{
      var docLength=docs.length;
      if(docs.length%4==0){
        docLength--;
      }
      importantSize=Math.floor(docLength/4).toString();
      response+=importantSize;
      collection.find({mailbox:'Sent'}).then((docs)=>{
        var docLength=docs.length;
        if(docs.length%4==0){
          docLength--;
        }
        sentSize=Math.floor(docLength/4).toString();
        response+=sentSize;
        collection.find({mailbox:'Trash'}).then((docs)=>{
          var docLength=docs.length;
          if(docs.length%4==0){
            docLength--;
          }
          trashSize=Math.floor(docLength/4).toString();
          response+=trashSize;
          res.send(response);
        })
      })
    })
  })
})

app.get('/openemail', function(req, res){
  var db=req.db;
  var collection= db.get('emailList');
  var identity=req.query.id;
  collection.find({_id: identity}).then((docs)=>{
    var i=0;
    if(docs.length>0){
      response="<div class='fullEmail'><div class='emailTop'><div id='titleEmail'> Title: "+docs[i]['title']+"</div><div id='timeEmail'>"+docs[i]['time']+"</div></div><div id='sender'>Sender: "+docs[i]['sender']+"</div><div id='recipient'> Recipient: "+docs[i]['recipient']+"</div><div id='content'>"+docs[i]['content']+"</div></div>";
      res.send(response);
    }else{
      res.send("Error: Could not open email");
    }
  })
})

app.get('/getids', function(req, res){
  var db=req.db;
  var collection= db.get('emailList');
  var mail=req.query.mailbox;
  collection.find({mailbox:mail}).then((docs)=>{
    var response='';
    if(docs.length>0){
      for(var i=0;i<docs.length; i++){
        response+=docs[i]['_id'];
        response+=';'
      }
      res.send(response);
    }else{
      res.send("Error: Could not open email");
    }
  })
})

app.get('/retrieveemaillist', function(req, res){
  var db=req.db;
  var collection= db.get('emailList');
  var mail=req.query.mailbox;
  var pageNum=req.query.page;
  collection.find({mailbox:mail},{sort: {_id: -1}}).then((docs)=>{
    if(docs.length>0){
      var responseArray=[]
      var page=[]
      for(var i=0; i<docs.length;){
        page.push("<div id='allEmailContainer'>")
        for (var x=0; x<4; x++){
          var string=docs[i]['_id'].toString();
          var display="onclick='displayEmail(\""+ string +"\")'"
          var text="";
          var titleText='';
          if (docs[i]['title'].length>20){
            titleText=docs[i]['title'].substr(0, 17)+"...";
          }else{
            titleText=docs[i]['title'];
          }
          text="<div class='emailContainer'><input class='check' type='checkbox' id='"+string+"' onchange='addToList(this)'><div class='receptor' "+ display+">"+docs[i]['recipient']+"</div><div class='titles' "+ display+">"+titleText+"</div><div class='theTime' "+ display+">"+docs[i]['time']+"</div></div>"
          page.push(text)
          i++;
          if(i>=docs.length){
            break;
          }
        }
        page.push("</div>")
        var toShare=page.join('')
        responseArray.push(toShare);
        var page=[]
      }
      res.send(responseArray[pageNum]);
    }else{
      res.send('No email in inbox');
    }
  })
})

app.post('/move', function(req, res){
  var db=req.db;
  var collection= db.get('emailList');
  const {ids, location}=req.body;
  for(var i=0; i<ids.length; i++){
    collection.findOneAndUpdate({_id: ids[i]}, { $set: { mailbox: location} }).then((updatedDoc)=>{
    })
  }
  res.send('This is complete...')
})

app.get('/compose', function(req, res){
  response="<div id='composer'><form id='emailform' onsubmit='sendEmail()'><div id='newmessage'><h2>New Message</h2></div><div id='to'>To: <input type='text' name='recipient' required id='recip'></div><div id='subject'>Subject: <input type='text' name='title' id='titl' required></div><div id='textlarge'><textarea name='content' form='emailform' id='cont' required></textarea></div><div id='submitButt'><input type='submit' value='Send' class='buttons' id='submitButton'></div></form></div>"
  res.send(response);
})

app.get('/sendemail', function(req, res){
  var recipient=req.query.recipient;
  var title=req.query.title;
  var content=req.query.content;
  var db=req.db;
  var collection= db.get('emailList');
  var now=new Date().toUTCString();
  var day=now.slice(0, 3);
  var date=now.slice(5, 7);
  var month=now.slice(8,11);
  var year=now.slice(12,16);
  var time=now.slice(17,25);
  var final=time+" "+day+" "+month+" "+date+" "+year;
  
  collection.insert({
    'sender': 'me@cs.hku.hk',
    'recipient': recipient,
    'title': title,
    'time': final,
    'content': content,
    'mailbox': 'Sent'
  })
  res.send('done');
})

var server=app.listen(8081, function(){
  console.log("App is running...");
})


