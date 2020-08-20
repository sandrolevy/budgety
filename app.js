//  BUDGET CONTROLLER

var budgetController = (function (){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
        this.percentage = Math.round((this.value / totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage
    }

    var Income = function (id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        moneyBalance.allItens[type].forEach(function (current){
            sum = sum + current.value;
        });
        moneyBalance.totals[type] = sum;
    };

    var moneyBalance = {
        allItens: {
            exp: [],
            inc: []
        },
        totals: {
            exp:0,
            inc:0 
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            // CREATE NEW ID
            if (moneyBalance.allItens[type].length > 0){
                ID = moneyBalance.allItens[type][moneyBalance.allItens[type].length - 1].id + 1;
            } else{
                ID = 0;
            }

            // CREATE NEW ITEM BASED ON 'INC' OR 'EXP' TYPE
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            // PUSH IT INTO OUR DATA STRUCTURE
            moneyBalance.allItens[type].push(newItem);

            // RETURN THE NEW ELEMENT
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;

            ids = moneyBalance.allItens[type].map(function(current){
                return current.id;
            })

            index = ids.indexOf(id);

            if (index !== -1){
                moneyBalance.allItens[type].splice(index, 1)
            }
        },

        calculateBudget: function(){

            // CALCULATE TOTAL INCOME AND EXPENSES
            calculateTotal('exp');
            calculateTotal('inc');

            // CALCULATE THE BUDGET: INCOME - EXPENSES
            moneyBalance.budget = moneyBalance.totals.inc - moneyBalance.totals.exp;

            // CALCULATE THE PERCENTAGE OF INCOME THAT WE SPENT
            if (moneyBalance.totals.inc > 0){
                moneyBalance.percentage = Math.round((moneyBalance.totals.exp / moneyBalance.totals.inc) * 100);
            } else {
                moneyBalance.percentage = -1;
            }

        },

        calculatePercentages: function(){
            moneyBalance.allItens.exp.forEach(function(current){
                current.calcPercentage(moneyBalance.totals.inc);
            });
        },

        getPercentages: function(){
            var allPerc = moneyBalance.allItens.exp.map(function (current){
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: moneyBalance.budget,
                totalInc: moneyBalance.totals.inc,
                totalExp: moneyBalance.totals.exp,
                percentage: moneyBalance.percentage
            };
        },

        testing: function() {
            console.log(moneyBalance);
        }
    }

})();

// UI CONTROLLER
var UIController = (function (){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber =  function(num, type) {
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];


        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i)
        }
    };

    return {
        getInput: function() {
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // CREATE HTML STRING WITH PLACEHOLDER TEXT

            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // REPLACE THE PLACEHOLDER TEXT WITH SOME DATA
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // INSERT THE HTML INTO THE DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId){
            var el = document.getElementById(selectorId)
            el.parentNode.removeChild(el)
        },

        clearFields: function (){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' %';
            } else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expPercentagesLabel);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0){
                current.textContent = percentages[index] + '%';
                } else {
                    current.textContent ='---';
                }
            });

        },

        displayMonth: function(){
            var now, year, month;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue
            );

            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            })

            document.querySelector(DOMstrings.inputButton).classList.toggle('red')

        },
        
        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();


// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    
    var setupEventListners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which ===13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType)
    };

    var updateBudget = function(){
        // 1. CALCULATE THE BUDGET
        budgetCtrl.calculateBudget();

        // 2. RETURN THE BUDGET
        var budget = budgetCtrl.getBudget();


        // 3. DISPLAY THE BUDGER ON THE UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        // 1. CALCULATE PERCENTAGES
        budgetCtrl.calculatePercentages();

        // 2. READ PERCENTAGES FROM THE BUDGET CONTROLLER
        var percentages = budgetCtrl.getPercentages();

        // 3. UPDATE THE UI WITH THE NEW PERCENTAGES
        UICtrl.displayPercentages(percentages);
    }
    
    var ctrlAddItem = function(){
        var input, newItem;

        // 1. GET THE FILED INPUT DATA
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value >0){

        // 2. ADD THE ITEM TO THE BUDGET CONTROLLER
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. ADD THE ITEM TO THE UI
        UICtrl.addListItem(newItem, input.type);

        // 3.1 CLEAR THE FIELD
        UICtrl.clearFields();
    };

        // 4. CALCULATE AND UPDATE BUDGET
        updateBudget();

        // 5. CALCULATE AND UPDATE PERCENTAGES
        updatePercentages();
    };

    var ctrlDeleteItem = function (event){
        var itemID, type, exp;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. DELETE THE ITEM FROM THE DATA STRUCTURE
            budgetCtrl.deleteItem(type, ID);

            // 2. DELETE THE ITEM FROM THE UI
            UICtrl.deleteListItem(itemID);


            // 3. UPDATE AND SHOW THE NEW BUDGET
            updateBudget();

            // 4. CALCULATE AND UPDATE PERCENTAGES
            updatePercentages();
        }

    };

    return {
        init: function(){
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListners();
        }
    }

})(budgetController, UIController);

controller.init();