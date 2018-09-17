/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {};

// Config
app.config = {
    'sessionToken': false
};

// AJAX Client (for RESTful API)
app.client = {}

app.cart = {
    list: []
}
// Interface for making API calls
app.client.request = function (headers, path, method, queryStringObject, payload, callback) {

    // Set defaults
    headers = typeof (headers) == 'object' && headers !== null ? headers : {};
    path = typeof (path) == 'string' ? path : '/';
    method = typeof (method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof (queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof (payload) == 'object' && payload !== null ? payload : {};
    callback = typeof (callback) == 'function' ? callback : false;

    // For each query string parameter sent, add it to the path
    var requestUrl = path + '?';
    var counter = 0;
    for (var queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
            counter++;
            // If at least one query string parameter has already been added, preprend new ones with an ampersand
            if (counter > 1) {
                requestUrl += '&';
            }
            // Add the key and value
            requestUrl += queryKey + '=' + queryStringObject[queryKey];
        }
    }

    // Form the http request as a JSON type
    var xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    xhr.setRequestHeader("Content-type", "application/json");

    // For each header sent, add it to the request
    for (var headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }

    // If there is a current session token set, add that as a header
    if (app.config.sessionToken) {
        xhr.setRequestHeader("token", app.config.sessionToken.id);
        xhr.setRequestHeader("phone", app.config.sessionToken.phone);
    }

    // When the request comes back, handle the response
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var statusCode = xhr.status;
            var responseReturned = xhr.responseText;

            // Callback if requested
            if (callback) {
                try {
                    var parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch (e) {
                    callback(statusCode, false);
                }

            }
        }
    }

    // Send the payload as JSON
    var payloadString = JSON.stringify(payload);
    xhr.send(payloadString);

};

// Bind the logout button
app.bindLogoutButton = function () {
    document.getElementById("logoutButton").addEventListener("click", function (e) {

        // Stop it from redirecting anywhere
        e.preventDefault();

        // Log the user out
        app.logUserOut();

    });
};

// Log the user out then redirect them
app.logUserOut = function (redirectUser) {
    // Set redirectUser to default to true
    redirectUser = typeof (redirectUser) == 'boolean' ? redirectUser : true;

    // Get the current token id
    var tokenId = typeof (app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

    // Send the current token to the tokens endpoint to delete it
    var queryStringObject = {
        'id': tokenId
    };
    app.client.request(undefined, 'api/tokens', 'DELETE', queryStringObject, undefined, function (statusCode, responsePayload) {
        // Set the app.config token as false
        app.setSessionToken(false);

        // Send the user to the logged out page
        if (redirectUser) {
            window.location = '/session/delete';
        }
    });
};

// Bind the forms
app.bindForms = function () {
    if (document.querySelector("form")) {

        var allForms = document.querySelectorAll("form");
        for (var i = 0; i < allForms.length; i++) {
            allForms[i].addEventListener("submit", function (e) {

                // Stop it from submitting
                e.preventDefault();
                var formId = this.id;
                var path = this.action;
                var method = this.method.toUpperCase();

                // Hide the error message (if it's currently shown due to a previous error)
                document.querySelector("#" + formId + " .formError").style.display = 'none';

                // Hide the success message (if it's currently shown due to a previous error)
                if (document.querySelector("#" + formId + " .formSuccess")) {
                    document.querySelector("#" + formId + " .formSuccess").style.display = 'none';
                }


                // Turn the inputs into a payload
                var payload = {};
                var elements = this.elements;
                for (var i = 0; i < elements.length; i++) {
                    if (elements[i].type !== 'submit') {
                        // Determine class of element and set value accordingly
                        var classOfElement = typeof (elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';
                        var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : parseInt(elements[i].value);
                        var elementIsChecked = elements[i].checked;
                        // Override the method of the form if the input's name is _method
                        var nameOfElement = elements[i].name;
                        if (nameOfElement == '_method') {
                            method = valueOfElement;
                        } else {
                            // Create a payload field named "method" if the elements name is actually httpmethod
                            if (nameOfElement == 'httpmethod') {
                                nameOfElement = 'method';
                            }
                            // Create a payload field named "id" if the elements name is actually uid
                            if (nameOfElement == 'uid') {
                                nameOfElement = 'id';
                            }
                            // If the element has the class "multiselect" add its value(s) as array elements
                            if (classOfElement.indexOf('multiselect') > -1) {
                                if (elementIsChecked) {
                                    payload[nameOfElement] = typeof (payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                                    payload[nameOfElement].push(valueOfElement);
                                }
                            } else {
                                payload[nameOfElement] = valueOfElement;
                            }
                        }
                    }
                }

                // If the method is DELETE, the payload should be a queryStringObject instead
                var queryStringObject = method == 'DELETE' ? payload : {};

                // Call the API
                app.client.request(undefined, path, method, queryStringObject, payload, function (statusCode, responsePayload) {
                    // Display an error on the form if needed
                    if (statusCode !== 200) {

                        if (statusCode == 403) {
                            // log the user out
                            app.logUserOut();

                        } else {

                            // Try to get the error from the api, or set a default error message
                            var error = typeof (responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';

                            // Set the formError field with the error text
                            document.querySelector("#" + formId + " .formError").innerHTML = error;

                            // Show (unhide) the form error field on the form
                            document.querySelector("#" + formId + " .formError").style.display = 'block';
                        }
                    } else {
                        // If successful, send to form response processor
                        app.formResponseProcessor(formId, payload, responsePayload);
                    }
                });
            });
        }
    }
};

// Form response processor
app.formResponseProcessor = function (formId, requestPayload, responsePayload) {
    var functionToCall = false;
    // If account creation was successful, try to immediately log the user in
    if (formId == 'accountCreate') {
        // Take the phone and password, and use it to log the user in
        var newPayload = {
            'phone': requestPayload.phone,
            'password': requestPayload.password
        };

        app.client.request(undefined, 'api/tokens', 'POST', undefined, newPayload, function (newStatusCode, newResponsePayload) {
            // Display an error on the form if needed
            if (newStatusCode !== 200) {

                // Set the formError field with the error text
                document.querySelector("#" + formId + " .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

                // Show (unhide) the form error field on the form
                document.querySelector("#" + formId + " .formError").style.display = 'block';

            } else {
                // If successful, set the token and redirect the user
                app.setSessionToken(newResponsePayload);
                window.location = '/dashboard';
            }
        });
    }
    // If login was successful, set the token in localstorage and redirect the user
    if (formId == 'sessionCreate') {
        app.setSessionToken(responsePayload);
        window.location = '/dashboard';
    }

    // If forms saved successfully and they have success messages, show them
    var formsWithSuccessMessages = ['accountEdit1', 'accountEdit2', 'checksEdit1'];
    if (formsWithSuccessMessages.indexOf(formId) > -1) {
        document.querySelector("#" + formId + " .formSuccess").style.display = 'block';
    }

    // If the user just deleted their account, redirect them to the account-delete page
    if (formId == 'accountEdit3') {
        app.logUserOut(false);
        window.location = '/account/delete';
    }

    // If the user just created a new check successfully, redirect back to the dashboard
    if (formId == 'checksCreate') {
        window.location = '/checks/all';
    }

    // If the user just deleted a check, redirect them to the dashboard
    if (formId == 'checksEdit2') {
        window.location = '/checks/all';
    }

};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function () {
    var tokenString = localStorage.getItem('PizzaPlaceToken');
    if (typeof (tokenString) == 'string') {
        try {
            var token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if (typeof (token) == 'object') {
                app.setLoggedInClass(true);
            } else {
                app.setLoggedInClass(false);
            }
        } catch (e) {
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function (add) {
    var target = document.querySelector("body");
    if (add) {
        target.classList.add('loggedIn');
    } else {
        target.classList.remove('loggedIn');
    }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function (token) {
    app.config.sessionToken = token;
    var tokenString = JSON.stringify(token);
    localStorage.setItem('PizzaPlaceToken', tokenString);
    if (typeof (token) == 'object') {
        app.setLoggedInClass(true);
    } else {
        app.setLoggedInClass(false);
    }
};

// Renew the token
app.renewToken = function (callback) {
    var currentToken = typeof (app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
    if (currentToken) {
        // Update the token with a new expiration
        var payload = {
            'id': currentToken.id,
            'extend': true,
        };
        app.client.request(undefined, 'api/tokens', 'PUT', undefined, payload, function (statusCode, responsePayload) {
            // Display an error on the form if needed
            if (statusCode == 200) {
                // Get the new token details
                var queryStringObject = {
                    'id': currentToken.id
                };
                app.client.request(undefined, 'api/tokens', 'GET', queryStringObject, undefined, function (statusCode, responsePayload) {
                    // Display an error on the form if needed
                    if (statusCode == 200) {
                        app.setSessionToken(responsePayload);
                        callback(false);
                    } else {
                        app.setSessionToken(false);
                        callback(true);
                    }
                });
            } else {
                app.setSessionToken(false);
                callback(true);
            }
        });
    } else {
        app.setSessionToken(false);
        callback(true);
    }
};

// Load data on the page
app.loadDataOnPage = function () {
    // Get the current page from the body class
    var bodyClasses = document.querySelector("body").classList;
    var primaryClass = typeof (bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

    // Logic for account settings page
    if (primaryClass == 'accountEdit') {
        app.loadAccountEditPage();
    }
    if (primaryClass == 'dashboard') {
        app.loadDashboardPage();
    }
    if (primaryClass == 'cart') {
        app.loadCartPage();
    }
};

// Load the account edit page specifically
app.loadAccountEditPage = function () {
    // Get the phone number from the current token, or log the user out if none is there
    var phone = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
    if (phone) {
        // Fetch the user data
        app.client.request(undefined, 'api/users', 'GET', undefined, undefined, function (statusCode, responsePayload) {
            if (statusCode == 200) {
                // Put the data into the forms as values where needed
                document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
                document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
                document.querySelector("#accountEdit1 .displayPhoneInput").value = responsePayload.phone;

                // Put the hidden phone field into both forms
                var hiddenPhoneInputs = document.querySelectorAll("input.hiddenPhoneNumberInput");
                for (var i = 0; i < hiddenPhoneInputs.length; i++) {
                    hiddenPhoneInputs[i].value = responsePayload.phone;
                }

            } else {
                // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
                app.logUserOut();
            }
        });
    } else {
        app.logUserOut();
    }
};

app.loadDashboardPage = function () {
    var phone = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
    if (phone) {
        // Fetch the Items from API
        app.client.request(undefined, 'api/items', 'GET', undefined, undefined, function (statusCode, responsePayload) {
            if (statusCode == 200) {
                // Use data to create items list

                for (let index = 0; index < responsePayload.list.length; index++) {
                    // create a new div element 
                    const itemContainer = document.createElement("div");
                    itemContainer.setAttribute('class', 'item');

                    // create a new image container
                    const imageContainer = document.createElement("img");
                    imageContainer.setAttribute('src', responsePayload.list[index].src);
                    imageContainer.setAttribute('alt', responsePayload.list[index].name);

                    const descriptionContainer = document.createElement("p");
                    descriptionContainer.innerText = responsePayload.list[index].name;

                    const button = document.createElement("button");
                    button.innerText = "Add to Cart";
                    button.setAttribute('class', responsePayload.list[index].name);
                    button.id = responsePayload.list[index].id;

                    button.addEventListener('click', function (event) {
                        app.addItemToCart(this.id, this.classList[0]);
                    });

                    itemContainer.appendChild(imageContainer);
                    itemContainer.appendChild(descriptionContainer);
                    itemContainer.appendChild(button);

                    // add the newly created element and its content into the DOM 
                    const listContainer = document.getElementById("itemsContainer");

                    listContainer.insertAdjacentElement('beforeend', itemContainer);
                }
            } else {
                // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
                app.logUserOut();
            }
        });
        // Update Cart Link
        app.client.request(undefined, 'api/cart', 'GET', undefined, undefined, function (statusCode, responsePayload) {
            if (statusCode == 200) {
                app.cart.list = responsePayload;
                document.getElementById('cartLink').innerHTML = 'Cart [' + responsePayload.length + ']';
            }
        });
    } else {
        app.logUserOut();
    }
};

app.loadCartPage = function () {
    var phone = typeof (app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
    if (phone) {
        // Fetch the Items from API
        app.client.request(undefined, 'api/cart', 'GET', undefined, undefined, function (statusCode, responsePayload) {
            if (statusCode == 200) {
                app.cart.list = responsePayload;

                if (app.cart.list.length == 0) {
                    document.getElementById('orderButton')[0].setAttribute('hidden', true);
                } else {
                    const button = document.getElementById('orderButton');
                    button.addEventListener('click', function (event) {
                        app.placeOrder();
                    });
                }

                document.getElementById('cartLink').innerHTML = 'Cart [' + responsePayload.length + ']';
                // Use data to create items list
                for (let index = 0; index < responsePayload.length; index++) {
                    // create a new div element 
                    const itemContainer = document.createElement("div");
                    itemContainer.setAttribute('class', 'item');

                    const descriptionContainer = document.createElement("p");
                    descriptionContainer.innerText = responsePayload[index].name;

                    const quantityContainer = document.createElement("p");
                    quantityContainer.innerText = 'Quantity: ' + responsePayload[index].quantity;

                    const costContainer = document.createElement("p");
                    costContainer.innerText = 'Cost: ' + responsePayload[index].quantity * responsePayload[index].cost;

                    const button = document.createElement("button");
                    button.innerText = "Remove from Cart";
                    button.id = responsePayload[index].id;

                    button.addEventListener('click', function (event) {
                        app.removeItemFromCart(this.id);
                    });

                    itemContainer.appendChild(descriptionContainer);
                    itemContainer.appendChild(quantityContainer);
                    itemContainer.appendChild(costContainer);
                    itemContainer.appendChild(button);

                    // add the newly created element and its content into the DOM 
                    const listContainer = document.getElementById("itemsContainer");

                    listContainer.insertAdjacentElement('beforeend', itemContainer);
                }
            } else {
                // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
                app.logUserOut();
            }
        });


    } else {
        app.logUserOut();
    }
}

app.addItemToCart = function (itemId, name) {
    app.cart.list.push(itemId);
    app.client.request(undefined, 'api/cart', 'POST', undefined, {
        "items": [{
            "id": itemId,
            "name": name,
            "quantity": 1
        }]
    }, function (statusCode, responsePayload) {
        if (statusCode == 200) {
            index = app.cart.list.findIndex(o => o.id == itemId);
            if (index > -1) {
                app.cart.list[index].quantity += 1;
            } else {
                app.cart.list.push({
                    "id": itemId,
                    "name": name,
                    "quantity": 1
                });
            }
            document.getElementById('cartLink').innerText = 'Cart [' + app.cart.list.length + ']';
        }
    });
}

app.removeItemFromCart = function (itemId) {
    app.client.request(undefined, 'api/cart', 'DELETE', {
        id: itemId
    }, undefined, function (statusCode, responsePayload) {
        if (statusCode == 200) {
            location.reload();
        }
    });
};

app.placeOrder = function () {
    app.client.request(undefined, 'api/orders', 'POST', undefined, undefined, function (statusCode, responsePayload) {
        if (statusCode == 200) {
            alert('Payment was successful');
        } else {
            alert('Error: ' + statusCode);
        }
    });
}

// Loop to renew token often
app.tokenRenewalLoop = function () {
    setInterval(function () {
        app.renewToken(function (err) {
            if (!err) {
                console.log("Token renewed successfully @ " + Date.now());
            }
        });
    }, 1000 * 60);
};

// Init (bootstrapping)
app.init = function () {

    // Bind all form submissions
    app.bindForms();

    // Bind logout logout button
    app.bindLogoutButton();

    // Get the token from localstorage
    app.getSessionToken();

    // Renew token
    app.tokenRenewalLoop();

    // Load data on page
    app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = function () {
    app.init();
};
