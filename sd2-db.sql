-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Mar 09, 2026 at 10:17 PM
-- Server version: 9.5.0
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sd2-db`
--

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `place_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `place_id`, `created_at`) VALUES
(1, 1, 1, '2026-02-14 10:05:00'),
(2, 1, 3, '2026-02-19 08:20:00'),
(3, 1, 6, '2026-02-21 18:10:00'),
(4, 1, 8, '2026-02-25 21:45:00');

-- --------------------------------------------------------

--
-- Table structure for table `places`
--

CREATE TABLE `places` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `region` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `difficulty` enum('Easy','Moderate','Hard') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `places`
--

INSERT INTO `places` (`id`, `user_id`, `title`, `description`, `region`, `category`, `difficulty`, `created_at`) VALUES
(1, 1, 'St Nectan\'s Glen Waterfall Walk', 'A fern-lined valley path ending at a dramatic waterfall and stone carving site near Tintagel.', 'Cornwall', 'nature', 'Moderate', '2026-01-12 09:15:00'),
(2, 1, 'Portmeirion Coastal Village Lanes', 'Colorful Italian-style lanes overlooking the estuary, best explored early morning before coach tours.', 'Gwynedd', 'village', 'Easy', '2026-01-15 11:35:00'),
(3, 1, 'Mam Tor Sunrise Ridge', 'A windy ridgeline route with broad views over Hope Valley and layered hills at dawn.', 'Peak District', 'viewpoint', 'Moderate', '2026-01-20 06:40:00'),
(4, 1, 'Whitby Abbey Cliff Approach', 'Historic abbey ruins reached by cliffside steps with sea views and old harbor rooftops below.', 'North Yorkshire', 'historic', 'Moderate', '2026-01-24 15:00:00'),
(8, 1, 'Corfe Castle Ruins Path', 'Hilltop castle ruins with panoramic Dorset countryside views and sheltered picnic spots below.', 'Dorset', 'historic', 'Moderate', '2026-02-09 14:05:00'),
(9, 1, 'London Eye Riverside View', 'South Bank riverside walk with skyline views and a ride on the London Eye, especially scenic around sunset.', 'London', 'viewpoint', 'Easy', '2026-02-12 17:20:00');

-- --------------------------------------------------------

--
-- Table structure for table `place_costs`
--

CREATE TABLE `place_costs` (
  `id` int NOT NULL,
  `place_id` int NOT NULL,
  `travel_cost` decimal(10,2) DEFAULT NULL,
  `food_cost` decimal(10,2) DEFAULT NULL,
  `stay_cost` decimal(10,2) DEFAULT NULL,
  `entry_fee` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `place_costs`
--

INSERT INTO `place_costs` (`id`, `place_id`, `travel_cost`, `food_cost`, `stay_cost`, `entry_fee`) VALUES
(1, 1, 42.00, 18.00, 75.00, 10.00),
(2, 2, 34.00, 22.00, 95.00, 17.00),
(3, 3, 28.00, 14.00, 65.00, 0.00),
(4, 4, 31.00, 16.00, 82.00, 15.00),
(8, 8, 29.00, 13.00, 79.00, 13.00),
(9, 9, 12.00, 20.00, 110.00, 38.00);

-- --------------------------------------------------------

--
-- Table structure for table `place_photos`
--

CREATE TABLE `place_photos` (
  `id` int NOT NULL,
  `place_id` int NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `place_photos`
--

INSERT INTO `place_photos` (`id`, `place_id`, `image_path`, `uploaded_at`) VALUES
(1, 1, '/uploads/st-nectans-glen-main.jpg', '2026-01-12 09:20:00'),
(2, 2, '/uploads/portmeirion-lanes.jpg', '2026-01-15 11:40:00'),
(3, 3, '/uploads/mam-tor-ridge.jpg', '2026-01-20 06:50:00'),
(4, 3, '/uploads/mam-tor-sunrise.jpg', '2026-01-20 06:55:00'),
(5, 4, '/uploads/whitby-abbey-cliff.jpg', '2026-01-24 15:05:00'),
(11, 9, '/uploads/1773092641707.jpg', '2026-03-09 21:44:01'),
(12, 9, '/uploads/1773092641716.JPG', '2026-03-09 21:44:01'),
(13, 8, '/uploads/1773092781541.jpg', '2026-03-09 21:46:21');

-- --------------------------------------------------------

--
-- Table structure for table `place_requirements`
--

CREATE TABLE `place_requirements` (
  `id` int NOT NULL,
  `place_id` int NOT NULL,
  `footwear` tinyint(1) DEFAULT '0',
  `water` tinyint(1) DEFAULT '0',
  `food` tinyint(1) DEFAULT '0',
  `raincoat` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `place_requirements`
--

INSERT INTO `place_requirements` (`id`, `place_id`, `footwear`, `water`, `food`, `raincoat`) VALUES
(1, 1, 1, 1, 1, 1),
(2, 2, 0, 1, 0, 1),
(3, 3, 1, 1, 1, 1),
(4, 4, 1, 1, 0, 1),
(8, 8, 1, 1, 1, 1),
(9, 9, 1, 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `place_risks`
--

CREATE TABLE `place_risks` (
  `id` int NOT NULL,
  `place_id` int NOT NULL,
  `risk_description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `place_risks`
--

INSERT INTO `place_risks` (`id`, `place_id`, `risk_description`) VALUES
(1, 1, 'Rocks around the waterfall become very slippery after heavy rain'),
(2, 3, 'Strong crosswinds on the ridge in early morning'),
(3, 4, 'Long stair section can be steep and crowded in peak season'),
(6, 8, 'Uneven stone steps inside the ruins');

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `place_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ratings`
--

INSERT INTO `ratings` (`id`, `user_id`, `place_id`, `rating`, `created_at`) VALUES
(1, 1, 1, 5, '2026-02-14 10:20:00'),
(2, 1, 3, 4, '2026-02-19 08:35:00'),
(3, 1, 4, 4, '2026-02-20 17:05:00'),
(4, 1, 5, 5, '2026-02-21 12:40:00'),
(5, 1, 6, 4, '2026-02-21 18:25:00'),
(6, 1, 8, 5, '2026-02-25 21:55:00'),
(7, 1, 9, 4, '2026-02-27 19:10:00');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `place_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `place_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 1, 5, 'Beautiful route and well worth visiting after light rain. The waterfall chamber is stunning.', '2026-02-14 10:25:00'),
(2, 1, 3, 4, 'Great ridge walk with wide views. Start early for quieter paths and better light.', '2026-02-19 08:40:00'),
(3, 1, 5, 5, 'Puzzlewood felt magical and easy to navigate. Ideal for a relaxed half-day trip.', '2026-02-21 12:45:00'),
(4, 1, 8, 5, 'Excellent historic site with open views. Bring sturdy shoes for the stone sections.', '2026-02-25 22:00:00'),
(5, 1, 9, 4, 'Great city landmark and easy to combine with a South Bank evening walk.', '2026-02-27 19:15:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `password`, `created_at`) VALUES
(1, 'lakshyadeep', '123@gmail.com', '123@gmail.com', '$2a$10$wpBsDcqxkP45Jdpl/pZZyO9fmSLCe7ABgP2myfg0fWQessv18Dmpa', '2025-12-30 18:17:59');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `places`
--
ALTER TABLE `places`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `place_costs`
--
ALTER TABLE `place_costs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `place_id` (`place_id`);

--
-- Indexes for table `place_photos`
--
ALTER TABLE `place_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `place_id` (`place_id`);

--
-- Indexes for table `place_requirements`
--
ALTER TABLE `place_requirements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `place_id` (`place_id`);

--
-- Indexes for table `place_risks`
--
ALTER TABLE `place_risks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `place_id` (`place_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `places`
--
ALTER TABLE `places`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `place_costs`
--
ALTER TABLE `place_costs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `place_photos`
--
ALTER TABLE `place_photos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `place_requirements`
--
ALTER TABLE `place_requirements`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `place_risks`
--
ALTER TABLE `place_risks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `places`
--
ALTER TABLE `places`
  ADD CONSTRAINT `places_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `place_costs`
--
ALTER TABLE `place_costs`
  ADD CONSTRAINT `place_costs_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `place_photos`
--
ALTER TABLE `place_photos`
  ADD CONSTRAINT `place_photos_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `place_requirements`
--
ALTER TABLE `place_requirements`
  ADD CONSTRAINT `place_requirements_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `place_risks`
--
ALTER TABLE `place_risks`
  ADD CONSTRAINT `place_risks_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
