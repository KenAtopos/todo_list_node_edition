const express = require("express");
const mongoose = require("mongoose");
let ejs = require("ejs");
const _ = require("lodash");
const PORT = process.env.PORT || 3000;

require('dotenv').config()

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
main().catch(err => console.log(err));

async function main() {
    mongoose.connect(process.env.ATLAS_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); 
}

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema],
});

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const buy = new Item({
  name: "Buy food",
});

const cook = new Item({
  name: "Cook food",
});

const eat = new Item({
  name: "Eat food"
});

// const today = new Date();
// const options = {
//   weekday: "long",
//   day: "numeric",
//   month: "long",
// }

// const day = today.toLocaleDateString("en-US", options);

app.get("/", (req, res) => {

  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany([buy, cook, eat], (err) => {
        if (err) {
          console.log(err)
        } else {
          console.log("Successfully added.")
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newItems: foundItems,
      });
      // foundItems.forEach(item => {
      //   console.log(item.name)
      // });
    }
  });
});

app.post("/", (req, res) => {
  const item = req.body.nextToDoList;
  const listName = req.body.list;
  const newItem = new Item({
    name: item,
  });

  if (listName === "Today") {
    newItem.save();;
    res.redirect("/");
  } else {  
    List.findOne({name: listName}, (err, foundList) => {
        foundList.items.push(newItem);
        foundList.save();
        res.redirect(`/${listName}`)
    })
  }
});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: [buy, cook, eat],
                });
            
                list.save();
                res.redirect(`/${customListName}`);
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    newItems: foundList.items,
                })
            }
        } else {
            console.log(err);
        }
    });

    
});

app.post("/work", (req, res) => {
  const item = req.body.nextToDoList;
  workItems.push(item);
  res.redirect("/work")
})

app.get("/about", (req, res) => {
  res.render("about")
})

app.post("/delete", (req, res) => {
    const checkedId = req.body.checkBox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedId, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Item removed.");
                res.redirect("/");
            }
        })
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}, (err, foundList) => {
            if (!err) {
                res.redirect(`/${listName}`);
            } else {
                console.log(foundList);
            }
        })
    } 
});

app.listen(process.env.PORT || 3000, () => {
  console.log("this server is working.");
});
