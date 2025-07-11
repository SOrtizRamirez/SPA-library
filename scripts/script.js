//Create routes
const routes = {
    "/": "./views/books.html",
    "/books": "./views/books.html",
    "/newBook": "./views/newBook.html",
    "/editBook": "./views/editBook.html",
    "/login": "./views/login.html",
    "/register": "./views/register.html",
    "/registerAdmin": "./views/registerAdmin.html",
    "/reservateBook": "./views/reservateBook.html",
    "/reservations": "./views/reservations.html"
}

// Variable to store the ID of the user currently being edited
let currentBookId = null;
let currentBookId2 = null;

//Function for generating a random id.
function generateRandomId() {
    return Math.random().toString(16).slice(2, 6); // genera algo como "d7f4"
}

// Show or hide the "Add user" button based on user role
function toggleAddBookButton() {
    const addButton = document.getElementById('add-book-btn');
    const addButton2 = document.getElementById('add-admin-btn');

    const role = localStorage.getItem('Auth');

    if (!addButton) {
        console.warn("Botón 'Agregar usuario' no encontrado.");
        return;
    }

    addButton.hidden = role === 'user';
    addButton2.hidden = role === 'user';

}


//Function to autenticate admin
function isAdministrator() {
    const auth = localStorage.getItem("Auth");
    return auth === "admin"
}


// Listen globally for clicks on elements with [data-link] attribute
document.body.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (!link) return;

    e.preventDefault();

    const href = link.getAttribute("href"); // Get the route from href
    const url = new URL(href, window.location.origin); // Convert it to full URL
    const route = url.pathname; // Get the pathname (e.g., "/users")

    if (routes[route]) {
        navigate(href); // Navigate to the route if it exists
    } else {
        console.warn("Ruta no válida:", route); // Log invalid route
    }
});

// Navigation function: fetch and render HTML from views based on route
async function navigate(href) {
    const url = new URL(href, window.location.origin);
    const route = url.pathname;

    if (!isAdministrator() && route !== "/login" && route !== "/register") {
        console.warn("Usuario no autorizado, redirigiendo a login...");
        return navigate("/login"); 
    }


    if (!routes[route]) {
        console.warn("Ruta no encontrada:", route); // If the route doesn't exist
        return;
    }

    // Load the view's HTML
    const html = await fetch(routes[route]).then(res => res.text());
    document.getElementById("content").innerHTML = html;

    // Update browser URL
    history.pushState({}, "", href);

    // Wait a tick to allow DOM to update before continuing
    await new Promise(resolve => setTimeout(resolve, 0));

    // If editing user, download user info using ID from query string
    if (route === "/editBook") {
        const id = url.searchParams.get("id");
        if (id) downloadInfo(id);
    }

    // If in users view, show users and hide add button if visitor
    if (route === "/books") {
        showBooks();
        toggleAddBookButton();
    }

    if (route === "/reservations") {
        showReservations();
    }

    // If in login view, setup login and visitor buttons
    if (route === "/login") {
        setupLoginForm();
        register();
    }

    if (route === "/reservateBook") {
        const id2 = url.searchParams.get("id")
        if (id2) downloadReservation(id2)
    }

    if (!isAdministrator() && route !== "/login" && route !== "/register") {
        href = "/login";
    }

}

// Enable browser back/forward navigation for SPA
window.addEventListener("popstate", () =>
    navigate(location.pathname)
);

// Setup register login button
function register() {
    const visit = document.getElementById('register-btn')
    visit.addEventListener('click', () => {
        localStorage.setItem("Auth", "user");
        navigate("/register")
    })
}

// Validate input fields (letters, numbers, required)
function validateField(id, { required = false, type = null, label = id } = {}) {
    const input = document.getElementById(id);
    if (!input) {
        console.warn(`El input con ID '${id}' no existe aún.`);
        return { valid: false, error: `Input no encontrado: ${id}` };
    }
    const value = input.value.trim();

    if (required && value === "") {
        return { valid: false, error: `El campo "${label}" es obligatorio.` };
    }
    if (type === "letters" && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        return { valid: false, error: `El campo "${label}" solo puede contener letras.` };
    }
    if (type === "numbers" && !/^[0-9]+$/.test(value)) {
        return { valid: false, error: `El campo "${label}" solo puede contener números.` };
    }
    return { valid: true };
}


// Function to add new user to JSON server
async function addBook() {
    const buttonSave = document.getElementById('btn-add-book')
    const nameNewBook = document.getElementById("book-name").value
    const nameBookAuthor = document.getElementById("book-author").value
    const quantityNewBook = document.getElementById("quantity-book").value

    buttonSave.onclick = function (e) {
        e.preventDefault();
    }

    // Field validations
    const validations = [
        validateField("book-name", { required: true, type: "letters", label: "Nombre del libro" }),
        validateField("book-author", { required: true, type: "letters", label: "Autor del libro" }),
        validateField("quantity-book", { required: true, type: "numbers", label: "Cantidad disponible" }),
    ];

    // If validation fails, show alert
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    // Create user object
    const newBook = {
        "id": generateRandomId(),
        "name": nameNewBook,
        "author": nameBookAuthor,
        "quantity": quantityNewBook
    }

    // POST request to JSON server
    await fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('books-response')
            respon.innerHTML = `<p>Libro ${data.name} agregado con éxito.</p>`
        })
        .catch(error => {
            const respon = document.getElementById('books-response')
            respon.innerHTML = `<p>Error al agregar el libro: ${error}</p>`
        })
}

// Fetch and display book list
async function showBooks() {
    let booksTable = document.getElementById('booksTable');
    try {
        let html = '';
        const response = await fetch('http://localhost:3000/books');
        const data = await response.json();

        // If user is a visitor, display without actions
        if (localStorage.getItem('Auth') == 'user') {
            data.forEach(data => {
                html += `
                <tr>
                    <td><img src="./img/images.png" alt="Foto"></td>
                    <td>${data.id}</td>
                    <td>${data.name}</td>
                    <td>${data.author}</td>
                    <td>${data.quantity}</td>
                    <td class="actions">
                        <a href="/reservateBook?id=${data.id}" data-link class='bx bx-message-alt-x' style='color:#810af3'>Reservar libro</a>
                    </td>
                </tr>
            `;
            });
            booksTable.innerHTML = html;
        } else if (localStorage.getItem('Auth') == 'admin') {
            data.forEach(data => {
                html += `
                <tr>
                    <td><img src="./img/images.png" alt="Foto"></td>
                    <td>${data.id}</td>
                    <td>${data.name}</td>
                    <td>${data.author}</td>
                    <td>${data.quantity}</td>
                    <td class="actions">
                        <i onclick="deleteBook('${data.id}')" class='bx bx-message-alt-x' style='color:#810af3'></i>
                        <i class='bx bxs-edit-alt' href="/editBook?id=${data.id}" data-link></i>
                    </td>
                </tr>
            `;
            });
            booksTable.innerHTML = html;
        }
    } catch (error) {
        const results = document.getElementById('new-book-results');
        console.log(error)
    }
}

// Delete book by ID
async function deleteBook(id) {

    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este libro?");
    if (!confirmDelete) return;

    const results = document.getElementById('new-book-results');

    try {
        await fetch(`http://localhost:3000/books/${id}`, { method: 'DELETE' });
        results.innerHTML = `<p>Libro eliminado correctamente.</p>`;
        showBooks(); // Refresh user list
    } catch (error) {
        results.innerHTML = `<p>Error al eliminar el libro: ${error}</p>`;
    }
}

// Load book's info into form to edit
async function downloadInfo(id) {
    currentBookId = id;

    try {
        const res = await fetch(`http://localhost:3000/books/${id}`);
        const data = await res.json();

        // Fill form inputs with user data
        const name = document.getElementById("book-name1");
        const author = document.getElementById("book-author1");
        const quantity = document.getElementById("quantity-book1");

        if (name && author && quantity) {
            name.value = data.name;
            author.value = data.author;
            quantity.value = data.quantity;
        } else {
            console.error("Inputs no encontrados");
        }
    } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
    }
}

// Submit edited user data
async function editBook() {
    const name = document.getElementById("book-name1").value;
    const author = document.getElementById("book-author1").value;
    const quantity = document.getElementById("quantity-book1").value;

    // Field validations
    const validations = [
        validateField("book-name1", { required: true, type: "letters", label: "Nombre del libro" }),
        validateField("book-author1", { required: true, type: "letters", label: "Autor del libro" }),
        validateField("quantity-book1", { required: true, type: "numbers", label: "Cantidad disponible" }),
    ];
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    const updatedBook = {
        name,
        author,
        quantity,
    };

    if (!currentBookId) {
        alert("No se encontró el ID del usuario para actualizar.");
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/books/${currentBookId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedBook)
        });

        const data = await res.json();

        document.getElementById("edit-response").innerHTML =
            `<p>Libro ${data.name} editado con éxito.</p>`;
    } catch (error) {
        document.getElementById("edit-response").innerHTML =
            `<p>Error al editar el libro: ${error}</p>`;
    }
}

// Logout button to clear session and redirect to login
const buttonCloseSession = document.getElementById("close-session");
buttonCloseSession.addEventListener("click", () => {
    localStorage.removeItem("Auth");
    navigate("/login");
});

// Setup login form and handle login logic
function setupLoginForm() {
    setTimeout(() => {
        const loginForm = document.getElementById('login-form');
        const userInput = document.getElementById('userLogin');
        const passInput = document.getElementById('passwordLogin');
        const errorDiv = document.getElementById('error');

        if (!loginForm || !userInput || !passInput) {
            console.warn("No se encontró el formulario de login o sus campos.");
            return;
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let authorized = false;
            errorDiv.textContent = "";

            try {
                const res = await fetch(`http://localhost:3000/users`);
                const users = await res.json();
                const user = userInput.value.trim();
                const pass = passInput.value.trim();

                for (const admin of users) {
                    if (admin.user === user && admin.password === pass) {
                        if (admin.isAdmin === true) {
                            localStorage.setItem("Auth", "admin");
                            navigate("/books");
                            authorized = true;
                            break;
                        } else if (admin.isAdmin === false) {
                            localStorage.setItem("Auth", "user");
                            navigate("/books");
                            authorized = true;
                            break;
                        } else {
                            navigate("/login");
                        }
                    }
                }

                if (!authorized) {
                    errorDiv.textContent = "Usuario y/o contraseña incorrectos.";
                }
            } catch (err) {
                errorDiv.textContent = "Error al validar credenciales.";
                console.error(err);
            }
        });
    }, 0);
}

async function registerUser() {
    const nameNewUser = document.getElementById('nameNewUser').value
    const emailNewUser = document.getElementById('emailNewUser').value
    const passwordNewUser = document.getElementById('passwordNewUser').value
    const buttonRegister = document.getElementById('btn-register')

    buttonRegister.onclick = function (e) {
        e.preventDefault();
    }

    // Field validations
    const validations = [
        validateField("nameNewUser", { required: true, type: "letters", label: "Nombre de usuario" }),
        validateField("emailNewUser", { required: true, type: "email", label: "Email" }),
        validateField("passwordNewUser", { required: true, label: "Contraseña" }),
    ];

    // If validation fails, show alert
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    const newUser = {
        "id": generateRandomId(),
        "isAdmin": false,
        "user": nameNewUser,
        "password": passwordNewUser,
        "email": emailNewUser
    }

    // POST request to JSON server
    await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('responseNewUser')
            respon.innerHTML += `<p>Usuario ${data.name} creado con éxito.</p>`
            showBooks()
        })
        .catch(error => {
            const respon = document.getElementById('responseNewUser')
            respon.innerHTML = `<p>Error al crear el usuario: ${error}</p>`
        })
}

async function registerAdmin() {
    const nameNewUser = document.getElementById('nameNewAdmin').value
    const emailNewUser = document.getElementById('emailNewAdmin').value
    const passwordNewUser = document.getElementById('passwordNewAdmin').value
    const buttonRegister = document.getElementById('btn-registerAdmin')

    buttonRegister.onclick = function (e) {
        e.preventDefault();
    }

    // Field validations
    const validations = [
        validateField("nameNewAdmin", { required: true, type: "letters", label: "Nombre de usuario" }),
        validateField("emailNewAdmin", { required: true, type: "email", label: "Email" }),
        validateField("passwordNewAdmin", { required: true, label: "Contraseña" }),
    ];

    // If validation fails, show alert
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    const newUser = {
        "id": generateRandomId(),
        "isAdmin": true,
        "user": nameNewUser,
        "password": passwordNewUser,
        "email": emailNewUser
    }

    // POST request to JSON server
    await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('responseNewUser')
            respon.innerHTML += `<p>Usuario ${data.name} creado con éxito.</p>`
            showBooks()
        })
        .catch(error => {
            const respon = document.getElementById('responseNewUser')
            respon.innerHTML = `<p>Error al crear el usuario: ${error}</p>`
        })
}

async function reserve() {
    const buttonSave = document.getElementById('btn-reserve-book')
    const nameNewBook = document.getElementById("book-name2").value
    const nameReservation = document.getElementById("nameReservation").value
    const quantityNewBook = document.getElementById("quantity-book2").value
    const numberReservation = document.getElementById("numberReservation").value


    buttonSave.onclick = function (e) {
        e.preventDefault();
    }

    // Field validations
    const validations = [
        validateField("book-name2", { required: true, type: "letters", label: "Nombre del libro" }),
        validateField("nameReservation", { required: true, type: "letters", label: "Nombre de quien reserva" }),
        validateField("quantity-book2", { required: true, type: "numbers", label: "Cantidad a reservar" }),
        validateField("numberReservation", { required: true, type: "numbers", label: "Número de teléfono" }),
    ];

    // If validation fails, show alert
    for (let result of validations) {
        if (!result.valid) {
            alert(result.error);
            return;
        }
    }

    const res = await fetch(`http://localhost:3000/books/${currentBookId2}`);
    const data = await res.json();

    // Create user object
    const newBook = {
        "id": currentBookId2,
        "name": nameNewBook,
        "nameReservation": nameReservation,
        "numberReservation": numberReservation,
        "quantity": quantityNewBook
    }

    const quantity = {
        "id": generateRandomId(),
        "name": nameNewBook,
        "author": data.author,
        "quantity": data.quantity - quantityNewBook,
    }

    // POST request to JSON server
    await fetch('http://localhost:3000/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('reservation-response')
            respon.innerHTML = `<p>Libro ${data.name} reservado con éxito.</p>`
        })
        .catch(error => {
            const respon = document.getElementById('reservation-response')
            respon.innerHTML = `<p>Error al reservar el libro: ${error}</p>`
        })


    // PUT request to JSON server
    await fetch(`http://localhost:3000/books/${currentBookId2}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quantity)
    })
        .then(response => response.json())
        .then(data => {
            const respon = document.getElementById('reservation-response')
            respon.innerHTML = `<p>Libro ${data.name} actualizado con éxito.</p>`
        })
        .catch(error => {
            const respon = document.getElementById('reservation-response')
            respon.innerHTML = `<p>Error al actualizar el libro: ${error}</p>`
        })

}

// Load book's info into form to edit
async function downloadReservation(id) {
    currentBookId2 = id;

    try {
        const res = await fetch(`http://localhost:3000/books/${id}`);
        const data = await res.json();

        // Fill form inputs with user data
        const name = document.getElementById("book-name2");
        const quantity = document.getElementById("quantity-book2");

        if (name && quantity) {
            name.value = data.name;
            quantity.value = data.quantity;
        } else {
            console.error("Inputs no encontrados");
        }
    } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
    }
}


//Function to show reservations
async function showReservations() {
    let reservationTable = document.getElementById('reservationsTable');
    try {
        let html = '';
        const response = await fetch('http://localhost:3000/reservations');
        const data = await response.json();

        // If user is a visitor, display without actions
        if (localStorage.getItem('Auth') == 'user') {
            data.forEach(data => {
                html += `
                <tr>
                    <td><img src="./img/images.png" alt="Foto"></td>
                    <td>${data.id}</td>
                    <td>${data.name}</td>
                    <td>${data.nameReservation}</td>
                    <td>${data.quantity}</td>
                </tr>
            `;
            });
            reservationTable.innerHTML = html;
        } else if (localStorage.getItem('Auth') == 'admin') {
            data.forEach(data => {
                html += `
                <tr>
                    <td><img src="./img/images.png" alt="Foto"></td>
                    <td>${data.id}</td>
                    <td>${data.name}</td>
                    <td>${data.nameReservation}</td>
                    <td>${data.numberReservation}</td>
                    <td>${data.quantity}</td>
                </tr>
            `;
            });
            reservationTable.innerHTML = html;
        }
    } catch (error) {
        const results = document.getElementById('new-book-results');
        console.log(error)
    }
}