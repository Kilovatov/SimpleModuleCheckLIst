var MODULE = (function(my) {

    function Task(arr) {
        var keys = Object.keys(my.config.tasks.scheme);
        for (var i = 0; i < arr.length; i++) {
            var key = keys[i];
            this[key] = arr[i];
        }
    };

    function templater(html) {
        return function(data) {
            for (var x in data) {
                var re = "{{\\s?" + x + "\\s?}}";
                html = html.replace(new RegExp(re, "ig"), data[x]);
            }
            return html;
        };
    };

    function deadlineCondition(deadline) {
        return function(task) {
            if (new Date(task.deadline) < deadline && new Date(task.deadline) > new Date() && !isDoneCondition(task)) {
                return true;
            } else {
                return false;
            }
        }
    };

    function isDoneCondition(task) {
        return task.done;
    };

    function clearTabControls(className) {
        var controls = document.querySelectorAll('.' + className);
        for (var i = 0; i < controls.length; i++) {
            controls[i].classList.remove('active');
        }
    };

    function showItems(container, condition) {
        for (var i = 0; i < my.config.tasks.list.length; i++) {
            if (condition(my.config.tasks.list[i])) {
                container.childNodes[i].style.display = 'block';
            } else {
                container.childNodes[i].style.display = 'none';
            }
        }
    };

    my.config = {
        tasks: {
            scheme: {
                texts: 'string',
                deadline: 'date',
                done: 'boolean'
            },
            list: []
        },

        tabs: {
            scheme: {
                name: 'string',
                condition: 'function'
            },
            list: [{
                name: 'Today',
                condition: deadlineCondition((new Date().setDate((new Date()).getDate() + 1)))
            }, {
                name: 'Week',
                condition: deadlineCondition((new Date().setDate((new Date()).getDate() + 7)))
            }, {
                name: 'All',
                condition: function(task) {
                    return !isDoneCondition(task)
                }
            }, {
                name: 'Done',
                condition: isDoneCondition
            }]
        },

        myForm: [{
            label: '',
            type: 'string',
            name: 'text',
            placeholder: 'Task'
        }, {
            label: 'till',
            type: 'date',
            name: 'till',
            placeholder: new Date()
        }],

        addNewInput: function(newLabel, newType, newName, newPlaceholder) {
            my.config.myForm.push({
                label: newLabel,
                type: newType,
                name: newName,
                placeholder: newPlaceholder
            });
            my.config.tasks.scheme[newName] = newType;
        },

        addNewFilter: function(newName, newCondition) {
            my.config.tabs.list.push({
                name: newName,
                condition: newCondition
            });
        }
    }

    my.toDo = document.createElement('div');


    my.init = function(container, newForm, newTabs) {
        if (newForm) {
            this.config.myForm = newForm;
            for (var i = 0; i < newForm.length; i++) {
                my.config.tasks.scheme[newForm.name] = newForm.type;
            }
        }
        if (newTabs) {
            this.config.tabs.list = newTabs;
        }
        this.render(container);
    };

    my.renderTask = function(task) {
        var template = templater('<section class="task">' +
            '<input type="checkbox" {{checked}}' +
            '<p> {{task}}</p>' +
            '</section>');
        this.toDo.innerHTML += template({
            task: task.texts,
            checked: task.done? 'checked': ''
        });
    };

    my.render = function(container) {
        container.innerHTML = '';
        for (var i = 0; i < this.config.myForm.length; i++) {
            container.innerHTML += templater("<div class='form-group'>" +
                "<label> {{label}} </label>" +
                "<input type={{myType}} class='form-control'" +
                'placeholder="{{myPlaceholder}}" name="{{myName}}" required>' +
                "</div>")({
                    label: this.config.myForm[i].label,
                    myType: this.config.myForm[i].type,
                    myPlaceholder: this.config.myForm[i].placeholder,
                    myName: this.config.myForm[i].name
                });
        };
        container.innerHTML = "<form name='create' class='form-inline' onsubmit = 'MODULE.createTask(this);return false;'>" + container.innerHTML +
            "<button class='btn btn-default'>create</button></form>";
        var str = '';
        for (var i = 0; i < this.config.tabs.list.length; i++) {
            str += templater("<li class='tab__control__item' onclick='MODULE.activePanel(this)'><a href='#'>" +
            "{{title}}</a></li>")({
                title: this.config.tabs.list[i].name
            });
        }
        container.innerHTML += "<nav class='nav nav-tabs'>" + str + "</nav>";
        this.toDo.innerHTML = '';
        for (var i = 0; i < this.config.tasks.list.length; i++) {
            this.renderTask(this.config.tasks.list[i]);
        }
        container.appendChild(this.toDo);
    };

    my.createTask = function(form) {
        var arr = [];
        for (var i = 0; i < form.elements.length; i++) {
            if (form.elements[i].type == 'date') {
                arr[i] = new Date(form.elements[i].value);
            } else {
                arr[i] = form.elements[i].value ? form.elements[i].value : false; //false for done field
            }
        }
        var task = new Task(arr);
        this.config.tasks.list.push(task);
        form.reset();
        this.renderTask(task);
    };

    my.activePanel = function(panel) {
        clearTabControls('tab__control__item');
        panel.classList.add('active');
        for (var i = 0; i < my.config.tabs.list.length; i++) {
            if (my.config.tabs.list[i].name == panel.textContent) {
                showItems(my.toDo, my.config.tabs.list[i].condition);
            }
        }
    }
    return my;


}({}));



MODULE.init(document.getElementsByClassName('container')[0]);
