# OTIS API Backend

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)

**OTIS (Online Temple Information System)** is a comprehensive Express.js and MongoDB RESTful API backend designed for Temple Management. It provides robust endpoints for handling user authentication, temple events, sevas, accommodations, donations, and secure payment processing.

## 🌟 Key Features

- **Authentication & Authorization**: Secure JWT-based authentication with OTP verification via email (Resend/Nodemailer) and bcrypt password hashing.
- **Temple & Event Management**: CRUD operations to manage temple details, schedules, and special events.
- **Booking Systems**: Dedicated modules to handle bookings for Sevas and Accommodations, including automated confirmation background jobs.
- **Donation Module**: Endpoints for tracing, managing, and receipting temple donations.
- **Payment Integration**: Streamlined checkout and payment processing handled via Stripe.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas URI)
- [Stripe Account](https://stripe.com/) (For payment processing)
- [Resend Account](https://resend.com/) (For OTP/transaction emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/satyakiran29/OTIS_API.git
   cd OTIS_API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory based on the `.env.exmple` file and configure the necessary credentials:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/temple_auth
   JWT_SECRET=your_jwt_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=onboarding@psatyakiran.in
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The API will be running on `http://localhost:5000`.

### Usage Example

**Authenticate User via cURL**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com", "password":"password123"}'
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## 💬 Support & Help

If you have any questions, run into issues, or want to suggest improvements:
- Please check existing [Issues](https://github.com/satyakiran29/OTIS_API/issues) or create a new one.

## 📜 License

This project is licensed under the ISC License. For more information, please see the [LICENSE](LICENSE) file.

## ✨ Maintainers

- **Satya Kiran** - *Initial work* - [satyakiran29](https://github.com/satyakiran29)
