// Eric De Leenheer's To-Do List
// 100869527    10/23/23

var sortableList = document.querySelector(".sortable-list");

// grabs from local storage
var amount = localStorage.getItem("amount");
// grab each list elelemnt
for (let i=0; i < amount; i++){
    let array = localStorage.getItem(i).split(',');
    newTask(array[0],array[1],array[2],array[3]);
}
sortAll();

function setup() {      
    // this code is a little beyond me... but i'll try to explain it
    var items = sortableList.querySelectorAll(".item");
    items.forEach(item => {
        item.addEventListener("dragstart", () => {
            // Adding dragging class to item after a delay
            setTimeout(() => item.classList.add("dragging"), 0);
        });
        // Removing dragging class from item on dragend event
        item.addEventListener("dragend", () => item.classList.remove("dragging"));
    });

    const initSortableList = (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector(".dragging");
        // Getting all items except currently dragging and making array of them
        let siblings = [...sortableList.querySelectorAll(".item:not(.dragging)")];

        // Finding the sibling after which the dragging item should be placed
        let nextSibling = siblings.find(sibling => {
            return e.clientY <= sibling.offsetTop - window.scrollY + sibling.offsetHeight / 2;
        });     //    ^ not sure what this guy do, but it works

        // Inserting the dragging item before the found sibling
        sortableList.insertBefore(draggingItem, nextSibling);
    }
    sortableList.addEventListener("dragover", initSortableList);
    sortableList.addEventListener("dragenter", e => e.preventDefault());
}
setup();

function editTitle(titleElement) {
    // Get the current title text
    const currentTitle = titleElement.textContent;

    // Create an input field
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = currentTitle;

    // Replace the title with the input field
    titleElement.textContent = '';
    titleElement.appendChild(input);

    input.focus();

    const saveChanges = () => {
        const newTitle = input.value;
        if (newTitle === "") {
            // If the edited title is empty, remove the parent li element
            titleElement.parentElement.parentElement.remove();
        } else {
            // Otherwise, update the title and remove the input field
            titleElement.textContent = newTitle.trim();
        }
        document.removeEventListener("click", clickListener);
    };

    // Add an event listener to handle Enter key press
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            saveChanges();
        }
    });
    // Add a click event listener on the document to save changes when clicking outside the input field
    var clickListener = (e) => {
        if (input.value != ' ') {
            saveChanges();
        }
    };
    document.addEventListener("click", clickListener);
}

function sortAll() {
    const items = sortableList.querySelectorAll(".item");
    const itemsArray = Array.from(items);

    // Calculate the initial positions of the items
    const initialPositions = itemsArray.map((item) => {
        return item.getBoundingClientRect().top;
    });

    // Sort the items based on their id attribute
    itemsArray.sort((a, b) => {
        const idA = a.id;
        const idB = b.id;
        const ord = ["done", "low", "mid", "high"];
        // Custom sort function
        return ord.indexOf(idB) - ord.indexOf(idA);
    });

    // Calculate the new positions of the items
    const newPositions = itemsArray.map((item) => {
        return item.getBoundingClientRect().top;
    });

    // Calculate the difference in position between initial and new positions
    const positionDifferences = initialPositions.map((initialPosition, index) => {
        return newPositions[index] - initialPosition;
    });

    // Apply CSS transition to move the elements to their new positions
    itemsArray.forEach((item, index) => {
        item.style.transition = "transform 0.3s ease-in-out";
        item.style.transform = `translateY(${positionDifferences[index]}px)`;
    });

    // Clear the html list and reinsert the sorted items back into the list
    sortableList.innerHTML = "";
    itemsArray.forEach((item) => {
        sortableList.appendChild(item);
    });

    // Use setTimeout to reset the transition properties after the animation
    setTimeout(() => {
        itemsArray.forEach((item) => {
            item.style.transition = "";
            item.style.transform = "";
        });
    }, 0); // Adjust the time to match your transition duration
}


function storeAllData(){
    // clear everything else in the local storage
    localStorage.clear();
    // get all items into an array
    const items = sortableList.querySelectorAll(".item");
    const itemsArray = Array.from(items);

    // store how many items we are about to put into storage
    localStorage.setItem("amount", itemsArray.length);
    localStorage.amount = itemsArray.length;

    // store an array for each element of the list in local storage
    for (var i=0; i<itemsArray.length; i++){
        localStorage.setItem(i, [   // store at i for easy retrival with a for loop
            itemsArray[i].children[0].children[1].textContent.replace(',',''),  // just in case you try to mess with it
            itemsArray[i].children[1].value,
            itemsArray[i].children[2].children[0].textContent,
            itemsArray[i].children[0].children[0].checked,
        ]);
    }

}
// save data often
document.addEventListener("click", storeAllData);

function newTask(Name, date, priority, completed) {
    // create all of the html elements 
    let listElement = document.createElement("li");
    let div = document.createElement("div");
    let checkbox = document.createElement("input");
    let title = document.createElement("span");
    let dots = document.createElement("i");
    let removeButton = document.createElement("button");
    let dateThing = document.createElement("input");
    let priorityDiv = document.createElement("div");
    let priorityButton = document.createElement("button");

    // give each element the properties it needs
    listElement.className = "item";
    listElement.draggable = true;
    listElement.id = priority.toLowerCase();
    div.className = "details";
    checkbox.type = "checkbox";
    checkbox.className = "checkbox";
    checkbox.name = "checkboxOfTask";
    checkbox.checked = (completed == "true");
    title.textContent = Name;
    title.className = "title"
    dots.className = "uil uil-draggabledots";
    removeButton.textContent = "Delete";
    removeButton.className = "removeButton";
    dateThing.type = "date";
    dateThing.name = "dateOfTask";
    dateThing.value = date;
    priorityDiv.className = "priority-Thing"
    priorityButton.textContent = priority;
    priorityButton.className = "priority-"+priority;

    // give functions to each of the elements
    checkbox.addEventListener("click", () => {
        if (checkbox.checked){
            listElement.id = "done";
        } else {
            listElement.id = priorityButton.textContent.toLowerCase();
        }
    });

    // Enable double-click to edit titles
    title.addEventListener("dblclick", () => {
        editTitle(this); 
    });

    // makes the delete button work
    removeButton.addEventListener("click", () => {
        sortableList.removeChild(listElement);      
    });

    // make the priority button cycle
    priorityButton.addEventListener("click", () => {   
        if (checkbox.checked) {return;}
        switch (priorityButton.textContent){
            case "Low":
                priorityButton.textContent = "Mid";
                priorityButton.className = "priority-Mid";
                listElement.id = "mid";
                break;
            case "Mid":
                priorityButton.textContent = "High";
                priorityButton.className = "priority-High";
                listElement.id = "high";
                break;
            case "High":
                priorityButton.textContent = "Low";
                priorityButton.className = "priority-Low";
                listElement.id = "low";
                break;
        }
    });

    if (checkbox.checked) {listElement.id = "done"}

    // place all of the list elements into their appropriate div
    priorityDiv.appendChild(priorityButton);
    div.appendChild(checkbox);
    div.appendChild(title);
    listElement.appendChild(div);
    listElement.appendChild(dateThing);
    listElement.appendChild(priorityDiv);
    listElement.appendChild(removeButton);
    listElement.appendChild(dots);

    // insert into the overall html
    sortableList.insertBefore(listElement, sortableList.firstChild);
    setup();    // necessary for the drag and drop reaordering (not sure why)

    // if user clicked the new button rather than loaded from storage
    if (Name == " "){editTitle(title);}
}


// for some reason chrome would auto scroll to the bottom, this fixes it
window.setTimeout(()=>{window.scrollTo(0,0)}, 50);


function randomizeAll(){
    const items = sortableList.querySelectorAll(".item");
    const itemsArray = Array.from(items);

    // Calculate the initial positions of the items
    const initialPositions = itemsArray.map((item) => {
        return item.getBoundingClientRect().top;
    });

    // Sort the items based on their id attribute
    itemsArray.sort((a, b) => {
        const idA = a.id;
        const idB = b.id;
        const ord = ["done", "low", "mid", "high"];
        // Custom sort function
        return Math.random() - 0.5;
    });

    // Calculate the new positions of the items
    const newPositions = itemsArray.map((item) => {
        return item.getBoundingClientRect().top;
    });

    // Calculate the difference in position between initial and new positions
    const positionDifferences = initialPositions.map((initialPosition, index) => {
        return newPositions[index] - initialPosition;
    });

    // Apply CSS transition to move the elements to their new positions
    itemsArray.forEach((item, index) => {
        item.style.transition = "transform 0.3s ease-in-out";
        item.style.transform = `translateY(${positionDifferences[index]}px)`;
    });

    // Clear the html list and reinsert the sorted items back into the list
    sortableList.innerHTML = "";
    itemsArray.forEach((item) => {
        sortableList.appendChild(item);
    });

    // Use setTimeout to reset the transition properties after the animation
    setTimeout(() => {
        itemsArray.forEach((item) => {
            item.style.transition = "";
            item.style.transform = "";
        });
    }, 0); // Adjust the time to match your transition duration
}
