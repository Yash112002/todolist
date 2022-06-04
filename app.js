//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect("mongodb+srv://admin-yash:9818664936@cluster0.0u2ciwe.mongodb.net/ToDoListDB", {
  // mongodb+srv://admin-yash:<password>@cluster0.0u2ciwe.mongodb.net/?retryWrites=true&w=majority
  useNewUrlParser: true
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to do list"
});
const item2 = new Item({
  name: "Hit + to add an item in list"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItem = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model('List', listSchema);

Item.find({}, (err, foundItems) => {
  if (err)
    console.log(err);
  else {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, (err) => {
        if (err)
          console.log(err);
        else
          console.log("successfully added the items in DB");
      });
    }
  }
})

app.get("/", function (req, res) {

  Item.find({}, (err, items) => {
    if (err)
      console.log(err);
    else {
      res.render("list", {
        listTitle: "Home",
        newListItems: items
      });
    }
  })

});

app.post("/", function (req, res) {
  const item = req.body.newItem;
  const list = req.body.list;
  const newItem = new Item({
    name: item
  })
  if (list === "Home") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: list
    }, (err, found) => {
      found.items.push(newItem);
      found.save();
      res.redirect("/" + list);
    })
  }
});

app.post("/delete", (req, res) => {
  const id = req.body.checkBox;
  const listName = req.body.listName;
  if (listName === "Home") {
    Item.findByIdAndRemove(id, (err) => {
      if (err) console.log(err);
      else console.log("successfully deleted the item from item database");
    })
    res.redirect("/");
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: id
        }
      }
    }, (err, result) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }
})

app.get("/:title", (req, res) => {
  const listName = _.capitalize(req.params.title);;
  List.findOne({
    name: listName
  }, (err, found) => {
    if (!err) {
      if (!found) {
        const list = new List({
          name: listName,
          items: defaultItem
        });
        list.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {
          listTitle: found.name,
          newListItems: found.items
        });
      }
    }
  })
})


app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server started on port 3000");
});