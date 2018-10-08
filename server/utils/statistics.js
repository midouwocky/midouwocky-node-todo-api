
const moment = require('moment');
var { Todo } = require('./../models/todo');
var { User } = require('./../models/user');


var formatDigit = (myNumber) => {
    return formattedtoday = ("0" + myNumber).slice(-2);
};

var statistics = async(user)=>{
    var categroies = [
        'Work',
        'Shopping',
        'Sport',
        'Learning',
        'Cooking',
        'Other'
    ]
    var todos = await Todo.find({ _creator: user._id });
    var todosAppend = todos.filter((todo) => !todo.completed);
    var todosDone = todos.filter((todo) => todo.completed);
    var now = new moment();
    var today = now.date();
    var month = now.month();
    var year = now.year();
    var dateString = `${year}-${formatDigit(month + 1)}-${formatDigit(today)}`;
    var date = moment(dateString);

    var week = [];
    var statistics = [];
    for (let index = 0; index < 7; index++) {
        let day = new moment(new moment(date.format()).subtract(index, 'days').format());
        week.push(day);
    }

    for (let date of week) {
        let dateStamp = date.format('x');
        let todayStamp = parseInt(dateStamp);
        let tomorrowStamp =todayStamp+ (24 * 60 * 60 * 1000);
        let categoriesStats = [];
        var todosDoneThisWeek = todos.filter((todo) => todo.completedAt >= todayStamp && todo.completedAt < tomorrowStamp);
        var todosCreatedThisWeek = todos.filter((todo) => todo.createdAt >= todayStamp && todo.createdAt < tomorrowStamp);

        for (let cat of categroies) {
            let count = await Todo.countDocuments({ _creator: user._id, category: cat, completed: true,completedAt: {$gte:todayStamp,$lt:tomorrowStamp} });
            categoriesStats.push({category:cat,count})
        }
        statistics.push({ day: dateStamp, todos: todosCreatedThisWeek, completedTodos: todosDoneThisWeek,categoriesStats });
    };
    return({
        total: todos.length,
        completed: todosDone.length,
        nonCompleted: todosAppend.length,
        statistics
    });
}
module.exports = {statistics};