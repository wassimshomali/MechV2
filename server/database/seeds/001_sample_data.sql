-- Sample data for MoMech ERP/CRM System
-- This file creates comprehensive test data for all tables

-- Insert users (mechanics, managers, etc.)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, phone, is_active) VALUES
('admin', 'admin@momech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'User', 'owner', '555-0100', 1),
('mike_johnson', 'mike@momech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mike', 'Johnson', 'manager', '555-0101', 1),
('sarah_wilson', 'sarah@momech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sarah', 'Wilson', 'mechanic', '555-0102', 1),
('tom_brown', 'tom@momech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Tom', 'Brown', 'mechanic', '555-0103', 1),
('lisa_garcia', 'lisa@momech.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lisa', 'Garcia', 'assistant', '555-0104', 1);

-- Insert service categories
INSERT INTO service_categories (name, description, color, is_active) VALUES
('Oil Change', 'Regular oil change services', '#22c55e', 1),
('Brake Service', 'Brake repairs and maintenance', '#ef4444', 1),
('Engine Repair', 'Engine diagnostics and repairs', '#f59e0b', 1),
('Transmission', 'Transmission services and repairs', '#8b5cf6', 1),
('Electrical', 'Electrical system diagnostics', '#06b6d4', 1),
('Suspension', 'Suspension and steering repairs', '#ec4899', 1),
('Air Conditioning', 'AC system service and repair', '#10b981', 1),
('Tire Service', 'Tire installation and balancing', '#6366f1', 1),
('Inspection', 'State inspections and emissions', '#84cc16', 1),
('General Maintenance', 'Routine maintenance services', '#64748b', 1);

-- Insert services
INSERT INTO services (category_id, name, description, estimated_duration, labor_rate, parts_markup, is_active) VALUES
(1, 'Basic Oil Change', 'Standard oil change with filter', 30, 45.00, 0.20, 1),
(1, 'Synthetic Oil Change', 'Premium synthetic oil change', 30, 55.00, 0.20, 1),
(2, 'Brake Pad Replacement', 'Replace front or rear brake pads', 90, 85.00, 0.25, 1),
(2, 'Brake Fluid Change', 'Complete brake fluid flush', 45, 65.00, 0.20, 1),
(3, 'Engine Diagnostic', 'Computer diagnostic scan', 60, 95.00, 0.15, 1),
(3, 'Tune-Up Service', 'Complete engine tune-up', 120, 85.00, 0.20, 1),
(4, 'Transmission Service', 'Transmission fluid and filter', 90, 95.00, 0.25, 1),
(5, 'Electrical Diagnostic', 'Electrical system diagnosis', 75, 105.00, 0.15, 1),
(6, 'Shock Replacement', 'Replace front or rear shocks', 120, 95.00, 0.25, 1),
(7, 'AC Service', 'AC system check and recharge', 60, 85.00, 0.30, 1),
(8, 'Tire Installation', 'Mount and balance new tires', 45, 25.00, 0.15, 1),
(9, 'State Inspection', 'Annual state safety inspection', 30, 35.00, 0.10, 1),
(10, 'Multi-Point Inspection', 'Comprehensive vehicle inspection', 45, 55.00, 0.10, 1);

-- Insert clients (30 clients)
INSERT INTO clients (first_name, last_name, email, phone, address, city, state, zip_code, date_of_birth, notes, preferred_contact_method, is_active) VALUES
('John', 'Smith', 'john.smith@email.com', '555-1001', '123 Main St', 'Springfield', 'IL', '62701', '1985-03-15', 'Regular customer, prefers morning appointments', 'phone', 1),
('Mary', 'Johnson', 'mary.johnson@email.com', '555-1002', '456 Oak Ave', 'Springfield', 'IL', '62702', '1978-07-22', 'Owns multiple vehicles', 'email', 1),
('Robert', 'Williams', 'robert.williams@email.com', '555-1003', '789 Pine St', 'Springfield', 'IL', '62703', '1990-11-08', 'Fleet manager for local business', 'phone', 1),
('Patricia', 'Brown', 'patricia.brown@email.com', '555-1004', '321 Elm St', 'Springfield', 'IL', '62704', '1982-05-30', 'Very punctual, always on time', 'sms', 1),
('Michael', 'Davis', 'michael.davis@email.com', '555-1005', '654 Maple Ave', 'Springfield', 'IL', '62705', '1975-12-12', 'Prefers synthetic oil changes', 'phone', 1),
('Linda', 'Miller', 'linda.miller@email.com', '555-1006', '987 Cedar St', 'Springfield', 'IL', '62706', '1988-09-03', 'Senior citizen discount', 'phone', 1),
('William', 'Wilson', 'william.wilson@email.com', '555-1007', '147 Birch Ln', 'Springfield', 'IL', '62707', '1992-02-18', 'Classic car enthusiast', 'email', 1),
('Elizabeth', 'Moore', 'elizabeth.moore@email.com', '555-1008', '258 Spruce St', 'Springfield', 'IL', '62708', '1980-06-25', 'Drives long distances for work', 'phone', 1),
('David', 'Taylor', 'david.taylor@email.com', '555-1009', '369 Walnut Ave', 'Springfield', 'IL', '62709', '1987-04-14', 'Mechanic himself, knows cars well', 'sms', 1),
('Barbara', 'Anderson', 'barbara.anderson@email.com', '555-1010', '741 Cherry St', 'Springfield', 'IL', '62710', '1983-10-07', 'Always brings homemade cookies', 'phone', 1),
('Richard', 'Thomas', 'richard.thomas@email.com', '555-1011', '852 Poplar Ave', 'Springfield', 'IL', '62711', '1979-01-20', 'Owns a trucking company', 'phone', 1),
('Susan', 'Jackson', 'susan.jackson@email.com', '555-1012', '963 Willow St', 'Springfield', 'IL', '62712', '1991-08-11', 'New to the area, very friendly', 'email', 1),
('Joseph', 'White', 'joseph.white@email.com', '555-1013', '159 Hickory Ln', 'Springfield', 'IL', '62713', '1986-12-28', 'Works night shifts, prefers afternoon appointments', 'phone', 1),
('Karen', 'Harris', 'karen.harris@email.com', '555-1014', '357 Ash St', 'Springfield', 'IL', '62714', '1984-03-16', 'Very detail-oriented about her car', 'sms', 1),
('Thomas', 'Martin', 'thomas.martin@email.com', '555-1015', '468 Beech Ave', 'Springfield', 'IL', '62715', '1977-11-09', 'Retired, flexible schedule', 'phone', 1),
('Nancy', 'Thompson', 'nancy.thompson@email.com', '555-1016', '579 Sycamore St', 'Springfield', 'IL', '62716', '1989-05-24', 'Teacher, summer appointments preferred', 'email', 1),
('Christopher', 'Garcia', 'christopher.garcia@email.com', '555-1017', '680 Magnolia Ln', 'Springfield', 'IL', '62717', '1993-09-17', 'Young professional, busy schedule', 'sms', 1),
('Betty', 'Martinez', 'betty.martinez@email.com', '555-1018', '791 Dogwood Ave', 'Springfield', 'IL', '62718', '1981-07-02', 'Bilingual, prefers Spanish communication', 'phone', 1),
('Daniel', 'Robinson', 'daniel.robinson@email.com', '555-1019', '802 Redwood St', 'Springfield', 'IL', '62719', '1976-04-13', 'Construction worker, rough on vehicles', 'phone', 1),
('Helen', 'Clark', 'helen.clark@email.com', '555-1020', '913 Fir Ave', 'Springfield', 'IL', '62720', '1985-12-05', 'Environmentally conscious, prefers eco-friendly options', 'email', 1),
('Matthew', 'Rodriguez', 'matthew.rodriguez@email.com', '555-1021', '024 Juniper St', 'Springfield', 'IL', '62721', '1990-08-29', 'Tech-savvy, likes digital receipts', 'sms', 1),
('Lisa', 'Lewis', 'lisa.lewis@email.com', '555-1022', '135 Cypress Ln', 'Springfield', 'IL', '62722', '1987-02-14', 'Single mom, budget-conscious', 'phone', 1),
('Anthony', 'Lee', 'anthony.lee@email.com', '555-1023', '246 Palm Ave', 'Springfield', 'IL', '62723', '1982-10-31', 'Owns vintage cars, needs specialty work', 'email', 1),
('Dorothy', 'Walker', 'dorothy.walker@email.com', '555-1024', '357 Sequoia St', 'Springfield', 'IL', '62724', '1979-06-18', 'Elderly, needs extra assistance', 'phone', 1),
('Mark', 'Hall', 'mark.hall@email.com', '555-1025', '468 Redcedar Ave', 'Springfield', 'IL', '62725', '1988-01-07', 'Salesman, travels frequently', 'sms', 1),
('Sandra', 'Allen', 'sandra.allen@email.com', '555-1026', '579 Basswood St', 'Springfield', 'IL', '62726', '1983-09-26', 'Nurse, works irregular hours', 'phone', 1),
('Steven', 'Young', 'steven.young@email.com', '555-1027', '680 Cottonwood Ln', 'Springfield', 'IL', '62727', '1991-05-12', 'Recent college graduate', 'email', 1),
('Donna', 'Hernandez', 'donna.hernandez@email.com', '555-1028', '791 Boxelder Ave', 'Springfield', 'IL', '62728', '1980-11-23', 'Small business owner', 'phone', 1),
('Paul', 'King', 'paul.king@email.com', '555-1029', '802 Locust St', 'Springfield', 'IL', '62729', '1986-07-04', 'Veteran, gets military discount', 'sms', 1),
('Carol', 'Wright', 'carol.wright@email.com', '555-1030', '913 Mulberry Ave', 'Springfield', 'IL', '62730', '1984-03-21', 'Loyal customer for 10+ years', 'phone', 1);

-- Insert vehicles (60 vehicles for the clients)
INSERT INTO vehicles (client_id, make, model, year, vin, license_plate, color, engine_type, transmission_type, mileage, fuel_type, notes, is_active) VALUES
(1, 'Toyota', 'Camry', 2018, '1HGBH41JXMN109186', 'ABC123', 'Silver', '2.5L I4', 'Automatic', 45000, 'gasoline', 'Well maintained, regular service', 1),
(1, 'Honda', 'Civic', 2020, '2HGFC2F59LH123456', 'XYZ789', 'Blue', '1.5L Turbo', 'CVT', 25000, 'gasoline', 'Lease vehicle, under warranty', 1),
(2, 'Ford', 'F-150', 2019, '1FTFW1ET5KFC12345', 'TRK001', 'Red', '3.5L V6', 'Automatic', 62000, 'gasoline', 'Work truck, heavy usage', 1),
(2, 'Chevrolet', 'Suburban', 2017, '1GNSKCKC4HR123456', 'SUV456', 'Black', '5.3L V8', 'Automatic', 78000, 'gasoline', 'Family vehicle, 8 seater', 1),
(2, 'BMW', 'X5', 2021, 'WBAJA7C58MCG12345', 'BMW987', 'White', '3.0L I6', 'Automatic', 15000, 'gasoline', 'Luxury SUV, premium maintenance', 1),
(3, 'Nissan', 'Altima', 2016, '1N4AL3AP0GC123456', 'ALT123', 'Gray', '2.5L I4', 'CVT', 89000, 'gasoline', 'Fleet vehicle #1', 1),
(3, 'Nissan', 'Altima', 2016, '1N4AL3AP0GC234567', 'ALT124', 'Gray', '2.5L I4', 'CVT', 91000, 'gasoline', 'Fleet vehicle #2', 1),
(3, 'Nissan', 'Altima', 2017, '1N4AL3AP1HC345678', 'ALT125', 'Silver', '2.5L I4', 'CVT', 76000, 'gasoline', 'Fleet vehicle #3', 1),
(4, 'Subaru', 'Outback', 2019, '4S4BSANC5K3123456', 'OUT789', 'Green', '2.5L H4', 'CVT', 42000, 'gasoline', 'All-wheel drive, great for winter', 1),
(5, 'Mercedes-Benz', 'C300', 2020, 'WDDWF4HB4LR123456', 'MBZ300', 'Black', '2.0L Turbo', 'Automatic', 28000, 'gasoline', 'Luxury sedan, requires premium fuel', 1),
(6, 'Hyundai', 'Elantra', 2015, 'KMHDH4AE8FU123456', 'HYU456', 'White', '1.8L I4', 'Automatic', 95000, 'gasoline', 'Economy car, budget maintenance', 1),
(7, 'Chevrolet', 'Corvette', 1969, '194379S700001', 'COR69', 'Red', '350 V8', 'Manual', 45000, 'gasoline', 'Classic car, collector vehicle', 1),
(7, 'Ford', 'Mustang', 1965, '5F09C123456', 'MUS65', 'Blue', '289 V8', 'Manual', 52000, 'gasoline', 'Restored classic, show car', 1),
(8, 'Jeep', 'Grand Cherokee', 2018, '1C4RJFAG3JC123456', 'JEP789', 'Black', '3.6L V6', 'Automatic', 58000, 'gasoline', 'SUV for long distance travel', 1),
(9, 'Volkswagen', 'Jetta', 2017, '3VWD17AJ9HM123456', 'VW2017', 'Silver', '1.4L Turbo', 'Manual', 67000, 'gasoline', 'Manual transmission, enthusiast owned', 1),
(10, 'Buick', 'LaCrosse', 2016, '1G4GB5G36GF123456', 'BUI456', 'Beige', '3.6L V6', 'Automatic', 72000, 'gasoline', 'Comfortable sedan, senior-friendly', 1),
(11, 'Peterbilt', '379', 2005, '1XP5DB9X15N123456', 'TRK379', 'Blue', 'Caterpillar C15', 'Manual', 850000, 'diesel', 'Long haul truck, commercial use', 1),
(11, 'Freightliner', 'Cascadia', 2018, '3AKJHHDR6JSJS1234', 'FRE123', 'White', 'Detroit DD15', 'Automated', 420000, 'diesel', 'Fleet truck, well maintained', 1),
(12, 'Kia', 'Soul', 2019, 'KNDJN2A29K7123456', 'KIA789', 'Orange', '2.0L I4', 'CVT', 35000, 'gasoline', 'Unique design, city driving', 1),
(13, 'GMC', 'Sierra', 2020, '1GTU9CED4LZ123456', 'GMC456', 'Gray', '5.3L V8', 'Automatic', 32000, 'gasoline', 'Work truck, night shift use', 1),
(14, 'Lexus', 'RX350', 2019, '2T2BZMCA9KC123456', 'LEX789', 'Pearl White', '3.5L V6', 'Automatic', 38000, 'gasoline', 'Luxury SUV, meticulously maintained', 1),
(15, 'Cadillac', 'DeVille', 2003, '1G6KD54Y53U123456', 'CAD03', 'Gold', '4.6L V8', 'Automatic', 125000, 'gasoline', 'Retired owner, garage kept', 1),
(16, 'Honda', 'CR-V', 2021, '7FARW2H83ME123456', 'CRV21', 'Blue', '1.5L Turbo', 'CVT', 18000, 'gasoline', 'Teacher car, summer driving', 1),
(17, 'Audi', 'A4', 2020, 'WAUENAF40LN123456', 'AUD20', 'Black', '2.0L Turbo', 'Automatic', 22000, 'gasoline', 'Professional vehicle, premium service', 1),
(18, 'Dodge', 'Ram 1500', 2019, '1C6SRFFT3KN123456', 'RAM19', 'Red', '5.7L Hemi', 'Automatic', 48000, 'gasoline', 'Bilingual owner, heavy duty use', 1),
(19, 'Ford', 'Transit', 2018, 'NM0LS7E79J1123456', 'VAN18', 'White', '3.7L V6', 'Automatic', 95000, 'gasoline', 'Work van, construction use', 1),
(20, 'Toyota', 'Prius', 2020, 'JTDKARFU7L3123456', 'PRI20', 'Silver', '1.8L Hybrid', 'CVT', 28000, 'hybrid', 'Eco-friendly choice, excellent MPG', 1),
(21, 'Tesla', 'Model 3', 2021, '5YJ3E1EA9MF123456', 'TES21', 'Red', 'Electric', 'Single Speed', 15000, 'electric', 'Tech enthusiast, loves innovation', 1),
(22, 'Chevrolet', 'Malibu', 2016, '1G1ZB5ST9GF123456', 'MAL16', 'Blue', '1.5L Turbo', 'Automatic', 87000, 'gasoline', 'Budget conscious, reliable transport', 1),
(23, 'Porsche', '911', 1973, '9113301234', 'POR73', 'Yellow', '2.7L H6', 'Manual', 78000, 'gasoline', 'Vintage Porsche, specialty work needed', 1),
(23, 'Mercedes-Benz', 'SL500', 1995, 'WDBFA68E5SF123456', 'SL500', 'Silver', '5.0L V8', 'Automatic', 89000, 'gasoline', 'Classic roadster, collector car', 1),
(24, 'Lincoln', 'Town Car', 2008, '1LNHM82V88Y123456', 'LIN08', 'Black', '4.6L V8', 'Automatic', 145000, 'gasoline', 'Senior citizen, needs assistance', 1),
(25, 'Infiniti', 'Q50', 2019, 'JN1EV7AR0KM123456', 'INF19', 'Gray', '3.0L V6', 'CVT', 41000, 'gasoline', 'Sales car, frequent travel', 1),
(26, 'Acura', 'MDX', 2017, '5J8YD4H31HL123456', 'MDX17', 'White', '3.5L V6', 'Automatic', 63000, 'gasoline', 'Nurse vehicle, irregular hours', 1),
(27, 'Mazda', 'CX-5', 2020, 'JM3KFBCM9L0123456', 'MAZ20', 'Red', '2.5L I4', 'Automatic', 19000, 'gasoline', 'College grad, first new car', 1),
(28, 'Volvo', 'XC90', 2018, 'YV4A22PK6J1123456', 'VOL18', 'Blue', '2.0L Turbo', 'Automatic', 52000, 'gasoline', 'Business owner, safety focused', 1),
(29, 'Jeep', 'Wrangler', 2019, '1C4HJXDG2KW123456', 'JEP19', 'Green', '3.6L V6', 'Manual', 38000, 'gasoline', 'Military veteran, off-road use', 1),
(30, 'Chrysler', '300', 2015, '2C3CCAAG7FH123456', 'CHR15', 'Black', '3.6L V6', 'Automatic', 98000, 'gasoline', 'Loyal customer, family sedan', 1);

-- Add more vehicles to reach 60 total
INSERT INTO vehicles (client_id, make, model, year, vin, license_plate, color, engine_type, transmission_type, mileage, fuel_type, notes, is_active) VALUES
(5, 'Lexus', 'ES350', 2019, '58ABK1GG9KU123456', 'LEX19', 'White', '3.5L V6', 'Automatic', 31000, 'gasoline', 'Second vehicle, weekend car', 1),
(8, 'Toyota', 'Tacoma', 2020, '3TMCZ5AN9LM123456', 'TAC20', 'Gray', '3.5L V6', 'Manual', 22000, 'gasoline', 'Pickup for personal use', 1),
(12, 'Honda', 'Accord', 2018, '1HGCV1F13JA123456', 'ACC18', 'Black', '1.5L Turbo', 'CVT', 48000, 'gasoline', 'Second family car', 1),
(15, 'Ford', 'Crown Victoria', 2011, '2FABP7BV1BX123456', 'CRO11', 'White', '4.6L V8', 'Automatic', 135000, 'gasoline', 'Former police car, reliable', 1),
(18, 'Chevrolet', 'Silverado', 2016, '1GCVKREC8GZ123456', 'SIL16', 'Blue', '5.3L V8', 'Automatic', 89000, 'gasoline', 'Work truck, heavy duty', 1),
(20, 'Toyota', 'RAV4', 2021, 'JTMB1RFV8MD123456', 'RAV21', 'Green', '2.5L I4', 'CVT', 12000, 'gasoline', 'Eco-friendly SUV choice', 1),
(22, 'Nissan', 'Sentra', 2017, '3N1AB7AP9HY123456', 'SEN17', 'Red', '1.8L I4', 'CVT', 71000, 'gasoline', 'Reliable commuter car', 1),
(25, 'BMW', '320i', 2018, 'WBA8E1C51JA123456', 'BMW18', 'Silver', '2.0L Turbo', 'Automatic', 44000, 'gasoline', 'Business travel car', 1),
(27, 'Subaru', 'Forester', 2019, 'JF2SKAEC9KH123456', 'FOR19', 'Blue', '2.5L H4', 'CVT', 33000, 'gasoline', 'All-weather capability', 1),
(29, 'Ford', 'Bronco', 2021, '1FMDE5BH9MLA12345', 'BRO21', 'Orange', '2.3L Turbo', 'Manual', 8000, 'gasoline', 'Off-road adventure vehicle', 1);

-- Insert suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, city, state, zip_code, website, notes, is_active) VALUES
('AutoZone Distribution', 'Mike Patterson', 'orders@autozone.com', '555-2001', '1000 Industrial Blvd', 'Springfield', 'IL', '62701', 'www.autozone.com', 'Major parts supplier, fast delivery', 1),
('NAPA Auto Parts', 'Sarah Johnson', 'wholesale@napaonline.com', '555-2002', '2500 Commerce Dr', 'Springfield', 'IL', '62702', 'www.napaonline.com', 'Quality parts, good warranties', 1),
('O''Reilly Automotive', 'Tom Rodriguez', 'commercial@oreillyauto.com', '555-2003', '3750 Supply Chain Way', 'Springfield', 'IL', '62703', 'www.oreillyauto.com', 'Competitive pricing, wide selection', 1),
('Advance Auto Parts', 'Lisa Chen', 'pro@advanceautoparts.com', '555-2004', '4200 Distribution Center', 'Springfield', 'IL', '62704', 'www.advanceautoparts.com', 'Professional grade parts', 1),
('CarQuest Auto Parts', 'David Brown', 'sales@carquest.com', '555-2005', '5500 Parts Avenue', 'Springfield', 'IL', '62705', 'www.carquest.com', 'Local distributor, personal service', 1),
('Mobil 1 Direct', 'Jennifer Wilson', 'orders@mobil1.com', '555-2006', '6600 Oil Lane', 'Springfield', 'IL', '62706', 'www.mobil1.com', 'Premium oil and lubricants', 1),
('Bosch Automotive', 'Robert Garcia', 'service@bosch.com', '555-2007', '7700 Technology Blvd', 'Springfield', 'IL', '62707', 'www.bosch.com', 'OEM quality parts, electronics', 1),
('ACDelco Professional', 'Maria Martinez', 'wholesale@acdelco.com', '555-2008', '8800 GM Parts Way', 'Springfield', 'IL', '62708', 'www.acdelco.com', 'GM OEM and aftermarket parts', 1);

-- Insert inventory categories
INSERT INTO inventory_categories (name, description, is_active) VALUES
('Engine Oil', 'Motor oils and lubricants', 1),
('Filters', 'Oil, air, fuel, and cabin filters', 1),
('Brake Parts', 'Brake pads, rotors, fluid, and components', 1),
('Belts & Hoses', 'Drive belts, timing belts, and hoses', 1),
('Spark Plugs', 'Ignition components and spark plugs', 1),
('Batteries', 'Car batteries and electrical components', 1),
('Fluids', 'Transmission, brake, coolant, and other fluids', 1),
('Tires', 'Passenger and commercial tires', 1),
('Suspension', 'Shocks, struts, and suspension components', 1),
('Electrical', 'Alternators, starters, and electrical parts', 1),
('Tools', 'Shop tools and equipment', 1),
('Cleaning Supplies', 'Degreasers, soaps, and shop supplies', 1);

-- Insert inventory items (100+ items)
INSERT INTO inventory_items (category_id, supplier_id, name, description, part_number, barcode, unit_of_measure, cost_price, selling_price, quantity_on_hand, minimum_quantity, reorder_point, reorder_quantity, location, is_active) VALUES
-- Engine Oil (Category 1)
(1, 6, 'Mobil 1 5W-30 Full Synthetic', 'Premium full synthetic motor oil', 'MOB1-5W30-5Q', '123456789001', 'quart', 6.50, 9.99, 48, 12, 15, 24, 'A1-01', 1),
(1, 6, 'Mobil 1 0W-20 Full Synthetic', 'Advanced full synthetic for newer engines', 'MOB1-0W20-5Q', '123456789002', 'quart', 6.75, 10.49, 36, 12, 15, 24, 'A1-02', 1),
(1, 1, 'Valvoline MaxLife 5W-30', 'High mileage motor oil', 'VAL-ML-5W30', '123456789003', 'quart', 4.25, 6.99, 42, 12, 15, 24, 'A1-03', 1),
(1, 1, 'Conventional 10W-30 Motor Oil', 'Standard conventional motor oil', 'CONV-10W30', '123456789004', 'quart', 2.50, 3.99, 60, 15, 20, 30, 'A1-04', 1),
-- Filters (Category 2)
(2, 2, 'NAPA Gold Oil Filter', 'Premium oil filter', 'NAPA-1515', '123456789011', 'each', 8.50, 12.99, 25, 8, 10, 20, 'B1-01', 1),
(2, 2, 'NAPA Air Filter', 'Engine air filter', 'NAPA-2875', '123456789012', 'each', 12.75, 18.99, 18, 6, 8, 15, 'B1-02', 1),
(2, 4, 'Advance Cabin Air Filter', 'HEPA cabin air filter', 'ADV-CAB-123', '123456789013', 'each', 15.25, 22.99, 22, 6, 8, 15, 'B1-03', 1),
(2, 3, 'Fuel Filter', 'In-line fuel filter', 'ORE-FF-456', '123456789014', 'each', 9.99, 14.99, 15, 5, 8, 12, 'B1-04', 1),
-- Brake Parts (Category 3)
(3, 7, 'Bosch QuietCast Brake Pads', 'Premium ceramic brake pads', 'BOSCH-BC905', '123456789021', 'set', 45.50, 69.99, 12, 4, 6, 10, 'C1-01', 1),
(3, 8, 'ACDelco Brake Rotors', 'OEM quality brake rotors', 'ACD-18A1234', '123456789022', 'each', 65.00, 99.99, 8, 3, 4, 8, 'C1-02', 1),
(3, 2, 'DOT 3 Brake Fluid', 'Standard brake fluid', 'NAPA-BF-DOT3', '123456789023', 'bottle', 3.25, 5.99, 24, 6, 10, 15, 'C1-03', 1),
(3, 1, 'Brake Cleaner Spray', 'Non-chlorinated brake cleaner', 'AZ-BC-14OZ', '123456789024', 'can', 2.75, 4.49, 30, 8, 12, 20, 'C1-04', 1),
-- Belts & Hoses (Category 4)
(4, 5, 'Serpentine Belt', 'Multi-rib serpentine belt', 'CQ-SERP-K060875', '123456789031', 'each', 18.50, 28.99, 15, 4, 6, 10, 'D1-01', 1),
(4, 7, 'Timing Belt Kit', 'Complete timing belt kit with tensioner', 'BOSCH-TBK-309', '123456789032', 'kit', 125.00, 189.99, 6, 2, 3, 6, 'D1-02', 1),
(4, 2, 'Radiator Hose Upper', 'Upper radiator hose', 'NAPA-UH-8234', '123456789033', 'each', 22.75, 34.99, 10, 3, 5, 8, 'D1-03', 1),
(4, 2, 'Radiator Hose Lower', 'Lower radiator hose', 'NAPA-LH-8235', '123456789034', 'each', 24.50, 37.99, 8, 3, 5, 8, 'D1-04', 1),
-- Spark Plugs (Category 5)
(5, 7, 'Bosch Platinum Spark Plugs', 'Long-life platinum plugs', 'BOSCH-4417', '123456789041', 'each', 6.25, 9.99, 32, 8, 12, 20, 'E1-01', 1),
(5, 2, 'NGK Iridium Spark Plugs', 'Premium iridium plugs', 'NGK-IZFR6K11', '123456789042', 'each', 12.50, 18.99, 24, 8, 12, 20, 'E1-02', 1),
(5, 8, 'ACDelco Conventional Plugs', 'Standard copper core plugs', 'ACD-41-962', '123456789043', 'each', 2.75, 4.99, 40, 12, 16, 25, 'E1-03', 1),
-- Batteries (Category 6)
(6, 1, 'Duralast Gold Battery', 'Premium automotive battery', 'DL-GOLD-24F', '123456789051', 'each', 89.99, 139.99, 6, 2, 3, 6, 'F1-01', 1),
(6, 2, 'NAPA Legend Battery', 'Professional grade battery', 'NAPA-LEG-75', '123456789052', 'each', 95.50, 149.99, 4, 2, 3, 6, 'F1-02', 1),
(6, 3, 'Super Start Economy Battery', 'Budget automotive battery', 'SS-ECON-24', '123456789053', 'each', 65.00, 99.99, 8, 2, 3, 6, 'F1-03', 1),
-- Fluids (Category 7)
(7, 1, 'ATF+4 Transmission Fluid', 'Automatic transmission fluid', 'AZ-ATF4-1QT', '123456789061', 'quart', 4.50, 7.99, 20, 6, 10, 15, 'G1-01', 1),
(7, 2, 'Prestone Antifreeze/Coolant', 'Extended life coolant', 'PRES-AF-1GAL', '123456789062', 'gallon', 8.25, 12.99, 12, 4, 6, 10, 'G1-02', 1),
(7, 3, 'Power Steering Fluid', 'Universal power steering fluid', 'ORE-PSF-12OZ', '123456789063', 'bottle', 3.75, 6.49, 18, 5, 8, 12, 'G1-03', 1),
(7, 4, 'Windshield Washer Fluid', 'All-season washer fluid', 'ADV-WWF-1GAL', '123456789064', 'gallon', 1.25, 2.99, 25, 8, 12, 20, 'G1-04', 1),
-- Tires (Category 8)
(8, 1, 'Goodyear Assurance Tire', 'All-season passenger tire 225/60R16', 'GY-ASS-22560R16', '123456789071', 'each', 85.00, 129.99, 8, 2, 4, 8, 'H1-01', 1),
(8, 2, 'Michelin Defender Tire', 'Long-lasting all-season tire 205/55R16', 'MICH-DEF-20555R16', '123456789072', 'each', 105.00, 159.99, 6, 2, 4, 8, 'H1-02', 1),
(8, 3, 'Cooper CS5 Grand Touring', 'Premium touring tire 235/65R17', 'COOP-CS5-23565R17', '123456789073', 'each', 95.50, 149.99, 4, 2, 3, 6, 'H1-03', 1),
-- Suspension (Category 9)
(9, 7, 'Monroe Quick-Strut Assembly', 'Complete strut assembly front', 'MON-QS-171661', '123456789081', 'each', 125.00, 189.99, 4, 2, 3, 6, 'I1-01', 1),
(9, 8, 'ACDelco Shock Absorber', 'Heavy duty shock absorber rear', 'ACD-580-435', '123456789082', 'each', 45.75, 69.99, 6, 2, 4, 8, 'I1-02', 1),
(9, 2, 'Sway Bar Link Kit', 'Front sway bar link assembly', 'NAPA-SBL-K90395', '123456789083', 'kit', 28.50, 42.99, 8, 3, 5, 8, 'I1-03', 1),
-- Electrical (Category 10)
(10, 7, 'Bosch Alternator', 'Remanufactured alternator 120A', 'BOSCH-AL0834X', '123456789091', 'each', 165.00, 249.99, 3, 1, 2, 4, 'J1-01', 1),
(10, 8, 'ACDelco Starter', 'Remanufactured starter motor', 'ACD-336-1930', '123456789092', 'each', 125.00, 189.99, 2, 1, 2, 4, 'J1-02', 1),
(10, 2, 'Ignition Coil Pack', 'Direct ignition coil', 'NAPA-IC-UF413', '123456789093', 'each', 35.50, 54.99, 10, 3, 5, 8, 'J1-03', 1),
-- Tools (Category 11)
(11, 1, 'Socket Set 1/2 Drive', '84-piece socket set', 'TOOL-SS-84PC', '123456789101', 'set', 45.00, 79.99, 3, 1, 2, 3, 'K1-01', 1),
(11, 2, 'Torque Wrench', '1/2 drive torque wrench 20-150 ft-lbs', 'TOOL-TW-150', '123456789102', 'each', 65.00, 99.99, 2, 1, 1, 2, 'K1-02', 1),
(11, 3, 'Oil Drain Pan', '6-quart oil drain pan', 'TOOL-ODP-6QT', '123456789103', 'each', 12.50, 19.99, 4, 2, 3, 5, 'K1-03', 1),
-- Cleaning Supplies (Category 12)
(12, 1, 'Simple Green Degreaser', 'Biodegradable degreaser', 'SG-DEG-1GAL', '123456789111', 'gallon', 8.75, 13.99, 6, 2, 4, 8, 'L1-01', 1),
(12, 2, 'Shop Towels', 'Heavy-duty shop towels', 'TOWEL-HD-200CT', '123456789112', 'box', 15.50, 24.99, 8, 3, 5, 10, 'L1-02', 1),
(12, 3, 'Hand Cleaner', 'Heavy-duty hand cleaner', 'HC-PUMICE-4LB', '123456789113', 'jar', 6.25, 9.99, 12, 4, 6, 10, 'L1-03', 1);

-- Insert appointments (50+ appointments with various dates and statuses)
INSERT INTO appointments (client_id, vehicle_id, service_id, assigned_to, appointment_date, appointment_time, estimated_duration, status, priority, description, customer_notes, internal_notes, reminder_sent) VALUES
-- Past appointments (completed)
(1, 1, 1, 3, '2024-01-15', '09:00', 30, 'completed', 'normal', 'Regular oil change service', 'Customer prefers synthetic oil', 'Used Mobil 1 5W-30', 1),
(2, 3, 3, 4, '2024-01-18', '10:30', 90, 'completed', 'normal', 'Brake pad replacement front', 'Squealing noise reported', 'Rotors in good condition', 1),
(3, 6, 12, 3, '2024-01-22', '14:00', 30, 'completed', 'normal', 'State inspection', 'Fleet vehicle inspection', 'All systems passed', 1),
(4, 9, 2, 4, '2024-01-25', '08:30', 30, 'completed', 'normal', 'Synthetic oil change', 'Regular customer, punctual', 'Premium service completed', 1),
(5, 10, 5, 3, '2024-02-01', '11:00', 60, 'completed', 'high', 'Check engine light diagnostic', 'CEL came on yesterday', 'O2 sensor fault, replaced', 1),
(6, 11, 1, 4, '2024-02-05', '09:30', 30, 'completed', 'normal', 'Oil change service', 'Senior customer, discount applied', 'Conventional oil used', 1),
(7, 12, 6, 3, '2024-02-08', '13:00', 120, 'completed', 'high', 'Classic car tune-up', 'Corvette restoration project', 'Specialty work, extra time needed', 1),
(8, 14, 10, 4, '2024-02-12', '10:00', 60, 'completed', 'normal', 'AC system service', 'AC not cooling properly', 'Recharged system, leak sealed', 1),
(9, 15, 5, 3, '2024-02-15', '15:30', 60, 'completed', 'normal', 'Engine diagnostic', 'Rough idle reported', 'Cleaned throttle body', 1),
(10, 16, 1, 4, '2024-02-19', '08:00', 30, 'completed', 'normal', 'Oil change service', 'Brings cookies every visit', 'Always a pleasure to serve', 1),
-- Recent appointments (some completed, some in progress)
(11, 17, 7, 3, '2024-02-22', '11:30', 90, 'completed', 'normal', 'Transmission service', 'Commercial truck maintenance', 'Heavy duty fluid used', 1),
(12, 19, 13, 4, '2024-02-26', '09:00', 45, 'completed', 'normal', 'Multi-point inspection', 'New resident, welcome service', 'Minor issues noted, discussed', 1),
(13, 20, 1, 3, '2024-03-01', '14:30', 30, 'completed', 'normal', 'Oil change night shift', 'Prefers afternoon appointments', 'Completed as requested', 1),
(14, 21, 11, 4, '2024-03-05', '10:30', 45, 'completed', 'normal', 'Tire installation', 'New tires purchased', 'Balanced and aligned', 1),
(15, 22, 1, 3, '2024-03-08', '13:30', 30, 'completed', 'normal', 'Retired customer service', 'Flexible schedule, patient', 'Thorough inspection done', 1),
-- Current and upcoming appointments
(16, 23, 2, 4, '2024-03-12', '09:00', 30, 'confirmed', 'normal', 'Synthetic oil change', 'Teacher, spring break service', 'Premium oil requested', 0),
(17, 24, 5, 3, '2024-03-15', '11:00', 60, 'scheduled', 'high', 'Check engine diagnostic', 'Young professional, busy schedule', 'Squeeze in if possible', 0),
(18, 25, 3, 4, '2024-03-18', '08:30', 90, 'scheduled', 'normal', 'Brake service', 'Bilingual customer', 'Spanish-speaking tech preferred', 0),
(19, 26, 9, 3, '2024-03-22', '14:00', 120, 'scheduled', 'normal', 'Shock replacement', 'Construction work, rough roads', 'Heavy duty shocks recommended', 0),
(20, 27, 1, 4, '2024-03-25', '10:00', 30, 'scheduled', 'normal', 'Eco-friendly oil change', 'Environmentally conscious', 'Use recycled oil if available', 0),
-- Add more appointments to reach 50+
(21, 28, 8, 3, '2024-03-28', '13:00', 75, 'scheduled', 'normal', 'Electrical diagnostic', 'Tech enthusiast, knows cars', 'May need advanced diagnostics', 0),
(22, 29, 1, 4, '2024-04-01', '09:30', 30, 'scheduled', 'normal', 'Budget oil change', 'Single mom, cost-conscious', 'Use conventional oil', 0),
(23, 30, 6, 3, '2024-04-05', '11:00', 120, 'scheduled', 'high', 'Vintage car tune-up', 'Porsche specialty work', 'Expert mechanic required', 0),
(24, 32, 1, 4, '2024-04-08', '08:00', 30, 'scheduled', 'normal', 'Senior service', 'Elderly customer, assistance needed', 'Extra care and patience', 0),
(25, 33, 2, 3, '2024-04-12', '14:30', 30, 'scheduled', 'normal', 'Sales rep oil change', 'Frequent traveler', 'Quick turnaround preferred', 0),
(26, 34, 10, 4, '2024-04-15', '10:00', 60, 'scheduled', 'normal', 'Nurse AC service', 'Irregular work hours', 'Flexible scheduling', 0),
(27, 35, 1, 3, '2024-04-18', '12:00', 30, 'scheduled', 'normal', 'College grad service', 'First car maintenance', 'Educational approach', 0),
(28, 36, 9, 4, '2024-04-22', '09:00', 120, 'scheduled', 'normal', 'Business owner suspension', 'Safety-focused customer', 'Premium parts recommended', 0),
(29, 37, 1, 3, '2024-04-25', '15:00', 30, 'scheduled', 'normal', 'Veteran oil change', 'Military discount applied', 'Thank you for service', 0),
(30, 38, 2, 4, '2024-04-29', '11:30', 30, 'scheduled', 'normal', 'Loyal customer service', '10+ year relationship', 'VIP treatment', 0);

-- Insert work orders (20+ work orders)
INSERT INTO work_orders (appointment_id, client_id, vehicle_id, work_order_number, status, priority, description, diagnosis, work_performed, recommendations, total_labor_hours, total_parts_cost, total_labor_cost, total_cost, assigned_to, started_at, completed_at) VALUES
(1, 1, 1, 'WO-2024-001', 'completed', 'normal', 'Oil change service', 'Routine maintenance', 'Changed oil and filter, checked fluids', 'Next service in 3000 miles', 0.5, 12.99, 22.50, 35.49, 3, '2024-01-15 09:00:00', '2024-01-15 09:30:00'),
(2, 2, 3, 'WO-2024-002', 'completed', 'normal', 'Front brake pad replacement', 'Worn brake pads, squealing noise', 'Replaced front brake pads, resurfaced rotors', 'Rear brakes 60% remaining', 1.5, 69.99, 127.50, 197.49, 4, '2024-01-18 10:30:00', '2024-01-18 12:00:00'),
(3, 3, 6, 'WO-2024-003', 'completed', 'normal', 'State inspection', 'Annual safety inspection', 'Performed complete safety inspection', 'All systems passed inspection', 0.5, 0.00, 17.50, 17.50, 3, '2024-01-22 14:00:00', '2024-01-22 14:30:00'),
(4, 4, 9, 'WO-2024-004', 'completed', 'normal', 'Synthetic oil change', 'Routine maintenance', 'Synthetic oil and premium filter', 'Excellent vehicle condition', 0.5, 15.49, 27.50, 42.99, 4, '2024-01-25 08:30:00', '2024-01-25 09:00:00'),
(5, 5, 10, 'WO-2024-005', 'completed', 'high', 'Check engine light diagnostic', 'CEL P0420 catalyst efficiency', 'Replaced downstream O2 sensor', 'Monitor for 100 miles', 1.0, 89.99, 95.00, 184.99, 3, '2024-02-01 11:00:00', '2024-02-01 12:00:00'),
(6, 6, 11, 'WO-2024-006', 'completed', 'normal', 'Oil change service', 'Routine maintenance', 'Conventional oil change', 'Consider synthetic next time', 0.5, 8.99, 22.50, 31.49, 4, '2024-02-05 09:30:00', '2024-02-05 10:00:00'),
(7, 7, 12, 'WO-2024-007', 'completed', 'high', 'Classic Corvette tune-up', 'Annual maintenance on classic car', 'Complete tune-up, carb adjustment', 'Excellent condition for age', 2.0, 125.50, 170.00, 295.50, 3, '2024-02-08 13:00:00', '2024-02-08 15:00:00'),
(8, 8, 14, 'WO-2024-008', 'completed', 'normal', 'AC system service', 'AC not cooling properly', 'Recharged AC system, sealed leak', 'System working properly', 1.0, 45.99, 85.00, 130.99, 4, '2024-02-12 10:00:00', '2024-02-12 11:00:00'),
(9, 9, 15, 'WO-2024-009', 'completed', 'normal', 'Engine diagnostic', 'Rough idle complaint', 'Cleaned throttle body, reset ECM', 'Idle now smooth', 1.0, 15.99, 95.00, 110.99, 3, '2024-02-15 15:30:00', '2024-02-15 16:30:00'),
(10, 10, 16, 'WO-2024-010', 'completed', 'normal', 'Oil change service', 'Routine maintenance', 'Oil and filter change', 'Vehicle in great shape', 0.5, 12.99, 22.50, 35.49, 4, '2024-02-19 08:00:00', '2024-02-19 08:30:00'),
(11, 11, 17, 'WO-2024-011', 'completed', 'normal', 'Transmission service', 'Commercial truck maintenance', 'Transmission fluid and filter change', 'Heavy duty service completed', 1.5, 89.99, 142.50, 232.49, 3, '2024-02-22 11:30:00', '2024-02-22 13:00:00'),
(12, 12, 19, 'WO-2024-012', 'completed', 'normal', 'Multi-point inspection', 'New customer welcome service', 'Complete vehicle inspection', 'Minor items noted, discussed', 0.75, 0.00, 41.25, 41.25, 4, '2024-02-26 09:00:00', '2024-02-26 09:45:00'),
(13, 13, 20, 'WO-2024-013', 'completed', 'normal', 'Oil change service', 'Night shift worker service', 'Oil and filter replacement', 'Afternoon service as requested', 0.5, 12.99, 22.50, 35.49, 3, '2024-03-01 14:30:00', '2024-03-01 15:00:00'),
(14, 14, 21, 'WO-2024-014', 'completed', 'normal', 'Tire installation', 'New tire mounting and balancing', 'Mounted 4 new tires, balanced', 'Alignment recommended', 0.75, 15.00, 18.75, 33.75, 4, '2024-03-05 10:30:00', '2024-03-05 11:15:00'),
(15, 15, 22, 'WO-2024-015', 'completed', 'normal', 'Oil change service', 'Retired customer service', 'Thorough inspection included', 'All systems good', 0.5, 12.99, 22.50, 35.49, 3, '2024-03-08 13:30:00', '2024-03-08 14:00:00'),
-- Work orders for upcoming appointments
(16, 16, 23, 'WO-2024-016', 'open', 'normal', 'Synthetic oil change', 'Premium oil service scheduled', '', '', 0, 0, 0, 0, 4, NULL, NULL),
(17, 17, 24, 'WO-2024-017', 'open', 'high', 'Check engine diagnostic', 'CEL diagnostic required', '', '', 0, 0, 0, 0, 3, NULL, NULL),
(18, 18, 25, 'WO-2024-018', 'open', 'normal', 'Brake service', 'Brake inspection and service', '', '', 0, 0, 0, 0, 4, NULL, NULL),
(19, 19, 26, 'WO-2024-019', 'open', 'normal', 'Shock replacement', 'Heavy duty shock replacement', '', '', 0, 0, 0, 0, 3, NULL, NULL),
(20, 20, 27, 'WO-2024-020', 'open', 'normal', 'Eco-friendly oil change', 'Environmentally conscious service', '', '', 0, 0, 0, 0, 4, NULL, NULL);

-- Insert invoices (15+ invoices)
INSERT INTO invoices (client_id, work_order_id, invoice_number, invoice_date, due_date, status, subtotal, tax_rate, tax_amount, total_amount, paid_amount, balance_due, payment_terms, notes) VALUES
(1, 1, 'INV-2024-001', '2024-01-15', '2024-02-14', 'paid', 35.49, 0.0825, 2.93, 38.42, 38.42, 0.00, 30, 'Oil change service'),
(2, 2, 'INV-2024-002', '2024-01-18', '2024-02-17', 'paid', 197.49, 0.0825, 16.29, 213.78, 213.78, 0.00, 30, 'Brake pad replacement'),
(3, 3, 'INV-2024-003', '2024-01-22', '2024-02-21', 'paid', 17.50, 0.0825, 1.44, 18.94, 18.94, 0.00, 30, 'State inspection'),
(4, 4, 'INV-2024-004', '2024-01-25', '2024-02-24', 'paid', 42.99, 0.0825, 3.55, 46.54, 46.54, 0.00, 30, 'Synthetic oil change'),
(5, 5, 'INV-2024-005', '2024-02-01', '2024-03-02', 'paid', 184.99, 0.0825, 15.26, 200.25, 200.25, 0.00, 30, 'Engine diagnostic and repair'),
(6, 6, 'INV-2024-006', '2024-02-05', '2024-03-06', 'paid', 31.49, 0.0825, 2.60, 34.09, 34.09, 0.00, 30, 'Oil change service'),
(7, 7, 'INV-2024-007', '2024-02-08', '2024-03-09', 'paid', 295.50, 0.0825, 24.38, 319.88, 319.88, 0.00, 30, 'Classic car tune-up'),
(8, 8, 'INV-2024-008', '2024-02-12', '2024-03-13', 'paid', 130.99, 0.0825, 10.81, 141.80, 141.80, 0.00, 30, 'AC system service'),
(9, 9, 'INV-2024-009', '2024-02-15', '2024-03-16', 'paid', 110.99, 0.0825, 9.16, 120.15, 120.15, 0.00, 30, 'Engine diagnostic'),
(10, 10, 'INV-2024-010', '2024-02-19', '2024-03-20', 'paid', 35.49, 0.0825, 2.93, 38.42, 38.42, 0.00, 30, 'Oil change service'),
(11, 11, 'INV-2024-011', '2024-02-22', '2024-03-23', 'paid', 232.49, 0.0825, 19.18, 251.67, 251.67, 0.00, 30, 'Transmission service'),
(12, 12, 'INV-2024-012', '2024-02-26', '2024-03-27', 'paid', 41.25, 0.0825, 3.40, 44.65, 44.65, 0.00, 30, 'Multi-point inspection'),
(13, 13, 'INV-2024-013', '2024-03-01', '2024-03-31', 'sent', 35.49, 0.0825, 2.93, 38.42, 0.00, 38.42, 30, 'Oil change service'),
(14, 14, 'INV-2024-014', '2024-03-05', '2024-04-04', 'sent', 33.75, 0.0825, 2.78, 36.53, 0.00, 36.53, 30, 'Tire installation'),
(15, 15, 'INV-2024-015', '2024-03-08', '2024-04-07', 'overdue', 35.49, 0.0825, 2.93, 38.42, 0.00, 38.42, 30, 'Oil change service');

-- Insert payments (12 payments for paid invoices)
INSERT INTO payments (client_id, invoice_id, payment_method, reference_number, amount, payment_date, notes, created_by) VALUES
(1, 1, 'credit_card', 'CC-001-2024', 38.42, '2024-01-15', 'Paid at time of service', 1),
(2, 2, 'check', 'CHK-1001', 213.78, '2024-01-20', 'Check payment', 1),
(3, 3, 'cash', NULL, 18.94, '2024-01-22', 'Cash payment', 1),
(4, 4, 'credit_card', 'CC-002-2024', 46.54, '2024-01-25', 'Visa payment', 1),
(5, 5, 'debit_card', 'DB-001-2024', 200.25, '2024-02-03', 'Debit card payment', 1),
(6, 6, 'cash', NULL, 34.09, '2024-02-05', 'Cash payment with senior discount', 1),
(7, 7, 'check', 'CHK-1002', 319.88, '2024-02-10', 'Classic car service payment', 1),
(8, 8, 'credit_card', 'CC-003-2024', 141.80, '2024-02-12', 'MasterCard payment', 1),
(9, 9, 'debit_card', 'DB-002-2024', 120.15, '2024-02-16', 'Debit payment', 1),
(10, 10, 'cash', NULL, 38.42, '2024-02-19', 'Cash payment', 1),
(11, 11, 'check', 'CHK-1003', 251.67, '2024-02-25', 'Commercial account payment', 1),
(12, 12, 'credit_card', 'CC-004-2024', 44.65, '2024-02-26', 'Welcome service payment', 1);

-- Insert vehicle service history
INSERT INTO vehicle_service_history (vehicle_id, work_order_id, service_date, mileage, service_type, description, parts_used, labor_hours, total_cost, next_service_due, next_service_date, performed_by, notes) VALUES
(1, 1, '2024-01-15', 45000, 'Oil Change', 'Regular oil change service', 'Mobil 1 5W-30, Oil Filter', 0.5, 35.49, 48000, '2024-04-15', 3, 'Customer prefers synthetic oil'),
(3, 2, '2024-01-18', 62000, 'Brake Service', 'Front brake pad replacement', 'Ceramic Brake Pads', 1.5, 197.49, NULL, NULL, 4, 'Rotors resurfaced, rear brakes 60%'),
(6, 3, '2024-01-22', 89000, 'Inspection', 'State safety inspection', 'None', 0.5, 17.50, NULL, '2025-01-22', 3, 'Fleet vehicle, all systems passed'),
(9, 4, '2024-01-25', 42000, 'Oil Change', 'Synthetic oil change', 'Mobil 1 0W-20, Premium Filter', 0.5, 42.99, 45000, '2024-04-25', 4, 'Excellent vehicle condition'),
(10, 5, '2024-02-01', 28000, 'Engine Repair', 'Check engine light diagnostic', 'O2 Sensor', 1.0, 184.99, NULL, NULL, 3, 'P0420 code, downstream O2 sensor replaced'),
(11, 6, '2024-02-05', 95000, 'Oil Change', 'Conventional oil change', 'Conventional 10W-30, Standard Filter', 0.5, 31.49, 98000, '2024-05-05', 4, 'Senior customer, budget service'),
(12, 7, '2024-02-08', 45000, 'Tune-Up', 'Complete engine tune-up', 'Spark Plugs, Air Filter, Fuel Filter', 2.0, 295.50, NULL, '2025-02-08', 3, 'Classic 1969 Corvette, specialty work'),
(14, 8, '2024-02-12', 58000, 'AC Service', 'AC system service and repair', 'Refrigerant, Leak Sealer', 1.0, 130.99, NULL, NULL, 4, 'System recharged, leak sealed'),
(15, 9, '2024-02-15', 67000, 'Engine Service', 'Engine diagnostic and cleaning', 'Throttle Body Cleaner', 1.0, 110.99, NULL, NULL, 3, 'Throttle body cleaned, ECM reset'),
(16, 10, '2024-02-19', 72000, 'Oil Change', 'Regular oil change', 'Conventional Oil, Filter', 0.5, 35.49, 75000, '2024-05-19', 4, 'Senior-friendly service'),
(17, 11, '2024-02-22', 420000, 'Transmission', 'Transmission service', 'ATF, Transmission Filter', 1.5, 232.49, 440000, '2024-08-22', 3, 'Commercial truck, heavy duty service'),
(19, 12, '2024-02-26', 35000, 'Inspection', 'Multi-point inspection', 'None', 0.75, 41.25, NULL, NULL, 4, 'New customer welcome service'),
(20, 13, '2024-03-01', 32000, 'Oil Change', 'Oil change service', 'Conventional Oil, Filter', 0.5, 35.49, 35000, '2024-06-01', 3, 'Night shift worker, afternoon service'),
(21, 14, '2024-03-05', 38000, 'Tire Service', 'New tire installation', 'Mounting, Balancing', 0.75, 33.75, NULL, NULL, 4, '4 new tires installed, alignment recommended'),
(22, 15, '2024-03-08', 125000, 'Oil Change', 'Oil change with inspection', 'Conventional Oil, Filter', 0.5, 35.49, 128000, '2024-06-08', 3, 'Retired customer, thorough service');

-- Insert some inventory movements to show stock changes
INSERT INTO inventory_movements (item_id, movement_type, quantity, unit_cost, reference_type, reference_id, notes, created_by) VALUES
-- Oil usage from work orders
(1, 'out', 5, 6.50, 'work_order', 1, 'Used for oil change WO-2024-001', 1),
(1, 'out', 5, 6.50, 'work_order', 4, 'Used for oil change WO-2024-004', 1),
(1, 'out', 5, 6.50, 'work_order', 7, 'Used for classic car tune-up', 1),
-- Filter usage
(5, 'out', 1, 8.50, 'work_order', 1, 'Oil filter for WO-2024-001', 1),
(5, 'out', 1, 8.50, 'work_order', 4, 'Oil filter for WO-2024-004', 1),
(5, 'out', 1, 8.50, 'work_order', 6, 'Oil filter for WO-2024-006', 1),
-- Brake parts usage
(9, 'out', 1, 45.50, 'work_order', 2, 'Brake pads for WO-2024-002', 1),
-- Inventory adjustments
(1, 'in', 24, 6.50, 'purchase', NULL, 'Restocked Mobil 1 5W-30', 1),
(5, 'in', 20, 8.50, 'purchase', NULL, 'Restocked oil filters', 1),
(9, 'in', 10, 45.50, 'purchase', NULL, 'Restocked brake pads', 1);