var MODULE = (function(my) {

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
            if (new Date(task.deadline) < deadline && new Date(task.deadline) > new Date() && !isDoneCondition()(task)) {
                return true;
            } else {
                return false;
            }
        }
    };

    function expiredCondition() {
        return function(task) {
            if (task.deadline < new Date()) {
                return !isDoneCondition(task);
            } else {
                return false;
            }
        }
    };

    function isDoneCondition() {
        return function(task) {
            return task.done;
        }
    };

    function clearTabControls(className) {
        var controls = document.querySelectorAll('.' + className);
        for (var i = 0; i < controls.length; i++) {
            controls[i].classList.remove('active');
        }
    };

    function showItems(container, condition) {
        for (var i = 0; i < my.tasks.list.length; i++) {
            if (condition(my.tasks.list[i])) {
                container.childNodes[i].style.display = 'block';
            } else {
                container.childNodes[i].style.display = 'none';
            }
        }
    };

    my.toDo = document.createElement('div');

    my.tasks = {
        scheme: {
            texts: 'string',
            deadline: 'date',
            done: 'boolean'
        },
        list: []
    };

    my.tabs = {
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
                return !isDoneCondition()(task)
            }
        }, {
            name: 'Done',
            condition: isDoneCondition()
        }]
    };

    my.formDefault = [{
        label: '',
        type: 'text',
        name: 'text',
        placeholder: 'Task'
    }, {
        label: 'till',
        type: 'date',
        name: 'till',
        placeholder: new Date()
    }];

    my.Task = function(arr) {
        var keys = Object.keys(my.tasks.scheme);
        for (var i = 0; i < arr.length; i++) {
            var key = keys[i];
            this[key] = arr[i];
        }
    };

    my.init = function(container) {
        this.render(container);
        this.addFunctionality();
    };

    my.renderTask = function(task) {
        var template = templater(
            '<section class="task">' +
            '<input type="checkbox" {{checked}}>' +
            '<p>{{ task }}</p>' +
            '<button class="btn btn-default" name="del">delete</button>' +
            '<button type="button" class="btn btn-default" name="move">move to</button>' +
            '<button type="button" class="btn btn-default" name="edit">edit</button>' +
            '</section>');
        this.toDo.innerHTML += template({
            task: task.texts,
            checked: task.done ? 'checked' : ''
        });
    };

    my.render = function(container) {
        var form = document.createElement('form');
        form.name = "create";
        form.classList.add('form-inline');
        for (var i = 0; i < this.formDefault.length; i++) {
            var div = document.createElement('div');
            div.classList.add('form-group');
            div.innerHTML = templater(
                '<label>{{ label }}</label>' +
                '<input type={{ myType }} class="form-control"' +
                'placeholder={{myPlaceholder}} name="myName" required>')({
                label: this.formDefault[i].label,
                myType: this.formDefault[i].type,
                myPlaceholder: this.formDefault[i].placeholder,
                myName: this.formDefault[i].name
            });
            form.appendChild(div);
        }
        var button = document.createElement('button');
        button.classList.add('btn');
        button.classList.add('btn-default');
        button.innerHTML = 'create';
        form.appendChild(button);
        container.appendChild(form);
        var panel = document.createElement('nav');
        panel.classList.add('nav');
        panel.classList.add('nav-tabs');
        for (var i = 0; i < this.tabs.list.length; i++) {
            var li = document.createElement('li');
            li.classList.add('tab__control__item');
            li.innerHTML = templater('<a href="#">{{ title }}</a>')({
                title: this.tabs.list[i].name
            });
            panel.appendChild(li);
            if (this.tabs.list[i].name == 'All') {
                li.classList.add('active');
            }
        }
        container.appendChild(panel);
        this.toDo.innerHTML = '';
        for (var i = 0; i < this.tasks.list.length; i++) {
            this.renderTask(this.tasks.list[i]);
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
        var task = new this.Task(arr);
        this.tasks.list.push(task);
        form.reset();
        this.renderTask(task);
    };

    my.addFunctionality = function() {
        var panels = document.getElementsByClassName('tab__control__item');
        for (var i = 0; i < panels.length; i++) {
            panels[i].addEventListener('click', function() {
                clearTabControls('tab__control__item');
                this.classList.add('active');
                for (var i = 0; i < my.tabs.list.length; i++) {
                    if (my.tabs.list[i].name == this.textContent) {
                        showItems(my.toDo, my.tabs.list[i].condition);
                    }
                }
            });
        };
        var form = document.getElementsByName('create')[0];

        form.onsubmit = (function(e) {
            my.createTask(this);
            my.addFunctionality();
            e.preventDefault();
        });
    };


    return my;


}({}));



MODULE.init(document.getElementsByClassName('container')[0]);
