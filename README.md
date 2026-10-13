🛠️ SkillFinder: Geo-Location Based Local Service Marketplace

SkillFinder is a full-stack, hyper-local service discovery platform that connects households with verified local professionals (plumbers, electricians, tutors, etc.). Moving beyond a simple directory, this application implements advanced features such as geospatial radius searching, real-time emergency SOS broadcasts, and a cryptographically secure, OTP-verified booking lifecycle to eliminate fake reviews.

✨ Key Technical Features

📍 Geospatial Search Engine: Utilizes the Haversine formula directly within MySQL queries to calculate exact distances, allowing users to filter and rank service providers within a dynamic radius (e.g., 5km/10km).

🚨 Emergency SOS Broadcast (Concurrency Handling): A real-time feature where customers can broadcast urgent requests. Incorporates database transaction locks to prevent race conditions, ensuring only the first provider to accept gets the job.

🔒 Secure Booking State Machine: A 4-digit OTP-based lifecycle ensures that a job can only be marked as 'Completed' by the provider if the customer provides the physical OTP. This guarantees 100% authentic ratings and reviews.

🗺️ Interactive Map Integration: Integrates Leaflet.js / React-Leaflet to visualize nearby providers, search radiuses, and user locations dynamically on an interactive map.

🔐 Role-Based Access Control (RBAC): Secure JWT-based authentication with distinct dashboards and permissions for Customers, Service Providers, and System Admins.

💻 Tech Stack

Frontend: React.js, Tailwind CSS, React Router, React-Leaflet, Axios

Backend: Node.js, Express.js, JWT (Authentication), bcryptjs

Database: MySQL (mysql2/promise)

🚀 Getting Started

Prerequisites

Node.js installed

MySQL Server (XAMPP / MySQL Workbench)

Installation

Clone the repository:

git clone https://github.com/yourusername/skillfinder.git
cd skillfinder


Database Setup:

Create a new MySQL database named skillfinder_db.

Run the SQL queries provided in backend/database/schema.sql to generate the tables.

Run backend/seed.js to populate sample locations and providers.

Backend Setup:

cd backend
npm install


Create a .env file in the backend folder:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=skillfinder_db
JWT_SECRET=your_super_secret_key


Start the backend server: npm run dev

Frontend Setup:

cd frontend
npm install


Start the Vite development server: npm run dev

Open http://localhost:5173 in your browser.

🔮 Future Enhancements

Bid-based Quotation System for complex jobs.

Payment Gateway Integration (Stripe/PayHere) for automated commission deduction.
