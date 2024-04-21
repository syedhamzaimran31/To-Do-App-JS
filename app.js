import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { orderBy } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import {
  getFirestore,
  onSnapshot,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";

// Copy From Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyDR3AaPyuveZYqww_A0EJ9b93bti6wF8Yw",
  authDomain: "to-do-smit.firebaseapp.com",
  projectId: "to-do-smit",
  storageBucket: "to-do-smit.appspot.com",
  messagingSenderId: "945748855119",
  appId: "1:945748855119:web:25bac231390461cf839d3a",
  measurementId: "G-8YERYYKY5T",
};

// Initialize Firebase here
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//get all elements from html by using their ID
let saveBtn = document.getElementById("saveBtn");
let addBtn = document.getElementById("addBtn");
let inputField = document.getElementById("toDoInput");
let todoList = document.getElementById("toDoList");
let deleteAllBtn = document.getElementById("deleteAllBtn");
let todoInput = document.getElementById("toDoInput");
let getData = document.getElementById("getData");
const todos = [];

let editLi = null;
let todoInputValue = todoInput.value;

deleteAllBtn.style.display = "none";
saveBtn.style.display = "none";

function addTask() {
  let todoInput = document.getElementById("toDoInput");
  let todoInputValue = todoInput.value;

  //check the input should not be empty
  if (todoInputValue.trim()) {
    deleteAllBtn.style.display = "inline-block";
    const addDataInFirestore = async () => {
      const timestamp = new Date().getTime();
      const payload = {
        id: timestamp,
        todo: todoInputValue,
      };
      try {
        const docRef = await addDoc(collection(db, "todos"), payload);
        console.log("Document written with ID: ", docRef);
        todoInput.value = "";
        console.log("Data stored sucessfully");
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    };
    addDataInFirestore();

    todoInput.value = "";
  }
}

const readData = async () => {
  let toDoItem = "";
  const q = query(collection(db, "todos"), orderBy("id", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    querySnapshot.forEach((doc) => {
      todos.push({
        id: doc.id,
        data: doc.data(),
      });
    });
    console.log(todos);
    if (todos.length > 0) {
      deleteAllBtn.style.display = "inline-block";
      toDoItem = todos
        .map(
          (todoObj) =>
            `<li class="listCreated" data-id="${todoObj.id}">${todoObj.data.todo}<button class="btn btn-outline-primary editBtn">Edit</button><button class="btn btn-outline-danger deleteBtn">Delete</button></li>`
        )
        .join("");

      todoList.innerHTML = toDoItem;
      todos.length = 0;
    }

    document.querySelectorAll(".editBtn").forEach((editButton) => {
      editButton.addEventListener("click", () => {
        // const q = query(collection(db, "todos"), orderBy("id", "desc"));
        // const unsubscribe = onSnapshot(q, (querySnapshot) => {
        //   querySnapshot.forEach((doc) => {
        //     todos.push({
        //       id: doc.id,
        //       data: doc.data(),
        //     });
        //   });
        // });

        // Get the id of the clicked item
        const todoId = editButton.parentElement.getAttribute("data-id");

        // Get the data corresponding to the id
        const selectedTodo = todos.find((todo) => todo.id === todoId);

        // Input field with the selected todo data
        todoInput.value = selectedTodo.data.todo;

        // Show the save button and hide the add button
        saveBtn.style.display = "inline-block";
        addBtn.style.display = "none";

        // Store the id of the selected todo for updating later
        editLi = todoId;
      });
    });
    document.querySelectorAll(".deleteBtn").forEach((deleteButton) => {
      deleteButton.addEventListener("click", async () => {
        const todoId = deleteButton.parentElement.getAttribute("data-id");

        try {
          // Delete the document from Firestore
          await deleteDoc(doc(db, "todos", todoId));
          console.log("Document successfully deleted!");

          const remainingTodos = await getDocs(collection(db, "todos"));
          if (remainingTodos.size === 0) {
            location.reload();
            console.log(todoList.children.leng);
          }
        } catch (e) {
          console.error("Error deleting document: ", e);
        }
        console.log(`Todos length ${todoId}`);
        console.log(`Del Btn length ${deleteButton.length}`);
      });
    });
  });
};

// Add event listener for the save button
saveBtn.addEventListener("click", () => {
  // Update the selected todo in Firestore
  const updatedData = { todo: todoInput.value };
  updateDoc(doc(db, "todos", editLi), updatedData);

  // Reset input field and buttons
  todoInput.value = "";
  saveBtn.style.display = "none";
  addBtn.style.display = "inline-block";
  editLi = null;
});

deleteAllBtn.addEventListener("click", async () => {
  let confirmText = "Do you want to delete all the to-dos";
  if (confirm(confirmText)) {
    if (todoList.children.length > 0) {
      try {
        // Get all documents from the "todos" collection
        const querySnapshot = await getDocs(collection(db, "todos"));

        // Delete each document
        querySnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        console.log("All documents successfully deleted!");
      } catch (e) {
        console.error("Error deleting all documents: ", e);
      }
      location.reload();
      // todoList.innerHTML = "";
    }
    deleteAllBtn.style.display = "none";
  }
});
// const deleteAllData = await deleteDoc(doc(db, "todos"));

addBtn.addEventListener("click", addTask);
readData();
