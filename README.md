# Pizzashop:

Story Points

1. New users can be created, their information can be edited, and they can be deleted.   
GET /users   
POST /users   
DELETE /users   
PUT /users   

2. Users can log in and log out by creating or destroying a token.  
GET /tokens   
POST/tokens 
DELETE /tokens?id=tokenid   
PUT /tokens   

3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system).  
GET /items     

4. A logged-in user should be able to fill a shopping cart with menu items.  
GET /cart   
POST/cart   
DELETE /cart?id=orderid   

5. A logged-in user should be able to create an order.   
GET /orders   
POST/orders   

Note: Replace stripe.secret with your own stripe api secret in config.js   

6. Send mail to users on successful orders  
Replace mailgun.api with your own stripe api key in config.js


## Total Commands Available in CLI: 

'exit': 'Kill the Application',

'help': 'Show this help page',

'items': 'Show list of items available',

'orders': 'Show all orders placed',

'orders --recent': 'Show list of all items placed in the last 24 hours',

'orders --id {orderid}': 'Display order having orderid',

'users': 'Show all users in the system',

'users --recent': 'Show all users who have signed up in the last 24 hours',

'users --id {userid}': 'Display user with userid'

