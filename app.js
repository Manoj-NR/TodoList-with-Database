const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://Admin_Mac:Mac123@cluster0.re4zyzr.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item1 = mongoose.model("Item", itemsSchema);

const itema = new Item1({
  name: "Welcome to your todolist!"
});

const itemb = new Item1({
  name: "Hit the + button to add a new item"
});

const itemc = new Item1({
  name: "<--Hit this to delete an item."
});

const defaultItems = [itema, itemb, itemc];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List1 = mongoose.model("List", listSchema);




app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.get("/", function(req, res) {
  Item1.find({}, function(err, foundItem){

    if(foundItem.length === 0){
      Item1.insertMany(defaultItems, function(err){
        if(err)
        console.log(err);
        else
        console.log("successfully saved default items to DB.")
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today",kindItems: foundItem});
    }


  });


});

app.get("/:customName", function(req, res){
  const customListName = _.capitalize(req.params.customName);

  List1.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create new list
        const list = new List1({ //document
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        //show existing listTitle
        res.render("list", {listTitle: foundList.name,kindItems: foundList.items})
      }
    }
  });



});


app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", kindItems: workItems});
});


app.get("/about", function(req, res){
  res.render("about");
});


app.post("/", function(req, res){

  const itemNew = req.body.newItem
  const listName = req.body.btn  //value of btn get stored in listName

  const itemN = new Item1({
    name: itemNew
  });

  if(listName === "Today"){
    itemN.save();
    res.redirect("/");
  }
  else{
    List1.findOne({name: listName}, function(err, foundList){
      foundList.items.push(itemN); //found list will have document of listName and it that document we have an items array of type itemSchema into the we will push new item that we created
      foundList.save(); //now save the updated document in the list collection
      res.redirect("/"+ listName);
    });
  }




});

app.post("/delete", function(req, res){
  const checkedId = req.body.check;
  const listName = req.body.listName;

  if(listName === "Today"){
      Item1.findByIdAndRemove(checkedId, function(err){
        if(!err){
          console.log("successfully deleted checked one");
          res.redirect("/");
        }
      });

    }
    else{
      List1.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, function(err){
        if(!err){
          res.redirect("/"+listName);
        }
      });
    }
  });



let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}




app.listen(port, function() {
  console.log("server started on the port 3000");
});
