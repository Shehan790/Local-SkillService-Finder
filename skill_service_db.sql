-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 04, 2026 at 04:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `skill_service_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `service_date` datetime NOT NULL,
  `problem_description` text DEFAULT NULL,
  `status` enum('pending','accepted','completed','cancelled') DEFAULT 'pending',
  `completion_otp` varchar(10) DEFAULT NULL,
  `agreed_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `customer_id`, `provider_id`, `service_date`, `problem_description`, `status`, `completion_otp`, `agreed_price`, `created_at`) VALUES
(1, 7, 8, '2026-10-04 16:44:27', 'EMERGENCY SOS: need help', 'completed', '4383', 100.00, '2026-10-04 11:14:27');

-- --------------------------------------------------------

--
-- Table structure for table `emergency_requests`
--

CREATE TABLE `emergency_requests` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `offered_price` decimal(10,2) DEFAULT NULL,
  `status` enum('open','assigned','cancelled') DEFAULT 'open',
  `assigned_provider_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emergency_requests`
--

INSERT INTO `emergency_requests` (`id`, `customer_id`, `category_id`, `description`, `lat`, `lng`, `offered_price`, `status`, `assigned_provider_id`, `created_at`) VALUES
(1, 7, 2, 'need help', 6.98000000, 79.90000000, 100.00, 'assigned', 8, '2026-10-04 11:04:51');

-- --------------------------------------------------------

--
-- Table structure for table `provider_profiles`
--

CREATE TABLE `provider_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `bio` text DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `is_verified` tinyint(1) DEFAULT 0,
  `average_rating` decimal(3,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `provider_profiles`
--

INSERT INTO `provider_profiles` (`id`, `user_id`, `category_id`, `bio`, `hourly_rate`, `is_available`, `is_verified`, `average_rating`) VALUES
(1, 1, 1, 'Experienced plumber in Colombo 03.', 1500.00, 1, 1, 4.80),
(2, 2, 2, 'Expert electrician in Nugegoda.', 1800.00, 1, 1, 4.90),
(3, 3, 3, 'Math and Science tutor in Dehiwala.', 2000.00, 1, 1, 4.70),
(4, 4, 4, 'Skilled carpenter for all furniture needs.', 1200.00, 1, 1, 4.50),
(5, 5, 1, 'Quick and reliable plumbing services in Gampaha.', 1400.00, 1, 1, 4.60),
(6, 8, 2, NULL, NULL, 1, 0, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `service_categories`
--

CREATE TABLE `service_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_categories`
--

INSERT INTO `service_categories` (`id`, `name`, `icon_url`) VALUES
(1, 'Plumber', '/assets/icons/plumber.png'),
(2, 'Electrician', '/assets/icons/electrician.png'),
(3, 'Tutor', '/assets/icons/tutor.png'),
(4, 'Carpenter', '/assets/icons/carpenter.png');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('customer','provider','admin') DEFAULT 'customer',
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `lat`, `lng`, `created_at`) VALUES
(1, 'Kamal Perera', 'kamal@example.com', '0711111111', '$2a$10$MvFgNz9ABkQRNGge7rIUwufeDYidnhL/YcaIMPOodvKlvxT0Rn8dG', 'provider', 6.90610000, 79.85600000, '2026-10-04 09:11:52'),
(2, 'Nimal Silva', 'nimal@example.com', '0712222222', '$2a$10$MvFgNz9ABkQRNGge7rIUwufeDYidnhL/YcaIMPOodvKlvxT0Rn8dG', 'provider', 6.86490000, 79.89970000, '2026-10-04 09:11:52'),
(3, 'Sunil Fernando', 'sunil@example.com', '0713333333', '$2a$10$MvFgNz9ABkQRNGge7rIUwufeDYidnhL/YcaIMPOodvKlvxT0Rn8dG', 'provider', 6.85110000, 79.86300000, '2026-10-04 09:11:52'),
(4, 'Ruwan Kumara', 'ruwan@example.com', '0714444444', '$2a$10$MvFgNz9ABkQRNGge7rIUwufeDYidnhL/YcaIMPOodvKlvxT0Rn8dG', 'provider', 6.97860000, 79.92720000, '2026-10-04 09:11:52'),
(5, 'Chathura Bandara', 'chathura@example.com', '0715555555', '$2a$10$MvFgNz9ABkQRNGge7rIUwufeDYidnhL/YcaIMPOodvKlvxT0Rn8dG', 'provider', 7.08730000, 79.99240000, '2026-10-04 09:11:52'),
(6, 'Admin Superuser', 'admin@skillfinder.lk', '0000000000', '$2a$10$5LgS2IP8qXWCewxLxzYZ6uFUWJ.beULext0euVBnQFs7lXBOjb95m', 'admin', NULL, NULL, '2026-10-04 09:32:57'),
(7, 'shehan sanjeewa', 'shehandesilwa1@gmail.com', '0772648698', '$2a$10$tE/kIWr6w79YUzE28v4CFOGHhLTfrbXkMvjCZC3smmufaurid8gSe', 'customer', NULL, NULL, '2026-10-04 10:32:37'),
(8, 'dineth dilanka', 'dilanka@gmail.com', '0452454224', '$2a$10$MCgEa7ITx8bhGdpiT3Yibezs8knnBuPHAFMQIFPNRhbCDjICXo6hq', 'provider', 6.98000000, 79.90000000, '2026-10-04 11:05:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `provider_id` (`provider_id`),
  ADD KEY `idx_bookings_status` (`status`),
  ADD KEY `idx_bookings_date` (`service_date`);

--
-- Indexes for table `emergency_requests`
--
ALTER TABLE `emergency_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `assigned_provider_id` (`assigned_provider_id`);

--
-- Indexes for table `provider_profiles`
--
ALTER TABLE `provider_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_provider_category` (`category_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `service_categories`
--
ALTER TABLE `service_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_location` (`lat`,`lng`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `emergency_requests`
--
ALTER TABLE `emergency_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `provider_profiles`
--
ALTER TABLE `provider_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `service_categories`
--
ALTER TABLE `service_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `emergency_requests`
--
ALTER TABLE `emergency_requests`
  ADD CONSTRAINT `emergency_requests_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `emergency_requests_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `emergency_requests_ibfk_3` FOREIGN KEY (`assigned_provider_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `provider_profiles`
--
ALTER TABLE `provider_profiles`
  ADD CONSTRAINT `provider_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `provider_profiles_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
