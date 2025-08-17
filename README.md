# Portfolio
Apex Bank - Management Dashboard
This project is a front-end web application that simulates a bank's management dashboard. It provides a clean, modern interface for performing common banking operations like creating accounts, handling transactions, and viewing account details. The application is built entirely with client-side technologies and uses the browser's localStorage to persist data, meaning no backend is required.

Features
Dashboard Overview: A visual summary of total accounts and the total balance held by the bank, including a chart for visualization.

Create New Accounts: A form to create new savings or current accounts with initial deposit validation.

View All Accounts: A tabular list of all customer accounts with their details.

Transactions: Functionality to deposit and withdraw funds from any account, with validation to prevent balances from dropping below the minimum required.

Balance Enquiry: A tool to quickly look up the details and current balance of a specific account.

Modify & Close Accounts: Administrative functions to update account holder information or permanently delete an account.

Notifications: Real-time feedback for all actions (e.g., "Account Created Successfully!").

Technologies Used
HTML5: For the structure and content of the application.

Tailwind CSS: For all styling and layout, providing a modern and responsive design.

Vanilla JavaScript: For all the application logic, including DOM manipulation, event handling, and data management.

Chart.js: For rendering the accounts overview chart on the dashboard.

Font Awesome: For icons used throughout the user interface.

How It Works
The application uses the browser's localStorage to function as a simple database. All account information is stored as a JSON string in localStorage, which allows the data to persist even after the browser tab is closed.

loadAccounts(): Retrieves and parses the account data from localStorage.

saveAccounts(accounts): Converts the current state of accounts into a JSON string and saves it back to localStorage.

How to Run
Download or clone the repository.

Ensure all three files (index.html, style.css, script.js) are in the same folder.

Open the index.html file in any modern web browser.
