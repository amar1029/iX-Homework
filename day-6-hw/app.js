class Task {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        // this.priority = priority;
    }
}
class TaskListPage {
    constructor() {
        this.tasks = [];
    //     this.priority = {
    //         "H": {
    //             "color": "red",
    //             "message": "Finish in 1 day"
    //         },
    //         "M": {
    //             "color": "yellow",
    //             "message": "Finish in 3 days"
    //         },
    //         "L": {
    //             "color": "green",
    //             "message": "Finish this week"
    //         }
    //     }
     }

    addTask(title) {
        const taskId = this.tasks.length + 1;
        const task = new Task(taskId, title);
        this.tasks.push(task);
        const taskListElement = document.getElementById("taskList");
        const row = document.createElement("tr");
        row.setAttribute("data-task-id", task.id);
        row.innerHTML = `
      <td class="text-center">${task.title}</td>
      <td class="text-center"><button data-action="edit" data-task-id="${task.id}" class="btn btn-primary">Edit</button></td>
      <td class="text-center"><button data-action="delete" data-task-id="${task.id}" class="btn btn-danger">Delete</button></td>
      <td class="text-center"><form>
      <div class="form-group">
        <select class="form-control selectPriority" data-action="select">
        <option class="text-secondary">Select Priority</option>
          <option class="bg-success">Low</option>
          <option class="bg-warning">Medium</option>
          <option class="bg-danger">High</option>
        </select>
      </div>
    </form></td>
      `;

        taskListElement.appendChild(row);
        document.getElementById("task").value = "";

        addTaskData(task);

        function addTaskData(task) {
            firebase
                .database()
                .ref("tasks/" + taskId)
                .set({
                    id: task.id,
                    task: task.title
                });
        }

    }
    startEditingTask(taskId) {
        for (let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].id == taskId) {
                const task = this.tasks[i];
                const taskInputElement = document.getElementById("task");
                taskInputElement.value = task.title;
                taskInputElement.setAttribute("data-task-id", task.id);
                document.getElementById("addBtn").innerText = "Save";
            }
        }
    }
    saveTaskTitle(taskId, taskTitle) {
        const task = this.tasks.find((task) => task.id == taskId);
        if (!task) return;
        task.title = taskTitle;

        const existingRow = document.querySelector(`tr[data-task-id="${task.id}"]`);
        if (!existingRow) return;
        existingRow.children[0].innerHTML = task.title;
        const taskInput = document.getElementById("task");
        taskInput.removeAttribute("data-task-id");
        taskInput.value = "";
        document.getElementById("addBtn").innerText = "Add";

        const database = firebase.database();
        const tasksDatabase = database.ref(`/tasks/${task.id}/`);
        tasksDatabase.set({
            id: task.id,
            title: task.title
        })
    }

    deleteTask(taskId) {
        for (let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].id == taskId) {
                const task = this.tasks[i];
                const deleteRow = document.querySelector(`tr[data-task-id="${task.id}"]`)
                deleteRow.parentNode.removeChild(deleteRow);

                const database = firebase.database();
                database.ref('tasks/' + taskId).remove();
            }
        }
    }
}
const taskListPage = new TaskListPage();
document.getElementById("addBtn").addEventListener("click", (e) => {
    const taskInputElement = document.getElementById("task");
    const taskTitle = taskInputElement.value;
    const existingTaskId = taskInputElement.getAttribute("data-task-id");
    if (existingTaskId) {
        taskListPage.saveTaskTitle(existingTaskId, taskTitle);
    } else {
        taskListPage.addTask(taskTitle);
    }
});

document.getElementById("taskList").addEventListener("click", (e) => {
    const action = e.target.getAttribute("data-action");
    if (action == "edit") {
        const taskId = e.target.getAttribute("data-task-id");
        taskListPage.startEditingTask(taskId);
    } else if (action == "delete") {
        const taskId = e.target.getAttribute("data-task-id");
        taskListPage.deleteTask(taskId);
    } else if (action == "select") {
        $(".selectPriority").change(function(){
            var color = $("option:selected", this).attr("class");
            $(".selectPriority").attr("class", color);
        });
    }
});

document.getElementById('fetchTasks').addEventListener('click', (e) => {
    const database = firebase.database();
    const taskDatabase = database.ref('tasks');
    taskDatabase.on('value', function (snapshot) {
        const fetchData = snapshot.val();
        console.log(fetchData.map(key => key.task))
    })
})


