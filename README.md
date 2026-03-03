# OTIS API


This repository contains the backend API for the Online Temple Information System (OTIS). It is a Node.js and Express application that provides a comprehensive set of services for managing temple activities, bookings, donations, and user accounts.

## Key Features

*   **User Authentication**: Secure registration, login, and password reset functionality using JWT and OTP (One-Time Password) email verification.
*   **Booking Management**: Create, view, and cancel bookings for Sevas, Darshans, Events, and Accommodations.
*   **Payment Integration**: Integrated with Stripe to handle online payments for bookings and donations.
*   **Donation System**: Process and record donations for specific temples.
*   **CRUD Operations**: Full Create, Read, Update, and Delete functionality for Temples, Sevas, Events, and Accommodations.
*   **Role-Based Access Control**: Differentiates between regular users and administrators, with specific endpoints restricted to admin users.
*   **Automated Email Notifications**: Uses Resend to send transactional emails for OTP verification, booking confirmations, cancellations, and donation receipts.
*   **Background Jobs**: Includes a background process to automatically confirm pending Seva bookings after a specified time.
*   **Dynamic Availability**: Automatically calculates and displays the number of available tickets for Sevas based on current bookings.

## Technology Stack

*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB with Mongoose ODM
*   **Authentication**: JSON Web Tokens (JWT), bcrypt.js
*   **Email Service**: Resend
*   **Payment Gateway**: Stripe
*   **Environment Management**: dotenv

## Setup and Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/satyakiran29/OTIS_API.git
    cd OTIS_API
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Create an environment file:**
    Create a `.env` file in the root directory by copying the example file:
    ```sh
    cp .env.exmple .env
    ```

4.  **Configure environment variables:**
    Open the `.env` file and add your configuration details:
    ```env
    PORT=5000
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret_key>
    STRIPE_SECRET_KEY=<your_stripe_secret_key>
    RESEND_API_KEY=<your_resend_api_key>
    RESEND_FROM_EMAIL=<your_verified_resend_from_email>
    ```

5.  **Start the server:**
    *   For development with auto-reloading:
        ```sh
        npm run dev
        ```
    *   For production:
        ```sh
        npm start
        ```
    The API will be running at `http://localhost:5000`.

## API Endpoints

### Authentication (`/api/auth`)

*   `POST /send-otp`: Sends an OTP to the user's email for registration.
*   `POST /register`: Registers a new user after verifying the OTP.
*   `POST /login`: Logs in a user. Can require OTP for enhanced security.
*   `POST /forgot-password`: Sends a password reset OTP.
*   `POST /reset-password`: Resets the user's password using a valid OTP.
*   `POST /verify-otp`: Verifies an OTP without completing another action.

### Temples (`/api/temples`)

*   `GET /`: Get all temples.
*   `GET /:id`: Get a specific temple by ID.
*   `POST /`: Create a new temple (Admin only).
*   `PUT /:id`: Update a temple (Admin only).
*   `DELETE /:id`: Delete a temple (Admin only).

### Sevas (`/api/sevas`)

*   `GET /`: Get all sevas with calculated ticket availability.
*   `GET /temple/:templeId`: Get all sevas for a specific temple.
*   `POST /`: Create a new seva (Admin only).
*   `PUT /:id`: Update a seva (Admin only).
*   `DELETE /:id`: Delete a seva (Admin only).

### Bookings (`/api/bookings`)

*   `GET /`: Get all bookings (Admin only).
*   `GET /mybookings`: Get all bookings for the authenticated user.
*   `POST /`: Create a new booking for a seva, event, etc. (User authenticated).
*   `PUT /:id/cancel`: Cancel a booking. Refunds are processed if applicable (User authenticated).
*   `PUT /:id/status`: Update the status of a booking (Admin only).

### Donations (`/api/donations`)

*   `GET /`: Get all donations (Admin only).
*   `GET /my`: Get all donations for the authenticated user.
*   `POST /`: Create a new donation (User authenticated).

### Users (`/api/users`)

*   `GET /`: Get a list of all users (Admin only).
*   `PUT /:id/role`: Update a user's role (Admin only).
*   `DELETE /:id`: Delete a user (Admin only).

### Payments (`/api/payments`)

*   `POST /create-payment-intent`: Creates a Stripe Payment Intent for processing a payment.

### Accommodations (`/api/accommodations`)

*   `GET /`: Get all accommodations.
*   `POST /`: Create a new accommodation (Admin only).
*   `PUT /:id`: Update an accommodation (Admin only).
*   `DELETE /:id`: Delete an accommodation (Admin only).

### Events (`/api/events`)

*   `GET /`: Get all events.
*   `POST /`: Create a new event (Admin only).
*   `PUT /:id`: Update an event (Admin only).
*   `DELETE /:id`: Delete an event (Admin only).

## Utility Scripts

The repository includes several utility scripts in the root directory for database maintenance and administration.

*   `makeAdmin.js`: Promotes a user to an admin role.
    ```sh
    node makeAdmin.js <user_email>
    ```
*   `checkUsers.js`: Lists all users in the database with their roles.
*   `migrateSevas.js`: A data migration script to convert sevas with `ticketLimit: 0` to have an undefined ticket limit (unlimited).
*   `migrateUnlimited.js`: A data migration script to convert sevas with an undefined ticket limit to a finite default limit (e.g., 100).
*   `fixBookings.js`: A data migration script to fix legacy booking records where the `members` count is missing or zero, setting it to a default of 1.
*   `debug*.js`, `test*.js`: Various scripts for debugging, testing specific functionalities like booking population, aggregation queries, and OTP logic.
