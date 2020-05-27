"use strict";

var budgetController = function () {
  var Expense = function Expense(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(100 * this.value / totalIncome);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function Income(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      'exp': [],
      'inc': []
    },
    totals: {
      'exp': 0,
      'inc': 0
    },
    budget: 0,
    percentage: -1
  };

  var calculateTotal = function calculateTotal(type) {
    var sum = 0;
    data.allItems[type].forEach(function (current, index, array) {
      sum = sum + current.value;
    });
    data.totals[type] = sum;
  };

  return {
    addItem: function addItem(type, des, val) {
      var newItem; // Create new ID 

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      } // Create new Item


      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      data.allItems[type].push(newItem); // Return the new element

      return newItem;
    },
    deleteItem: function deleteItem(type, id) {
      //
      var ids = data.allItems[type].map(function (current, index, array) {
        return current.id;
      });
      index = ids.indexOf(id);

      if (index != -1) {
        //delete the item
        data.allItems[type].splice(index, 1);
      }
    },
    calculateBudget: function calculateBudget() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc'); // calculate the budgetL income - expenses

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round(100 * (data.totals.exp / data.totals.inc));
      } else {
        data.percentage = -1;
      }
    },
    calculatePercentage: function calculatePercentage() {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },
    getBudget: function getBudget() {
      return {
        budget_: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },
    getPercentages: function getPercentages() {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },
    test: function test() {
      console.log(data);
    }
  };
}();

var UIController = function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: ".container",
    expensesPercLabel: '.item__percentage',
    dateLabel: ".budget__title--month"
  };

  var formatNumber = function formatNumber(num, type) {
    // + or - before number
    // exactly 2 decimal points
    // comma separating the thousands
    // + 2,310.46
    var numSplit, _int, decimal, sign;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    _int = numSplit[0];
    decimal = numSplit[1];

    if (_int.length > 3) {
      _int = _int.substr(0, _int.length - 3) + ',' + _int.substr(_int.length - 3, 3);
    }

    type === 'exp' ? sign = '-' : sign = '+';
    return sign + _int + '.' + decimal;
  };

  return {
    getInput: function getInput() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },
    addListItems: function addListItems(obj, type) {
      var html, newHtml; // Create HTML strings with plcaholder text

      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },
    deleteListItem: function deleteListItem(selectorID) {
      var element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },
    clearFields: function clearFields() {
      var fields;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
      var fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },
    displayBudget: function displayBudget(obj) {
      var type;
      obj.budget_ < 0 ? type = 'exp' : type = 'inc';
      console.log(obj);
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget_, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },
    displayPercentages: function displayPercentages(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      var nodeListForEach = function nodeListForEach(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "\%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: function displayMonth() {
      var now = new Date();
      var now, year, month, date, day;
      months = ['Jan', 'Feb', 'March', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
      year = now.getFullYear();
      month = now.getMonth();
      date = now.getDate();
      day = now.getDay();
      document.querySelector(DOMstrings.dateLabel).textContent = year + " " + months[month] + " " + date + "th";
    },
    changeType: function changeType() {
      var fields = document.querySelectorAll(DOMstrings.inputType + ', ' + DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

      var nodeListForEach = function nodeListForEach(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };

      nodeListForEach(fields, function (current) {
        current.classList.toggle('red-focus');
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },
    getDOMstrings: function getDOMstrings() {
      return DOMstrings;
    }
  };
}();

var controller = function (budgetCtrl, UICtrl) {
  var setupEventListener = function setupEventListener() {
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(UICtrl.getDOMstrings().inputBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
  };

  var updateBudget = function updateBudget() {
    //Calculate the budget
    budgetCtrl.calculateBudget(); // Return the budget

    var budget = budgetCtrl.getBudget();
    console.log(budget); // Display the budget on the UI

    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function updatePercentage() {
    // Calculate the percentages
    budgetCtrl.calculatePercentage(); // add them to the budget ctrl

    var percentages = budgetCtrl.getPercentages(); // update the UI with the new percentages

    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function ctrlAddItem() {
    var input = UICtrl.getInput(); // Add the new item to the budget controller

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      UICtrl.addListItems(newItem, input.type);
      UICtrl.clearFields();
      updateBudget();
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function ctrlDeleteItem(event) {
    var itemID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // inc - %id%;
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      console.log(ID); // delete the item in the data structure

      budgetCtrl.deleteItem(type, ID); // delete the item from UI

      UICtrl.deleteListItem(itemID); // update and show the new budget

      updateBudget();
      updatePercentage();
    }
  };

  return {
    init: function init() {
      console.log('Application has started');
      setupEventListener();
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget_: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  };
}(budgetController, UIController);

controller.init();