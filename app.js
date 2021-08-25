const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/ToDoListDB", {useNewUrlParser : true,  useUnifiedTopology: true});

const itemSchema = new mongoose.Schema({

    name : String
});

const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({

    name : "Welcome to your To Do List"

});

const item2 = new Item({

    name : "Hit the + Button to Add a new Item."
});

const item3 = new Item({

    name : "<-- Hit this to delete an item."

});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name : String,
    items : [itemSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

    Item.find(function(err, foundItems){

        if(foundItems.length === 0){

            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }
                else
                {
                    console.log("Success");
                }
            
            });

        }

        let day = date.getDate();
        res.render("list", {listTitle : day, newListItems : foundItems});
        
    });

});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;

    const item = new Item({

        name : itemName
    });

    item.save();

    res.redirect("/");

});

app.post("/delete", function(req, res) {

    const checkedItemId = req.body.checkbox;

    Item.deleteOne({_id : checkedItemId}, function(err){

        console.log("Successfully Deleted Item");
        res.redirect("/");

    });
});

app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;

    List.findOne({name : customListName}, function(err, foundList){

        if(!err){
        if(!foundList){

            const list = new List({

                name : customListName,
                items : defaultItems
        
            });
        
            list.save();

            res.redirect("/" + customListName);
        }
        else{

            res.render("list", {listTitle : foundList.name, newListItems : foundList.items});            
            
        }
    }

    });



});


app.listen(3000, function() {

    console.log("Server is up and listening on port 3000");
});