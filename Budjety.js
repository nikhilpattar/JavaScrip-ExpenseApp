/**
 * keycodes.atjayjo.com/#
 * 
 * blog.garstasio.com/you-dont-need-jquery/dom-manipulation/
 */
/****************************************** Budget Controller *****************************************************/

var budgetController = (function()
{
    var Expense = function(id, description, value, percentage)
    {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = percentage;
    };

    var Income = function(id, description, value)
    {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {  // Will be used for list of Expenses and Income (exp and inc reduce declaring new variables)
            exp: [],
            inc: []
        },
        totalExpenses: // Will be used to display Expenses and Income on UI/ Update UI
        {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1 // Because, -1 is like something not existing
    }

    var calculateTotal = function(type)
    {
        var sum = 0;
        data.allItems[type].forEach(function(current)
        {
            sum += current.value;
        })
        data.totalExpenses[type] = sum;
    }

    return{
        addItem: function(type, des, val)
        {
            var newItem, ID, allItemsArray = data.allItems[type];
            //Create new ID
            /**
             * [ 1 2 3 4], consistently but when inc or exp deleted, ID looks somethng like
             * [2 3 6 8], here ID will be calculated based on (last element + 1)
             */
            if(allItemsArray.length > 0){
                ID = allItemsArray[allItemsArray.length - 1].id + 1;
            }
            else{
                ID = 0;
            }

            // Create newItem based on type i.e. exp and inc
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            // Add newItem to respective arrays 
            allItemsArray.push(newItem);  // Object['properties']
            return newItem;
        },
        calculateBudget: function()
        {
            //1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //2. Budget = income - expenses
            data.budget = data.totalExpenses.inc - data.totalExpenses.exp;

            //3. Calculate % for each expenses
            data.allItems.exp.forEach(function(current)
            {
                if(data.totalExpenses.inc > 0){
                    current.percentage = Math.round((current.value/data.totalExpenses.inc) * 100);
                }
                else{
                    current.percentage = -1;
                }
            });

            //4. Calculate % of income spent on expenses
            if(data.totalExpenses.inc > 0){
                data.percentage = Math.round((data.totalExpenses.exp/data.totalExpenses.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
            
        },
        getBudget: function()
        {
            return{
                finalBudget: data.budget,
                finalPercentage: data.percentage,
                finalExpenses: data.totalExpenses.exp,
                finalIncome: data.totalExpenses.inc
            };
        },

        getPercentages: function()
        {
            var expPercentages;

            expPercentages = data.allItems.exp.map(function(current)
            {
                return current.percentage;
            })

            return expPercentages;
        },

        deleteItem: function(ID, type)
        {
            // Using map method
            var ids, index;

            ids = data.allItems[type].map(function(current)
            {
                return current.id;
            });
        
            index = ids.indexOf(ID);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        testing: function()
        {
            console.log(data);
        }
    }
})();

/****************************************** UI Controller *****************************************************/

var uiController = (function()
{
    var DomStrings = {
        addButton: '.add__btn',
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        budgetLabel: '.budget__value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber =  function(number, type)
    {
        var numberSplit, int, dec;
        /**
         *  + & - signs for income and expenses respectively
         *  Decimal values.
         *  Comma for evry thousands
         * 
         *  eg: 24567.8976 -> + 24,567.90
         *      2345 -> + 2,345.00
         */
        number = Math.abs(number); // Removes sign off number

        number = number.toFixed(2); // Adds decimal value for 2 place and returns string

        numberSplit = number.split('.');
        int = numberSplit[0];
        dec = numberSplit[1];

        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3);
        }
        type === 'inc' ? int = '+ ' + int : int = '- ' + int;

        return int +'.'+ dec;
    };

    var nodeListForEach = function(list, callBack)
    {
        for(var i = 0; i < list.length; i++)
        {
            callBack(list[i], i);
        }
    };

    return {
        getAddData: function() // Instead of returning all variables, use object
        {
            return{
                addType: document.querySelector(DomStrings.inputType).value,
                addDescription: document.querySelector(DomStrings.inputDescription).value,
                addValue: parseFloat(document.querySelector(DomStrings.inputValue).value)
            };
        },
        getDomStrings: DomStrings,
        updateAddItems: function(obj, type)
        {
            var html, newHTML, element;

            // Crete HTML string with placeholder text i.e. "Add Description"
            if(type === 'inc')
            {
                element = DomStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';  
            }
            else if(type === 'exp')
            {
                element = DomStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace  holder with value
            newHTML = html.replace('%id%', obj.id); //Not displayed but used to Cntrol/Delete elements
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));
            
            // Insret HTML into DOM, Select an element in DOM and place HTMl next to that
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);
        },

        deleteAddItems: function(deleteId)
        {
            var deleteElement = document.getElementById(deleteId);

            deleteElement.parentNode.removeChild(deleteElement)
        },

        clearFields: function()
        {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DomStrings.inputDescription+', '+DomStrings.inputValue);
            
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current) {
                current.value = ''; // User can use both '' / "", Jonas used "" may be because of some HTML stuff
            });

            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj)
        {
            var type;

            obj.finalBudget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.finalBudget, type);
            document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.finalIncome, 'inc');
            document.querySelector(DomStrings.expenseLabel).textContent = formatNumber(obj.finalExpenses, 'exp');
            if(obj.finalPercentage > 0){
                document.querySelector(DomStrings.percentageLabel).textContent = obj.finalPercentage + '%';
            }
            else{
                document.querySelector(DomStrings.percentageLabel).textContent = 'N/A';
            }

        },

        dislayPercentages: function(arr)
        {
            var fieldList = document.querySelectorAll(DomStrings.expPercentageLabel); // returns nodeList
            
            // Jonas way, quite confusing but passed function definition acts as an argument to another function
        
            nodeListForEach(fieldList, function(current, index)
            {
                if(arr[index] > 0){
                    current.textContent = arr[index] +'%';
                }
                else{
                    current.textContent = 'N/A';
                }
            });
            
           /*
            // Nikhil way, used function as an argument and declared function definition separately
           var nodeListForEach = function(list, func)
           {
               for(var i = 0;i < list.length;i++)
               {
                   func(list[i], i);
               }   
           }

           function callback(current, index)
           {
               if(arr[index] > 0){
                   current.textContent = arr[index] +'%';
               }
               else{
                   current.textContent = '---';
               }
           }
            
           nodeListForEach(fieldList, callback);
           */
        },

        displayDate: function()
        {
            var now, month, months, year;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 
            'September', 'October', 'November', 'December'];
            now = new Date();
 
            document.querySelector(DomStrings.dateLabel).textContent = months[now.getMonth()] +', '+now.getFullYear();
        },

        changeType: function()
        {
            var fields;

            fields = document.querySelectorAll(
            DomStrings.inputType +','+
            DomStrings.inputDescription+','+
            DomStrings.inputValue);

            nodeListForEach(fields, function(current)
            {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DomStrings.addButton).classList.toggle('red');
        }
    };    
})();

/****************************************** App Controller *****************************************************/

var appController = (function(budgetCtrl, uiCtrl)
{
    var setupEventListeners = function()
    {    
        var appDomStrings = uiCtrl.getDomStrings;
        
        document.querySelector(appDomStrings.addButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event)
        {
            if(event.keyCode === 13 || event.which === 13)
            {
                ctrlAddItem();
            }
        });
        
        document.querySelector(appDomStrings.container).addEventListener('click', controlDeleteItem);

        document.querySelector(appDomStrings.inputType).addEventListener('change', uiCtrl.changeType);
    };

    var updateBudget = function()
    {
        var budget, percentages;
        //1. Calculate budget
        budgetCtrl.calculateBudget();
        
        //2. Return budget
        budget = budgetCtrl.getBudget();

        //3. Display the budget on UI
        uiCtrl.displayBudget(budget);

        //4. Get percentages for each expenses
        percentages = budgetCtrl.getPercentages();
        
        //5. Display percentages for each expenses
        uiCtrl.dislayPercentages(percentages);
        
    };

    var ctrlAddItem = function()
    {
        var addInput, newItem;

        //1. Get the field data
        addInput = uiCtrl.getAddData();     
        if(!isNaN(addInput.addValue) && addInput.addDescription !== '' && addInput.addValue > 0)
        {
            //2. Add item to budget controller
            newItem = budgetCtrl.addItem(addInput.addType, addInput.addDescription, addInput.addValue);
            
            //3a. Add the item to the UI
            uiCtrl.updateAddItems(newItem, addInput.addType);

            //3b. Clear desccription and value field
            uiCtrl.clearFields();
            
            //4. Calculate and update budget
            updateBudget();
        }
        
    };

    var controlDeleteItem = function(event)
    {
        var itemId, splitId, type, id;
        
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id; //event delegation
        console.log(itemId);

        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            id = splitId[1];
        }

        //1. Delete the item from data structure
        budgetCtrl.deleteItem(parseInt(id), type);

        //2. Delete the item from UI
        uiCtrl.deleteAddItems(itemId);

        //3. Update and display budjet
        updateBudget();
    };

    return{
        init: function()
        {
            console.log('Application has started!!');
            uiController.displayDate();
            uiController.displayBudget({
                finalBudget: 0,
                finalPercentage: -1,
                finalExpenses: 0,
                finalIncome: 0
            });
            setupEventListeners();
        }
    }
})(budgetController, uiController);

appController.init();

