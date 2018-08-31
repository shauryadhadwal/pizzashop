# NodeJs MasterClass Home Assignment No. 2

## Story Points
#### 1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.

  GET /users  
  POST /users  
  DELETE /users  
  PUT /users  

#### 2. Users can log in and log out by creating or destroying a token.

  GET /tokens  
  POST/tokens  
  DELETE /tokens?id=tokenid  
  PUT /tokens  

#### 3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system). 

  GET /items  

#### 4. A logged-in user should be able to fill a shopping cart with menu items

  GET /cart  
  POST/cart  
  DELETE /cart?id=orderid  

#### 5. A logged-in user should be able to create an order. You should integrate with the Sandbox of Stripe.com to accept their payment. Note: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards

  GET /orders  
  POST/orders  
  
  Replace __stripe.secret__ with your own stripe api secret in config.js

#### 6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of Mailgun.com for this. Note: Every Mailgun account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

Replace __mailgun.api__ with your own stripe api key in config.js
s
