//Budget Controller
let budgetController = (function(){//анонимная самовыз функция. Создает закрытый скоуп, то есть делать некоторые переменные приватными. Возвращает в объекте, в котором все публичные функици
    let Expense = function(id, description, value){//создаем конструктор, для создания нескольких схожих объектов. То есть какждый раз при клике, в UI будет добалсять новый объект
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome){//создаём прототип, что бы в памяти был только 1 метод, которому все могут обратиться
        if(totalIncome > 0){
            this.percentage =Math.round((this.value / totalIncome)*100);
        } else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    let Income = function(id, description, value){//создаем конструктор, для создания нескольких схожих объектов. То есть какждый раз при клике, в UI будет добалсять новый объект
        this.id = id;
        this.description = description;
        this.value = value;
    };

    calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(cur){//выбрали тип
            sum += cur.value;
        }); 
        data.totals[type] = sum;
    };

    let data = {//создаем один объект, в котором будет вся инфа про новые объекты
        allItems: {//тут будет ещё один объект, в котором будет прибыль и траты, просто сгруппируем в удобном порядке
            exp: [],
            inc: []
        },     
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1//не существует к данному моменту
    };
    return {
        addItem: function(type, des, val){//в тайп мы можем получить или exp или inc, ниже пишем data.allItems[type].push(newItem); это ок, так как type совпадаем с нашими названиями массива. То есть мы создали новый протоип класса или Expense или Income и добавли его в data.allItems.exp/inc
            let newItem, ID;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;//последний элемент массива +1
            }else{
                ID = 0;
            }
            
            if(des==='' || val==='' || isNaN(val) || val < 0){
                alert('Fill all fields');
            }else{
                if(type === 'exp'){
                    newItem = new Expense(ID, des, val);
                } else if(type === 'inc'){
                    newItem = new Income(ID, des, val);
                }
                //Добавляем новый элемент 
                data.allItems[type].push(newItem);
                return newItem;//нам понадобится новый item
            }
        },
        deleteItem: function(type, id){
            let ids, index;

            ids = data.allItems[type].map(function(current){//map возвращает новый array
                return current.id;
            });
            index = ids.indexOf(id);//вернет индекс массива, у которого id равен тому, что мы задали

            if( index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            //calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) *100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){

            /*
            a=20
            b=10
            c=40
            income =100
            a=20/100=20%
            */
           data.allItems.exp.forEach(function(cur){//каждому элементу массива вызвать функцию подсчёта процентов
                cur.calcPercentage(data.totals.inc);//передаём весь income
           });
        },
        getPercentages: function(){
            let allPerc =data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });//надо, что бы тут нам вернулся новый массив
            return allPerc;
        },
        getBudget: function(){//объект со всей инфой
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function(){
            console.log(data);
        }
    };
})();



//UI Controller
let UIController = (function(){

    let DOMstrings = {//выносим все переменные в один объект
        inputType: '.add__type',
        inputDesctiption: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',

        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetValue: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',

        container: '.container',

        expensesPercLabel: '.item__percentage',
        
        dateLabel : '.budget__title--month',
    }
    let formatNumber =  function(num, type){
        let numSplit, int, dec;
        /* + - перед числами
            2 знака после запятой
            запятая , разделяющая тысячу
        */            
        num = Math.abs(num);//перезаписана
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];//часть, что до точки
        console.log(int.length);
        if(int.length >3){
           int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3,3);
        }

        dec = numSplit[1];

       
        return (type === 'exp' ? '-' : '+')+ ' ' + int + '.'+ dec;
    };

    let nodeListForEach = function(list, callback){//Тоже самое что и ForEach, только для узлов
        for(let i = 0; i<list.length; i++){
            callback(list[i], i);
        }
    };

    return {//тут все публичные методы
        getInput: function(){
            return {//лучше всего возвращать это объектом
                type : document.querySelector(DOMstrings.inputType).value,//inc or exp
                description : document.querySelector(DOMstrings.inputDesctiption).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };            
        },
        addListItem: function(obj, type){
            let html;
            //1 Созданим html string with placeholder text
            if(type ==='inc'){
                element = DOMstrings.incomeContainer;
            html = 
            `<div class="item clearfix" id="inc-${obj.id}">                             <div class="item__description">${obj.description}</div>
                     <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value)}</div>
                            <div class="item__delete">
                                <button class="item__delete--btn">
                                    <i class="ion-ios-close-outline"></i>
                                </button>
                            </div>
                    </div>
                </div>
            </div>`;
            } else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
            html = 
            `<div class="item clearfix" id="exp-${obj.id}">
                <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                        <div class="item__value">${formatNumber(obj.value, type)}</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn">
                                <i class="ion-ios-close-outline"></i>
                            </button>
                        </div>
                    </div>
            </div>`
            }
            

            //insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);//добавляем элемент в наш дом
        },

        deleteListItem: function(selectorID){//тот ID который нам передаётся
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);//просто такая странная конструкция
        },
        clearFields: function(){
                let fields, fieldsArr;

                fields = document.querySelectorAll(DOMstrings.inputDesctiption + ', ' + DOMstrings.inputValue);//возвразает нам лист/ чтобы исправить это надо будет изменить массив. при помощи трюка Array.prototype.slice.call(fields) slice делает из листа массива. но что бы нам его вызвать надо обратиться к прототипу Array
                fieldsArr = Array.prototype.slice.call(fields);
                fieldsArr.forEach(function(current, index, array){//доступ к текущему элементу, индекс элемента, к самому элементу
                    current.value = '';
                });
                fieldsArr[0].focus();//Фокус опять на description для того, чтобы опять вводить 
            },        
        displayBudget: function(obj){//В UI показываем наш бюджет
            let type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage +`%`;
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = `---`;
            }
        },

        displayPercentages: function(percentages){
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            

            nodeListForEach(fields, function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + `%`;
                }else{
                    current.textContent = '---';
                }
            });
        },
        displayMonth: function(){//текущий месяц
            let now, year, month, months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months= ['January','February', 'March','April', 'May', 'June', 'July', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changeType: function(){

            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDesctiption + ',' +
                DOMstrings.inputValue);
            
                nodeListForEach(fields,function(cur){
                    cur.classList.toggle('red-focus');
                });
                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        getDOMstrings: function(){
            return DOMstrings;//публикуем в публичной пользование domStrings
            
        }
    };

})();


//Global App Contorller
let controller = (function(budgetCtrl, UICtrl){//ВАЖНО!!! что бы наше приложение было независимым, то лучше назвать переменные разные именами. А потом уже вызвать эту функцию, с теми переменными, которые будем использовать/ Так же этот модуль, знает о других модулях, и  может использовать их код
    let setupEventListeners = function(){//делаем код чище. Создав одну функцию, где все запускается

        let DOM = UICtrl.getDOMstrings();//вызываем функцию

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode===13 || event.which === 13){//event.which для старых браузеров
                ctrlAddItem();
            };
            
        });//это происходит на глобальном элементе   

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);//добавили ивент на общий объект, что бы потом его делигировать
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    let updateBudget = function(){
        //5 посчитать бюджет
        budgetController.calculateBudget();
        //6 return the budget
        let budget = budgetCtrl.getBudget();
        //7 отобразить бюджет в UI        
        UICtrl.displayBudget(budget);
    }
    let updatePercentages = function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();
        //read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();
        // update the ui with new percentages
        UICtrl.displayPercentages(percentages);
    };

    let ctrlAddItem = function(){//расспределяет где что должно происходить
        let input, newItem;
        //1 Получить значение интпутов
        input = UICtrl.getInput();
        console.log(input);
        //2 Добавить айтем в bugetController
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //3 Добавить айтем в UI
        UICtrl.addListItem(newItem, input.type);//прокидываем объект, с его типом
        //4 отчистить инпут
        UICtrl.clearFields();
        //5 посчитать и апгрейдить бюжет
        updateBudget();
        //6  calc and upgrade percentages
        updatePercentages();
    }

    let ctrlDeleteItem = function(event){
        let itemID,splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;//находимся на главном элементе, где будет ID
        if(itemID){

            
            //inc-1
            splitID = itemID.split('-');//возвращает массив, с элементами разделенными по - у нас это ['inc', '1']
            type = splitID[0];//удобно тем, что в нашей структуре данных массивы называются exp inc, меньше работы, что бы назначить массивы в нужные индексы
            ID = parseInt(splitID[1]);//!!! обязательно перевести в число, возвращает строку

            //1. delete item from the data
            budgetCtrl.deleteItem(type, ID);
            //2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //3. update and show the new budget \
            updateBudget();
            //4 calc and update percentages
            updatePercentages();
        }
        
    };

    return{
        init: function(){//одна публиная функция. Здесь будет весь код, который мы захотим запустить, когда приложение запуститься
            console.log('test started');
            UICtrl.displayMonth();
            //7 отобразить бюджет в UI        
            UICtrl.displayBudget(
            {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });//Все сбрасываем в нуль
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);//здесь мы их и вызываем

controller.init();//вызываем функцию, которая заупскает ивент листенеры

