# Vehicle Rental Website

A modern, full-featured vehicle rental platform built with React and Firebase, providing a seamless experience for both customers and administrators.

## 🚗 Features

### For Customers
- **Browse & Search**: Explore a wide range of vehicles with detailed filtering options
- **Booking System**: Easy-to-use booking interface with date selection and availability checking
- **User Accounts**: Create accounts, manage profiles, and view booking history
- **Secure Payments**: Integrated payment processing for booking confirmations

### For Administrators
- **Dashboard**: Comprehensive admin dashboard with real-time statistics and analytics
- **Vehicle Management**: Add, edit, and manage the vehicle fleet with ease
- **Booking Administration**: Manage customer bookings with status updates and history
- **User Management**: Manage user accounts and roles (customer, admin)
- **Analytics**: Detailed reports on revenue, popular vehicles, booking patterns, and more

## 📊 Analytics Dashboard
The powerful analytics dashboard provides administrators with:

- **Revenue Tracking**: Monitor daily, weekly, monthly, and yearly revenue
- **Vehicle Utilization**: Identify the most popular vehicles in your fleet
- **Booking Patterns**: Analyze booking times and duration trends
- **Status Distribution**: Track booking status distributions (pending, confirmed, cancelled, etc.)
- **Data Export**: Export reports as CSV files or print them directly

## 🛠️ Technology Stack

- **Frontend**: React.js with Tailwind CSS for modern, responsive UI
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **State Management**: React Hooks and Context API
- **Visualization**: Chart.js for data visualization
- **Deployment**: [Your deployment platform]

## 📱 Responsive Design
The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features
- **Authentication**: Secure user authentication through Firebase
- **Role-based Access**: Different permissions for customers and administrators
- **Data Validation**: Frontend and backend validation for all inputs

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/vehicle-rental-website.git
cd vehicle-rental-website
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up your Firebase configuration
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Update the Firebase configuration in `src/firebase/config.js`

4. Start the development server
```bash
npm start
# or
yarn start
```

### Admin Account Setup
To use the admin features, you'll need to:
1. Create a user account through the registration page
2. Use the Firebase console to manually set the user's role to "admin" in the Firestore database

## 📝 Database Structure

The application uses Firebase Firestore with the following collections:
- **users**: User accounts and profile information
- **vehicles**: Vehicle details including type, availability, and pricing
- **bookings**: Booking records with status tracking and customer information

## 🧹 Data Management Tools

The admin panel includes helpful tools for managing your database:
- **Seed Vehicles**: Add sample vehicles to populate your database
- **Remove Duplicates**: Clean up any duplicate vehicle entries
- **Test Data Cleanup**: Advanced cleanup tools to remove test data

## 📈 Future Enhancements
- Mobile application for customers
- Integrated GPS tracking for vehicles
- Multi-language support
- Enhanced reporting and business intelligence tools

## 📄 License
[Your License]

## 👥 Contributors
[Your Name/Team]

---

© [Year] Vehicle Rental Website. All rights reserved. 