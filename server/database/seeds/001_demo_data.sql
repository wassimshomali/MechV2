-- Development seed data for MoMech

INSERT OR IGNORE INTO service_categories (id, name, description, color) VALUES
  (1, 'Maintenance', 'Routine maintenance services', '#3b82f6'),
  (2, 'Brakes', 'Brake system services', '#ef4444'),
  (3, 'Engine', 'Engine diagnostics and repair', '#f59e0b');

INSERT OR IGNORE INTO services (id, category_id, name, description, estimated_duration, labor_rate) VALUES
  (1, 1, 'Oil Change', 'Standard oil and filter change', 30, 85.00),
  (2, 2, 'Brake Service', 'Brake pad replacement and inspection', 90, 95.00),
  (3, 1, 'Tire Rotation', 'Rotate and balance tires', 45, 65.00),
  (4, 1, '30K Service', '30,000 mile scheduled maintenance', 120, 110.00);

INSERT OR IGNORE INTO clients (id, first_name, last_name, email, phone, city, state) VALUES
  (1, 'Michael', 'Johnson', 'michael@email.com', '(555) 123-4567', 'Springfield', 'IL'),
  (2, 'Sarah', 'Williams', 'sarah@email.com', '(555) 234-5678', 'Springfield', 'IL'),
  (3, 'Robert', 'Davis', 'robert@email.com', '(555) 345-6789', 'Decatur', 'IL'),
  (4, 'Jennifer', 'Miller', 'jennifer@email.com', '(555) 456-7890', 'Champaign', 'IL');

INSERT OR IGNORE INTO vehicles (id, client_id, make, model, year, vin, license_plate, mileage) VALUES
  (1, 1, 'Toyota', 'Camry', 2018, '4T1B11HK5JU123456', 'ABC-1234', 62400),
  (2, 2, 'Honda', 'CR-V', 2015, '5J6RM4H70FL789012', 'XYZ-5678', 81200),
  (3, 3, 'Ford', 'F-150', 2017, '1FTEW1EP5HK345678', 'TRK-9012', 94500),
  (4, 4, 'Subaru', 'Outback', 2020, '4S4BSACC0L3456789', 'SUB-3456', 30100);

INSERT OR IGNORE INTO inventory_categories (id, name) VALUES
  (1, 'Filters'),
  (2, 'Brakes'),
  (3, 'Fluids');

INSERT OR IGNORE INTO inventory_items (id, category_id, name, part_number, quantity_on_hand, minimum_quantity, cost_price, selling_price) VALUES
  (1, 1, 'Oil Filter — Toyota', 'TO-1234', 2, 5, 8.50, 14.99),
  (2, 2, 'Brake Pads — Front', 'BP-F456', 1, 4, 45.00, 79.99),
  (3, 3, '5W-30 Synthetic Oil', 'OIL-5W30', 4, 6, 22.00, 39.99),
  (4, 1, 'Air Filter', 'AF-789', 5, 5, 12.00, 24.99),
  (5, 3, 'Brake Fluid DOT 4', 'BF-DOT4', 12, 4, 6.50, 12.99);

INSERT OR IGNORE INTO appointments (id, client_id, vehicle_id, service_id, appointment_date, appointment_time, status, description) VALUES
  (1, 1, 1, 1, date('now'), '09:00', 'scheduled', 'Oil change and inspection'),
  (2, 2, 2, 2, date('now'), '10:30', 'in_progress', 'Front brake pad replacement'),
  (3, 3, 3, 3, date('now'), '14:00', 'scheduled', 'Tire rotation'),
  (4, 4, 4, 4, date('now', '+1 day'), '11:00', 'scheduled', '30K scheduled maintenance'),
  (5, 1, 1, 1, date('now', '+3 days'), '09:30', 'scheduled', 'Follow-up oil change');

INSERT OR IGNORE INTO work_orders (id, client_id, vehicle_id, work_order_number, status, description, total_cost, completed_at) VALUES
  (1, 1, 1, 'WO-2026-001', 'completed', 'Oil change', 85.00, datetime('now', '-2 days')),
  (2, 2, 2, 'WO-2026-002', 'completed', 'Brake service', 320.00, datetime('now', '-5 days')),
  (3, 3, 3, 'WO-2026-003', 'completed', 'Tire rotation', 65.00, datetime('now', '-8 days'));

INSERT OR IGNORE INTO vehicle_service_history (id, vehicle_id, work_order_id, service_date, mileage, service_type, description, total_cost) VALUES
  (1, 1, 1, date('now', '-2 days'), 62000, 'Maintenance', 'Oil Change', 85.00),
  (2, 2, 2, date('now', '-5 days'), 80800, 'Brakes', 'Brake Service', 320.00),
  (3, 3, 3, date('now', '-8 days'), 94000, 'Maintenance', 'Tire Rotation', 65.00),
  (4, 4, NULL, date('now', '-14 days'), 29800, 'Maintenance', '30K Service', 450.00);

INSERT OR IGNORE INTO invoices (id, client_id, work_order_id, invoice_number, invoice_date, due_date, status, subtotal, total_amount, paid_amount, balance_due) VALUES
  (1, 1, 1, 'INV-1042', date('now'), date('now', '+28 days'), 'paid', 85.00, 85.00, 85.00, 0),
  (2, 2, 2, 'INV-1041', date('now', '-1 day'), date('now', '+25 days'), 'sent', 320.00, 320.00, 0, 320.00),
  (3, 3, 3, 'INV-1039', date('now', '-2 days'), date('now', '+22 days'), 'paid', 65.00, 65.00, 65.00, 0);

INSERT OR IGNORE INTO payments (id, client_id, invoice_id, payment_method, amount, payment_date) VALUES
  (1, 1, 1, 'credit_card', 85.00, date('now')),
  (2, 3, 3, 'cash', 65.00, date('now', '-2 days'));
